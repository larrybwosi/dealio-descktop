import axios, { AxiosInstance } from "axios";
import axiosTauriApiAdapter  from 'axios-tauri-api-adapter';
import { fetch } from '@tauri-apps/plugin-http';
import { LazyStore } from "@tauri-apps/plugin-store";
import { isTauri } from "@tauri-apps/api/core";
import { observable } from '@legendapp/state';
import { synced } from '@legendapp/state/sync';
import { ObservablePersistLocalStorage } from '@legendapp/state/persist-plugins/local-storage';


const API_KEY_STORAGE_KEY = 'apiKey';
export const API_ENDPOINT = import.meta.env.VITE_PUBLIC_API_ENDPOINT;
export const API_KEY = import.meta.env.VITE_PUBLIC_API_KEY;

export const apiKey$ = observable(
  synced({
    initial: '',
    persist: {
      name: 'apikey',
      plugin: ObservablePersistLocalStorage,
    },
  })
);
const tauriStore = isTauri() ? new LazyStore('.api-key.dat') : null;
// Create a new store instance. The 'settings.dat' file will be created in the app's data directory.
const store = new LazyStore('api-key.dat');

const api = axios.create({
  baseURL: `${API_ENDPOINT}/api/organizations`,
  headers: {
    'x-api-key': API_KEY,
  },
  adapter: axiosTauriApiAdapter,
});

export const apiClient = axios.create({
  baseURL: `${API_ENDPOINT}/`,
  headers: {
    'x-api-key': apiKey$.get(),
  },
  adapter: axiosTauriApiAdapter,
});

/**
 * @file apiClient.ts
 * @description This file provides a centralized and secure way to manage API interactions in a Tauri application.
 * It uses `tauri-plugin-store` to securely persist the API key on the user's device and
 * configures an Axios instance to automatically include the key in all requests.
 */


// --- API Key Management Functions ---

/**
 * Securely saves the user's API key to the Tauri store.
 * @param {string} apiKey - The API key to be stored.
 * @returns {Promise<void>} A promise that resolves when the key has been saved.
 * @throws Will throw an error if saving fails.
 */
export const saveApiKey = async (apiKey: string): Promise<void> => {
  try {
    await store.set(API_KEY_STORAGE_KEY, apiKey);
    await store.save(); // Persist the store to disk
    apiKey$.set(apiKey)
    console.log('API Key saved successfully.');
  } catch (error) {
    console.error('Failed to save API key:', error);
    throw new Error('Could not save API key.');
  }
};

/**
 * Retrieves the API key from the secure Tauri store.
 * @returns {Promise<string | null>} A promise that resolves with the API key, or null if it's not found.
 */
export const getApiKey = async (): Promise<string | null> => {
  try {
    const apiKey = await store.get<string>(API_KEY_STORAGE_KEY);
    return apiKey;
  } catch (error) {
    console.error('Failed to retrieve API key from store:', error);
    return null;
  }
};

/**
 * Removes the API key from the secure Tauri store.
 * Useful for logout or key-reset functionality.
 * @returns {Promise<void>} A promise that resolves when the key has been removed.
 */
export const clearApiKey = async (): Promise<void> => {
    try {
        await store.delete(API_KEY_STORAGE_KEY);
        await store.save();
        console.log('API Key cleared successfully.');
    } catch (error) {
        console.error('Failed to clear API key:', error);
        throw new Error('Could not clear API key.');
    }
};


// --- Axios API Client Creation ---

/**
 * Creates and configures an Axios instance for making API calls.
 * This function is asynchronous because it needs to fetch the API key from the store.
 * It uses an interceptor to dynamically add the 'x-api-key' header to every request.
 *
 * @param {string} [baseURL] - The base URL for the API. Defaults to the provided example.
 * @returns {Promise<AxiosInstance>} A fully configured Axios instance ready for use.
 */
export const createApiClient = async (baseURL = `${API_ENDPOINT}/api/organizations`) => {
  const apiClient = axios.create({
    baseURL,
    adapter: axiosTauriApiAdapter, // Use the Tauri adapter to bypass CORS issues
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Use a request interceptor to add the API key to headers dynamically.
  // This function is called before every request is sent.
  apiClient.interceptors.request.use(
    async config => {
      // Retrieve the key from the store for each request.
      // This ensures that if the key is updated, subsequent requests will use the new key.
      const apiKey = await getApiKey();

      if (apiKey) {
        config.headers['x-api-key'] = apiKey;
      } else {
        // Optional: Handle the case where the API key is missing.
        // You could prevent the request or show a notification to the user.
        console.warn('API key is not set. Request is being sent without `x-api-key` header.');
        // To cancel the request if the key is missing, you can do:
        // return Promise.reject(new Error('API Key is missing. Please set it in the application settings.'));
      }

      return config;
    },
    error => {
      // Handle request errors
      return Promise.reject(error);
    }
  );

  return apiClient;
};


export default api

