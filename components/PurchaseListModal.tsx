
import React, { useState, useMemo, useEffect } from 'react';
import { X, Plus, Trash2, Save, ShoppingCart, Calculator, Calendar, Building2, FileText, CheckCircle2 } from 'lucide-react';
import { financial } from '../utils/math';
import { Supplier } from '../types';
import { ExpenseAttachmentZone } from './ExpenseAttachmentZone';

interface PurchaseListItem {
  id: string;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
}

interface PurchaseListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (items: any[], commonData: { supplierId?: string, date: string, proof?: string }) => void;
  suppliers: Supplier[];
}

export const PurchaseListModal: React.FC<PurchaseListModalProps> = ({ isOpen, onClose, onSave, suppliers }) => {
  const [items, setItems] = useState<PurchaseListItem[]>([
    { id: crypto.randomUUID(), description: '', unit: 'un', quantity: 1, unitPrice: 0, discountPercent: 0 }
  ]);
  const [commonDate, setCommonDate] = useState(new Date().toISOString().split('T')[0]);
  const [commonSupplierId, setCommonSupplierId] = useState('');
  const [commonProof, setCommonProof] = useState<string | undefined>();

  const addItem = () => {
    setItems([...items, { id: crypto.randomUUID(), description: '', unit: 'un', quantity: 1, unitPrice: 0, discountPercent: 0 }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(i => i.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof PurchaseListItem, value: any) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const totals = useMemo(() => {
    return items.reduce((acc, curr) => {
      const subtotal = (curr.quantity || 0) * (curr.unitPrice || 0);
      const discount = subtotal * ((curr.discountPercent || 0) / 100);
      return acc + (subtotal - discount);
    }, 0);
  }, [items]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}>
      <div className="bg-[#0f111a] w-full max-w-6xl rounded-[3rem] border border-slate-800/50 shadow-2xl flex flex-col overflow-hidden max-h-[95vh] relative" onClick={e => e.stopPropagation()}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-64 bg-indigo-500/5 blur-[120px] pointer-events-none"></div>

        {/* Header */}
        <div className="p-10 pb-6 shrink-0 flex items-center justify-between z-10 border-b border-slate-800/50">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-slate-800/60 rounded-3xl border border-slate-700/50 text-indigo-500 shadow-xl">
              <ShoppingCart size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">Lançamento em Lote</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Lista de Materiais e Suprimentos</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 text-slate-500 hover:text-white transition-all rounded-2xl hover:bg-slate-800/50">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-10 flex-1 overflow-y-auto custom-scrollbar z-10 space-y-8">
          {/* Common Meta */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-slate-900/40 rounded-[2.5rem] border border-slate-800/60">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Dados de Faturamento (Comuns)</label>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                  <select 
                    className="w-full pl-11 pr-4 py-4 rounded-2xl bg-slate-950 border border-slate-800 text-white text-xs font-bold outline-none focus:border-indigo-600 transition-all appearance-none"
                    value={commonSupplierId}
                    onChange={e => setCommonSupplierId(e.target.value)}
                  >
                    <option value="">Fornecedor Spot</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                  <input 
                    type="date"
                    className="w-full pl-11 pr-4 py-4 rounded-2xl bg-slate-950 border border-slate-800 text-white text-xs font-bold outline-none focus:border-indigo-600 transition-all [color-scheme:dark]"
                    value={commonDate}
                    onChange={e => setCommonDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Anexo Único (NF/Orçamento)</label>
              <ExpenseAttachmentZone 
                label="Documento da Compra"
                currentFile={commonProof}
                onUpload={setCommonProof}
                onRemove={() => setCommonProof(undefined)}
              />
            </div>
          </div>

          {/* Table */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Itens da Lista</h3>
              <button onClick={addItem} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all">
                <Plus size={14} /> Adicionar Linha
              </button>
            </div>

            <div className="border border-slate-800/60 rounded-[2.5rem] overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-900/50 text-[9px] font-black uppercase tracking-widest text-slate-400">
                    <th className="px-6 py-5">Descrição do Material</th>
                    <th className="px-4 py-5 text-center w-24">Und</th>
                    <th className="px-4 py-5 text-center w-28">Qtd</th>
                    <th className="px-4 py-5 text-right w-40">P. Unitário</th>
                    <th className="px-4 py-5 text-center w-24">Desc %</th>
                    <th className="px-4 py-5 text-right w-44">Total Líquido</th>
                    <th className="px-6 py-5 w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {items.map((item, idx) => {
                    const rowTotal = (item.quantity * item.unitPrice) * (1 - (item.discountPercent / 100));
                    return (
                      <tr key={item.id} className="group bg-slate-900/10 hover:bg-slate-800/20 transition-colors">
                        <td className="px-6 py-4">
                          <input 
                            placeholder="Ex: Ferro 10mm CA-50"
                            className="w-full bg-transparent text-white text-sm font-black outline-none placeholder:text-slate-700"
                            value={item.description}
                            onChange={e => updateItem(item.id, 'description', e.target.value)}
                          />
                        </td>
                        <td className="px-4 py-4">
                          <input 
                            className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-2 py-2 text-center text-xs font-bold text-slate-400 uppercase"
                            value={item.unit}
                            onChange={e => updateItem(item.id, 'unit', e.target.value)}
                          />
                        </td>
                        <td className="px-4 py-4">
                          <input 
                            type="number"
                            className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-2 py-2 text-center text-xs font-black text-white"
                            value={item.quantity}
                            onChange={e => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2 px-3 py-2 bg-slate-950/50 border border-slate-800 rounded-lg">
                            <span className="text-[10px] text-slate-600 font-black">R$</span>
                            <input 
                              type="number"
                              className="w-full bg-transparent text-right text-xs font-black text-white outline-none"
                              value={item.unitPrice}
                              onChange={e => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <input 
                            type="number"
                            className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-2 py-2 text-center text-xs font-black text-rose-500"
                            value={item.discountPercent}
                            onChange={e => updateItem(item.id, 'discountPercent', parseFloat(e.target.value) || 0)}
                          />
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className="text-sm font-black text-indigo-400">
                            {financial.formatVisual(rowTotal, 'R$')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            disabled={items.length === 1}
                            onClick={() => removeItem(item.id)}
                            className="p-2 text-slate-600 hover:text-rose-500 transition-colors disabled:opacity-20"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-10 pt-6 border-t border-slate-800/50 bg-[#0f111a]/80 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-6 z-20">
          <div className="flex items-center gap-8">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total da Lista</span>
              <div className="flex items-center gap-3">
                <Calculator size={20} className="text-indigo-500" />
                <p className="text-3xl font-black text-white tracking-tighter">
                  {financial.formatVisual(totals, 'R$')}
                </p>
              </div>
            </div>
            <div className="h-10 w-px bg-slate-800 hidden md:block" />
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-2xl border border-slate-800">
              <CheckCircle2 size={14} className="text-emerald-500" />
              <span className="text-[10px] font-black text-slate-400 uppercase">{items.length} Materiais Lançados</span>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <button onClick={onClose} className="px-8 py-5 text-slate-500 font-black uppercase text-xs tracking-widest hover:text-white transition-colors">Voltar</button>
            <button 
              onClick={() => onSave(items, { supplierId: commonSupplierId, date: commonDate, proof: commonProof })}
              disabled={items.some(i => !i.description)}
              className="flex-1 md:flex-none px-12 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-[0_15px_35px_-10px_rgba(79,70,229,0.5)] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Save size={20} /> Salvar Lote de Materiais
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
