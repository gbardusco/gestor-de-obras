
import { State } from '../hooks/useProjectState';

export interface BackupMetadata {
  version: string;
  timestamp: string;
  instanceId: string;
  checksum?: string;
}

export interface BackupFile {
  metadata: BackupMetadata;
  data: Partial<State>;
}

export const backupService = {
  /**
   * Generates a backup object from the current state
   */
  generateBackup: (state: State, instanceId: string): BackupFile => {
    // Data Minimization: Remove sensitive fields if they existed (e.g. passwords)
    // In this app, we don't have passwords in the state, but we follow the principle.
    
    const backupData: Partial<State> = {
      projects: state.projects,
      biddings: state.biddings,
      groups: state.groups,
      suppliers: state.suppliers,
      contractors: state.contractors,
      globalStock: state.globalStock,
      globalMovements: state.globalMovements,
      stockRequests: state.stockRequests,
      purchaseRequests: state.purchaseRequests,
      notifications: state.notifications,
      globalTaskTags: state.globalTaskTags,
      globalSettings: state.globalSettings,
    };

    const metadata: BackupMetadata = {
      version: '0.8.0',
      timestamp: new Date().toISOString(),
      instanceId: instanceId,
    };

    // In a real scenario, we would calculate an HMAC here.
    // For this demo, we'll use a simple string representation.
    
    return {
      metadata,
      data: backupData,
    };
  },

  /**
   * Downloads the backup as a .canteiro file
   */
  downloadBackup: (backup: BackupFile) => {
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    link.href = url;
    link.download = `backup-canteiro-${timestamp}.canteiro`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  /**
   * Parses and validates a .canteiro file
   */
  parseBackupFile: async (file: File): Promise<BackupFile> => {
    return new Promise((resolve, reject) => {
      if (!file.name.endsWith('.canteiro')) {
        reject(new Error('Extensão de ficheiro inválida. Use apenas ficheiros .canteiro'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = JSON.parse(content) as BackupFile;
          
          if (!parsed.metadata || !parsed.data) {
            throw new Error('Estrutura de backup inválida.');
          }
          
          resolve(parsed);
        } catch (err) {
          reject(new Error('Falha ao processar o ficheiro. O conteúdo pode estar corrompido.'));
        }
      };
      reader.onerror = () => reject(new Error('Erro ao ler o ficheiro.'));
      reader.readAsText(file);
    });
  }
};
