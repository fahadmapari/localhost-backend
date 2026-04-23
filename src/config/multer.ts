import multer from "multer";

import path from "path";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// const uploadPath = resolve(__dirname, "..", "static/product-images");

const storage = multer.memoryStorage();

export const upload = multer({
  storage: storage,
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

const ITINERARY_ALLOWED_EXT = /\.(pdf|docx?|jpe?g|png|webp)$/i;
const ITINERARY_ALLOWED_MIME = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

export const uploadDocument = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (
      ITINERARY_ALLOWED_EXT.test(file.originalname) &&
      ITINERARY_ALLOWED_MIME.has(file.mimetype)
    ) {
      return cb(null, true);
    }
    cb(new Error("Only PDF, DOC/DOCX, or image files are allowed."));
  },
  limits: {
    fileSize: 1024 * 1024 * 10,
    files: 1,
  },
});
