
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const question = req.body?.question;

  if (!apiKey) {
    return res.status(500).json({ error: "AI key is not configured." });
  }

  if (typeof question !== "string" || !question.trim()) {
    return res.status(400).json({ error: "Please enter a question." });
  }

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: question.trim() }]
          }]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(502).json({
        error: "Gemini could not answer. Please try again."
      });
    }

    const answer =
      data.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "")
        .join("") || "No answer was generated.";

    return res.status(200).json({ answer });

  } catch (error) {
    return res.status(500).json({
      error: "Connection problem. Please try again."
    });
  }
}
