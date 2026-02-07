import type { ExcalidrawData } from './types'

const DB_NAME = 'dailo-excalidraw'
const DB_VERSION = 1
const STORE_NAME = 'drawings'
const DRAWING_KEY = 'main-drawing'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
  })
}

export async function saveExcalidrawData(data: ExcalidrawData): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.put(data, DRAWING_KEY)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

export async function loadExcalidrawData(): Promise<ExcalidrawData | null> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.get(DRAWING_KEY)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result || null)
  })
}

export async function clearExcalidrawData(): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.delete(DRAWING_KEY)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}
