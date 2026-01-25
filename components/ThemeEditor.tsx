
import React from 'react';
import { PDFTheme } from '../types';

interface ThemeEditorProps {
  theme: PDFTheme;
  onChange: (theme: PDFTheme) => void;
}

export const ThemeEditor: React.FC<ThemeEditorProps> = ({ theme, onChange }) => {
  const handleChange = (key: keyof PDFTheme, value: string) => {
    onChange({ ...theme, [key]: value });
  };

  return (
    <div className="bg-white p-6 border border-slate-200 rounded-lg shadow-sm">
      <h3 className="text-lg font-bold text-slate-800 mb-4">PDF Branding Editor</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-slate-500 uppercase">General</h4>
          <ColorInput label="Primary Accent" value={theme.primary} onChange={(v) => handleChange('primary', v)} />
          <ColorInput label="Secondary Accent" value={theme.secondary} onChange={(v) => handleChange('secondary', v)} />
          <ColorInput label="Border Color" value={theme.border} onChange={(v) => handleChange('border', v)} />
        </div>
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-slate-500 uppercase">Tables</h4>
          <ColorInput label="Header Background" value={theme.headerBg} onChange={(v) => handleChange('headerBg', v)} />
          <ColorInput label="Category Row" value={theme.rowCategory} onChange={(v) => handleChange('rowCategory', v)} />
          <ColorInput label="Item Row" value={theme.rowItem} onChange={(v) => handleChange('rowItem', v)} />
          <ColorInput label="Total Footer" value={theme.rowTotal} onChange={(v) => handleChange('rowTotal', v)} />
        </div>
      </div>
      
      <div className="mt-8">
        <h4 className="text-sm font-semibold text-slate-500 uppercase mb-3">Live Preview (Simulation)</h4>
        <div className="border p-4 rounded" style={{ borderColor: theme.border }}>
          <div className="p-2 mb-2 rounded font-bold" style={{ backgroundColor: theme.headerBg, color: theme.headerText }}>
            Measurement #01 - Preview
          </div>
          <div className="p-2 border-b" style={{ backgroundColor: theme.rowCategory, borderColor: theme.border }}>
            1. EARTHWORKS
          </div>
          <div className="p-2 border-b flex justify-between" style={{ backgroundColor: theme.rowItem, borderColor: theme.border }}>
            <span className="text-sm pl-4">1.1 Excavation</span>
            <span className="text-sm">$ 12,000.00</span>
          </div>
          <div className="p-2 font-bold flex justify-between" style={{ backgroundColor: theme.rowTotal }}>
            <span>TOTAL</span>
            <span style={{ color: theme.primary }}>$ 12,000.00</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ColorInput: React.FC<{ label: string, value: string, onChange: (val: string) => void }> = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between">
    <label className="text-sm text-slate-700">{label}</label>
    <div className="flex items-center gap-2">
      <input 
        type="color" 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-8 rounded cursor-pointer border-none bg-transparent"
      />
      <input 
        type="text" 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="text-xs font-mono border border-slate-200 rounded px-2 py-1 w-20"
      />
    </div>
  </div>
);
