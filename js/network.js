// WebRTC Peer-to-Peer Networking for Online Chess using PeerJS
class ChessNetwork {
  constructor() {
    this.peer = null;
    this.conn = null;
    this.isHost = false;
    this.roomCode = null;
    this.connected = false;
    this.initialConfig = null;
    this.lastHeartbeat = Date.now();
    this.heartbeatTimer = null;
    this.peerPrefix = 'dirana-chess-v1-';

    // Event listeners
    this.handlers = {
      connected: null,
      disconnected: null,
      init: null,
      move: null,
      chat: null,
      drawOffer: null,
      drawAccept: null,
      drawDecline: null,
      resign: null,
      rematchOffer: null,
      rematchAccept: null,
      cardPlay: null,
      cardDraw: null,
      error: null
    };

    // Auto-ping when tab becomes active again to prevent background throttling disconnects
    if (typeof document !== 'undefined' && document.addEventListener) {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.lastHeartbeat = Date.now();
          if (this.conn && this.conn.open) {
            this.send({ type: 'ping' });
          }
        }
      });
    }
  }

  on(event, callback) {
    if (this.handlers.hasOwnProperty(event)) {
      this.handlers[event] = callback;
    }
  }

  _emit(event, data) {
    if (typeof this.handlers[event] === 'function') {
      this.handlers[event](data);
    }
  }

  generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No O, 0, 1, I for clarity
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  createRoom(roomCode, initialConfig) {
    return new Promise((resolve, reject) => {
      this.cleanup();
      this.isHost = true;
      this.initialConfig = initialConfig;
      this.roomCode = roomCode || this.generateRoomCode();
      const peerId = this.peerPrefix + this.roomCode;

      this.peer = new Peer(peerId, {
        debug: 1,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        }
      });

      this.peer.on('open', (id) => {
        resolve({ roomCode: this.roomCode, peerId: id });
      });

      this.peer.on('connection', (connection) => {
        if (this.conn) {
          // If already connected, reject extra connections
          try { connection.close(); } catch(e){}
          return;
        }
        this.conn = connection;
        this._setupConnection(this.initialConfig);
      });

      this.peer.on('error', (err) => {
        console.error('Peer error:', err);
        if (err.type === 'unavailable-id') {
          // Retry with new code
          this.createRoom(this.generateRoomCode(), initialConfig).then(resolve).catch(reject);
        } else {
          this._emit('error', err);
          reject(err);
        }
      });
    });
  }

  joinRoom(roomCode) {
    return new Promise((resolve, reject) => {
      this.cleanup();
      this.isHost = false;
      this.roomCode = roomCode.toUpperCase().trim();
      const hostPeerId = this.peerPrefix + this.roomCode;

      this.peer = new Peer(null, {
        debug: 1,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        }
      });

      this.peer.on('open', () => {
        this.conn = this.peer.connect(hostPeerId, {
          reliable: true
        });

        this._setupDataListener();

        const onOpen = () => {
          this.connected = true;
          this._startHeartbeat();
          this._emit('connected', { isHost: false, roomCode: this.roomCode });
          // Inform host guest is connected and ready
          this.send({ type: 'guest-ready' });
          resolve({ roomCode: this.roomCode });
        };

        if (this.conn.open) {
          onOpen();
        } else {
          this.conn.on('open', onOpen);
        }

        this.conn.on('close', () => {
          this._stopHeartbeat();
          this.connected = false;
          this._emit('disconnected');
        });

        this.conn.on('error', (err) => {
          this._emit('error', err);
          reject(err);
        });
      });

      this.peer.on('error', (err) => {
        console.error('Peer join error:', err);
        this._emit('error', err);
        reject(err);
      });
    });
  }

  _setupConnection(initialConfig) {
    this.initialConfig = initialConfig;
    this._setupDataListener();

    const onOpen = () => {
      this.connected = true;
      this._startHeartbeat();
      this._emit('connected', { isHost: true, roomCode: this.roomCode });

      // Host sends initial game configuration to guest
      if (this.initialConfig) {
        this.send({
          type: 'init',
          config: this.initialConfig
        });
      }
    };

    if (this.conn.open) {
      onOpen();
    } else {
      this.conn.on('open', onOpen);
    }

    this.conn.on('close', () => {
      this._stopHeartbeat();
      this.connected = false;
      this._emit('disconnected');
    });

    this.conn.on('error', (err) => {
      this._emit('error', err);
    });
  }

  _setupDataListener() {
    if (!this.conn) return;

    this.conn.on('data', (data) => {
      this.lastHeartbeat = Date.now();
      if (!data || !data.type) return;

      if (data.type === 'ping') {
        this.send({ type: 'pong' });
        return;
      }
      if (data.type === 'pong') {
        return;
      }

      switch (data.type) {
        case 'guest-ready':
          if (this.isHost && this.initialConfig) {
            this.send({
              type: 'init',
              config: this.initialConfig
            });
          }
          break;
        case 'init':
          this._emit('init', data.config);
          break;
        case 'move':
          this._emit('move', data);
          break;
        case 'chat':
          this._emit('chat', data);
          break;
        case 'draw-offer':
          this._emit('drawOffer');
          break;
        case 'draw-accept':
          this._emit('drawAccept');
          break;
        case 'draw-decline':
          this._emit('drawDecline');
          break;
        case 'resign':
          this._emit('resign', data);
          break;
        case 'rematch-offer':
          this._emit('rematchOffer');
          break;
        case 'rematch-accept':
          this._emit('rematchAccept', data);
          break;
        case 'card-play':
          this._emit('cardPlay', data);
          break;
        case 'card-draw':
          this._emit('cardDraw', data);
          break;
      }
    });
  }

  isConnected() {
    return !!(this.connected || (this.conn && (this.conn.open || (this.conn.dataChannel && this.conn.dataChannel.readyState === 'open'))));
  }

  send(data) {
    try {
      if (this.conn && (this.conn.open || (this.conn.dataChannel && this.conn.dataChannel.readyState === 'open'))) {
        this.conn.send(data);
        return true;
      }
    } catch (e) {
      console.warn('Network send exception:', e, data);
    }
    return false;
  }

  sendMove(from, to, promotion, timeWhite, timeBlack, fen, moveNumber) {
    this.send({
      type: 'move',
      from,
      to,
      promotion,
      timeWhite,
      timeBlack,
      fen,
      moveNumber,
      timestamp: Date.now()
    });
  }

  sendChat(text, sender) {
    this.send({
      type: 'chat',
      text,
      sender,
      timestamp: Date.now()
    });
  }

  sendDrawOffer() {
    this.send({ type: 'draw-offer' });
  }

  sendDrawAccept() {
    this.send({ type: 'draw-accept' });
  }

  sendDrawDecline() {
    this.send({ type: 'draw-decline' });
  }

  sendResign(player) {
    this.send({ type: 'resign', player });
  }

  sendRematchOffer() {
    this.send({ type: 'rematch-offer' });
  }

  sendRematchAccept(newConfig) {
    this.send({ type: 'rematch-accept', config: newConfig });
  }

  sendCardPlay(card, targetSquare, byPlayer, action = null, extraData = null, fen = null) {
    this.send({
      type: 'card-play',
      card,
      targetSquare,
      byPlayer,
      action,
      extraData,
      fen,
      timestamp: Date.now()
    });
  }

  sendCardDraw(count = 1) {
    this.send({
      type: 'card-draw',
      count,
      timestamp: Date.now()
    });
  }

  _startHeartbeat() {
    this._stopHeartbeat();
    this.lastHeartbeat = Date.now();
    this.heartbeatTimer = setInterval(() => {
      if (!this.conn || (!this.conn.open && (!this.conn.dataChannel || this.conn.dataChannel.readyState !== 'open'))) return;
      this.send({ type: 'ping' });

      // Disconnect timeout: 35 seconds (resilient to tab switches and network jitter)
      if (Date.now() - this.lastHeartbeat > 35000) {
        console.warn('Network heartbeat timeout: Peer disconnected.');
        this._stopHeartbeat();
        this.connected = false;
        this._emit('disconnected');
      }
    }, 5000);
  }

  _stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  cleanup() {
    this._stopHeartbeat();
    if (this.conn) {
      try { this.conn.close(); } catch(e){}
      this.conn = null;
    }
    if (this.peer) {
      try { this.peer.destroy(); } catch(e){}
      this.peer = null;
    }
    this.connected = false;
    this.isHost = false;
    this.roomCode = null;
    this.initialConfig = null;
  }
}

window.ChessNetwork = ChessNetwork;
