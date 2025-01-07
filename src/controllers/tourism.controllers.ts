import { Request, Response } from "express";
import { Tourism } from "../models/Tourism";
import { sequelize } from "../db";
import { QueryTypes, Op } from "sequelize";
import cloudinary from "../cloudinary_config/cloudinary";

export const getTourisms = async (req: Request, res: Response) => {
  try {
    const { search, page, limit } = req.query;

    const pageNumber = parseInt(page as string, 10) || 1;
    const pageLimit = parseInt(limit as string, 10) || 10;
    const offset = (pageNumber - 1) * pageLimit;

    const tourisms = await Tourism.findAll({
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
          "Tourism"."id",
          COALESCE(AVG("comments"."stars"),0) AS "averageStars"
      FROM
          "tourisms" AS "Tourism"
      LEFT OUTER JOIN
          "comments" AS "comments"
      ON
          "Tourism"."id" = "comments"."tourism_id"
      WHERE
          "Tourism"."isActive" = true
      GROUP BY
          "Tourism"."id";
    `,
      { type: QueryTypes.SELECT }
    );

    if (!tourisms) {
      res.status(404).send("Turismos no encontrados");
      return;
    }

    const ratingsMap = new Map(
      result.map((rating: any) => [rating.id, rating.averageStars])
    );

    const tourismWithImages = tourisms.map((tourism) => {
      const tourismData = tourism.toJSON() as any;

      const imageUrls = tourismData.images.map((image: string) => image);

      const tourismActive = tourism.get();

      const averageStars = ratingsMap.get(tourismActive.id) || null;

      return {
        ...tourismData,
        images: imageUrls,
        averageStars,
      };
    });

    res.status(200).json({
      currentPage: pageNumber,
      totalResults: await Tourism.count({
        where: {
          isActive: true,
          name: {
            [Op.iLike]: `%${search || ""}%`,
          },
        },
      }),
      tourisms: tourismWithImages,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};

export const getTourismsByUserId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    //console.log(id);

    const tourisms = await Tourism.findAll({
      where: {
        user_id: id,
      },
    });

    const tourismsWithImages = tourisms.map((tourism) => {
      const tourismData = tourism.toJSON();

      const imageUrls = tourismData.images.map((image: string) => image);

      return {
        ...tourismData,
        images: imageUrls,
      };
    });

    res.status(200).json(tourismsWithImages);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};

export const getTourismsByCategory = async (req: Request, res: Response) => {
  try {
    const { categories, page, limit } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const pageLimit = parseInt(limit as string, 10);
    const offset = (pageNumber - 1) * pageLimit;

    const categoryArray = Array.isArray(categories)
      ? categories.map((cat) => String(cat))
      : [String(categories)];

    const tourisms = await Tourism.findAll({
      where: {
        isActive: true,
        categories: {
          [Op.overlap]: categoryArray,
        },
      },
      limit: pageLimit,
      offset,
    });

    if (!tourisms.length) {
      res.status(404).json({ message: "Turismo no encontrados" });
      return;
    }

    const tourismIds = tourisms.map((tourism) => tourism.get("id"));

    const result = await sequelize.query(
      `
      SELECT
          "Tourism"."id",
          AVG("comments"."stars") AS "averageStars"
      FROM
          "tourisms" AS "Tourism"
      LEFT OUTER JOIN
          "comments" AS "comments"
      ON
          "Tourism"."id" = "comments"."tourism_id"
      WHERE
          "Tourism"."id" IN (:tourismIds)
      GROUP BY
          "Supermarket"."id";
    `,
      {
        type: QueryTypes.SELECT,
        replacements: { tourismIds },
      }
    );

    const ratingsMap = new Map(
      result.map((rating: any) => [rating.id, rating.averageStars])
    );

    const tourismWithImages = tourisms.map((tourism) => {
      const tourismData = tourism.toJSON() as any;

      const imageUrls = tourismData.images.map((image: string) => image);

      const averageStars = ratingsMap.get(tourism.get("id")) || null;

      return {
        ...tourismData,
        images: imageUrls,
        averageStars,
      };
    });

    res.status(200).json({
      currentPage: pageNumber,
      totalResults: await Tourism.count({
        where: {
          isActive: true,
          categories: {
            [Op.overlap]: categoryArray,
          },
        },
      }),
      tourisms: tourismWithImages,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};

export const createTourism = async (req: Request, res: Response) => {
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
          folder: "tourisms_images",
        });

        images.push(uploadResult.secure_url);
      }
    }

    const tourism = await Tourism.create({
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

    res.status(200).json(tourism);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};

export const updatedTourism = async (req: Request, res: Response) => {
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

    const tourism = await Tourism.findByPk(id);
    if (!tourism) {
      res.status(404).json({ message: "Turismo no encontrados" });
      return;
    }

    const tourismActive = tourism.get();

    const parsedLocation = location
      ? JSON.parse(location)
      : tourismActive.location;
    const parsedOffers = offers ? JSON.parse(offers) : tourismActive.offers;
    const parsedTime = time ? JSON.parse(time) : tourismActive.time;
    const parseCategories = categories
      ? JSON.parse(categories)
      : tourismActive.categories;

    let images: string[] = tourismActive.images;

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

    await tourism.update({
      name: name || tourismActive.name,
      location: parsedLocation,
      offers: parsedOffers,
      codArea: codArea || tourismActive.codArea,
      phone: phone || tourismActive.phone,
      city: city || tourismActive.city,
      country: country || tourismActive.country,
      web: web || tourismActive.web,
      time: parsedTime,
      zone: zone || tourismActive.zone,
      categories: parseCategories,
      user_id: user_id || tourismActive.user_id,
      images,
    });

    res.status(200).send(tourism);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};

export const toggleIsActiveTourism = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const tourism = await Tourism.findByPk(id);
    if (!tourism) {
      res.status(404).json({ message: "Turismo no encontrado" });
      return;
    }

    const tourismActive = tourism.get();

    const toggleActive = await tourism.update({
      isActive: !tourismActive.isActive,
    });

    res.status(200).json(toggleActive);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    }
  }
};

export const deleteTourism = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tourism = await Tourism.findByPk(id);
    if (!tourism) {
      res.status(404).json({ message: "Turismo no encontrados" });
      return;
    }
    await tourism?.destroy();
    res.sendStatus(204);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    }
  }
};
