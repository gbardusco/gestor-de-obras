
import * as XLSX from 'xlsx';
import { WorkItem, Project, ItemType } from '../types';
import { financial } from '../utils/math';

export interface ImportResult {
  items: WorkItem[];
  errors: string[];
  stats: {
    categories: number;
    items: number;
  };
}

export const excelService = {
  downloadTemplate: () => {
    const wb = XLSX.utils.book_new();
    const data = [
      ["Tipo (category ou item)", "Nome", "Pai (Nome da Categoria)", "Unidade", "Qtd_Contrato", "Preco_Unitario_Sem_BDI"],
      ["category", "1. INFRAESTRUTURA", "", "", "", ""],
      ["item", "Estaca Escavada", "1. INFRAESTRUTURA", "m", "150", "95.50"],
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Estrutura");
    XLSX.writeFile(wb, "Template_ProMeasure.xlsx");
  },

  /**
   * Exporta a planilha formatada
   */
  exportProjectToExcel: (project: Project, flattenedItems: (WorkItem & { depth: number })[]) => {
    const wb = XLSX.utils.book_new();
    
    const reportHeader = [
      [project.companyName.toUpperCase()],
      ["RELATÓRIO DE MEDIÇÃO CONSOLIDADO"],
      [`Projeto: ${project.name}`],
      [`Medição: #${project.measurementNumber} | BDI: ${project.bdi}%`],
      [],
      ["WBS", "DESCRIÇÃO", "UND", "QTD CONTRATO", "P. UNIT (C/ BDI)", "TOTAL PERÍODO", "TOTAL ACUMULADO", "% ACUM."]
    ];

    const rows = flattenedItems.map(item => [
      item.wbs,
      "  ".repeat(item.depth) + item.name,
      item.unit || "-",
      item.type === 'item' ? item.contractQuantity : "-",
      item.type === 'item' ? item.unitPrice : "-",
      item.currentTotal,
      item.accumulatedTotal,
      (item.accumulatedPercentage / 100)
    ]);

    const ws = XLSX.utils.aoa_to_sheet([...reportHeader, ...rows]);

    // Configuração de colunas
    ws['!cols'] = [
      { wch: 10 }, { wch: 50 }, { wch: 8 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 10 }
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Medição");
    XLSX.writeFile(wb, `Medicao_${project.measurementNumber}_${project.name}.xlsx`);
  },

  parseAndValidate: async (file: File): Promise<ImportResult> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const json: any[] = XLSX.utils.sheet_to_json(worksheet);

          const items: WorkItem[] = [];
          const nameToId: Record<string, string> = {};
          const stats = { categories: 0, items: 0 };

          json.forEach(row => {
            const name = String(row.Nome || '').trim();
            if (name) nameToId[name] = crypto.randomUUID();
          });

          json.forEach((row, idx) => {
            const name = String(row.Nome || '').trim();
            if (!name) return;
            
            const typeRaw = String(row[Object.keys(row)[0]] || '').toLowerCase();
            const type: ItemType = typeRaw.includes('cat') ? 'category' : 'item';
            const parentName = String(row.Pai || '').trim();

            items.push({
              id: nameToId[name],
              parentId: parentName ? (nameToId[parentName] || null) : null,
              name,
              type,
              wbs: '',
              order: idx,
              unit: row.Unidade || 'un',
              contractQuantity: Number(row.Qtd_Contrato || 0),
              unitPrice: 0,
              unitPriceNoBdi: Number(row.Preco_Unitario_Sem_BDI || row.Preco_Unitario || 0),
              contractTotal: 0,
              previousQuantity: 0, previousTotal: 0, currentQuantity: 0, currentTotal: 0, currentPercentage: 0,
              accumulatedQuantity: 0, accumulatedTotal: 0, accumulatedPercentage: 0, balanceQuantity: 0, balanceTotal: 0
            });
            if (type === 'item') stats.items++; else stats.categories++;
          });

          resolve({ items, errors: [], stats });
        } catch (err) { reject(err); }
      };
      reader.readAsArrayBuffer(file);
    });
  }
};
