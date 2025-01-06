import { Request, Response } from "express";
import { Supermarket } from "../models/Supermarket";
import { sequelize } from "../db";
import { QueryTypes, Op } from "sequelize";
import cloudinary from "../cloudinary_config/cloudinary";

export const getSupermarkets = async (req: Request, res: Response) => {
  try {
    const { search, page, limit } = req.query;

    const pageNumber = parseInt(page as string, 10) || 1;
    const pageLimit = parseInt(limit as string, 10) || 10;
    const offset = (pageNumber - 1) * pageLimit;

    const supermarkets = await Supermarket.findAll({
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
          "Supermarket"."id",
          COALESCE(AVG("comments"."stars"),0) AS "averageStars"
      FROM
          "supermarkets" AS "Supermarket"
      LEFT OUTER JOIN
          "comments" AS "comments"
      ON
          "Supermarket"."id" = "comments"."supermarket_id"
      WHERE
          "Supermarket"."isActive" = true
      GROUP BY
          "Supermarket"."id";
    `,
      { type: QueryTypes.SELECT }
    );

    if (!supermarkets) {
      res.status(404).send("Supermercados no encontrados");
      return;
    }

    const ratingsMap = new Map(
      result.map((rating: any) => [rating.id, rating.averageStars])
    );

    const supermarketsWithImages = supermarkets.map((supermarket) => {
      const supermarketData = supermarket.toJSON() as any;

      const imageUrls = supermarketData.images.map((image: string) => image);

      const supermarket1 = supermarket.get();

      const averageStars = ratingsMap.get(supermarket1.id) || null;

      return {
        ...supermarketData,
        images: imageUrls,
        averageStars,
      };
    });

    res.status(200).json({
      currentPage: pageNumber,
      totalResults: await Supermarket.count({
        where: {
          isActive: true,
          name: {
            [Op.iLike]: `%${search || ""}%`,
          },
        },
      }),
      supermarkets: supermarketsWithImages,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};

export const getSupermarketsByUserId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    //console.log(id);

    const supermarkets = await Supermarket.findAll({
      where: {
        user_id: id,
      },
    });

    //console.log(restaurants);

    const supermarketsWithImages = supermarkets.map((supermarket) => {
      const supermarketData = supermarket.toJSON();

      const imageUrls = supermarketData.images.map((image: string) => image);

      return {
        ...supermarketData,
        images: imageUrls,
      };
    });

    res.status(200).json(supermarketsWithImages);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};

export const getSupermarketsByCategory = async (
  req: Request,
  res: Response
) => {
  try {
    const { categories, page, limit } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const pageLimit = parseInt(limit as string, 10);
    const offset = (pageNumber - 1) * pageLimit;

    const categoryArray = Array.isArray(categories)
      ? categories.map((cat) => String(cat))
      : [String(categories)];

    const supermarkets = await Supermarket.findAll({
      where: {
        isActive: true,
        categories: {
          [Op.overlap]: categoryArray,
        },
      },
      limit: pageLimit,
      offset,
    });

    if (!supermarkets.length) {
      res.status(404).json({ message: "Supermercados no encontrados" });
      return;
    }

    const supermarketIds = supermarkets.map((supermarket) =>
      supermarket.get("id")
    );

    const result = await sequelize.query(
      `
      SELECT
          "Supermarket"."id",
          AVG("comments"."stars") AS "averageStars"
      FROM
          "supermarkets" AS "Supermarket"
      LEFT OUTER JOIN
          "comments" AS "comments"
      ON
          "Supermarket"."id" = "comments"."supermarket_id"
      WHERE
          "Supermarket"."id" IN (:supermarketIds)
      GROUP BY
          "Supermarket"."id";
    `,
      {
        type: QueryTypes.SELECT,
        replacements: { supermarketIds },
      }
    );

    const ratingsMap = new Map(
      result.map((rating: any) => [rating.id, rating.averageStars])
    );

    const supermarketsWithImages = supermarkets.map((supermarket) => {
      const supermarketData = supermarket.toJSON() as any;

      const imageUrls = supermarketData.images.map((image: string) => image);

      const averageStars = ratingsMap.get(supermarket.get("id")) || null;

      return {
        ...supermarketData,
        images: imageUrls,
        averageStars,
      };
    });

    res.status(200).json({
      currentPage: pageNumber,
      totalResults: await Supermarket.count({
        where: {
          isActive: true,
          categories: {
            [Op.overlap]: categoryArray,
          },
        },
      }),
      supermarkets: supermarketsWithImages,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};

export const createSupermarket = async (req: Request, res: Response) => {
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
          folder: "supermarkets_images",
        });

        images.push(uploadResult.secure_url);
      }
    }

    const supermarket = await Supermarket.create({
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

    res.status(200).json(supermarket);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};

export const updatedSupermarket = async (req: Request, res: Response) => {
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

    const supermarket = await Supermarket.findByPk(id);
    if (!supermarket) {
      res.status(404).json({ message: "Supermercados no encontrados" });
      return;
    }

    const supermarket1 = supermarket.get();

    const parsedLocation = location
      ? JSON.parse(location)
      : supermarket1.location;
    const parsedOffers = offers ? JSON.parse(offers) : supermarket1.offers;
    const parsedTime = time ? JSON.parse(time) : supermarket1.time;
    const parseCategories = categories
      ? JSON.parse(categories)
      : supermarket1.categories;

    let images: string[] = supermarket1.images;

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

    await supermarket.update({
      name: name || supermarket1.name,
      location: parsedLocation,
      offers: parsedOffers,
      codArea: codArea || supermarket1.codArea,
      phone: phone || supermarket1.phone,
      city: city || supermarket1.city,
      country: country || supermarket1.country,
      web: web || supermarket1.web,
      time: parsedTime,
      zone: zone || supermarket1.zone,
      categories: parseCategories,
      user_id: user_id || supermarket1.user_id,
      images,
    });

    res.status(200).send(supermarket);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};

export const toggleIsActiveSupermarket = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const supermarket = await Supermarket.findByPk(id);
    if (!supermarket) {
      res.status(404).json({ message: "Usuarion no encontrado" });
      return;
    }

    const supermarketActive = supermarket.get();

    const toggleActive = await supermarket.update({
      isActive: !supermarketActive.isActive,
    });

    res.status(200).json(toggleActive);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    }
  }
};

export const deleteSupermarket = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const supermarket = await Supermarket.findByPk(id);
    if (!supermarket) {
      res.status(404).json({ message: "Supermercados no encontrados" });
      return;
    }
    await supermarket?.destroy();
    res.sendStatus(204);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    }
  }
};
