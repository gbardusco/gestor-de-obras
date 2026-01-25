
import React, { useState, useEffect } from 'react';
import { WorkItem, ItemType } from '../types';
import { X, Save, AlertCircle, Info, Database, Briefcase, FileText, Layers, Package } from 'lucide-react';

interface WorkItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<WorkItem>) => void;
  editingItem: WorkItem | null;
  type: ItemType; // Default initial type
  categories: WorkItem[];
}

export const WorkItemModal: React.FC<WorkItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
  type: initialType,
  categories
}) => {
  const [activeType, setActiveType] = useState<ItemType>(initialType);
  const [formData, setFormData] = useState<Partial<WorkItem>>({
    name: '',
    parentId: null,
    unit: '',
    contractQuantity: 0,
    unitPrice: 0,
    unitPriceNoBdi: 0,
    cod: '',
    fonte: 'Próprio'
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingItem) {
      setFormData(editingItem);
      setActiveType(editingItem.type);
    } else {
      setFormData({
        name: '',
        parentId: null,
        unit: initialType === 'item' ? 'm²' : '',
        contractQuantity: 0,
        unitPrice: 0,
        unitPriceNoBdi: 0,
        cod: '',
        fonte: 'Próprio'
      });
      setActiveType(initialType);
    }
    setErrors({});
  }, [editingItem, initialType, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name?.trim()) newErrors.name = "A descrição é obrigatória";
    if (activeType === 'item') {
      if (!formData.unit?.trim()) newErrors.unit = "Und obrigatória";
      if ((formData.contractQuantity || 0) <= 0) newErrors.contractQuantity = "Mín 0.01";
      if ((formData.unitPrice || 0) <= 0) newErrors.unitPrice = "Preço obrigatório";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isCategory = activeType === 'category';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[40px] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-10 pt-8 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${isCategory ? 'bg-blue-600' : 'bg-emerald-600'} text-white shadow-lg`}>
              {isCategory ? <Layers size={24} /> : <Package size={24} />}
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">
                {editingItem ? 'Configurar Elemento' : `Novo Cadastro`}
              </h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Gestão de Estrutura Analítica</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl text-slate-400 transition-all">
            <X size={24} />
          </button>
        </div>

        {/* Type Selector (Only if NOT editing) */}
        {!editingItem && (
          <div className="px-10 pt-6">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl gap-2">
              <button 
                onClick={() => setActiveType('category')}
                className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeType === 'category' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
              >
                <Layers size={14} /> Categoria / Grupo
              </button>
              <button 
                onClick={() => setActiveType('item')}
                className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeType === 'item' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-md' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
              >
                <Package size={14} /> Item de Serviço
              </button>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-10 space-y-8 overflow-y-auto max-h-[60vh] custom-scrollbar">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
               <div className="col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Descrição</label>
                <textarea 
                  rows={2}
                  className={`w-full px-6 py-4 rounded-2xl border bg-slate-50 dark:bg-slate-800 dark:text-white text-sm font-medium transition-all focus:ring-4 focus:ring-blue-500/10 outline-none ${errors.name ? 'border-rose-500 shadow-[0_0_0_1px_rgba(244,63,94,1)]' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'}`}
                  value={formData.name}
                  placeholder={isCategory ? "Ex: INFRAESTRUTURA E FUNDAÇÕES" : "Ex: Concreto Armado fck=30MPa"}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
                {errors.name && <p className="text-[10px] text-rose-500 font-bold mt-2 ml-1 flex items-center gap-1"><AlertCircle size={10}/> {errors.name}</p>}
              </div>

              <div className="col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Vincular a (Hierarquia)</label>
                <div className="relative">
                  <Briefcase size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select 
                    className="w-full pl-14 pr-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white text-sm font-bold appearance-none cursor-pointer focus:border-blue-500 outline-none"
                    value={formData.parentId || ''}
                    onChange={e => setFormData({...formData, parentId: e.target.value || null})}
                  >
                    <option value="">Nível Raiz (Principal)</option>
                    {categories.filter(c => c.id !== editingItem?.id).map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.wbs} - {cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {!isCategory && (
                <>
                  <div className="col-span-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Cód. Referência</label>
                    <input 
                      className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white text-sm font-mono"
                      value={formData.cod}
                      placeholder="Ex: SINAPI-123"
                      onChange={e => setFormData({...formData, cod: e.target.value})}
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Unidade</label>
                    <input 
                      className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white text-sm font-bold text-center uppercase"
                      value={formData.unit}
                      placeholder="m², m³, un..."
                      onChange={e => setFormData({...formData, unit: e.target.value})}
                    />
                  </div>

                  <div className="col-span-2 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-6">
                    <div className="col-span-1">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Qtd. Total</label>
                      <input 
                        type="number"
                        className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white text-sm font-black text-center"
                        value={formData.contractQuantity}
                        onChange={e => setFormData({...formData, contractQuantity: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Preço Unit. (R$)</label>
                      <input 
                        type="number"
                        className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-emerald-400 text-sm font-black text-right"
                        value={formData.unitPrice}
                        onChange={e => setFormData({...formData, unitPrice: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-10 py-8 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-700 flex justify-end items-center gap-4">
          <button 
            onClick={onClose} 
            className="px-8 py-3 text-xs font-black text-slate-500 hover:text-slate-800 dark:hover:text-white uppercase tracking-widest transition-all"
          >
            Cancelar
          </button>
          <button 
            onClick={() => {
              if (validate()) {
                onSave({ ...formData, type: activeType });
                onClose();
              }
            }}
            className={`px-10 py-4 text-xs font-black text-white ${isCategory ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'} rounded-2xl shadow-xl transition-all flex items-center gap-2`}
          >
            <Save size={16} /> Finalizar Cadastro
          </button>
        </div>
      </div>
    </div>
  );
};
