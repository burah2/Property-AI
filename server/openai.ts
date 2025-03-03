import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "" 
});

// Log warning if API key is not present
if (!process.env.OPENAI_API_KEY) {
  console.warn("WARNING: OPENAI_API_KEY environment variable is not set. Sentiment analysis will not work correctly.");
}

export async function analyzeSentiment(text: string): Promise<{
  rating: number;
  confidence: number;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a sentiment analysis expert. Analyze the severity and urgency of the maintenance request and provide a rating from 1 to 5 (1 being most urgent) and a confidence score between 0 and 1. Respond with JSON in this format: { 'rating': number, 'confidence': number }",
        },
        {
          role: "user",
          content: text,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content);

    return {
      rating: Math.max(1, Math.min(5, Math.round(result.rating))),
      confidence: Math.max(0, Math.min(1, result.confidence)),
    };
  } catch (error) {
    console.error("Failed to analyze sentiment:", error);
    // Default to medium urgency if API fails
    return {
      rating: 3,
      confidence: 0.5,
    };
  }
}

export async function generateMaintenanceRecommendation(
  description: string
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a property maintenance expert. Provide a brief recommendation for handling the maintenance request.",
        },
        {
          role: "user",
          content: description,
        },
      ],
    });

    return response.choices[0].message.content || "No recommendation available.";
  } catch (error) {
    console.error("Failed to generate recommendation:", error);
    return "Unable to generate recommendation at this time.";
  }
}
