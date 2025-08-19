import { Router } from "express";
import {
  addProduct,
  editProductById,
  getProductById,
  getProductMetrics,
  getProducts,
  searchProductController,
} from "../controllers/product.controller";
import { upload } from "../config/multer";
import {
  authorizationMiddleware,
  isAdminMiddleware,
} from "../middlewares/auth.middleware";

const productRouter = Router();

productRouter.get("/", authorizationMiddleware, isAdminMiddleware, getProducts);

productRouter.post(
  "/",
  authorizationMiddleware,
  isAdminMiddleware,
  upload.array("images"),
  addProduct
);

productRouter.get(
  "/edit/:id",
  authorizationMiddleware,
  isAdminMiddleware,
  getProductById
);

productRouter.put(
  "/edit/:id",
  authorizationMiddleware,
  isAdminMiddleware,
  upload.array("images"),
  editProductById
);

productRouter.delete(
  "/:id",
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
  "/search",
  authorizationMiddleware,
  isAdminMiddleware,
  searchProductController
);

export default productRouter;
