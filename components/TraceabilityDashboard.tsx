
import React, { useMemo } from 'react';
import { GlobalStockItem, GlobalStockMovement, Project, StockRequest } from '../types';
import { 
  Activity, BarChart3, Clock, ArrowRight, 
  CheckCircle2, XCircle, AlertCircle, User,
  Building2, Package, Calendar, ArrowDownLeft, ArrowUpRight
} from 'lucide-react';
import { financial } from '../utils/math';

interface TraceabilityDashboardProps {
  stock: GlobalStockItem[];
  movements: GlobalStockMovement[];
  projects: Project[];
  requests: StockRequest[];
  onUpdateRequests: (requests: StockRequest[]) => void;
  onUpdateStock: (stock: GlobalStockItem[]) => void;
  onUpdateMovements: (movements: GlobalStockMovement[]) => void;
}

export const TraceabilityDashboard: React.FC<TraceabilityDashboardProps> = ({
  stock, movements, projects, requests, onUpdateRequests, onUpdateStock, onUpdateMovements
}) => {
  // Gráfico de Distribuição (Simulado com barras CSS)
  const distributionData = useMemo(() => {
    const consumptionByProject: Record<string, number> = {};
    movements.filter(m => m.type === 'exit' && m.projectId).forEach(m => {
      consumptionByProject[m.projectId!] = (consumptionByProject[m.projectId!] || 0) + m.quantity;
    });

    const totalConsumption = Object.values(consumptionByProject).reduce((a, b) => a + b, 0);

    return Object.entries(consumptionByProject).map(([projectId, qty]) => {
      const project = projects.find(p => p.id === projectId);
      return {
        name: project?.name || 'Obra Desconhecida',
        percentage: totalConsumption > 0 ? (qty / totalConsumption) * 100 : 0,
        value: qty
      };
    }).sort((a, b) => b.value - a.value);
  }, [movements, projects]);

  const handleRequestAction = (requestId: string, action: 'approved' | 'rejected') => {
    const request = requests.find(r => r.id === requestId);
    if (!request) return;

    if (action === 'approved') {
      const stockItem = stock.find(s => s.id === request.itemId);
      if (stockItem && stockItem.currentQuantity >= request.quantity) {
        // 1. Atualizar Estoque Global
        const updatedStock = stock.map(s => 
          s.id === request.itemId 
            ? { ...s, currentQuantity: s.currentQuantity - request.quantity } 
            : s
        );
        onUpdateStock(updatedStock);

        // 2. Registrar Movimentação
        const newMovement: GlobalStockMovement = {
          id: crypto.randomUUID(),
          itemId: request.itemId,
          type: 'exit',
          quantity: request.quantity,
          date: new Date().toISOString(),
          responsible: 'Sistema (Aprovação)',
          originDestination: request.projectName,
          projectId: request.projectId,
          notes: `Aprovado via solicitação: ${request.id}`
        };
        onUpdateMovements([...movements, newMovement]);
      } else {
        alert("Estoque insuficiente para aprovar esta solicitação.");
        return;
      }
    }

    // 3. Atualizar Status da Solicitação
    onUpdateRequests(requests.map(r => r.id === requestId ? { ...r, status: action } : r));
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50 dark:bg-slate-950">
      <header className="p-8 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg">
            <Activity size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white uppercase">Painel de Rastreabilidade</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Visão Transversal de Consumo e Logística</p>
          </div>
        </div>
      </header>

      <div className="flex-1 p-8 overflow-y-auto custom-scrollbar space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gráfico de Distribuição */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <BarChart3 className="text-indigo-600" size={20} />
              <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Consumo por Unidade (Obra)</h3>
            </div>
            
            <div className="space-y-6">
              {distributionData.length > 0 ? distributionData.map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-500">{item.name}</span>
                    <span className="text-indigo-600">{item.percentage.toFixed(1)}%</span>
                  </div>
                  <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-600 transition-all duration-1000" 
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              )) : (
                <div className="py-12 text-center opacity-20">
                  <BarChart3 size={48} className="mx-auto mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Sem dados de consumo registrados</p>
                </div>
              )}
            </div>
          </div>

          {/* Módulo de Solicitações */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <AlertCircle className="text-amber-500" size={20} />
              <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Solicitações Pendentes</h3>
            </div>

            <div className="space-y-4">
              {requests.filter(r => r.status === 'pending').map(req => (
                <div key={req.id} className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-slate-400">
                      <Package size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-tight">{req.itemName}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{req.projectName} • {req.quantity} unidades</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleRequestAction(req.id, 'approved')}
                      className="p-3 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-xl hover:scale-105 transition-transform"
                    >
                      <CheckCircle2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleRequestAction(req.id, 'rejected')}
                      className="p-3 bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 rounded-xl hover:scale-105 transition-transform"
                    >
                      <XCircle size={18} />
                    </button>
                  </div>
                </div>
              ))}
              {requests.filter(r => r.status === 'pending').length === 0 && (
                <div className="py-12 text-center opacity-20">
                  <CheckCircle2 size={48} className="mx-auto mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Nenhuma solicitação pendente</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Feed de Atividades Transversal */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <Clock className="text-slate-400" size={20} />
            <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Feed de Movimentações Global</h3>
          </div>

          <div className="space-y-1">
            {movements.slice().reverse().map(m => {
              const item = stock.find(s => s.id === m.itemId);
              return (
                <div key={m.id} className="flex items-center gap-6 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-2xl transition-colors border-l-4 border-transparent hover:border-indigo-500">
                  <div className="w-20 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {new Date(m.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  
                  <div className={`p-2 rounded-xl ${m.type === 'entry' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'} dark:bg-slate-800`}>
                    {m.type === 'entry' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase">{m.type === 'entry' ? 'Entrada' : 'Saída'} de {m.quantity} {item?.unit || 'un'} de {item?.name || 'Item Removido'}</span>
                      <ArrowRight size={12} className="text-slate-300" />
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{m.originDestination}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase">
                        <User size={10} /> {m.responsible}
                      </div>
                      {m.projectId && (
                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase">
                          <Building2 size={10} /> Vínculo: {m.originDestination}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                    {new Date(m.date).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              );
            })}
            {movements.length === 0 && (
              <div className="py-20 text-center opacity-20">
                <Calendar size={48} className="mx-auto mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest">Nenhuma movimentação registrada no sistema</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
