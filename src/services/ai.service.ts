import { ProductDocument } from "./../models/product.model";
import { ai } from "../config/ai";
import { pc } from "../config/pinecone";
import {
  ProductVariant,
  ProductVariantDocument,
} from "../models/product.model";
import { createError } from "../utils/errorHandlers";
import mongoose from "mongoose";

export const rewriteText = async (text: string) => {
  try {
    const res = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Rewrite this tour description and give me the rewritten text only in response (No multiple options, No other text): "${text}"`,
    });

    if (!res.text) {
      throw createError("Something went wrong", 500);
    }

    return res.text;
  } catch (error) {
    throw error;
  }
};

export const productQueryService = async (query: string) => {
  try {
    const emebeddedQuery = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: query,
      config: {
        outputDimensionality: 768,
      },
    });

    if (typeof emebeddedQuery.embeddings === "undefined") {
      console.log(emebeddedQuery.embeddings);
      throw createError(
        "Something went wrong while working with the user query.",
        500,
      );
    }

    const index = pc.index({
      name: "tours",
    });

    const results = await index.query({
      vector: emebeddedQuery.embeddings[0].values || [],
      topK: 10,
      includeMetadata: true,
    });

    const baseProductIds = results.matches
      .map((match) => match.id)
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    const products = await ProductVariant.aggregate([
      {
        $match: {
          baseProduct: {
            $in: baseProductIds,
          },
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $group: {
          _id: "$baseProduct",
          product: {
            $first: "$$ROOT",
          },
        },
      },
      {
        $replaceRoot: {
          newRoot: "$product",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "baseProduct",
          foreignField: "_id",
          as: "baseProduct",
        },
      },
      {
        $unwind: "$baseProduct",
      },
    ]);

    const contextData = products
      .map(
        (product) =>
          `Tour title: ${product.baseProduct.title}\n Description: ${product.description}\n Instant Languages: ${product.baseProduct.tourGuideLanguageInstant?.join(", ")}\n On Request Languages: ${product.baseProduct.tourGuideLanguageOnRequest} \nDuration: ${product.availability.duration.value + product.availability.duration.unit}\n Meeting point: ${product.meetingPoint.text}\n b2b price instant: ${product.b2bRateInstant}\n b2c price instant: ${product.b2cRateInstant}\n b2b price on request: ${product.b2bRateOnRequest}\n b2c price on request: ${product.b2cRateOnRequest}\n`,
      )
      .join("\n---\n");

    const res = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
      You are a helpful assistant of our company which sells different types of tours in b2b and b2c segment. Use the following data which we fetched from the database which we thing is related to user's query. Data is list of tours we provide. Analyze the user query and data and give answer in a precise way. if you can't answer the question, just say "I don't know".

      <CONTEXT_DATA>
        ${contextData}
      </CONTEXT_DATA>


      Users query: ${query}
      `,
    });
    return res.text;
  } catch (error) {
    throw error;
  }
};
