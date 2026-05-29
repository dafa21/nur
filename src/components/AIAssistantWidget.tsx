import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, X, Send, User, Sparkles } from 'lucide-react';
import Markdown from 'react-markdown';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyCKT2q9-rUictxv3_b7_I3Lxt74YGCUNsM';

const SYSTEM_PROMPT = `Kamu adalah NUR Health AI, sebuah Asisten Medis Virtual Cerdas bertenaga AI yang diciptakan oleh LAZNAS Dewan Dakwah untuk NUR Health Hub.

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
3. Jika ada tanda-tanda bahaya (red flags) seperti sesak napas berat, nyeri dada, kejang, pendarahan hebak, penurunan kesadaran — SEGERA sarankan ke IGD/RS terdekat.
4. Untuk kondisi yang memerlukan pemeriksaan fisik langsung, sarankan untuk menggunakan layanan Tele-konsultasi NUR Health Hub atau mengunjungi fasilitas kesehatan terdekat.
5. Berikan jawaban yang terstruktur dengan menggunakan format markdown (heading, bullet points, bold) agar mudah dibaca.
6. Sertakan disclaimer bahwa saran ini bersifat informatif dan tidak menggantikan konsultasi tatap muka dengan dokter.

KONTEKS NUR HEALTH HUB:
- NUR Health Hub menyediakan klinik modular bertenaga AI dan solar energy di daerah terpencil Indonesia.
- Layanan: Tele-konsultasi Dokter, Smart Dispensary (apotek pintar), Pemantauan Kehamilan (ANC), Spiritual Wellness, dan Smart Referral ke RS.
- NUR Health Hub saat ini beroperasi di beberapa wilayah terpencil Indonesia, termasuk Flores (Kabupaten Manggarai Barat, NTT).
- Database rekam medis terintegrasi real-time via sistem ERP di sim.nurhealthconnection.com.

FORMAT JAWABAN:
- Gunakan emoji medis secukupnya (🩺 💊 ⚕️ 🏥) untuk membuat jawaban lebih friendly.
- Jawaban harus informatif tapi tidak terlalu panjang — idealnya 150-300 kata per respons.
- Jika ditanya hal di luar medis, jawab dengan sopan bahwa kamu spesialis di bidang kesehatan dan arahkan kembali ke topik medis.`;

