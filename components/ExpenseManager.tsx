
import React, { useState, useMemo } from 'react';
import { ProjectExpense, ExpenseType, WorkItem } from '../types';
import { financial } from '../utils/math';
import { expenseService } from '../services/expenseService';
import { 
  Plus, 
  Trash2, 
  Search, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Truck, 
  Calendar,
  Layers,
  ArrowUpRight,
  TrendingDown,
  Info
} from 'lucide-react';

interface ExpenseManagerProps {
  expenses: ProjectExpense[];
  onAdd: (expense: ProjectExpense) => void;
  onUpdate: (id: string, data: Partial<ProjectExpense>) => void;
  onDelete: (id: string) => void;
  workItems: WorkItem[];
  measuredValue: number;
  isReadOnly?: boolean;
}

export const ExpenseManager: React.FC<ExpenseManagerProps> = ({ 
  expenses, 
  onAdd, 
  onUpdate,
  onDelete, 
  workItems, 
  measuredValue,
  isReadOnly 
}) => {
  const [activeTab, setActiveTab] = useState<ExpenseType>('material');
  const [searchQuery, setSearchQuery] = useState('');
  
  const stats = useMemo(() => expenseService.getExpenseStats(expenses), [expenses]);
  const marginValue = financial.round(measuredValue - stats.total);
  const marginPercent = measuredValue > 0 ? (marginValue / measuredValue) * 100 : 0;

  const filteredExpenses = expenses.filter(e => {
    const matchType = e.type === activeTab;
    const matchSearch = e.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       e.entityName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchSearch;
  });

  const handleAddNewRow = () => {
    const newEntry: ProjectExpense = {
      id: crypto.randomUUID(),
      type: activeTab,
      date: new Date().toISOString().split('T')[0],
      description: '',
      entityName: '',
      unit: activeTab === 'labor' ? 'h' : 'un',
      quantity: 1,
      unitPrice: 0,
      amount: 0,
      linkedWorkItemId: ''
    };
    onAdd(newEntry);
  };

  const updateRow = (id: string, field: keyof ProjectExpense, value: any) => {
    const item = expenses.find(e => e.id === id);
    if (!item) return;
    const updates: Partial<ProjectExpense> = { [field]: value };
    if (field === 'quantity' || field === 'unitPrice') {
      const qty = field === 'quantity' ? parseFloat(value) || 0 : item.quantity;
      const price = field === 'unitPrice' ? parseFloat(value) || 0 : item.unitPrice;
      updates.amount = financial.round(qty * price);
    }
    onUpdate(id, updates);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-10">
      
      {/* DASHBOARD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <KpiSummary label="Total Insumos" value={stats.total} icon={<DollarSign size={20}/>} color="indigo" subText={`${stats.materialPercentage.toFixed(0)}% Mat / ${stats.laborPercentage.toFixed(0)}% MO`} />
        <KpiSummary label="Materiais" value={stats.material} icon={<ShoppingBag size={20}/>} color="emerald" subText="Subtotal MAT" />
        <KpiSummary label="Mão de Obra" value={stats.labor} icon={<Users size={20}/>} color="blue" subText="Subtotal MO" />
        <div className={`p-6 sm:p-8 rounded-[2rem] border shadow-sm transition-all relative overflow-hidden flex flex-col justify-between ${marginValue >= 0 ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20' : 'bg-rose-50 border-rose-200 dark:bg-rose-950/20'}`}>
          <div className="flex justify-between items-start mb-4">
            <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Margem Obra</span>
            {marginValue >= 0 ? <ArrowUpRight className="text-emerald-500" size={18}/> : <TrendingDown className="text-rose-500" size={18}/>}
          </div>
          <div>
            <p className={`text-xl sm:text-2xl font-black tracking-tighter ${marginValue >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>{financial.formatBRL(marginValue)}</p>
            <p className="text-[10px] font-bold uppercase mt-1 opacity-60">{marginPercent.toFixed(1)}% margem</p>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl gap-2 overflow-x-auto no-scrollbar">
          <TabTrigger active={activeTab === 'material'} onClick={() => setActiveTab('material')} label="MAT" icon={<Truck size={14}/>} />
          <TabTrigger active={activeTab === 'labor'} onClick={() => setActiveTab('labor')} label="MO" icon={<Users size={14}/>} />
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input placeholder="Buscar..." className="w-full bg-slate-50 dark:bg-slate-800 border-none pl-11 pr-4 py-3 rounded-xl text-xs outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          {!isReadOnly && (
            <button onClick={handleAddNewRow} className="px-6 py-3 bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all">
              <Plus size={16} /> Novo Gasto
            </button>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-x-auto table-container">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead className="bg-slate-900 text-white">
            <tr>
              <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest w-32">Data</th>
              <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest">Insumo / Descrição</th>
              <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest w-48">Entidade</th>
              <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest w-20 text-center">Und</th>
              <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest w-20 text-center">Qtd</th>
              <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest w-32 text-right">Unitário</th>
              <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest w-36 text-right">Total</th>
              {!isReadOnly && <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest w-16 text-center"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredExpenses.map(expense => (
              <tr key={expense.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                <td className="px-6 py-3"><input disabled={isReadOnly} type="date" value={expense.date} onChange={e => updateRow(expense.id, 'date', e.target.value)} className="w-full bg-transparent border-none text-[10px] font-bold text-slate-500 outline-none" /></td>
                <td className="px-6 py-3"><input disabled={isReadOnly} placeholder="Descrição..." value={expense.description} onChange={e => updateRow(expense.id, 'description', e.target.value)} className="w-full bg-transparent border-none text-xs font-black text-slate-800 dark:text-white outline-none" /></td>
                <td className="px-6 py-3"><input disabled={isReadOnly} placeholder="Fornecedor/Prof..." value={expense.entityName} onChange={e => updateRow(expense.id, 'entityName', e.target.value)} className="w-full bg-transparent border-none text-[10px] font-bold text-slate-500 outline-none" /></td>
                <td className="px-6 py-3 text-center"><input disabled={isReadOnly} value={expense.unit} onChange={e => updateRow(expense.id, 'unit', e.target.value)} className="w-10 bg-slate-50 dark:bg-slate-800 border-none text-[9px] font-black uppercase text-center rounded py-1 outline-none" /></td>
                <td className="px-6 py-3 text-center"><input disabled={isReadOnly} type="number" value={expense.quantity} onChange={e => updateRow(expense.id, 'quantity', e.target.value)} className="w-12 bg-transparent border-none text-xs font-bold text-center outline-none" /></td>
                <td className="px-6 py-3 text-right"><input disabled={isReadOnly} type="number" step="0.01" value={expense.unitPrice} onChange={e => updateRow(expense.id, 'unitPrice', e.target.value)} className="w-24 bg-transparent border-none text-xs font-black text-right outline-none text-indigo-600 dark:text-indigo-400" /></td>
                <td className="px-6 py-3 text-right font-mono font-black text-xs text-slate-800 dark:text-white">{financial.formatBRL(expense.amount)}</td>
                {!isReadOnly && <td className="px-6 py-3 text-center"><button onClick={() => onDelete(expense.id)} className="p-2 text-slate-300 hover:text-rose-600 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button></td>}
              </tr>
            ))}
            <tr className="bg-slate-50 dark:bg-slate-800/80 font-black">
              <td colSpan={6} className="px-6 py-5 text-right uppercase tracking-widest text-[9px] text-slate-500">Subtotal Acumulado:</td>
              <td className="px-6 py-5 text-right text-base tracking-tighter text-indigo-600 dark:text-indigo-400">{financial.formatBRL(expenseService.calculateSubtotal(expenses, activeTab))}</td>
              {!isReadOnly && <td></td>}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

const TabTrigger = ({ active, onClick, label, icon }: any) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${active ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-800'}`}>
    {icon} {label}
  </button>
);

const KpiSummary = ({ label, value, icon, color, subText }: any) => {
  const colors: any = { indigo: 'text-indigo-600', emerald: 'text-emerald-600', blue: 'text-blue-600' };
  return (
    <div className="p-6 sm:p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-lg">{icon}</div>
        <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</span>
      </div>
      <div>
        <p className={`text-xl sm:text-2xl font-black tracking-tighter ${colors[color]}`}>{financial.formatBRL(value)}</p>
        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{subText}</p>
      </div>
    </div>
  );
};
