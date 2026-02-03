import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ProjectExpense, ExpenseType, WorkItem, ItemType, Project } from '../types';
import { financial } from '../utils/math';
import { expenseService } from '../services/expenseService';
import { treeService } from '../services/treeService';
import { excelService, ExpenseImportResult } from '../services/excelService';
import { ExpenseTreeTable } from './ExpenseTreeTable';
import { ExpenseModal } from './ExpenseModal';
import { 
<<<<<<< HEAD
  Plus, Search, CheckCircle2, Wallet, ArrowRightLeft, 
  X, BarChart3, PieChart, Clock, ArrowUpRight, 
  Maximize2, Minimize2, Truck, Users, Download, UploadCloud, 
  FileSpreadsheet, Landmark, Coins
=======
  Plus, 
  Search, 
  DollarSign, 
  Users, 
  Truck, 
  TrendingDown,
  Layers,
  Download,
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  Wallet,
  ArrowRightLeft,
  X,
  AlertCircle,
  BarChart3,
  PieChart,
  Clock,
  ArrowUpRight,
  Maximize2,
  Minimize2,
  Package
>>>>>>> 6b5afb1fea73f4224dfbd1ebe3972ed622b8485e
} from 'lucide-react';

interface ExpenseManagerProps {
  project: Project;
  expenses: ProjectExpense[];
  onAdd: (expense: ProjectExpense) => void;
  onAddMany: (expenses: ProjectExpense[]) => void;
  onUpdate: (id: string, data: Partial<ProjectExpense>) => void;
  onDelete: (id: string) => void;
  workItems: WorkItem[];
  measuredValue: number;
  onUpdateExpenses: (expenses: ProjectExpense[]) => void;
  isReadOnly?: boolean;
}

export const ExpenseManager: React.FC<ExpenseManagerProps> = ({ 
  project, expenses, onAdd, onAddMany, onUpdate, onDelete, workItems, measuredValue, onUpdateExpenses, isReadOnly 
}) => {
  const [activeTab, setActiveTab] = useState<ExpenseType | 'overview'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
<<<<<<< HEAD
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    const saved = localStorage.getItem(`exp_fin_${project.id}`);
    return saved ? new Set<string>(JSON.parse(saved)) : new Set<string>();
=======
  
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    const saved = localStorage.getItem(`exp_fin_${project.id}`);
    return saved ? new Set(JSON.parse(saved)) : new Set();
>>>>>>> 6b5afb1fea73f4224dfbd1ebe3972ed622b8485e
  });

  const [isImporting, setIsImporting] = useState(false);
  const [importSummary, setImportSummary] = useState<ExpenseImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalItemType, setModalItemType] = useState<ItemType>('item');
  const [editingExpense, setEditingExpense] = useState<ProjectExpense | null>(null);
  const [targetParentId, setTargetParentId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(`exp_fin_${project.id}`, JSON.stringify(Array.from(expandedIds)));
  }, [expandedIds, project.id]);

  const stats = useMemo(() => expenseService.getExpenseStats(expenses), [expenses]);
<<<<<<< HEAD
  
  // Gap de Faturamento: O quanto eu já medi mas ainda não caiu na conta
  const billingGap = financial.round(measuredValue - stats.revenue);
