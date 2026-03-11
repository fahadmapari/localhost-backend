import { ai } from "../config/ai";
import { createError } from "../utils/errorHandlers";

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
