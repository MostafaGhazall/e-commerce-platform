import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,            // send/receive the cookie
  headers: { 'Content-Type': 'application/json' },
});

// automatically log the user out on 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      import('../contexts/useAuthStore').then(({ useAuthStore }) =>
        useAuthStore.getState().logout());
    }
    return Promise.reject(err);
  }
);

export default api;
