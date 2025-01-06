import { Request, Response } from "express";
import { Hotel } from "../models/Hotel";
import { sequelize } from "../db";
import { QueryTypes, Op } from "sequelize";
import cloudinary from "../cloudinary_config/cloudinary";

export const getHotels = async (req: Request, res: Response) => {
  try {
    const { search, page, limit } = req.query;

    const pageNumber = parseInt(page as string, 10) || 1;
    const pageLimit = parseInt(limit as string, 10) || 10;
    const offset = (pageNumber - 1) * pageLimit;

    const hotels = await Hotel.findAll({
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
          "Hotel"."id",
          COALESCE(AVG("comments"."stars"),0) AS "averageStars"
      FROM
          "hotels" AS "Hotel"
      LEFT OUTER JOIN
          "comments" AS "comments"
      ON
          "Hotel"."id" = "comments"."hotel_id"
      WHERE
          "Hotel"."isActive" = true
      GROUP BY
          "Hotel"."id";
    `,
      { type: QueryTypes.SELECT }
    );

    if (!hotels) {
      res.status(404).send("Hoteles no encontrados");
      return;
    }

    const ratingsMap = new Map(
      result.map((rating: any) => [rating.id, rating.averageStars])
    );

    const hotelsWithImages = hotels.map((hotel) => {
      const hotelData = hotel.toJSON() as any;

      const imageUrls = hotelData.images.map((image: string) => image);

      const hotelActive = hotel.get();

      const averageStars = ratingsMap.get(hotelActive.id) || null;

      return {
        ...hotelData,
        images: imageUrls,
        averageStars,
      };
    });

    res.status(200).json({
      currentPage: pageNumber,
      totalResults: await Hotel.count({
        where: {
          isActive: true,
          name: {
            [Op.iLike]: `%${search || ""}%`,
          },
        },
      }),
      hotels: hotelsWithImages,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};

export const getHotelsByUserId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    //console.log(id);

    const hotels = await Hotel.findAll({
      where: {
        user_id: id,
      },
    });

    const hotelsWithImages = hotels.map((hotel) => {
      const hotelData = hotel.toJSON();

      const imageUrls = hotelData.images.map((image: string) => image);

      return {
        ...hotelData,
        images: imageUrls,
      };
    });

    res.status(200).json(hotelsWithImages);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};

export const getHotelsByCategory = async (req: Request, res: Response) => {
  try {
    const { categories, page, limit } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const pageLimit = parseInt(limit as string, 10);
    const offset = (pageNumber - 1) * pageLimit;

    const categoryArray = Array.isArray(categories)
      ? categories.map((cat) => String(cat))
      : [String(categories)];

    const hotels = await Hotel.findAll({
      where: {
        isActive: true,
        categories: {
          [Op.overlap]: categoryArray,
        },
      },
      limit: pageLimit,
      offset,
    });

    if (!hotels.length) {
      res.status(404).json({ message: "Hoteles no encontrados" });
      return;
    }

    const hotelIds = hotels.map((hotel) => hotel.get("id"));

    const result = await sequelize.query(
      `
      SELECT
          "Hotel"."id",
          AVG("comments"."stars") AS "averageStars"
      FROM
          "hotels" AS "Hotel"
      LEFT OUTER JOIN
          "comments" AS "comments"
      ON
          "Hotel"."id" = "comments"."hotel_id"
      WHERE
          "Hotel"."id" IN (:hotelIds)
      GROUP BY
          "Hotel"."id";
    `,
      {
        type: QueryTypes.SELECT,
        replacements: { hotelIds },
      }
    );

    const ratingsMap = new Map(
      result.map((rating: any) => [rating.id, rating.averageStars])
    );

    const hotelsWithImages = hotels.map((hotel) => {
      const hotelData = hotel.toJSON() as any;

      const imageUrls = hotelData.images.map((image: string) => image);

      const averageStars = ratingsMap.get(hotel.get("id")) || null;

      return {
        ...hotelData,
        images: imageUrls,
        averageStars,
      };
    });

    res.status(200).json({
      currentPage: pageNumber,
      totalResults: await Hotel.count({
        where: {
          isActive: true,
          categories: {
            [Op.overlap]: categoryArray,
          },
        },
      }),
      hotels: hotelsWithImages,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};

export const createHotel = async (req: Request, res: Response) => {
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
          folder: "hotels_images",
        });

        images.push(uploadResult.secure_url);
      }
    }

    const hotel = await Hotel.create({
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

    res.status(200).json(hotel);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};

export const updateHotel = async (req: Request, res: Response) => {
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

    const hotel = await Hotel.findByPk(id);
    if (!hotel) {
      res.status(404).json({ message: "Hoteles no encontrados" });
      return;
    }

    const hotelActive = hotel.get();

    const parsedLocation = location
      ? JSON.parse(location)
      : hotelActive.location;
    const parsedOffers = offers ? JSON.parse(offers) : hotelActive.offers;
    const parsedTime = time ? JSON.parse(time) : hotelActive.time;
    const parseCategories = categories
      ? JSON.parse(categories)
      : hotelActive.categories;

    let images: string[] = hotelActive.images;

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

    //console.log(restaurant);

    await hotel.update({
      name: name || hotelActive.name,
      location: parsedLocation,
      offers: parsedOffers,
      codArea: codArea || hotelActive.codArea,
      phone: phone || hotelActive.phone,
      city: city || hotelActive.city,
      country: country || hotelActive.country,
      web: web || hotelActive.web,
      time: parsedTime,
      zone: zone || hotelActive.zone,
      categories: parseCategories,
      user_id: user_id || hotelActive.user_id,
      images,
    });

    res.status(200).send(hotel);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};

export const toggleIsActiveHotel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const hotel = await Hotel.findByPk(id);
    if (!hotel) {
      res.status(404).json({ message: "Hotel no encontrado" });
      return;
    }

    const hotelActive = hotel.get();

    const toggleActive = await hotel.update({
      isActive: !hotelActive.isActive,
    });

    res.status(200).json(toggleActive);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    }
  }
};

export const deleteHotel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const hotel = await Hotel.findByPk(id);
    if (!hotel) {
      res.status(404).json({ message: "Hotel no encontrado" });
      return;
    }
    await hotel?.destroy();
    res.sendStatus(204);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    }
  }
};
