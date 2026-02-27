
import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, DollarSign, Package, Truck, 
  Filter, Calendar, Search, ArrowUpRight, ArrowDownRight, 
  AlertTriangle, CheckCircle2, FileText, History, 
  BarChart3, PieChart as PieChartIcon, Target, Info,
  ChevronRight, ExternalLink, Award, Zap, Clock
} from 'lucide-react';
import { 
  GlobalStockItem, GlobalStockMovement, Project, Supplier, 
  PurchaseRequest, ProjectExpense 
} from '../types';
import { financial } from '../utils/math';

interface GlobalSuppliesIntelligenceProps {
  stock: GlobalStockItem[];
  movements: GlobalStockMovement[];
  projects: Project[];
  suppliers: Supplier[];
  purchaseRequests: PurchaseRequest[];
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const GlobalSuppliesIntelligence: React.FC<GlobalSuppliesIntelligenceProps> = ({
  stock, movements, projects, suppliers, purchaseRequests
}) => {
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterSupplier, setFilterSupplier] = useState('all');
  const [filterProject, setFilterProject] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Agregações para Analytics
  const categories = useMemo(() => {
    const cats = new Set<string>();
    stock.forEach(item => { if (item.category) cats.add(item.category); });
    return Array.from(cats);
  }, [stock]);

