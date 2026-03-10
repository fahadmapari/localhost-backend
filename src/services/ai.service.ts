import { ai } from "../config/ai";
import { createError } from "../utils/errorHandlers";

export const rewriteText = async (text: string) => {
  try {
    const res = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Rewrite the text and give me the rewritten text in response  : ${text}`,
    });

    if (!res.text) {
      throw createError("Something went wrong", 500);
    }

    return res.text;
  } catch (error) {
    throw error;
  }
};
