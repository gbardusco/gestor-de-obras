
export const financial = {
  /**
   * Arredondamento financeiro padrão (2 casas decimais).
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
  },

  /**
   * Formata data YYYY-MM-DD para DD/MM/YYYY sem sofrer alteração de fuso horário.
   */
  formatDate: (dateStr: string | undefined): string => {
    if (!dateStr) return '—';
    // Se a data vier no formato ISO completo, pegamos apenas a parte da data
    const cleanDate = dateStr.split('T')[0];
    const parts = cleanDate.split('-');
    if (parts.length !== 3) return dateStr;
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
};
