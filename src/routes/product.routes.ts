import { Router } from "express";
import { addProduct, getProducts } from "../controllers/product.controller";

const productRouter = Router();

productRouter.get("/", getProducts);

productRouter.post("/", addProduct);

productRouter.put("/:id", addProduct);

productRouter.delete("/:id", addProduct);

export default productRouter;
