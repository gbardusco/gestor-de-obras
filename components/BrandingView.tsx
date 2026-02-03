
import React, { useRef } from 'react';
import { Project, PDFTheme } from '../types';
import { ThemeEditor } from './ThemeEditor';
import { 
  Percent, MapPin, Upload, 
  Image as ImageIcon, Trash2, FileText, 
  CheckCircle2, Building2, Palette, Settings2,
  ToggleRight, ToggleLeft, Cpu, Globe
} from 'lucide-react';

interface BrandingViewProps {
  project: Project;
  onUpdateProject: (data: Partial<Project>) => void;
  isReadOnly?: boolean;
}

export const BrandingView: React.FC<BrandingViewProps> = ({ 
  project, onUpdateProject, isReadOnly 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("A imagem deve ter no máximo 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      onUpdateProject({ logo: event.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  const toggleConfig = (key: keyof typeof project.config) => {
    onUpdateProject({
      config: {
        ...project.config,
        [key]: !project.config[key]
      }
    });
  };

  return (
<<<<<<< HEAD
    <div className="max-w-6xl mx-auto space-y-16 animate-in fade-in duration-700 pb-24 px-4">
      {/* HEADER DA PÁGINA */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-10">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-indigo-600 rounded-[1.5rem] text-white shadow-xl shadow-indigo-500/20">
            <Settings2 size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Ajustes do Projeto</h1>
            <p className="text-slate-500 font-medium mt-2">Configurações institucionais, métricas e identidade visual.</p>
          </div>
        </div>
      </header>

      {/* CATEGORIA 1: IDENTIDADE INSTITUCIONAL */}
      <section className="space-y-8">
        <div className="flex items-center gap-3">
          <Building2 className="text-indigo-500" size={20} />
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Identidade & Localização</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* UPLOAD DE LOGOMARCA */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-xl"><ImageIcon size={20} /></div>
                <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Logomarca</h3>
              </div>
              {project.logo && (
                <button 
                  onClick={() => onUpdateProject({ logo: null })}
                  className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
=======
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700 pb-24 px-4">
      {/* TÍTULO DA PÁGINA */}
      <header className="flex items-center gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
        <div className="p-4 bg-indigo-600 rounded-3xl text-white shadow-xl shadow-indigo-500/20">
          <Settings2 size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Personalização do Projeto</h1>
          <p className="text-slate-500 font-medium">Configure a identidade institucional e parâmetros de engenharia.</p>
        </div>
      </header>

      {/* SEÇÃO 1: IDENTIDADE & PRESENÇA */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 ml-2">
          <Building2 className="text-indigo-500" size={20} />
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Identidade & Localização</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LOGO */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-xl"><ImageIcon size={18} /></div>
                <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Logomarca Oficial</h3>
              </div>
              {project.logo && (
                <button onClick={() => onUpdateProject({ logo: null })} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                  <Trash2 size={14} />
>>>>>>> 6b5afb1fea73f4224dfbd1ebe3972ed622b8485e
                </button>
              )}
            </div>

            <div 
<<<<<<< HEAD
              className="w-full h-40 rounded-[2rem] border-2 border-dashed border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center relative overflow-hidden group hover:border-indigo-500 transition-all cursor-pointer bg-slate-50 dark:bg-slate-950"
=======
              className="w-full h-44 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center relative overflow-hidden group hover:border-indigo-500 transition-all cursor-pointer bg-slate-50 dark:bg-slate-950"
>>>>>>> 6b5afb1fea73f4224dfbd1ebe3972ed622b8485e
              onClick={() => !isReadOnly && fileInputRef.current?.click()}
            >
              {project.logo ? (
                <img src={project.logo} className="w-full h-full object-contain p-6" alt="Logo" />
              ) : (
                <div className="flex flex-col items-center gap-3 text-slate-400">
                  <Upload size={24} />
<<<<<<< HEAD
                  <span className="text-[10px] font-black uppercase tracking-widest">Upload PNG/JPG (2MB)</span>
=======
                  <span className="text-[9px] font-black uppercase tracking-widest">Upload PNG/JPG (Máx 2MB)</span>
>>>>>>> 6b5afb1fea73f4224dfbd1ebe3972ed622b8485e
                </div>
              )}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={isReadOnly} />
            </div>
          </div>

          {/* LOCALIZAÇÃO */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-6">
            <div className="flex items-center gap-3">
<<<<<<< HEAD
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-xl"><MapPin size={20} /></div>
              <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Endereço da Obra</h3>
=======
              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-xl"><MapPin size={18} /></div>
              <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Endereço do Empreendimento</h3>
>>>>>>> 6b5afb1fea73f4224dfbd1ebe3972ed622b8485e
            </div>
            <div className="flex-1 flex flex-col justify-center gap-4">
              <input 
                disabled={isReadOnly}
                type="text" 
                className="w-full px-6 py-5 rounded-2xl border-2 border-slate-50 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-black focus:border-indigo-500 outline-none dark:text-slate-100 transition-all" 
                value={project.location} 
<<<<<<< HEAD
                placeholder="Ex: Curitiba - PR / Av. Batel, 1200"
                onChange={(e) => onUpdateProject({ location: e.target.value })} 
              />
              <p className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest italic flex items-center justify-center gap-2">
                <Globe size={12} /> Visível no cabeçalho do PDF.
              </p>
=======
                placeholder="Ex: Brasília - DF / SHN Quadra 02"
                onChange={(e) => onUpdateProject({ location: e.target.value })} 
              />
              <div className="flex items-center gap-2 text-slate-400">
                <Globe size={12} />
                <p className="text-[9px] font-bold uppercase tracking-widest">Este endereço será impresso no cabeçalho do PDF.</p>
              </div>
>>>>>>> 6b5afb1fea73f4224dfbd1ebe3972ed622b8485e
            </div>
          </div>
        </div>
      </section>

<<<<<<< HEAD
      {/* CATEGORIA 2: ENGENHARIA & REGRAS */}
      <section className="space-y-8">
        <div className="flex items-center gap-3">
          <Cpu className="text-emerald-500" size={20} />
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Engenharia & Compliance</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* TAXA DE BDI */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-xl"><Percent size={20} /></div>
              <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Taxa de BDI</h3>
=======
      {/* SEÇÃO 2: ENGENHARIA & PARÂMETROS */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 ml-2">
          <Cpu className="text-emerald-500" size={20} />
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Engenharia & Parâmetros</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* BDI */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-xl"><Percent size={18} /></div>
              <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Taxa de BDI Global</h3>
>>>>>>> 6b5afb1fea73f4224dfbd1ebe3972ed622b8485e
            </div>
            <div className="relative">
              <input 
                disabled={isReadOnly}
                type="number" 
                step="0.01" 
                className="w-full px-8 py-6 rounded-3xl border-2 border-slate-50 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-4xl font-black focus:border-emerald-500 outline-none pr-20 dark:text-slate-100 transition-all" 
                value={project.bdi} 
                onChange={(e) => onUpdateProject({ bdi: parseFloat(e.target.value) || 0 })} 
              />
              <span className="absolute right-8 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">%</span>
            </div>
<<<<<<< HEAD
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Fator Multiplicador: <span className="text-emerald-600">{(1 + project.bdi/100).toFixed(4)}x</span></p>
          </div>

          {/* OPÇÕES DO RELATÓRIO (PDF CONFIG) */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-xl"><FileText size={20} /></div>
              <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Opções do PDF</h3>
            </div>
            
            <div className="space-y-3">
              {/* TOGGLE ASSINATURAS */}
              <button 
                onClick={() => toggleConfig('showSignatures')}
                disabled={isReadOnly}
                className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${project.config?.showSignatures ? 'border-indigo-100 bg-indigo-50/50 dark:bg-indigo-900/10 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300' : 'border-slate-100 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 text-slate-400'}`}
              >
                <div className="flex items-center gap-3">
                  <FileText size={18} />
                  <span className="text-xs font-black uppercase tracking-widest">Bloco de Assinaturas</span>
=======
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Fator Multiplicador Atual: <span className="text-emerald-600">{(1 + project.bdi/100).toFixed(4)}x</span></p>
          </div>

          {/* OPÇÕES DO PDF */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-xl"><FileText size={18} /></div>
              <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Configurações de Exportação</h3>
            </div>
            
            <div className="space-y-3">
              <button 
                onClick={() => toggleConfig('showSignatures')}
                disabled={isReadOnly}
                className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${project.config?.showSignatures ? 'border-indigo-100 bg-indigo-50/50 dark:bg-indigo-900/10 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 shadow-sm' : 'border-slate-100 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 text-slate-400'}`}
              >
                <div className="flex items-center gap-3">
                  <FileText size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Bloco de Assinaturas</span>
>>>>>>> 6b5afb1fea73f4224dfbd1ebe3972ed622b8485e
                </div>
                {project.config?.showSignatures ? <ToggleRight size={28} className="text-indigo-600" /> : <ToggleLeft size={28} />}
              </button>

              <button 
                onClick={() => toggleConfig('printSubtotals')}
                disabled={isReadOnly}
<<<<<<< HEAD
                className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${project.config?.printSubtotals ? 'border-indigo-100 bg-indigo-50/50 dark:bg-indigo-900/10 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300' : 'border-slate-100 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 text-slate-400'}`}
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={18} />
                  <span className="text-xs font-black uppercase tracking-widest">Subtotais por Grupo</span>
=======
                className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${project.config?.printSubtotals ? 'border-indigo-100 bg-indigo-50/50 dark:bg-indigo-900/10 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 shadow-sm' : 'border-slate-100 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 text-slate-400'}`}
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Subtotais Grupos</span>
>>>>>>> 6b5afb1fea73f4224dfbd1ebe3972ed622b8485e
                </div>
                {project.config?.printSubtotals ? <ToggleRight size={28} className="text-indigo-600" /> : <ToggleLeft size={28} />}
              </button>
            </div>
          </div>
        </div>
      </section>

<<<<<<< HEAD
      {/* CATEGORIA 3: ESTÉTICA & DESIGN (FULL WIDTH) */}
      <section className="space-y-8">
        <div className="flex items-center gap-3">
          <Palette className="text-rose-500" size={20} />
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Design & Engine Visual</h2>
=======
      {/* SEÇÃO 3: DESIGN ENGINE */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 ml-2">
          <Palette className="text-rose-500" size={20} />
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Design & Engine Visual</h2>
>>>>>>> 6b5afb1fea73f4224dfbd1ebe3972ed622b8485e
        </div>

        <div className="bg-white dark:bg-slate-900 p-2 sm:p-10 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
          <ThemeEditor 
            theme={project.theme} 
            onChange={(theme: PDFTheme) => !isReadOnly && onUpdateProject({ theme })} 
          />
        </div>
      </section>
    </div>
  );
};
