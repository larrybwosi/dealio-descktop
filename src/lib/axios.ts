import axios from "axios";
import axiosTauriApiAdapter from 'axios-tauri-api-adapter';


// export const API_ENDPOINT = import.meta.env.DEV ? 'http://localhost:3000' : 'https://dealioerp.vercel.app';
export const API_ENDPOINT = 'http://localhost:3000'
// export const API_ENDPOINT =  'https://dealioerp.vercel.app';

const api = axios.create({
  baseURL: `${API_ENDPOINT}`,
  withCredentials:true,
  // adapter: axiosTauriApiAdapter,
});


export const axiosClientInstance = axios.create({
  baseURL: `${API_ENDPOINT}/api/organizations`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  // adapter: axiosTauriApiAdapter,
});

export default api

