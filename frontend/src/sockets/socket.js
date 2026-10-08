import { io } from 'socket.io-client';

export const socket = io(import.meta.env.VITE_SOCKET_URL || 'https://api.campusloop.shop/socket', {
  autoConnect: false,
  withCredentials: true
});