import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Initialize GoogleGenAI client
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// API endpoint for devotional AI generation (Admin Panel)
app.post("/api/ai/generate-devotional", async (req, res) => {
  const { theme, targetPassage, tone } = req.body;

  if (!theme && !targetPassage) {
    return res.status(400).json({ error: "Informe um tema ou uma passagem bíblica." });
  }

  // If Gemini API is available, generate using gemini-3.8-flash
  if (aiClient) {
    try {
      const prompt = `Você é um experiente teólogo cristão, pastor devocional e escritor bíblico para o aplicativo "Maná Diário - Alimente sua alma todos os dias".
Gere um devocional cristão completo, acolhedor, profundo, bíblico e inspirador.

DIRETRIZES FUNDAMENTAIS:
1. NUNCA invente versículos ou referências bíblicas falsas.
2. Use a tradução "Bíblia Livre" (PORBLIVRE).
3. A reflexão deve ter entre 300 e 500 palavras, ser compreensível, bíblica, profunda, respeitando o contexto bíblico original e com aplicação prática edificante.
4. Responda ESTRITAMENTE em formato JSON com a seguinte estrutura:
{
  "theme": "Título inspirador do tema",
  "verseReference": "Livro Capítulo:Versículo",
  "translation": "Bíblia Livre",
  "verseText": "Texto exato e fiel do versículo",
  "reflection": "Texto original da reflexão profunda de 300 a 500 palavras dividida em parágrafos claros",
  "prayer": "Oração sincera, reverente e comovente (100 a 180 palavras)",
  "practicalApplication": "Ação prática simples e edificante para o dia a dia",
  "imagePrompt": "Prompt fotorealista e cinematográfico em inglês para imagem espiritual/natureza (sem elementos teologicamente inadequados)",
  "tags": ["Fé", "Esperança"]
}

Tema solicitado: ${theme || "Graça e Provisão de Deus"}
Passagem bíblica de referência (se informada): ${targetPassage || "Qualquer passagem canônica adequada"}
Tom devocional: ${tone || "Acolhedor, esperançoso e sereno"}`;

      const response = await aiClient.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });

      const responseText = response.text;
      if (responseText) {
        const parsed = JSON.parse(responseText);
        return res.json(parsed);
      }
    } catch (err: any) {
      console.warn("Gemini generation fallback triggered:", err.message);
    }
  }

  // High quality fallback generator if API key is not present or rate limited
  const fallbackThemes: Record<string, any> = {
    paz: {
      theme: "A Paz que Excede Todo Entendimento",
      verseReference: "Filipenses 4:7",
      translation: "Bíblia Livre",
      verseText: "E a paz de Deus, que ultrapassa todo o entendimento, guardará os vossos corações e os vossos pensamentos em Cristo Jesus.",
      reflection: `Há dias em que as circunstâncias externas parecem querer ditar a velocidade e a tranquilidade do nosso coração. Vivemos cercados por ruídos, cobranças, imprevistos e expectativas que muitas vezes nos sobrecarregam.\n\nContudo, o apóstolo Paulo nos lembra que existe uma paz que não tem origem no que controlamos, mas em Quem nos sustenta: a paz de Deus. Não é apenas a ausência de conflitos, mas a presença ativa do Criador no meio de qualquer tempestade. Essa paz é qualificada como algo que "ultrapassa todo o entendimento" — ou seja, a lógica humana não consegue explicá-la quando estamos firmados em Cristo.\n\nGuardar o coração e a mente significa ter uma sentinela celestial vigiando nossos pensamentos contra a ansiedade e o desespero. Ao entregarmos em oração cada receio que trazemos, Deus substitui o peso pelo Seu consolo eterno. Você não precisa carregar o mundo em seus ombros hoje. Permita que a paz d'Ele seja o seu refúgio e o seu descanso.`,
      prayer: "Pai amado, coloco nas Tuas mãos todas as aflições e inquietações que tentam roubar a minha serenidade hoje. Enche a minha mente com a Tua paz que excede todo entendimento humano. Guarda meu coração de todo temor e ensina-me a descansar na certeza da Tua fidelidade e do Teu amor incondicional. Em nome de Jesus, amém.",
      practicalApplication: "Pare por 3 minutos no meio das suas tarefas hoje, feche os olhos, respire fundo e entregue a Deus a sua maior preocupação em uma oração sussurrada.",
      imagePrompt: "A serene lake at dawn with gentle golden sunlight filtering through misty mountain peaks, photorealistic, cinematic, peaceful Christian spiritual atmosphere, 8k",
      tags: ["Paz", "Confiança em Deus", "Oração"],
    },
    default: {
      theme: theme || "Alimento Diário para o Espírito",
      verseReference: targetPassage || "Salmos 23:1-3",
      translation: "Bíblia Livre",
      verseText: "O SENHOR é o meu pastor; nada me faltará. Em verdes pastos me faz repousar; conduz-me suavemente às águas tranquilas. Refrigera a minha alma.",
      reflection: `Assim como o maná caía no deserto dia após dia para sustentar o povo de Israel, a Palavra de Deus se renova a cada manhã para alimentar a nossa alma. Não vivemos apenas do sustento físico, mas de cada palavra que procede da boca do Senhor.\n\nQuando o salmista declara que nada nos faltará, ele não afirma a ausência de desafios, mas a garantia de que o Pastor supremo conhece exatamente as nossas necessidades mais profundas. Ele nos conduz às águas de descanso e restaura o nosso ânimo quando nos sentimos esgotados.\n\nHoje é um convite para você desacelerar o ritmo acelerado das preocupações e receber o alimento espiritual que restaura a esperança. Confie que o mesmo Deus que sustentou gerações no passado cuida amorosamente do seu presente e prepara com bondade o seu amanhã.`,
      prayer: "Senhor Deus, meu Bom Pastor, agradeço porque o Teu cuidado nunca falha. Alimenta o meu espírito hoje com a Tua verdade. Conduz os meus passos para caminhos de justiça e restaura as minhas forças quando eu vacilar. Que a minha vida seja um reflexo do Teu amor. Amém.",
      practicalApplication: "Envie uma mensagem de ânimo ou compartilhe este versículo com alguém da sua família ou círculo de amizade hoje.",
      imagePrompt: "Lush green rolling hills with morning golden sun rays and a peaceful clear stream flowing gently, photorealistic, serene, peaceful Christian devotional, 8k",
      tags: ["Provisão", "Confiança em Deus", "Esperança"],
    },
  };

  const key = theme?.toLowerCase().includes("paz") ? "paz" : "default";
  return res.json(fallbackThemes[key]);
});

