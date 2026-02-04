
import React, { useState, useEffect } from 'react';
import { ProjectExpense, ItemType, ExpenseType, ExpenseStatus } from '../types';
import { financial } from '../utils/math';
import { X, Save, Layers, Truck, Users, Calculator, ArrowRightLeft, FolderTree, Calendar, Clock, Landmark, ReceiptText, Tag, Percent, Package, CreditCard, ChevronRight, PackageCheck, Printer } from 'lucide-react';
import { ExpenseAttachmentZone } from './ExpenseAttachmentZone';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<ProjectExpense>) => void;
  editingItem: ProjectExpense | null;
  expenseType: ExpenseType;
  itemType: ItemType;
  categories: (ProjectExpense & { depth: number })[];
  currencySymbol?: string;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen, onClose, onSave, editingItem, expenseType, itemType: initialItemType, categories,
  currencySymbol = 'R$'
}) => {
  const isRevenue = expenseType === 'revenue';
  const [activeItemType, setActiveItemType] = useState<ItemType>(initialItemType);
  
  const getTodayStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState<Partial<ProjectExpense>>({
    description: '', parentId: null, unit: 'un', quantity: 1, unitPrice: 0, amount: 0, entityName: '', 
    date: getTodayStr(),
    paymentDate: '',
    deliveryDate: '',
    discountValue: 0,
    discountPercentage: 0,
    status: 'PENDING',
    paymentProof: '',
    invoiceDoc: ''
  });

  const [strQty, setStrQty] = useState('1,00');
  const [strPrice, setStrPrice] = useState('0,00');
  const [strAmount, setStrAmount] = useState('0,00');
  const [strDiscVal, setStrDiscVal] = useState('0,00');
  const [strDiscPct, setStrDiscPct] = useState('0,00');

  useEffect(() => {
    if (editingItem) {
      setFormData({ ...editingItem });
      setActiveItemType(editingItem.itemType);
      setStrQty(financial.formatVisual(editingItem.quantity || 0, currencySymbol).replace(currencySymbol, '').trim());
      setStrPrice(financial.formatVisual(editingItem.unitPrice || 0, currencySymbol).replace(currencySymbol, '').trim());
      setStrAmount(financial.formatVisual(editingItem.amount || 0, currencySymbol).replace(currencySymbol, '').trim());
      setStrDiscVal(financial.formatVisual(editingItem.discountValue || 0, currencySymbol).replace(currencySymbol, '').trim());
      setStrDiscPct(financial.formatVisual(editingItem.discountPercentage || 0, '').trim());
    } else {
      setFormData({ 
        description: '', parentId: null, 
        unit: isRevenue ? 'vb' : (expenseType === 'labor' ? 'h' : 'un'), 
        quantity: 1, unitPrice: 0, amount: 0, entityName: '', 
        date: getTodayStr(),
        paymentDate: '',
        deliveryDate: '',
        discountValue: 0,
        discountPercentage: 0,
        status: 'PENDING',
        paymentProof: '',
        invoiceDoc: ''
      });
      setActiveItemType(initialItemType);
      setStrQty('1,00'); setStrPrice('0,00'); setStrAmount('0,00');
      setStrDiscVal('0,00'); setStrDiscPct('0,00');
    }
  }, [editingItem, initialItemType, isOpen, expenseType, isRevenue, currencySymbol]);

  const handleNumericChange = (setter: (v: string) => void, val: string, field: 'qty' | 'price' | 'amount' | 'discVal' | 'discPct') => {
    const masked = financial.maskCurrency(val);
    setter(masked);

    const num = financial.parseLocaleNumber(masked);
    const q = field === 'qty' ? num : financial.parseLocaleNumber(strQty);
    const p = field === 'price' ? num : financial.parseLocaleNumber(strPrice);
    const dv = field === 'discVal' ? num : financial.parseLocaleNumber(strDiscVal);
    const dp = field === 'discPct' ? num : financial.parseLocaleNumber(strDiscPct);
    
    const baseTotal = financial.round(q * p);

    if (field === 'qty' || field === 'price') {
      const actualDisc = financial.round(baseTotal * (dp / 100));
      setStrDiscVal(financial.formatVisual(actualDisc, currencySymbol).replace(currencySymbol, '').trim());
      setStrAmount(financial.formatVisual(financial.round(baseTotal - actualDisc), currencySymbol).replace(currencySymbol, '').trim());
    } 
    else if (field === 'discVal') {
      const newPct = baseTotal > 0 ? financial.round((num / baseTotal) * 100) : 0;
      setStrDiscPct(financial.formatVisual(newPct, '').trim());
      setStrAmount(financial.formatVisual(financial.round(baseTotal - num), currencySymbol).replace(currencySymbol, '').trim());
    }
    else if (field === 'discPct') {
      const newVal = financial.round(baseTotal * (num / 100));
      setStrDiscVal(financial.formatVisual(newVal, currencySymbol).replace(currencySymbol, '').trim());
      setStrAmount(financial.formatVisual(financial.round(baseTotal - newVal), currencySymbol).replace(currencySymbol, '').trim());
    }
    else if (field === 'amount') {
      const newDisc = financial.round(baseTotal - num);
      setStrDiscVal(financial.formatVisual(newDisc, currencySymbol).replace(currencySymbol, '').trim());
      const newPct = baseTotal > 0 ? financial.round((newDisc / baseTotal) * 100) : 0;
      setStrDiscPct(financial.formatVisual(newPct, '').trim());
    }
  };

  const handlePaymentProofUpload = (base64: string) => {
    setFormData(prev => ({ 
      ...prev, 
      paymentProof: base64,
      status: base64 ? 'PAID' : 'PENDING',
      isPaid: !!base64,
      paymentDate: base64 ? getTodayStr() : ''
    }));
  };

  const handleInvoiceUpload = (base64: string) => {
    setFormData(prev => ({ ...prev, invoiceDoc: base64 }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description) return;
    onSave({
      ...formData,
      itemType: activeItemType,
      type: expenseType,
      quantity: financial.parseLocaleNumber(strQty),
      unitPrice: financial.parseLocaleNumber(strPrice),
      discountValue: financial.parseLocaleNumber(strDiscVal),
      discountPercentage: financial.parseLocaleNumber(strDiscPct),
      amount: financial.parseLocaleNumber(strAmount),
      paymentDate: formData.paymentDate || undefined,
      deliveryDate: formData.deliveryDate || undefined
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[95vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        
        <div className={`px-8 py-6 border-b flex items-center justify-between shrink-0 ${isRevenue ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800' : 'bg-indigo-50/50 dark:border-indigo-800'}`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl text-white shadow-lg ${isRevenue ? 'bg-emerald-600 shadow-emerald-500/20' : (expenseType === 'labor' ? 'bg-blue-600' : 'bg-indigo-600')}`}>
              {isRevenue ? <Landmark size={24} /> : (expenseType === 'labor' ? <Users size={24} /> : <Truck size={24} />)}
            </div>
            <div>
              <h2 className="text-xl font-black dark:text-white tracking-tight leading-tight">
                {editingItem ? 'Editar' : 'Novo'} {isRevenue ? 'Lançamento de Receita' : (expenseType === 'labor' ? 'Gasto de Mão de Obra' : 'Pedido de Compra')}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                  formData.status === 'DELIVERED' ? 'bg-emerald-500 text-white' : 
                  formData.status === 'PAID' ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  Status: {formData.status}
                </span>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                  ID: {formData.id?.slice(0, 8)}
                </p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">
            
            {/* INFORMAÇÕES BÁSICAS */}
            <div className="space-y-5">
              {!editingItem && (
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl gap-2">
                  <button type="button" onClick={() => setActiveItemType('category')} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeItemType === 'category' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>Grupo / Pasta</button>
                  <button type="button" onClick={() => setActiveItemType('item')} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeItemType === 'item' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>{isRevenue ? 'Receita Unitária' : 'Insumo / Gasto'}</button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-2 block tracking-widest">Grupo Financeiro</label>
                  <div className="relative">
                    <FolderTree className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <select className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 dark:text-white text-xs font-bold outline-none appearance-none focus:border-indigo-500 transition-all" value={formData.parentId || ''} onChange={e => setFormData({...formData, parentId: e.target.value || null})}>
                      <option value="">Nível Principal</option>
                      {categories.filter(c => c.id !== editingItem?.id).map(cat => (
                        <option key={cat.id} value={cat.id}>{"\u00A0".repeat(cat.depth * 3)} {cat.wbs} - {cat.description}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-2 block tracking-widest">{isRevenue ? 'Descrição da Receita' : 'Descrição do Material/Serviço'}</label>
                  <input className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 dark:text-white text-sm font-black outline-none focus:border-indigo-500 transition-all" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Ex: Areia Média Lavada" />
                </div>

                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-2 block tracking-widest">{isRevenue ? 'Cliente' : 'Fornecedor / Favorecido'}</label>
                  <input className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 dark:text-white text-xs font-bold outline-none focus:border-indigo-500 transition-all" value={formData.entityName} onChange={e => setFormData({...formData, entityName: e.target.value})} />
                </div>
              </div>
            </div>

            {/* VALORES E DESCONTOS */}
            {activeItemType === 'item' && (
              <div className="grid grid-cols-3 gap-4 p-6 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-700">
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block">Unidade</label>
                  <input className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-bold text-center outline-none" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block">Qtd</label>
                  <input type="text" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-bold text-center outline-none" value={strQty} onChange={e => handleNumericChange(setStrQty, e.target.value, 'qty')} />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block">Unitário</label>
                  <input type="text" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-bold text-right outline-none" value={strPrice} onChange={e => handleNumericChange(setStrPrice, e.target.value, 'price')} />
                </div>
                
                <div className="col-span-3 flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                   <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-400 uppercase">Total Líquido</span>
                      <div className="flex items-center gap-2">
                        <Calculator size={14} className="text-indigo-500" />
                        <span className="text-xl font-black text-slate-800 dark:text-white">{currencySymbol} {strAmount}</span>
                      </div>
                   </div>
                   <div className="text-right">
                      <span className="text-[8px] font-black text-slate-400 uppercase">Descontos Aplicados</span>
                      <p className="text-xs font-bold text-rose-500">{currencySymbol} {strDiscVal} ({strDiscPct}%)</p>
                   </div>
                </div>
              </div>
            )}

            {/* WORKFLOW DE LOGÍSTICA E ANEXOS (O CORAÇÃO DA TAREFA) */}
            {activeItemType === 'item' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <Package size={18} className="text-indigo-500" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">Gestão de Workflow e Documentos</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* ZONA DE COMPROVANTE */}
                  <div className="space-y-4">
                    <ExpenseAttachmentZone 
                      label="Comprovante de Pagamento" 
                      currentFile={formData.paymentProof}
                      onFileLoaded={handlePaymentProofUpload}
                    />
                    {formData.status === 'PAID' && (
                      <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800 animate-in fade-in">
                        <p className="text-[9px] font-black text-indigo-600 uppercase mb-1">Pagamento Efetivado</p>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                          <Clock size={12} />
                          <span>Data: {financial.formatDate(formData.paymentDate)}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ZONA DE NOTA FISCAL */}
                  <div className="space-y-4">
                    <ExpenseAttachmentZone 
                      label="Nota Fiscal (Anexo Obrigatório p/ Entrega)" 
                      currentFile={formData.invoiceDoc}
                      onFileLoaded={handleInvoiceUpload}
                    />
                    
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status da Entrega</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, status: 'SHIPPED' }))}
                          className={`py-3 rounded-xl text-[9px] font-black uppercase border-2 transition-all flex items-center justify-center gap-2 ${formData.status === 'SHIPPED' ? 'border-amber-500 bg-amber-50 text-amber-600' : 'border-slate-100 dark:border-slate-800 text-slate-400'}`}
                        >
                          <Truck size={14} /> Em Trânsito
                        </button>
                        <button 
                          type="button"
                          disabled={!formData.invoiceDoc}
                          onClick={() => setFormData(prev => ({ ...prev, status: 'DELIVERED', deliveryDate: getTodayStr() }))}
                          className={`py-3 rounded-xl text-[9px] font-black uppercase border-2 transition-all flex items-center justify-center gap-2 ${formData.status === 'DELIVERED' ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-slate-100 dark:border-slate-800 text-slate-400'} ${!formData.invoiceDoc ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                        >
                          <PackageCheck size={14} /> Entregue
                        </button>
                      </div>
                      {!formData.invoiceDoc && <p className="text-[8px] font-bold text-rose-500 uppercase text-center">* Anexe a NF para liberar o recebimento</p>}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="px-8 py-6 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
               {formData.paymentProof && (
                 <button 
                   type="button"
                   className="p-3 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-600 hover:text-indigo-600 transition-all flex items-center gap-2 shadow-sm"
                   title="Gerar Pacote de Pagamento"
                 >
                   <Printer size={18} />
                   <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Exportar Voucher</span>
                 </button>
               )}
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="px-8 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-700 transition-colors">Cancelar</button>
              <button type="submit" className={`px-12 py-4 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center gap-3 ${isRevenue ? 'bg-emerald-600 shadow-emerald-500/20' : 'bg-indigo-600 shadow-indigo-500/20'}`}>
                <Save size={18} /> {editingItem ? 'Salvar Alterações' : 'Confirmar Pedido'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
