
import React, { useState, useRef } from 'react';
import { Download, Upload, ShieldCheck, AlertTriangle, FileJson, Database, CheckCircle2, Loader2, Info, History } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { backupService, BackupFile } from '../services/backupService';
import { State } from '../hooks/useProjectState';

interface BackupCenterProps {
  state: State;
  onRestore: (data: Partial<State>) => void;
}

export const BackupCenter: React.FC<BackupCenterProps> = ({ state, onRestore }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processType, setProcessType] = useState<'export' | 'import' | null>(null);
  const [importFile, setImportFile] = useState<BackupFile | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    setIsProcessing(true);
    setProcessType('export');
    setError(null);
    setSuccess(null);

    try {
      // Simulate heavy processing for UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const instanceId = state.globalSettings.companyCnpj || 'default-instance';
      const backup = backupService.generateBackup(state, instanceId);
      backupService.downloadBackup(backup);
      
      setSuccess('Backup gerado e transferido com sucesso.');
    } catch (err) {
      setError('Falha ao gerar backup.');
    } finally {
      setIsProcessing(false);
      setProcessType(null);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setProcessType('import');
    setError(null);
    setSuccess(null);

    try {
      const parsed = await backupService.parseBackupFile(file);
      setImportFile(parsed);
    } catch (err: any) {
      setError(err.message);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } finally {
      setIsProcessing(false);
      setProcessType(null);
    }
  };

  const handleRestore = () => {
    if (confirmText !== 'CONFIRMAR') return;

    setIsProcessing(true);
    setProcessType('import');
    
    setTimeout(() => {
      try {
        if (importFile) {
          onRestore(importFile.data);
          setSuccess('Dados restaurados com sucesso. A aplicação foi atualizada.');
          setImportFile(null);
          setShowConfirmModal(false);
          setConfirmText('');
        }
      } catch (err) {
        setError('Erro crítico durante o restauro de dados.');
      } finally {
        setIsProcessing(false);
        setProcessType(null);
      }
    }, 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-8 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Database size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">Centro de Soberania de Dados</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Gestão de Backups, Portabilidade e Recuperação de Desastres</p>
            </div>
          </div>
        </div>

        {/* Security Banner */}
        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 rounded-3xl p-6 flex gap-4 items-start">
          <div className="p-2 bg-white dark:bg-slate-800 rounded-xl text-indigo-600 shadow-sm shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider">Protocolo de Segurança Ativo</h3>
            <p className="text-xs text-indigo-700/70 dark:text-indigo-400/70 leading-relaxed">
              Os backups .canteiro são processados inteiramente em memória local. Nenhum dado operacional é enviado para servidores externos durante este processo. Recomendamos o armazenamento destes ficheiros em volumes encriptados.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Export Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 flex flex-col gap-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl">
                <Download size={24} />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Exportação</span>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Gerar Dump de Dados</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Cria um ficheiro único contendo todos os projetos, stock, fornecedores e configurações da sua instância.
              </p>
            </div>

            <div className="mt-auto pt-4">
              <button 
                onClick={handleExport}
                disabled={isProcessing}
                className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3"
              >
                {isProcessing && processType === 'export' ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Download size={18} />
                )}
                Exportar .canteiro
              </button>
            </div>
          </motion.div>

          {/* Import Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 flex flex-col gap-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-2xl">
                <Upload size={24} />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Importação</span>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Restaurar Sistema</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Carrega dados de um ficheiro de backup. Esta operação substituirá permanentemente todos os dados atuais.
              </p>
            </div>

            <div className="mt-auto pt-4">
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".canteiro"
                className="hidden"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="w-full py-4 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {isProcessing && processType === 'import' ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Upload size={18} />
                )}
                Carregar Ficheiro
              </button>
            </div>
          </motion.div>
        </div>

        {/* Audit Panel / Import Preview */}
        <AnimatePresence>
          {importFile && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border-2 border-amber-200 dark:border-amber-900/50 rounded-3xl overflow-hidden shadow-xl"
            >
              <div className="bg-amber-50 dark:bg-amber-900/20 p-6 border-b border-amber-100 dark:border-amber-900/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileJson className="text-amber-600" size={24} />
                  <div>
                    <h3 className="text-sm font-black text-amber-900 dark:text-amber-200 uppercase tracking-wider">Análise de Backup Detetada</h3>
                    <p className="text-[10px] text-amber-700/70 dark:text-amber-400/70 font-bold uppercase tracking-widest">Versão: {importFile.metadata.version} • {new Date(importFile.metadata.timestamp).toLocaleString()}</p>
                  </div>
                </div>
                <button onClick={() => setImportFile(null)} className="p-2 hover:bg-amber-100 dark:hover:bg-amber-900/40 rounded-xl text-amber-600 transition-colors">
                  <AlertTriangle size={20} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Projetos</p>
                    <p className="text-xl font-black text-slate-900 dark:text-white">{importFile.data.projects?.length || 0}</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fornecedores</p>
                    <p className="text-xl font-black text-slate-900 dark:text-white">{importFile.data.suppliers?.length || 0}</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Itens de Stock</p>
                    <p className="text-xl font-black text-slate-900 dark:text-white">{importFile.data.globalStock?.length || 0}</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Licitações</p>
                    <p className="text-xl font-black text-slate-900 dark:text-white">{importFile.data.biddings?.length || 0}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 rounded-2xl">
                  <AlertTriangle className="text-rose-600 shrink-0" size={18} />
                  <p className="text-xs text-rose-800 dark:text-rose-300 font-medium leading-relaxed">
                    Atenção: A restauração irá apagar todos os dados atuais (obras, lançamentos financeiros e configurações) e substituí-los pelo conteúdo deste ficheiro. Esta ação é irreversível.
                  </p>
                </div>

                <button 
                  onClick={() => setShowConfirmModal(true)}
                  className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-700 shadow-lg shadow-rose-500/20 transition-all"
                >
                  Confirmar Restauro de Dados
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feedback Messages */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 rounded-2xl flex items-center gap-3 text-rose-600">
              <AlertTriangle size={18} />
              <span className="text-xs font-bold uppercase tracking-wider">{error}</span>
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl flex items-center gap-3 text-emerald-600">
              <CheckCircle2 size={18} />
              <span className="text-xs font-bold uppercase tracking-wider">{success}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-slate-200 dark:border-slate-800">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white">
              <Info size={16} className="text-indigo-500" />
              <h4 className="text-[10px] font-black uppercase tracking-widest">Integridade</h4>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Cada backup inclui metadados de versão para garantir que o restauro seja compatível com a arquitetura atual do sistema.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white">
              <History size={16} className="text-indigo-500" />
              <h4 className="text-[10px] font-black uppercase tracking-widest">Continuidade</h4>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
              O ficheiro .canteiro protege a base de dados lógica. Anexos físicos (fotos/PDFs) dependem da persistência do storage.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white">
              <ShieldCheck size={16} className="text-indigo-500" />
              <h4 className="text-[10px] font-black uppercase tracking-widest">Privacidade</h4>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Dados de autenticação e tokens sensíveis são ofuscados durante a exportação para garantir conformidade com a LGPD/GDPR.
            </p>
          </div>
        </div>

      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800"
            >
              <div className="p-8 space-y-6">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-full flex items-center justify-center animate-pulse">
                    <AlertTriangle size={32} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Ação de Alto Risco</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Para proceder com a substituição total da base de dados, digite <span className="font-black text-rose-600">CONFIRMAR</span> no campo abaixo.
                    </p>
                  </div>
                </div>

                <input 
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                  placeholder="DIGITE AQUI..."
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-center font-black tracking-widest focus:border-rose-500 focus:ring-0 transition-colors"
                />

                <div className="flex gap-3">
                  <button 
                    onClick={() => { setShowConfirmModal(false); setConfirmText(''); }}
                    className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    disabled={confirmText !== 'CONFIRMAR' || isProcessing}
                    onClick={handleRestore}
                    className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-700 disabled:opacity-30 disabled:grayscale transition-all flex items-center justify-center gap-2"
                  >
                    {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                    Executar Restauro
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Processing Overlay */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-6"
          >
            <div className="relative">
              <div className="w-24 h-24 border-4 border-indigo-100 dark:border-indigo-900/30 rounded-full" />
              <div className="absolute inset-0 w-24 h-24 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-indigo-600">
                <Database size={32} className="animate-pulse" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                {processType === 'export' ? 'Criptografando Dump...' : 'Reconstruindo Base de Dados...'}
              </h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Aguarde a conclusão do protocolo</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
