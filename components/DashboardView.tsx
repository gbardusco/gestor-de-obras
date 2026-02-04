
import React, { useState, useMemo } from 'react';
import { Project, ProjectGroup, ProjectExpense } from '../types';
import { 
  Briefcase, Plus, Edit2, Trash2, AlertTriangle, 
  Folder, ChevronRight, Home, FolderPlus, Save, ChevronLeft, Search,
  FolderInput, X, Check, Target, Layers, GripVertical, Truck, Clock, PackageSearch, CreditCard
} from 'lucide-react';
import { treeService } from '../services/treeService';
import { projectService } from '../services/projectService';
import { financial } from '../utils/math';
import { DragDropContext, Droppable, Draggable, DropResult, DraggableProvided } from '@hello-pangea/dnd';

interface DashboardViewProps {
  projects: Project[];
  groups: ProjectGroup[];
  onOpenProject: (id: string) => void;
  onCreateProject: (groupId?: string | null) => void;
  onUpdateProject: (p: Project[]) => void;
  onUpdateGroups: (g: ProjectGroup[]) => void;
  onBulkUpdate: (updates: { projects?: Project[], groups?: ProjectGroup[] }) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = (props) => {
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);
  const [editingGroup, setEditingGroup] = useState<ProjectGroup | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [movingItem, setMovingItem] = useState<{ type: 'group' | 'project', id: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState<{ type: 'group' | 'project', id: string } | null>(null);
  const [newName, setNewName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const currentGroups = useMemo(() => 
    props.groups.filter(g => g.parentId === currentGroupId), 
    [props.groups, currentGroupId]
  );
  
  const currentProjects = useMemo(() => 
    props.projects.filter(p => p.groupId === currentGroupId), 
    [props.projects, currentGroupId]
  );

  const logisticsPendencies = useMemo(() => {
    const list: { projectName: string, expense: ProjectExpense }[] = [];
    props.projects.forEach(p => {
      p.expenses.forEach(e => {
        if (e.status === 'PAID' && e.type !== 'revenue') {
          list.push({ projectName: p.name, expense: e });
        }
      });
    });
    return list.slice(0, 5); // Apenas as top 5 mais críticas
  }, [props.projects]);

  const breadcrumbs = useMemo(() => {
    const list: ProjectGroup[] = [];
    let currentId = currentGroupId;
    while (currentId) {
      const g = props.groups.find(x => x.id === currentId);
      if (g) {
        list.unshift(g);
        currentId = g.parentId;
      } else break;
    }
    return list;
  }, [currentGroupId, props.groups]);

  const handleDragEnd = (result: DropResult) => {
    const sourceId = result.draggableId;
    const cleanSourceId = sourceId.replace('grp-', '').replace('prj-', '');
    const type = sourceId.startsWith('grp-') ? 'group' : 'project';

    if (result.combine) {
      const targetId = result.combine.draggableId;
      let targetGroupId: string | null = null;
      if (targetId === 'target-root') targetGroupId = null;
      else if (targetId === 'target-back') targetGroupId = breadcrumbs[breadcrumbs.length - 2]?.id || null;
      else if (targetId.startsWith('grp-')) targetGroupId = targetId.replace('grp-', '');
      else return;
      if (cleanSourceId === targetGroupId) return;
      const { updatedProjects, updatedGroups } = projectService.moveItem(cleanSourceId, type, targetGroupId, props.projects, props.groups);
      props.onBulkUpdate({ projects: updatedProjects, groups: updatedGroups });
      return;
    }
  };

  const handleConfirmRename = () => {
    if (!newName.trim()) return;
    if (editingGroup) {
      props.onUpdateGroups(props.groups.map(g => g.id === editingGroup.id ? { ...g, name: newName.trim() } : g));
      setEditingGroup(null);
    } else if (editingProject) {
      props.onUpdateProject(props.projects.map(p => p.id === editingProject.id ? { ...p, name: newName.trim() } : p));
      setEditingProject(null);
    }
  };

  const handleConfirmDelete = () => {
    if (!isDeleting) return;
    if (isDeleting.type === 'group') {
      const { updatedGroups, updatedProjects, newParentId } = projectService.getReassignedItems(isDeleting.id, props.groups, props.projects);
      props.onBulkUpdate({ groups: updatedGroups, projects: updatedProjects });
      if (currentGroupId === isDeleting.id) setCurrentGroupId(newParentId);
    } else {
      const updatedList = props.projects.filter(p => p.id !== isDeleting.id);
      props.onUpdateProject(updatedList);
    }
    setIsDeleting(null);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 sm:p-12 animate-in fade-in duration-500 bg-slate-50 dark:bg-slate-950 custom-scrollbar">
      <div className="max-w-7xl mx-auto space-y-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* PAINEL PRINCIPAL (ESQUERDA) */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <header>
                <h1 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white">Central de Obras</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Gestão hierárquica por portfólio.</p>
              </header>
              <div className="flex items-center gap-3">
                 <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Pesquisar..." className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 w-full sm:w-64 transition-all"/>
                 </div>
                 <button onClick={() => projectService.createGroup('Nova Pasta', currentGroupId, props.groups.length)} className="p-3 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-800 hover:text-indigo-600 shadow-sm transition-all"><FolderPlus size={18} /></button>
                 <button onClick={() => props.onCreateProject(currentGroupId)} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg hover:scale-105 transition-all"><Plus size={16} /> Nova Obra</button>
              </div>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {currentGroups.map((g, idx) => (
                  <FolderCard key={g.id} group={g} onOpen={() => setCurrentGroupId(g.id)} onRename={() => { setEditingGroup(g); setNewName(g.name); }} onDelete={() => setIsDeleting({ type: 'group', id: g.id })} />
                ))}
                {currentProjects.map((p, idx) => (
                  <ProjectCard key={p.id} project={p} onOpen={() => props.onOpenProject(p.id)} onRename={() => { setEditingProject(p); setNewName(p.name); }} onDelete={() => setIsDeleting({ type: 'project', id: p.id })} />
                ))}
              </div>
            </DragDropContext>
          </div>

          {/* PAINEL DE SUPRIMENTOS (DIREITA) */}
          <div className="lg:col-span-4 space-y-6">
             <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-xl">
                <div className="flex items-center justify-between mb-8">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-xl"><Truck size={20} /></div>
                      <h3 className="text-sm font-black uppercase tracking-widest dark:text-white">Supply Chain Alert</h3>
                   </div>
                   <span className="text-[10px] font-black text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg">Imobilizado</span>
                </div>

                <div className="space-y-4">
                   {logisticsPendencies.length > 0 ? logisticsPendencies.map((item, i) => (
                     <div key={i} className="group p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-amber-400 transition-all">
                        <div className="flex justify-between items-start mb-2">
                           <div>
                             <h4 className="text-[11px] font-black uppercase text-slate-700 dark:text-slate-200 truncate max-w-[140px]">{item.expense.description}</h4>
                             <p className="text-[8px] font-bold text-slate-400 uppercase">{item.projectName}</p>
                           </div>
                           <div className="text-right">
                             <p className="text-[10px] font-black text-amber-600">{financial.formatVisual(item.expense.amount, 'R$')}</p>
                             <div className="flex items-center gap-1 justify-end text-emerald-500">
                               <CreditCard size={10} />
                               <span className="text-[8px] font-black uppercase">Pago</span>
                             </div>
                           </div>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700 mt-2">
                           <span className="text-[8px] font-black text-slate-400 uppercase flex items-center gap-1"><Clock size={10}/> Aguardando Recebimento</span>
                           <button className="text-[8px] font-black uppercase text-indigo-600 hover:underline">Cobrar NF</button>
                        </div>
                     </div>
                   )) : (
                     <div className="py-12 text-center opacity-30 select-none">
                        <PackageSearch size={48} className="mx-auto mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Nenhuma pendência logística</p>
                     </div>
                   )}
                </div>
                
                {logisticsPendencies.length > 0 && (
                  <button className="w-full mt-6 py-4 bg-slate-100 dark:bg-slate-800 rounded-2xl text-[9px] font-black uppercase tracking-widest text-slate-500 hover:bg-indigo-600 hover:text-white transition-all">Ver Painel de Suprimentos Completo</button>
                )}
             </div>

             <div className="p-6 bg-indigo-600 rounded-[2rem] text-white shadow-xl relative overflow-hidden group">
                <Target size={120} className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-110 transition-transform" />
                <div className="relative z-10">
                   <h3 className="text-xs font-black uppercase tracking-widest opacity-80 mb-2">Engenharia de Valor</h3>
                   <p className="text-sm font-medium leading-relaxed">Você possui <strong>{logisticsPendencies.length} materiais</strong> pagos em trânsito. Otimize seu fluxo de caixa conferindo os recebimentos físicos hoje.</p>
                </div>
             </div>
          </div>
        </div>
      </div>

      {(editingGroup || editingProject) && (
        <RenameDialog name={newName} setName={setNewName} title={editingGroup ? 'Pasta' : 'Obra'} onCancel={() => { setEditingGroup(null); setEditingProject(null); }} onConfirm={handleConfirmRename} />
      )}
      {isDeleting && (
        <DeleteConfirmDialog onCancel={() => setIsDeleting(null)} onConfirm={handleConfirmDelete} />
      )}
    </div>
  );
};

const FolderCard = ({ group, onOpen, onRename, onDelete }: any) => (
  <div onClick={onOpen} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all cursor-pointer relative overflow-hidden">
    <div className="flex justify-between items-start mb-8">
      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-2xl group-hover:scale-110 transition-transform"><Folder size={24}/></div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
        <button onClick={e => { e.stopPropagation(); onRename(); }} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"><Edit2 size={16}/></button>
        <button onClick={e => { e.stopPropagation(); onDelete(); }} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 size={16}/></button>
      </div>
    </div>
    <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight truncate">{group.name}</h3>
  </div>
);

const ProjectCard = ({ project, onOpen, onRename, onDelete }: any) => {
  const stats = treeService.calculateBasicStats(project.items, project.bdi || 0);
  return (
    <div onClick={onOpen} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all cursor-pointer relative overflow-hidden">
      <div className="flex justify-between items-start mb-8">
        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 rounded-2xl group-hover:scale-110 transition-transform"><Briefcase size={24}/></div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
          <button onClick={e => { e.stopPropagation(); onRename(); }} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"><Edit2 size={16}/></button>
          <button onClick={e => { e.stopPropagation(); onDelete(); }} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 size={16}/></button>
        </div>
      </div>
      <h3 className="text-sm font-black text-slate-800 dark:text-white truncate uppercase tracking-tight">{project.name}</h3>
      <div className="mt-6 space-y-2">
        <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${stats.progress}%` }} />
        </div>
      </div>
    </div>
  );
};

const RenameDialog = ({ name, setName, title, onCancel, onConfirm }: any) => (
  <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in" onClick={onCancel}>
    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-2xl" onClick={e => e.stopPropagation()}>
      <h2 className="text-xl font-black mb-6 text-slate-800 dark:text-white">Renomear {title}</h2>
      <input autoFocus className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-black focus:border-indigo-500 outline-none transition-all mb-6" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && onConfirm()} />
      <button onClick={onConfirm} className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"><Save size={16} className="inline mr-2" /> Salvar</button>
    </div>
  </div>
);

const DeleteConfirmDialog = ({ onCancel, onConfirm }: any) => (
  <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in" onClick={onCancel}>
    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-10 border border-slate-200 dark:border-slate-800 shadow-2xl text-center" onClick={e => e.stopPropagation()}>
      <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mx-auto mb-6"><AlertTriangle size={40} /></div>
      <h2 className="text-2xl font-black mb-3 text-slate-800 dark:text-white">Remover Item?</h2>
      <p className="text-slate-500 text-sm mb-10 leading-relaxed">Esta ação não pode ser desfeita.</p>
      <div className="flex gap-4">
        <button onClick={onCancel} className="flex-1 py-4 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 rounded-2xl">Cancelar</button>
        <button onClick={onConfirm} className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all">Excluir</button>
      </div>
    </div>
  </div>
);
