
import { Project, ProjectGroup, DEFAULT_THEME } from '../types';

/**
 * ProjectService
 * Centraliza a lógica de criação e transformação de entidades de negócio.
 * Garante que nenhum objeto nasça "incompleto" no sistema.
 */
export const projectService = {
  /**
   * Fábrica de Projetos (Obras)
   */
  createProject: (name: string, companyName: string, groupId: string | null = null): Project => ({
    id: crypto.randomUUID(),
    groupId,
    name: name.trim() || 'Novo Empreendimento',
    companyName: companyName.trim() || 'Empresa Padrão',
    measurementNumber: 1,
    referenceDate: new Date().toLocaleDateString('pt-BR'),
    logo: null,
    items: [],
    history: [],
    theme: { ...DEFAULT_THEME },
    bdi: 25,
    assets: [],
    expenses: [],
    config: { 
      strict: false, 
      printCards: true, 
      printSubtotals: true 
    }
  }),

  /**
   * Fábrica de Grupos (Pastas)
   */
  createGroup: (name: string, parentId: string | null = null, order: number = 0): ProjectGroup => ({
    id: crypto.randomUUID(),
    parentId,
    name: name.trim() || 'Nova Pasta',
    order,
    children: []
  }),

  /**
   * Lógica de Reatribuição Pós-Exclusão
   * Garante que se uma pasta for deletada, seus filhos não se percam.
   */
  getReassignedItems: (groupId: string, groups: ProjectGroup[], projects: Project[]) => {
    const targetGroup = groups.find(g => g.id === groupId);
    const newParentId = targetGroup?.parentId || null;

    const updatedGroups = groups
      .filter(g => g.id !== groupId)
      .map(g => g.parentId === groupId ? { ...g, parentId: newParentId } : g);

    const updatedProjects = projects.map(p => 
      p.groupId === groupId ? { ...p, groupId: newParentId } : p
    );

    return { updatedGroups, updatedProjects, newParentId };
  }
};
