import { clientSchema } from "../schema/client.schema";
import {
  getAllClientsService,
  getClientListService,
  getClientMetricsService,
  registerClientService,
} from "../services/client.service";
import { ExpressController } from "../types/controller.types";
import { sendResponse } from "../utils/controller";

export const getAllClientsController: ExpressController = async (
  req,
  res,
  next
) => {
  try {
    const clients = await getAllClientsService();
    return sendResponse(res, {
      message: "Clients fetched successfully",
      statusCode: 200,
      data: clients,
    });
  } catch (error) {
    next(error);
  }
};

export const getClientMetricsController: ExpressController = async (
  req,
  res,
  next
) => {
  try {
    const metrics = await getClientMetricsService();
    return sendResponse(res, {
      message: "Metrics fetched successfully",
      statusCode: 200,
      data: metrics,
    });
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

    return sendResponse(res, {
      message: "Clients fetched successfully",
      statusCode: 200,
      data: clients,
    });
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
      return sendResponse(res, {
        message: "Invalid Fields",
        statusCode: 400,
        data: {
          error: paredBody.error,
        },
      });
    }
    const registeredClient = await registerClientService(paredBody.data);

    sendResponse(res, {
      message: "Client registered successfully",
      statusCode: 200,
      data: registeredClient,
    });
  } catch (error) {
    next(error);
  }
};
