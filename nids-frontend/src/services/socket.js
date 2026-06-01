import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect() {
    if (this.socket) return;

    this.socket = io({
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      path: '/socket.io',
    });

    this.socket.on('connect', () => {
      console.log('[Socket] Connected:', this.socket.id);
      this._emitLocal('connected', { id: this.socket.id });
    });

    this.socket.on('disconnect', (reason) => {
      console.warn('[Socket] Disconnected:', reason);
      this._emitLocal('disconnected', { reason });
    });

    this.socket.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err.message);
    });

    // Backend events
    this.socket.on('new_alert', (data) => this._emitLocal('alert', data));
    this.socket.on('normal_traffic', (data) => this._emitLocal('normal', data));
    this.socket.on('system_status', (data) => this._emitLocal('status', data));
    this.socket.on('capture_started', (data) => this._emitLocal('capture_started', data));
    this.socket.on('capture_stopped', (data) => this._emitLocal('capture_stopped', data));
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Emitters
  startCapture(iface = 'auto') {
    if (this.socket && this.socket.connected) {
      this.socket.emit('start_capture', { interface: iface });
    } else {
      console.warn('[Socket] Not connected, simulating capture start');
      this._emitLocal('capture_started', {});
    }
  }

  stopCapture() {
    if (this.socket && this.socket.connected) {
      this.socket.emit('stop_capture', {});
    }
  }

  requestStatus() {
    if (this.socket && this.socket.connected) {
      this.socket.emit('request_status', {});
    }
  }

  // Local Event Bus
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    return () => this.off(event, callback); // Returns unsubscribe function
  }

  off(event, callback) {
    if (!this.listeners.has(event)) return;
    const callbacks = this.listeners.get(event).filter(cb => cb !== callback);
    this.listeners.set(event, callbacks);
  }

  _emitLocal(event, data) {
    if (!this.listeners.has(event)) return;
    this.listeners.get(event).forEach(cb => {
      try { cb(data); } catch (e) { console.error('[Socket Event Error]', event, e); }
    });
  }
}

export const socketService = new SocketService();
