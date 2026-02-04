
import React, { useState } from 'react';
import { Paperclip, FileText, ImageIcon, CheckCircle, X, ExternalLink, Loader2 } from 'lucide-react';

interface ExpenseAttachmentZoneProps {
  label: string;
  onFileLoaded: (base64: string, fileName: string) => void;
  currentFile?: string;
  acceptedTypes?: string;
  isPaid?: boolean;
}

export const ExpenseAttachmentZone: React.FC<ExpenseAttachmentZoneProps> = ({ 
  label, onFileLoaded, currentFile, acceptedTypes = "image/*,application/pdf", isPaid 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFile = (file: File) => {
    if (!file) return;
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onFileLoaded(result, file.name);
      setIsProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const isPDF = currentFile?.startsWith('data:application/pdf');

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">{label}</label>
      
      <div 
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative h-24 rounded-2xl border-2 border-dashed transition-all flex items-center justify-center gap-4 px-6 cursor-pointer overflow-hidden ${
          isDragging ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 
          currentFile ? 'border-emerald-200 bg-emerald-50/30 dark:border-emerald-900/40' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950'
        }`}
        onClick={() => !currentFile && document.getElementById(`file-${label}`)?.click()}
      >
        <input 
          id={`file-${label}`}
          type="file" 
          className="hidden" 
          accept={acceptedTypes} 
          onChange={(e) => e.target.files && handleFile(e.target.files[0])}
        />

        {isProcessing ? (
          <div className="flex items-center gap-3 text-indigo-600">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-[10px] font-black uppercase">Processando...</span>
          </div>
        ) : currentFile ? (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-xl border border-emerald-100 dark:border-emerald-800 flex items-center justify-center text-emerald-600 shadow-sm relative group">
                {isPDF ? <FileText size={24} /> : <img src={currentFile} className="w-full h-full object-cover rounded-xl" />}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl">
                  <ExternalLink size={16} className="text-white" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle size={12} className="text-emerald-500" />
                  <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase">Documento Anexado</span>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); window.open(currentFile); }}
                  className="text-[9px] font-bold text-slate-400 hover:text-indigo-600 uppercase"
                >
                  Visualizar Arquivo
                </button>
              </div>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); onFileLoaded('', ''); }}
              className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center text-slate-400">
            <Paperclip size={20} className="mb-1" />
            <span className="text-[9px] font-black uppercase tracking-widest text-center">Arraste ou clique p/ anexar</span>
          </div>
        )}
      </div>
    </div>
  );
};
