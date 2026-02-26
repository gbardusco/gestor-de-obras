
import React, { useState, useMemo } from 'react';
import { Project, GlobalStockItem, GlobalStockMovement, StockRequest } from '../types';
import { 
  Search, Plus, ArrowUpRight, ArrowDownLeft, 
  Package, Truck, History, Info, AlertCircle,
  CheckCircle2, Clock
} from 'lucide-react';
import { financial } from '../utils/math';

interface SiteStockMovementViewProps {
  project: Project;
  globalStock: GlobalStockItem[];
  globalMovements: GlobalStockMovement[];
  onUpdateGlobalStock: (stock: GlobalStockItem[]) => void;
  onUpdateGlobalMovements: (movements: GlobalStockMovement[]) => void;
  onUpdateProject: (data: Partial<Project>) => void;
}

export const SiteStockMovementView: React.FC<SiteStockMovementViewProps> = ({
  project, globalStock, globalMovements, onUpdateGlobalStock, onUpdateGlobalMovements, onUpdateProject
}) => {
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<GlobalStockItem | null>(null);

  // Filtrar catálogo global
  const filteredCatalog = useMemo(() => {
    if (!searchQuery) return [];
    return globalStock.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [globalStock, searchQuery]);

  // Movimentações desta obra
  const siteMovements = useMemo(() => {
    return globalMovements.filter(m => m.projectId === project.id);
  }, [globalMovements, project.id]);

  const handleRequestStock = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedItem) return;
    
    const formData = new FormData(e.currentTarget);
    const quantity = Number(formData.get('quantity'));
    const type = formData.get('type') as 'exit' | 'entry';
    const invoiceNumber = formData.get('invoiceNumber') as string;

    if (type === 'exit') {
      if (selectedItem.currentQuantity < quantity) {
        alert("Quantidade solicitada superior ao saldo disponível no Estoque Central.");
        return;
      }

      // Atualizar Estoque Global
      const updatedGlobalStock = globalStock.map(s => 
        s.id === selectedItem.id 
          ? { ...s, currentQuantity: s.currentQuantity - quantity } 
          : s
      );
      onUpdateGlobalStock(updatedGlobalStock);

      // Registrar Movimentação Global
      const newMovement: GlobalStockMovement = {
        id: crypto.randomUUID(),
        itemId: selectedItem.id,
        type: 'exit',
        quantity: quantity,
        date: new Date().toISOString(),
        responsible: 'Eng. da Obra',
        originDestination: project.name,
        projectId: project.id,
        notes: formData.get('notes') as string || 'Consumo em obra'
      };
      onUpdateGlobalMovements([newMovement, ...globalMovements]);
    } else {
      // Entrada na obra vindo do global (ou devolução)
      const newMovement: GlobalStockMovement = {
        id: crypto.randomUUID(),
        itemId: selectedItem.id,
        type: 'entry',
        quantity: quantity,
        date: new Date().toISOString(),
        responsible: 'Eng. da Obra',
        originDestination: project.name,
        projectId: project.id,
        invoiceNumber: invoiceNumber || undefined,
        notes: formData.get('notes') as string || 'Recebimento no canteiro'
      };
      onUpdateGlobalMovements([newMovement, ...globalMovements]);
    }

    setIsRequestModalOpen(false);
    setSelectedItem(null);
    setSearchQuery('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl">
            <Truck size={24} />
          </div>
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight text-slate-800 dark:text-white leading-none">Logística de Canteiro</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">Consumo vinculado ao Estoque Central da Prefeitura</p>
          </div>
        </div>

        <button 
          onClick={() => setIsRequestModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={16} /> Registrar Movimentação
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <History className="text-slate-400" size={18} />
                <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Histórico de Consumo Local</h3>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="px-6 py-4">Data</th>
                    <th className="px-6 py-4">Material</th>
                    <th className="px-6 py-4 text-center">Tipo</th>
                    <th className="px-6 py-4 text-center">Quantidade</th>
                    <th className="px-6 py-4">Notas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {siteMovements.slice().reverse().map(m => {
                    const item = globalStock.find(s => s.id === m.itemId);
                    return (
                      <tr key={m.id} className="text-[11px] hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-400">{new Date(m.date).toLocaleDateString('pt-BR')}</td>
                        <td className="px-6 py-4">
                          <span className="font-black text-slate-700 dark:text-slate-200 uppercase">{item?.name || 'Item Removido'}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${m.type === 'entry' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                            {m.type === 'entry' ? 'Entrada' : 'Saída'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center font-black text-slate-700 dark:text-slate-200">{m.quantity} {item?.unit}</td>
                        <td className="px-6 py-4 text-slate-400 italic">{m.notes}</td>
                      </tr>
                    );
                  })}
                  {siteMovements.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center opacity-20">
                        <p className="text-[10px] font-black uppercase tracking-widest">Nenhuma movimentação nesta obra</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-500/20">
            <div className="flex items-center gap-3 mb-6">
              <Info size={20} />
              <h3 className="text-xs font-black uppercase tracking-widest">Informação de Estoque</h3>
            </div>
            <p className="text-sm font-medium leading-relaxed opacity-90">
              Todas as movimentações registradas aqui abatem diretamente do <strong>Estoque Central da Prefeitura</strong>. 
              Certifique-se de conferir o saldo global antes de registrar saídas de grande volume.
            </p>
            <div className="mt-8 pt-8 border-t border-white/10 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Itens Consumidos</p>
                <p className="text-2xl font-black">{siteMovements.filter(m => m.type === 'exit').length}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Total Movimentado</p>
                <p className="text-2xl font-black">{siteMovements.reduce((acc, m) => acc + m.quantity, 0)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <AlertCircle className="text-amber-500" size={20} />
              <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Itens Críticos no Global</h3>
            </div>
            <div className="space-y-4">
              {globalStock.filter(s => s.currentQuantity <= s.minQuantity).slice(0, 3).map(item => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <span className="text-[10px] font-black text-slate-700 dark:text-slate-200 uppercase">{item.name}</span>
                  <span className="text-[10px] font-black text-rose-600">{item.currentQuantity} {item.unit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isRequestModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <form onSubmit={handleRequestStock}>
              <div className="p-8 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-xl font-black dark:text-white uppercase tracking-tight">Registrar Movimentação</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Vincular item do Catálogo Global à Obra</p>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Buscar no Catálogo Global</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="text" 
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl text-xs font-bold outline-none transition-all dark:text-white"
                      placeholder="Digite o nome do material..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {filteredCatalog.length > 0 && !selectedItem && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-10 max-h-48 overflow-y-auto custom-scrollbar">
                        {filteredCatalog.map(item => (
                          <button 
                            key={item.id}
                            type="button"
                            onClick={() => { setSelectedItem(item); setSearchQuery(item.name); }}
                            className="w-full p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 last:border-0"
                          >
                            <span className="text-xs font-black uppercase text-slate-700 dark:text-slate-200">{item.name}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Saldo: {item.currentQuantity} {item.unit}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {selectedItem && (
                  <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl border border-indigo-100 dark:border-indigo-800 animate-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Package className="text-indigo-600" size={20} />
                        <span className="text-xs font-black uppercase text-indigo-900 dark:text-indigo-200">{selectedItem.name}</span>
                      </div>
                      <button type="button" onClick={() => setSelectedItem(null)} className="text-[9px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">Trocar Item</button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Tipo de Movimentação</label>
                        <select name="type" required className="w-full px-4 py-3 bg-white dark:bg-slate-900 border-2 border-indigo-100 dark:border-indigo-800 rounded-xl text-xs font-bold outline-none">
                          <option value="exit">Saída (Consumo/Uso)</option>
                          <option value="entry">Entrada (Recebimento)</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Quantidade ({selectedItem.unit})</label>
                        <input name="quantity" type="number" required className="w-full px-4 py-3 bg-white dark:bg-slate-900 border-2 border-indigo-100 dark:border-indigo-800 rounded-xl text-xs font-bold outline-none" placeholder="0" />
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Nota Fiscal (Opcional)</label>
                        <input name="invoiceNumber" className="w-full px-4 py-3 bg-white dark:bg-slate-900 border-2 border-indigo-100 dark:border-indigo-800 rounded-xl text-xs font-bold outline-none" placeholder="NF-000" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Observações / Local</label>
                        <input name="notes" className="w-full px-4 py-3 bg-white dark:bg-slate-900 border-2 border-indigo-100 dark:border-indigo-800 rounded-xl text-xs font-bold outline-none" placeholder="Ex: Laje Bloco A" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-8 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-end gap-4">
                <button type="button" onClick={() => setIsRequestModalOpen(false)} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">Cancelar</button>
                <button 
                  type="submit" 
                  disabled={!selectedItem}
                  className="px-8 py-4 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:hover:scale-100"
                >
                  Confirmar Movimentação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
