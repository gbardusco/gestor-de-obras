
import React, { useState, useMemo } from 'react';
import { GlobalTaskTag, Project } from '../types';
import { 
  Tags, Plus, Search, Trash2, Edit3, 
  CheckCircle2, Clock, AlertCircle, BarChart3,
  Building2, ArrowRight
} from 'lucide-react';

interface GlobalTaskDictionaryViewProps {
  tags: GlobalTaskTag[];
  projects: Project[];
  onUpdateTags: (tags: GlobalTaskTag[]) => void;
}

type TabType = 'dictionary' | 'dashboard';

export const GlobalTaskDictionaryView: React.FC<GlobalTaskDictionaryViewProps> = ({
  tags, projects, onUpdateTags
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('dictionary');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  // Verificar se a tag está em uso em alguma obra
  const getTagUsageCount = (tagId: string) => {
    return projects.reduce((count, project) => {
      const hasTask = project.tasks?.some(t => t.tagId === tagId);
      return count + (hasTask ? 1 : 0);
    }, 0);
  };

  const filteredTags = useMemo(() => {
    return tags.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [tags, searchQuery]);

  const handleAddTag = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    
    if (!name) return;

    // Simular busca aproximada (fuzzy search simples)
    const similar = tags.find(t => t.name.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(t.name.toLowerCase()));
    if (similar && similar.name.toLowerCase() !== name.toLowerCase()) {
      if (!confirm(`Você quis dizer "${similar.name}"? Já existe uma tag similar. Deseja criar mesmo assim?`)) {
        return;
      }
    }

    const newTag: GlobalTaskTag = {
      id: crypto.randomUUID(),
      name,
      createdAt: new Date().toISOString()
    };
    onUpdateTags([...tags, newTag]);
    e.currentTarget.reset();
  };

  const handleUpdateTag = (id: string) => {
    if (!editValue) return;
    onUpdateTags(tags.map(t => t.id === id ? { ...t, name: editValue } : t));
    setEditingTagId(null);
  };

  const handleDeleteTag = (id: string) => {
    const usage = getTagUsageCount(id);
    if (usage > 0) return; // Proteção extra
    onUpdateTags(tags.filter(t => t.id !== id));
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50 dark:bg-slate-950">
      <header className="p-8 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg">
              <Tags size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white uppercase">Dicionário de Tarefas</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Padronização e Taxonomia Global</p>
            </div>
          </div>

          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab('dictionary')}
              className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'dictionary' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Gestão Global
            </button>
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'dashboard' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Dashboard de Progresso
            </button>
          </div>
        </div>

        {activeTab === 'dictionary' && (
          <form onSubmit={handleAddTag} className="flex gap-4 max-w-2xl">
            <div className="relative flex-1">
              <Plus className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                name="name"
                type="text" 
                placeholder="Adicionar nova tag ao dicionário (ex: Alvenaria, Pintura...)"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl text-xs font-bold outline-none transition-all dark:text-white"
              />
            </div>
            <button type="submit" className="px-8 py-4 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:scale-105 transition-all">
              Cadastrar
            </button>
          </form>
        )}
      </header>

      <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
        {activeTab === 'dictionary' ? (
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Pesquisar no dicionário..."
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl text-xs font-bold outline-none transition-all dark:text-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTags.map(tag => {
                const usage = getTagUsageCount(tag.id);
                const isEditing = editingTagId === tag.id;

                return (
                  <div key={tag.id} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-lg">
                        <Tags size={16} />
                      </div>
                      {isEditing ? (
                        <div className="flex items-center gap-2 flex-1 max-w-md">
                          <input 
                            autoFocus
                            className="flex-1 bg-white dark:bg-slate-700 border-2 border-indigo-500 rounded-xl px-4 py-2 text-xs font-bold outline-none dark:text-white"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleUpdateTag(tag.id)}
                          />
                          <button onClick={() => handleUpdateTag(tag.id)} className="p-2 text-emerald-600"><CheckCircle2 size={18}/></button>
                          <button onClick={() => setEditingTagId(null)} className="p-2 text-rose-600"><XCircle size={18}/></button>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">{tag.name}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                            {usage === 0 ? 'Não utilizada' : `Em uso em ${usage} ${usage === 1 ? 'obra' : 'obras'}`}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => { setEditingTagId(tag.id); setEditValue(tag.name); }}
                        className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all"
                      >
                        <Edit3 size={18} />
                      </button>
                      <div className="relative group">
                        <button 
                          disabled={usage > 0}
                          onClick={() => handleDeleteTag(tag.id)}
                          className={`p-3 rounded-xl transition-all ${usage > 0 ? 'text-slate-200 dark:text-slate-700 cursor-not-allowed' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30'}`}
                        >
                          <Trash2 size={18} />
                        </button>
                        {usage > 0 && (
                          <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-slate-800 text-white text-[9px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 text-center">
                            Tag vinculada a obras. Não pode ser excluída.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {tags.map(tag => {
              const projectsWithTag = projects.filter(p => p.tasks?.some(t => t.tagId === tag.id));
              if (projectsWithTag.length === 0) return null;

              return (
                <div key={tag.id} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-xl">
                      <Tags size={18} />
                    </div>
                    <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">{tag.name}</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projectsWithTag.map(project => {
                      const task = project.tasks.find(t => t.tagId === tag.id)!;
                      const isCompleted = task.status === 'completed';
                      
                      return (
                        <div key={project.id} className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <Building2 size={14} className="text-slate-400" />
                              <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-tight">{project.name}</span>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                              task.priority === 'critical' ? 'bg-rose-100 text-rose-600' :
                              task.priority === 'high' ? 'bg-orange-100 text-orange-600' :
                              'bg-indigo-100 text-indigo-600'
                            }`}>
                              {task.priority}
                            </span>
                          </div>

                          <div className="space-y-3">
                            <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest">
                              <span className="text-slate-400">Status: {task.status.replace('_', ' ')}</span>
                              <span className={isCompleted ? 'text-emerald-600' : 'text-indigo-600'}>{isCompleted ? '100%' : 'Em Progresso'}</span>
                            </div>
                            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-1000 ${isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                style={{ width: isCompleted ? '100%' : '40%' }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {projects.every(p => !p.tasks || p.tasks.length === 0) && (
              <div className="py-20 text-center opacity-20">
                <BarChart3 size={64} className="mx-auto mb-4" />
                <p className="text-xs font-black uppercase tracking-[0.2em]">Nenhuma tarefa vinculada às obras ainda</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const XCircle = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);
