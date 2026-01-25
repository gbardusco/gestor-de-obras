
import React from 'react';
import { PDFTheme } from '../types';
import { Palette, Table, Layout, Type } from 'lucide-react';

interface ThemeEditorProps {
  theme: PDFTheme;
  onChange: (theme: PDFTheme) => void;
}

export const ThemeEditor: React.FC<ThemeEditorProps> = ({ theme, onChange }) => {
  const handleChange = (key: keyof PDFTheme, value: string) => {
    onChange({ ...theme, [key]: value });
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Controls Card */}
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-xl space-y-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl text-white">
              <Palette size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Identidade Visual</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Customização de Relatórios PDF</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                <Layout size={12} /> Cores Base
              </label>
              <ColorInput label="Acento Primário" value={theme.primary} onChange={(v) => handleChange('primary', v)} />
              <ColorInput label="Acento Secundário" value={theme.secondary} onChange={(v) => handleChange('secondary', v)} />
              <ColorInput label="Cor de Borda" value={theme.border} onChange={(v) => handleChange('border', v)} />
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                <Table size={12} /> Tabelas
              </label>
              <ColorInput label="Fundo Cabeçalho" value={theme.headerBg} onChange={(v) => handleChange('headerBg', v)} />
              <ColorInput label="Texto Cabeçalho" value={theme.headerText} onChange={(v) => handleChange('headerText', v)} />
              <ColorInput label="Linha Categoria" value={theme.rowCategory} onChange={(v) => handleChange('rowCategory', v)} />
              <ColorInput label="Rodapé Totais" value={theme.rowTotal} onChange={(v) => handleChange('rowTotal', v)} />
            </div>
          </div>
        </div>

        {/* Preview Card */}
        <div className="bg-slate-50 dark:bg-slate-950 p-10 rounded-[40px] border border-dashed border-slate-300 dark:border-slate-800 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pré-visualização do Relatório</h4>
            <div className="px-3 py-1 bg-white dark:bg-slate-800 rounded-full text-[8px] font-black text-slate-400 uppercase border border-slate-200 dark:border-slate-700">Live Render</div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-2xl border flex flex-col gap-4 overflow-hidden" style={{ borderColor: theme.border }}>
            {/* Header Mock */}
            <div className="flex justify-between items-start border-b pb-4 mb-2" style={{ borderColor: theme.border }}>
              <div>
                <div className="w-12 h-12 bg-slate-100 rounded-xl mb-3 border border-slate-200" />
                <h5 className="text-xs font-black text-slate-800 uppercase tracking-tight">Relatório de Medição</h5>
                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Obra Exemplo Residencial</p>
              </div>
              <div className="text-right">
                <span className="text-[8px] font-black px-2 py-0.5 rounded-full text-white uppercase tracking-widest" style={{ backgroundColor: theme.primary }}>PAGO</span>
              </div>
            </div>

            {/* Table Mock */}
            <div className="border rounded-lg overflow-hidden" style={{ borderColor: theme.border }}>
              <div className="grid grid-cols-4 text-[8px] font-black uppercase tracking-widest p-2" style={{ backgroundColor: theme.headerBg, color: theme.headerText }}>
                <span className="col-span-2">Descrição do Serviço</span>
                <span className="text-center">Qtd</span>
                <span className="text-right">Total</span>
              </div>
              <div className="grid grid-cols-4 text-[9px] font-bold p-2 border-b" style={{ backgroundColor: theme.rowCategory, borderColor: theme.border, color: theme.primary }}>
                <span className="col-span-2 uppercase">1. Infraestrutura</span>
                <span className="text-center">-</span>
                <span className="text-right">R$ 12.500,00</span>
              </div>
              <div className="grid grid-cols-4 text-[8px] p-2 bg-white border-b" style={{ borderColor: theme.border, color: '#64748b' }}>
                <span className="col-span-2 pl-3">1.1 Escavação Mecânica</span>
                <span className="text-center">150 m³</span>
                <span className="text-right">R$ 4.500,00</span>
              </div>
              <div className="grid grid-cols-4 text-[9px] font-black p-2 text-white" style={{ backgroundColor: theme.rowTotal }}>
                <span className="col-span-2 uppercase">Total do Período</span>
                <span className="text-center">-</span>
                <span className="text-right">R$ 12.500,00</span>
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
