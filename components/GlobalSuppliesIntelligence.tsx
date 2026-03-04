
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, Package, Truck, 
  Filter, Calendar, Search, ArrowUpRight, 
  CheckCircle2, FileText, History, 
  BarChart3, Target, Info,
  ChevronRight, ExternalLink, Award, Zap, Clock,
  TrendingUp, TrendingDown, Plus, LayoutGrid, List
} from 'lucide-react';
import { 
  GlobalStockItem, GlobalStockMovement, Project, Supplier, 
  PurchaseRequest, ProjectExpense 
} from '../types';
import { financial } from '../utils/math';
import { SupplyRegistrationModal } from './SupplyRegistrationModal';
import { SupplyItemAnalyticsModal } from './SupplyItemAnalyticsModal';
import { AcquisitionsModal } from './AcquisitionsModal';

interface GlobalSuppliesIntelligenceProps {
  stock: GlobalStockItem[];
  movements: GlobalStockMovement[];
  projects: Project[];
  suppliers: Supplier[];
  purchaseRequests: PurchaseRequest[];
  onAddSupply: (supply: Partial<GlobalStockItem>) => void;
}

export const GlobalSuppliesIntelligence: React.FC<GlobalSuppliesIntelligenceProps> = ({
  stock, movements, projects, suppliers, purchaseRequests, onAddSupply
}) => {
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterSupplier, setFilterSupplier] = useState('all');
  const [filterProject, setFilterProject] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedItem, setSelectedItem] = useState<GlobalStockItem | null>(null);
  const [isAcquisitionsModalOpen, setIsAcquisitionsModalOpen] = useState(false);

  // 1. Agregações para Analytics
  const categories = useMemo(() => {
    const cats = new Set<string>();
    stock.forEach(item => { if (item.category) cats.add(item.category); });
    return Array.from(cats);
  }, [stock]);

  const totalBudgeted = useMemo(() => {
    return projects.reduce((acc, p) => acc + (p.items?.reduce((sum, i) => sum + (i.contractTotal || 0), 0) || 0), 0);
  }, [projects]);

  const totalSpent = useMemo(() => {
    return projects.reduce((acc, p) => acc + (p.expenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0), 0);
  }, [projects]);

  const savingIndex = totalBudgeted > 0 ? ((totalBudgeted - totalSpent) / totalBudgeted) * 100 : 0;

  // 2. Tabela Mestra de Insumos (Market Intelligence)
  const filteredStock = useMemo(() => {
    return stock.filter(item => {
      const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
      const matchesSupplier = filterSupplier === 'all' || item.supplierId === filterSupplier;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSupplier && matchesSearch;
    });
  }, [stock, filterCategory, filterSupplier, searchQuery]);

  // 3. Log de Transações (Timeline)
  const transactionLog = useMemo(() => {
    const logs: any[] = [];
    
    // Mock data for demonstration
    logs.push(
      {
        id: 'mock-1',
        date: new Date(Date.now() - 86400000 * 2).toISOString(),
        description: 'Cimento CP-II 50kg (Lote 500un)',
        amount: 14500.00,
        supplier: 'Votorantim Cimentos S.A.',
        project: 'Residencial Aurora',
        status: 'DELIVERED',
        hasInvoice: true
      },
      {
        id: 'mock-2',
        date: new Date(Date.now() - 86400000 * 5).toISOString(),
        description: 'Aço CA-50 10mm (Barra 12m)',
        amount: 8900.50,
        supplier: 'Gerdau Comercial Aços',
        project: 'Edifício Horizonte',
        status: 'DELIVERED',
        hasInvoice: true
      },
      {
        id: 'mock-3',
        date: new Date(Date.now() - 86400000 * 7).toISOString(),
        description: 'Areia Lavada Fina (Carga 12m³)',
        amount: 1200.00,
        supplier: 'Mineradora Vale do Sol',
        project: 'Residencial Aurora',
        status: 'PAID',
        hasInvoice: false
      }
    );

    projects.forEach(project => {
      project.expenses?.forEach(expense => {
        if (expense.type === 'material') {
          logs.push({
            id: expense.id,
            date: expense.date,
            description: expense.description,
            amount: expense.amount,
            supplier: expense.entityName,
            project: project.name,
            status: expense.status,
            hasInvoice: !!expense.invoiceDoc
          });
        }
      });
    });
    return logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 15);
  }, [projects]);

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* 1. Header e Filtros */}
      <header className="p-8 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-500/20">
              <Zap size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white uppercase">Inteligência de Suprimentos</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Gestão Estratégica e Financeira de Insumos</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsAcquisitionsModalOpen(true)}
              className="flex items-center gap-3 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              <History size={16} /> Últimas Aquisições
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-3 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all"
            >
              <Plus size={16} /> Novo Insumo
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:scale-105 transition-all">
              <ArrowUpRight size={16} /> Exportar Relatório
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar insumo..."
              className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl text-xs font-bold outline-none transition-all dark:text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select 
            className="px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl text-xs font-bold outline-none transition-all dark:text-white"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">Todas as Categorias</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <select 
            className="px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl text-xs font-bold outline-none transition-all dark:text-white"
            value={filterSupplier}
            onChange={(e) => setFilterSupplier(e.target.value)}
          >
            <option value="all">Todos os Fornecedores</option>
            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select 
            className="px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl text-xs font-bold outline-none transition-all dark:text-white"
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
          >
            <option value="all">Todos os Projetos</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </header>

      <div className="flex-1 p-8 overflow-y-auto custom-scrollbar space-y-8">
        {/* 2. Resumo de Performance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Saving Global</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-500 tracking-tighter">{savingIndex.toFixed(1)}%</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Economia Realizada</span>
            </div>
            <div className="mt-4 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, (totalSpent / totalBudgeted) * 100)}%` }} />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Orçado</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{financial.formatVisual(totalBudgeted)}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Base Contratual</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Realizado</p>
            <p className="text-3xl font-black text-indigo-600 tracking-tighter">{financial.formatVisual(totalSpent)}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Despesas de Materiais</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* 3. Catálogo Consolidado (Full Width) */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-xl">
                  <BarChart3 size={18} />
                </div>
                <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Catálogo Consolidado</h3>
              </div>
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button 
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                >
                  <List size={18} />
                </button>
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                >
                  <LayoutGrid size={18} />
                </button>
              </div>
            </div>

            {viewMode === 'table' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                      <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Insumo</th>
                      <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Preço Médio</th>
                      <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Melhor Compra</th>
                      <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredStock.map(item => {
                      const bestPrice = Math.min(...(item.priceHistory?.map(h => h.price) || [item.averagePrice]));
                      const lastPrice = item.priceHistory?.[item.priceHistory.length - 1]?.price || item.averagePrice;
                      const prevPrice = item.priceHistory?.[item.priceHistory.length - 2]?.price || lastPrice;
                      const fluctuation = lastPrice > prevPrice ? 'up' : lastPrice < prevPrice ? 'down' : 'stable';

                      return (
                        <tr 
                          key={item.id} 
                          onClick={() => setSelectedItem(item)}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                        >
                          <td className="p-6">
                            <div>
                              <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">{item.name}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{item.category || 'Geral'}</p>
                            </div>
                          </td>
                          <td className="p-6">
                            <p className="text-xs font-black text-indigo-600">{financial.formatVisual(item.averagePrice)}</p>
                          </td>
                          <td className="p-6">
                            <div className="flex items-center gap-2">
                              <Award size={14} className="text-emerald-500" />
                              <p className="text-xs font-bold text-emerald-600">{financial.formatVisual(bestPrice)}</p>
                            </div>
                          </td>
                          <td className="p-6">
                            <div className="flex justify-center">
                              {fluctuation === 'up' ? (
                                <TrendingUp size={16} className="text-rose-500" />
                              ) : fluctuation === 'down' ? (
                                <TrendingDown size={16} className="text-emerald-500" />
                              ) : (
                                <div className="w-2 h-2 rounded-full bg-slate-300" />
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredStock.map(item => {
                  const bestPrice = Math.min(...(item.priceHistory?.map(h => h.price) || [item.averagePrice]));
                  return (
                    <motion.div 
                      key={item.id}
                      whileHover={{ y: -5 }}
                      onClick={() => setSelectedItem(item)}
                      className="bg-slate-50 dark:bg-slate-800/40 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl text-indigo-600 shadow-sm">
                          <Package size={20} />
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.unit}</p>
                          <p className="text-xs font-black text-indigo-600 mt-1">{financial.formatVisual(item.averagePrice)}</p>
                        </div>
                      </div>
                      <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight mb-1">{item.name}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">{item.category}</p>
                      <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Award size={14} className="text-emerald-500" />
                          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Melhor: {financial.formatVisual(bestPrice)}</span>
                        </div>
                        <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <SupplyRegistrationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        existingSupplies={stock}
        onConfirm={onAddSupply}
      />

      <SupplyItemAnalyticsModal 
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        item={selectedItem}
        projects={projects}
        suppliers={suppliers}
      />

      <AcquisitionsModal 
        isOpen={isAcquisitionsModalOpen}
        onClose={() => setIsAcquisitionsModalOpen(false)}
        logs={transactionLog}
      />
    </div>
  );
};