// API endpoint for High-Fidelity AI Speech Generation (Male Voice)
app.post("/api/tts/narrate", async (req, res) => {
  const { text, voiceGender = "male", voiceName = "Charon" } = req.body;

  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Texto para narração é obrigatório." });
  }

  if (aiClient) {
    try {
      // Pick voice: 'Charon', 'Puck', 'Fenrir' (Male), 'Kore' (Female)
      const selectedVoice = voiceGender === "female" ? "Kore" : (voiceName || "Charon");

      const response = await aiClient.models.generateContent({
        model: "gemini-3.8-flash-lite-tts",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: text.slice(0, 1500), // optimal speech chunk size
                speechMetadata: {
                  style: voiceGender === "female"
                    ? "Suave, serena, reflexiva voz feminina em português brasileiro com pausas acolhedoras"
                    : "Profunda, calma, acolhedora, respeitosa e serena voz masculina em português brasileiro com pausas reflexivas de paz",
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: selectedVoice },
            },
          },
        },
      });

      const audioBase64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (audioBase64) {
        return res.json({
          audioBase64,
          mimeType: "audio/wav",
          voiceName: selectedVoice,
        });
      }
    } catch (err: any) {
      console.warn("Gemini TTS endpoint fallback triggered:", err.message);
    }
  }

  // If server-side API key is not configured, reply indicating fallback to client synthesis
  return res.json({
    fallbackToClient: true,
    message: "Using enhanced client-side speech synthesis",
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(port, () => {
    console.log(`Maná Diário dev server running on http://localhost:${port}`);
  });
}

startServer();
