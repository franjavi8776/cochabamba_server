import { Request, Response } from "express";
import { Restaurant } from "../models/Restaurant";
import { sequelize } from "../db";
import { QueryTypes, Op } from "sequelize";
import cloudinary from "../cloudinary_config/cloudinary";

export const getRestaurants = async (req: Request, res: Response) => {
  try {
    const { search, page, limit } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const pageLimit = parseInt(limit as string, 10);
    const offset = (pageNumber - 1) * pageLimit;

    const restaurants = await Restaurant.findAll({
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
          "Restaurant"."id",
          AVG("comments"."stars") AS "averageStars"
      FROM
          "restaurants" AS "Restaurant"
      LEFT OUTER JOIN
          "comments" AS "comments"
      ON
          "Restaurant"."id" = "comments"."restaurant_id"
      WHERE
          "Restaurant"."isActive" = true
      GROUP BY
          "Restaurant"."id";
    `,
      { type: QueryTypes.SELECT }
    );

    if (!restaurants) {
      res.status(404).send("Restaurants not found");
      return;
    }

    const ratingsMap = new Map(
      result.map((rating: any) => [rating.id, rating.averageStars])
    );

    const restaurantsWithImages = restaurants.map((restaurant) => {
      const restaurantData = restaurant.toJSON() as any;

      const imageUrls = restaurantData.images.map((image: string) => image);

      const restaurant1 = restaurant.get();

      const averageStars = ratingsMap.get(restaurant1.id) || null;

      return {
        ...restaurantData,
        images: imageUrls,
        averageStars,
      };
    });

    res.status(200).json({
      currentPage: pageNumber,
      totalResults: await Restaurant.count({
        where: {
          isActive: true,
          name: {
            [Op.iLike]: `%${search || ""}%`,
          },
        },
      }),
      restaurants: restaurantsWithImages,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};

export const getRestaurantsByUserId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    console.log(id);

    const restaurants = await Restaurant.findAll({
      where: {
        user_id: id,
      },
    });

    //console.log(restaurants);

    const restaurantsWithImages = restaurants.map((restaurant) => {
      const restaurantData = restaurant.toJSON();

      const imageUrls = restaurantData.images.map((image: string) => image);

      return {
        ...restaurantData,
        images: imageUrls,
      };
    });

    res.status(200).json(restaurantsWithImages);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};

export const getRestaurantsByCategory = async (req: Request, res: Response) => {
  try {
    const { categories, page, limit } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const pageLimit = parseInt(limit as string, 10);
    const offset = (pageNumber - 1) * pageLimit;

    const categoryArray = Array.isArray(categories)
      ? categories.map((cat) => String(cat))
      : [String(categories)];

    const restaurants = await Restaurant.findAll({
      where: {
        categories: {
          [Op.overlap]: categoryArray,
        },
      },
      limit: pageLimit,
      offset,
    });

    if (!restaurants.length) {
      res.status(404).json({ message: "Restaurants not found" });
      return;
    }

    const restaurantIds = restaurants.map((restaurant) => restaurant.get("id"));

    const result = await sequelize.query(
      `
      SELECT
          "Restaurant"."id",
          AVG("comments"."stars") AS "averageStars"
      FROM
          "restaurants" AS "Restaurant"
      LEFT OUTER JOIN
          "comments" AS "comments"
      ON
          "Restaurant"."id" = "comments"."restaurant_id"
      WHERE
          "Restaurant"."id" IN (:restaurantIds)
      GROUP BY
          "Restaurant"."id";
    `,
      {
        type: QueryTypes.SELECT,
        replacements: { restaurantIds },
      }
    );

    const ratingsMap = new Map(
      result.map((rating: any) => [rating.id, rating.averageStars])
    );

    const restaurantsWithImages = restaurants.map((restaurant) => {
      const restaurantData = restaurant.toJSON() as any;

      const imageUrls = restaurantData.images.map((image: string) => image);

      const averageStars = ratingsMap.get(restaurant.get("id")) || null;

      return {
        ...restaurantData,
        images: imageUrls,
        averageStars,
      };
    });

    res.status(200).json({
      currentPage: pageNumber,
      totalResults: await Restaurant.count({
        where: {
          isActive: true,
          categories: {
            [Op.overlap]: categoryArray,
          },
        },
      }),
      restaurants: restaurantsWithImages,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};

export const createRestaurant = async (req: Request, res: Response) => {
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

    // if (Array.isArray(req.files)) {
    //   images = req.files.map((file: Express.Multer.File) => file.filename);
    // }
    if (Array.isArray(req.files)) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i] as Express.Multer.File;

        // Convertir buffer a base64
        const base64File = file.buffer.toString("base64");
        const dataUri = `data:${file.mimetype};base64,${base64File}`;

        // Subir cada archivo a Cloudinary
        const uploadResult = await cloudinary.uploader.upload(dataUri, {
          folder: "restaurants_images", // Carpeta donde se guardarán las imágenes
        });

        // Agregar la URL segura de la imagen subida a Cloudinary al array de imágenes
        images.push(uploadResult.secure_url);
      }
    }

    const restaurant = await Restaurant.create({
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

    res.status(200).json(restaurant);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};

export const updatedRestaurant = async (req: Request, res: Response) => {
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

    const restaurant = await Restaurant.findByPk(id);
    if (!restaurant) {
      res.status(404).json({ message: "Restaurant not found" });
      return;
    }

    const restaurant1 = restaurant.get();

    const parsedLocation = location
      ? JSON.parse(location)
      : restaurant1.location;
    const parsedOffers = offers ? JSON.parse(offers) : restaurant1.offers;
    const parsedTime = time ? JSON.parse(time) : restaurant1.time;
    const parseCategories = categories
      ? JSON.parse(categories)
      : restaurant1.categories;

    let images: string[] = restaurant1.images;

    // if (Array.isArray(req.files)) {
    //   images = [
    //     ...images,
    //     ...req.files.map((file: Express.Multer.File) => file.filename),
    //   ];
    // } else {
    //   console.warn("No se recibieron archivos o el formato es incorrecto.");
    // }
    if (Array.isArray(req.files)) {
      const imagePromises = req.files.map(
        (file: Express.Multer.File) =>
          new Promise<string>((resolve, reject) => {
            // Convertir buffer a base64
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
        images = [...images, ...newImages]; // Agrega las nuevas imágenes a las existentes
      } catch (error) {
        console.error("Error uploading images to Cloudinary:", error);
        res.status(500).json({ message: "Error uploading images" });
        return;
      }
    }

    //console.log(restaurant);

    await restaurant.update({
      name: name || restaurant1.name,
      location: parsedLocation,
      offers: parsedOffers,
      codArea: codArea || restaurant1.codArea,
      phone: phone || restaurant1.phone,
      city: city || restaurant1.city,
      country: country || restaurant1.country,
      web: web || restaurant1.web,
      time: parsedTime,
      zone: zone || restaurant1.zone,
      categories: parseCategories,
      user_id: user_id || restaurant1.user_id,
      images,
    });

    res.status(200).send(restaurant);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};

export const toggleIsActiveRestaurant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const restaurant = await Restaurant.findByPk(id);
    if (!restaurant) {
      res.status(404).json({ message: "Usuarion no encontrado" });
      return;
    }

    const restaurantActive = restaurant.get();

    const toggleActive = await restaurant.update({
      isActive: !restaurantActive.isActive,
    });

    res.status(200).json(toggleActive);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    }
  }
};

export const deleteRestaurant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const restaurant = await Restaurant.findByPk(id);
    if (!restaurant) {
      res.status(404).json({ message: "restaurant not found" });
      return;
    }
    await restaurant?.destroy();
    res.sendStatus(204);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    }
  }
};
