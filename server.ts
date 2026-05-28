import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { GoogleGenAI } from "@google/genai";

const app = express();
app.use(express.json());
const PORT = Number(process.env.PORT) || 3000;

const DEPLOYMENT_LOCATIONS = [];

async function startServer() {
  // API routes
  app.post("/api/chat", async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY belum dikonfigurasi di server.");
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const { message, history } = req.body;
      
      const systemInstruction = `You are NUR Health AI, a medical AI assistant created by LAZNAS Dewan Dakwah for the NUR Health Hub.
You answer user questions about medical conditions, treatments, wellness, and basic triage.
Always be polite, compassionate, and give medically sound advice, but strongly advise users to consult a real physician or use the NUR Health Hub tele-medicine services for serious conditions.
Use the following context if asked about NUR Health:
- We provide modular medical hubs powered by AI and solar energy in remote Indonesian regions.
- Services include Tele-consultations, Smart Dispensary, Spiritual Wellness, and Smart Referrals.
`;

      let response;
      let retries = 3;
      while (retries > 0) {
        try {
          response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
              ...history.map((h: any) => ({ role: h.role, parts: [{ text: h.text }] })),
              { role: "user", parts: [{ text: message }] }
            ],
            config: {
              systemInstruction,
            }
          });
          break; // success
        } catch (error: any) {
          console.error(`AI Attempt failed. Retries left: ${retries - 1}`, error.message);
          retries--;
          if (retries === 0) throw error;
          await new Promise(resolve => setTimeout(resolve, 2000)); // wait 2s before retry
        }
      }

      res.json({ text: response?.text });
    } catch (error: any) {
      console.error("AI Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Gunakan __dirname jika tersedia, atau process.cwd()
    const distPath = path.resolve(process.cwd(), 'dist');
    console.log('Serving static files from:', distPath);
    
    app.use(express.static(distPath));
    
    // Handle SPA routing - pastikan file ada sebelum dikirim
    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error('Error sending index.html:', err);
          res.status(500).send('File index.html tidak ditemukan. Pastikan Anda sudah menjalankan "npm run build".');
        }
      });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
