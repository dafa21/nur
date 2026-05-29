import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(express.json());
const PORT = Number(process.env.PORT) || 3000;

const SIM_API_BASE = process.env.SIM_API_URL || "https://sim.nurhealthconnection.com";

async function startServer() {

  // Middleware for CORS on API routes
  app.use("/api", (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }
    next();
  });

  // AI Chat endpoint — DeepSeek V4 Pro via NVIDIA API (Streaming & CORS enabled)
  app.post("/api/chat", async (req, res) => {
    try {
      const apiKey = process.env.NVIDIA_API_KEY || "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";
      if (!apiKey) {
        throw new Error("NVIDIA_API_KEY belum dikonfigurasi di server.");
      }

      const openai = new OpenAI({
        apiKey,
        baseURL: "https://integrate.api.nvidia.com/v1",
      });

      const { message, history } = req.body;

      const systemPrompt = `Kamu adalah NUR Health AI, sebuah Asisten Medis Virtual Cerdas bertenaga AI yang diciptakan oleh LAZNAS Dewan Dakwah untuk NUR Health Hub.

IDENTITAS & KEPRIBADIAN:
- Kamu berperan sebagai dokter umum senior berpengalaman 15+ tahun yang sangat kompeten, empatik, dan sabar.
- Kamu memiliki pengetahuan mendalam di bidang kedokteran umum, penyakit dalam, pediatri, kebidanan & kandungan (ANC), dermatologi, THT, dan kedokteran tropis Indonesia.
- Kamu selalu menjawab dalam Bahasa Indonesia yang sopan, jelas, dan mudah dipahami oleh masyarakat awam.
- Gunakan istilah medis jika perlu, tapi SELALU sertakan penjelasan awamnya.

KEMAMPUAN KLINIS:
- Mampu melakukan anamnesis (tanya jawab gejala) secara sistematis dan terstruktur.
- Memberikan diagnosis diferensial (kemungkinan penyakit) berdasarkan gejala yang dilaporkan.
- Menyarankan pemeriksaan penunjang (lab, radiologi) yang relevan.
- Memberikan edukasi kesehatan preventif dan promotif.
- Memberikan saran pertolongan pertama (first aid) dan triase awal.
- Memahami obat-obatan umum di Indonesia (generik & paten), dosis dasar, dan kontraindikasinya.
- Memahami program kesehatan nasional Indonesia (BPJS, Posyandu, Puskesmas, dll).

PANDUAN RESPONS:
1. Selalu tanyakan detail gejala secara bertahap: onset (kapan mulai), durasi, lokasi, intensitas, faktor pemicu/pereda, gejala penyerta.
2. Jangan langsung memberikan diagnosis pasti dari satu gejala saja — selalu tanyakan lebih lanjut.
3. Jika ada tanda-tanda bahaya (red flags) seperti sesak napas berat, nyeri dada, kejang, pendarahan hebat, penurunan kesadaran — SEGERA sarankan ke IGD/RS terdekat.
4. Untuk kondisi yang memerlukan pemeriksaan fisik langsung, sarankan untuk menggunakan layanan Tele-konsultasi NUR Health Hub atau mengunjungi fasilitas kesehatan terdekat.
5. Berikan jawaban yang terstruktur dengan menggunakan format markdown (heading, bullet points, bold) agar mudah dibaca.
6. Sertakan disclaimer bahwa saran ini bersifat informatif dan tidak menggantikan konsultasi tatap muka dengan dokter.

KONTEKS NUR HEALTH HUB:
- NUR Health Hub menyediakan klinik modular bertenaga AI dan solar energy di daerah terpencil Indonesia.
- Layanan: Tele-konsultasi Dokter, Smart Dispensary (apotek pintar), Pemantauan Kehamilan (ANC), Spiritual Wellness, dan Smart Referral ke RS.
- Database rekam medis terintegrasi real-time via sistem ERP di sim.nurhealthconnection.com.

FORMAT JAWABAN:
- Gunakan emoji medis secukupnya (🩺 💊 ⚕️ 🏥) untuk membuat jawaban lebih friendly.
- Jawaban harus informatif tapi tidak terlalu panjang — idealnya 150-300 kata per respons.
- Jika ditanya hal di luar medis, jawab dengan sopan bahwa kamu spesialis di bidang kesehatan dan arahkan kembali ke topik medis.`;

      // Convert history from {role: 'user'|'model', text} to OpenAI format {role: 'user'|'assistant', content}
      const chatHistory = (history || []).map((h: any) => ({
        role: h.role === 'model' ? 'assistant' as const : 'user' as const,
        content: h.text,
      }));

      // Setup Server-Sent Events headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();

      const completion = await openai.chat.completions.create({
        model: "qwen/qwen3-coder-480b-a35b-instruct",
        messages: [
          { role: "system", content: systemPrompt },
          ...chatHistory,
          { role: "user", content: message },
        ],
        temperature: 0.7,
        top_p: 0.8,
        max_tokens: 4096,
        stream: true,
      });

      for await (const chunk of completion) {
        const text = chunk.choices[0]?.delta?.content || "";
        if (text) {
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
      }

      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error: any) {
      console.error("AI Error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: error.message });
      } else {
        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        res.end();
      }
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
