import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests allowed" });
  }

  try {
    const { history } = req.body;

    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent",
      {
        contents: history.map((m) => ({
          role: m.role === "user" ? "user" : "model",
          parts: [{ text: m.text }]
        }))
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY
        }
      }
    );

    const output =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response";

    res.status(200).json({ reply: output });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Error calling Gemini API" });
  }
        }
    
