import { Request, Response } from "express";
import { MovieTheater } from "../models/MovieTheater";
import { sequelize } from "../db";
import { QueryTypes, Op } from "sequelize";
import cloudinary from "../cloudinary_config/cloudinary";

export const getMovieTheaters = async (req: Request, res: Response) => {
  try {
    const { search, page, limit } = req.query;

    const pageNumber = parseInt(page as string, 10) || 1;
    const pageLimit = parseInt(limit as string, 10) || 10;
    const offset = (pageNumber - 1) * pageLimit;

    const movieTheaters = await MovieTheater.findAll({
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
          "MovieTheater"."id",
          COALESCE(AVG("comments"."stars"),0) AS "averageStars"
      FROM
          "movieTheaters" AS "MovieTheater"
      LEFT OUTER JOIN
          "comments" AS "comments"
      ON
          "MovieTheater"."id" = "comments"."movieTheater_id"
      WHERE
          "MovieTheater"."isActive" = true
      GROUP BY
          "MovieTheater"."id";
    `,
      { type: QueryTypes.SELECT }
    );

    if (!movieTheaters) {
      res.status(404).send("Cines no encontrados");
      return;
    }

    const ratingsMap = new Map(
      result.map((rating: any) => [rating.id, rating.averageStars])
    );

    const movieTheaterWithImages = movieTheaters.map((movieTheater) => {
      const movieTheaterData = movieTheater.toJSON() as any;

      const imageUrls = movieTheaterData.images.map((image: string) => image);

      const movieTheater1 = movieTheater.get();

      const averageStars = ratingsMap.get(movieTheater1.id) || null;

      return {
        ...movieTheaterData,
        images: imageUrls,
        averageStars,
      };
    });

    res.status(200).json({
      currentPage: pageNumber,
      totalResults: await MovieTheater.count({
        where: {
          isActive: true,
          name: {
            [Op.iLike]: `%${search || ""}%`,
          },
        },
      }),
      movieTheater: movieTheaterWithImages,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};

export const getMovieTheaterByUserId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    //console.log(id);

    const movieTheaters = await MovieTheater.findAll({
      where: {
        user_id: id,
      },
    });

    //console.log(movierTheaters);

    const movieTheaterWithImages = movieTheaters.map((movieTheater) => {
      const movieTheaterData = movieTheater.toJSON();

      const imageUrls = movieTheaterData.images.map((image: string) => image);

      return {
        ...movieTheaterData,
        images: imageUrls,
      };
    });

    res.status(200).json(movieTheaterWithImages);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};

export const createMovieTheater = async (req: Request, res: Response) => {
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
      user_id,
    } = req.body;

    const parsedLocation = JSON.parse(location);
    const parsedOffers = JSON.parse(offers);
    const parseTime = JSON.parse(time);

    let images: string[] = [];

    if (Array.isArray(req.files)) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i] as Express.Multer.File;

        const base64File = file.buffer.toString("base64");
        const dataUri = `data:${file.mimetype};base64,${base64File}`;

        const uploadResult = await cloudinary.uploader.upload(dataUri, {
          folder: "movieTheaters_images",
        });

        images.push(uploadResult.secure_url);
      }
    }

    const movieTheater = await MovieTheater.create({
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
      user_id,
      images,
      isActive: true,
    });

    res.status(200).json(movieTheater);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};

export const updateMovieTheater = async (req: Request, res: Response) => {
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
      user_id,
    } = req.body;

    const movieTheater = await MovieTheater.findByPk(id);
    if (!movieTheater) {
      res.status(404).json({ message: "Cines no encontrados" });
      return;
    }

    const movieTheater1 = movieTheater.get();

    const parsedLocation = location
      ? JSON.parse(location)
      : movieTheater1.location;
    const parsedOffers = offers ? JSON.parse(offers) : movieTheater1.offers;
    const parsedTime = time ? JSON.parse(time) : movieTheater1.time;

    let images: string[] = movieTheater1.images;

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

    await movieTheater.update({
      name: name || movieTheater1.name,
      location: parsedLocation,
      offers: parsedOffers,
      codArea: codArea || movieTheater1.codArea,
      phone: phone || movieTheater1.phone,
      city: city || movieTheater1.city,
      country: country || movieTheater1.country,
      web: web || movieTheater1.web,
      time: parsedTime,
      zone: zone || movieTheater1.zone,
      user_id: user_id || movieTheater1.user_id,
      images,
    });

    res.status(200).send(movieTheater);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};

export const toggleIsActiveMovieTheater = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const movieTheater = await MovieTheater.findByPk(id);
    if (!movieTheater) {
      res.status(404).json({ message: "Cines no encontrados" });
      return;
    }

    const movieTheaterActive = movieTheater.get();

    const toggleActive = await movieTheater.update({
      isActive: !movieTheaterActive.isActive,
    });

    res.status(200).json(toggleActive);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    }
  }
};

export const deleteMovieTheater = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const movieTheater = await MovieTheater.findByPk(id);
    if (!movieTheater) {
      res.status(404).json({ message: "Cines no encontrados" });
      return;
    }
    await movieTheater?.destroy();
    res.sendStatus(204);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    }
  }
};
