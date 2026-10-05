import React, { useRef, useState, useEffect } from 'react';
import { X, Download, Share2, Copy, Check, Sparkles, Image as ImageIcon } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: {
    verseText: string;
    verseReference: string;
    reflectionSnippet: string;
    themeTitle?: string;
  };
}

export const ShareModal: React.FC<Props> = ({ isOpen, onClose, data }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '1:1' | '16:9'>('9:16');
  const [themeStyle, setThemeStyle] = useState<'celestial' | 'gold' | 'dawn' | 'minimal'>('celestial');
  const [copied, setCopied] = useState(false);
  const [imageGeneratedUrl, setImageGeneratedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      renderCardToCanvas();
    }
  }, [isOpen, aspectRatio, themeStyle, data]);

  if (!isOpen) return null;

  const renderCardToCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dimensions
    let width = 1080;
    let height = 1920;
    if (aspectRatio === '1:1') {
      width = 1080;
      height = 1080;
    } else if (aspectRatio === '16:9') {
      width = 1920;
      height = 1080;
    }

    canvas.width = width;
    canvas.height = height;

    // Draw Background
    if (themeStyle === 'celestial') {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#071228');
      grad.addColorStop(0.5, '#0b1f47');
      grad.addColorStop(1, '#050a17');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Gold stars / glowing aura
      const radial = ctx.createRadialGradient(width / 2, height / 3, 50, width / 2, height / 3, width * 0.6);
      radial.addColorStop(0, 'rgba(212, 175, 55, 0.15)');
      radial.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = radial;
      ctx.fillRect(0, 0, width, height);
    } else if (themeStyle === 'gold') {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#1a1408');
      grad.addColorStop(0.5, '#2e2410');
      grad.addColorStop(1, '#0e0b04');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      const radial = ctx.createRadialGradient(width / 2, height / 2, 40, width / 2, height / 2, width * 0.5);
      radial.addColorStop(0, 'rgba(243, 229, 171, 0.2)');
      radial.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = radial;
      ctx.fillRect(0, 0, width, height);
    } else if (themeStyle === 'dawn') {
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#1a2a4f');
      grad.addColorStop(0.4, '#4a3b5c');
      grad.addColorStop(0.8, '#a8654b');
      grad.addColorStop(1, '#1b1226');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    } else {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);
    }

    // Outer gold border
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.35)';
    ctx.lineWidth = 12;
    ctx.strokeRect(40, 40, width - 80, height - 80);

    // Inner subtle border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    ctx.strokeRect(56, 56, width - 112, height - 112);

    // Header Logo: MANÁ DIÁRIO
    ctx.textAlign = 'center';
    ctx.fillStyle = '#D4AF37';
    ctx.font = 'bold 38px Cinzel, serif';
    ctx.fillText('MANÁ DIÁRIO', width / 2, height * 0.12);

    // Subtitle / Slogan
    ctx.fillStyle = 'rgba(243, 229, 171, 0.85)';
    ctx.font = 'italic 24px Lora, serif';
    ctx.fillText('Alimente sua alma todos os dias.', width / 2, height * 0.155);

    // Decorative divider
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 120, height * 0.185);
    ctx.lineTo(width / 2 + 120, height * 0.185);
    ctx.stroke();

    // Verse Text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'italic 500 42px Lora, serif';
    const verseLines = wrapText(ctx, `"${data.verseText}"`, width - 240);
    const startY = height * 0.32;
    const lineHeight = 64;

    verseLines.forEach((line, index) => {
      ctx.fillText(line, width / 2, startY + index * lineHeight);
    });

    const verseEndY = startY + verseLines.length * lineHeight;

    // Biblical Reference
    ctx.fillStyle = '#F3E5AB';
    ctx.font = 'bold 36px Cinzel, serif';
    ctx.fillText(`${data.verseReference} • Bíblia Livre`, width / 2, verseEndY + 50);

    // Reflection Highlight quote box
    const boxY = verseEndY + 110;
    if (boxY < height * 0.78) {
      ctx.fillStyle = 'rgba(15, 30, 60, 0.6)';
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.25)';
      ctx.lineWidth = 3;
      ctx.roundRect(100, boxY, width - 200, 160, 24);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#E2E8F0';
      ctx.font = '30px "Plus Jakarta Sans", sans-serif';
      const quoteSnippet = data.reflectionSnippet.length > 120
        ? data.reflectionSnippet.substring(0, 117) + '...'
        : data.reflectionSnippet;
      const reflLines = wrapText(ctx, quoteSnippet, width - 280);
      reflLines.slice(0, 3).forEach((line, i) => {
        ctx.fillText(line, width / 2, boxY + 54 + i * 42);
      });
    }

    // Footer Slogan & App info
    ctx.fillStyle = 'rgba(212, 175, 55, 0.7)';
    ctx.font = 'bold 22px Cinzel, serif';
    ctx.fillText('MANADIARIO.APP', width / 2, height - 90);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '18px sans-serif';
    ctx.fillText('Disponível para Web • Android • iOS', width / 2, height - 64);

    try {
      setImageGeneratedUrl(canvas.toDataURL('image/png'));
    } catch {
      // ignore
    }
  };

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + ' ' + word).width;
      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  };

  const handleDownload = () => {
    if (!imageGeneratedUrl) return;
    const a = document.createElement('a');
    a.href = imageGeneratedUrl;
    a.download = `mana-diario-${data.verseReference.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
    a.click();
  };

  const handleShareWhatsApp = () => {
    const message = `✨ *MANÁ DIÁRIO* ✨\n_"Alimente sua alma todos os dias."_\n\n📖 *${data.verseReference} (Bíblia Livre)*\n"${data.verseText}"\n\n💭 _${data.reflectionSnippet}_\n\nLeia o devocional completo no aplicativo Maná Diário!`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleCopyQuote = () => {
    const text = `MANÁ DIÁRIO - Alimente sua alma todos os dias.\n\n"${data.verseText}"\n— ${data.verseReference} (Bíblia Livre)\n\n${data.reflectionSnippet}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#09152b] border border-amber-400/30 rounded-3xl p-6 shadow-2xl text-white my-8 max-h-[92vh] flex flex-col">
        {/* Top header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-400/10 text-amber-300">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-display text-lg font-bold text-amber-200">Compartilhar Palavra</h3>
              <p className="text-xs text-slate-400">Gere e compartilhe um card abençoador</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto subtle-scroll py-4 space-y-4">
          {/* Format selection */}
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-slate-400 font-medium">Formato da Arte:</span>
            <div className="flex gap-1.5">
              {[
                { id: '9:16', label: 'Stories (9:16)' },
                { id: '1:1', label: 'Feed (1:1)' },
                { id: '16:9', label: 'Paisagem (16:9)' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setAspectRatio(f.id as any)}
                  className={`py-1.5 px-3 rounded-lg border transition-all cursor-pointer ${
                    aspectRatio === f.id
                      ? 'bg-amber-400/20 border-amber-400 text-amber-200 font-semibold'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Theme selection */}
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-slate-400 font-medium">Estilo Visual:</span>
            <div className="flex gap-1.5">
              {[
                { id: 'celestial', label: 'Celestial' },
                { id: 'gold', label: 'Dourado' },
                { id: 'dawn', label: 'Amanhecer' },
                { id: 'minimal', label: 'Minimal' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setThemeStyle(t.id as any)}
                  className={`py-1.5 px-2.5 rounded-lg border transition-all cursor-pointer ${
                    themeStyle === t.id
                      ? 'bg-amber-400/20 border-amber-400 text-amber-200 font-semibold'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Canvas Preview */}
          <div className="flex justify-center p-3 rounded-2xl bg-black/40 border border-slate-800/80">
            <canvas
              ref={canvasRef}
              className={`rounded-xl shadow-2xl max-h-72 object-contain border border-amber-400/20 ${
                aspectRatio === '9:16' ? 'aspect-[9/16]' : aspectRatio === '1:1' ? 'aspect-square' : 'aspect-video'
              }`}
            />
          </div>

          {/* Actions grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
            <button
              onClick={handleShareWhatsApp}
              className="py-3 px-3 rounded-xl bg-emerald-700/80 hover:bg-emerald-600 text-white font-medium text-xs flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handleDownload}
              className="py-3 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 font-medium text-xs flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Salvar Imagem</span>
            </button>

            <button
              onClick={handleCopyQuote}
              className="py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="py-3 px-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B78A18] text-slate-950 font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer hover:brightness-110"
            >
              <ImageIcon className="w-4 h-4" />
              <span>Stories/Feed</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