export function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('nurhealth-chat-history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse chat history', e);
      }
    }
    return [
      { role: 'model', text: 'Halo! Saya NUR Health AI. Ada yang bisa saya bantu terkait kesehatan, gejala medis, atau layanan kami?' }
    ];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    localStorage.setItem('nurhealth-chat-history', JSON.stringify(messages));
  }, [messages]);

  const handleReset = () => {
    if (window.confirm('Hapus seluruh riwayat percakapan?')) {
      const initialMessage: Message[] = [
        { role: 'model', text: 'Halo! Saya NUR Health AI. Ada yang bisa saya bantu terkait kesehatan, gejala medis, atau layanan kami?' }
      ];
      setMessages(initialMessage);
      localStorage.removeItem('nurhealth-chat-history');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      // Build history for Gemini (excluding the first system greeting)
      const historyForGemini = messages
        .filter(m => !(m.role === 'model' && messages.indexOf(m) === 0))
        .map(m => ({
          role: m.role === 'model' ? 'model' : 'user',
          parts: [{ text: m.text }]
        }));

      const requestBody = {
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [
          ...historyForGemini,
          { role: 'user', parts: [{ text: userMessage }] }
        ],
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          maxOutputTokens: 1024,
        }
      };

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        }
      );

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`API error ${res.status}: ${errBody}`);
      }

      // Add empty AI message placeholder for streaming
      setMessages(prev => [...prev, { role: 'model', text: '' }]);
      setIsLoading(false);

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let aiText = '';

      if (reader) {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ') && !line.includes('[DONE]')) {
              try {
                const data = JSON.parse(line.replace('data: ', ''));
                const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                  aiText += text;
                  setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = { role: 'model', text: aiText };
                    return newMessages;
                  });
                }
              } catch {
                // skip incomplete JSON chunks
              }
            }
          }
        }
      }

      // If no text was received at all
      if (!aiText) {
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { role: 'model', text: 'Maaf, tidak ada respons dari AI. Mohon coba lagi.' };
          return newMessages;
        });
      }

    } catch (error: any) {
      console.error('AI Chat Error:', error);
      setMessages(prev => [...prev, { role: 'model', text: 'Maaf, terjadi kesalahan. Mohon coba lagi dalam beberapa saat.' }]);
      setIsLoading(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.5, y: 100 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 left-6 sm:bottom-8 sm:left-8 z-[1000]"
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center w-16 h-16 bg-med-blue text-white rounded-full shadow-2xl hover:bg-blue-700 transition-colors group relative border-4 border-white"
          aria-label="Tanya AI Assistant"
        >
          {/* Tooltip */}
          <span className="absolute left-full ml-4 px-3 py-2 bg-white text-slate-800 text-xs font-bold rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-100 pointer-events-none">
            Tanya AI Dokter
          </span>
          
          {isOpen ? <X size={28} /> : <Bot size={28} />}
          
          {/* Pulse effect when closed */}
          {!isOpen && <span className="absolute inset-0 rounded-full bg-med-blue opacity-20 animate-ping pointer-events-none" />}
        </button>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className="fixed bottom-24 left-4 right-4 sm:bottom-28 sm:left-8 sm:right-auto z-[1000] w-auto sm:w-[400px] bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col h-[500px] max-h-[calc(100vh-120px)] sm:max-h-[calc(100vh-140px)]"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-med-blue to-blue-600 p-4 flex items-center justify-between text-white shadow-md relative z-10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Sparkles size={20} className="text-blue-100" />
                </div>
                <div>
                  <h3 className="font-bold font-display text-lg leading-tight">NUR Health AI</h3>
                  <p className="text-xs text-blue-100 font-medium">Asisten Medis Virtual</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleReset}
                  className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors group relative"
                  title="Reset Percakapan"
                  aria-label="Reset Chat"
                >
                  <motion.div whileHover={{ rotate: 90 }}>
                    <Sparkles size={18} />
                  </motion.div>
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors"
                  aria-label="Tutup Chat"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
              {messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 ${message.role === 'user' ? 'bg-slate-200 ml-2' : 'bg-med-blue mr-2'}`}>
                      {message.role === 'user' ? <User size={16} className="text-slate-600"/> : <Bot size={16} className="text-white"/>}
                    </div>
                    <div 
                      className={`px-4 py-3 rounded-2xl ${
                        message.role === 'user' 
                          ? 'bg-slate-900 text-white rounded-tr-sm' 
                          : 'bg-white text-slate-700 border border-slate-200 shadow-sm rounded-tl-sm'
                      }`}
                    >
                      <div className="text-sm font-light leading-relaxed markdown-body">
                        {message.role === 'model' ? (
                          <Markdown>{message.text}</Markdown>
                        ) : (
                          message.text
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex max-w-[85%] flex-row">
                     <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 bg-med-blue mr-2">
                        <Bot size={16} className="text-white"/>
                      </div>
                      <div className="px-5 py-4 rounded-2xl bg-white border border-slate-200 shadow-sm rounded-tl-sm flex items-center space-x-2">
                        <motion.div 
                          animate={{ scale: [1, 1.2, 1] }} 
                          transition={{ repeat: Infinity, duration: 1 }} 
                          className="w-2 h-2 bg-med-blue rounded-full" 
                        />
                        <motion.div 
                          animate={{ scale: [1, 1.2, 1] }} 
                          transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} 
                          className="w-2 h-2 bg-med-blue rounded-full" 
                        />
                        <motion.div 
                          animate={{ scale: [1, 1.2, 1] }} 
                          transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} 
                          className="w-2 h-2 bg-med-blue rounded-full" 
                        />
                      </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-slate-100">
              <form onSubmit={handleSubmit} className="flex items-end space-x-2 relative">
                <input
                  type="text"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-med-blue focus:border-transparent transition-all shadow-sm text-sm"
                  placeholder="Ketik pertanyaan medis..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-1 top-1 bottom-1 w-10 flex items-center justify-center bg-med-blue text-white rounded-xl shadow-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Send size={18} className={input.trim() && !isLoading ? "ml-1" : ""} />
                </button>
              </form>
              <div className="text-center mt-2">
                 <p className="text-[10px] text-slate-400 font-light">
                   AI dapat memberikan informasi medis umum. Untuk diagnosis pasti, tetap butuh dokter.
                 </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
