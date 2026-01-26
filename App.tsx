
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
  Printer,
  Palette,
  Trash2,
  Edit2,
  Percent,
  Download,
  CheckCircle,
  Lock
} from 'lucide-react';

const App: React.FC = () => {
  // --- Estados do Sistema ---
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'wbs' | 'branding'>('wbs');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  
  // --- Estados de Modais ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ItemType>('item');
  const [editingItem, setEditingItem] = useState<WorkItem | null>(null);
  const [targetParentId, setTargetParentId] = useState<string | null>(null);
  
  const [renameModal, setRenameModal] = useState({ isOpen: false, id: '', name: '' });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: '' });
  const [closeMeasurementModal, setCloseMeasurementModal] = useState(false);
  const [importSummary, setImportSummary] = useState<ImportResult | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Persistência e Inicialização ---
  useEffect(() => {
    const saved = localStorage.getItem('promeasure_v4_projects');
    if (saved) {
      const parsed = JSON.parse(saved);
      setProjects(parsed);
      if (parsed.length > 0) setActiveProjectId(parsed[0].id);
    } else {
      handleCreateProject('Residencial Vista Mar');
    }
    const savedDark = localStorage.getItem('pro_measure_dark_mode');
    if (savedDark === 'true') setIsDarkMode(true);
  }, []);

  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem('promeasure_v4_projects', JSON.stringify(projects));
    }
  }, [projects]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('pro_measure_dark_mode', isDarkMode.toString());
  }, [isDarkMode]);

  // --- Memos de Dados ---
  const activeProject = useMemo(() => 
    projects.find(p => p.id === activeProjectId) || null
  , [projects, activeProjectId]);

  const processedTree = useMemo(() => {
    if (!activeProject) return [];
    const tree = treeService.buildTree(activeProject.items);
    return tree.map((root, idx) => treeService.processRecursive(root, '', idx, activeProject.bdi));
  }, [activeProject]);

  const flattenedList = useMemo(() => 
    treeService.flattenTree(processedTree, expandedIds)
  , [processedTree, expandedIds]);

  const printFlattenedList = useMemo(() => {
    if (!activeProject) return [];
    const allCategoryIds = new Set<string>(activeProject.items.filter(i => i.type === 'category').map(i => i.id));
    return treeService.flattenTree(processedTree, allCategoryIds);
  }, [processedTree, activeProject]);

  const stats = useMemo(() => {
    const totals = {
      contract: financial.sum(processedTree.map(n => n.contractTotal || 0)),
      current: financial.sum(processedTree.map(n => n.currentTotal || 0)),
      accumulated: financial.sum(processedTree.map(n => n.accumulatedTotal || 0)),
      balance: financial.sum(processedTree.map(n => n.balanceTotal || 0)),
    };
    return { ...totals, progress: totals.contract > 0 ? (totals.accumulated / totals.contract) * 100 : 0 };
  }, [processedTree]);

  // --- Handlers de Projeto ---
  const handleCreateProject = (name: string) => {
    const newProj: Project = {
      id: crypto.randomUUID(),
      name,
      companyName: 'Engenharia & Construções S.A.',
      measurementNumber: 1,
      referenceDate: new Date().toLocaleDateString('pt-BR'),
      logo: null,
      items: [],
      theme: { ...DEFAULT_THEME },
      bdi: 25,
      config: { strict: false, printCards: true, printSubtotals: true }
    };
    setProjects(prev => [...prev, newProj]);
    setActiveProjectId(newProj.id);
    setActiveTab('wbs');
  };

  const updateActiveProject = (data: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === activeProjectId ? { ...p, ...data } : p));
  };

  const handleConfirmRename = () => {
    if (!renameModal.name.trim()) return;
    setProjects(prev => prev.map(p => p.id === renameModal.id ? { ...p, name: renameModal.name.trim() } : p));
    setRenameModal({ isOpen: false, id: '', name: '' });
  };

  const handleConfirmDelete = () => {
    const remaining = projects.filter(p => p.id !== deleteModal.id);
    setProjects(remaining);
    if (activeProjectId === deleteModal.id) {
      setActiveProjectId(remaining.length > 0 ? remaining[0].id : null);
    }
    setDeleteModal({ isOpen: false, id: '' });
  };

  /**
   * Executa o fechamento da medição atual.
   * Transfere o Corrente para o Anterior e limpa o Corrente.
   */
  const handleFinalizeMeasurement = () => {
    if (!activeProject) return;

    const newItems = activeProject.items.map(item => {
      if (item.type === 'item') {
        const newPreviousQty = (item.previousQuantity || 0) + (item.currentQuantity || 0);
        return {
          ...item,
          previousQuantity: newPreviousQty,
          currentQuantity: 0,
          currentPercentage: 0
        };
      }
      return item;
    });

    updateActiveProject({
      items: newItems,
      measurementNumber: (activeProject.measurementNumber || 1) + 1,
      referenceDate: new Date().toLocaleDateString('pt-BR')
    });

    setCloseMeasurementModal(false);
  };

  // --- Handlers de Itens ---
  const handleSaveWorkItem = (data: Partial<WorkItem>) => {
    if (!activeProject) return;
    if (editingItem) {
      updateActiveProject({ 
        items: activeProject.items.map(it => it.id === editingItem.id ? { ...it, ...data } : it) 
      });
    } else {
      const parentId = targetParentId || data.parentId || null;
      const newItem: WorkItem = {
        id: crypto.randomUUID(),
        parentId,
        name: data.name || 'Novo Item',
        type: data.type || modalType,
        wbs: '',
        order: activeProject.items.filter(i => i.parentId === parentId).length,
        unit: data.unit || 'un',
        contractQuantity: data.contractQuantity || 0,
        unitPrice: 0, 
        unitPriceNoBdi: data.unitPriceNoBdi || 0,
        contractTotal: 0,
        previousQuantity: 0, previousTotal: 0, currentQuantity: 0, currentTotal: 0, currentPercentage: 0,
        accumulatedQuantity: 0, accumulatedTotal: 0, accumulatedPercentage: 0, balanceQuantity: 0, balanceTotal: 0
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
      alert("Erro ao ler arquivo Excel.");
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden text-slate-900 dark:text-slate-100">
      <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx, .xls" onChange={handleFileUpload} />
      
      {/* Estilos para isolamento da impressão */}
      <style>{`
        @media screen { 
          .print-only { display: none !important; } 
        }
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; width: 100%; }
          body { background: white !important; color: black !important; }
          @page { margin: 1.5cm; size: A4 landscape; }
        }
      `}</style>

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-80' : 'w-20'} bg-slate-900 text-white flex flex-col transition-all duration-300 z-50 no-print border-r border-slate-800 shrink-0`}>
        <div className="p-6 flex items-center gap-4 border-b border-slate-800 h-20 shrink-0">
          <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shrink-0"><HardHat size={20} /></div>
          {sidebarOpen && (
            <div className="flex flex-col">
              <span className="text-md font-black tracking-tighter uppercase">PROMEASURE</span>
              <span className="text-[8px] font-bold text-blue-400 uppercase tracking-widest">Enterprise ERP</span>
            </div>
          )}
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          <SidebarItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={18}/>} label="Dashboard" open={sidebarOpen} />
          <SidebarItem active={activeTab === 'wbs'} onClick={() => setActiveTab('wbs')} icon={<Layers size={18}/>} label="Planilha EAP" open={sidebarOpen} />
          <SidebarItem active={activeTab === 'branding'} onClick={() => setActiveTab('branding')} icon={<Palette size={18}/>} label="Configurações" open={sidebarOpen} />
          
          <div className="pt-8 pb-3 px-2">
            <div className="flex items-center justify-between">
              {sidebarOpen && <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Meus Projetos</h3>}
              <button onClick={() => handleCreateProject('Nova Obra')} className="text-blue-500 hover:text-white transition-all"><PlusCircle size={16} /></button>
            </div>
          </div>

          <div className="space-y-1">
            {projects.map(p => (
              <div key={p.id} className="group relative">
                <button 
                  onClick={() => { setActiveProjectId(p.id); setActiveTab('wbs'); }} 
                  className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all relative ${p.id === activeProjectId ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}
                >
                  <Briefcase size={16} className="shrink-0" />
                  {sidebarOpen && <span className="text-[10px] font-black uppercase tracking-widest truncate pr-10">{p.name}</span>}
                  {sidebarOpen && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <div className="p-1 hover:bg-white/20 rounded-md" onClick={(e) => { e.stopPropagation(); setRenameModal({isOpen: true, id: p.id, name: p.name}); }}><Edit2 size={12} /></div>
                      <div className="p-1 hover:bg-rose-500/50 rounded-md" onClick={(e) => { e.stopPropagation(); setDeleteModal({isOpen: true, id: p.id}); }}><Trash2 size={12} /></div>
                    </div>
                  )}
                </button>
              </div>
            ))}
          </div>
        </nav>
        
        <div className="p-4 border-t border-slate-800 shrink-0">
           <SidebarItem active={false} onClick={() => setIsDarkMode(!isDarkMode)} icon={isDarkMode ? <Sun size={18}/> : <Moon size={18}/>} label={isDarkMode ? "Modo Claro" : "Modo Escuro"} open={sidebarOpen} />
        </div>
      </aside>

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative no-print">
        <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 shrink-0 z-20 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"><Menu size={20} /></button>
            {activeProject && (
              <div className="flex flex-col">
                <h2 className="text-md font-black tracking-tight uppercase truncate max-w-xs md:max-w-md">{activeProject.name}</h2>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-blue-500 font-black uppercase tracking-widest">Medição #{activeProject.measurementNumber}</span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">• BDI {activeProject.bdi}%</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
             <button 
                disabled={stats.current <= 0}
                onClick={() => setCloseMeasurementModal(true)} 
                className={`flex items-center gap-2 px-4 py-2.5 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-lg transition-all active:scale-95 ${stats.current > 0 ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20' : 'bg-slate-300 cursor-not-allowed opacity-50'}`}
             >
                <Lock size={14} /> Fechar Medição
             </button>
             <button onClick={() => excelService.exportProjectToExcel(activeProject!, printFlattenedList)} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-lg transition-all active:scale-95">
                <Download size={14} /> Excel
             </button>
             <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all">
                <Printer size={14} /> PDF
             </button>
             <button onClick={() => { setTargetParentId(null); setModalType('item'); setEditingItem(null); setIsModalOpen(true); }} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl transition-all active:scale-95">
                <Plus size={14} /> Novo
             </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-8 pb-20">
            {activeTab === 'dashboard' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <KpiCard label="Contrato Total" value={financial.formatBRL(stats.contract)} icon={<Briefcase size={16}/>} progress={100} color="slate" />
                <KpiCard label="Medição Período" value={financial.formatBRL(stats.current)} icon={<TrendingUp size={16}/>} progress={stats.progress} color="blue" highlight />
                <KpiCard label="Acumulado" value={financial.formatBRL(stats.accumulated)} icon={<PieChart size={16}/>} progress={stats.progress} color="emerald" />
                <KpiCard label="Saldo Obra" value={financial.formatBRL(stats.balance)} icon={<Database size={16}/>} progress={100 - stats.progress} color="rose" />
              </div>
            )}

            {activeTab === 'wbs' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <button onClick={() => excelService.downloadTemplate()} className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[9px] font-black uppercase tracking-widest rounded-xl hover:border-blue-400 transition-all"><FileSpreadsheet size={14} /> Baixar Template</button>
                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-100 transition-all"><UploadCloud size={14} /> Importar Planilha</button>
                  </div>
                  <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input placeholder="Filtrar por nome ou WBS..." className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 pl-11 pr-4 py-3 rounded-2xl text-xs outline-none focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  </div>
                </div>
                
                <TreeTable 
                  data={flattenedList} expandedIds={expandedIds} 
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
              <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl max-w-4xl mx-auto">
                   <div className="flex items-center gap-4 mb-8">
                      <div className="p-3 bg-emerald-600 rounded-2xl text-white shadow-lg shadow-emerald-500/20"><Percent size={20} /></div>
                      <div>
                        <h3 className="text-lg font-black tracking-tight">Taxa de BDI</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Incidência financeira global sobre custos base</p>
                      </div>
                   </div>
                   <div className="flex flex-col sm:flex-row items-center gap-6 max-w-lg">
                      <div className="flex-1 w-full">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Percentual (%)</label>
                         <input 
                            type="number" 
                            className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-2xl font-black focus:border-emerald-500 outline-none transition-all"
                            value={activeProject.bdi}
                            onChange={(e) => updateActiveProject({ bdi: parseFloat(e.target.value) || 0 })}
                         />
                      </div>
                      <div className="flex-1 w-full p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 text-center">
                         <p className="text-[8px] font-black text-slate-400 uppercase mb-1 tracking-widest">Fator Multiplicador</p>
                         <p className="text-3xl font-black text-emerald-600">{(1 + activeProject.bdi/100).toFixed(2)}x</p>
                      </div>
                   </div>
                </div>
                <ThemeEditor theme={activeProject.theme} onChange={(theme: PDFTheme) => updateActiveProject({ theme })} />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* --- Visão de Impressão --- */}
      <div className="print-only p-12 bg-white text-black w-full min-h-screen">
          <div className="flex justify-between items-start border-b-4 pb-8 mb-8" style={{ borderColor: activeProject?.theme?.primary }}>
             <div className="space-y-1">
                <h1 className="text-3xl font-black uppercase tracking-tighter">{activeProject?.companyName}</h1>
                <h2 className="text-lg font-bold text-slate-500">Relatório de Medição de Obras</h2>
             </div>
             <div className="text-right space-y-1">
                <p className="text-2xl font-black text-slate-800">{activeProject?.name}</p>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">BDI: {activeProject?.bdi}% • Medição: #{activeProject?.measurementNumber}</p>
             </div>
          </div>
          
          <table className="w-full text-[10px] border-collapse">
             <thead>
               <tr className="uppercase font-black text-white" style={{ backgroundColor: activeProject?.theme?.headerBg }}>
                 <th className="p-3 border border-slate-300 text-left">WBS</th>
                 <th className="p-3 border border-slate-300 text-left">Descrição do Serviço</th>
                 <th className="p-3 border border-slate-300 text-center w-12">Und</th>
                 <th className="p-3 border border-slate-300 text-right w-24">Qtd Contrato</th>
                 <th className="p-3 border border-slate-300 text-right w-28">P. Unitário</th>
                 <th className="p-3 border border-slate-300 text-right w-32">Período</th>
                 <th className="p-3 border border-slate-300 text-right w-32">Acumulado</th>
                 <th className="p-3 border border-slate-300 text-center w-16">%</th>
               </tr>
             </thead>
             <tbody>
               {printFlattenedList.map(item => (
                 <tr key={item.id} className="border border-slate-300" style={{ backgroundColor: item.type === 'category' ? activeProject?.theme?.rowCategory : 'white' }}>
                   <td className="p-2 border border-slate-300 font-mono text-slate-500">{item.wbs}</td>
                   <td className={`p-2 border border-slate-300 font-bold ${item.type === 'category' ? 'uppercase' : ''}`} style={{ paddingLeft: `${item.depth * 15 + 8}px`, color: item.type === 'category' ? activeProject?.theme?.primary : 'inherit' }}>{item.name}</td>
                   <td className="p-2 border border-slate-300 text-center uppercase font-bold text-slate-400">{item.unit || '-'}</td>
                   <td className="p-2 border border-slate-300 text-right">{item.type === 'item' ? item.contractQuantity : '-'}</td>
                   <td className="p-2 border border-slate-300 text-right">{item.type === 'item' ? financial.formatBRL(item.unitPrice) : '-'}</td>
                   <td className="p-2 border border-slate-300 text-right font-black">{financial.formatBRL(item.currentTotal)}</td>
                   <td className="p-2 border border-slate-300 text-right font-black">{financial.formatBRL(item.accumulatedTotal)}</td>
                   <td className="p-2 border border-slate-300 text-center font-black">{item.accumulatedPercentage}%</td>
                 </tr>
               ))}
               <tr className="bg-slate-900 text-white font-black">
                 <td colSpan={5} className="p-4 text-right uppercase tracking-widest">Totais da Obra:</td>
                 <td className="p-4 text-right border-l border-white/20">{financial.formatBRL(stats.current)}</td>
                 <td className="p-4 text-right border-l border-white/20">{financial.formatBRL(stats.accumulated)}</td>
                 <td className="p-4 text-center border-l border-white/20">{stats.progress.toFixed(1)}%</td>
               </tr>
             </tbody>
          </table>
      </div>

      {/* --- Modais --- */}
      <WorkItemModal 
        isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveWorkItem} 
        editingItem={editingItem} type={modalType} categories={activeProject?.items.filter(i => i.type === 'category') || []} 
        projectBdi={activeProject?.bdi || 0} 
      />

      {/* Modal de Fechamento de Medição */}
      {closeMeasurementModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl border border-white/10">
              <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner"><Lock size={36} /></div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2 text-center uppercase tracking-tight">Fechar Medição Atual?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 font-medium text-center leading-relaxed px-4">
                Esta ação irá transferir os valores de <strong>{financial.formatBRL(stats.current)}</strong> do período corrente para o histórico acumulado e incrementará o número da medição para <strong>#{activeProject!.measurementNumber + 1}</strong>. Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-4">
                <button onClick={() => setCloseMeasurementModal(false)} className="flex-1 py-4 text-xs font-black uppercase text-slate-500 hover:text-slate-800 transition-colors">Cancelar</button>
                <button onClick={handleFinalizeMeasurement} className="flex-2 py-5 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase shadow-xl shadow-indigo-500/20 active:scale-95 transition-all tracking-widest">Confirmar Fechamento</button>
              </div>
           </div>
        </div>
      )}

      {renameModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl border border-white/10">
              <h3 className="text-xl font-black mb-6 uppercase tracking-tight flex items-center gap-3"><Edit2 size={20} className="text-blue-500" /> Renomear Projeto</h3>
              <input 
                autoFocus className="w-full px-6 py-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold mb-8 outline-none focus:ring-4 focus:ring-blue-500/10" 
                value={renameModal.name} 
                onChange={e => setRenameModal({...renameModal, name: e.target.value})} 
                onKeyDown={e => e.key === 'Enter' && handleConfirmRename()}
              />
              <div className="flex gap-3">
                <button onClick={() => setRenameModal({isOpen: false, id: '', name: ''})} className="flex-1 py-4 text-xs font-black uppercase text-slate-400 hover:text-slate-600 transition-colors">Cancelar</button>
                <button onClick={handleConfirmRename} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase shadow-xl shadow-blue-500/20 active:scale-95 transition-all">Salvar</button>
              </div>
           </div>
        </div>
      )}

      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] p-10 shadow-2xl text-center border border-white/10">
              <div className="w-20 h-20 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner"><Trash2 size={36} /></div>
              <h3 className="text-xl font-black mb-2 tracking-tight">Excluir projeto?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-10 font-bold leading-relaxed">Esta ação removerá permanentemente todos os serviços e medições deste empreendimento.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteModal({isOpen: false, id: ''})} className="flex-1 py-4 text-xs font-black uppercase text-slate-400 hover:text-slate-600 transition-colors">Cancelar</button>
                <button onClick={handleConfirmDelete} className="flex-1 py-4 bg-rose-600 text-white rounded-2xl text-xs font-black uppercase shadow-xl shadow-rose-500/20 active:scale-95 transition-all">Sim, Excluir</button>
              </div>
           </div>
        </div>
      )}

      {importSummary && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[3rem] p-12 shadow-2xl border border-white/5">
            <div className="flex items-center gap-6 mb-10 text-emerald-500">
              <div className="p-5 bg-emerald-500/10 rounded-[2rem]"><CheckCircle2 size={56} /></div>
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tight text-slate-800 dark:text-white">Planilha Validada</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Análise de estrutura concluída com sucesso</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-12">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-3xl border border-blue-100 dark:border-blue-800 text-center">
                <p className="text-[20px] font-black text-blue-600">{importSummary.stats.categories}</p>
                <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Grupos / Etapas</p>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-800 text-center">
                <p className="text-[20px] font-black text-emerald-600">{importSummary.stats.items}</p>
                <p className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Serviços / Itens</p>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setImportSummary(null)} className="flex-1 py-5 text-xs font-black uppercase text-slate-500 hover:text-slate-800 transition-colors tracking-widest">Descartar</button>
              <button onClick={() => { updateActiveProject({ items: [...activeProject!.items, ...importSummary.items] }); setImportSummary(null); }} className="flex-2 py-5 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase shadow-xl shadow-emerald-500/20 active:scale-95 transition-all tracking-widest">Importar Agora</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SidebarItem = ({ active, onClick, icon, label, open }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 p-3.5 rounded-2xl transition-all ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
    <div className="shrink-0">{icon}</div>
    {open && <span className="text-[10px] font-black uppercase tracking-widest truncate text-left">{label}</span>}
  </button>
);

const KpiCard = ({ label, value, icon, progress, color, highlight = false }: any) => {
  const c: any = { 
    slate: 'text-slate-900 dark:text-white', 
    blue: 'text-blue-600 dark:text-blue-400', 
    emerald: 'text-emerald-600 dark:text-emerald-400', 
    rose: 'text-rose-600 dark:text-rose-400' 
  };
  return (
    <div className={`p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-xl ${highlight ? 'ring-4 ring-blue-500/10' : ''}`}>
      <div className="flex justify-between items-center mb-5">
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-slate-400">{icon}</div>
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</span>
      </div>
      <p className={`text-2xl font-black tracking-tighter ${c[color]}`}>{value}</p>
      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-4 overflow-hidden">
        <div className="h-full bg-current opacity-60 transition-all duration-1000" style={{ width: `${Math.min(100, progress)}%` }} />
      </div>
    </div>
  );
};

export default App;
