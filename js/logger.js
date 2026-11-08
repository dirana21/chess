// Comprehensive Network & Game Logger for Chess Online
class ChessLogger {
  constructor() {
    this.maxLogs = 600;
    this.logs = [];
    this.listeners = [];
    this.errorCount = 0;
    this.warnCount = 0;
    this.netCount = 0;
    this.storageKey = 'chess_network_logs_v1';

    this._loadFromStorage();
    this._setupGlobalErrorHandlers();
  }

  _loadFromStorage() {
    try {
      if (typeof localStorage === 'undefined') return;
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          this.logs = parsed.slice(-this.maxLogs);
          this._recount();
        }
      }
    } catch (e) {
      console.warn('Could not load logs from localStorage:', e);
    }
  }

  _saveToStorage() {
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.setItem(this.storageKey, JSON.stringify(this.logs.slice(-300)));
    } catch (e) {
      // Ignore quota errors
    }
  }

  _recount() {
    this.errorCount = this.logs.filter(l => l.level === 'ERROR').length;
    this.warnCount = this.logs.filter(l => l.level === 'WARN').length;
    this.netCount = this.logs.filter(l => l.level.startsWith('NET')).length;
  }

  _setupGlobalErrorHandlers() {
    if (typeof window === 'undefined' || typeof window.addEventListener !== 'function') return;

    window.addEventListener('error', (event) => {
      this.error('WINDOW', event.message || 'JavaScript runtime error', {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error ? event.error.stack : null
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      const reason = event.reason;
      this.error('PROMISE', reason ? (reason.message || String(reason)) : 'Unhandled Promise Rejection', {
        stack: reason && reason.stack ? reason.stack : null
      });
    });
  }

  onLog(callback) {
    if (typeof callback === 'function') {
      this.listeners.push(callback);
    }
  }

  _emit(entry) {
    this.listeners.forEach(fn => {
      try { fn(entry); } catch (e) {}
    });
  }

  log(level, category, message, details = null) {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');

    const entry = {
      id: Date.now() + Math.random().toString(36).substring(2, 6),
      timestamp: now.toISOString(),
      time: timeStr,
      level,
      category,
      message,
      details: details ? this._sanitize(details) : null
    };

    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    if (level === 'ERROR') this.errorCount++;
    if (level === 'WARN') this.warnCount++;
    if (level.startsWith('NET')) this.netCount++;

    // Mirror to browser console
    const tag = `[${level}][${category}]`;
    if (level === 'ERROR') {
      console.error(tag, message, details || '');
    } else if (level === 'WARN') {
      console.warn(tag, message, details || '');
    } else if (level.startsWith('NET')) {
      console.log(`%c${tag} ${message}`, 'color: #38bdf8;', details || '');
    } else {
      console.log(tag, message, details || '');
    }

    this._saveToStorage();
    this._emit(entry);
    return entry;
  }

  _sanitize(obj) {
    try {
      return JSON.parse(JSON.stringify(obj, (key, value) => {
        if (typeof value === 'function') return '[Function]';
        if (typeof HTMLElement !== 'undefined' && value instanceof HTMLElement) {
          return `[Element <${value.tagName.toLowerCase()}>]`;
        }
        if (value instanceof Error) {
          return { message: value.message, stack: value.stack };
        }
        return value;
      }));
    } catch (e) {
      return String(obj);
    }
  }

  info(category, message, details = null) {
    return this.log('INFO', category, message, details);
  }

  warn(category, message, details = null) {
    return this.log('WARN', category, message, details);
  }

  error(category, message, details = null) {
    return this.log('ERROR', category, message, details);
  }

  netSend(type, payload = null) {
    return this.log('NET_SEND', 'NETWORK', `📤 Отправлен пакет [${type}]`, payload);
  }

  netRecv(type, payload = null) {
    return this.log('NET_RECV', 'NETWORK', `📥 Получен пакет [${type}]`, payload);
  }

  move(color, moveObj, fen, isRemote = false) {
    const origin = isRemote ? 'Соперник (сеть)' : 'Локальный игрок';
    const side = color === 'w' ? 'Белые' : 'Чёрные';
    const san = moveObj.san || `${moveObj.from}->${moveObj.to}`;
    return this.log('INFO', 'MOVE', `♟️ Ход [${side}]: ${san} (${origin})`, {
      from: moveObj.from,
      to: moveObj.to,
      promotion: moveObj.promotion,
      fen: fen,
      isRemote: isRemote
    });
  }

  card(color, cardObj, targetSquare, isRemote = false) {
    const origin = isRemote ? 'Соперник (сеть)' : 'Локальный игрок';
    const side = color === 'w' ? 'Белые' : 'Чёрные';
    return this.log('INFO', 'CARD', `🃏 Разыграна карта [${side}]: «${cardObj.name}» (${origin})`, {
      cardId: cardObj.id,
      cardName: cardObj.name,
      targetSquare: targetSquare,
      isRemote: isRemote
    });
  }

  getLogs(filter = 'all') {
    if (filter === 'error') {
      return this.logs.filter(l => l.level === 'ERROR' || l.level === 'WARN');
    }
    if (filter === 'net') {
      return this.logs.filter(l => l.category === 'NETWORK' || l.category === 'PEER' || l.category === 'HEARTBEAT');
    }
    if (filter === 'moves') {
      return this.logs.filter(l => l.category === 'MOVE');
    }
    if (filter === 'cards') {
      return this.logs.filter(l => l.category === 'CARD');
    }
    return this.logs;
  }

  clear() {
    this.logs = [];
    this.errorCount = 0;
    this.warnCount = 0;
    this.netCount = 0;
    try {
      localStorage.removeItem(this.storageKey);
    } catch (e) {}
    this._emit({ type: 'clear' });
  }

  exportFormattedText(meta = {}) {
    let out = '========================================================\n';
    out += '         CHESS ONLINE DIAGNOSTIC & NETWORK LOG          \n';
    out += '========================================================\n';
    out += `Дата выгрузки:   ${new Date().toISOString()}\n`;
    out += `Комната:         ${meta.roomCode || '—'}\n`;
    out += `Игрок:           ${meta.myName || '—'} (${meta.myColor || '—'})\n`;
    out += `Соперник:        ${meta.opponentName || '—'} (${meta.opponentColor || '—'})\n`;
    out += `Статус сети:     ${meta.connected ? '🟢 ПОДКЛЮЧЕНО' : '🔴 НЕ ПОДКЛЮЧЕНО'}\n`;
    out += `Режим игры:      ${meta.mode || '—'} | Вариант: ${meta.variant || '—'}\n`;
    out += `Всего записей:   ${this.logs.length} (Ошибок: ${this.errorCount}, Предупреждений: ${this.warnCount})\n`;
    out += `User Agent:      ${typeof navigator !== 'undefined' ? navigator.userAgent : 'Node/Unknown'}\n`;
    out += '========================================================\n\n';

    this.logs.forEach((l, idx) => {
      const num = String(idx + 1).padStart(3, '0');
      out += `[#${num} ${l.time}] [${l.level}] [${l.category}] ${l.message}\n`;
      if (l.details) {
        out += `      Детали: ${JSON.stringify(l.details, null, 2).replace(/\n/g, '\n      ')}\n`;
      }
    });

    out += '\n==================== КОНЕЦ ЛОГА ====================\n';
    return out;
  }

  exportJSON() {
    return JSON.stringify({
      exportedAt: new Date().toISOString(),
      logs: this.logs
    }, null, 2);
  }
}

// Global Singleton
if (typeof window !== 'undefined') {
  window.logger = new ChessLogger();
}
if (typeof exports !== 'undefined') {
  exports.ChessLogger = ChessLogger;
}
