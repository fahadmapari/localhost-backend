import { Router } from "express";
import { addProduct, getProducts } from "../controllers/product.controller";
import { upload } from "../config/multer";

const productRouter = Router();

productRouter.get("/", getProducts);

productRouter.post("/", upload.array("images"), addProduct);

productRouter.put("/:id", addProduct);

productRouter.delete("/:id", addProduct);

export default productRouter;
