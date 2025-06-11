// src/lib/storage.js
const STORAGE_KEY = 'Punktual_draft'

export function saveEventToStorage(data) {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ...data,
        timestamp: Date.now()
      }))
    }
  } catch (error) {
    console.error('Error saving to localStorage:', error)
  }
}

export function loadEventFromStorage() {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return null
      
      const data = JSON.parse(stored)
      
      // Don't load data older than 24 hours
      if (Date.now() - data.timestamp > 24 * 60 * 60 * 1000) {
        localStorage.removeItem(STORAGE_KEY)
        return null
      }
      
      return data
    }
    return null
  } catch (error) {
    console.error('Error loading from localStorage:', error)
    return null
  }
}