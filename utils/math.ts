
export const financial = {
  round: (value: number): number => {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  },
  
  formatBRL: (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    }).format(value);
  },

  sum: (values: number[]): number => {
    return values.reduce((acc, val) => financial.round(acc + val), 0);
  }
};
