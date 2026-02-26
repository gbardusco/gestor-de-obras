
import React, { useState, useMemo, useEffect } from 'react';
import { Project, WorkItem, ItemType } from '../types';
import { treeService } from '../services/treeService';
import { financial } from '../utils/math';
import { 
  Plus, Layers, Search, Package, ChevronRight, ChevronDown, 
  Edit3, Trash2, GripVertical, Calculator, Coins, Ruler
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface BlueprintViewProps {
  project: Project;
  onUpdateProject: (data: Partial<Project>) => void;
  onOpenModal: (type: ItemType, item: WorkItem | null, parentId: string | null) => void;
  isReadOnly?: boolean;
}

export const BlueprintView: React.FC<BlueprintViewProps> = ({ 
  project, onUpdateProject, onOpenModal, isReadOnly 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    const saved = localStorage.getItem(`exp_simple_wbs_${project.id}`);
    return saved ? new Set<string>(JSON.parse(saved)) : new Set<string>();
  });

  useEffect(() => {
    localStorage.setItem(`exp_simple_wbs_${project.id}`, JSON.stringify(Array.from(expandedIds)));
  }, [expandedIds, project.id]);

  const processedTree = useMemo(() => {
    const tree = treeService.buildTree<WorkItem>(project.items);
    return tree.map((root, idx) => treeService.processRecursive(root, '', idx, project.bdi));
  }, [project.items, project.bdi]);

  const flattenedList = useMemo(() => 
    treeService.flattenTree(processedTree, expandedIds)
  , [processedTree, expandedIds]);

  const filteredData = searchQuery.trim() 
    ? flattenedList.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.wbs.includes(searchQuery))
    : flattenedList;

  const handleDragEnd = (result: DropResult) => {
    if (isReadOnly || !result.destination) return;
    const sourceId = result.draggableId;
    const targetIdx = result.destination.index;
    const targetItem = filteredData[targetIdx];
    if (!targetItem) return;
    onUpdateProject({ items: treeService.reorderItems<WorkItem>(project.items, sourceId, targetItem.id, 'after') });
  };

  const updateItemContractQuantity = (id: string, qty: number) => {
    if (isReadOnly) return;
    const updatedItems = project.items.map(it => {
      if (it.id === id) {
        const safeQty = Math.max(0, qty);
        return { 
          ...it, 
          contractQuantity: safeQty,
          contractTotal: financial.truncate(safeQty * it.unitPrice)
        };
      }
      return it;
    });
    onUpdateProject({ items: updatedItems });
  };

  const updateItemUnitPrice = (id: string, price: number) => {
    if (isReadOnly) return;
    const updatedItems = project.items.map(it => {
      if (it.id === id) {
        const newUnitPrice = Math.max(0, price);
        const newUnitPriceNoBdi = financial.truncate(newUnitPrice / (1 + project.bdi/100));
        return { 
          ...it, 
          unitPrice: newUnitPrice, 
          unitPriceNoBdi: newUnitPriceNoBdi,
          contractTotal: financial.truncate(newUnitPrice * it.contractQuantity)
        };
      }
      return it;
    });
    onUpdateProject({ items: updatedItems });
  };

  const toggleExpand = (id: string) => {
    const next = new Set(expandedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedIds(next);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* 1. HEADER */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl">
            <Ruler size={24} />
          </div>
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight text-slate-800 dark:text-white leading-none">Planilha de Quantitativos</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">Levantamento de Medidas e Orçamento Base (BDI: {project.bdi}%)</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button 
            disabled={isReadOnly}
            onClick={() => onOpenModal('item', null, null)} 
            className="px-6 py-3 bg-indigo-600 text-white font-black uppercase tracking-widest text-[9px] rounded-xl shadow-lg shadow-indigo-500/10 disabled:opacity-30"
          >
            <Plus size={14} className="inline mr-1"/> Novo Item
          </button>

          <div className="relative w-full lg:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              placeholder="Buscar item..." 
              className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 pl-11 pr-4 py-2.5 rounded-xl text-xs outline-none focus:border-indigo-500 transition-all dark:text-white font-bold"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)} 
            />
          </div>
        </div>
      </div>

      {/* 2. TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse text-[11px]">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
              <tr className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                <th className="p-4 w-12 text-center">#</th>
                <th className="p-4 w-20 text-center">Item</th>
                <th className="p-4 text-left min-w-[300px]">Descrição do Serviço</th>
                <th className="p-4 w-20 text-center">Und</th>
                <th className="p-4 w-32 text-center">Quantitativo</th>
                <th className="p-4 w-32 text-right">Preço Unit.</th>
                <th className="p-4 w-32 text-right">Total</th>
                <th className="p-4 w-24 text-center no-print">Ações</th>
              </tr>
            </thead>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="simple-wbs-list">
                {(provided) => (
                  <tbody {...provided.droppableProps} ref={provided.innerRef} className="divide-y divide-slate-50 dark:divide-slate-800">
                    {filteredData.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index} isDragDisabled={isReadOnly}>
                        {(provided, snapshot) => (
                          <tr 
                            ref={provided.innerRef} 
                            {...provided.draggableProps} 
                            className={`group transition-colors ${item.type === 'category' ? 'bg-slate-50/30 dark:bg-slate-800/20 font-bold' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/40'} ${snapshot.isDragging ? 'bg-indigo-50 dark:bg-indigo-900/20 shadow-lg' : ''}`}
                          >
                            <td className="p-2 text-center no-print">
                              <div {...provided.dragHandleProps} className="inline-flex p-1 text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing">
                                <GripVertical size={14} />
                              </div>
                            </td>
                            <td className="p-4 text-center font-mono text-[10px] text-slate-400">{item.wbs}</td>
                            <td className="p-4">
                              <div className="flex items-center gap-2" style={{ marginLeft: `${item.depth * 1.5}rem` }}>
                                {item.type === 'category' ? (
                                  <button onClick={() => toggleExpand(item.id)} className="p-1 text-slate-400 hover:text-indigo-600 transition-colors">
                                    {expandedIds.has(item.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                  </button>
                                ) : <div className="w-6" />}
                                {item.type === 'category' ? <Layers size={14} className="text-indigo-500 shrink-0" /> : <Package size={14} className="text-slate-300 shrink-0" />}
                                <span className={`truncate ${item.type === 'category' ? 'uppercase text-[10px] font-black text-slate-800 dark:text-white' : 'text-slate-600 dark:text-slate-300 font-medium'}`}>
                                  {item.name}
                                </span>
                              </div>
                            </td>
                            <td className="p-4 text-center font-black text-slate-400 uppercase text-[9px]">{item.unit || '-'}</td>
                            <td className="p-4 text-center">
                              {item.type === 'item' ? (
                                <div className="flex items-center justify-center gap-2">
                                  <input 
                                    type="number" 
                                    step="any"
                                    disabled={isReadOnly}
                                    className="w-20 bg-slate-100 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-700 border-2 focus:border-indigo-500 rounded-lg px-2 py-1 text-center text-[11px] font-bold outline-none transition-all"
                                    value={item.contractQuantity}
                                    onChange={(e) => updateItemContractQuantity(item.id, parseFloat(e.target.value) || 0)}
                                  />
                                </div>
                              ) : '-'}
                            </td>
                            <td className="p-4 text-right">
                              {item.type === 'item' ? (
                                <div className="flex items-center justify-end gap-1">
                                  <span className="text-[9px] text-slate-400 font-black">{project.theme?.currencySymbol || 'R$'}</span>
                                  <input 
                                    type="text"
                                    disabled={isReadOnly}
                                    className="w-24 bg-transparent text-right font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20 rounded px-1"
                                    value={financial.formatVisual(item.unitPrice, '').trim()}
                                    onChange={(e) => {
                                      const val = financial.parseLocaleNumber(financial.maskCurrency(e.target.value));
                                      updateItemUnitPrice(item.id, val);
                                    }}
                                  />
                                </div>
                              ) : '-'}
                            </td>
                            <td className="p-4 text-right font-black text-slate-800 dark:text-white">
                              {financial.formatVisual(item.contractTotal, project.theme?.currencySymbol || 'R$')}
                            </td>
                            <td className="p-4 text-center no-print">
                              <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => onOpenModal(item.type, item, item.parentId)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"><Edit3 size={14}/></button>
                                <button onClick={() => onUpdateProject({ items: project.items.filter(it => it.id !== item.id) })} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"><Trash2 size={14}/></button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </tbody>
                )}
              </Droppable>
            </DragDropContext>
            <tfoot className="bg-slate-50 dark:bg-slate-800/50 font-black">
              <tr>
                <td colSpan={6} className="p-6 text-right uppercase tracking-widest text-[10px] text-slate-400">Total Geral Estimado:</td>
                <td className="p-6 text-right text-base text-indigo-600 tracking-tighter">
                  {financial.formatVisual(financial.sum(project.items.filter(i => !i.parentId).map(i => i.contractTotal)), project.theme?.currencySymbol || 'R$')}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 3. FOOTER INFO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-2xl"><Calculator size={20}/></div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total de Itens</p>
            <p className="text-xl font-black text-slate-800 dark:text-white">{project.items.filter(i => i.type === 'item').length}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl"><Coins size={20}/></div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Valor Médio/Item</p>
            <p className="text-xl font-black text-slate-800 dark:text-white">
              {financial.formatVisual(
                project.items.filter(i => i.type === 'item').length > 0 
                ? financial.sum(project.items.filter(i => i.type === 'item').map(i => i.contractTotal)) / project.items.filter(i => i.type === 'item').length
                : 0,
                project.theme?.currencySymbol || 'R$'
              )}
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl"><Layers size={20}/></div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Categorias EAP</p>
            <p className="text-xl font-black text-slate-800 dark:text-white">{project.items.filter(i => i.type === 'category').length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