=======
>>>>>>> 6b5afb1fea73f4224dfbd1ebe3972ed622b8485e

  const currentExpenses = useMemo(() => {
    if (activeTab === 'overview') return [];
    const filtered = expenses.filter(e => e.type === activeTab);
    const tree = treeService.buildTree(filtered);
    return tree.map((root, idx) => treeService.processExpensesRecursive(root as ProjectExpense, '', idx));
  }, [expenses, activeTab]);

  const processedExpenseCategories = useMemo(() => {
    if (activeTab === 'overview') return [];
    const filtered = expenses.filter(e => e.type === activeTab);
    const tree = treeService.buildTree(filtered);
    const processed = tree.map((root, idx) => treeService.processExpensesRecursive(root as ProjectExpense, '', idx));
<<<<<<< HEAD
    // Explicitly type Set as string to avoid inference issues (Set<unknown>) on line 70 error report
    const allIds = new Set<string>(filtered.map(e => e.id));
=======
    const allIds = new Set(filtered.map(e => e.id));
>>>>>>> 6b5afb1fea73f4224dfbd1ebe3972ed622b8485e
    const flattened = treeService.flattenTree(processed, allIds);
    return flattened.filter(e => e.itemType === 'category');
  }, [expenses, activeTab]);

  const flattenedExpenses = useMemo(() => 
    treeService.flattenTree(currentExpenses, expandedIds)
  , [currentExpenses, expandedIds]);

  const handleImportExpenses = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    try {
      const res = await excelService.parseExpensesExcel(file);
      setImportSummary(res);
    } catch (err) {
<<<<<<< HEAD
      alert("Erro ao importar despesas.");
=======
      alert("Erro ao importar despesas. Verifique o template.");
>>>>>>> 6b5afb1fea73f4224dfbd1ebe3972ed622b8485e
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const confirmImport = () => {
    if (!importSummary) return;
<<<<<<< HEAD
    const typesInFile = new Set<ExpenseType>();
    if (importSummary.stats.byType.labor > 0) typesInFile.add('labor');
    if (importSummary.stats.byType.material > 0) typesInFile.add('material');
    if (importSummary.stats.byType.revenue > 0) typesInFile.add('revenue');

    let updatedExpenses = expenses.filter(e => !typesInFile.has(e.type));
    updatedExpenses = [...updatedExpenses, ...importSummary.expenses];
    onUpdateExpenses(updatedExpenses);
    
    // Explicitly typing prev as Set<string> to fix TS error on functional state update (Set<unknown> mismatch)
    setExpandedIds((prev: Set<string>) => {
      // Explicitly type new Set as string to avoid inference issues (Set<unknown>)
      const next = new Set<string>(prev);
      importSummary.expenses.filter(ex => ex.itemType === 'category').forEach(ex => next.add(ex.id));
      return next;
    });
=======

    // LÓGICA DE PREVENÇÃO DE DUPLICAÇÃO:
    // Se o usuário está na aba "Materiais", removemos os materiais atuais e inserimos os novos.
    // Se ele está em "Overview", ele provavelmente está subindo um arquivo geral, então substituímos tudo.
    
    let updatedExpenses = [...expenses];
    
    if (activeTab === 'overview') {
      updatedExpenses = importSummary.expenses;
    } else {
      // Remove apenas os itens do tipo que estamos visualizando para substituir pela nova lista do Excel
      const otherTypes = expenses.filter(e => e.type !== activeTab);
      const newItemsOfActiveTab = importSummary.expenses.filter(e => e.type === activeTab);
      updatedExpenses = [...otherTypes, ...newItemsOfActiveTab];
    }

    onUpdateExpenses(updatedExpenses);
    
    const cats = importSummary.expenses.filter(ex => ex.itemType === 'category').map(ex => ex.id);
    setExpandedIds(new Set([...Array.from(expandedIds), ...cats]));
>>>>>>> 6b5afb1fea73f4224dfbd1ebe3972ed622b8485e
    setImportSummary(null);
  };

  const handleSaveExpense = (data: Partial<ProjectExpense>) => {
    if (editingExpense) {
      onUpdate(editingExpense.id, data);
    } else {
<<<<<<< HEAD
      const newExpense: ProjectExpense = {
        id: crypto.randomUUID(),
        parentId: targetParentId || null,
=======
      const parentId = targetParentId || data.parentId || null;
      const newExpense: ProjectExpense = {
        id: crypto.randomUUID(),
        parentId,
>>>>>>> 6b5afb1fea73f4224dfbd1ebe3972ed622b8485e
        type: data.type || (activeTab === 'overview' ? 'material' : activeTab as ExpenseType),
        itemType: data.itemType || modalItemType,
        wbs: '',
        order: expenses.length,
        date: data.date || new Date().toISOString().split('T')[0],
        description: data.description || 'Novo Lançamento',
        entityName: data.entityName || '',
        unit: data.unit || 'un',
        quantity: data.quantity || 1,
        unitPrice: data.unitPrice || 0,
<<<<<<< HEAD
=======
        discountValue: data.discountValue || 0,
        discountPercentage: 0,
>>>>>>> 6b5afb1fea73f4224dfbd1ebe3972ed622b8485e
        amount: data.amount || 0,
        isPaid: data.isPaid || false
      };
      onAdd(newExpense);
    }
  };

  return (
<<<<<<< HEAD
    <div className="space-y-8 max-w-[1600px] mx-auto pb-10">
      <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx, .xls" onChange={handleImportExpenses} />
      
      {/* KPIS DE LIQUIDEZ (FLUXO DE CAIXA) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CashKpi label="Recebido (Cash In)" value={stats.revenue} icon={<Landmark size={20}/>} color="emerald" sub="Total liquidado na conta" />
        <CashKpi label="Pago (Cash Out)" value={stats.paidOut} icon={<Coins size={20}/>} color="rose" sub="Total de boletos baixados" />
        <CashKpi label="A Pagar" value={stats.unpaidOut} icon={<Clock size={20}/>} color="amber" sub="Comprometido futuro" />
        <div className={`p-6 rounded-[2rem] shadow-xl flex flex-col justify-between ${stats.revenue >= stats.paidOut ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
          <div className="flex justify-between items-start">
             <div className="p-2 bg-white/20 rounded-lg"><Wallet size={20}/></div>
             <span className="text-[9px] font-black uppercase tracking-widest opacity-80">Saldo Bancário Atual</span>
          </div>
          <div>
            <p className="text-2xl font-black tracking-tighter leading-none">{financial.formatVisual(stats.revenue - stats.paidOut, project.theme?.currencySymbol || 'R$')}</p>
            <p className="text-[10px] font-bold uppercase mt-2 opacity-70">Disponibilidade Imediata</p>
=======
    <div className="space-y-6 sm:space-y-8 max-w-[1600px] mx-auto pb-10">
      <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx, .xls" onChange={handleImportExpenses} />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiSummary label="Receita Total" value={stats.revenue} icon={<ArrowRightLeft size={20}/>} color="emerald" subText="Entradas Confirmadas" currencySymbol={project.theme?.currencySymbol} />
        <KpiSummary label="Custo Total" value={stats.totalOut} icon={<TrendingDown size={20}/>} color="rose" subText="Comprometido MO+Mat" currencySymbol={project.theme?.currencySymbol} />
        <KpiSummary label="Valor Pago" value={stats.paidOut} icon={<CheckCircle2 size={20}/>} color="blue" subText="Liquidado" currencySymbol={project.theme?.currencySymbol} />
        <KpiSummary label="A Pagar" value={stats.unpaidOut} icon={<Clock size={20}/>} color="amber" subText="Pendente" currencySymbol={project.theme?.currencySymbol} />
        
        <div className={`p-6 rounded-[2rem] border shadow-xl transition-all flex flex-col justify-between ${stats.profit >= 0 ? 'bg-indigo-600 text-white' : 'bg-rose-600 text-white'}`}>
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-white/20 rounded-lg"><Wallet size={20}/></div>
            <span className="text-[9px] font-black uppercase tracking-widest opacity-80">Resultado Líquido</span>
          </div>
          <div>
            <p className="text-2xl font-black tracking-tighter leading-none">{financial.formatVisual(stats.profit, project.theme?.currencySymbol || 'R$')}</p>
            <p className="text-[10px] font-bold uppercase mt-2 opacity-70">Margem: {stats.marginPercent.toFixed(1)}%</p>
>>>>>>> 6b5afb1fea73f4224dfbd1ebe3972ed622b8485e
          </div>
        </div>
      </div>

<<<<<<< HEAD
      {/* GAP DE FATURAMENTO - KPI ÚNICO DE TRANSIÇÃO */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl"><ArrowRightLeft size={24}/></div>
          <div>
            <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">Gap de Faturamento (A Receber do Cliente)</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase">Medição Produzida vs Dinheiro na Conta</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-black text-indigo-600">{financial.formatVisual(billingGap, project.theme?.currencySymbol || 'R$')}</p>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Contas a Receber Pendentes</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-4 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl gap-2 overflow-x-auto no-scrollbar">
          <TabTrigger active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} label="Resumo" icon={<BarChart3 size={14}/>} />
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 self-center mx-1" />
          <TabTrigger active={activeTab === 'revenue'} onClick={() => setActiveTab('revenue')} label="Entradas" icon={<ArrowUpRight size={14}/>} />
          <TabTrigger active={activeTab === 'material'} onClick={() => setActiveTab('material')} label="Materiais" icon={<Truck size={14}/>} />
          <TabTrigger active={activeTab === 'labor'} onClick={() => setActiveTab('labor')} label="Pessoal" icon={<Users size={14}/>} />
        </div>

        <div className="flex items-center gap-2">
          {activeTab !== 'overview' && (
            <button onClick={() => { setModalItemType('item'); setEditingExpense(null); setIsModalOpen(true); }} className="px-5 py-3 bg-indigo-600 text-white font-black uppercase tracking-widest text-[9px] rounded-xl shadow-lg hover:scale-105 transition-transform">
               Novo Lançamento
            </button>
          )}
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1" />
          <button onClick={() => fileInputRef.current?.click()} className="p-2.5 text-slate-400 hover:text-emerald-600"><UploadCloud size={18}/></button>
          <button onClick={() => excelService.exportExpensesToExcel(project, expenses, activeTab === 'overview' ? undefined : activeTab as ExpenseType)} className="p-2.5 text-slate-400 hover:text-blue-600"><Download size={18}/></button>
=======
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl gap-2 overflow-x-auto no-scrollbar">
          <TabTrigger active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} label="Panorama" icon={<BarChart3 size={14}/>} />
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 self-center mx-1" />
          <TabTrigger active={activeTab === 'revenue'} onClick={() => setActiveTab('revenue')} label="Receitas" icon={<ArrowUpRight size={14}/>} />
          <TabTrigger active={activeTab === 'material'} onClick={() => setActiveTab('material')} label="Materiais" icon={<Truck size={14}/>} />
          <TabTrigger active={activeTab === 'labor'} onClick={() => setActiveTab('labor')} label="Mão de Obra" icon={<Users size={14}/>} />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeTab !== 'overview' && (
            <button type="button" onClick={() => { setModalItemType('item'); setEditingExpense(null); setTargetParentId(null); setIsModalOpen(true); }} className="px-5 py-3 bg-indigo-600 text-white font-black uppercase tracking-widest text-[9px] rounded-xl shadow-lg hover:scale-105 transition-transform active:scale-95">
               {activeTab === 'revenue' ? 'Nova Receita' : 'Novo Insumo'}
            </button>
          )}
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1" />
          <button type="button" onClick={() => excelService.downloadExpenseTemplate()} className="p-2.5 text-slate-400 hover:text-indigo-600 transition-colors" title="Template Excel">
            <FileSpreadsheet size={18}/>
          </button>
          <button type="button" disabled={isReadOnly || isImporting} onClick={() => fileInputRef.current?.click()} className="p-2.5 text-slate-400 hover:text-emerald-600 transition-colors disabled:opacity-30" title="Importar">
            {isImporting ? <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /> : <UploadCloud size={18}/>}
          </button>
          {activeTab !== 'overview' && (
            <button type="button" onClick={() => excelService.exportExpensesToExcel(project, expenses, activeTab as ExpenseType)} className="p-2.5 text-slate-400 hover:text-blue-600 transition-colors" title="Exportar Aba Atual">
              <Download size={18}/>
            </button>
          )}
>>>>>>> 6b5afb1fea73f4224dfbd1ebe3972ed622b8485e
        </div>
      </div>

      {activeTab === 'overview' ? (
<<<<<<< HEAD
        <FinancialSummary stats={stats} currencySymbol={project.theme?.currencySymbol} />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <button onClick={() => setExpandedIds(new Set(expenses.map(e => e.id)))} className="px-3 py-1.5 text-[9px] font-black uppercase text-slate-500 border rounded-lg hover:bg-slate-50"><Maximize2 size={12} className="inline mr-1"/> Expandir</button>
            <button onClick={() => setExpandedIds(new Set())} className="px-3 py-1.5 text-[9px] font-black uppercase text-slate-500 border rounded-lg hover:bg-slate-50"><Minimize2 size={12} className="inline mr-1"/> Recolher</button>
=======
        <FinancialOverview stats={stats} currencySymbol={project.theme?.currencySymbol} />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 no-print">
            <button 
              onClick={() => setExpandedIds(new Set(expenses.filter(e => e.itemType === 'category' && e.type === activeTab).map(e => e.id)))} 
              className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg transition-all shadow-sm"
            >
              <Maximize2 size={12} /> Expandir Tudo
            </button>
            <button 
              onClick={() => setExpandedIds(new Set())} 
              className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg transition-all shadow-sm"
            >
              <Minimize2 size={12} /> Recolher Tudo
            </button>
>>>>>>> 6b5afb1fea73f4224dfbd1ebe3972ed622b8485e
          </div>
          
          <ExpenseTreeTable 
            data={flattenedExpenses}
            expandedIds={expandedIds}
<<<<<<< HEAD
            onToggle={id => {
              // Explicitly typing prev as Set<string> to fix TS error on functional state update (Set<unknown> mismatch)
              setExpandedIds((prev: Set<string>) => {
                // Explicitly type new Set as string to avoid inference issues (Set<unknown>)
                const next = new Set<string>(prev);
                if (next.has(id)) next.delete(id); else next.add(id);
                return next;
              });
            }}
            onEdit={expense => { setEditingExpense(expense); setIsModalOpen(true); }}
            onDelete={onDelete}
            onAddChild={(pid, itype) => { setTargetParentId(pid); setModalItemType(itype); setIsModalOpen(true); }}
            onUpdateTotal={(id, total) => onUpdate(id, { amount: total })}
            onUpdateUnitPrice={(id, price) => onUpdate(id, { unitPrice: price })}
=======
            onToggle={id => { const n = new Set(expandedIds); n.has(id) ? n.delete(id) : n.add(id); setExpandedIds(n); }}
            onEdit={expense => { setEditingExpense(expense); setIsModalOpen(true); }}
            onDelete={onDelete}
            onAddChild={(pid, itype) => { setTargetParentId(pid); setModalItemType(itype); setEditingExpense(null); setIsModalOpen(true); }}
            onUpdateTotal={(id, total) => {
              const exp = expenses.find(e => e.id === id);
              if (exp) onUpdate(id, { 
                amount: total, 
                unitPrice: (exp.quantity || 1) > 0 ? financial.round((total + (exp.discountValue || 0)) / (exp.quantity || 1)) : total
              });
            }}
            onUpdateUnitPrice={(id, price) => {
              const exp = expenses.find(e => e.id === id);
              if (exp) onUpdate(id, { 
                unitPrice: price, 
                amount: financial.round((price * (exp.quantity || 0)) - (exp.discountValue || 0)) 
              });
            }}
>>>>>>> 6b5afb1fea73f4224dfbd1ebe3972ed622b8485e
            onTogglePaid={id => {
              const exp = expenses.find(e => e.id === id);
              if (exp) onUpdate(id, { isPaid: !exp.isPaid });
            }}
            onReorder={(src, tgt, pos) => onUpdateExpenses(treeService.reorderItems(expenses, src, tgt, pos))}
            onMoveManual={(id, dir) => onUpdateExpenses(treeService.moveInSiblings(expenses, id, dir))}
            isReadOnly={isReadOnly}
            currencySymbol={project.theme?.currencySymbol || 'R$'}
          />
        </div>
      )}

<<<<<<< HEAD
=======
      {importSummary && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden">
            <div className="px-8 pt-8 pb-4 flex items-center justify-between border-b border-slate-50 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl">
                  <UploadCloud size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black dark:text-white tracking-tight">Revisar Importação</h2>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Separação Automática por Categoria</p>
                </div>
              </div>
              <button onClick={() => setImportSummary(null)} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                <X size={20} />
              </button>
            </div>
            <div className="p-8 space-y-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-3 gap-4">
                <SummaryStat label="Mão de Obra" count={importSummary.stats.byType.labor} color="blue" />
                <SummaryStat label="Materiais" count={importSummary.stats.byType.material} color="indigo" />
                <SummaryStat label="Receitas" count={importSummary.stats.byType.revenue} color="emerald" />
              </div>
              
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 rounded-2xl">
                 <p className="text-[10px] font-bold text-amber-700 text-center uppercase leading-tight">
                   {activeTab === 'overview' 
                     ? "A confirmação irá SUBSTITUIR TODO o financeiro atual pelos dados do Excel."
                     : `A confirmação irá substituir apenas os registros de "${activeTab}" da planilha atual.`}
                 </p>
              </div>
            </div>
            <div className="px-8 py-6 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3 shrink-0">
              <button onClick={confirmImport} className="w-full py-5 bg-emerald-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                <CheckCircle2 size={18} /> Confirmar e Substituir
              </button>
              <button onClick={() => setImportSummary(null)} className="w-full py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

>>>>>>> 6b5afb1fea73f4224dfbd1ebe3972ed622b8485e
      <ExpenseModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveExpense} 
        editingItem={editingExpense} 
        expenseType={activeTab === 'overview' ? 'material' : (activeTab as ExpenseType)} 
        itemType={modalItemType} 
        categories={processedExpenseCategories as any}
        currencySymbol={project.theme?.currencySymbol || 'R$'}
      />
    </div>
  );
};

