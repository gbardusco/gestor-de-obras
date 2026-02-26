
import React, { useMemo, useState } from 'react';
import { GlobalStockItem, GlobalStockMovement, Project, StockRequest, PurchaseRequest, GlobalNotification } from '../types';
import { 
  Activity, BarChart3, Clock, ArrowRight, 
  CheckCircle2, XCircle, AlertCircle, User,
  Building2, Package, Calendar, ArrowDownLeft, ArrowUpRight,
  Filter, Bell, ShoppingCart, DollarSign, Eye
} from 'lucide-react';
import { financial } from '../utils/math';

interface TraceabilityDashboardProps {
  stock: GlobalStockItem[];
  movements: GlobalStockMovement[];
  projects: Project[];
  requests: StockRequest[];
  purchaseRequests: PurchaseRequest[];
  notifications: GlobalNotification[];
  onUpdateRequests: (requests: StockRequest[]) => void;
  onUpdatePurchaseRequests: (requests: PurchaseRequest[]) => void;
  onUpdateNotifications: (notifications: GlobalNotification[]) => void;
  onUpdateStock: (stock: GlobalStockItem[]) => void;
  onUpdateMovements: (movements: GlobalStockMovement[]) => void;
}

type FilterType = 'all' | 'physical' | 'financial';

