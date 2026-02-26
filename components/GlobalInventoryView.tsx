
import React, { useState, useMemo } from 'react';
import { GlobalStockItem, GlobalStockMovement, StockRequest, PurchaseRequest, GlobalNotification, Supplier } from '../types';
import { 
  Package, DollarSign, AlertTriangle, Search, Plus, 
  ArrowUpRight, ArrowDownLeft, History, Filter, MoreHorizontal,
  CheckCircle2, XCircle, Clock, Truck, ShoppingCart, BarChart2,
  Eye, EyeOff, TrendingUp, User
} from 'lucide-react';
import { financial } from '../utils/math';

interface GlobalInventoryViewProps {
  stock: GlobalStockItem[];
  movements: GlobalStockMovement[];
  requests: StockRequest[];
  purchaseRequests: PurchaseRequest[];
  notifications: GlobalNotification[];
  suppliers: Supplier[];
  onUpdateStock: (stock: GlobalStockItem[]) => void;
  onUpdateMovements: (movements: GlobalStockMovement[]) => void;
  onUpdateRequests: (requests: StockRequest[]) => void;
  onUpdatePurchaseRequests: (requests: PurchaseRequest[]) => void;
  onUpdateNotifications: (notifications: GlobalNotification[]) => void;
}

type InventoryMode = 'almoxarifado' | 'financeiro';