<<<<<<< HEAD
const CashKpi = ({ label, value, icon, color, sub }: any) => {
  const colors: any = { emerald: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-800', rose: 'text-rose-600 bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800', amber: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800' };
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-lg ${colors[color]}`}>{icon}</div>
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</span>
      </div>
      <div>
        <p className={`text-xl font-black tracking-tighter ${colors[color].split(' ')[0]}`}>{financial.formatVisual(value, 'R$')}</p>
        <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">{sub}</p>
      </div>
    </div>
  );
};

const FinancialSummary = ({ stats, currencySymbol }: { stats: any, currencySymbol?: string }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm">
      <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-2"><PieChart size={16}/> Composição das Saídas</h3>
      <div className="flex flex-col items-center">
        <div className="relative w-40 h-40 mb-8">
=======
const SummaryStat = ({ label, count, color }: any) => {
  const colors: any = { 
    blue: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20', 
    indigo: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20', 
    emerald: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' 
  };
  return (
    <div className={`p-4 rounded-2xl text-center border border-transparent ${colors[color]}`}>
      <p className="text-xl font-black">{count}</p>
      <p className="text-[8px] font-black uppercase tracking-widest mt-1 opacity-70">{label}</p>
    </div>
  );
}

const FinancialOverview = ({ stats, currencySymbol }: { stats: any, currencySymbol?: string }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl"><PieChart size={20} /></div>
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white">Distribuição de Custos</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Insumos vs Mão de Obra</p>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center py-6">
        <div className="relative w-48 h-48 flex items-center justify-center mb-8">
>>>>>>> 6b5afb1fea73f4224dfbd1ebe3972ed622b8485e
          <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
            <circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" strokeWidth="12" className="text-blue-500" strokeDasharray={`${stats.distribution.labor * 2.51} 251`} />
            <circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" strokeWidth="12" className="text-indigo-600" strokeDasharray={`${stats.distribution.material * 2.51} 251`} strokeDashoffset={`${-stats.distribution.labor * 2.51}`} />
          </svg>
<<<<<<< HEAD
        </div>
        <div className="flex gap-6">
           <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"/><span className="text-[10px] font-black uppercase text-slate-500">Pessoal</span></div>
           <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-indigo-600"/><span className="text-[10px] font-black uppercase text-slate-500">Materiais</span></div>
        </div>
      </div>
    </div>
    <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm">
      <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-2"><BarChart3 size={16}/> Fluxo de Liquidação</h3>
      <div className="space-y-8">
        <div>
           <div className="flex justify-between text-[10px] font-black uppercase mb-2"><span>Total Pago</span><span className="text-rose-600">{financial.formatVisual(stats.paidOut, currencySymbol)}</span></div>
           <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-rose-500" style={{ width: `${stats.totalOut > 0 ? (stats.paidOut / stats.totalOut) * 100 : 0}%` }} /></div>
        </div>
        <div>
           <div className="flex justify-between text-[10px] font-black uppercase mb-2"><span>A Pagar Pendente</span><span className="text-amber-600">{financial.formatVisual(stats.unpaidOut, currencySymbol)}</span></div>
           <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-amber-500" style={{ width: `${stats.totalOut > 0 ? (stats.unpaidOut / stats.totalOut) * 100 : 0}%` }} /></div>
        </div>
      </div>
=======
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Custo Real</span>
            <span className="text-lg font-black dark:text-white">{financial.formatVisual(stats.totalOut, currencySymbol || 'R$')}</span>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-6 mt-2">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm" />
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Mão de Obra</span>
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">{stats.distribution.labor.toFixed(1)}%</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-indigo-600 shadow-sm" />
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Materiais</span>
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">{stats.distribution.material.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-indigo-400 rounded-2xl"><BarChart3 size={20} /></div>
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white">Fluxo de Caixa Líquido</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Receitas Efetivadas vs Custos</p>
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-center space-y-10">
         <div className="space-y-4">
            <div className="flex justify-between items-end"><span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Recebido</span><span className="text-sm font-black text-emerald-600">{financial.formatBRL(stats.revenue)}</span></div>
            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 w-full" /></div>
         </div>
         <div className="space-y-4">
            <div className="flex justify-between items-end"><span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Custos Gastos</span><span className="text-sm font-black text-rose-500">{financial.formatBRL(stats.totalOut)}</span></div>
            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-rose-500" style={{ width: `${stats.revenue > 0 ? Math.min(100, (stats.totalOut / stats.revenue) * 100) : 0}%` }} /></div>
         </div>
      </div>
>>>>>>> 6b5afb1fea73f4224dfbd1ebe3972ed622b8485e
    </div>
  </div>
);

const TabTrigger = ({ active, onClick, label, icon }: any) => (
<<<<<<< HEAD
  <button onClick={onClick} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${active ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-md' : 'text-slate-500'}`}>{icon} {label}</button>
);
=======
  <button type="button" onClick={onClick} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${active ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-md' : 'text-slate-500'}`}>{icon} {label}</button>
);

const KpiSummary = ({ label, value, icon, color, subText, currencySymbol }: any) => {
  const colors: any = { indigo: 'text-indigo-600 dark:text-indigo-400', emerald: 'text-emerald-600 dark:text-emerald-400', rose: 'text-rose-600 dark:text-rose-400', blue: 'text-blue-600 dark:text-blue-400', amber: 'text-amber-600 dark:text-amber-400' };
  return (
    <div className="p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-lg">{icon}</div>
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{label}</span>
      </div>
      <div><p className={`text-xl font-black tracking-tighter ${colors[color]}`}>{financial.formatVisual(value, currencySymbol || 'R$')}</p><p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-1">{subText}</p></div>
    </div>
  );
};
>>>>>>> 6b5afb1fea73f4224dfbd1ebe3972ed622b8485e
