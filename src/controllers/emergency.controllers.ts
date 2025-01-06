import { Request, Response } from "express";
import { Emergency } from "../models/Emergency";
import { sequelize } from "../db";
import { QueryTypes, Op } from "sequelize";
import cloudinary from "../cloudinary_config/cloudinary";

export const getEmergencies = async (req: Request, res: Response) => {
  try {
    const { search, page, limit } = req.query;

    const pageNumber = parseInt(page as string, 10) || 1;
    const pageLimit = parseInt(limit as string, 10) || 10;
    const offset = (pageNumber - 1) * pageLimit;

    const emergencies = await Emergency.findAll({
      where: {
        isActive: true,
        name: {
          [Op.iLike]: `%${search || ""}%`,
        },
      },
      limit: pageLimit,
      offset,
    });

    const result = await sequelize.query(
      `
      SELECT
          "Emergency"."id",
          COALESCE(AVG("comments"."stars"),0) AS "averageStars"
      FROM
          "emergencies" AS "Emergency"
      LEFT OUTER JOIN
          "comments" AS "comments"
      ON
          "Emergency"."id" = "comments"."emergency_id"
      WHERE
          "Emergency"."isActive" = true
      GROUP BY
          "Emergency"."id";
    `,
      { type: QueryTypes.SELECT }
    );

    if (!emergencies) {
      res.status(404).send("Emergencias no encontradas");
      return;
    }

    const ratingsMap = new Map(
      result.map((rating: any) => [rating.id, rating.averageStars])
    );

    const emergenciesWithImages = emergencies.map((emergency) => {
      const emergencyData = emergency.toJSON() as any;

      const imageUrls = emergencyData.images.map((image: string) => image);

      const emergencyActive = emergency.get();

      const averageStars = ratingsMap.get(emergencyActive.id) || null;

      return {
        ...emergencyData,
        images: imageUrls,
        averageStars,
      };
    });

    res.status(200).json({
      currentPage: pageNumber,
      totalResults: await Emergency.count({
        where: {
          isActive: true,
          name: {
            [Op.iLike]: `%${search || ""}%`,
          },
        },
      }),
      emergencies: emergenciesWithImages,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};

export const getEmergenciesByUserId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const emergencies = await Emergency.findAll({
      where: {
        user_id: id,
      },
    });

    const emergenciesWithImages = emergencies.map((emergency) => {
      const emergencyData = emergency.toJSON();

      const imageUrls = emergencyData.images.map((image: string) => image);

      return {
        ...emergencyData,
        images: imageUrls,
      };
    });

    res.status(200).json(emergenciesWithImages);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};

export const getEmergenciesByCategory = async (req: Request, res: Response) => {
  try {
    const { categories, page, limit } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const pageLimit = parseInt(limit as string, 10);
    const offset = (pageNumber - 1) * pageLimit;

    const categoryArray = Array.isArray(categories)
      ? categories.map((cat) => String(cat))
      : [String(categories)];

    const emergencies = await Emergency.findAll({
      where: {
        isActive: true,
        categories: {
          [Op.overlap]: categoryArray,
        },
      },
      limit: pageLimit,
      offset,
    });

    if (!emergencies.length) {
      res.status(404).json({ message: "Emergencias no encontradas" });
      return;
    }

    const emergencyIds = emergencies.map((emergency) => emergency.get("id"));

    const result = await sequelize.query(
      `
      SELECT
          "Emergency"."id",
          AVG("comments"."stars") AS "averageStars"
      FROM
          "emergencies" AS "Emergency"
      LEFT OUTER JOIN
          "comments" AS "comments"
      ON
          "Emergency"."id" = "comments"."emergency_id"
      WHERE
          "Emergency"."id" IN (:emergencyIds)
      GROUP BY
          "Emergency"."id";
    `,
      {
        type: QueryTypes.SELECT,
        replacements: { emergencyIds },
      }
    );

    const ratingsMap = new Map(
      result.map((rating: any) => [rating.id, rating.averageStars])
    );

    const emergenciesWithImages = emergencies.map((emergency) => {
      const emergencyData = emergency.toJSON() as any;

      const imageUrls = emergencyData.images.map((image: string) => image);

      const averageStars = ratingsMap.get(emergency.get("id")) || null;

      return {
        ...emergencyData,
        images: imageUrls,
        averageStars,
      };
    });

    res.status(200).json({
      currentPage: pageNumber,
      totalResults: await Emergency.count({
        where: {
          isActive: true,
          categories: {
            [Op.overlap]: categoryArray,
          },
        },
      }),
      emergencies: emergenciesWithImages,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};

export const createEmergency = async (req: Request, res: Response) => {
  try {
    const {
      name,
      location,
      offers,
      codArea,
      phone,
      city,
      country,
      web,
      time,
      zone,
      categories,
      user_id,
    } = req.body;

    const parsedLocation = JSON.parse(location);
    const parsedOffers = JSON.parse(offers);
    const parseTime = JSON.parse(time);
    const parseCategories = JSON.parse(categories);

    let images: string[] = [];

    if (Array.isArray(req.files)) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i] as Express.Multer.File;

        const base64File = file.buffer.toString("base64");
        const dataUri = `data:${file.mimetype};base64,${base64File}`;

        const uploadResult = await cloudinary.uploader.upload(dataUri, {
          folder: "emergencies_images",
        });

        images.push(uploadResult.secure_url);
      }
    }

    const emergency = await Emergency.create({
      name,
      location: parsedLocation,
      offers: parsedOffers,
      codArea,
      phone,
      city,
      country,
      time: parseTime,
      web,
      zone,
      categories: parseCategories,
      user_id,
      images,
      isActive: true,
    });

    res.status(200).json(emergency);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};

export const updatedEmergency = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      location,
      offers,
      codArea,
      phone,
      city,
      country,
      web,
      time,
      zone,
      categories,
      user_id,
    } = req.body;

    const emergency = await Emergency.findByPk(id);
    if (!emergency) {
      res.status(404).json({ message: "Emergencia no encontrado" });
      return;
    }

    const emergencyActive = emergency.get();

    const parsedLocation = location
      ? JSON.parse(location)
      : emergencyActive.location;
    const parsedOffers = offers ? JSON.parse(offers) : emergencyActive.offers;
    const parsedTime = time ? JSON.parse(time) : emergencyActive.time;
    const parseCategories = categories
      ? JSON.parse(categories)
      : emergencyActive.categories;

    let images: string[] = emergencyActive.images;

    if (Array.isArray(req.files)) {
      const imagePromises = req.files.map(
        (file: Express.Multer.File) =>
          new Promise<string>((resolve, reject) => {
            const base64File = file.buffer.toString("base64");
            const dataUri = `data:${file.mimetype};base64,${base64File}`;

            cloudinary.uploader.upload(dataUri, (error, result) => {
              if (error) {
                reject(error);
              } else {
                if (result?.secure_url) {
                  resolve(result?.secure_url);
                } else {
                  reject(new Error("URL de la imagen no disponible"));
                }
              }
            });
          })
      );

      try {
        const newImages = await Promise.all(imagePromises);
        images = [...images, ...newImages];
      } catch (error) {
        console.error("Error uploading images to Cloudinary:", error);
        res.status(500).json({ message: "Error uploading images" });
        return;
      }
    }

    await emergency.update({
      name: name || emergencyActive.name,
      location: parsedLocation,
      offers: parsedOffers,
      codArea: codArea || emergencyActive.codArea,
      phone: phone || emergencyActive.phone,
      city: city || emergencyActive.city,
      country: country || emergencyActive.country,
      web: web || emergencyActive.web,
      time: parsedTime,
      zone: zone || emergencyActive.zone,
      categories: parseCategories,
      user_id: user_id || emergencyActive.user_id,
      images,
    });

    res.status(200).send(emergency);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};

export const toggleIsActiveEmergency = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const emergency = await Emergency.findByPk(id);
    if (!emergency) {
      res.status(404).json({ message: "Emergencia no encontrado" });
      return;
    }

    const emergencyActive = emergency.get();

    const toggleActive = await emergency.update({
      isActive: !emergencyActive.isActive,
    });

    res.status(200).json(toggleActive);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    }
  }
};

export const deleteEmergency = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const emergency = await Emergency.findByPk(id);
    if (!emergency) {
      res.status(404).json({ message: "Emergencia no encontrada" });
      return;
    }
    await emergency?.destroy();
    res.sendStatus(204);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    }
  }
};
