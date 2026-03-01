
import React, { useState, useMemo } from 'react';
import { Contractor, Project } from '../types';
import { 
  Plus, Search, Filter, MoreHorizontal, 
  Building2, MapPin, FileText, Landmark, 
  Phone, Mail, User, Trash2, Edit2, 
  ChevronRight, Download, ExternalLink, CreditCard,
  Briefcase, CheckCircle2, XCircle, DollarSign
} from 'lucide-react';

interface ContractorManagerProps {
  contractors: Contractor[];
  projects: Project[];
  onUpdateContractors: (contractors: Contractor[]) => void;
}

export const ContractorManager: React.FC<ContractorManagerProps> = ({
  contractors, projects, onUpdateContractors
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContractor, setEditingContractor] = useState<Contractor | null>(null);

  const filteredContractors = useMemo(() => {
    return contractors.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.cnpj.includes(searchQuery) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.specialty?.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => a.order - b.order);
  }, [contractors, searchQuery]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const contractorData: Partial<Contractor> = {
      name: formData.get('name') as string,
      cnpj: formData.get('cnpj') as string,
      type: formData.get('type') as 'PJ' | 'Autônomo',
      city: formData.get('city') as string,
      specialty: formData.get('specialty') as string,
      status: formData.get('status') as 'Ativo' | 'Inativo',
      contactName: formData.get('contactName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      bankName: formData.get('bankName') as string,
      bankAgency: formData.get('bankAgency') as string,
      bankAccount: formData.get('bankAccount') as string,
      pixKey: formData.get('pixKey') as string,
      notes: formData.get('notes') as string,
    };

    if (editingContractor) {
      onUpdateContractors(contractors.map(c => c.id === editingContractor.id ? { ...c, ...contractorData } : c));
    } else {
      const newContractor: Contractor = {
        ...contractorData as Contractor,
        id: crypto.randomUUID(),
        documents: [],
        order: contractors.length
      };
      onUpdateContractors([...contractors, newContractor]);
    }

    setIsModalOpen(false);
    setEditingContractor(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja realmente excluir este empreiteiro?')) {
      onUpdateContractors(contractors.filter(c => c.id !== id));
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50 dark:bg-slate-950">
      <header className="p-8 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white uppercase">Prestadores & Empreiteiros</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Gestão Unificada de Mão de Obra e Serviços Especializados</p>
          </div>
          <button 
            onClick={() => { setEditingContractor(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus size={16} /> Novo Prestador
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-700 flex items-center gap-4">
            <div className="p-4 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl">
              <Building2 size={24} />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Ativos</p>
              <p className="text-2xl font-black text-slate-800 dark:text-white">{contractors.length}</p>
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-700 flex items-center gap-4">
            <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl">
              <Landmark size={24} />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Cidades Atendidas</p>
              <p className="text-2xl font-black text-slate-800 dark:text-white">{new Set(contractors.map(c => c.city)).size}</p>
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-700 flex items-center gap-4">
            <div className="p-4 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl">
              <FileText size={24} />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Docs Pendentes</p>
              <p className="text-2xl font-black text-slate-800 dark:text-white">0</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Pesquisar por nome, CNPJ ou cidade..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl text-xs font-bold outline-none transition-all dark:text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <button className="p-3 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"><Filter size={18}/></button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-6 py-4">Nome / Razão Social</th>
                  <th className="px-6 py-4">Tipo</th>
                  <th className="px-6 py-4">Cidade Base</th>
                  <th className="px-6 py-4">Especialidade</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Ações Rápidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredContractors.map(contractor => (
                  <tr key={contractor.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600">
                          {contractor.type === 'PJ' ? <Building2 size={20} /> : <User size={20} />}
                        </div>
                        <div>
                          <span className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight block">{contractor.name}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{contractor.cnpj}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase border ${
                        contractor.type === 'PJ' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {contractor.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                        <MapPin size={14} className="text-indigo-500" />
                        {contractor.city}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {contractor.specialty ? (
                        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 text-[8px] font-black uppercase rounded-lg">
                          {contractor.specialty}
                        </span>
                      ) : (
                        <span className="text-[9px] text-slate-300 italic">Não definida</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {contractor.status === 'Ativo' ? (
                          <CheckCircle2 size={14} className="text-emerald-500" />
                        ) : (
                          <XCircle size={14} className="text-rose-500" />
                        )}
                        <span className={`text-[9px] font-black uppercase ${contractor.status === 'Ativo' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {contractor.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          title="Novo Lançamento"
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-all"
                        >
                          <DollarSign size={16} />
                        </button>
                        <button 
                          title="Ver Contrato"
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all"
                        >
                          <FileText size={16} />
                        </button>
                        <button 
                          onClick={() => { setEditingContractor(contractor); setIsModalOpen(true); }}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(contractor.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de Cadastro/Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <form onSubmit={handleSubmit}>
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black dark:text-white uppercase tracking-tight">
                    {editingContractor ? 'Editar Empreiteiro' : 'Novo Empreiteiro'}
                  </h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Dados Cadastrais e Financeiros</p>
                </div>
                <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                  <Trash2 size={24} />
                </button>
              </div>
              
              <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Razão Social / Nome</label>
                    <input name="name" defaultValue={editingContractor?.name} required className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl text-xs font-bold outline-none transition-all dark:text-white" placeholder="Nome da Empresa ou Profissional" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">CNPJ / CPF</label>
                    <input name="cnpj" defaultValue={editingContractor?.cnpj} required className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl text-xs font-bold outline-none transition-all dark:text-white" placeholder="00.000.000/0000-00" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Tipo de Prestador</label>
                    <select name="type" defaultValue={editingContractor?.type || 'PJ'} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl text-xs font-bold outline-none transition-all dark:text-white">
                      <option value="PJ">Empreiteiro (PJ)</option>
                      <option value="Autônomo">Prestador Autônomo</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Status do Contrato</label>
                    <select name="status" defaultValue={editingContractor?.status || 'Ativo'} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl text-xs font-bold outline-none transition-all dark:text-white">
                      <option value="Ativo">Ativo</option>
                      <option value="Inativo">Inativo</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Cidade Base</label>
                    <input name="city" defaultValue={editingContractor?.city} required className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl text-xs font-bold outline-none transition-all dark:text-white" placeholder="Ex: São Paulo" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Especialidade (Checklist)</label>
                    <input name="specialty" defaultValue={editingContractor?.specialty} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl text-xs font-bold outline-none transition-all dark:text-white" placeholder="Ex: Elétrica, Hidráulica..." />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">E-mail</label>
                    <input name="email" type="email" defaultValue={editingContractor?.email} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl text-xs font-bold outline-none transition-all dark:text-white" placeholder="email@empresa.com" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Telefone</label>
                    <input name="phone" defaultValue={editingContractor?.phone} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl text-xs font-bold outline-none transition-all dark:text-white" placeholder="(00) 00000-0000" />
                  </div>
                </div>

                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700 space-y-6">
                  <h3 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                    <CreditCard size={14} /> Dados para Pagamento
                  </h3>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Banco</label>
                      <input name="bankName" defaultValue={editingContractor?.bankName} className="w-full px-4 py-3 bg-white dark:bg-slate-900 border-2 border-transparent focus:border-indigo-500 rounded-xl text-xs font-bold outline-none transition-all dark:text-white" placeholder="Itaú, Bradesco..." />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Agência</label>
                      <input name="bankAgency" defaultValue={editingContractor?.bankAgency} className="w-full px-4 py-3 bg-white dark:bg-slate-900 border-2 border-transparent focus:border-indigo-500 rounded-xl text-xs font-bold outline-none transition-all dark:text-white" placeholder="0000" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Conta</label>
                      <input name="bankAccount" defaultValue={editingContractor?.bankAccount} className="w-full px-4 py-3 bg-white dark:bg-slate-900 border-2 border-transparent focus:border-indigo-500 rounded-xl text-xs font-bold outline-none transition-all dark:text-white" placeholder="00000-0" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Chave PIX (Opcional)</label>
                    <input name="pixKey" defaultValue={editingContractor?.pixKey} className="w-full px-4 py-3 bg-white dark:bg-slate-900 border-2 border-transparent focus:border-indigo-500 rounded-xl text-xs font-bold outline-none transition-all dark:text-white" placeholder="CNPJ, E-mail, Celular..." />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Observações Internas</label>
                  <textarea name="notes" defaultValue={editingContractor?.notes} rows={3} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl text-xs font-bold outline-none transition-all dark:text-white" placeholder="Detalhes sobre contratos, especialidades..." />
                </div>
              </div>

              <div className="p-8 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">Cancelar</button>
                <button type="submit" className="px-10 py-4 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all">
                  {editingContractor ? 'Salvar Alterações' : 'Cadastrar Empreiteiro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
