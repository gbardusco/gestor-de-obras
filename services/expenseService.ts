
import { ProjectExpense, ExpenseType } from '../types';
import { financial } from '../utils/math';

export const expenseService = {
  /**
   * Calcula o subtotal de uma categoria específica de gasto
   */
  calculateSubtotal: (expenses: ProjectExpense[], type: ExpenseType): number => {
    const filtered = expenses.filter(e => e.type === type);
    return financial.sum(filtered.map(e => e.amount));
  },

  /**
   * Consolida todos os gastos do projeto
   */
  calculateTotalExpenses: (expenses: ProjectExpense[]): number => {
    return financial.sum(expenses.map(e => e.amount));
  },

  /**
   * Retorna estatísticas detalhadas por tipo
   */
  getExpenseStats: (expenses: ProjectExpense[]) => {
    const labor = expenseService.calculateSubtotal(expenses, 'labor');
    const material = expenseService.calculateSubtotal(expenses, 'material');
    const total = financial.round(labor + material);

    return {
      labor,
      material,
      total,
      laborPercentage: total > 0 ? (labor / total) * 100 : 0,
      materialPercentage: total > 0 ? (material / total) * 100 : 0
    };
  }
};
