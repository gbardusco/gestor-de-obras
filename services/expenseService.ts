
import { ProjectExpense, ExpenseType, ProjectJournal, ExpenseStatus } from '../types';
import { financial } from '../utils/math';
import { journalService } from './journalService';

export const expenseService = {
  calculateSubtotal: (expenses: ProjectExpense[], type: ExpenseType): number => {
    const filtered = expenses.filter(e => e.type === type && e.itemType === 'item');
    return financial.sum(filtered.map(e => e.amount));
  },

  getExpenseStats: (expenses: ProjectExpense[]) => {
    const items = expenses.filter(e => e.itemType === 'item');
    
    const labor = financial.sum(items.filter(e => e.type === 'labor').map(e => e.amount));
    const material = financial.sum(items.filter(e => e.type === 'material').map(e => e.amount));
    
    const revenue = financial.sum(items.filter(e => e.type === 'revenue' && (e.isPaid || e.status === 'PAID')).map(e => e.amount));
    
    const totalOut = financial.round(labor + material);
    
    const paidOut = financial.sum(items.filter(e => (e.type === 'labor' || e.type === 'material') && (e.isPaid || e.status === 'PAID')).map(e => e.amount));
    const unpaidOut = financial.round(totalOut - paidOut);
    
    const profit = financial.round(revenue - totalOut);
    const marginPercent = revenue > 0 ? (profit / revenue) * 100 : 0;

    return {
      labor,
      material,
      revenue,
      totalOut,
      paidOut,
      unpaidOut,
      profit,
      marginPercent,
      distribution: {
        labor: totalOut > 0 ? (labor / totalOut) * 100 : 0,
        material: totalOut > 0 ? (material / totalOut) * 100 : 0
      }
    };
  },

  /**
   * processDelivery
   * Transiciona o item para entregue e gera log automático.
   */
  processDelivery: (expense: ProjectExpense, journal: ProjectJournal): { updatedExpense: ProjectExpense, updatedJournal: ProjectJournal } => {
    const now = new Date();
    const updatedExpense: ProjectExpense = {
      ...expense,
      status: 'DELIVERED',
      deliveryDate: now.toISOString(),
    };

    const logEntry = journalService.createEntry(
      `Recebimento de Material: ${expense.description}`,
      `O material "${expense.description}" do fornecedor ${expense.entityName} foi entregue e conferido conforme Nota Fiscal anexa.`,
      'LOGISTICS',
      'AUTO'
    );

    return {
      updatedExpense,
      updatedJournal: {
        ...journal,
        entries: [logEntry, ...journal.entries]
      }
    };
  }
};
