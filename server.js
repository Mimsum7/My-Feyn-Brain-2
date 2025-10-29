// server.js
console.log("OPENAI_API_KEY loaded:", process.env.OPENAI_API_KEY);
import express from "express";
import multer from "multer";
import fs from "fs";
import cors from "cors";
import FormData from "form-data";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

console.log("🔑 Environment Keys Check:");
console.log("   🧠 OpenAI API Key:", process.env.OPENAI_API_KEY ? "✅ Loaded" : "❌ Missing");
console.log("   ⚡ Groq API Key:", process.env.GROQ_API_KEY ? "✅ Loaded" : "❌ Missing");
console.log("   🔊 ElevenLabs Key:", process.env.VITE_ELEVENLABS_API_KEY ? "✅ Loaded" : "❌ Missing");

const app = express();
const PORT = 5000;
const upload = multer({ dest: "uploads/" });

app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" }));

// OLD WHISPER ENDPOINT - COMMENTED OUT
// To switch back to Whisper, uncomment this endpoint and comment out the /api/groq-transcribe endpoint below
/*
app.post("/api/transcribe", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("🎧 Received file:", req.file.path);

    const formData = new FormData();
    formData.append("file", fs.createReadStream(req.file.path));
    formData.append("model", "whisper-1");

    const whisperResponse = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: formData,
    });

    const data = await whisperResponse.json();
    console.log("🧾 Whisper raw response:", data);

    // Delete temp file after transcription
    fs.unlink(req.file.path, (err) => {
      if (err) console.error("Error deleting temp file:", err);
    });

    if (!whisperResponse.ok) {
      console.error("❌ Whisper API returned an error:", data);
      return res.status(500).json({ error: data });
    }

    res.json({ transcript: data.text });
  } catch (error) {
    console.error("❌ Transcription server error:", error);
    res.status(500).json({ error: "Server failed to transcribe audio" });
  }
});
*/

// NEW GROQ TRANSCRIPTION ENDPOINT
app.post("/api/groq-transcribe", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("🎧 Groq transcription - received file:", req.file.path);
    console.log("📦 File mimetype:", req.file.mimetype);

    // Ensure correct file extension for Groq
    let filePath = req.file.path;
    if (!filePath.endsWith(".webm")) {
      const newPath = `${filePath}.webm`;
      fs.renameSync(filePath, newPath);
      filePath = newPath;
      console.log("🧩 Renamed uploaded file to:", filePath);
    }

    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath), {
      filename: "recording.webm",
      contentType: "audio/webm",
    });
    formData.append("model", "whisper-large-v3");

    console.log("🚀 Sending file to Groq for transcription...");
    const groqResponse = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: formData,
    });

    const data = await groqResponse.json();
    console.log("🧾 Groq transcription raw response:", data);

    // Delete temporary file
    fs.unlink(filePath, (err) => {
      if (err) console.error("Error deleting temp file:", err);
    });

    if (!groqResponse.ok) {
      console.error("❌ Groq API returned an error:", data);
      return res.status(500).json({ error: data });
    }

    // ✅ Return successful transcript
    res.json({ transcript: data.text });
  } catch (error) {
    console.error("❌ Groq transcription server error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));

app.post("/api/evaluate", async (req, res) => {
  try {
    const { originalText, explanation } = req.body;

    if (!originalText || !explanation) {
      return res.status(400).json({ error: "Missing input fields" });
    }

    const model = "gpt-oss-120b"; // Groq OSS model

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content:
              "You are an expert educator evaluating how well a student understands a concept using the Feynman Technique. Return a JSON evaluation only."
          },
          {
            role: "user",
            content: `
Original text:
${originalText}

Student's explanation:
${explanation}

Evaluate the explanation and return a JSON object exactly like this:
{
  "accuracy": 0-100,
  "completeness": 0-100,
  "ownWords": 0-100,
  "logicalFlow": 0-100,
  "overallScore": 0-100,
  "category": "Well Understood" | "Almost There" | "Needs Attention",
  "feedback": "Short feedback about how to improve."
}`
          }
        ],
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    console.log("🧾 Raw evaluation response from Groq:", data);

    const text = data.choices?.[0]?.message?.content || "{}";
    const result = JSON.parse(text);

    res.json(result);
  } catch (err) {
    console.error("❌ Error during Groq evaluation:", err);
    res.status(500).json({ error: "Failed to evaluate session" });
  }
});

app.post("/api/groq-generate-questions", async (req, res) => {
  try {
    const { explanation, metrics } = req.body;

    if (!explanation) {
      return res.status(400).json({ error: "Missing explanation" });
    }

    // 🧠 Choose a free Groq model
    const model = "gpt-oss-120b"; // or "gemma2-9b-it"

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content:
              "You are an engaging tutor using the Feynman technique. Based on the student's explanation, generate 3 thoughtful follow-up questions that directly target their weak points and prompt them to simplify or connect ideas. Return them as a JSON array of strings."
          },
          {
            role: "user",
            content: `
Student's explanation:
${explanation}

Performance metrics:
${JSON.stringify(metrics, null, 2)}

Generate 3 highly personalized follow-up questions.
Return your response strictly as valid JSON, e.g.:
["Question 1", "Question 2", "Question 3"]
`
          }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    console.log("🧠 Groq question generation raw:", data);

    if (!response.ok || !data.choices) {
      throw new Error(data.error?.message || "Groq question generation failed");
    }

    const text = data.choices[0]?.message?.content || "[]";
    const questions = JSON.parse(text);
    res.json({ questions });
  } catch (err) {
    console.error("❌ Error generating Groq questions:", err);
    res.status(500).json({ error: "Failed to generate follow-up questions" });
  }
});