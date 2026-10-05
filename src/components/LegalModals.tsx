import React from 'react';
import { X, Shield, BookOpen, Crown, FileText, CheckCircle2 } from 'lucide-react';

interface Props {
  activeModal: 'privacy' | 'terms' | 'licenses' | 'premium' | null;
  onClose: () => void;
}

export const LegalModals: React.FC<Props> = ({ activeModal, onClose }) => {
  if (!activeModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#09152b] border border-amber-400/30 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-200 my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            {activeModal === 'privacy' && <Shield className="w-5 h-5 text-amber-400" />}
            {activeModal === 'terms' && <FileText className="w-5 h-5 text-amber-400" />}
            {activeModal === 'licenses' && <BookOpen className="w-5 h-5 text-amber-400" />}
            {activeModal === 'premium' && <Crown className="w-5 h-5 text-amber-400" />}

            <h3 className="font-display text-lg font-bold text-amber-200">
              {activeModal === 'privacy' && 'Política de Privacidade'}
              {activeModal === 'terms' && 'Termos de Uso'}
              {activeModal === 'licenses' && 'Licenças & Direitos Autorais'}
              {activeModal === 'premium' && 'Maná Diário Premium'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto subtle-scroll py-5 text-xs sm:text-sm text-slate-300 space-y-4 leading-relaxed">
          {/* POLÍTICA DE PRIVACIDADE */}
          {activeModal === 'privacy' && (
            <>
              <p className="font-medium text-slate-200">
                Sua privacidade e comunhão espiritual são sagradas para nós. Esta política descreve como o Maná Diário cuida das suas informações.
              </p>

              <div>
                <h4 className="font-semibold text-amber-300 text-sm mb-1">1. Dados Coletados</h4>
                <p>
                  Coletamos apenas dados essenciais para personalizar sua jornada devocional: nome de preferência, horários configurados para lembretes de oração, preferências de voz e progresso espiritual (dias de leitura e versículos favoritados).
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-amber-300 text-sm mb-1">2. Armazenamento e Segurança</h4>
                <p>
                  Seus dados devocionais e preferências são mantidos com criptografia no seu próprio dispositivo e/ou em bancos de dados seguros e isolados. Nunca comercializamos, compartilhamos ou vendemos suas informações espirituais ou hábitos para terceiros ou anunciantes.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-amber-300 text-sm mb-1">3. Notificações e Sons</h4>
                <p>
                  As notificações (manhã, meio-dia e noite) são opcionais e podem ser ativadas ou desativadas a qualquer momento diretamente na aba Perfil. Os sons ambientes e áudios são gerados proceduralmente sem captura de microfone.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-amber-300 text-sm mb-1">4. Exclusão de Conta e Dados</h4>
                <p>
                  Você pode redefinir ou apagar todo o seu histórico devocional com apenas um clique nas configurações do seu perfil, exercendo total controle sobre seus dados.
                </p>
              </div>
            </>
          )}

          {/* TERMOS DE USO */}
          {activeModal === 'terms' && (
            <>
              <p>
                Bem-vindo ao aplicativo Maná Diário ("Alimente sua alma todos os dias"). Ao utilizar nossa plataforma, você concorda com estes termos:
              </p>

              <div>
                <h4 className="font-semibold text-amber-300 text-sm mb-1">1. Finalidade do Aplicativo</h4>
                <p>
                  O Maná Diário tem finalidade devocional, educativa e espiritual cristã. Todo o conteúdo visa edificar a fé, promover a paz e incentivar a prática do amor e da solidariedade bíblica.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-amber-300 text-sm mb-1">2. Propriedade Intelectual</h4>
                <p>
                  Os textos reflexivos, orações originais e artes geradas pelo Maná Diário são protegidos. O usuário possui autorização expressa para compartilhar os cards e versículos livremente em redes sociais e ministérios, mantendo os créditos devidos.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-amber-300 text-sm mb-1">3. Responsabilidade</h4>
                <p>
                  O devocional é uma ferramenta de crescimento espiritual e oração, não substituindo aconselhamento médico, psicológico ou jurídico profissional.
                </p>
              </div>
            </>
          )}

          {/* LICENÇAS E ATRIBUIÇÃO BÍBLICA */}
          {activeModal === 'licenses' && (
            <>
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/30">
                <h4 className="font-semibold text-amber-300 text-sm mb-1.5 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span>Tradução Bíblica Principal: Bíblia Livre (PORBLIVRE)</span>
                </h4>
                <p className="text-xs text-slate-200 leading-relaxed">
                  O texto bíblico utilizado nesta aplicação é proveniente da <strong>Bíblia Livre (PORBLIVRE)</strong>, licenciada sob a licença{' '}
                  <span className="text-amber-300 font-semibold">
                    Creative Commons Atribuição 3.0 Brasil (CC BY 3.0 BR)
                  </span>
                  .
                </p>
                <p className="text-[11px] text-slate-400 mt-2">
                  Atribuição: Bíblia Livre (http://sites.google.com/site/biblialivre/). Não alteramos silenciosamente o texto canônico e mantemos as referências fiéis ao leitor.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-amber-300 text-sm mb-1">Ambientes Sonoros e Áudio</h4>
                <p>
                  Os ambientes sonoros (Piano, Chuva, Natureza, Mar, etc.) são sintetizados através da Web Audio API com frequências harmônicas originais, isentos de royalties e 100% licenciados para uso livre e relaxamento espiritual.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-amber-300 text-sm mb-1">Tipografia e Ícones</h4>
                <p>
                  Fontes Google Fonts (Cinzel, Lora, Plus Jakarta Sans) licenciadas sob Open Font License (OFL). Ícones por Lucide Icons sob licença MIT.
                </p>
              </div>
            </>
          )}

          {/* ARQUITETURA PLANO PREMIUM */}
          {activeModal === 'premium' && (
            <>
              <div className="text-center p-4 rounded-2xl glass-panel-gold border border-amber-400/40">
                <Crown className="w-10 h-10 text-amber-400 mx-auto mb-2" />
                <h4 className="font-display text-base font-bold text-amber-200">
                  Maná Diário Premium
                </h4>
                <p className="text-xs text-amber-100/80 mt-1">
                  Arquitetura preparada para o seu aprofundamento bíblico contínuo
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  'Acesso a toda a biblioteca histórica de devocionais e estudos temáticos',
                  'Narração com vozes orquestradas e sonoplastia sinfônica em alta resolução',
                  'Download offline ilimitado de capítulos e devocionais em áudio',
                  'Planos de leitura bíblica comentados e devocionais temáticos para casais e família',
                  'Experiência 100% limpa e sem interrupções',
                ].map((feat, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 text-center">
                Atualmente, todas as funções essenciais do Maná Diário permanecem disponíveis gratuitamente para a edificação do povo de Deus.
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-colors cursor-pointer"
          >
            Entendido e Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
