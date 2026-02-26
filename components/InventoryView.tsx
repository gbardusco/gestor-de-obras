
import React, { useState, useMemo } from 'react';
import { 
  Package, Plus, Search, ArrowUpCircle, ArrowDownCircle, 
  History, AlertTriangle, MoreVertical, Edit2, Trash2,
  GripVertical
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Project, StockItem, StockMovementType } from '../types';
import { stockService } from '../services/stockService';
import { StockItemModal } from './StockItemModal';
import { StockMovementModal } from './StockMovementModal';

interface InventoryViewProps {
  project: Project;
  onUpdateProject: (data: Partial<Project>) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ project, onUpdateProject }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [activeItem, setActiveItem] = useState<StockItem | null>(null);
  const [showHistory, setShowHistory] = useState<string | null>(null);

  const filteredStock = useMemo(() => {
    return (project.stock || [])
      .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => a.order - b.order);
  }, [project.stock, searchTerm]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(project.stock || []);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    const updatedItems = items.map((item, index) => ({ ...item, order: index }));
    onUpdateProject({ stock: updatedItems });
  };

  const handleSaveItem = (data: Partial<StockItem>) => {
    if (editingItem) {
      const updated = project.stock.map(it => it.id === editingItem.id ? { ...it, ...data } : it);
      onUpdateProject({ stock: updated });
    } else {
      const newItem = stockService.createItem(
        data.name || '', 
        data.unit || 'un', 
        data.minQuantity || 0, 
        project.stock.length
      );
      onUpdateProject({ stock: [...project.stock, newItem] });
    }
    setEditingItem(null);
  };

  const handleSaveMovement = (type: StockMovementType, quantity: number, responsible: string, notes: string) => {
    if (!activeItem) return;
    const updatedItem = stockService.addMovement(activeItem, type, quantity, responsible, notes);
    const updatedStock = project.stock.map(it => it.id === activeItem.id ? updatedItem : it);
    onUpdateProject({ stock: updatedStock });
    setActiveItem(null);
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('Deseja realmente excluir este item do estoque?')) {
      onUpdateProject({ stock: project.stock.filter(it => it.id !== id) });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 1. TOP BAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl">
            <Package size={24} />
          </div>
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight text-slate-800 dark:text-white leading-none">Controle de Estoque</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">Gestão de Materiais e Insumos</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar material..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-700 border-2 focus:border-indigo-500 rounded-xl outline-none transition-all text-xs font-bold w-64"
            />
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
          <button 
            onClick={() => { setEditingItem(null); setIsItemModalOpen(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
          >
            <Plus size={16} /> Novo Item
          </button>
        </div>
      </div>

      {/* 2. INVENTORY TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="stock-list">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="divide-y divide-slate-100 dark:divide-slate-800">
                {/* Header */}
                <div className="grid grid-cols-[40px_1fr_120px_120px_200px] gap-4 px-8 py-4 bg-slate-50/50 dark:bg-slate-800/50 items-center">
                  <div className="w-6"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Material</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Unidade</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Saldo Atual</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Ações</span>
                </div>

                {filteredStock.length === 0 ? (
                  <div className="p-20 text-center">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Package size={32} className="text-slate-300" />
                    </div>
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Nenhum material encontrado</p>
                  </div>
                ) : (
                  filteredStock.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`group grid grid-cols-[40px_1fr_120px_120px_200px] gap-4 px-8 py-4 items-center transition-colors ${snapshot.isDragging ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/50'}`}
                        >
                          <div {...provided.dragHandleProps} className="text-slate-300 group-hover:text-slate-400 transition-colors">
                            <GripVertical size={18} />
                          </div>

                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{item.name}</p>
                            {item.currentQuantity <= item.minQuantity && (
                              <div className="flex items-center gap-1.5 mt-1 text-amber-500">
                                <AlertTriangle size={12} />
                                <span className="text-[9px] font-black uppercase tracking-widest">Estoque Baixo (Mín: {item.minQuantity})</span>
                              </div>
                            )}
                          </div>

                          <div className="text-center">
                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-black uppercase tracking-widest text-slate-500">
                              {item.unit}
                            </span>
                          </div>

                          <div className="text-center">
                            <span className={`text-sm font-black ${item.currentQuantity <= item.minQuantity ? 'text-amber-500' : 'text-slate-700 dark:text-slate-200'}`}>
                              {item.currentQuantity.toFixed(2)}
                            </span>
                          </div>

                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => { setActiveItem(item); setIsMovementModalOpen(true); }}
                              className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all"
                              title="Entrada"
                            >
                              <ArrowUpCircle size={18} />
                            </button>
                            <button 
                              onClick={() => { setActiveItem(item); setIsMovementModalOpen(true); }}
                              className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
                              title="Saída"
                            >
                              <ArrowDownCircle size={18} />
                            </button>
                            <button 
                              onClick={() => setShowHistory(showHistory === item.id ? null : item.id)}
                              className={`p-2 rounded-lg transition-all ${showHistory === item.id ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                              title="Histórico"
                            >
                              <History size={18} />
                            </button>
                            <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                            <button 
                              onClick={() => { setEditingItem(item); setIsItemModalOpen(true); }}
                              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          {/* History Dropdown */}
                          {showHistory === item.id && (
                            <div className="col-span-full mt-2 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 animate-in slide-in-from-top-2 duration-200">
                              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 px-2">Histórico Recente</h4>
                              <div className="space-y-2">
                                {item.movements.length === 0 ? (
                                  <p className="text-center py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Nenhuma movimentação registrada</p>
                                ) : (
                                  item.movements.slice(0, 10).map(mov => (
                                    <div key={mov.id} className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                      <div className="flex items-center gap-3">
                                        <div className={`p-1.5 rounded-lg ${mov.type === 'entry' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                          {mov.type === 'entry' ? <ArrowUpCircle size={14} /> : <ArrowDownCircle size={14} />}
                                        </div>
                                        <div>
                                          <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
                                            {mov.type === 'entry' ? 'Entrada' : 'Saída'} de {mov.quantity.toFixed(2)} {item.unit}
                                          </p>
                                          <p className="text-[9px] text-slate-400 font-medium">{mov.notes || 'Sem observações'}</p>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{mov.responsible}</p>
                                        <p className="text-[9px] text-slate-400">{new Date(mov.date).toLocaleDateString()} {new Date(mov.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* Modals */}
      <StockItemModal 
        isOpen={isItemModalOpen} 
        onClose={() => setIsItemModalOpen(false)} 
        onSave={handleSaveItem} 
        editingItem={editingItem} 
      />
      
      <StockMovementModal 
        isOpen={isMovementModalOpen} 
        onClose={() => setIsMovementModalOpen(false)} 
        onSave={handleSaveMovement} 
        item={activeItem} 
      />
    </div>
  );
};
