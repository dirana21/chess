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
        if (window.logger) {
          window.logger.info('SYSTEM', `Видимость вкладки изменена: ${document.visibilityState}`);
        }
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

      if (window.logger) {
        window.logger.info('PEER', `Создание комнаты хостом [${this.roomCode}]`, { peerId, config: initialConfig });
      }

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
        if (window.logger) {
          window.logger.info('PEER', `Сервер PeerJS зарегистрировал ID хоста: ${id}`, { roomCode: this.roomCode });
        }
        resolve({ roomCode: this.roomCode, peerId: id });
      });

      this.peer.on('connection', (connection) => {
        if (window.logger) {
          window.logger.info('PEER', `Входящее WebRTC-подключение от гостя [${connection.peer}]`, { roomCode: this.roomCode });
        }
        if (this.conn) {
          if (window.logger) {
            window.logger.warn('PEER', 'Уже есть активное подключение, отклоняем лишнее соединение');
          }
          try { connection.close(); } catch(e){}
          return;
        }
        this.conn = connection;
        this._setupConnection(this.initialConfig);
      });

      this.peer.on('error', (err) => {
        if (window.logger) {
          window.logger.error('PEER', `Ошибка Peer хоста: ${err.type || err.message}`, err);
        }
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

      if (window.logger) {
        window.logger.info('PEER', `Подключение к комнате [${this.roomCode}], целевой хост: ${hostPeerId}`);
      }

      this.peer = new Peer(null, {
        debug: 1,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        }
      });

      this.peer.on('open', (myPeerId) => {
        if (window.logger) {
          window.logger.info('PEER', `Гость получил ID от PeerJS: ${myPeerId}, устанавливаем соединение с ${hostPeerId}`);
        }
        this.conn = this.peer.connect(hostPeerId, {
          reliable: true
        });

        this._setupDataListener();

        const onOpen = () => {
          this.connected = true;
          this._startHeartbeat();
          if (window.logger) {
            window.logger.info('PEER', `Соединение с хостом [${this.roomCode}] успешно открыто!`);
          }
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
          if (window.logger) {
            window.logger.warn('PEER', `Соединение с хостом закрыто (close)`);
          }
          this._stopHeartbeat();
          this.connected = false;
          this._emit('disconnected');
        });

        this.conn.on('error', (err) => {
          if (window.logger) {
            window.logger.error('PEER', `Ошибка DataConnection у гостя: ${err.message || err}`, err);
          }
          this._emit('error', err);
          reject(err);
        });
      });

      this.peer.on('error', (err) => {
        if (window.logger) {
          window.logger.error('PEER', `Ошибка подключения PeerJS: ${err.type || err.message}`, err);
        }
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
      if (window.logger) {
        window.logger.info('PEER', `Канал данных открыт, хост отправляет init гостю`);
      }
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
      if (window.logger) {
        window.logger.warn('PEER', `Соединение с гостем закрыто (close)`);
      }
      this._stopHeartbeat();
      this.connected = false;
      this._emit('disconnected');
    });

    this.conn.on('error', (err) => {
      if (window.logger) {
        window.logger.error('PEER', `Ошибка соединения с гостем: ${err.message || err}`, err);
      }
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

      if (window.logger) {
        window.logger.netRecv(data.type, data);
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
        if (window.logger && data.type !== 'ping' && data.type !== 'pong') {
          window.logger.netSend(data.type, data);
        }
        return true;
      } else {
        if (window.logger && data.type !== 'ping' && data.type !== 'pong') {
          window.logger.warn('NETWORK', `Попытка отправки при закрытом канале [${data.type}]`, data);
        }
      }
    } catch (e) {
      if (window.logger) {
        window.logger.error('NETWORK', `Исключение при send() [${data ? data.type : 'unknown'}]: ${e.message}`, { error: e, data });
      }
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
        const elapsedSec = Math.round((Date.now() - this.lastHeartbeat) / 1000);
        if (window.logger) {
          window.logger.error('HEARTBEAT', `Таймаут пинга сети! Нет ответа ${elapsedSec} сек. Фиксируем дисконнект.`, { elapsedSec });
        }
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
