// services/api.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://studentapinew.university99.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});
