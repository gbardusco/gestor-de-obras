
import { StockItem, StockMovement, StockMovementType } from '../types';

export const stockService = {
  createItem: (name: string, unit: string, minQuantity: number, order: number): StockItem => ({
    id: crypto.randomUUID(),
    name,
    unit,
    minQuantity,
    currentQuantity: 0,
    movements: [],
    order
  }),

  addMovement: (item: StockItem, type: StockMovementType, quantity: number, responsible: string, notes: string): StockItem => {
    const movement: StockMovement = {
      id: crypto.randomUUID(),
      type,
      quantity,
      date: new Date().toISOString(),
      responsible,
      notes
    };

    const newMovements = [movement, ...item.movements];
    const newQuantity = type === 'entry' 
      ? item.currentQuantity + quantity 
      : item.currentQuantity - quantity;

    return {
      ...item,
      currentQuantity: newQuantity,
      movements: newMovements
    };
  },

  calculateTotalValue: (stock: StockItem[]) => {
    // Note: Since we don't have unit price in StockItem yet, this is a placeholder
    // If we wanted to link with expenses, we could do more complex logic.
    return stock.reduce((acc, item) => acc + item.currentQuantity, 0);
  }
};
