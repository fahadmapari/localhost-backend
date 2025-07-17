import multer from "multer";
import path from "path";

export const multerConfig = multer({
  dest: path.resolve(__dirname, ".."),
});
