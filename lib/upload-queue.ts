/**
 * IndexedDB queue for background avatar uploads.
 * Stores compressed files - the upload process handles avatar creation.
 */

const DB_NAME = "richflex-uploads";
const DB_VERSION = 3;
const STORE_NAME = "pending";

interface StoredFile {
  name: string;
  type: string;
  data: ArrayBuffer;
}

interface PendingUpload {
  id: string; // Fixed key "pending"
  files: StoredFile[];
  createdAt: number;
  uploadStartedAt?: number;
}

/**
 * Open IndexedDB
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      // Delete old store if exists (schema change)
      if (db.objectStoreNames.contains(STORE_NAME)) {
        db.deleteObjectStore(STORE_NAME);
      }
      db.createObjectStore(STORE_NAME, { keyPath: "id" });
    };
  });
}

async function fileToStored(file: File): Promise<StoredFile> {
  return {
    name: file.name,
    type: file.type,
    data: await file.arrayBuffer(),
  };
}

function storedToFile(stored: StoredFile): File {
  // Create a fresh ArrayBuffer copy to avoid detached buffer issues
  // This prevents "file could not be read" errors when the buffer was transferred
  const bufferCopy = new ArrayBuffer(stored.data.byteLength);
  new Uint8Array(bufferCopy).set(new Uint8Array(stored.data));
  return new File([bufferCopy], stored.name, { type: stored.type });
}

/**
 * Store files for background upload
 */
export async function storePendingUpload(files: File[]): Promise<void> {
  const storedFiles = await Promise.all(files.map(fileToStored));
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");

  const data: PendingUpload = {
    id: "pending",
    files: storedFiles,
    createdAt: Date.now(),
  };

  return new Promise((resolve, reject) => {
    const req = tx.objectStore(STORE_NAME).put(data);
    req.onsuccess = () => {
      console.log(`[UploadQueue] Stored ${files.length} files`);
      resolve();
    };
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

/**
 * Get pending files if any
 */
export async function getPendingUpload(): Promise<File[] | null> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    return new Promise((resolve) => {
      const req = store.get("pending");
      req.onsuccess = () => {
        const data = req.result as PendingUpload | undefined;

        if (!data) {
          resolve(null);
          return;
        }

        // Expire after 24h
        if (Date.now() - data.createdAt > 24 * 60 * 60 * 1000) {
          store.delete("pending");
          resolve(null);
          return;
        }

        // Skip if already started < 2 min ago
        if (
          data.uploadStartedAt &&
          Date.now() - data.uploadStartedAt < 2 * 60 * 1000
        ) {
          console.log("[UploadQueue] Upload already in progress");
          resolve(null);
          return;
        }

        const files = data.files.map(storedToFile);
        console.log(`[UploadQueue] Found ${files.length} pending files`);
        resolve(files);
      };
      req.onerror = () => resolve(null);
      tx.oncomplete = () => db.close();
    });
  } catch {
    return null;
  }
}

/**
 * Mark upload as started
 */
export async function markUploadStarted(): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    const req = store.get("pending");
    req.onsuccess = () => {
      const data = req.result as PendingUpload | undefined;
      if (data) {
        data.uploadStartedAt = Date.now();
        store.put(data);
      }
    };
    tx.oncomplete = () => db.close();
  } catch {
    // Ignore
  }
}

/**
 * Clear pending upload
 */
export async function clearPendingUpload(): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete("pending");
    tx.oncomplete = () => db.close();
    console.log("[UploadQueue] Cleared");
  } catch {
    // Ignore
  }
}

/**
 * Check if IndexedDB is available
 */
export function isIndexedDBAvailable(): boolean {
  return typeof indexedDB !== "undefined";
}
