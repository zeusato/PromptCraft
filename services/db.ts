import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { HistoryItem, AppSettings, PromptFormat, AppLanguage } from '../types';

interface PromptCraftDB extends DBSchema {
  history: {
    key: string;
    value: HistoryItem;
    indexes: { 'by-date': number };
  };
  secrets: {
    key: string;
    value: { id: string; value: string };
  };
  settings: {
    key: string;
    value: AppSettings;
  };
}

const DB_NAME = 'promptcraft-db';
const DB_VERSION = 3; // Incremented version for new settings field

let dbPromise: Promise<IDBPDatabase<PromptCraftDB>>;

export const initDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<PromptCraftDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
        // Version 1: History
        if (!db.objectStoreNames.contains('history')) {
          const historyStore = db.createObjectStore('history', { keyPath: 'id' });
          historyStore.createIndex('by-date', 'createdAt');
        }

        // Version 2: Secrets & Settings
        if (!db.objectStoreNames.contains('secrets')) {
          db.createObjectStore('secrets', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
};

// --- History ---
export const saveHistory = async (item: HistoryItem) => {
  const db = await initDB();
  await db.put('history', item);
  const keys = await db.getAllKeysFromIndex('history', 'by-date');
  if (keys.length > 10) {
    const itemsToDelete = keys.length - 10;
    for (let i = 0; i < itemsToDelete; i++) {
      await db.delete('history', keys[i]);
    }
  }
};

export const getHistory = async (): Promise<HistoryItem[]> => {
  const db = await initDB();
  const items = await db.getAllFromIndex('history', 'by-date');
  return items.reverse();
};

export const deleteHistoryItem = async (id: string) => {
  const db = await initDB();
  await db.delete('history', id);
};

export const clearHistory = async () => {
  const db = await initDB();
  await db.clear('history');
};

// --- API Key (Secrets) ---
const API_KEY_ID = 'gemini_api_key';

export const saveApiKey = async (key: string) => {
  const db = await initDB();
  await db.put('secrets', { id: API_KEY_ID, value: key });
};

export const getApiKey = async (): Promise<string | null> => {
  const db = await initDB();
  const record = await db.get('secrets', API_KEY_ID);
  return record ? record.value : null;
};

export const deleteApiKey = async () => {
  const db = await initDB();
  await db.delete('secrets', API_KEY_ID);
};

// --- Settings ---
const SETTINGS_ID = 'main_settings';
const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  language: AppLanguage.VI,
  defaultOutput: PromptFormat.TEXT,
  highlightAI: true,
  favorites: []
};

export const saveSettings = async (settings: AppSettings) => {
  const db = await initDB();
  // We store it with an ID to fit the store structure
  await db.put('settings', { ...settings, id: SETTINGS_ID } as any);
};

export const getSettings = async (): Promise<AppSettings> => {
  const db = await initDB();
  const result = await db.get('settings', SETTINGS_ID);
  if (!result) return DEFAULT_SETTINGS;
  // Remove the ID before returning
  const { id, ...settings } = result as any;
  // Merge with default to ensure new fields exist
  return { ...DEFAULT_SETTINGS, ...settings } as AppSettings;
};