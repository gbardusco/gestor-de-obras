
import React, { useState, useMemo } from 'react';
import { Project, GlobalTaskTag, ProjectTask } from '../types';
import { 
  CheckSquare, Search, Plus, Trash2, 
  AlertCircle, Clock, CheckCircle2, XCircle,
  MoreVertical, ChevronDown, ChevronUp, Info
} from 'lucide-react';

interface ProjectTaskChecklistProps {
  project: Project;
  globalTags: GlobalTaskTag[];
  onUpdateProject: (data: Partial<Project>) => void;
}

export const ProjectTaskChecklist: React.FC<ProjectTaskChecklistProps> = ({
  project, globalTags, onUpdateProject
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [redundancyAlert, setRedundancyAlert] = useState<string | null>(null);

  const projectTasks = project.tasks || [];

  const filteredGlobalTags = useMemo(() => {
    if (!searchQuery) return [];
    return globalTags.filter(tag => 
      tag.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !projectTasks.some(t => t.tagId === tag.id)
    );
  }, [globalTags, searchQuery, projectTasks]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Simular feedback de redundância
    if (value.length > 2) {
      const similar = globalTags.find(t => 
        (t.name.toLowerCase().includes(value.toLowerCase()) || value.toLowerCase().includes(t.name.toLowerCase())) &&
        t.name.toLowerCase() !== value.toLowerCase()
      );
      if (similar) {
        setRedundancyAlert(`Você quis dizer "${similar.name}"?`);
      } else {
        setRedundancyAlert(null);
      }
    } else {
      setRedundancyAlert(null);
    }
  };

  const handleAddTask = (tag: GlobalTaskTag) => {
    const newTask: ProjectTask = {
      id: crypto.randomUUID(),
      tagId: tag.id,
      tagName: tag.name,
      priority: 'medium',
      status: 'pending',
      updatedAt: new Date().toISOString()
    };
    onUpdateProject({ tasks: [...projectTasks, newTask] });
    setSearchQuery('');
    setIsAdding(false);
  };

  const handleUpdateTask = (taskId: string, updates: Partial<ProjectTask>) => {
    const updatedTasks = projectTasks.map(t => 
      t.id === taskId ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
    );
    onUpdateProject({ tasks: updatedTasks });
  };

  const handleDeleteTask = (taskId: string) => {
    onUpdateProject({ tasks: projectTasks.filter(t => t.id !== taskId) });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-rose-600 bg-rose-100 dark:bg-rose-900/30';
      case 'high': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30';
      case 'medium': return 'text-amber-600 bg-amber-100 dark:bg-amber-900/30';
      default: return 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="text-emerald-500" size={18} />;
      case 'in_progress': return <Clock className="text-indigo-500" size={18} />;
      case 'blocked': return <AlertCircle className="text-rose-500" size={18} />;
      default: return <Clock className="text-slate-300" size={18} />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl">
            <CheckSquare size={24} />
          </div>
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight text-slate-800 dark:text-white leading-none">Checklist de Obra</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">Gestão Qualitativa por Tags Padronizadas</p>
          </div>
        </div>

        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar tag no dicionário global..."
            className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl text-xs font-bold outline-none transition-all dark:text-white"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          {redundancyAlert && (
            <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center gap-2 text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest z-20">
              <AlertCircle size={14} /> {redundancyAlert}
            </div>
          )}
          {filteredGlobalTags.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-10 overflow-hidden">
              {filteredGlobalTags.map(tag => (
                <button 
                  key={tag.id}
                  onClick={() => handleAddTask(tag)}
                  className="w-full p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 last:border-0"
                >
                  <span className="text-xs font-black uppercase text-slate-700 dark:text-slate-200">{tag.name}</span>
                  <Plus size={14} className="text-indigo-600" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projectTasks.map(task => (
          <div key={task.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${getPriorityColor(task.priority)}`}>
                  <CheckSquare size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">{task.tagName}</h3>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Atualizado em {new Date(task.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
              <button 
                onClick={() => handleDeleteTask(task.id)}
                className="p-2 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Prioridade</label>
                <select 
                  value={task.priority}
                  onChange={(e) => handleUpdateTask(task.id, { priority: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-bold outline-none dark:text-white"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                  <option value="critical">Crítica</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Status</label>
                <select 
                  value={task.status}
                  onChange={(e) => handleUpdateTask(task.id, { status: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-bold outline-none dark:text-white"
                >
                  <option value="pending">Pendente</option>
                  <option value="in_progress">Em Execução</option>
                  <option value="completed">Concluído</option>
                  <option value="blocked">Impedido</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                {getStatusIcon(task.status)}
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                  {task.status === 'completed' ? 'Finalizado' : task.status === 'in_progress' ? 'Ativo' : 'Aguardando'}
                </span>
              </div>
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[8px] font-bold">JD</div>
                <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[8px] font-bold text-indigo-600">+</div>
              </div>
            </div>
          </div>
        ))}

        {projectTasks.length === 0 && (
          <div className="lg:col-span-3 py-20 text-center bg-white dark:bg-slate-900 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800 opacity-30">
            <CheckSquare size={48} className="mx-auto mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Nenhuma tarefa vinculada a esta obra</p>
            <p className="text-[9px] font-bold uppercase tracking-widest mt-2">Use a barra de busca acima para adicionar tags do dicionário global</p>
          </div>
        )}
      </div>

      <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-500/20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Info size={24} />
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest">Padronização de Processos</h3>
            <p className="text-sm font-medium opacity-90 mt-1">O uso de tags globais permite que a prefeitura monitore o progresso de todas as obras de forma comparativa.</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Progresso Qualitativo</p>
          <p className="text-2xl font-black">
            {projectTasks.length > 0 
              ? Math.round((projectTasks.filter(t => t.status === 'completed').length / projectTasks.length) * 100)
              : 0}%
          </p>
        </div>
      </div>
    </div>
  );
};
