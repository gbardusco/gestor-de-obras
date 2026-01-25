
import * as XLSX from 'xlsx';
import { WorkItem, ItemType } from '../types';

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

    // Instructions Sheet
    const instructions = [
      ["MANUAL DE PREENCHIMENTO - PROMEASURE"],
      ["1. TIPO: Use 'category' para grupos e 'item' para serviços."],
      ["2. PAI: Digite o NOME EXATO da categoria superior."],
      ["3. UNIDADE: Obrigatória apenas para 'item'."],
      ["4. QTD e PREÇO: Use números. Apenas para 'item'."],
      ["5. HIERARQUIA: O sistema aceita níveis ilimitados (Subcategorias)."],
      [],
      ["ESTRUTURA EXEMPLO ABAIXO:"]
    ];
    const wsInstructions = XLSX.utils.aoa_to_sheet(instructions);
    XLSX.utils.book_append_sheet(wb, wsInstructions, "Instruções");

    // Pre-filled Data Sheet
    const data = [
      ["Tipo", "Nome", "Pai", "Unidade", "Qtd_Contrato", "Preco_Unitario"],
      ["category", "1. INFRAESTRUTURA", "", "", "", ""],
      ["category", "1.1 FUNDAÇÕES", "1.1 INFRAESTRUTURA", "", "", ""],
      ["item", "Estaca Escavada Diam=30cm", "1.1 FUNDAÇÕES", "m", "150", "95.50"],
      ["item", "Bloco de Coroamento", "1.1 FUNDAÇÕES", "m³", "12.5", "1250.00"],
      ["category", "1.2 MOVIMENTAÇÃO DE TERRA", "1.1 INFRAESTRUTURA", "", "", ""],
      ["item", "Escavação Mecânica", "1.2 MOVIMENTAÇÃO DE TERRA", "m³", "240", "22.30"],
      ["category", "2. SUPERESTRUTURA", "", "", "", ""],
      ["item", "Laje Maciça e=12cm", "2. SUPERESTRUTURA", "m²", "180", "145.00"],
      ["item", "Pilar P1 a P10", "2. SUPERESTRUTURA", "m³", "8.4", "2100.00"]
    ];

    // Correction: In the example, the WBS numbering in the names helps, 
    // but the system maps by the "Nome" and "Pai" strings.
    // Fixed the parent reference in dummy data for clarity.
    data[2][2] = "1. INFRAESTRUTURA"; // Correcting parent ref for sub-cat
    data[5][2] = "1. INFRAESTRUTURA"; // Correcting parent ref for sub-cat

    const wsData = XLSX.utils.aoa_to_sheet(data);
    
    // Set column widths for better UX
    const wscols = [
      { wch: 12 }, // Tipo
      { wch: 40 }, // Nome
      { wch: 40 }, // Pai
      { wch: 10 }, // Unidade
      { wch: 15 }, // Qtd
      { wch: 15 }, // Preço
    ];
    wsData['!cols'] = wscols;

    XLSX.utils.book_append_sheet(wb, wsData, "Estrutura");
    XLSX.writeFile(wb, "Template_ProMeasure_Engenharia.xlsx");
  },

  parseAndValidate: async (file: File): Promise<ImportResult> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const worksheet = workbook.Sheets["Estrutura"] || workbook.Sheets[workbook.SheetNames[0]];
          const json: any[] = XLSX.utils.sheet_to_json(worksheet);

          const items: WorkItem[] = [];
          const errors: string[] = [];
          const stats = { categories: 0, items: 0 };
          const nameToIdMap: Record<string, string> = {};

          // First Pass: Collect all category and item IDs by name
          json.forEach((row) => {
            const name = String(row.Nome || '').trim();
            if (name) nameToIdMap[name] = crypto.randomUUID();
          });

          // Second Pass: Build objects and validate
          json.forEach((row, index) => {
            const rowNum = index + 2;
            const typeInput = String(row.Tipo || '').toLowerCase().trim();
            const type = typeInput === 'category' || typeInput === 'categoria' ? 'category' : 'item';
            const name = String(row.Nome || '').trim();
            const parentName = String(row.Pai || '').trim();

            if (!name) {
              errors.push(`Linha ${rowNum}: O nome é obrigatório.`);
              return;
            }

            const id = nameToIdMap[name];
            const parentId = parentName ? (nameToIdMap[parentName] || null) : null;

            if (parentName && !nameToIdMap[parentName]) {
              errors.push(`Linha ${rowNum}: Categoria pai '${parentName}' não encontrada na planilha.`);
            }

            const newItem: WorkItem = {
              id,
              parentId,
              name,
              type,
              wbs: '',
              order: index,
              unit: String(row.Unidade || ''),
              cod: String(row.Codigo || ''),
              fonte: 'Importado',
              contractQuantity: Number(row.Qtd_Contrato || 0),
              unitPrice: Number(row.Preco_Unitario || 0),
              unitPriceNoBdi: Number(row.Preco_Unitario || 0),
              contractTotal: 0,
              previousQuantity: 0,
              previousTotal: 0,
              currentQuantity: 0,
              currentTotal: 0,
              currentPercentage: 0,
              accumulatedQuantity: 0,
              accumulatedTotal: 0,
              accumulatedPercentage: 0,
              balanceQuantity: 0,
              balanceTotal: 0
            };

            if (type === 'item') {
              stats.items++;
              if (!newItem.unit) errors.push(`Linha ${rowNum}: Item '${name}' exige uma unidade.`);
              if (newItem.contractQuantity <= 0) errors.push(`Linha ${rowNum}: Item '${name}' exige quantidade > 0.`);
            } else {
              stats.categories++;
            }

            items.push(newItem);
          });

          resolve({ items, errors, stats });
        } catch (err) {
          reject("Falha ao ler Excel. Verifique se o arquivo está corrompido.");
        }
      };
      reader.readAsArrayBuffer(file);
    });
  }
};
