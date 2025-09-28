
import { GoogleGenAI, Type } from "@google/genai";
import type { ScannedTicketData } from '../types';

// IMPORTANT: This API key is managed externally and assumed to be available in the environment.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    // In a real app, you might want to show a more user-friendly error
    // but for this environment, we assume the key is always present.
    console.error("API_KEY environment variable not set!");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        lotteryType: {
            type: Type.STRING,
            description: "彩票类型，必须是 '双色球' 或 '超级大乐透'",
            enum: ["双色球", "超级大乐透"],
        },
        issueNumber: {
            type: Type.STRING,
            description: "彩票的期号, 例如 '2024088'",
        },
        numbers: {
            type: Type.ARRAY,
            description: "彩票上所有投注号码的列表",
            items: {
                type: Type.OBJECT,
                properties: {
                    front_area: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "前区号码 (双色球的红球, 大乐透的前区)，必须是两位数的字符串, 例如 ['01', '02', '13']",
                    },
                    back_area: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "后区号码 (双色球的蓝球, 大乐透的后区)，必须是两位数的字符串, 例如 ['05']",
                    },
                },
                required: ["front_area", "back_area"],
            },
        },
    },
    required: ["lotteryType", "issueNumber", "numbers"],
};


export const scanLotteryTicket = async (base64Image: string, mimeType: string): Promise<ScannedTicketData | null> => {
    try {
        const imagePart = {
            inlineData: {
                data: base64Image,
                mimeType: mimeType,
            },
        };

        const textPart = {
            text: "Analyze this image of a Chinese lottery ticket. Identify the lottery type (双色球 or 超级大乐透), the issue number (期数), and all sets of lottery numbers. Format all numbers as two-digit strings (e.g., '07'). Return the data strictly according to the provided JSON schema.",
        };

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });
        
        const jsonText = response.text.trim();
        const parsedData = JSON.parse(jsonText);

        // Basic validation
        if (parsedData && parsedData.lotteryType && parsedData.issueNumber && Array.isArray(parsedData.numbers)) {
            return parsedData as ScannedTicketData;
        }

        return null;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return null;
    }
};
