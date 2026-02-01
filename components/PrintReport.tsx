import React from 'react';
import { Project, WorkItem, ProjectExpense } from '../types';
import { financial } from '../utils/math';
import { HardHat } from 'lucide-react';

interface PrintReportProps {
  project: Project;
  companyName: string; 
  companyCnpj: string;
  data: (WorkItem & { depth: number })[];
  expenses: ProjectExpense[];
  stats: {
    contract: number;
    current: number;
    accumulated: number;
    balance: number;
    progress: number;
  };
}

export const PrintReport: React.FC<PrintReportProps> = ({ project, companyName, companyCnpj, data, stats }) => {
  const theme = project.theme;

  const dynamicStyles = `
    .print-report-area {
      font-family: '${theme.fontFamily}', sans-serif !important;
      color: black !important;
      background: white !important;
      width: 100% !important;
    }

    .header-main-title {
      font-size: 24pt !important;
      font-weight: 900 !important;
      text-transform: uppercase;
      letter-spacing: -1px;
      line-height: 1;
    }

    .report-table {
      width: 100% !important;
      border-collapse: collapse !important;
    }

    .report-table th, .report-table td {
      border: 0.5pt solid black !important;
      padding: 2pt 3pt !important;
      font-size: 6pt !important;
      text-transform: uppercase;
      vertical-align: middle;
    }

    .report-table thead th {
      background-color: #0f172a !important;
      color: white !important;
      font-weight: 900;
      text-align: center;
    }

    .bg-medi-period {
      background-color: #2563eb !important;
      color: white !important;
    }

    .cell-medi-period {
      background-color: #eff6ff !important;
      color: #2563eb !important;
      font-weight: 900;
    }

    .row-category {
      background-color: #f8fafc !important;
      font-weight: 900;
    }

    .col-wbs { width: 30pt; text-align: center; }
    .col-cod { width: 40pt; text-align: center; }
    .col-fonte { width: 35pt; text-align: center; }
    .col-desc { width: auto; text-align: left; }
    .col-und { width: 25pt; text-align: center; }
    .col-price { width: 45pt; text-align: right; }
    .col-qty { width: 30pt; text-align: center; }
    .col-total { width: 60pt; text-align: right; }
    .col-perc { width: 30pt; text-align: center; }

    .footer-box {
      border: 1pt solid black;
      padding: 10pt;
      text-align: center;
      border-radius: 4pt;
    }
  `;

  return (
    <div className="print-report-area">
      <style dangerouslySetInnerHTML={{ __html: dynamicStyles }} />

      {/* CABEÇALHO IGUAL AO SCREENSHOT */}
      <div className="flex justify-between items-start mb-6 border-b-2 border-black pb-4">
        <div className="flex items-center gap-6">
          {project.logo ? (
            <img src={project.logo} className="h-16 w-auto object-contain" alt="Logo" />
          ) : (
            <div className="w-14 h-14 bg-black text-white flex items-center justify-center rounded">
              <HardHat size={32} />
            </div>
          )}
          <div>
            <h1 className="header-main-title">{companyName || project.companyName}</h1>
            <p className="text-[9pt] font-bold text-slate-500 uppercase tracking-widest mt-1">
              CNPJ: {companyCnpj || '12.345.678/0001-90'}
            </p>
          </div>
        </div>

        <div className="text-right">
          <h2 className="header-main-title">Planilha de Medição</h2>
          <div className="mt-2 flex items-center justify-end gap-0 overflow-hidden rounded-md border border-black">
             <div className="bg-black text-white px-4 py-1 font-black text-[9pt]">
                MEDIÇÃO Nº {project.measurementNumber}
             </div>
             <div className="px-4 py-1 font-bold text-[9pt] bg-slate-100">
                DATA: {project.referenceDate}
             </div>
          </div>
        </div>
      </div>

      {/* QUADRO DE INFOS DA OBRA */}
      <div className="flex border border-black mb-6 text-[7pt] font-black uppercase">
        <div className="flex-1 p-2 border-r border-black">
          <div className="text-[5pt] text-slate-400 mb-0.5">Obra</div>
          <div>{project.name}</div>
        </div>
        <div className="flex-1 p-2 border-r border-black">
          <div className="text-[5pt] text-slate-400 mb-0.5">Local da Obra</div>
          <div>{project.location || 'Brasil'}</div>
        </div>
        <div className="w-48 p-2 text-right">
          <div className="text-[5pt] text-slate-400 mb-0.5">Status Físico Global</div>
          <div className="text-blue-600">{stats.progress.toFixed(2)}% Concluído</div>
        </div>
      </div>

      {/* TABELA TÉCNICA 18 COLUNAS */}
      <table className="report-table">
        <thead>
          <tr>
            <th rowSpan={2} className="col-wbs">ITEM</th>
            <th rowSpan={2} className="col-cod">CÓD</th>
            <th rowSpan={2} className="col-fonte">FONTE</th>
            <th rowSpan={2} className="col-desc">DESCRIÇÃO</th>
            <th rowSpan={2} className="col-und">UND</th>
            <th colSpan={2}>UNITÁRIO (R$)</th>
            <th rowSpan={2} className="col-qty">QTD CONTR</th>
            <th rowSpan={2} className="col-total">TOTAL CONTR</th>
            <th colSpan={2}>ACUM. ANTERIOR</th>
            <th colSpan={2} className="bg-medi-period">MEDIÇÃO PERÍODO</th>
            <th colSpan={2}>ACUM. TOTAL</th>
            <th colSpan={2}>SALDO A REALIZAR</th>
            <th rowSpan={2} className="col-perc">% EXEC</th>
          </tr>
          <tr>
            <th className="col-price">S/ BDI</th>
            <th className="col-price">C/ BDI</th>
            <th className="col-qty">QTD</th>
            <th className="col-total">TOTAL</th>
            <th className="col-qty bg-medi-period">QTD</th>
            <th className="col-total bg-medi-period">TOTAL</th>
            <th className="col-qty">QTD</th>
            <th className="col-total">TOTAL</th>
            <th className="col-qty">QTD</th>
            <th className="col-total">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => {
            const isCat = item.type === 'category';
            return (
              <tr key={item.id} className={isCat ? 'row-category' : ''}>
                <td className="text-center">{item.wbs}</td>
                <td className="text-center">{item.cod || '-'}</td>
                <td className="text-center">{item.fonte || '-'}</td>
                <td style={{ paddingLeft: isCat ? '3pt' : (item.depth * 8 + 8) + 'pt' }}>
                  {item.name}
                </td>
                <td className="text-center">{isCat ? '-' : item.unit}</td>
                <td className="text-right">{!isCat ? financial.formatVisual(item.unitPriceNoBdi) : '-'}</td>
                <td className="text-right font-bold">{!isCat ? financial.formatVisual(item.unitPrice) : '-'}</td>
                <td className="text-center">{!isCat ? item.contractQuantity : '-'}</td>
                <td className="text-right font-bold">{financial.formatVisual(item.contractTotal)}</td>
                <td className="text-center">{!isCat ? item.previousQuantity : '-'}</td>
                <td className="text-right">{financial.formatVisual(item.previousTotal)}</td>
                <td className="text-center cell-medi-period">{!isCat ? (item.currentQuantity || '-') : '-'}</td>
                <td className="text-right cell-medi-period">{financial.formatVisual(item.currentTotal)}</td>
                <td className="text-center font-bold">{!isCat ? item.accumulatedQuantity : '-'}</td>
                <td className="text-right font-bold">{financial.formatVisual(item.accumulatedTotal)}</td>
                <td className="text-center">{!isCat ? item.balanceQuantity : '-'}</td>
                <td className="text-right">{financial.formatVisual(item.balanceTotal)}</td>
                <td className="text-center font-black">{item.accumulatedPercentage.toFixed(1)}%</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot className="bg-black text-white font-black text-[7pt]">
          <tr>
            <td colSpan={8} className="text-right py-2 pr-4">TOTAIS GERAIS DA MEDIÇÃO</td>
            <td className="text-right pr-2">{financial.formatVisual(stats.contract)}</td>
            <td></td>
            <td className="text-right pr-2">{financial.formatVisual(stats.accumulated - stats.current)}</td>
            <td></td>
            <td className="text-right pr-2">{financial.formatVisual(stats.current)}</td>
            <td></td>
            <td className="text-right pr-2">{financial.formatVisual(stats.accumulated)}</td>
            <td></td>
            <td className="text-right pr-2">{financial.formatVisual(stats.balance)}</td>
            <td className="text-center">{stats.progress.toFixed(1)}%</td>
          </tr>
        </tfoot>
      </table>

      {/* DASHBOARD KPI (RODAPÉ) */}
      <div className="grid grid-cols-4 gap-6 mt-8">
        <div className="footer-box">
          <div className="text-[6pt] font-black text-slate-400 uppercase">Valor Total Contrato</div>
          <div className="text-[12pt] font-black">{financial.formatBRL(stats.contract)}</div>
        </div>
        <div className="footer-box border-blue-600 bg-blue-50">
          <div className="text-[6pt] font-black text-blue-600 uppercase">Medição do Período</div>
          <div className="text-[12pt] font-black text-blue-700">{financial.formatBRL(stats.current)}</div>
        </div>
        <div className="footer-box">
          <div className="text-[6pt] font-black text-slate-400 uppercase">Acumulado Atual</div>
          <div className="text-[12pt] font-black">{financial.formatBRL(stats.accumulated)}</div>
        </div>
        <div className="footer-box">
          <div className="text-[6pt] font-black text-slate-400 uppercase">Saldo a Executar</div>
          <div className="text-[12pt] font-black">{financial.formatBRL(stats.balance)}</div>
        </div>
      </div>

      {/* BLOCO DE ASSINATURAS */}
      <div className="mt-16 grid grid-cols-3 gap-16 text-center px-8">
        <div>
          <div className="border-t-2 border-black mb-2"></div>
          <div className="text-[8pt] font-black uppercase">Responsável Técnico</div>
          <div className="text-[6pt] font-bold text-slate-400">CREA / CAU</div>
        </div>
        <div>
          <div className="border-t-2 border-black mb-2"></div>
          <div className="text-[8pt] font-black uppercase">Fiscalização</div>
          <div className="text-[6pt] font-bold text-slate-400">Assinatura e Carimbo</div>
        </div>
        <div>
          <div className="border-t-2 border-black mb-2"></div>
          <div className="text-[8pt] font-black uppercase">Gestor do Contrato</div>
          <div className="text-[6pt] font-bold text-slate-400">Liberação Financeira</div>
        </div>
      </div>
    </div>
  );
};