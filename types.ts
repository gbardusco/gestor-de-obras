
export type ItemType = 'category' | 'item';

export interface WorkItem {
  id: string;
  parentId: string | null;
  name: string;
  type: ItemType;
  wbs: string;
  order: number;
  
  // Especificações Técnicas
  unit: string;
  cod?: string;
  fonte?: string;
  
  // Valores de Contrato
  contractQuantity: number;
  unitPrice: number; // C/ BDI
  unitPriceNoBdi: number; // S/ BDI
  contractTotal: number;

  // Medição
  previousQuantity: number; 
  previousTotal: number;
  
  currentQuantity: number; 
  currentTotal: number;
  currentPercentage: number;

  // Totais Acumulados
  accumulatedQuantity: number;
  accumulatedTotal: number;
  accumulatedPercentage: number;
  
  // Saldo
  balanceQuantity: number;
  balanceTotal: number;

  children?: WorkItem[];
}

export interface Project {
  id: string;
  name: string;
  companyName: string;
  measurementNumber: number;
  referenceDate: string;
  logo: string | null;
  items: WorkItem[];
  config: {
    strict: boolean;
    printCards: boolean;
    printSubtotals: boolean;
  };
}

export interface PDFTheme {
  primary: string;
  secondary: string;
  headerBg: string;
  headerText: string;
  rowCategory: string;
  rowItem: string;
  rowTotal: string;
  border: string;
}

export const DEFAULT_THEME: PDFTheme = {
  primary: '#0f172a',
  secondary: '#2563eb',
  headerBg: '#f1f5f9',
  headerText: '#1e293b',
  rowCategory: '#e0f2fe',
  rowItem: '#ffffff',
  rowTotal: '#0f172a',
  border: '#cbd5e1'
};
