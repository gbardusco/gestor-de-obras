
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { WorkItem, PDFTheme, DEFAULT_THEME, ItemType, Project } from './types';
import { treeService } from './services/treeService';
import { excelService, ImportResult } from './services/excelService';
import { TreeTable } from './components/TreeTable';
import { ThemeEditor } from './components/ThemeEditor';
import { WorkItemModal } from './components/WorkItemModal';
import { financial } from './utils/math';
import { 
  Plus, 
  Download, 
  FileText, 
  Settings, 
  LayoutDashboard,
  TrendingUp,
  ShieldCheck,
  Database,
  Moon,
  Sun,
  HardHat,
  Search,
  Eraser,
  Trash2,
  Image as ImageIcon,
  FolderOpen,
  PlusCircle,
  FileSpreadsheet,
  ChevronRight,
  Menu,
  Briefcase,
  PieChart,
  Layers,
  LogOut,
  AlertTriangle,
  CheckCircle2,
  UploadCloud,
  X,
  Package
} from 'lucide-react';

const App: React.FC = () => {
  // Navigation & Persistence
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'wbs' | 'pdf'>('wbs');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Tree Logic State
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  
  // Modal Control
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ItemType>('item');
  const [editingItem, setEditingItem] = useState<WorkItem | null>(null);
  const [targetParentId, setTargetParentId] = useState<string | null>(null);
  
  // Import State
  const [importSummary, setImportSummary] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialization
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

  // Sync
  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem('promeasure_v3_projects', JSON.stringify(projects));
    }
  }, [projects]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('pro_measure_dark_mode', isDarkMode.toString());
  }, [isDarkMode]);

  // Derived Project State
  const activeProject = useMemo(() => {
    return projects.find(p => p.id === activeProjectId) || null;
  }, [projects, activeProjectId]);

  const processedTree = useMemo(() => {
    if (!activeProject) return [];
    const tree = treeService.buildTree(activeProject.items);
    return tree.map(root => treeService.processRecursive(root));
  }, [activeProject]);

  const flattenedList = useMemo(() => {
    return treeService.flattenTree(processedTree, expandedIds);
  }, [processedTree, expandedIds]);

  const stats = useMemo(() => {
    const rootNodes = processedTree;
    const totals = {
      contract: financial.sum(rootNodes.map(n => n.contractTotal)),
      previous: financial.sum(rootNodes.map(n => n.previousTotal)),
      current: financial.sum(rootNodes.map(n => n.currentTotal)),
      accumulated: financial.sum(rootNodes.map(n => n.accumulatedTotal)),
      balance: financial.sum(rootNodes.map(n => n.balanceTotal)),
    };
    return {
      ...totals,
      progress: totals.contract > 0 ? (totals.accumulated / totals.contract) * 100 : 0
    };
  }, [processedTree]);

  // Project Management Handlers
  const createNewProject = (name: string) => {
    const newProj: Project = {
      id: crypto.randomUUID(),
      name,
      companyName: 'Engenharia Ltda.',
      measurementNumber: 1,
      referenceDate: new Date().toLocaleDateString('pt-BR'),
      logo: null,
      items: [],
      config: { strict: false, printCards: true, printSubtotals: true }
    };
    setProjects(prev => [...prev, newProj]);
    setActiveProjectId(newProj.id);
  };

  const updateActiveProject = (data: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === activeProjectId ? { ...p, ...data } : p));
  };

  const deleteProject = (id: string) => {
    if (projects.length <= 1) return alert("Mínimo de um projeto necessário.");
    if (!confirm("Excluir projeto permanentemente?")) return;
    const remaining = projects.filter(p => p.id !== id);
    setProjects(remaining);
    setActiveProjectId(remaining[0].id);
  };

  // Tree Controls
  const handleExpandAll = () => {
    const allIds = new Set(activeProject?.items.filter(i => i.type === 'category').map(i => i.id));
    setExpandedIds(allIds);
  };

  const handleCollapseAll = () => {
    setExpandedIds(new Set());
  };

  const handleToggle = (id: string) => {
    const next = new Set(expandedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpandedIds(next);
  };

  // Item Handlers
  const handleUpdateQuantity = (id: string, qty: number) => {
    if (!activeProject) return;
    updateActiveProject({
      items: activeProject.items.map(it => it.id === id ? { ...it, currentQuantity: qty } : it)
    });
  };

  const handleUpdatePercentage = (id: string, pct: number) => {
    if (!activeProject) return;
    updateActiveProject({
      items: activeProject.items.map(it => {
        if (it.id === id) {
          const qty = financial.round((pct / 100) * it.contractQuantity);
          return { ...it, currentQuantity: qty, currentPercentage: pct };
        }
        return it;
      })
    });
  };

  const handleSaveWorkItem = (data: Partial<WorkItem>) => {
    if (!activeProject) return;
    if (editingItem) {
      updateActiveProject({
        items: activeProject.items.map(it => it.id === editingItem.id ? { ...it, ...data } : it)
      });
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
      alert("Erro ao importar: " + err);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const confirmImport = () => {
    if (!importSummary || !activeProject) return;
    updateActiveProject({ items: [...activeProject.items, ...importSummary.items] });
    setImportSummary(null);
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx, .xls" onChange={handleFileUpload} />
      
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-80' : 'w-20'} bg-slate-900 text-white flex flex-col transition-all duration-300 z-50 shadow-2xl no-print`}>
        <div className="p-6 flex items-center gap-4 border-b border-slate-800">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
            <HardHat size={24} className="text-white" />
          </div>
          {sidebarOpen && (
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tighter">PROMEASURE</span>
              <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">WBS System</span>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          <section>
            {sidebarOpen && <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 px-2">Navegação</h3>}
            <div className="space-y-1">
              <SidebarItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={18}/>} label="Dashboard" open={sidebarOpen} />
              <SidebarItem active={activeTab === 'wbs'} onClick={() => setActiveTab('wbs')} icon={<Layers size={18}/>} label="Planilha EAP" open={sidebarOpen} />
              <SidebarItem active={activeTab === 'pdf'} onClick={() => setActiveTab('pdf')} icon={<Settings size={18}/>} label="Configurações" open={sidebarOpen} />
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between px-2 mb-4">
              {sidebarOpen && <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Meus Projetos</h3>}
              <button onClick={() => createNewProject('Novo Projeto')} className="text-blue-500 hover:text-white transition-colors">
                <PlusCircle size={16} />
              </button>
            </div>
            <div className="space-y-1">
              {projects.map(p => (
                <SidebarItem 
                  key={p.id} 
                  active={p.id === activeProjectId} 
                  onClick={() => setActiveProjectId(p.id)} 
                  icon={<Briefcase size={18}/>} 
                  label={p.name} 
                  open={sidebarOpen}
                  onDelete={() => deleteProject(p.id)}
                />
              ))}
            </div>
          </section>
        </nav>

        <div className="p-4 border-t border-slate-800">
           <SidebarItem 
              active={false} 
              onClick={() => setIsDarkMode(!isDarkMode)} 
              icon={isDarkMode ? <Sun size={18}/> : <Moon size={18}/>} 
              label={isDarkMode ? "Light Mode" : "Dark Mode"} 
              open={sidebarOpen} 
            />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 no-print shadow-sm z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
              <Menu size={20} />
            </button>
            {activeProject && (
              <div className="flex flex-col">
                <h2 className="text-lg font-black text-slate-800 dark:text-white leading-tight uppercase tracking-tight">{activeProject.name}</h2>
                <span className="text-[10px] text-blue-500 font-black uppercase tracking-widest">Medição #{activeProject.measurementNumber} — Ativa</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => { setTargetParentId(null); setModalType('item'); setEditingItem(null); setIsModalOpen(true); }}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-95"
            >
               <Plus size={16} /> Novo Registro
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50 dark:bg-slate-950">
          <div className="max-w-[1750px] mx-auto space-y-8 pb-20">
            
            {activeTab === 'dashboard' && (
              <div className="grid grid-cols-5 gap-6 animate-in slide-in-from-top-2 duration-500">
                <KpiCard label="Contrato Total" value={financial.formatBRL(stats.contract)} icon={<Briefcase size={16}/>} progress={100} color="slate" />
                <KpiCard label="Medição Período" value={financial.formatBRL(stats.current)} icon={<TrendingUp size={16}/>} progress={stats.progress} color="blue" highlight />
                <KpiCard label="Acumulado" value={financial.formatBRL(stats.accumulated)} icon={<PieChart size={16}/>} progress={stats.progress} color="emerald" />
                <KpiCard label="Saldo Obra" value={financial.formatBRL(stats.balance)} icon={<Database size={16}/>} progress={100 - stats.progress} color="rose" />
                <KpiCard label="Progresso" value={`${stats.progress.toFixed(1)}%`} icon={<Layers size={16}/>} progress={stats.progress} color="indigo" />
              </div>
            )}

            {activeTab === 'wbs' && (
              <div className="space-y-6 animate-in fade-in duration-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => excelService.downloadTemplate()}
                      className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all hover:border-blue-400"
                    >
                      <FileSpreadsheet size={16} /> Baixar Template
                    </button>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-5 py-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all hover:bg-emerald-100"
                    >
                      <UploadCloud size={16} /> Importar Planilha
                    </button>
                  </div>
                  <div className="relative w-96 hidden lg:block">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      placeholder="Pesquisar itens..."
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 pl-11 pr-4 py-3 rounded-2xl text-xs focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <TreeTable 
                  data={flattenedList}
                  expandedIds={expandedIds}
                  onToggle={handleToggle}
                  onExpandAll={handleExpandAll}
                  onCollapseAll={handleCollapseAll}
                  onDelete={(id) => {
                    if (confirm("Deseja remover este elemento e todos os sub-itens associados?")) {
                      updateActiveProject({
                        items: activeProject?.items.filter(i => i.id !== id && i.parentId !== id) || []
                      });
                    }
                  }}
                  onUpdateQuantity={handleUpdateQuantity}
                  onUpdatePercentage={handleUpdatePercentage}
                  onAddChild={(pid, type) => { setTargetParentId(pid); setModalType(type); setEditingItem(null); setIsModalOpen(true); }}
                  onEdit={(item) => { setEditingItem(item); setModalType(item.type); setIsModalOpen(true); }}
                  searchQuery={searchQuery}
                />
              </div>
            )}

            {activeTab === 'pdf' && (
              <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
                <ThemeEditor theme={DEFAULT_THEME} onChange={() => {}} />
              </div>
            )}
          </div>
        </main>
      </div>

      <WorkItemModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveWorkItem}
        editingItem={editingItem}
        type={modalType}
        categories={activeProject?.items.filter(i => i.type === 'category') || []}
      />

      {/* Import Modal */}
      {importSummary && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[40px] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
            <div className="p-10 space-y-8">
               <div className="flex items-center gap-6">
                  <div className={`p-5 rounded-[32px] ${importSummary.errors.length > 0 ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'} shadow-lg`}>
                    {importSummary.errors.length > 0 ? <AlertTriangle size={40}/> : <Layers size={40}/>}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Verificação de Importação</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest">{importSummary.stats.categories} Categorias</span>
                      <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest">{importSummary.stats.items} Itens</span>
                    </div>
                  </div>
               </div>

               {importSummary.errors.length > 0 ? (
                 <div className="space-y-4">
                    <div className="bg-rose-50 dark:bg-rose-950/30 p-6 rounded-3xl border border-rose-100 dark:border-rose-900/50 max-h-72 overflow-y-auto custom-scrollbar">
                      <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-4 flex items-center gap-2"><X size={12}/> Inconsistências Detectadas:</p>
                      <ul className="space-y-3">
                        {importSummary.errors.map((err, i) => (
                          <li key={i} className="text-xs text-rose-800 dark:text-rose-300 font-bold flex items-start gap-3">
                            <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5" />
                            {err}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <p className="text-xs text-slate-500 font-medium text-center">Corrija a planilha e tente novamente.</p>
                 </div>
               ) : (
                 <div className="bg-blue-50 dark:bg-blue-900/10 p-8 rounded-[32px] border border-blue-100 dark:border-blue-900/30 text-center space-y-2">
                    <CheckCircle2 size={32} className="text-blue-600 mx-auto mb-2" />
                    <p className="text-lg font-black text-slate-800 dark:text-white">Tudo Pronto!</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                      A hierarquia de {importSummary.items.length} elementos foi validada com sucesso e está pronta para ser injetada no projeto.
                    </p>
                 </div>
               )}

               <div className="flex gap-4">
                  <button 
                    onClick={() => setImportSummary(null)}
                    className="flex-1 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all"
                  >
                    Descartar
                  </button>
                  <button 
                    disabled={importSummary.errors.length > 0}
                    onClick={confirmImport}
                    className={`flex-1 py-5 text-[10px] font-black text-white uppercase tracking-widest rounded-2xl transition-all shadow-xl ${importSummary.errors.length > 0 ? 'bg-slate-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'}`}
                  >
                    Confirmar Importação
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SidebarItem = ({ active, onClick, icon, label, open, onDelete }: any) => (
  <div className="group relative flex items-center px-2">
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
        active 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
          : 'text-slate-400 hover:text-white hover:bg-slate-800'
      }`}
    >
      <div className="flex-shrink-0">{icon}</div>
      {open && <span className="text-[11px] font-black uppercase tracking-widest truncate flex-1 text-left">{label}</span>}
    </button>
  </div>
);

const KpiCard = ({ label, value, icon, progress, color, highlight = false }: any) => {
  const colors: any = {
    slate: 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white',
    blue: 'bg-white dark:bg-slate-900 border-blue-100 dark:border-blue-900/40 text-blue-600 dark:text-blue-400',
    emerald: 'bg-white dark:bg-slate-900 border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400',
    rose: 'bg-white dark:bg-slate-900 border-rose-100 dark:border-rose-900/40 text-rose-600 dark:text-rose-400',
    indigo: 'bg-white dark:bg-slate-900 border-indigo-100 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400',
  };
  return (
    <div className={`p-6 rounded-[32px] border shadow-sm ${colors[color]} ${highlight ? 'ring-4 ring-blue-500/10' : ''} flex flex-col gap-4`}>
      <div className="flex items-center justify-between">
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          {icon}
        </div>
        <span className="text-[9px] font-black uppercase tracking-widest opacity-40">{label}</span>
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-black tracking-tighter leading-none">{value}</p>
        <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-3">
           <div className={`h-full bg-current transition-all duration-1000`} style={{ width: `${Math.min(100, progress)}%`, opacity: 0.6 }} />
        </div>
      </div>
    </div>
  );
};

export default App;
