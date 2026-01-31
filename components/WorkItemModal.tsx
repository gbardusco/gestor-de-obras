
import React, { useState, useEffect } from 'react';
import { WorkItem, ItemType } from '../types';
import { financial } from '../utils/math';
import { X, Save, Layers, Package } from 'lucide-react';
import { z } from 'zod';

const WorkItemSchema = z.object({
  name: z.string().min(3, "Mínimo 3 letras").max(200, "Muito longo"),
  type: z.enum(['category', 'item']),
  parentId: z.string().nullable().optional(),
  unit: z.string().optional(),
  contractQuantity: z.number().min(0, "Mínimo 0"),
  unitPriceNoBdi: z.number().min(0, "Mínimo 0"),
  unitPrice: z.number().min(0, "Mínimo 0"),
  currentPercentage: z.number().min(0).max(100).optional(),
}).refine((data) => data.type === 'category' || (data.unit && data.unit.trim().length > 0), {
  message: "Unidade obrigatória",
  path: ["unit"],
});

interface WorkItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<WorkItem>) => void;
  editingItem: WorkItem | null;
  type: ItemType;
  categories: WorkItem[];
  projectBdi: number;
}

export const WorkItemModal: React.FC<WorkItemModalProps> = ({
  isOpen, onClose, onSave, editingItem, type: initialType, categories, projectBdi
}) => {
  const [activeType, setActiveType] = useState<ItemType>(initialType);
  const [formData, setFormData] = useState<Partial<WorkItem>>({
    name: '', parentId: null, unit: '', contractQuantity: 0, unitPrice: 0, unitPriceNoBdi: 0, cod: '', fonte: 'Próprio'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [strQty, setStrQty] = useState('0');
  const [strPriceNoBdi, setStrPriceNoBdi] = useState('0');
  const [strPriceWithBdi, setStrPriceWithBdi] = useState('0');

  useEffect(() => {
    if (editingItem) {
      setFormData(editingItem);
      setActiveType(editingItem.type);
      setStrQty(String(editingItem.contractQuantity || 0).replace('.', ','));
      setStrPriceNoBdi(String(editingItem.unitPriceNoBdi || 0).replace('.', ','));
      setStrPriceWithBdi(String(editingItem.unitPrice || 0).replace('.', ','));
    } else {
      setFormData({ name: '', parentId: null, unit: initialType === 'item' ? 'un' : '', contractQuantity: 0, unitPrice: 0, unitPriceNoBdi: 0, cod: '', fonte: 'Próprio' });
      setActiveType(initialType);
      setStrQty('0'); setStrPriceNoBdi('0'); setStrPriceWithBdi('0');
    }
    setErrors({});
  }, [editingItem, initialType, isOpen]);

  const parseInput = (val: string): number => {
    // Substitui vírgula por ponto e parseia
    const normalized = val.replace(',', '.');
    const parsed = parseFloat(normalized);
    return isNaN(parsed) ? 0 : parsed;
  };

  const handleNumericChange = (setter: (v: string) => void, val: string, field?: 'priceNoBdi' | 'priceWithBdi') => {
    // Permite apenas números, ponto e vírgula
    const sanitized = val.replace(/[^0-9.,]/g, '');
    setter(sanitized);

    if (field) {
      const num = parseInput(sanitized);
      if (field === 'priceNoBdi') {
        setStrPriceWithBdi(String(financial.round(num * (1 + projectBdi/100))).replace('.', ','));
      } else {
        setStrPriceNoBdi(String(financial.round(num / (1 + projectBdi/100))).replace('.', ','));
      }
    }
  };

  const handleSubmit = () => {
    const finalData = {
      ...formData,
      type: activeType,
      contractQuantity: parseInput(strQty),
      unitPriceNoBdi: parseInput(strPriceNoBdi),
      unitPrice: parseInput(strPriceWithBdi)
    };
    
    const result = WorkItemSchema.safeParse(finalData);
    if (result.success) {
      onSave(finalData);
      onClose();
    } else {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach(issue => { if (issue.path[0]) newErrors[issue.path[0].toString()] = issue.message; });
      setErrors(newErrors);
    }
  };

  if (!isOpen) return null;
  const isCategory = activeType === 'category';

  return (
    <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl sm:rounded-[3rem] shadow-2xl border-t sm:border border-slate-200 dark:border-slate-800 flex flex-col max-h-[95vh] overflow-hidden">
        <div className="px-6 sm:px-10 pt-8 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${isCategory ? 'bg-indigo-600' : 'bg-emerald-600'} text-white`}>
              {isCategory ? <Layers size={22} /> : <Package size={22} />}
            </div>
            <div>
              <h2 className="text-xl font-black dark:text-white tracking-tight">{editingItem ? 'Editar' : 'Adicionar'} {isCategory ? 'Grupo' : 'Serviço'}</h2>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Configuração da EAP</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"><X size={20} /></button>
        </div>

        <div className="p-6 sm:p-10 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          {!editingItem && (
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl gap-2">
              <button onClick={() => setActiveType('category')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeType === 'category' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-md' : 'text-slate-500'}`}>Categoria/Grupo</button>
              <button onClick={() => setActiveType('item')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeType === 'item' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-md' : 'text-slate-500'}`}>Serviço/Item</button>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Descrição Completa</label>
              <textarea autoFocus rows={3} className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 dark:text-white text-sm font-semibold outline-none focus:border-indigo-500 transition-all resize-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              {errors.name && <p className="text-[10px] text-rose-500 font-bold mt-2 uppercase">{errors.name}</p>}
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Nível Hierárquico (Opcional)</label>
              <select className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 dark:text-white text-xs font-bold outline-none focus:border-indigo-500 transition-all appearance-none" value={formData.parentId || ""} onChange={e => setFormData({...formData, parentId: e.target.value || null})}>
                <option value="">Item Raiz (Nível 1)</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.wbs} - {cat.name}</option>)}
              </select>
            </div>

            {!isCategory && (
              <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Unidade</label>
                  <input placeholder="m², un, kg..." className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 dark:text-white text-xs font-black uppercase text-center outline-none focus:border-indigo-500 transition-all" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Quantidade</label>
                  <input 
                    type="text" 
                    inputMode="decimal" 
                    className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 dark:text-white text-xs font-black text-center outline-none focus:border-indigo-500 transition-all" 
                    value={strQty} 
                    onChange={e => handleNumericChange(setStrQty, e.target.value)} 
                  />
                </div>
                
                <div className="col-span-2 p-6 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border-2 border-slate-100 dark:border-slate-800 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">P. Unit S/ BDI</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">R$</span>
                        <input 
                          type="text" 
                          inputMode="decimal" 
                          className="w-full pl-10 pr-4 py-4 rounded-xl border-2 border-white dark:border-slate-800 bg-white dark:bg-slate-900 dark:text-white text-xs font-black text-right outline-none focus:border-indigo-500 transition-all" 
                          value={strPriceNoBdi} 
                          onChange={e => handleNumericChange(setStrPriceNoBdi, e.target.value, 'priceNoBdi')} 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-emerald-600 uppercase mb-2 block tracking-widest">P. Final C/ BDI</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-emerald-500/50">R$</span>
                        <input 
                          type="text" 
                          inputMode="decimal" 
                          className="w-full pl-10 pr-4 py-4 rounded-xl border-2 border-emerald-100 dark:border-emerald-900/20 bg-emerald-50/30 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 text-xs font-black text-right outline-none focus:border-emerald-500 transition-all shadow-inner" 
                          value={strPriceWithBdi} 
                          onChange={e => handleNumericChange(setStrPriceWithBdi, e.target.value, 'priceWithBdi')} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 sm:px-10 py-6 sm:py-8 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-end items-stretch gap-4 shrink-0">
          <button onClick={onClose} className="py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-700 transition-colors">Cancelar</button>
          <button onClick={handleSubmit} className={`py-5 px-10 text-[11px] font-black text-white ${isCategory ? 'bg-indigo-600 shadow-indigo-500/30' : 'bg-emerald-600 shadow-emerald-500/30'} rounded-2xl shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all uppercase tracking-[0.1em]`}>
            <Save size={18} /> {editingItem ? 'Atualizar Registro' : 'Confirmar Inclusão'}
          </button>
        </div>
      </div>
    </div>
  );
};
