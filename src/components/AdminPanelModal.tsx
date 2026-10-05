import React, { useState } from 'react';
import { db } from '../services/db';
import { Devotional, SoundscapeCategory } from '../types';
import {
  X,
  Plus,
  Sparkles,
  Save,
  Clock,
  Archive,
  CheckCircle,
  AlertTriangle,
  Loader2,
  BookOpen,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPanelModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [devotionals, setDevotionals] = useState<Devotional[]>(db.getDevotionals());
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [theme, setTheme] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [verseReference, setVerseReference] = useState('');
  const [verseText, setVerseText] = useState('');
  const [reflection, setReflection] = useState('');
  const [prayer, setPrayer] = useState('');
  const [practicalApplication, setPracticalApplication] = useState('');
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80'
  );
  const [soundscapeCategory, setSoundscapeCategory] = useState<SoundscapeCategory>('Piano');
  const [tagsStr, setTagsStr] = useState('Fé, Esperança, Paz');
  const [status, setStatus] = useState<Devotional['status']>('published');

  // AI Assistant states
  const [aiPromptTheme, setAiPromptTheme] = useState('');
  const [aiPassage, setAiPassage] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuccessMessage, setAiSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleEditDevotional = (d: Devotional) => {
    setEditingId(d.id);
    setTheme(d.theme);
    setDate(d.date);
    setVerseReference(d.verseReference);
    setVerseText(d.verseText);
    setReflection(d.reflection);
    setPrayer(d.prayer);
    setPracticalApplication(d.practicalApplication);
    setImageUrl(d.imageUrl);
    setSoundscapeCategory(d.soundscapeCategory);
    setTagsStr(d.tags.join(', '));
    setStatus(d.status);
  };

  const handleNewDevotional = () => {
    setEditingId(null);
    setTheme('');
    setDate(new Date().toISOString().split('T')[0]);
    setVerseReference('');
    setVerseText('');
    setReflection('');
    setPrayer('');
    setPracticalApplication('');
    setImageUrl('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80');
    setSoundscapeCategory('Piano');
    setTagsStr('Fé, Esperança');
    setStatus('published');
  };

  const handleSaveDevotional = () => {
    if (!theme || !verseReference || !verseText || !reflection) {
      alert('Por favor, preencha o tema, a referência bíblica, o versículo e a reflexão.');
      return;
    }

    const tags = tagsStr.split(',').map(t => t.trim()).filter(Boolean);

    const devData: Devotional = {
      id: editingId || `dev-${Date.now()}`,
      date,
      theme,
      verseReference,
      verseText,
      translation: 'Bíblia Livre',
      reflection,
      prayer,
      practicalApplication,
      imageUrl,
      imageUrls: {
        '9:16': imageUrl,
        '1:1': imageUrl,
        '4:5': imageUrl,
        '16:9': imageUrl,
      },
      audioDurationSeconds: Math.max(120, Math.round(reflection.split(/\s+/).length * 0.45)),
      soundscapeCategory,
      tags,
      status,
      viewsCount: editingId ? undefined : 0,
      likesCount: editingId ? undefined : 0,
    };

    if (editingId) {
      db.updateDevotional(editingId, devData);
    } else {
      db.addDevotional(devData);
    }

    setDevotionals(db.getDevotionals());
    handleNewDevotional();
    setAiSuccessMessage('Devocional salvo com sucesso!');
    setTimeout(() => setAiSuccessMessage(null), 3000);
  };

  const handleCallAIAssistant = async () => {
    if (!aiPromptTheme && !aiPassage) {
      alert('Digite um tema (ex: Paz nas Incertezas) ou passagem de referência (ex: Salmos 23).');
      return;
    }

    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai/generate-devotional', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: aiPromptTheme,
          targetPassage: aiPassage,
        }),
      });

      const data = await res.json();
      if (data.theme) setTheme(data.theme);
      if (data.verseReference) setVerseReference(data.verseReference);
      if (data.verseText) setVerseText(data.verseText);
      if (data.reflection) setReflection(data.reflection);
      if (data.prayer) setPrayer(data.prayer);
      if (data.practicalApplication) setPracticalApplication(data.practicalApplication);
      if (data.tags && Array.isArray(data.tags)) setTagsStr(data.tags.join(', '));

      setAiSuccessMessage('Conteúdo bíblico gerado com sucesso! Revise antes de publicar.');
      setTimeout(() => setAiSuccessMessage(null), 4000);
    } catch (err) {
      console.error('Error generating with AI:', err);
      alert('Erro ao conectar com assistente de IA. Tente novamente.');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#09152b] border border-amber-400/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 my-8 max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
              Área de Redação & Curadoria
            </span>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-amber-200">
              Painel Administrativo do Maná Diário
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Message Banner */}
        {aiSuccessMessage && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{aiSuccessMessage}</span>
          </div>
        )}

        {/* Content split: Editor & List */}
        <div className="flex-1 overflow-y-auto subtle-scroll py-4 space-y-6">
          {/* AI GENERATION ACCORDION */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-900/20 to-blue-900/20 border border-amber-400/30">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300 mb-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>ASSISTENTE DEVOCIONAL BÍBLICO (IA)</span>
            </div>
            <p className="text-[11px] text-slate-300 mb-3">
              Gere rascunhos profundos e fiéis respeitando estritamente o contexto bíblico da Bíblia Livre (PORBLIVRE).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
              <input
                type="text"
                placeholder="Tema desejado (ex: Provisão no Deserto, Paz nas Tribulações)"
                value={aiPromptTheme}
                onChange={e => setAiPromptTheme(e.target.value)}
                className="py-2 px-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500"
              />
              <input
                type="text"
                placeholder="Passagem bíblica de base (ex: Salmos 23:1-3, Filipenses 4:6)"
                value={aiPassage}
                onChange={e => setAiPassage(e.target.value)}
                className="py-2 px-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500"
              />
            </div>

            <button
              onClick={handleCallAIAssistant}
              disabled={isAiLoading}
              className="py-2 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{isAiLoading ? 'Redigindo com Fundamento Bíblico...' : 'Gerar Rascunho com IA'}</span>
            </button>
          </div>

          {/* EDITING FORM */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-200">
                {editingId ? 'Editar Devocional' : 'Novo Devocional'}
              </h3>
              {editingId && (
                <button
                  onClick={handleNewDevotional}
                  className="text-xs text-amber-300 hover:underline cursor-pointer"
                >
                  + Criar Novo em vez de Editar
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Tema / Título Inspirador:
                </label>
                <input
                  type="text"
                  value={theme}
                  onChange={e => setTheme(e.target.value)}
                  placeholder="Ex: A Paz que Guarda os Pensamentos"
                  className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Data de Publicação:
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>
            </div>

            {/* Versículo Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Referência Bíblica:
                </label>
                <input
                  type="text"
                  value={verseReference}
                  onChange={e => setVerseReference(e.target.value)}
                  placeholder="Ex: Filipenses 4:7"
                  className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Texto do Versículo (Bíblia Livre - PORBLIVRE):
                </label>
                <input
                  type="text"
                  value={verseText}
                  onChange={e => setVerseText(e.target.value)}
                  placeholder="Texto bíblico exato e fiel..."
                  className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>
            </div>

            {/* Reflexão Original (300 a 500 palavras) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-medium text-slate-400">
                  Reflexão Devocional Original (300 a 500 palavras):
                </label>
                <span className="text-[10px] text-slate-500">
                  {reflection.split(/\s+/).filter(Boolean).length} palavras
                </span>
              </div>
              <textarea
                rows={7}
                value={reflection}
                onChange={e => setReflection(e.target.value)}
                placeholder="Escreva uma reflexão bíblica, profunda, serena e contextualizada..."
                className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-serif-reading leading-relaxed"
              />
            </div>

            {/* Oração e Aplicação Prática */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Oração "Vamos Orar":
                </label>
                <textarea
                  rows={4}
                  value={prayer}
                  onChange={e => setPrayer(e.target.value)}
                  placeholder="Oração sincera ao Pai..."
                  className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-serif-reading leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Aplicação Prática ("Para Praticar Hoje"):
                </label>
                <textarea
                  rows={4}
                  value={practicalApplication}
                  onChange={e => setPracticalApplication(e.target.value)}
                  placeholder="Ação prática simples para o dia..."
                  className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>
            </div>

            {/* Settings & Categorization */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Som Ambiente Recomendado:
                </label>
                <select
                  value={soundscapeCategory}
                  onChange={e => setSoundscapeCategory(e.target.value as any)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                >
                  {['Piano', 'Chuva', 'Natureza', 'Água', 'Pássaros', 'Mar', 'Floresta', 'Noite', 'Amanhecer'].map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Status de Publicação:
                </label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                >
                  <option value="published">Publicado</option>
                  <option value="scheduled">Agendado</option>
                  <option value="draft">Rascunho</option>
                  <option value="archived">Arquivado</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Tags (separadas por vírgula):
                </label>
                <input
                  type="text"
                  value={tagsStr}
                  onChange={e => setTagsStr(e.target.value)}
                  placeholder="Fé, Esperança, Paz"
                  className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>
            </div>

            {/* Save Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={handleSaveDevotional}
                className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B78A18] text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg hover:brightness-110 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Salvar e Publicar</span>
              </button>
            </div>
          </div>

          {/* EXISTING DEVOTIONALS LIST */}
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Devocionais Cadastrados no Banco ({devotionals.length})
            </h3>
            <div className="space-y-2">
              {devotionals.map(d => (
                <div
                  key={d.id}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-slate-200">{d.theme}</div>
                    <div className="text-[11px] text-slate-400">
                      {d.date} • {d.verseReference} • {d.status}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditDevotional(d)}
                      className="py-1 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 cursor-pointer"
                    >
                      Editar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
