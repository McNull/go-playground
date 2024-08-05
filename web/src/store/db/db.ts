import { WorkspaceState } from "../workspace/state"

const DB_NAME = 'go-playground';
const WORKSPACE_STORE_NAME = 'workspaces';
const DB_VERSION = 1;

class PlaygroundDB {
  private db: IDBDatabase | null = null;

  constructor() {
    this.init();
  }

  private init() {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(WORKSPACE_STORE_NAME)) {
        db.createObjectStore(WORKSPACE_STORE_NAME, { keyPath: 'name' });
      }
    };

    request.onsuccess = (event) => {
      this.db = (event.target as IDBOpenDBRequest).result;
    };

    request.onerror = (event) => {
      console.error('Database error:', (event.target as IDBOpenDBRequest).error);
    };
  }

  private getObjectStore(mode: IDBTransactionMode): IDBObjectStore {
    if (!this.db) {
      throw new Error('Database is not initialized');
    }
    const transaction = this.db.transaction(WORKSPACE_STORE_NAME, mode);
    return transaction.objectStore(WORKSPACE_STORE_NAME);
  }

  public async saveWorkspace(workspace: WorkspaceState): Promise<void> {
    if (!workspace.name || !workspace.selectedFile || !workspace.files) {
      throw new Error('Workspace must have a name, selectedFile, and files');
    }

    const { snippet, ...workspaceToSave } = workspace;

    return new Promise((resolve, reject) => {
      const store = this.getObjectStore('readwrite');
      const request = store.put(workspaceToSave);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async getWorkspaceByName(name: string): Promise<WorkspaceState | undefined> {
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore('readonly');
      const request = store.get(name);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  public async getAllWorkspaces(): Promise<Pick<WorkspaceState, 'name'>[]> {
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore('readonly');
      const request = store.getAllKeys();

      request.onsuccess = () => {
        const keys = request.result as string[];
        resolve(keys.map((name) => ({ name })));
      };
      request.onerror = () => reject(request.error);
    });
  }
}

export const db = new PlaygroundDB();