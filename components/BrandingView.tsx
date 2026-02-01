
import React from 'react';
import { Project, PDFTheme } from '../types';
import { ThemeEditor } from './ThemeEditor';
import { Percent, Sliders, AlertTriangle, ShieldCheck, MapPin } from 'lucide-react';

interface BrandingViewProps {
  project: Project;
  onUpdateProject: (data: Partial<Project>) => void;
  isReadOnly?: boolean;
}

export const BrandingView: React.FC<BrandingViewProps> = ({ 
  project, onUpdateProject, isReadOnly 
}) => {
  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-10">
      <header className="max-w-4xl mx-auto flex items-center gap-4">
        <div className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl"><Sliders size={24}/></div>
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Configurações da Obra</h2>
          <p className="text-slate-500 font-medium">Parâmetros financeiros e visuais específicos deste projeto.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* CONFIGURAÇÃO DE LOCALIZAÇÃO */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-lg"><MapPin size={20} /></div>
            <div>
              <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Logística e Localização</h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Endereço de execução do projeto</p>
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <div className="relative">
              <input 
                disabled={isReadOnly}
                type="text" 
                className="w-full px-6 py-5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-black focus:border-indigo-500 outline-none dark:text-slate-100 transition-all disabled:opacity-50" 
                value={project.location} 
                placeholder="Ex: São Paulo - SP / Rua Exemplo, 123"
                onChange={(e) => onUpdateProject({ location: e.target.value })} 
              />
            </div>
            <p className="text-[10px] font-bold text-slate-400 mt-4 text-center uppercase tracking-widest italic">Este local substituirá a data de referência no cabeçalho do PDF.</p>
          </div>
        </div>

        {/* CONFIGURAÇÃO DE BDI */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-emerald-600 rounded-xl text-white shadow-lg"><Percent size={20} /></div>
            <div>
              <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Taxa de BDI</h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Benefícios e Despesas Indiretas</p>
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <div className="relative">
              <input 
                disabled={isReadOnly}
                type="number" 
                step="0.01" 
                className="w-full px-8 py-5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-3xl font-black focus:border-indigo-500 outline-none pr-16 dark:text-slate-100 transition-all disabled:opacity-50" 
                value={project.bdi} 
                onChange={(e) => onUpdateProject({ bdi: parseFloat(e.target.value) || 0 })} 
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xl font-black text-slate-300">%</span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 mt-4 text-center uppercase tracking-widest">Fator Multiplicador Atual: <span className="text-indigo-600">{(1 + project.bdi/100).toFixed(4)}x</span></p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* SENSIBILIDADE DO DIÁRIO */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-amber-500 rounded-xl text-white shadow-lg"><AlertTriangle size={20} /></div>
            <div>
              <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Engine de Diário</h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Gatilhos de Log Automático</p>
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block tracking-widest ml-1">Limite de Alerta Financeiro (R$)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-300">R$</span>
                <input 
                  disabled={isReadOnly}
                  type="number" 
                  className="w-full pl-12 pr-6 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-black focus:border-indigo-500 outline-none transition-all dark:text-white"
                  placeholder="Ex: 5000"
                  defaultValue={5000}
                />
              </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl flex items-start gap-3">
              <ShieldCheck size={16} className="text-indigo-500 shrink-0 mt-0.5" />
              <p className="text-[9px] text-slate-500 font-medium leading-relaxed uppercase tracking-tight">Logs de avanço físico (100%) e faturamento de medições são gerados automaticamente para garantir integridade e rastreabilidade jurídica.</p>
            </div>
          </div>
        </div>
      </div>

      {/* EDITOR DE TEMAS */}
      <ThemeEditor 
        theme={project.theme} 
        onChange={(theme: PDFTheme) => !isReadOnly && onUpdateProject({ theme })} 
      />
    </div>
  );
};