  const purchaseVolumeByCategory = useMemo(() => {
    const data: Record<string, number> = {};
    stock.forEach(item => {
      const cat = item.category || 'Outros';
      const totalValue = item.currentQuantity * item.averagePrice;
      data[cat] = (data[cat] || 0) + totalValue;
    });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [stock]);

  const priceVariationData = useMemo(() => {
    // Simulação de variação de preço médio vs SINAPI
    return [
      { month: 'Jan', real: 32.5, sinapi: 31.8 },
      { month: 'Fev', real: 33.2, sinapi: 32.5 },
      { month: 'Mar', real: 32.8, sinapi: 33.0 },
      { month: 'Abr', real: 34.5, sinapi: 33.8 },
      { month: 'Mai', real: 35.2, sinapi: 34.5 },
      { month: 'Jun', real: 34.8, sinapi: 35.2 },
    ];
  }, []);

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
    return logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);
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
              <h1 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white uppercase">Central de Inteligência de Suprimentos</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Gestão Estratégica de Insumos e Market Intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
              <Calendar size={16} /> Últimos 30 Dias
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
        {/* 2. Painel de Indicadores (Analytics) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Variação de Preço Médio</h3>
              <div className="flex items-center gap-2 text-rose-500 text-[10px] font-bold uppercase">
                <TrendingUp size={14} /> +4.2% vs SINAPI
              </div>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={priceVariationData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
                  <XAxis dataKey="month" hide />
                  <YAxis hide domain={['auto', 'auto']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }}
                    itemStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
                  />
                  <Line type="monotone" dataKey="real" stroke="#6366f1" strokeWidth={3} dot={false} name="Preço Real" />
                  <Line type="monotone" dataKey="sinapi" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} name="SINAPI" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Índice de Economia (Saving)</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-emerald-500 tracking-tighter">{savingIndex.toFixed(1)}%</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Global</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                <span className="text-slate-400">Total Orçado</span>
                <span className="text-slate-800 dark:text-white">{financial.formatVisual(totalBudgeted)}</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${Math.min(100, (totalSpent / totalBudgeted) * 100)}%` }} />
              </div>
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                <span className="text-slate-400">Total Realizado</span>
                <span className="text-slate-800 dark:text-white">{financial.formatVisual(totalSpent)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Volume por Categoria</h3>
            <div className="h-48 flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={purchaseVolumeByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {purchaseVolumeByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 ml-4">
                {purchaseVolumeByCategory.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Tabela Mestra de Insumos */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-xl">
                <BarChart3 size={18} />
              </div>
              <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Market Intelligence: Catálogo Consolidado</h3>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Descrição do Insumo</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Volume Total</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Preço Médio Global</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Benchmark (Melhor Compra)</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Flutuação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredStock.map(item => {
                  const bestPrice = Math.min(...(item.priceHistory?.map(h => h.price) || [item.averagePrice]));
                  const lastPrice = item.priceHistory?.[item.priceHistory.length - 1]?.price || item.averagePrice;
                  const prevPrice = item.priceHistory?.[item.priceHistory.length - 2]?.price || lastPrice;
                  const fluctuation = lastPrice > prevPrice ? 'up' : lastPrice < prevPrice ? 'down' : 'stable';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                            <Package size={20} />
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">{item.name}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{item.category || 'Insumos Básicos'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <p className="text-xs font-bold dark:text-white">{item.currentQuantity} {item.unit}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Estoque Atual</p>
                      </td>
                      <td className="p-6">
                        <p className="text-xs font-black text-indigo-600">{financial.formatVisual(item.averagePrice)}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Média Ponderada</p>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          <Award size={14} className="text-emerald-500" />
                          <p className="text-xs font-bold text-emerald-600">{financial.formatVisual(bestPrice)}</p>
                        </div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Menor Valor Histórico</p>
                      </td>
                      <td className="p-6">
                        <div className="flex justify-center">
                          {fluctuation === 'up' ? (
                            <div className="flex items-center gap-1 px-3 py-1 bg-rose-100 text-rose-600 rounded-full text-[9px] font-black uppercase tracking-widest">
                              <TrendingUp size={12} /> Alta
                            </div>
                          ) : fluctuation === 'down' ? (
                            <div className="flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest">
                              <TrendingDown size={12} /> Baixa
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-400 rounded-full text-[9px] font-black uppercase tracking-widest">
                              Estável
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 4. Log de Transações */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-xl">
                  <History size={18} />
                </div>
                <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Timeline de Suprimentos</h3>
              </div>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {transactionLog.map(log => (
                <div key={log.id} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="text-center min-w-[50px]">
                      <p className="text-xs font-black text-slate-800 dark:text-white">{new Date(log.date).getDate()}</p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{new Date(log.date).toLocaleString('default', { month: 'short' })}</p>
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">{log.description}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{log.supplier}</span>
                        <div className="w-1 h-1 bg-slate-300 rounded-full" />
                        <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest">{log.project}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs font-black text-slate-800 dark:text-white">{financial.formatVisual(log.amount)}</p>
                      <span className={`text-[8px] font-black uppercase tracking-widest ${
                        log.status === 'PAID' ? 'text-emerald-500' : 'text-amber-500'
                      }`}>{log.status}</span>
                    </div>
                    {log.hasInvoice && <FileText size={16} className="text-indigo-400" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Módulo de Apoio à Decisão */}
          <div className="space-y-8">
            <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                <Target size={120} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <Award size={24} />
                  <h3 className="text-xs font-black uppercase tracking-widest">Sugestão de Fornecedor</h3>
                </div>
                <div className="space-y-6">
                  <div className="p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Melhor Performance: Cimento</span>
                      <div className="flex items-center gap-1 text-emerald-400 text-[10px] font-black">
                        <TrendingDown size={12} /> -8% Preço
                      </div>
                    </div>
                    <p className="text-lg font-black uppercase tracking-tight">Votorantim Cimentos S.A.</p>
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-1">
                        <Clock size={12} className="opacity-60" />
                        <span className="text-[9px] font-bold uppercase tracking-widest">Entrega: 48h</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle2 size={12} className="opacity-60" />
                        <span className="text-[9px] font-bold uppercase tracking-widest">Qualidade: 9.8/10</span>
                      </div>
                    </div>
                  </div>
                  <button className="w-full py-4 bg-white text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all">
                    Ver Ranking de Fornecedores
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="text-rose-500" size={20} />
                  <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Alertas de Preço Excessivo</h3>
                </div>
                <span className="px-2 py-1 bg-rose-100 text-rose-600 rounded-lg text-[9px] font-black uppercase">3 Críticos</span>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-800 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-rose-600 uppercase tracking-tight">Aço CA-50 10mm</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Obra: Escola Municipal</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-rose-600">+12.5%</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Acima da Média</p>
                  </div>
                </div>
                <div className="p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-800 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-rose-600 uppercase tracking-tight">Cabo Flexível 2.5mm</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Obra: Unidade de Saúde</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-rose-600">+10.2%</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Acima da Média</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
