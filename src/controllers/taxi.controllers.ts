import { Request, Response } from "express";
import { Taxi } from "../models/Taxi";
import { sequelize } from "../db";
import { QueryTypes, Op } from "sequelize";
import cloudinary from "../cloudinary_config/cloudinary";

export const getTaxis = async (req: Request, res: Response) => {
  try {
    const { search, page, limit } = req.query;

    const pageNumber = parseInt(page as string, 10) || 1;
    const pageLimit = parseInt(limit as string, 10) || 10;
    const offset = (pageNumber - 1) * pageLimit;

    const taxis = await Taxi.findAll({
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
          "Taxi"."id",
          COALESCE(AVG("comments"."stars"),0) AS "averageStars"
      FROM
          "taxis" AS "Taxi"
      LEFT OUTER JOIN
          "comments" AS "comments"
      ON
          "Taxi"."id" = "comments"."taxi_id"
      WHERE
          "Taxi"."isActive" = true
      GROUP BY
          "Taxi"."id";
    `,
      { type: QueryTypes.SELECT }
    );

    if (!taxis) {
      res.status(404).send("Taxis not found");
      return;
    }

    const ratingsMap = new Map(
      result.map((rating: any) => [rating.id, rating.averageStars])
    );

    const taxisWithImages = taxis.map((taxi) => {
      const taxiData = taxi.toJSON() as any;

      const imageUrls = taxiData.images.map((image: string) => image);

      const taxi1 = taxi.get();

      const averageStars = ratingsMap.get(taxi1.id) || null;

      return {
        ...taxiData,
        images: imageUrls,
        averageStars,
      };
    });

    res.status(200).json({
      currentPage: pageNumber,
      totalResults: await Taxi.count({
        where: {
          isActive: true,
          name: {
            [Op.iLike]: `%${search || ""}%`,
          },
        },
      }),
      taxis: taxisWithImages,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};

export const getTaxisByUserId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    //console.log(id);

    const taxis = await Taxi.findAll({
      where: {
        user_id: id,
      },
    });

    //console.log(taxis);

    const taxisWithImages = taxis.map((taxi) => {
      const taxiData = taxi.toJSON();

      const imageUrls = taxiData.images.map((image: string) => image);

      return {
        ...taxiData,
        images: imageUrls,
      };
    });

    res.status(200).json(taxisWithImages);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};

export const getTaxisByCategory = async (req: Request, res: Response) => {
  try {
    const { categories, page, limit } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const pageLimit = parseInt(limit as string, 10);
    const offset = (pageNumber - 1) * pageLimit;

    const categoryArray = Array.isArray(categories)
      ? categories.map((cat) => String(cat))
      : [String(categories)];

    const taxis = await Taxi.findAll({
      where: {
        isActive: true,
        categories: {
          [Op.overlap]: categoryArray,
        },
      },
      limit: pageLimit,
      offset,
    });

    if (!taxis.length) {
      res.status(404).json({ message: "Taxis not found" });
      return;
    }

    const taxiIds = taxis.map((taxi) => taxi.get("id"));

    const result = await sequelize.query(
      `
      SELECT
          "Taxi"."id",
          AVG("comments"."stars") AS "averageStars"
      FROM
          "taxis" AS "Taxi"
      LEFT OUTER JOIN
          "comments" AS "comments"
      ON
          "Taxi"."id" = "comments"."taxi_id"
      WHERE
          "Taxi"."id" IN (:taxiIds)
      GROUP BY
          "Taxi"."id";
    `,
      {
        type: QueryTypes.SELECT,
        replacements: { taxiIds },
      }
    );

    const ratingsMap = new Map(
      result.map((rating: any) => [rating.id, rating.averageStars])
    );

    const taxisWithImages = taxis.map((taxi) => {
      const taxiData = taxi.toJSON() as any;

      const imageUrls = taxiData.images.map((image: string) => image);

      const averageStars = ratingsMap.get(taxi.get("id")) || null;

      return {
        ...taxiData,
        images: imageUrls,
        averageStars,
      };
    });

    res.status(200).json({
      currentPage: pageNumber,
      totalResults: await Taxi.count({
        where: {
          isActive: true,
          categories: {
            [Op.overlap]: categoryArray,
          },
        },
      }),
      taxis: taxisWithImages,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};

export const createTaxi = async (req: Request, res: Response) => {
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
          folder: "taxis_images",
        });

        images.push(uploadResult.secure_url);
      }
    }

    const taxi = await Taxi.create({
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

    res.status(200).json(taxi);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};

export const updatedTaxi = async (req: Request, res: Response) => {
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

    const taxi = await Taxi.findByPk(id);
    if (!taxi) {
      res.status(404).json({ message: "Taxi not found" });
      return;
    }

    const taxi1 = taxi.get();

    const parsedLocation = location ? JSON.parse(location) : taxi1.location;
    const parsedOffers = offers ? JSON.parse(offers) : taxi1.offers;
    const parsedTime = time ? JSON.parse(time) : taxi1.time;
    const parseCategories = categories
      ? JSON.parse(categories)
      : taxi1.categories;

    let images: string[] = taxi1.images;

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

    //console.log(taxi);

    await taxi.update({
      name: name || taxi1.name,
      location: parsedLocation,
      offers: parsedOffers,
      codArea: codArea || taxi1.codArea,
      phone: phone || taxi1.phone,
      city: city || taxi1.city,
      country: country || taxi1.country,
      web: web || taxi1.web,
      time: parsedTime,
      zone: zone || taxi1.zone,
      categories: parseCategories,
      user_id: user_id || taxi1.user_id,
      images,
    });

    res.status(200).send(taxi);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};

export const toggleIsActiveTaxi = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const taxi = await Taxi.findByPk(id);
    if (!taxi) {
      res.status(404).json({ message: "Taxi no encontrado" });
      return;
    }

    const taxiActive = taxi.get();

    const toggleActive = await taxi.update({
      isActive: !taxiActive.isActive,
    });

    res.status(200).json(toggleActive);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    }
  }
};

export const deleteTaxi = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const taxi = await Taxi.findByPk(id);
    if (!taxi) {
      res.status(404).json({ message: "taxi no encontrado" });
      return;
    }
    await taxi?.destroy();
    res.sendStatus(204);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    }
  }
};