export const TraceabilityDashboard: React.FC<TraceabilityDashboardProps> = ({
  stock, movements, projects, requests, purchaseRequests, notifications,
  onUpdateRequests, onUpdatePurchaseRequests, onUpdateNotifications, onUpdateStock, onUpdateMovements
}) => {
  const [filter, setFilter] = useState<FilterType>('all');

  const distributionData = useMemo(() => {
    const data: Record<string, number> = {};
    movements
      .filter(m => m.type === 'exit' && m.projectId)
      .forEach(m => {
        const projectName = m.originDestination;
        data[projectName] = (data[projectName] || 0) + (m.quantity * (stock.find(s => s.id === m.itemId)?.averagePrice || 0));
      });
    
    const total = Object.values(data).reduce((a, b) => a + b, 0);
    return Object.entries(data).map(([name, value]) => ({
      name,
      value,
      percentage: total > 0 ? (value / total) * 100 : 0
    })).sort((a, b) => b.value - a.value);
  }, [movements, stock]);

  const filteredMovements = useMemo(() => {
    if (filter === 'all') return movements;
    if (filter === 'physical') return movements.filter(m => !m.invoiceNumber);
    return movements.filter(m => !!m.invoiceNumber);
  }, [movements, filter]);

  const handleRequestAction = (requestId: string, action: 'approve' | 'reject') => {
    const request = requests.find(r => r.id === requestId);
    if (!request) return;

    if (action === 'approve') {
      const item = stock.find(s => s.id === request.itemId);
      if (!item || item.currentQuantity < request.quantity) {
        alert('Saldo insuficiente no estoque central!');
        return;
      }

      // Atualiza estoque
      const newStock = stock.map(s => s.id === item.id ? {
        ...s,
        currentQuantity: s.currentQuantity - request.quantity,
        status: (s.currentQuantity - request.quantity) <= s.minQuantity ? 'critical' : 'normal' as any
      } : s);
      onUpdateStock(newStock);

      // Registra movimento
      const newMovement: GlobalStockMovement = {
        id: crypto.randomUUID(),
        itemId: item.id,
        type: 'exit',
        quantity: request.quantity,
        date: new Date().toISOString(),
        responsible: 'Gestor de Estoque',
        originDestination: request.projectName,
        projectId: request.projectId,
        notes: `Aprovado via solicitação ${request.id}`
      };
      onUpdateMovements([newMovement, ...movements]);
    }

    onUpdateRequests(requests.map(r => r.id === requestId ? { ...r, status: action === 'approve' ? 'approved' : 'rejected' } : r));
  };

  const handlePurchaseAction = (requestId: string, action: 'order' | 'complete' | 'cancel') => {
    onUpdatePurchaseRequests(purchaseRequests.map(r => r.id === requestId ? { 
      ...r, 
      status: action === 'order' ? 'ordered' : action === 'complete' ? 'completed' : 'cancelled' 
    } : r));
    
    if (action === 'complete') {
      const request = purchaseRequests.find(r => r.id === requestId);
      if (request) {
        const newNotification: GlobalNotification = {
          id: crypto.randomUUID(),
          title: 'Compra Concluída',
          message: `O item ${request.itemName} foi reposto no estoque.`,
          type: 'system',
          date: new Date().toISOString(),
          isRead: false
        };
        onUpdateNotifications([newNotification, ...notifications]);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50 dark:bg-slate-950">
      <header className="p-8 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white uppercase">Rastreabilidade & Logística</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Fluxo Transversal de Insumos e Ativos</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl relative">
                <Bell size={20} />
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <span className="absolute top-2 right-2 w-3 h-3 bg-rose-500 border-2 border-white dark:border-slate-900 rounded-full" />
                )}
              </button>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button onClick={() => setFilter('all')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${filter === 'all' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Todos</button>
              <button onClick={() => setFilter('physical')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${filter === 'physical' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Físico</button>
              <button onClick={() => setFilter('financial')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${filter === 'financial' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Financeiro</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Distribuição por Obra */}
          <div className="lg:col-span-2 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <BarChart3 size={14} /> Distribuição de Consumo (Financeiro)
              </h3>
            </div>
            <div className="space-y-4">
              {distributionData.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-tight">
                    <span className="text-slate-600 dark:text-slate-300">{item.name}</span>
                    <span className="text-slate-400">{financial.formatVisual(item.value, 'R$')} ({item.percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 rounded-full transition-all duration-1000" 
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
              {distributionData.length === 0 && (
                <div className="py-10 text-center opacity-20">
                  <p className="text-[10px] font-black uppercase tracking-widest">Sem dados de consumo registrados</p>
                </div>
              )}
            </div>
          </div>

          {/* Notificações e Alertas */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-700">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Bell size={14} /> Alertas do Sistema
            </h3>
            <div className="space-y-4 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
              {notifications.map(n => (
                <div key={n.id} className={`p-4 rounded-2xl border ${n.isRead ? 'bg-transparent border-slate-200 dark:border-slate-700' : 'bg-white dark:bg-slate-800 border-indigo-100 dark:border-indigo-900/30 shadow-sm'}`}>
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${n.type === 'stock_alert' ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'}`}>
                      {n.type === 'stock_alert' ? <AlertCircle size={14} /> : <ShoppingCart size={14} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-tight leading-tight">{n.title}</p>
                      <p className="text-[9px] font-medium text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{n.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-y-auto custom-scrollbar">
        {/* Solicitações de Saída (Obras) */}
        <div className="space-y-6">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <ArrowUpRight size={16} /> Requisições de Obras
          </h2>
          <div className="space-y-4">
            {requests.filter(r => r.status === 'pending').map(request => (
              <div key={request.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{request.projectName}</p>
                      <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">{request.itemName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-slate-800 dark:text-white">{request.quantity}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Qtd Solicitada</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button 
                    onClick={() => handleRequestAction(request.id, 'approve')}
                    className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-colors"
                  >
                    Aprovar Saída
                  </button>
                  <button 
                    onClick={() => handleRequestAction(request.id, 'reject')}
                    className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:text-rose-600 transition-all"
                  >
                    Rejeitar
                  </button>
                </div>
              </div>
            ))}
            {requests.filter(r => r.status === 'pending').length === 0 && (
              <div className="py-10 text-center bg-white dark:bg-slate-900 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-800 opacity-30">
                <p className="text-[10px] font-black uppercase tracking-widest">Nenhuma requisição pendente</p>
              </div>
            )}
          </div>

          {/* Solicitações de Compra (Financeiro) */}
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 pt-4">
            <ShoppingCart size={16} /> Compras em Aberto
          </h2>
          <div className="space-y-4">
            {purchaseRequests.filter(r => r.status !== 'completed').map(request => (
              <div key={request.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${request.priority === 'high' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                      <ShoppingCart size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Solicitado por: {request.requestedBy}</p>
                      <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">{request.itemName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${request.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
                      {request.status === 'pending' ? 'Pendente' : 'Em Pedido'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  {request.status === 'pending' ? (
                    <button 
                      onClick={() => handlePurchaseAction(request.id, 'order')}
                      className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest"
                    >
                      Converter em Pedido
                    </button>
                  ) : (
                    <button 
                      onClick={() => handlePurchaseAction(request.id, 'complete')}
                      className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest"
                    >
                      Confirmar Entrega (NF)
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feed de Movimentações */}
        <div className="space-y-6">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <Activity size={16} /> Log de Eventos
          </h2>
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredMovements.map(movement => {
                const item = stock.find(s => s.id === movement.itemId);
                const isEntry = movement.type === 'entry';
                const isFinancial = !!movement.invoiceNumber;

                return (
                  <div key={movement.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isEntry ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'} dark:bg-slate-800`}>
                        {isEntry ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">
                            {isEntry ? 'Entrada de Material' : 'Saída para Obra'}
                          </p>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">{new Date(movement.date).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          <span className="font-black text-slate-700 dark:text-slate-200">{movement.quantity} {item?.unit}</span> de {item?.name}
                        </p>
                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase">
                            <User size={12} /> {movement.responsible}
                          </div>
                          <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase">
                            <Building2 size={12} /> {movement.originDestination}
                          </div>
                          {isFinancial && (
                            <div className="flex items-center gap-1.5 text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-md">
                              <DollarSign size={10} /> {movement.invoiceNumber}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
