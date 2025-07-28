import { Router } from "express";
import {
  addProduct,
  editProductById,
  getProductById,
  getProductMetrics,
  getProducts,
} from "../controllers/product.controller";
import { upload } from "../config/multer";
import {
  authorizationMiddleware,
  isAdminMiddleware,
} from "../middlewares/auth.middleware";

const productRouter = Router();

productRouter.get("/", authorizationMiddleware, isAdminMiddleware, getProducts);

productRouter.get(
  "/edit/:id",
  authorizationMiddleware,
  isAdminMiddleware,
  getProductById
);

productRouter.post(
  "/edit/:id",
  authorizationMiddleware,
  isAdminMiddleware,
  editProductById
);

productRouter.get(
  "/metrics",
  authorizationMiddleware,
  isAdminMiddleware,
  getProductMetrics
);

productRouter.post(
  "/",
  authorizationMiddleware,
  isAdminMiddleware,
  upload.array("images"),
  addProduct
);

productRouter.put("/:id", addProduct);

productRouter.delete("/:id", addProduct);

export default productRouter;
