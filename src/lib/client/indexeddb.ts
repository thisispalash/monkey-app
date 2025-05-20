const DB_NAME = 'dash-monkey-db';
const STORE_NAMES = {
  AUTH: 'auth',
  USER: 'user',
}
const STORE_KEYS = {
  AUTH: 'session',
  USER: 'username',
}

interface UserAuth {
  username: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

interface User {
  username: string;
  discord?: string;
  telegram?: string;
}

function getDB(): Promise<IDBDatabase> {

  return new Promise((resolve, reject) => {

    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (event.oldVersion < 1) {
        // first version of the db
        // auth store
        if (!db.objectStoreNames.contains(STORE_NAMES.AUTH)) {
          const store = db.createObjectStore(STORE_NAMES.AUTH, { keyPath: STORE_KEYS.AUTH });
          store.createIndex(STORE_NAMES.AUTH, 'username', { unique: true });
        }

        // user store
        if (!db.objectStoreNames.contains(STORE_NAMES.USER)) {
          const store = db.createObjectStore(STORE_NAMES.USER, { keyPath: STORE_KEYS.USER });
          store.createIndex(STORE_NAMES.USER, 'username', { unique: true });
        }
      }

    }

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

  });
}

export async function getTokens(): Promise<UserAuth | null> {

  const db = await getDB();

  const transaction = db.transaction(STORE_NAMES.AUTH, 'readonly');
  const store = transaction.objectStore(STORE_NAMES.AUTH);

  const request = store.get(STORE_KEYS.AUTH);

  return new Promise((resolve, reject) => {
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  })
}

export async function setTokens(username: string, accessToken: string, refreshToken: string, expiresAt: number): Promise<void> {

  const db = await getDB();

  const transaction = db.transaction(STORE_NAMES.AUTH, 'readwrite');
  const store = transaction.objectStore(STORE_NAMES.AUTH);

  const request = store.put({
    username,
    accessToken,
    refreshToken,
    expiresAt,
  }, username);

  return new Promise((resolve, reject) => {
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function clearTokens(username: string): Promise<void> {
  const db = await getDB();

  const transaction = db.transaction(STORE_NAMES.AUTH, 'readwrite');
  const store = transaction.objectStore(STORE_NAMES.AUTH);

  const request = store.delete(username);

  return new Promise((resolve, reject) => {
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  })
}

export async function getUser(username: string): Promise<User> {
  const db = await getDB();

  const transaction = db.transaction(STORE_NAMES.USER, 'readonly');
  const store = transaction.objectStore(STORE_NAMES.USER);

  const request = store.get(username);

  return new Promise((resolve, reject) => {
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  })
}