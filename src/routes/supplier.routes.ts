import { Router } from "express";
import {
  createSupplierController,
  deleteSupplierController,
  deleteSupplierCvController,
  deleteSupplierPhotoController,
  getSupplierByIdController,
  getSuppliersController,
  searchSuppliersController,
  updateSupplierController,
  uploadSupplierCvController,
  uploadSupplierPhotoController,
} from "../controllers/supplier.controller";
import {
  authorizationMiddleware,
  isAdminMiddleware,
} from "../middlewares/auth.middleware";
import { upload, uploadDocument } from "../config/multer";

const supplierRouter = Router();

supplierRouter.get(
  "/",
  authorizationMiddleware,
  isAdminMiddleware,
  getSuppliersController
);

supplierRouter.get(
  "/search",
  authorizationMiddleware,
  isAdminMiddleware,
  searchSuppliersController
);

supplierRouter.get(
  "/:id",
  authorizationMiddleware,
  isAdminMiddleware,
  getSupplierByIdController
);

supplierRouter.post(
  "/",
  authorizationMiddleware,
  isAdminMiddleware,
  createSupplierController
);

supplierRouter.patch(
  "/:id",
  authorizationMiddleware,
  isAdminMiddleware,
  updateSupplierController
);

supplierRouter.delete(
  "/:id",
  authorizationMiddleware,
  isAdminMiddleware,
  deleteSupplierController
);

supplierRouter.post(
  "/:id/photo",
  authorizationMiddleware,
  isAdminMiddleware,
  upload.single("photo"),
  uploadSupplierPhotoController
);

supplierRouter.delete(
  "/:id/photo",
  authorizationMiddleware,
  isAdminMiddleware,
  deleteSupplierPhotoController
);

supplierRouter.post(
  "/:id/cv",
  authorizationMiddleware,
  isAdminMiddleware,
  uploadDocument.single("cv"),
  uploadSupplierCvController
);

supplierRouter.delete(
  "/:id/cv",
  authorizationMiddleware,
  isAdminMiddleware,
  deleteSupplierCvController
);

export default supplierRouter;
