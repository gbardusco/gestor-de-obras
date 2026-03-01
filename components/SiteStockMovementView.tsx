
import React, { useState, useMemo } from 'react';
import { Project, GlobalStockItem, GlobalStockMovement, StockRequest, StockRequestStatus } from '../types';
import { 
  Search, Plus, ArrowUpRight, ArrowDownLeft, 
  Package, Truck, History, Info, AlertCircle,
  CheckCircle2, Clock, ShoppingCart, AlertTriangle,
  FileText, ChevronRight, XCircle
} from 'lucide-react';
import { financial } from '../utils/math';

interface SiteStockMovementViewProps {
  project: Project;
  globalStock: GlobalStockItem[];
  globalMovements: GlobalStockMovement[];
  requests: StockRequest[];
  onUpdateGlobalStock: (stock: GlobalStockItem[]) => void;
  onUpdateGlobalMovements: (movements: GlobalStockMovement[]) => void;
  onUpdateRequests: (requests: StockRequest[]) => void;
  onUpdateProject: (data: Partial<Project>) => void;
}

export const SiteStockMovementView: React.FC<SiteStockMovementViewProps> = ({
  project, globalStock, globalMovements, requests, onUpdateGlobalStock, onUpdateGlobalMovements, onUpdateRequests, onUpdateProject
}) => {
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<GlobalStockItem | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<StockRequest | null>(null);

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

  // Solicitações desta obra
  const siteRequests = useMemo(() => {
    return requests.filter(r => r.projectId === project.id);
  }, [requests, project.id]);

  const handleRequestStock = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedItem) return;
    
    const formData = new FormData(e.currentTarget);
    const quantity = Number(formData.get('quantity'));
    
    // Criar Ticket de Solicitação (Lifecycle)
    const newRequest: StockRequest = {
      id: crypto.randomUUID(),
      projectId: project.id,
      projectName: project.name,
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      requestedQuantity: quantity,
      deliveredQuantity: 0,
      pendingQuantity: quantity,
      date: new Date().toISOString(),
      status: 'pending',
      logs: [
        { date: new Date().toISOString(), message: `Solicitação de ${quantity} ${selectedItem.unit} enviada ao Almoxarifado Central.`, status: 'pending' }
      ]
    };

    onUpdateRequests([newRequest, ...requests]);

    // Atualizar Saldo Comprometido no Global
    const updatedGlobalStock = globalStock.map(s => 
      s.id === selectedItem.id 
        ? { ...s, committedQuantity: (s.committedQuantity || 0) + quantity } 
        : s
    );
    onUpdateGlobalStock(updatedGlobalStock);

    setIsRequestModalOpen(false);
    setSelectedItem(null);
    setSearchQuery('');
  };

  const getStatusBadge = (status: StockRequestStatus) => {
    switch (status) {
      case 'pending': return <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[8px] font-black uppercase tracking-widest border border-slate-200">Pendente</span>;
      case 'partial': return <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 text-[8px] font-black uppercase tracking-widest border border-amber-200">Parcial</span>;
      case 'waiting_supply': return <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-600 text-[8px] font-black uppercase tracking-widest border border-rose-200">Aguardando Suprimento</span>;
      case 'available': return <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600 text-[8px] font-black uppercase tracking-widest border border-indigo-200 shadow-sm">Disponível para Retirada</span>;
      case 'completed': return <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600 text-[8px] font-black uppercase tracking-widest border border-emerald-200">Concluído</span>;
      default: return <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[8px] font-black uppercase tracking-widest border border-slate-200">{status}</span>;
    }
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
        <div className="lg:col-span-2 space-y-8">
          {/* Tickets de Solicitação */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingCart className="text-slate-400" size={18} />
                <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Tickets de Solicitação (Lifecycle)</h3>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="px-6 py-4">Data</th>
                    <th className="px-6 py-4">Material</th>
                    <th className="px-6 py-4 text-center">Solicitado | Recebido | Pendente</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {siteRequests.map(r => {
                    const item = globalStock.find(s => s.id === r.itemId);
                    return (
                      <tr key={r.id} className="text-[11px] hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-400">{new Date(r.date).toLocaleDateString('pt-BR')}</td>
                        <td className="px-6 py-4">
                          <span className="font-black text-slate-700 dark:text-slate-200 uppercase">{r.itemName}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2 font-black">
                            <span className="text-slate-400">{r.requestedQuantity}</span>
                            <span className="text-slate-200">|</span>
                            <span className="text-emerald-600">{r.deliveredQuantity}</span>
                            <span className="text-slate-200">|</span>
                            <span className="text-rose-600">{r.pendingQuantity}</span>
                            <span className="text-[9px] text-slate-400 ml-1">{item?.unit}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {getStatusBadge(r.status)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button 
                            onClick={() => setSelectedRequest(r)}
                            className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                          >
                            <FileText size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {siteRequests.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center opacity-20">
                        <p className="text-[10px] font-black uppercase tracking-widest">Nenhuma solicitação pendente</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Histórico de Movimentações (Entregas Reais) */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden opacity-60">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <History className="text-slate-400" size={18} />
                <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Histórico de Recebimentos Reais</h3>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="px-6 py-4">Data</th>
                    <th className="px-6 py-4">Material</th>
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
                        <td className="px-6 py-4 text-center font-black text-slate-700 dark:text-slate-200">{m.quantity} {item?.unit}</td>
                        <td className="px-6 py-4 text-slate-400 italic">{m.notes}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-500/20">
            <div className="flex items-center gap-3 mb-6">
              <Info size={20} />
              <h3 className="text-xs font-black uppercase tracking-widest">Modelo Centralizado</h3>
            </div>
            <p className="text-sm font-medium leading-relaxed opacity-90">
              Esta obra atua como <strong>Centro de Consumo</strong>. Suas solicitações geram tickets que o Almoxarifado Central atende conforme disponibilidade.
            </p>
            <div className="mt-8 pt-8 border-t border-white/10 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Tickets Ativos</p>
                <p className="text-2xl font-black">{siteRequests.filter(r => r.status !== 'completed').length}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Itens Pendentes</p>
                <p className="text-2xl font-black">{siteRequests.reduce((acc, r) => acc + r.pendingQuantity, 0)}</p>
              </div>
            </div>
          </div>

          {selectedRequest && (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border-2 border-indigo-500 shadow-xl animate-in slide-in-from-right duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Timeline do Ticket</h3>
                <button onClick={() => setSelectedRequest(null)} className="text-slate-400 hover:text-rose-500"><XCircle size={20} /></button>
              </div>
              <div className="space-y-6">
                {selectedRequest.logs.map((log, idx) => (
                  <div key={idx} className="flex gap-4 relative">
                    {idx !== selectedRequest.logs.length - 1 && (
                      <div className="absolute left-2 top-6 bottom-0 w-px bg-slate-200 dark:bg-slate-800" />
                    )}
                    <div className={`w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 z-10 shrink-0 mt-1 ${
                      log.status === 'completed' ? 'bg-emerald-500' : 
                      log.status === 'waiting_supply' ? 'bg-rose-500' :
                      log.status === 'available' ? 'bg-indigo-500' : 'bg-slate-400'
                    }`} />
                    <div>
                      <p className="text-[10px] font-black text-slate-800 dark:text-white leading-tight">{log.message}</p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">{new Date(log.date).toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Quantidade Desejada ({selectedItem.unit})</label>
                      <input name="quantity" type="number" required className="w-full px-4 py-3 bg-white dark:bg-slate-900 border-2 border-indigo-100 dark:border-indigo-800 rounded-xl text-xs font-bold outline-none" placeholder="0" />
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
