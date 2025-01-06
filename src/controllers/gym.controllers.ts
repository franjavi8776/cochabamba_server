import { Request, Response } from "express";
import { Gym } from "../models/Gym";
import { sequelize } from "../db";
import { QueryTypes, Op } from "sequelize";
import cloudinary from "../cloudinary_config/cloudinary";

export const getGyms = async (req: Request, res: Response) => {
  try {
    const { search, page, limit } = req.query;

    const pageNumber = parseInt(page as string, 10) || 1;
    const pageLimit = parseInt(limit as string, 10) || 10;
    const offset = (pageNumber - 1) * pageLimit;

    const gyms = await Gym.findAll({
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
          "Gym"."id",
          COALESCE(AVG("comments"."stars"),0) AS "averageStars"
      FROM
          "gyms" AS "Gym"
      LEFT OUTER JOIN
          "comments" AS "comments"
      ON
          "Gym"."id" = "comments"."gym_id"
      WHERE
          "Gym"."isActive" = true
      GROUP BY
          "Gym"."id";
    `,
      { type: QueryTypes.SELECT }
    );

    if (!gyms) {
      res.status(404).send("Deportes no encontrados");
      return;
    }

    const ratingsMap = new Map(
      result.map((rating: any) => [rating.id, rating.averageStars])
    );

    const gymsWithImages = gyms.map((gym) => {
      const gymData = gym.toJSON() as any;

      const imageUrls = gymData.images.map((image: string) => image);

      const gymActive = gym.get();

      const averageStars = ratingsMap.get(gymActive.id) || null;

      return {
        ...gymData,
        images: imageUrls,
        averageStars,
      };
    });

    res.status(200).json({
      currentPage: pageNumber,
      totalResults: await Gym.count({
        where: {
          isActive: true,
          name: {
            [Op.iLike]: `%${search || ""}%`,
          },
        },
      }),
      gyms: gymsWithImages,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};

export const getGymsByUserId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    //console.log(id);

    const gyms = await Gym.findAll({
      where: {
        user_id: id,
      },
    });

    const gymsWithImages = gyms.map((gym) => {
      const gymData = gym.toJSON();

      const imageUrls = gymData.images.map((image: string) => image);

      return {
        ...gymData,
        images: imageUrls,
      };
    });

    res.status(200).json(gymsWithImages);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};

export const getGymsByCategory = async (req: Request, res: Response) => {
  try {
    const { categories, page, limit } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const pageLimit = parseInt(limit as string, 10);
    const offset = (pageNumber - 1) * pageLimit;

    const categoryArray = Array.isArray(categories)
      ? categories.map((cat) => String(cat))
      : [String(categories)];

    const gyms = await Gym.findAll({
      where: {
        isActive: true,
        categories: {
          [Op.overlap]: categoryArray,
        },
      },
      limit: pageLimit,
      offset,
    });

    if (!gyms.length) {
      res.status(404).json({ message: "Deportes no encontrados" });
      return;
    }

    const gymIds = gyms.map((gym) => gym.get("id"));

    const result = await sequelize.query(
      `
      SELECT
          "Gym"."id",
          AVG("comments"."stars") AS "averageStars"
      FROM
          "gyms" AS "Gym"
      LEFT OUTER JOIN
          "comments" AS "comments"
      ON
          "Gym"."id" = "comments"."gym_id"
      WHERE
          "Gym"."id" IN (:gymIds)
      GROUP BY
          "Gym"."id";
    `,
      {
        type: QueryTypes.SELECT,
        replacements: { gymIds },
      }
    );

    const ratingsMap = new Map(
      result.map((rating: any) => [rating.id, rating.averageStars])
    );

    const gymsWithImages = gyms.map((gym) => {
      const gymData = gym.toJSON() as any;

      const imageUrls = gymData.images.map((image: string) => image);

      const averageStars = ratingsMap.get(gym.get("id")) || null;

      return {
        ...gymData,
        images: imageUrls,
        averageStars,
      };
    });

    res.status(200).json({
      currentPage: pageNumber,
      totalResults: await Gym.count({
        where: {
          isActive: true,
          categories: {
            [Op.overlap]: categoryArray,
          },
        },
      }),
      gyms: gymsWithImages,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};

export const createGym = async (req: Request, res: Response) => {
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
          folder: "gyms_images",
        });

        images.push(uploadResult.secure_url);
      }
    }

    const gym = await Gym.create({
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

    res.status(200).json(gym);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};

export const updateGym = async (req: Request, res: Response) => {
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

    const gym = await Gym.findByPk(id);
    if (!gym) {
      res.status(404).json({ message: "Deportes no encontrados" });
      return;
    }

    const gymActive = gym.get();

    const parsedLocation = location ? JSON.parse(location) : gymActive.location;
    const parsedOffers = offers ? JSON.parse(offers) : gymActive.offers;
    const parsedTime = time ? JSON.parse(time) : gymActive.time;
    const parseCategories = categories
      ? JSON.parse(categories)
      : gymActive.categories;

    let images: string[] = gymActive.images;

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

    await gym.update({
      name: name || gymActive.name,
      location: parsedLocation,
      offers: parsedOffers,
      codArea: codArea || gymActive.codArea,
      phone: phone || gymActive.phone,
      city: city || gymActive.city,
      country: country || gymActive.country,
      web: web || gymActive.web,
      time: parsedTime,
      zone: zone || gymActive.zone,
      categories: parseCategories,
      user_id: user_id || gymActive.user_id,
      images,
    });

    res.status(200).send(gym);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};

export const toggleIsActiveGym = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const gym = await Gym.findByPk(id);
    if (!gym) {
      res.status(404).json({ message: "Deportes no encontrados" });
      return;
    }

    const gymActive = gym.get();

    const toggleActive = await gym.update({
      isActive: !gymActive.isActive,
    });

    res.status(200).json(toggleActive);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    }
  }
};

export const deleteGym = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const gym = await Gym.findByPk(id);
    if (!gym) {
      res.status(404).json({ message: "Deportes no encontrados" });
      return;
    }
    await gym?.destroy();
    res.sendStatus(204);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    }
  }
};