export const GlobalInventoryView: React.FC<GlobalInventoryViewProps> = ({
  stock, movements, requests, purchaseRequests, notifications, suppliers,
  onUpdateStock, onUpdateMovements, onUpdateRequests, onUpdatePurchaseRequests, onUpdateNotifications
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mode, setMode] = useState<InventoryMode>('almoxarifado');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [movementType, setMovementType] = useState<'entry' | 'exit'>('entry');

  // KPIs
  const totalItems = stock.length;
  const totalValue = stock.reduce((acc, item) => acc + (item.currentQuantity * item.averagePrice), 0);
  const criticalItems = stock.filter(item => item.currentQuantity <= item.minQuantity).length;

  const filteredStock = useMemo(() => {
    return stock.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => a.order - b.order);
  }, [stock, searchQuery]);

  const handleAddStock = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newItem: GlobalStockItem = {
      id: crypto.randomUUID(),
      name: formData.get('name') as string,
      unit: formData.get('unit') as string,
      currentQuantity: Number(formData.get('quantity')),
      minQuantity: Number(formData.get('minQuantity')),
      averagePrice: Number(formData.get('price')),
      lastPrice: Number(formData.get('price')),
      lastEntryDate: new Date().toISOString(),
      status: 'normal',
      order: stock.length,
      priceHistory: [{ date: new Date().toISOString(), price: Number(formData.get('price')) }]
    };
    onUpdateStock([...stock, newItem]);
    setIsAddModalOpen(false);
  };

  const handleRequestPurchase = (item: GlobalStockItem) => {
    const newRequest: PurchaseRequest = {
      id: crypto.randomUUID(),
      itemId: item.id,
      itemName: item.name,
      quantity: item.minQuantity * 2,
      requestedBy: 'Almoxarife Central',
      date: new Date().toISOString(),
      status: 'pending',
      priority: item.currentQuantity === 0 ? 'high' : 'medium'
    };
    onUpdatePurchaseRequests([...purchaseRequests, newRequest]);
    
    const newNotification: GlobalNotification = {
      id: crypto.randomUUID(),
      title: 'Nova Solicitação de Compra',
      message: `O almoxarifado solicitou a compra de ${newRequest.quantity} ${item.unit} de ${item.name}.`,
      type: 'purchase_update',
      date: new Date().toISOString(),
      isRead: false
    };
    onUpdateNotifications([...notifications, newNotification]);
    alert(`Solicitação de compra para ${item.name} enviada ao financeiro.`);
  };

  const [selectedStockItem, setSelectedStockItem] = useState<GlobalStockItem | null>(null);

  const handleMovementSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedStockItem) return;

    const formData = new FormData(e.currentTarget);
    const quantity = Number(formData.get('quantity'));
    const price = Number(formData.get('price'));
    const invoiceNumber = formData.get('invoiceNumber') as string;
    const supplierId = formData.get('supplierId') as string;

    // 1. Atualizar Estoque Global
    const updatedStock = stock.map(s => {
      if (s.id === selectedStockItem.id) {
        const newQty = movementType === 'entry' ? s.currentQuantity + quantity : s.currentQuantity - quantity;
        
        // Se for entrada, recalcular preço médio se o preço foi informado
        let newAvgPrice = s.averagePrice;
        let newPriceHistory = s.priceHistory || [];
        
        if (movementType === 'entry' && price > 0) {
          // Fórmula simples de preço médio: (QtdAtual * PreçoMédio + QtdNova * PreçoNovo) / (QtdAtual + QtdNova)
          newAvgPrice = ((s.currentQuantity * s.averagePrice) + (quantity * price)) / (s.currentQuantity + quantity);
          newPriceHistory = [...newPriceHistory, { date: new Date().toISOString(), price }];
        }

        return {
          ...s,
          currentQuantity: newQty,
          averagePrice: newAvgPrice,
          lastPrice: price > 0 ? price : s.lastPrice,
          lastEntryDate: movementType === 'entry' ? new Date().toISOString() : s.lastEntryDate,
          supplierId: supplierId || s.supplierId,
          priceHistory: newPriceHistory,
          status: newQty <= s.minQuantity ? 'critical' : 'normal' as any
        };
      }
      return s;
    });
    onUpdateStock(updatedStock);

    // 2. Registrar Movimentação
    const newMovement: GlobalStockMovement = {
      id: crypto.randomUUID(),
      itemId: selectedStockItem.id,
      type: movementType,
      quantity,
      date: new Date().toISOString(),
      responsible: 'Almoxarife Central',
      originDestination: movementType === 'entry' ? 'Fornecedor' : 'Saída Global',
      invoiceNumber: invoiceNumber || undefined,
      supplierId: supplierId || undefined,
      notes: formData.get('notes') as string
    };
    onUpdateMovements([newMovement, ...movements]);

    setIsMovementModalOpen(false);
    setSelectedStockItem(null);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50 dark:bg-slate-950">
      <header className="p-8 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white uppercase">Estoque Central</h1>
            <div className="flex items-center gap-4 mt-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gestão de Ativos e Insumos da Prefeitura</p>
              <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button 
                  onClick={() => setMode('almoxarifado')}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${mode === 'almoxarifado' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <Package size={12} /> Almoxarifado
                </button>
                <button 
                  onClick={() => setMode('financeiro')}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${mode === 'financeiro' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <DollarSign size={12} /> Financeiro
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => { setMovementType('entry'); setIsMovementModalOpen(true); }}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all"
            >
              <ArrowDownLeft size={16} /> Registrar Entrada (NF)
            </button>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Plus size={16} /> Novo Item
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-700 flex items-center gap-4">
            <div className="p-4 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl">
              <Package size={24} />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total de Itens</p>
              <p className="text-2xl font-black text-slate-800 dark:text-white">{totalItems}</p>
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-700 flex items-center gap-4">
            <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Valor em Ativos</p>
              <p className="text-2xl font-black text-slate-800 dark:text-white">
                {mode === 'financeiro' ? financial.formatVisual(totalValue, 'R$') : '••••••'}
              </p>
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-700 flex items-center gap-4">
            <div className="p-4 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-2xl">
              <AlertTriangle size={24} />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Estoque Crítico</p>
              <p className="text-2xl font-black text-slate-800 dark:text-white">{criticalItems}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Pesquisar no catálogo global..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl text-xs font-bold outline-none transition-all dark:text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <button className="p-3 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"><Filter size={18}/></button>
              <button className="p-3 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"><History size={18}/></button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-6 py-4">Item</th>
                  <th className="px-6 py-4">Unidade</th>
                  <th className="px-6 py-4 text-center">Saldo Atual</th>
                  <th className="px-6 py-4 text-center">Estoque Mínimo</th>
                  {mode === 'financeiro' && (
                    <>
                      <th className="px-6 py-4 text-right">Preço Médio</th>
                      <th className="px-6 py-4 text-right">Última Cotação</th>
                      <th className="px-6 py-4 text-right">Total Ativo</th>
                    </>
                  )}
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredStock.map(item => {
                  const isCritical = item.currentQuantity <= item.minQuantity;
                  return (
                    <tr key={item.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isCritical ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'} dark:bg-slate-800`}>
                            <Package size={20} />
                          </div>
                          <div>
                            <span className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight block">{item.name}</span>
                            {mode === 'financeiro' && item.supplierId && (
                              <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1 mt-0.5">
                                <Truck size={10} /> {suppliers.find(s => s.id === item.supplierId)?.name || 'Fornecedor Direto'}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">{item.unit}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-xs font-black ${isCritical ? 'text-rose-600' : 'text-slate-700 dark:text-slate-200'}`}>
                          {item.currentQuantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-[10px] font-bold text-slate-400">
                        {item.minQuantity}
                      </td>
                      {mode === 'financeiro' && (
                        <>
                          <td className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400">
                            {financial.formatVisual(item.averagePrice, 'R$')}
                          </td>
                          <td className="px-6 py-4 text-right text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            <div className="flex items-center justify-end gap-1">
                              {financial.formatVisual(item.lastPrice, 'R$')}
                              <TrendingUp size={10} />
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right text-xs font-black text-slate-700 dark:text-slate-200">
                            {financial.formatVisual(item.currentQuantity * item.averagePrice, 'R$')}
                          </td>
                        </>
                      )}
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                          isCritical 
                            ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' 
                            : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                        }`}>
                          {isCritical ? 'Crítico' : 'Normal'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {mode === 'almoxarifado' && (
                            <button 
                              onClick={() => handleRequestPurchase(item)}
                              title="Solicitar Compra"
                              className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all"
                            >
                              <ShoppingCart size={16} />
                            </button>
                          )}
                          <button className="p-2 text-slate-300 hover:text-slate-600 dark:hover:text-white transition-colors">
                            <MoreHorizontal size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de Movimentação (Entrada/Saída Global) */}
      {isMovementModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <form onSubmit={handleMovementSubmit}>
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black dark:text-white uppercase tracking-tight">
                    {movementType === 'entry' ? 'Registrar Entrada' : 'Registrar Saída'}
                  </h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Movimentação no Estoque Central</p>
                </div>
                <button type="button" onClick={() => setIsMovementModalOpen(false)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                  <XCircle size={24} />
                </button>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Selecionar Item do Catálogo</label>
                  <select 
                    required 
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl text-xs font-bold outline-none transition-all dark:text-white"
                    onChange={(e) => setSelectedStockItem(stock.find(s => s.id === e.target.value) || null)}
                  >
                    <option value="">Selecione um item...</option>
                    {stock.map(s => (
                      <option key={s.id} value={s.id}>{s.name} (Saldo: {s.currentQuantity} {s.unit})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Quantidade</label>
                    <input name="quantity" type="number" required className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl text-xs font-bold outline-none transition-all dark:text-white" placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Preço Unitário (Opcional)</label>
                    <input name="price" type="number" step="0.01" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl text-xs font-bold outline-none transition-all dark:text-white" placeholder="R$ 0,00" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nota Fiscal</label>
                    <input name="invoiceNumber" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl text-xs font-bold outline-none transition-all dark:text-white" placeholder="NF-000" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Fornecedor</label>
                    <select name="supplierId" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl text-xs font-bold outline-none transition-all dark:text-white">
                      <option value="">Selecione...</option>
                      {suppliers.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Observações</label>
                  <textarea name="notes" rows={2} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl text-xs font-bold outline-none transition-all dark:text-white" placeholder="Detalhes adicionais..." />
                </div>
              </div>

              <div className="p-8 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-end gap-4">
                <button type="button" onClick={() => setIsMovementModalOpen(false)} className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cancelar</button>
                <button type="submit" className="px-8 py-4 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20">Confirmar Registro</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <form onSubmit={handleAddStock}>
              <div className="p-8 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-xl font-black dark:text-white uppercase tracking-tight">Novo Item no Catálogo</h2>
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nome do Material</label>
                  <input name="name" required className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl text-xs font-bold outline-none transition-all dark:text-white" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Unidade</label>
                    <input name="unit" required className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl text-xs font-bold outline-none transition-all dark:text-white" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Preço Inicial</label>
                    <input name="price" type="number" step="0.01" required className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl text-xs font-bold outline-none transition-all dark:text-white" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Qtd. Inicial</label>
                    <input name="quantity" type="number" required className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl text-xs font-bold outline-none transition-all dark:text-white" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Estoque Mínimo</label>
                    <input name="minQuantity" type="number" required className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl text-xs font-bold outline-none transition-all dark:text-white" />
                  </div>
                </div>
              </div>
              <div className="p-8 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-end gap-4">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cancelar</button>
                <button type="submit" className="px-8 py-4 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20">Salvar Item</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
