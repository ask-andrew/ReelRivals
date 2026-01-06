
import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini API client with the API key from environment variables.
// Use process.env.API_KEY directly as required by the guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Gets a witty comment about a nominee's chances of winning.
 */
export const getAwardsInsight = async (categoryName: string, nomineeName: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a witty Hollywood awards pundit. Give a very short (1 sentence) insight or witty comment about ${nomineeName} potentially winning ${categoryName} at the 2026 Golden Globes. Be engaging and slightly snarky.`,
      config: {
        // Set both maxOutputTokens and thinkingConfig.thinkingBudget together as recommended.
        maxOutputTokens: 50,
        thinkingConfig: { thinkingBudget: 25 },
      }
    });
    return response.text || "The stars are aligned, or maybe just the lighting.";
  } catch (error) {
    return "The stars are aligned, or maybe just the lighting.";
  }
};

/**
 * Generates a lighthearted trash talk message between users.
 */
export const getTrashTalk = async (winnerName: string, loserName: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a funny, lighthearted 1-sentence trash talk message from ${winnerName} to ${loserName} because ${winnerName} is currently leading in an Awards Ceremony prediction game.`,
      config: {
        // Set both maxOutputTokens and thinkingConfig.thinkingBudget together as recommended.
        maxOutputTokens: 50,
        thinkingConfig: { thinkingBudget: 25 },
      }
    });
    return response.text || `Looking good from the top, ${loserName}!`;
  } catch (error) {
    return `Looking good from the top, ${loserName}!`;
  }
};
