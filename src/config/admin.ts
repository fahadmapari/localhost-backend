import AdminJS from "adminjs";
import AdminJSExpress from "@adminjs/express";
import { Database, Resource } from "@adminjs/mongoose";
import User from "../models/user.model.js";
import Product from "../models/product.model.js";

AdminJS.registerAdapter({ Database, Resource });

const admin = new AdminJS({
  // Pass your Mongoose models here to be managed by AdminJS
  resources: [
    {
      resource: User,
      options: { properties: { password: { isVisible: true } } },
    },
    {
      resource: Product,
    },
  ],
  rootPath: "/admin", // The URL to access the admin panel
  branding: {
    companyName: "Your Company Name",
    withMadeWithLove: false,
  },
});

const adminRouter = AdminJSExpress.buildRouter(admin);

admin.watch();

export { admin, adminRouter };
