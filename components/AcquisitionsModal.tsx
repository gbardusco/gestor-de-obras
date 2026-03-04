import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, History, ChevronDown, ChevronUp, FileText, Truck, Layers, Calendar, DollarSign, Info } from 'lucide-react';
import { financial } from '../utils/math';

interface AcquisitionLogEntry {
  id: string;
  date: string;
  description: string;
  amount: number;
  supplier: string;
  project: string;
  status: string;
  hasInvoice: boolean;
}

interface AcquisitionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: AcquisitionLogEntry[];
}

export const AcquisitionsModal: React.FC<AcquisitionsModalProps> = ({
  isOpen, onClose, logs
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!isOpen) return null;

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
          className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        >
          <header className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl">
                <History size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Últimas Aquisições</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Histórico Consolidado de Compras</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400">
              <X size={20} />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar bg-slate-50/50 dark:bg-slate-950/50">
            {logs.length > 0 ? (
              logs.map(log => {
                const isExpanded = expandedId === log.id;
                return (
                  <div 
                    key={log.id} 
                    className={`bg-white dark:bg-slate-900 border ${isExpanded ? 'border-indigo-500 shadow-lg' : 'border-slate-100 dark:border-slate-800'} rounded-3xl overflow-hidden transition-all duration-300`}
                  >
                    <button 
                      onClick={() => setExpandedId(isExpanded ? null : log.id)}
                      className="w-full p-6 flex items-center justify-between text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-xl ${isExpanded ? 'bg-indigo-600 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>
                          <Calendar size={18} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(log.date).toLocaleDateString()}</p>
                          <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight truncate max-w-[300px]">{log.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm font-black text-slate-900 dark:text-white">{financial.formatVisual(log.amount)}</p>
                          <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">{log.status}</p>
                        </div>
                        {isExpanded ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                      </div>
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-6 pt-0 border-t border-slate-50 dark:border-slate-800 grid grid-cols-2 gap-6 mt-4">
                            <div className="space-y-4">
                              <div className="flex items-center gap-3">
                                <Truck size={16} className="text-indigo-500" />
                                <div>
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Fornecedor</p>
                                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{log.supplier}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <Layers size={16} className="text-indigo-500" />
                                <div>
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Obra / Projeto</p>
                                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{log.project}</p>
                                </div>
                              </div>
                            </div>
                            <div className="space-y-4">
                              <div className="flex items-center gap-3">
                                <FileText size={16} className="text-indigo-500" />
                                <div>
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Documento Fiscal</p>
                                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{log.hasInvoice ? 'NF-e Vinculada' : 'Sem Comprovante'}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <Info size={16} className="text-indigo-500" />
                                <div>
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ID da Transação</p>
                                  <p className="text-[10px] font-mono text-slate-500">{log.id}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            ) : (
              <div className="p-20 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-300">
                  <History size={32} />
                </div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Nenhuma aquisição registrada</p>
              </div>
            )}
          </div>

          <footer className="p-8 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-end shrink-0">
            <button 
              onClick={onClose}
              className="px-10 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl transition-all hover:scale-105"
            >
              Fechar Histórico
            </button>
          </footer>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
