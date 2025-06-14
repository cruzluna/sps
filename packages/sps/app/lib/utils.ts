import { clsx, type ClassValue } from "clsx"
import { toast } from "sonner";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const copyToClipboard = async (text: string, type: "id" | "prompt" | "key") => {
    try {
      await navigator.clipboard.writeText(text);
      toast(`copied ${type}`);
    } catch (err) {
      console.error("Failed to copy text: ", err);
      toast.error("Failed to copy");
    }
  };

// Local storage key for prompt IDs
const PROMPT_IDS_STORAGE_KEY = 'saved_prompt_ids';

// Type for the stored prompt IDs
type StoredPromptIds = string[];

/**
 * Get all saved prompt IDs from local storage
 */
export const getSavedPromptIds = (): StoredPromptIds => {
  try {
    const stored = localStorage.getItem(PROMPT_IDS_STORAGE_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    
    return parsed;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
};

/**
 * Save a new prompt ID to local storage
 */
export const savePromptId = (id: string): void => {
  try {
    const existingIds = getSavedPromptIds();
    if (!existingIds.includes(id)) {
      const updatedIds = [...existingIds, id];
      localStorage.setItem(PROMPT_IDS_STORAGE_KEY, JSON.stringify(updatedIds));
    }
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

/**
 * Remove a prompt ID from local storage
 */
export const removePromptId = (id: string): void => {
  try {
    const existingIds = getSavedPromptIds();
    const updatedIds = existingIds.filter(existingId => existingId !== id);
    localStorage.setItem(PROMPT_IDS_STORAGE_KEY, JSON.stringify(updatedIds));
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};

// API Keys storage
const API_KEYS_STORAGE_KEY = 'saved_api_keys';

type ApiKey = {
  id: string;
  name: string;
  key: string;
  createdAt: string;
};

export const getApiKeys = (): ApiKey[] => {
  try {
    const stored = localStorage.getItem(API_KEYS_STORAGE_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    
    return parsed;
  } catch (error) {
    console.error('Error reading API keys from localStorage:', error);
    return [];
  }
};

export const saveApiKey = (apiKey: ApiKey): void => {
  try {
    const existingKeys = getApiKeys();
    // Check if a key with the same name already exists
    const isDuplicate = existingKeys.some(key => key.name === apiKey.name);
    if (isDuplicate) {
      console.warn('API key with this name already exists');
      return;
    }
    const updatedKeys = [...existingKeys, apiKey];
    localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(updatedKeys));
  } catch (error) {
    console.error('Error saving API key to localStorage:', error);
  }
};

export const removeApiKey = (id: string): void => {
  try {
    const existingKeys = getApiKeys();
    const updatedKeys = existingKeys.filter(key => key.id !== id);
    localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(updatedKeys));
  } catch (error) {
    console.error('Error removing API key from localStorage:', error);
  }
};