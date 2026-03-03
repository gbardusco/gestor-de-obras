import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, AlertTriangle, Check, Search, Package, Layers } from 'lucide-react';
import { GlobalStockItem } from '../types';

interface SupplyRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingSupplies: GlobalStockItem[];
  onConfirm: (newSupply: Partial<GlobalStockItem>) => void;
}

export const SupplyRegistrationModal: React.FC<SupplyRegistrationModalProps> = ({
  isOpen, onClose, existingSupplies, onConfirm
}) => {
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [minQuantity, setMinQuantity] = useState('');

  const similarItems = useMemo(() => {
    if (name.length < 3) return [];
    const normalized = name.toLowerCase().trim();
    return existingSupplies.filter(item => {
      const existingNormalized = item.name.toLowerCase().trim();
      return existingNormalized.includes(normalized) || normalized.includes(existingNormalized);
    });
  }, [name, existingSupplies]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !unit) return;

    onConfirm({
      name,
      unit,
      category: category || 'Geral',
      averagePrice: parseFloat(price) || 0,
      lastPrice: parseFloat(price) || 0,
      minQuantity: parseFloat(minQuantity) || 0,
      currentQuantity: 0,
      committedQuantity: 0,
      status: 'normal',
      lastEntryDate: new Date().toISOString(),
      priceHistory: price ? [{ date: new Date().toISOString(), price: parseFloat(price) }] : []
    });
    
    // Reset and close
    setName('');
    setUnit('');
    setCategory('');
    setPrice('');
    setMinQuantity('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        >
          <header className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-500/20">
                <Plus size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Novo Insumo Mestre</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Cadastro Centralizado de Suprimentos</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400">
              <X size={20} />
            </button>
          </header>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Nome do Insumo</label>
                <div className="relative">
                  <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    autoFocus
                    required
                    className="w-full pl-12 pr-6 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-sm font-bold focus:border-indigo-500 outline-none transition-all"
                    placeholder="Ex: Cimento CP-II Votoran"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Unidade</label>
                <input 
                  required
                  className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-sm font-bold focus:border-indigo-500 outline-none transition-all"
                  placeholder="Ex: Saco 50kg, m³, Un"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Categoria</label>
                <div className="relative">
                  <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    className="w-full pl-12 pr-6 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-sm font-bold focus:border-indigo-500 outline-none transition-all"
                    placeholder="Ex: Básicos, Elétrica"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Preço Médio Estimado</label>
                <input 
                  type="number"
                  step="0.01"
                  className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-sm font-bold focus:border-indigo-500 outline-none transition-all"
                  placeholder="0,00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Estoque Mínimo</label>
                <input 
                  type="number"
                  className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-sm font-bold focus:border-indigo-500 outline-none transition-all"
                  placeholder="0"
                  value={minQuantity}
                  onChange={(e) => setMinQuantity(e.target.value)}
                />
              </div>
            </div>

            {/* Similarity Check Section */}
            <AnimatePresence>
              {similarItems.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-3xl p-6 space-y-4"
                >
                  <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
                    <AlertTriangle size={20} />
                    <h4 className="text-xs font-black uppercase tracking-widest">Insumos Similares Encontrados</h4>
                  </div>
                  <p className="text-[10px] font-bold text-amber-700/70 dark:text-amber-400/70 uppercase leading-relaxed">
                    Verificamos que já existem cadastros parecidos. Evite duplicidade para manter a inteligência de dados limpa.
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {similarItems.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-amber-100 dark:border-amber-900/50">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-lg">
                            <Search size={12} />
                          </div>
                          <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight">{item.name}</span>
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase">{item.unit}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          <footer className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-end gap-4 shrink-0">
            <button 
              type="button"
              onClick={onClose}
              className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={handleSubmit}
              disabled={!name || !unit}
              className="flex items-center gap-3 px-10 py-4 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
            >
              <Check size={18} /> Confirmar Cadastro
            </button>
          </footer>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
