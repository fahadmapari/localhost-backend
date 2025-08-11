import { clientSchema } from "../schema/client.schema";
import {
  getClientListService,
  getClientMetricsService,
  registerClientService,
} from "../services/client.service";
import { ExpressController } from "../types/controller.types";
import { sendResponse } from "../utils/controller";

export const getClientMetricsController: ExpressController = async (
  req,
  res,
  next
) => {
  try {
    const metrics = await getClientMetricsService();
    return sendResponse(
      res,
      "Metrics fetched successfully",
      true,
      200,
      metrics
    );
  } catch (error) {
    next(error);
  }
};

export const getClientListController: ExpressController = async (
  req,
  res,
  next
) => {
  try {
    let { page = 0, limit = 10 as number } = req.query;

    if (Number(limit) < 100) {
      limit = 10;
    }

    const clients = await getClientListService(page as number, limit as number);

    return sendResponse(
      res,
      "Clients fetched successfully",
      true,
      200,
      clients
    );
  } catch (error) {
    next(error);
  }
};

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
