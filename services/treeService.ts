
import { WorkItem } from '../types';
import { financial } from '../utils/math';

export const treeService = {
  buildTree: (items: WorkItem[]): WorkItem[] => {
    const itemMap: { [key: string]: WorkItem } = {};
    const roots: WorkItem[] = [];

    // Resetar filhos para construção limpa
    items.forEach(item => {
      itemMap[item.id] = { ...item, children: [] };
    });

    items.forEach(item => {
      if (item.parentId && itemMap[item.parentId]) {
        itemMap[item.parentId].children!.push(itemMap[item.id]);
      } else {
        roots.push(itemMap[item.id]);
      }
    });

    return roots.sort((a, b) => (a.order || 0) - (b.order || 0));
  },

  /**
   * Processamento recursivo que gera WBS e consolida valores financeiros.
   * O index garante que a numeração reinicie (1.1, 1.2, etc) em cada nível.
   */
  processRecursive: (node: WorkItem, prefix: string = '', index: number = 0, projectBdi: number = 0): WorkItem => {
    const currentPos = index + 1;
    const wbs = prefix ? `${prefix}.${currentPos}` : `${currentPos}`;
    node.wbs = wbs;

    if (node.type === 'category') {
      if (node.children && node.children.length > 0) {
        // Ordenar filhos antes de processar para WBS estável
        node.children.sort((a, b) => (a.order || 0) - (b.order || 0));
        
        // RECURSÃO: Passa o WBS atual como prefixo e o índice da iteração
        node.children = node.children.map((child, idx) => 
          treeService.processRecursive(child, wbs, idx, projectBdi)
        );
        
        // Rollup Financeiro
        node.contractTotal = financial.sum(node.children.map(c => c.contractTotal || 0));
        node.previousTotal = financial.sum(node.children.map(c => c.previousTotal || 0));
        node.currentTotal = financial.sum(node.children.map(c => c.currentTotal || 0));
        node.accumulatedTotal = financial.sum(node.children.map(c => c.accumulatedTotal || 0));
        node.balanceTotal = financial.sum(node.children.map(c => c.balanceTotal || 0));
        
        node.accumulatedPercentage = node.contractTotal > 0 
          ? financial.round((node.accumulatedTotal / node.contractTotal) * 100) 
          : 0;
      } else {
        // Categoria vazia
        node.contractTotal = 0;
        node.currentTotal = 0;
        node.accumulatedTotal = 0;
        node.balanceTotal = 0;
        node.accumulatedPercentage = 0;
      }
      
      // Categorias não possuem preço unitário direto
      node.unitPrice = 0;
      node.unitPriceNoBdi = 0;
      node.contractQuantity = 0;
    } else {
      // ITEM DE SERVIÇO: Força o cálculo do preço com BDI baseado no valor base
      node.unitPrice = financial.round((node.unitPriceNoBdi || 0) * (1 + (projectBdi || 0) / 100));

      node.contractTotal = financial.round((node.contractQuantity || 0) * node.unitPrice);
      node.previousTotal = financial.round((node.previousQuantity || 0) * node.unitPrice);
      node.currentTotal = financial.round((node.currentQuantity || 0) * node.unitPrice);
      
      node.accumulatedQuantity = (node.previousQuantity || 0) + (node.currentQuantity || 0);
      node.accumulatedTotal = financial.round(node.accumulatedQuantity * node.unitPrice);
      
      node.balanceQuantity = (node.contractQuantity || 0) - node.accumulatedQuantity;
      node.balanceTotal = financial.round(node.balanceQuantity * node.unitPrice);
      
      node.currentPercentage = (node.contractQuantity || 0) > 0 
        ? financial.round(((node.currentQuantity || 0) / node.contractQuantity) * 100) 
        : 0;
      node.accumulatedPercentage = node.contractTotal > 0 
        ? financial.round((node.accumulatedTotal / node.contractTotal) * 100) 
        : 0;
    }

    return node;
  },

  flattenTree: (
    nodes: WorkItem[], 
    expandedIds: Set<string>, 
    depth: number = 0, 
    results: (WorkItem & { depth: number })[] = []
  ): (WorkItem & { depth: number })[] => {
    nodes.forEach(node => {
      results.push({ ...node, depth });
      if (node.type === 'category' && expandedIds.has(node.id) && node.children) {
        treeService.flattenTree(node.children, expandedIds, depth + 1, results);
      }
    });
    return results;
  }
};
