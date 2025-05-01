// services/tokenRefresher.ts
import axiosInstance from '../lib/api/axiosInstance';

let pingInterval: ReturnType<typeof setInterval>;

export function startTokenPing(intervalMs =  60 * 1000) {
  pingInterval = setInterval(async () => {
    try {
      await axiosInstance.get('/auth/ping');
      console.log('[Ping] Token still valid');
    } catch (err) {
      console.warn('[Ping] Token might be expired');
    }
  }, intervalMs);
}

export function stopTokenPing() {
  clearInterval(pingInterval);
}
