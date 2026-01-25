
import { WorkItem } from '../types';
import { financial } from '../utils/math';

export const treeService = {
  buildTree: (items: WorkItem[]): WorkItem[] => {
    const itemMap: { [key: string]: WorkItem } = {};
    const roots: WorkItem[] = [];

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

    return roots.sort((a, b) => a.order - b.order);
  },

  processRecursive: (node: WorkItem, prefix: string = ''): WorkItem => {
    const wbs = prefix ? `${prefix}.${node.order + 1}` : `${node.order + 1}`;
    node.wbs = wbs;

    if (node.type === 'category' && node.children && node.children.length > 0) {
      node.children = node.children.map(child => treeService.processRecursive(child, wbs));
      
      // Rollup Financeiro de Categorias
      node.contractTotal = financial.sum(node.children.map(c => c.contractTotal));
      node.previousTotal = financial.sum(node.children.map(c => c.previousTotal));
      node.currentTotal = financial.sum(node.children.map(c => c.currentTotal));
      node.accumulatedTotal = financial.sum(node.children.map(c => c.accumulatedTotal));
      node.balanceTotal = financial.sum(node.children.map(c => c.balanceTotal));
      
      node.accumulatedPercentage = node.contractTotal > 0 
        ? financial.round((node.accumulatedTotal / node.contractTotal) * 100) 
        : 0;
        
      node.contractQuantity = 0;
      node.unitPrice = 0;
      node.unitPriceNoBdi = 0;
    } else if (node.type === 'item') {
      // Cálculos Unitários do Item
      node.contractTotal = financial.round(node.contractQuantity * node.unitPrice);
      node.previousTotal = financial.round(node.previousQuantity * node.unitPrice);
      node.currentTotal = financial.round(node.currentQuantity * node.unitPrice);
      
      node.accumulatedQuantity = node.previousQuantity + node.currentQuantity;
      node.accumulatedTotal = financial.round(node.accumulatedQuantity * node.unitPrice);
      
      node.balanceQuantity = node.contractQuantity - node.accumulatedQuantity;
      node.balanceTotal = financial.round(node.balanceQuantity * node.unitPrice);
      
      node.currentPercentage = node.contractQuantity > 0 
        ? financial.round((node.currentQuantity / node.contractQuantity) * 100) 
        : 0;
      node.accumulatedPercentage = node.contractQuantity > 0 
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
