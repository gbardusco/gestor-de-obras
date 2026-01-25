
export const financial = {
  /**
   * Arredondamento financeiro padrão (2 casas decimais).
   * Usa uma abordagem robusta para evitar imprecisões de ponto flutuante do JS.
   */
  round: (value: number): number => {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  },
  
  formatBRL: (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  },

  sum: (values: number[]): number => {
    return financial.round(values.reduce((acc, val) => acc + val, 0));
  }
};
