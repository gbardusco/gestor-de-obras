
import React, { useState, useEffect } from 'react';
import { WorkItem, ItemType } from '../types';
import { financial } from '../utils/math';
import { X, Save, AlertCircle, Briefcase, Layers, Package, FolderTree, Percent } from 'lucide-react';

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
  isOpen,
  onClose,
  onSave,
  editingItem,
  type: initialType,
  categories,
  projectBdi
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
        unit: initialType === 'item' ? 'un' : '',
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
    if (!formData.name?.trim()) newErrors.name = "Descrição é obrigatória";
    if (activeType === 'item') {
      if (!formData.unit?.trim()) newErrors.unit = "Unidade obrigatória";
      if ((formData.contractQuantity || 0) <= 0) newErrors.contractQuantity = "Quantidade deve ser > 0";
      if ((formData.unitPrice || 0) <= 0) newErrors.unitPrice = "Preço unitário é obrigatório";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Updates Price C/ BDI based on Price S/ BDI
   */
  const handlePriceNoBdiChange = (val: number) => {
    const priceWithBdi = financial.round(val * (1 + (projectBdi || 0) / 100));
    setFormData({ ...formData, unitPriceNoBdi: val, unitPrice: priceWithBdi });
  };

  /**
   * Updates Price S/ BDI based on Price C/ BDI (Reverse calculation)
   */
  const handlePriceWithBdiChange = (val: number) => {
    const priceWithoutBdi = financial.round(val / (1 + (projectBdi || 0) / 100));
    setFormData({ ...formData, unitPrice: val, unitPriceNoBdi: priceWithoutBdi });
  };

  const isCategory = activeType === 'category';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[40px] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-10 pt-8 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${isCategory ? 'bg-blue-600' : 'bg-emerald-600'} text-white shadow-lg`}>
              {isCategory ? <Layers size={24} /> : <Package size={24} />}
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">
                {editingItem ? 'Editar Registro' : 'Novo Cadastro'}
              </h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Painel de Controle EAP</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl text-slate-400 transition-all">
            <X size={24} />
          </button>
        </div>

        {/* Tipo de Registro (Switcher) */}
        {!editingItem && (
          <div className="px-10 pt-6">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl gap-2">
              <button 
                onClick={() => setActiveType('category')}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeType === 'category' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'}`}
              >
                <FolderTree size={14} /> Categoria / Grupo
              </button>
              <button 
                onClick={() => setActiveType('item')}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeType === 'item' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' : 'text-slate-500'}`}
              >
                <Package size={14} /> Item de Serviço
              </button>
            </div>
          </div>
        )}

        {/* Body */}
        <div className="p-10 space-y-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
          <div className="space-y-4">
            <div className="col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Descrição do Elemento</label>
              <textarea 
                rows={2}
                className={`w-full px-6 py-4 rounded-2xl border bg-slate-50 dark:bg-slate-800 dark:text-white text-sm font-medium transition-all focus:ring-4 focus:ring-blue-500/10 outline-none ${errors.name ? 'border-rose-500 shadow-[0_0_0_1px_rgba(244,63,94,1)]' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'}`}
                value={formData.name}
                placeholder={isCategory ? "Ex: ESTRUTURAS DE CONCRETO" : "Ex: Viga Baldrame em Concreto Armado"}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
              {errors.name && <p className="text-[10px] text-rose-500 font-bold mt-2 ml-1 flex items-center gap-1"><AlertCircle size={10}/> {errors.name}</p>}
            </div>

            <div className="col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Vincular à Categoria Superior</label>
              <div className="relative">
                <Briefcase size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                <select 
                  className="w-full pl-14 pr-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white text-sm font-bold appearance-none cursor-pointer outline-none focus:border-blue-500"
                  value={formData.parentId || ''}
                  onChange={e => setFormData({...formData, parentId: e.target.value || null})}
                >
                  <option value="">Raiz do Projeto (Nível 1)</option>
                  {categories.filter(c => c.id !== editingItem?.id).map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.wbs} - {cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {!isCategory && (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Unidade</label>
                  <input 
                    className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white text-sm font-bold text-center"
                    value={formData.unit}
                    placeholder="m², m³, un..."
                    onChange={e => setFormData({...formData, unit: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Cód. Referência</label>
                  <input 
                    className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white text-sm font-mono"
                    value={formData.cod}
                    placeholder="Ex: SINAPI-01"
                    onChange={e => setFormData({...formData, cod: e.target.value})}
                  />
                </div>
                
                <div className="col-span-2 space-y-4 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-700">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Quantidade Contratual</label>
                      <input 
                        type="number"
                        step="any"
                        className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white text-sm font-black text-center"
                        value={formData.contractQuantity}
                        onChange={e => setFormData({...formData, contractQuantity: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">P. Unitário S/ BDI (R$)</label>
                      <input 
                        type="number"
                        step="any"
                        className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-slate-600 text-sm font-black text-right"
                        value={formData.unitPriceNoBdi}
                        onChange={e => handlePriceNoBdiChange(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                       <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">Preço Final C/ BDI ({projectBdi}%)</label>
                       <Percent size={12} className="text-emerald-500" />
                    </div>
                    <input 
                      type="number"
                      step="any"
                      className="w-full px-6 py-5 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/20 dark:text-emerald-400 text-lg font-black text-right text-emerald-700 focus:ring-4 focus:ring-emerald-500/10 outline-none"
                      value={formData.unitPrice}
                      onChange={e => handlePriceWithBdiChange(parseFloat(e.target.value) || 0)}
                    />
                    <p className="text-[8px] text-slate-400 font-bold mt-2 italic text-center uppercase tracking-widest">Base de cálculo: Valor sem BDI * {(1 + (projectBdi || 0)/100).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-10 py-8 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-700 flex justify-end items-center gap-4">
          <button onClick={onClose} className="px-8 py-3 text-xs font-black text-slate-500 hover:text-slate-800 dark:hover:text-white uppercase tracking-widest transition-all">Descartar</button>
          <button 
            onClick={() => {
              if (validate()) {
                onSave({ ...formData, type: activeType });
                onClose();
              }
            }}
            className={`px-10 py-4 text-xs font-black text-white ${isCategory ? 'bg-blue-600 shadow-blue-500/20' : 'bg-emerald-600 shadow-emerald-500/20'} rounded-2xl shadow-xl transition-all flex items-center gap-2`}
          >
            <Save size={16} /> Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
};
