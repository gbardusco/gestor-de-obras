
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { WorkItem, DEFAULT_THEME, ItemType, Project, PDFTheme } from './types';
import { treeService } from './services/treeService';
import { excelService, ImportResult } from './services/excelService';
import { TreeTable } from './components/TreeTable';
import { ThemeEditor } from './components/ThemeEditor';
import { WorkItemModal } from './components/WorkItemModal';
import { financial } from './utils/math';
import { 
  Plus, 
  LayoutDashboard,
  TrendingUp,
  Database,
  Moon,
  Sun,
  HardHat,
  Search,
  Briefcase,
  PieChart,
  Layers,
  FileSpreadsheet,
  UploadCloud,
  Menu,
  PlusCircle,
  AlertTriangle,
  CheckCircle2,
  X,
  Printer,
  FileText,
  Palette
} from 'lucide-react';

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'wbs' | 'branding'>('wbs');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ItemType>('item');
  const [editingItem, setEditingItem] = useState<WorkItem | null>(null);
  const [targetParentId, setTargetParentId] = useState<string | null>(null);
  
  const [importSummary, setImportSummary] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('promeasure_v3_projects');
    if (saved) {
      const parsed = JSON.parse(saved);
      setProjects(parsed);
      if (parsed.length > 0) setActiveProjectId(parsed[0].id);
    } else {
      createNewProject('Obra Exemplo - Residencial');
    }
    const savedDark = localStorage.getItem('pro_measure_dark_mode');
    if (savedDark === 'true') setIsDarkMode(true);
  }, []);

  useEffect(() => {
    if (projects.length > 0) localStorage.setItem('promeasure_v3_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('pro_measure_dark_mode', isDarkMode.toString());
  }, [isDarkMode]);

  const activeProject = useMemo(() => projects.find(p => p.id === activeProjectId) || null, [projects, activeProjectId]);

  const processedTree = useMemo(() => {
    if (!activeProject) return [];
    const tree = treeService.buildTree(activeProject.items);
    return tree.map(root => treeService.processRecursive(root));
  }, [activeProject]);

  // For the screen UI (respects expandedIds)
  const flattenedList = useMemo(() => treeService.flattenTree(processedTree, expandedIds), [processedTree, expandedIds]);

  // For the print report (force expands everything)
  const printFlattenedList = useMemo(() => {
    if (!activeProject) return [];
    const allCategoryIds = new Set(activeProject.items.filter(i => i.type === 'category').map(i => i.id));
    return treeService.flattenTree(processedTree, allCategoryIds);
  }, [processedTree, activeProject]);

  const stats = useMemo(() => {
    const totals = {
      contract: financial.sum(processedTree.map(n => n.contractTotal)),
      current: financial.sum(processedTree.map(n => n.currentTotal)),
      accumulated: financial.sum(processedTree.map(n => n.accumulatedTotal)),
      balance: financial.sum(processedTree.map(n => n.balanceTotal)),
    };
    return { ...totals, progress: totals.contract > 0 ? (totals.accumulated / totals.contract) * 100 : 0 };
  }, [processedTree]);

  const createNewProject = (name: string) => {
    const newProj: Project = {
      id: crypto.randomUUID(),
      name,
      companyName: 'Engenharia Ltda.',
      measurementNumber: 1,
      referenceDate: new Date().toLocaleDateString('pt-BR'),
      logo: null,
      items: [],
      theme: { ...DEFAULT_THEME },
      config: { strict: false, printCards: true, printSubtotals: true }
    };
    setProjects(prev => [...prev, newProj]);
    setActiveProjectId(newProj.id);
  };

  const updateActiveProject = (data: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === activeProjectId ? { ...p, ...data } : p));
  };

  const updateBranding = (newTheme: PDFTheme) => {
    if (!activeProject) return;
    updateActiveProject({ theme: newTheme });
  };

  const handleSaveWorkItem = (data: Partial<WorkItem>) => {
    if (!activeProject) return;
    if (editingItem) {
      updateActiveProject({ items: activeProject.items.map(it => it.id === editingItem.id ? { ...it, ...data } : it) });
    } else {
      const newItem: WorkItem = {
        id: crypto.randomUUID(),
        parentId: targetParentId || data.parentId || null,
        name: data.name || 'Sem nome',
        type: data.type || modalType,
        wbs: '',
        order: activeProject.items.filter(i => i.parentId === (targetParentId || data.parentId || null)).length,
        unit: data.unit || 'un',
        cod: data.cod || '',
        fonte: data.fonte || 'Próprio',
        contractQuantity: data.contractQuantity || 0,
        unitPrice: data.unitPrice || 0,
        unitPriceNoBdi: data.unitPriceNoBdi || 0,
        contractTotal: 0,
        previousQuantity: 0,
        previousTotal: 0,
        currentQuantity: 0,
        currentTotal: 0,
        currentPercentage: 0,
        accumulatedQuantity: 0,
        accumulatedTotal: 0,
        accumulatedPercentage: 0,
        balanceQuantity: 0,
        balanceTotal: 0
      };
      updateActiveProject({ items: [...activeProject.items, newItem] });
      if (newItem.parentId) setExpandedIds(new Set([...expandedIds, newItem.parentId]));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await excelService.parseAndValidate(file);
      setImportSummary(result);
    } catch (err) {
      alert("Erro crítico: " + err);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const confirmImport = () => {
    if (!importSummary || !activeProject) return;
    updateActiveProject({ items: [...activeProject.items, ...importSummary.items] });
    setImportSummary(null);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx, .xls" onChange={handleFileUpload} />
      
      {/* Print View Wrapper */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white !important; }
          @page { margin: 10mm; size: A4 landscape; }
          .print-header { border-bottom: 2px solid ${activeProject?.theme?.primary || '#000'}; margin-bottom: 20px; }
          tr { page-break-inside: avoid; }
          table { width: 100%; border-collapse: collapse; }
        }
        .print-only { display: none; }
      `}</style>

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-80' : 'w-20'} bg-slate-900 text-white flex flex-col transition-all duration-300 z-50 no-print`}>
        <div className="p-6 flex items-center gap-4 border-b border-slate-800">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg"><HardHat size={24} /></div>
          {sidebarOpen && <div className="flex flex-col"><span className="text-lg font-black tracking-tighter">PROMEASURE</span><span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">WBS Enterprise</span></div>}
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-4">
          <SidebarItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={18}/>} label="Dashboard" open={sidebarOpen} />
          <SidebarItem active={activeTab === 'wbs'} onClick={() => setActiveTab('wbs')} icon={<Layers size={18}/>} label="Planilha EAP" open={sidebarOpen} />
          <SidebarItem active={activeTab === 'branding'} onClick={() => setActiveTab('branding')} icon={<Palette size={18}/>} label="Branding PDF" open={sidebarOpen} />
          <div className="h-px bg-slate-800 my-4" />
          <div className="flex items-center justify-between px-2 mb-2">
            {sidebarOpen && <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Projetos</h3>}
            <button onClick={() => createNewProject('Nova Obra')} className="text-blue-500"><PlusCircle size={16} /></button>
          </div>
          {projects.map(p => (
            <SidebarItem key={p.id} active={p.id === activeProjectId} onClick={() => setActiveProjectId(p.id)} icon={<Briefcase size={18}/>} label={p.name} open={sidebarOpen} />
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
           <SidebarItem active={false} onClick={() => setIsDarkMode(!isDarkMode)} icon={isDarkMode ? <Sun size={18}/> : <Moon size={18}/>} label={isDarkMode ? "Modo Claro" : "Modo Escuro"} open={sidebarOpen} />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 shadow-sm z-10 no-print">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl"><Menu size={20} /></button>
            {activeProject && <div className="flex flex-col"><h2 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">{activeProject.name}</h2><span className="text-[10px] text-blue-500 font-black uppercase tracking-widest">Medição Ativa #{activeProject.measurementNumber}</span></div>}
          </div>
          <div className="flex items-center gap-4">
             <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all"
            >
               <Printer size={16} /> Imprimir PDF
            </button>
            <button 
              onClick={() => { setTargetParentId(null); setModalType('item'); setEditingItem(null); setIsModalOpen(true); }}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-95"
            >
               <Plus size={16} /> Novo Registro
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 bg-slate-50 dark:bg-slate-950 custom-scrollbar no-print">
          <div className="max-w-[1750px] mx-auto space-y-8 pb-20">
            {activeTab === 'dashboard' && (
              <div className="grid grid-cols-4 gap-6 animate-in fade-in duration-500">
                <KpiCard label="Contrato Total" value={financial.formatBRL(stats.contract)} icon={<Briefcase size={16}/>} progress={100} color="slate" />
                <KpiCard label="Medição Período" value={financial.formatBRL(stats.current)} icon={<TrendingUp size={16}/>} progress={stats.progress} color="blue" highlight />
                <KpiCard label="Acumulado" value={financial.formatBRL(stats.accumulated)} icon={<PieChart size={16}/>} progress={stats.progress} color="emerald" />
                <KpiCard label="Saldo Obra" value={financial.formatBRL(stats.balance)} icon={<Database size={16}/>} progress={100 - stats.progress} color="rose" />
              </div>
            )}

            {activeTab === 'wbs' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button onClick={() => excelService.downloadTemplate()} className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all hover:border-blue-400"><FileSpreadsheet size={16} /> Baixar Template</button>
                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-5 py-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all hover:bg-emerald-100"><UploadCloud size={16} /> Importar Planilha</button>
                  </div>
                  <div className="relative w-96 hidden lg:block">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input placeholder="Filtrar EAP..." className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 pl-11 pr-4 py-3 rounded-2xl text-xs focus:ring-4 focus:ring-blue-500/10 outline-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  </div>
                </div>
                <TreeTable 
                  data={flattenedList} 
                  expandedIds={expandedIds} 
                  onToggle={id => { const n = new Set(expandedIds); n.has(id) ? n.delete(id) : n.add(id); setExpandedIds(n); }} 
                  onExpandAll={() => setExpandedIds(new Set(activeProject?.items.filter(i => i.type === 'category').map(i => i.id)))}
                  onCollapseAll={() => setExpandedIds(new Set())}
                  onDelete={id => updateActiveProject({ items: activeProject?.items.filter(i => i.id !== id && i.parentId !== id) || [] })}
                  onUpdateQuantity={(id, qty) => updateActiveProject({ items: activeProject?.items.map(it => it.id === id ? { ...it, currentQuantity: qty } : it) })}
                  onUpdatePercentage={(id, pct) => updateActiveProject({ items: activeProject?.items.map(it => it.id === id ? { ...it, currentQuantity: financial.round((pct/100) * it.contractQuantity), currentPercentage: pct } : it) })}
                  onAddChild={(pid, type) => { setTargetParentId(pid); setModalType(type); setEditingItem(null); setIsModalOpen(true); }}
                  onEdit={item => { setEditingItem(item); setModalType(item.type); setIsModalOpen(true); }}
                  searchQuery={searchQuery}
                />
              </div>
            )}

            {activeTab === 'branding' && activeProject && (
              <div className="animate-in slide-in-from-bottom-4 duration-500">
                <ThemeEditor theme={activeProject.theme} onChange={updateBranding} />
              </div>
            )}
          </div>
        </main>

        {/* --- PRINT ONLY REPORT SECTION --- */}
        <div className="print-only p-8 bg-white text-slate-900 w-full min-h-screen">
            <div className="flex justify-between items-start border-b-4 pb-6 mb-6" style={{ borderColor: activeProject?.theme?.primary }}>
               <div>
                  <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">{activeProject?.companyName}</h1>
                  <h2 className="text-lg font-bold text-slate-500 mt-1">Relatório Consolidado de Medição</h2>
               </div>
               <div className="text-right space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Projeto</p>
                  <p className="text-xl font-black text-slate-800">{activeProject?.name}</p>
                  <p className="text-[10px] font-bold text-slate-500 pt-1">Medição Nº {activeProject?.measurementNumber} — {activeProject?.referenceDate}</p>
               </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-8">
               <PrintKpi label="Total Contrato" value={financial.formatBRL(stats.contract)} />
               <PrintKpi label="Total Medido" value={financial.formatBRL(stats.accumulated)} />
               <PrintKpi label="Medição Atual" value={financial.formatBRL(stats.current)} primary themeColor={activeProject?.theme?.primary} />
               <PrintKpi label="Saldo à Medir" value={financial.formatBRL(stats.balance)} />
            </div>

            <div className="border rounded-xl overflow-hidden" style={{ borderColor: activeProject?.theme?.border }}>
                <table className="w-full text-[9px] border-collapse">
                   <thead>
                      <tr className="uppercase font-black text-white" style={{ backgroundColor: activeProject?.theme?.headerBg, color: activeProject?.theme?.headerText }}>
                         {/* WBS Removed for print as requested */}
                         <th className="p-3 text-left">Discriminação dos Serviços</th>
                         <th className="p-3 text-center w-12">Und</th>
                         <th className="p-3 text-right w-24">Qtd Contrat.</th>
                         <th className="p-3 text-right w-28">Preço Unit.</th>
                         <th className="p-3 text-right w-32">Total Período</th>
                         <th className="p-3 text-right w-32">Total Acumul.</th>
                         <th className="p-3 text-center w-16">% Acum.</th>
                      </tr>
                   </thead>
                   <tbody>
                      {printFlattenedList.map(item => (
                         <tr key={item.id} className="border-b" style={{ 
                            backgroundColor: item.type === 'category' ? activeProject?.theme?.rowCategory : '#ffffff',
                            borderColor: activeProject?.theme?.border 
                         }}>
                            <td className="p-2 font-bold uppercase" style={{ paddingLeft: `${item.depth * 15 + 8}px`, color: item.type === 'category' ? activeProject?.theme?.primary : '#334155' }}>
                               {item.name}
                            </td>
                            <td className="p-2 text-center uppercase text-slate-400 font-bold">{item.unit || '-'}</td>
                            <td className="p-2 text-right font-mono">{item.type === 'item' ? item.contractQuantity : '-'}</td>
                            <td className="p-2 text-right font-mono">{item.type === 'item' ? financial.formatBRL(item.unitPrice) : '-'}</td>
                            <td className="p-2 text-right font-bold">{financial.formatBRL(item.currentTotal)}</td>
                            <td className="p-2 text-right font-bold">{financial.formatBRL(item.accumulatedTotal)}</td>
                            <td className="p-2 text-center font-black text-slate-600">{item.accumulatedPercentage}%</td>
                         </tr>
                      ))}
                   </tbody>
                   <tfoot>
                      <tr className="text-white font-black" style={{ backgroundColor: activeProject?.theme?.rowTotal }}>
                         <td colSpan={4} className="p-4 text-right uppercase tracking-widest">Totais Consolidados:</td>
                         <td className="p-4 text-right text-base">{financial.formatBRL(stats.current)}</td>
                         <td className="p-4 text-right text-base">{financial.formatBRL(stats.accumulated)}</td>
                         <td className="p-4 text-center text-base">{stats.progress.toFixed(1)}%</td>
                      </tr>
                   </tfoot>
                </table>
            </div>

            <div className="mt-16 grid grid-cols-2 gap-20 text-center">
               <div className="border-t-2 border-slate-900 pt-4">
                  <p className="text-xs font-black uppercase tracking-widest">Responsável Técnico</p>
                  <p className="text-[10px] text-slate-500 font-bold">Assinatura e CREA</p>
               </div>
               <div className="border-t-2 border-slate-900 pt-4">
                  <p className="text-xs font-black uppercase tracking-widest">Fiscalização / Cliente</p>
                  <p className="text-[10px] text-slate-500 font-bold">Assinatura e Identificação</p>
               </div>
            </div>
        </div>
      </div>

      <WorkItemModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveWorkItem} editingItem={editingItem} type={modalType} categories={activeProject?.items.filter(i => i.type === 'category') || []} />

      {importSummary && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[40px] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-10 space-y-8">
               <div className="flex items-center gap-6">
                  <div className={`p-5 rounded-[32px] ${importSummary.errors.length > 0 ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>{importSummary.errors.length > 0 ? <AlertTriangle size={40}/> : <Layers size={40}/>}</div>
                  <div><h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Análise de Importação</h3><div className="flex gap-2 mt-1"><span className="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-[10px] font-black px-2 py-1 rounded-lg">{importSummary.stats.categories} Grupos</span><span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 text-[10px] font-black px-2 py-1 rounded-lg">{importSummary.stats.items} Serviços</span></div></div>
               </div>
               {importSummary.errors.length > 0 ? (
                 <div className="bg-rose-50 dark:bg-rose-950/30 p-6 rounded-3xl border border-rose-100 dark:border-rose-900/50 max-h-60 overflow-y-auto">
                    <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-3">Erros Detectados:</p>
                    <ul className="space-y-2">{importSummary.errors.map((err, i) => <li key={i} className="text-xs text-rose-800 dark:text-rose-300 font-bold flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 flex-shrink-0" />{err}</li>)}</ul>
                 </div>
               ) : (
                 <div className="bg-blue-50 dark:bg-blue-900/20 p-8 rounded-[32px] border border-blue-100 dark:border-blue-900/30 text-center"><CheckCircle2 size={32} className="text-blue-600 mx-auto mb-2"/><p className="text-lg font-black text-slate-800 dark:text-white">Estrutura Validada!</p><p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Os {importSummary.items.length} elementos foram mapeados corretamente.</p></div>
               )}
               <div className="flex gap-4"><button onClick={() => setImportSummary(null)} className="flex-1 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Cancelar</button><button disabled={importSummary.errors.length > 0} onClick={confirmImport} className={`flex-1 py-4 text-[10px] font-black text-white uppercase tracking-widest rounded-2xl ${importSummary.errors.length > 0 ? 'bg-slate-300' : 'bg-blue-600 shadow-xl shadow-blue-500/20'}`}>Confirmar e Gerar EAP</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SidebarItem = ({ active, onClick, icon, label, open }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
    <div className="flex-shrink-0">{icon}</div>
    {open && <span className="text-[11px] font-black uppercase tracking-widest truncate text-left">{label}</span>}
  </button>
);

const KpiCard = ({ label, value, icon, progress, color, highlight = false }: any) => {
  const c: any = { slate: 'text-slate-900 dark:text-white', blue: 'text-blue-600 dark:text-blue-400', emerald: 'text-emerald-600 dark:text-emerald-400', rose: 'text-rose-600 dark:text-rose-400' };
  return (
    <div className={`p-6 rounded-[32px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 ${highlight ? 'ring-4 ring-blue-500/10' : ''}`}>
      <div className="flex justify-between items-center mb-4"><div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">{icon}</div><span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</span></div>
      <p className={`text-2xl font-black tracking-tighter ${c[color]}`}>{value}</p>
      <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full mt-3 overflow-hidden"><div className="h-full bg-current opacity-60 transition-all duration-1000" style={{ width: `${Math.min(100, progress)}%` }} /></div>
    </div>
  );
};

const PrintKpi = ({ label, value, primary = false, themeColor }: any) => (
  <div className={`p-4 rounded-2xl border-2 ${primary ? 'bg-slate-50' : 'border-slate-100'}`} style={{ borderColor: primary ? (themeColor || '#0f172a') : '#f1f5f9' }}>
    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{label}</p>
    <p className={`text-xl font-black tracking-tight ${primary ? 'text-slate-900' : 'text-slate-600'}`}>{value}</p>
  </div>
);

export default App;
