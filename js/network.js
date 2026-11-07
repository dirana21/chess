// WebRTC Peer-to-Peer Networking for Online Chess using PeerJS
class ChessNetwork {
  constructor() {
    this.peer = null;
    this.conn = null;
    this.isHost = false;
    this.roomCode = null;
    this.connected = false;
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
      error: null
    };
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
          connection.close();
          return;
        }
        this.conn = connection;
        this._setupConnection(initialConfig);
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

        this.conn.on('open', () => {
          this.connected = true;
          this._setupDataListener();
          this._emit('connected', { isHost: false, roomCode: this.roomCode });
          resolve({ roomCode: this.roomCode });
        });

        this.conn.on('close', () => {
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
    this.conn.on('open', () => {
      this.connected = true;
      this._setupDataListener();
      this._emit('connected', { isHost: true, roomCode: this.roomCode });

      // Host sends initial game configuration to guest
      if (initialConfig) {
        this.send({
          type: 'init',
          config: initialConfig
        });
      }
    });

    this.conn.on('close', () => {
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
      if (!data || !data.type) return;

      switch (data.type) {
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

  send(data) {
    if (this.conn && this.conn.open) {
      this.conn.send(data);
    }
  }

  sendMove(from, to, promotion, timeWhite, timeBlack) {
    this.send({
      type: 'move',
      from,
      to,
      promotion,
      timeWhite,
      timeBlack,
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

  sendCardPlay(card, targetSquare, byPlayer) {
    this.send({
      type: 'card-play',
      card,
      targetSquare,
      byPlayer,
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

  cleanup() {
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
  }
}

window.ChessNetwork = ChessNetwork;
