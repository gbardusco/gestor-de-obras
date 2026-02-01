import React from 'react';
import { PDFTheme } from '../types';
import { Palette, Table, Layout, Type as FontIcon, Check } from 'lucide-react';

interface ThemeEditorProps {
  theme: PDFTheme;
  onChange: (theme: PDFTheme) => void;
}

export const ThemeEditor: React.FC<ThemeEditorProps> = ({ theme, onChange }) => {
  const handleChange = (key: string, value: any) => {
    if (key.includes('.')) {
      const [parent, child] = key.split('.');
      onChange({
        ...theme,
        [parent]: {
          ...(theme as any)[parent],
          [child]: value
        }
      });
    } else {
      onChange({ ...theme, [key]: value });
    }
  };

  const fonts: PDFTheme['fontFamily'][] = ['Inter', 'Roboto', 'JetBrains Mono', 'Merriweather'];

  return (
    <div className="space-y-12 max-w-6xl mx-auto px-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* CONTROLES */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl space-y-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-500/20">
                <Palette size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Cores & Estilo</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Identidade do Relatório PDF</p>
              </div>
            </div>

            {/* SELEÇÃO DE FONTES */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                <FontIcon size={12} /> Família de Fontes
              </label>
              <div className="grid grid-cols-2 gap-2">
                {fonts.map(f => (
                  <button 
                    key={f}
                    onClick={() => handleChange('fontFamily', f)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${theme.fontFamily === f ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' : 'border-slate-100 dark:border-slate-800 text-slate-500'}`}
                    style={{ fontFamily: f }}
                  >
                    <span className="text-xs font-bold">{f}</span>
                    {theme.fontFamily === f && <Check size={14} />}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  <Layout size={12} /> Base & Bordas
                </label>
                <ColorInput label="Cor Primária" value={theme.primary} onChange={(v) => handleChange('primary', v)} />
                <ColorInput label="Destaque Medição" value={theme.accent} onChange={(v) => handleChange('accent', v)} />
                <ColorInput label="Texto Destaque" value={theme.accentText} onChange={(v) => handleChange('accentText', v)} />
                <ColorInput label="Cor das Bordas" value={theme.border} onChange={(v) => handleChange('border', v)} />
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  <Table size={12} /> Tabelas & Boxes
                </label>
                <ColorInput label="Header (Fundo)" value={theme.header.bg} onChange={(v) => handleChange('header.bg', v)} />
                <ColorInput label="Header (Texto)" value={theme.header.text} onChange={(v) => handleChange('header.text', v)} />
                <ColorInput label="Categorias (Fundo)" value={theme.category.bg} onChange={(v) => handleChange('category.bg', v)} />
                <ColorInput label="Rodapé (Fundo)" value={theme.footer.bg} onChange={(v) => handleChange('footer.bg', v)} />
              </div>
            </div>
          </div>
        </div>

        {/* PREVIEW EM TEMPO REAL */}
        <div className="lg:col-span-7 bg-slate-100 dark:bg-slate-950 p-8 sm:p-12 rounded-[3.5rem] border border-dashed border-slate-300 dark:border-slate-800 flex flex-col gap-6 sticky top-8">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Simulação de Relatório</h4>
            <div className="px-3 py-1 bg-white dark:bg-slate-800 rounded-full text-[8px] font-black text-slate-400 uppercase border border-slate-200 dark:border-slate-700">Live Engine</div>
          </div>

          <div 
            className="bg-white p-8 rounded-3xl shadow-2xl border flex flex-col gap-4 overflow-hidden" 
            style={{ borderColor: theme.border, fontFamily: theme.fontFamily }}
          >
            <div className="flex justify-between items-start border-b-2 pb-4 mb-2" style={{ borderColor: theme.primary }}>
              <div>
                <div className="w-12 h-12 bg-slate-100 rounded-xl mb-3 border border-slate-200 flex items-center justify-center text-slate-300 font-black text-[10px]">LOGO</div>
                <h5 className="text-sm font-black uppercase tracking-tight" style={{ color: theme.primary }}>Relatório de Medição</h5>
                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Empreendimento Residencial</p>
              </div>
              <div className="text-right">
                <span className="text-[8px] font-black px-2 py-0.5 rounded text-white uppercase tracking-widest" style={{ backgroundColor: theme.accent, color: theme.accentText }}>MEDIÇÃO Nº 05</span>
              </div>
            </div>

            <div className="border rounded overflow-hidden" style={{ borderColor: theme.border }}>
              <div className="grid grid-cols-4 text-[8px] font-black uppercase tracking-widest p-2" style={{ backgroundColor: theme.header.bg, color: theme.header.text }}>
                <span className="col-span-2">Serviço</span>
                <span className="text-center">Qtd</span>
                <span className="text-right">Total</span>
              </div>
              <div className="grid grid-cols-4 text-[9px] font-bold p-2 border-b" style={{ backgroundColor: theme.category.bg, borderColor: theme.border, color: theme.category.text }}>
                <span className="col-span-2 uppercase">1. INFRAESTRUTURA</span>
                <span className="text-center">-</span>
                <span className="text-right">R$ 12.000,00</span>
              </div>
              <div className="grid grid-cols-4 text-[8px] p-2 bg-white border-b" style={{ borderColor: theme.border, color: '#64748b' }}>
                <span className="col-span-2 pl-3">1.1 Movimentação</span>
                <span className="text-center">m³</span>
                <span className="text-right font-black" style={{ color: theme.accent }}>R$ 4.500,00</span>
              </div>
              <div className="grid grid-cols-4 text-[9px] font-black p-2" style={{ backgroundColor: theme.footer.bg, color: theme.footer.text }}>
                <span className="col-span-2 uppercase">TOTAL GERAL</span>
                <span className="text-center">-</span>
                <span className="text-right">R$ 12.000,00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ColorInput: React.FC<{ label: string, value: string, onChange: (val: string) => void }> = ({ label, value, onChange }) => (
  <div className="space-y-1.5">
    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">{label}</label>
    <div className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
      <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-600">
        <input 
          type="color" 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] cursor-pointer border-none p-0"
        />
      </div>
      <input 
        type="text" 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="text-[10px] font-mono font-bold bg-transparent text-slate-700 dark:text-slate-300 w-full outline-none uppercase"
      />
    </div>
  </div>
);