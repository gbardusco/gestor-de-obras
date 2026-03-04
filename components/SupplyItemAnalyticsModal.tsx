import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BarChart3, TrendingUp, TrendingDown, Award, Package, Layers, Truck, History, Info } from 'lucide-react';
import { GlobalStockItem, Project, Supplier } from '../types';
import { financial } from '../utils/math';

interface SupplyItemAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: GlobalStockItem | null;
  projects: Project[];
  suppliers: Supplier[];
}

export const SupplyItemAnalyticsModal: React.FC<SupplyItemAnalyticsModalProps> = ({
  isOpen, onClose, item, projects, suppliers
}) => {
  if (!isOpen || !item) return null;

  const bestPrice = Math.min(...(item.priceHistory?.map(h => h.price) || [item.averagePrice]));
  const maxPrice = Math.max(...(item.priceHistory?.map(h => h.price) || [item.averagePrice]));
  
  const itemProjects = projects.filter(p => 
    p.expenses?.some(e => e.description.toLowerCase().includes(item.name.toLowerCase()))
  );

  const itemSuppliers = suppliers.filter(s => 
    item.priceHistory?.some(h => h.supplierId === s.id) || item.supplierId === s.id
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
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
          className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        >
          <header className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-500/20">
                <BarChart3 size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">{item.name}</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Analytics Detalhado do Insumo</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400">
              <X size={20} />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Preço Médio</p>
                <p className="text-2xl font-black text-indigo-600 tracking-tighter">{financial.formatVisual(item.averagePrice)}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Base de Dados Global</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Melhor Compra</p>
                <p className="text-2xl font-black text-emerald-500 tracking-tighter">{financial.formatVisual(bestPrice)}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Menor Preço Registrado</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Maior Preço</p>
                <p className="text-2xl font-black text-rose-500 tracking-tighter">{financial.formatVisual(maxPrice)}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Pico de Mercado</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Price History */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <History size={18} className="text-slate-400" />
                  <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Histórico de Preços</h3>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden">
                  <div className="divide-y divide-slate-50 dark:divide-slate-800">
                    {item.priceHistory && item.priceHistory.length > 0 ? (
                      item.priceHistory.map((h, idx) => (
                        <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(h.date).toLocaleDateString()}</span>
                            <span className="text-[9px] font-bold text-slate-500 uppercase">Fornecedor: {suppliers.find(s => s.id === h.supplierId)?.name || 'N/A'}</span>
                          </div>
                          <span className="text-sm font-black text-slate-900 dark:text-white">{financial.formatVisual(h.price)}</span>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">Sem histórico registrado</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Projects & Usage */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Layers size={18} className="text-slate-400" />
                  <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Utilização em Obras</h3>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden">
                  <div className="divide-y divide-slate-50 dark:divide-slate-800">
                    {itemProjects.length > 0 ? (
                      itemProjects.map(p => (
                        <div key={p.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">{p.name}</span>
                          <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{p.expenses?.filter(e => e.description.toLowerCase().includes(item.name.toLowerCase())).length} Aquisições</span>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">Não utilizado em obras ativas</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Suppliers */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Truck size={18} className="text-slate-400" />
                <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Fornecedores Homologados</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {itemSuppliers.length > 0 ? (
                  itemSuppliers.map(s => (
                    <div key={s.id} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center gap-4">
                      <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                        <Truck size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">{s.name}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{s.category || 'Categoria N/A'}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full p-8 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">Sem fornecedores vinculados</div>
                )}
              </div>
            </div>
          </div>

          <footer className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-slate-400">
              <Info size={14} />
              <span className="text-[9px] font-bold uppercase tracking-widest">Dados atualizados em tempo real com base nas NF-es e medições</span>
            </div>
            <button 
              onClick={onClose}
              className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl transition-all hover:scale-105"
            >
              Fechar Analytics
            </button>
          </footer>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
