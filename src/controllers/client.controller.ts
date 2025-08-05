import { clientSchema } from "../schema/client.schema";
import { registerClientService } from "../services/client.service";
import { ExpressController } from "../types/controller.types";
import { sendResponse } from "../utils/controller";

export const createClientController: ExpressController = async (
  req,
  res,
  next
) => {
  try {
    const paredBody = clientSchema.safeParse(req.body);

    if (paredBody.error) {
      return sendResponse(res, "Invalid Fields", false, 400, {
        error: paredBody.error,
      });
    }
    const registeredClient = await registerClientService(paredBody.data);

    sendResponse(
      res,
      "Client registered successfully",
      true,
      200,
      registeredClient
    );
  } catch (error) {
    next(error);
  }
};
