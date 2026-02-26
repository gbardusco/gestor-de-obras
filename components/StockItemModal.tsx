
import React, { useState, useEffect } from 'react';
import { X, Package, Save } from 'lucide-react';
import { StockItem } from '../types';

interface StockItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<StockItem>) => void;
  editingItem: StockItem | null;
}

export const StockItemModal: React.FC<StockItemModalProps> = ({ isOpen, onClose, onSave, editingItem }) => {
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('un');
  const [minQuantity, setMinQuantity] = useState(0);

  useEffect(() => {
    if (editingItem) {
      setName(editingItem.name);
      setUnit(editingItem.unit);
      setMinQuantity(editingItem.minQuantity);
    } else {
      setName('');
      setUnit('un');
      setMinQuantity(0);
    }
  }, [editingItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, unit, minQuantity });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-xl">
              <Package size={20} />
            </div>
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white">
              {editingItem ? 'Editar Material' : 'Novo Material'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Nome do Material</label>
            <input
              autoFocus
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none transition-all text-sm font-medium"
              placeholder="Ex: Cimento CP-II"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Unidade</label>
              <input
                required
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none transition-all text-sm font-medium text-center"
                placeholder="Ex: un, kg, m³"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Estoque Mínimo</label>
              <input
                required
                type="number"
                step="0.01"
                value={minQuantity}
                onChange={(e) => setMinQuantity(Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none transition-all text-sm font-medium text-center"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Save size={16} />
              Salvar Material
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
