import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { User, AppSettings } from '../types';
import {
  User as UserIcon,
  Bell,
  Volume2,
  Shield,
  FileText,
  BookOpen,
  Crown,
  Settings,
  Flame,
  CheckCircle,
  Bookmark,
  Sparkles,
  ExternalLink,
  Lock,
} from 'lucide-react';

interface Props {
  onOpenAdmin: () => void;
  onOpenLegal: (modal: 'privacy' | 'terms' | 'licenses' | 'premium') => void;
}

export const ProfileView: React.FC<Props> = ({ onOpenAdmin, onOpenLegal }) => {
  const [user, setUser] = useState<User>(db.getUser());
  const [settings, setSettings] = useState<AppSettings>(db.getSettings());
  const [progress, setProgress] = useState(db.getProgress());
  const [favoritesCount, setFavoritesCount] = useState(db.getFavorites().length);
  const [notificationTestMessage, setNotificationTestMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setUser(db.getUser());
      setSettings(db.getSettings());
      setProgress(db.getProgress());
      setFavoritesCount(db.getFavorites().length);
    });
    return unsub;
  }, []);

  const handleToggleNotification = (id: 'morning' | 'noon' | 'night') => {
    const updated = settings.notifications.map(n =>
      n.id === id ? { ...n, enabled: !n.enabled } : n
    );
    db.saveSettings({ notifications: updated });

    const target = updated.find(n => n.id === id);
    if (target?.enabled) {
      setNotificationTestMessage(`Lembrete ativado: "${target.message}"`);
      setTimeout(() => setNotificationTestMessage(null), 3500);

      // Try browser notification if supported
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(target.title, { body: target.message });
      } else if ('Notification' in window && Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    }
  };

  const handleToggleVoice = () => {
    const nextVoice = settings.preferredVoice === 'female' ? 'male' : 'female';
    db.saveSettings({ preferredVoice: nextVoice });
    db.saveUser({ voicePreference: nextVoice });
  };

  return (
    <div className="min-h-screen pb-32 pt-4 px-4 sm:px-6 max-w-4xl mx-auto text-slate-100">
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80 mb-6">
        <UserIcon className="w-5 h-5 text-amber-400" />
        <h1 className="font-display text-xl font-bold tracking-wide text-amber-200">
          Meu Perfil & Configurações
        </h1>
      </div>

      {/* User Card */}
      <div className="p-6 rounded-3xl glass-panel-gold border border-amber-400/30 shadow-xl mb-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-display text-3xl font-bold shadow-lg">
          {user.name.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-xl font-bold text-slate-100">{user.name}</h2>
              <p className="text-xs text-amber-300/80">{user.email || 'Modo Visitante'}</p>
            </div>
            <button
              onClick={() => onOpenLegal('premium')}
              className="py-1.5 px-3 rounded-full bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/40 text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer w-fit mx-auto sm:mx-0"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Plano Padrão (Gratuito)</span>
            </button>
          </div>

          {/* Mini Stats inside Profile */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-amber-400/15 text-center">
            <div className="p-2 rounded-xl bg-slate-950/40">
              <div className="text-base font-bold text-amber-300 flex items-center justify-center gap-1">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>{progress.streakDays}</span>
              </div>
              <div className="text-[10px] text-slate-400">Dias Seguidos</div>
            </div>

            <div className="p-2 rounded-xl bg-slate-950/40">
              <div className="text-base font-bold text-emerald-300 flex items-center justify-center gap-1">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>{progress.completedDevotionalsIds.length}</span>
              </div>
              <div className="text-[10px] text-slate-400">Devocionais</div>
            </div>

            <div className="p-2 rounded-xl bg-slate-950/40">
              <div className="text-base font-bold text-sky-300 flex items-center justify-center gap-1">
                <Bookmark className="w-4 h-4 text-sky-400" />
                <span>{favoritesCount}</span>
              </div>
              <div className="text-[10px] text-slate-400">Favoritos</div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Banner Test */}
      {notificationTestMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-500/15 border border-amber-400/40 text-amber-200 text-xs flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{notificationTestMessage}</span>
        </div>
      )}

      {/* NOTIFICAÇÕES (MANHÃ, MEIO-DIA, NOITE) */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl mb-6 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-xs font-bold text-amber-300 uppercase tracking-wider">
          <Bell className="w-4 h-4 text-amber-400" />
          <span>LEMBRETES DE ORAÇÃO & DEVOCIONAL</span>
        </div>

        <div className="space-y-3">
          {settings.notifications.map(n => (
            <div
              key={n.id}
              className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-3"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-200">{n.title}</span>
                  <span className="text-[11px] text-amber-400/80 font-mono">({n.time})</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 italic">"{n.message}"</p>
              </div>

              <button
                onClick={() => handleToggleNotification(n.id)}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  n.enabled ? 'bg-amber-400' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-slate-950 absolute top-0.5 transition-transform ${
                    n.enabled ? 'left-6' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ÁUDIO & VOZ CONFIGURAÇÕES */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl mb-6 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-xs font-bold text-amber-300 uppercase tracking-wider">
          <Volume2 className="w-4 h-4 text-amber-400" />
          <span>PREFERÊNCIAS DE ÁUDIO & VOZES DEVOCIONAIS</span>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs mb-2">
            <div>
              <span className="font-semibold text-slate-200">Vozes Masculinas Disponíveis:</span>
              <p className="text-[11px] text-slate-400">Timbre acolhedor para meditação diária</p>
            </div>
            <span className="text-[10px] text-amber-400 font-semibold bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/30">
              Voz Masculina Padrão
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { id: 'Charon', name: 'Pastor Davi', desc: 'Serena & Profunda' },
              { id: 'Puck', name: 'Pastor Samuel', desc: 'Firme & Inspiradora' },
              { id: 'Fenrir', name: 'Irmão Lucas', desc: 'Nobre & Acolhedora' },
            ].map(v => (
              <button
                key={v.id}
                onClick={() => {
                  db.saveSettings({ preferredVoice: 'male' });
                  db.saveUser({ voicePreference: 'male' });
                }}
                className="p-3 rounded-xl bg-slate-950/70 border border-amber-400/40 text-left cursor-pointer hover:border-amber-300 transition-colors"
              >
                <div className="text-xs font-bold text-amber-200 flex items-center justify-between">
                  <span>{v.name}</span>
                  <span className="text-[9px] text-amber-400">✓ Ativo</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">{v.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-800/60">
          <div>
            <div className="font-semibold text-slate-200">Música e Sons Ambientes</div>
            <div className="text-slate-400">Frequências harmônicas sintetizadas (Piano, Chuva, Mar, Noite)</div>
          </div>
          <span className="text-amber-400 font-semibold">Integrado no Player</span>
        </div>
      </div>

      {/* PRIVACIDADE, TERMOS & LICENÇAS */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl mb-6 space-y-2">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-xs font-bold text-amber-300 uppercase tracking-wider">
          <Shield className="w-4 h-4 text-amber-400" />
          <span>INFORMAÇÕES LEGAIS & LICENÇAS</span>
        </div>

        <button
          onClick={() => onOpenLegal('licenses')}
          className="w-full py-2.5 px-3 rounded-xl hover:bg-slate-800/60 text-left flex items-center justify-between text-xs text-slate-300 cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>Licença Bíblia Livre (PORBLIVRE CC BY 3.0 BR)</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
        </button>

        <button
          onClick={() => onOpenLegal('privacy')}
          className="w-full py-2.5 px-3 rounded-xl hover:bg-slate-800/60 text-left flex items-center justify-between text-xs text-slate-300 cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-amber-400" />
            <span>Política de Privacidade</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
        </button>

        <button
          onClick={() => onOpenLegal('terms')}
          className="w-full py-2.5 px-3 rounded-xl hover:bg-slate-800/60 text-left flex items-center justify-between text-xs text-slate-300 cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Termos de Uso</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
        </button>
      </div>

      {/* PAINEL ADMINISTRATIVO TRIGGER */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-400/20 text-amber-300">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-amber-200">Painel do Administrador</h4>
            <p className="text-[11px] text-slate-400">Criar, editar e agendar devocionais com IA</p>
          </div>
        </div>

        <button
          onClick={onOpenAdmin}
          className="py-2 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
        >
          Abrir Painel
        </button>
      </div>
    </div>
  );
};
