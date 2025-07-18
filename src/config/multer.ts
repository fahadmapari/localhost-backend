import { randomUUID } from "crypto";
import multer from "multer";

import path, { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const uploadPath = resolve(__dirname, "..", "static/product-images");

const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath); // Ensure this folder exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = "product-" + randomUUID() + Date.now();
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

export const upload = multer({
  storage: diskStorage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("Only jpeg, jpg, png, and webp images are allowed."));
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 5,
    files: 5,
  },
});
