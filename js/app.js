// Main Chess Application Controller
document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const screenLobby = document.getElementById('screen-lobby');
  const screenGame = document.getElementById('screen-game');
  const screenWaiting = document.getElementById('screen-waiting');

  // Lobby controls
  const btnCreateOnline = document.getElementById('btn-create-online');
  const btnJoinOnline = document.getElementById('btn-join-online');
  const btnPlayBot = document.getElementById('btn-play-bot');
  const btnPassPlay = document.getElementById('btn-pass-play');

  const inputJoinCode = document.getElementById('join-code-input');
  const selectTimeControl = document.getElementById('time-control-select');
  const selectColor = document.getElementById('side-select');
  const selectBotLevel = document.getElementById('bot-level-select');

  // Waiting screen
  const displayRoomCode = document.getElementById('display-room-code');
  const displayRoomLink = document.getElementById('display-room-link');
  const btnCopyLink = document.getElementById('btn-copy-link');
  const btnCancelWait = document.getElementById('btn-cancel-wait');

  // Game UI
  const boardContainer = document.getElementById('chess-board-container');
  const timerTopEl = document.getElementById('timer-top');
  const timerBottomEl = document.getElementById('timer-bottom');
  const nameTopEl = document.getElementById('player-name-top');
  const nameBottomEl = document.getElementById('player-name-bottom');
  const capturedTopEl = document.getElementById('captured-top');
  const capturedBottomEl = document.getElementById('captured-bottom');
  const materialAdvantageEl = document.getElementById('material-advantage');
  const moveHistoryEl = document.getElementById('move-history-list');

  // Game action buttons
  const btnResign = document.getElementById('btn-resign');
  const btnOfferDraw = document.getElementById('btn-offer-draw');
  const btnFlipBoard = document.getElementById('btn-flip-board');
  const btnToggleMute = document.getElementById('btn-toggle-sound');
  const btnLeaveGame = document.getElementById('btn-leave-game');

  // Modal GameOver
  const modalGameOver = document.getElementById('modal-gameover');
  const gameOverTitle = document.getElementById('gameover-title');
  const gameOverDesc = document.getElementById('gameover-desc');
  const btnRematch = document.getElementById('btn-rematch');
  const btnReturnLobby = document.getElementById('btn-return-lobby');

  // Cards UI Elements
  const gameVariantSelect = document.getElementById('game-variant-select');
  const activeDecreesContainer = document.getElementById('active-decrees-container');
  const activeDecreesList = document.getElementById('active-decrees-list');
  const targetingBanner = document.getElementById('targeting-banner');
  const targetingCardName = document.getElementById('targeting-card-name');
  const btnCancelTarget = document.getElementById('btn-cancel-target');
  const cardDrawAnnouncement = document.getElementById('card-draw-announcement');

  // Top HUD & Game Menu Elements
  const btnGameMenuToggle = document.getElementById('btn-game-menu-toggle');
  const gameMenuDropdown = document.getElementById('game-menu-dropdown');
  const menuItemDraw = document.getElementById('menu-item-draw');
  const menuItemResign = document.getElementById('menu-item-resign');
  const menuItemFlip = document.getElementById('menu-item-flip');
  const menuItemLogs = document.getElementById('menu-item-logs');
  const menuItemSound = document.getElementById('menu-item-sound');
  const menuItemLeave = document.getElementById('menu-item-leave');

  // Semi-Transparent Cards Inventory Elements
  const btnOpenCardsInv = document.getElementById('btn-open-cards-inv');
  const hudCardsBadge = document.getElementById('hud-cards-badge');
  const hudNextCardTimer = document.getElementById('hud-next-card-timer');
  const cardsInventoryOverlay = document.getElementById('cards-inventory-overlay');
  const inventoryBackdrop = document.getElementById('inventory-backdrop');
  const btnCloseInventory = document.getElementById('btn-close-inventory');
  const invCardsCount = document.getElementById('inv-cards-count');
  const invTurnsUntil = document.getElementById('inv-turns-until');
  const inventoryCardsContainer = document.getElementById('inventory-cards-container');

  // Card Showcase Cinematic Elements
  const cardShowcaseOverlay = document.getElementById('card-showcase-overlay');
  const showcaseBanner = document.getElementById('showcase-banner');
  const showcaseCasterIcon = document.getElementById('showcase-caster-icon');
  const showcaseCasterTitle = document.getElementById('showcase-caster-title');
  const showcaseCard = document.getElementById('showcase-card');
  const showcaseGem = document.getElementById('showcase-gem');
  const showcaseType = document.getElementById('showcase-type');
  const showcaseIcon = document.getElementById('showcase-icon');
  const showcaseName = document.getElementById('showcase-name');
  const showcaseDesc = document.getElementById('showcase-desc');
  const showcaseTargetTag = document.getElementById('showcase-target-tag');
  const showcaseTargetText = document.getElementById('showcase-target-text');

  let showcaseTimeout = null;

  function showCardPlayCinematic(card, isMe, targetText = null) {
    if (!cardShowcaseOverlay) return;

    if (showcaseTimeout) {
      clearTimeout(showcaseTimeout);
      showcaseTimeout = null;
    }

    const rarityData = CARD_RARITIES[card.rarity] || CARD_RARITIES.COMMON;
    showcaseCard.style.setProperty('--showcase-bg', rarityData.bg);
    showcaseCard.style.setProperty('--showcase-border', rarityData.border);

    if (isMe) {
      showcaseBanner.className = 'showcase-banner caster-you';
      showcaseCasterIcon.textContent = '👑';
      showcaseCasterTitle.textContent = 'ВЫ СЫГРАЛИ КАРТУ:';
    } else {
      showcaseBanner.className = 'showcase-banner caster-enemy';
      showcaseCasterIcon.textContent = '⚔️';
      showcaseCasterTitle.textContent = 'СОПЕРНИК СЫГРАЛ КАРТУ:';
    }

    showcaseType.textContent = card.type === 'decree' ? 'УКАЗ / ПРОКЛЯТИЕ' : 'ЗАКЛИНАНИЕ';
    showcaseIcon.textContent = card.icon;
    showcaseName.textContent = card.name;
    showcaseDesc.textContent = card.description;

    if (targetText) {
      showcaseTargetTag.classList.remove('hidden');
      showcaseTargetText.textContent = targetText;
    } else {
      showcaseTargetTag.classList.add('hidden');
    }

    cardShowcaseOverlay.classList.remove('hidden');

    showcaseTimeout = setTimeout(() => {
      cardShowcaseOverlay.classList.add('hidden');
      showcaseTimeout = null;
    }, 2200);
  }

  if (cardShowcaseOverlay) {
    cardShowcaseOverlay.addEventListener('click', () => {
      if (showcaseTimeout) {
        clearTimeout(showcaseTimeout);
        showcaseTimeout = null;
      }
      cardShowcaseOverlay.classList.add('hidden');
    });
  }

  // Chat & Reactions
  const chatMessagesEl = document.getElementById('chat-messages');
  const chatInput = document.getElementById('chat-input');
  const btnSendChat = document.getElementById('btn-send-chat');
  const emojiBtns = document.querySelectorAll('.emoji-btn');

  // Notifications Toast
  const toastContainer = document.getElementById('toast-container');

  // Logs Diagnostic UI Elements
  const btnOpenLogs = document.getElementById('btn-open-logs');
  const modalLogs = document.getElementById('modal-logs');
  const btnCloseLogs = document.getElementById('btn-close-logs');
  const logsBadge = document.getElementById('logs-badge');
  const logsViewer = document.getElementById('logs-viewer');
  const logConnectionStatus = document.getElementById('log-connection-status');
  const logStatusDot = document.getElementById('log-status-dot');
  const logMetaInfo = document.getElementById('log-meta-info');
  const btnCopyLogs = document.getElementById('btn-copy-logs');
  const btnClearLogs = document.getElementById('btn-clear-logs');
  const countAllLogs = document.getElementById('count-all-logs');
  const countErrorLogs = document.getElementById('count-error-logs');
  const countNetLogs = document.getElementById('count-net-logs');
  let currentLogFilter = 'all';

  function updateLogsBadge() {
    if (!window.logger || !logsBadge) return;
    const errors = window.logger.errorCount;
    if (errors > 0) {
      logsBadge.textContent = errors;
      logsBadge.classList.remove('hidden');
    } else {
      logsBadge.classList.add('hidden');
    }
    if (countAllLogs) countAllLogs.textContent = window.logger.logs.length;
    if (countErrorLogs) countErrorLogs.textContent = window.logger.errorCount + window.logger.warnCount;
    if (countNetLogs) countNetLogs.textContent = window.logger.netCount;

    const errBtn = document.querySelector('.btn-filter.filter-errors');
    if (errBtn) {
      errBtn.classList.toggle('has-errors', (window.logger.errorCount + window.logger.warnCount) > 0);
    }
  }

  function escapeHtml(str) {
    if (typeof str !== 'string') return String(str);
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function renderLogs() {
    if (!logsViewer || !window.logger) return;
    const logs = window.logger.getLogs(currentLogFilter);
    logsViewer.innerHTML = '';

    if (logs.length === 0) {
      logsViewer.innerHTML = '<div style="color: #64748b; text-align: center; padding: 2rem;">Записей в логе пока нет</div>';
      return;
    }

    logs.forEach(l => {
      const entryEl = document.createElement('div');
      entryEl.className = `log-entry level-${l.level}`;
      
      let detailsHtml = '';
      if (l.details) {
        detailsHtml = `<div class="log-details-block">${escapeHtml(JSON.stringify(l.details, null, 2))}</div>`;
      }

      entryEl.innerHTML = `
        <div class="log-header-line">
          <span class="log-time">${l.time}</span>
          <span class="log-tag">${l.category}</span>
          <span class="log-msg">${escapeHtml(l.message)}</span>
        </div>
        ${detailsHtml}
      `;
      logsViewer.appendChild(entryEl);
    });

    logsViewer.scrollTop = logsViewer.scrollHeight;

    if (logConnectionStatus && logStatusDot) {
      const isConn = network && network.isConnected();
      logStatusDot.className = `status-dot ${isConn ? 'online' : 'offline'}`;
      logConnectionStatus.textContent = isConn ? 'Статус: Подключено (WebRTC P2P)' : 'Статус: Не подключено';
    }

    if (logMetaInfo) {
      logMetaInfo.textContent = `Комната: ${network && network.roomCode ? network.roomCode : '—'} | Вы: ${myColor === 'w' ? 'Белые' : 'Чёрные'} | Режим: ${mode}`;
    }

    updateLogsBadge();
  }

  function openLogsModal() {
    renderLogs();
    if (modalLogs) modalLogs.classList.remove('hidden');
  }

  function closeLogsModal() {
    if (modalLogs) modalLogs.classList.add('hidden');
  }

  if (btnOpenLogs) btnOpenLogs.addEventListener('click', openLogsModal);
  if (btnCloseLogs) btnCloseLogs.addEventListener('click', closeLogsModal);

  document.querySelectorAll('.logs-filter-bar .btn-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.logs-filter-bar .btn-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentLogFilter = btn.dataset.filter;
      renderLogs();
    });
  });

  if (btnCopyLogs) {
    btnCopyLogs.addEventListener('click', () => {
      if (!window.logger) return;
      const meta = {
        roomCode: network ? network.roomCode : null,
        myName,
        myColor,
        opponentName,
        opponentColor,
        connected: network ? network.isConnected() : false,
        mode,
        variant: gameVariant
      };
      const text = window.logger.exportFormattedText(meta);
      navigator.clipboard.writeText(text).then(() => {
        showToast('📋 Логи скопированы в буфер обмена!');
      }).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
        showToast('📋 Логи скопированы!');
      });
    });
  }

  if (btnClearLogs) {
    btnClearLogs.addEventListener('click', () => {
      if (window.logger) {
        window.logger.clear();
        renderLogs();
        showToast('Логи очищены');
      }
    });
  }

  if (window.logger) {
    window.logger.onLog(() => {
      updateLogsBadge();
      if (modalLogs && !modalLogs.classList.contains('hidden')) {
        renderLogs();
      }
    });
    updateLogsBadge();
  }

  // Application State
  let game = new Chess();
  let network = new ChessNetwork();
  let bot = new ChessBot();
  let deckManager = new CardDeckManager();
  let botDeckManager = null;
  let boardUI = null;
  let gameEnded = false;
  let pendingOnlineConfig = null;

  if (game && typeof game.set_freeze_fn === 'function') {
    game.set_freeze_fn((sq) => (gameVariant === 'cards' && deckManager) ? deckManager.isPieceFrozen(sq) : false);
  }

  let mode = 'online'; // 'online', 'bot', 'pass'
  let gameVariant = 'cards'; // 'cards' or 'classic'
  let myColor = 'w';
  let opponentColor = 'b';
  let opponentName = 'Соперник';
  let myName = 'Вы';
  let botDifficulty = 'medium';

  let totalMovesCount = 0;
  let pendingCard = null; // Card currently being targeted
  let targetingStep = 1;
  let shadowSwapKnight = null;

  // Timers
  let timeInitial = 600; // in seconds (10 min)
  let timerWhite = timeInitial;
  let timerBlack = timeInitial;
  let timerInterval = null;

  function showToast(message, duration = 3000) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  function initBoard() {
    boardUI = new ChessBoardUI(boardContainer, {
      orientation: myColor,
      interactive: true,
      deckManager: gameVariant === 'cards' ? deckManager : null,
      playerColor: (mode === 'online' || mode === 'bot') ? myColor : null,
      onMove: handleLocalMove,
      onSquareTargeted: handleSquareTargeted
    });
    boardUI.setGame(game);
  }

  function switchScreen(screen) {
    screenLobby.classList.add('hidden');
    screenWaiting.classList.add('hidden');
    screenGame.classList.add('hidden');
    screen.classList.remove('hidden');
  }

  // --- Timer Engine ---
  function startTimer() {
    stopTimer();
    if (timeInitial <= 0) {
      updateTimerDisplay();
      return;
    }

    timerInterval = setInterval(() => {
      if (game.game_over()) {
        stopTimer();
        return;
      }

      if (game.turn() === 'w') {
        timerWhite = Math.max(0, timerWhite - 1);
        if (timerWhite === 0) {
          handleTimeout('w');
        }
      } else {
        timerBlack = Math.max(0, timerBlack - 1);
        if (timerBlack === 0) {
          handleTimeout('b');
        }
      }
      updateTimerDisplay();
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function formatTime(seconds) {
    if (seconds <= 0 && timeInitial <= 0) return '∞';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  function updateTimerDisplay() {
    const whiteStr = formatTime(timerWhite);
    const blackStr = formatTime(timerBlack);

    const bottomTimer = myColor === 'w' ? timerWhite : timerBlack;
    const topTimer = myColor === 'w' ? timerBlack : timerWhite;

    timerBottomEl.textContent = myColor === 'w' ? whiteStr : blackStr;
    timerTopEl.textContent = myColor === 'w' ? blackStr : whiteStr;

    timerBottomEl.classList.toggle('low-time', bottomTimer > 0 && bottomTimer <= 30);
    timerTopEl.classList.toggle('low-time', topTimer > 0 && topTimer <= 30);

    timerBottomEl.classList.toggle('active-turn', game.turn() === myColor);
    timerTopEl.classList.toggle('active-turn', game.turn() !== myColor);
  }

  function handleTimeout(lostColor) {
    stopTimer();
    const winner = lostColor === 'w' ? 'Чёрные' : 'Белые';
    endGame(`Время вышло!`, `Победа: ${winner}`);
  }

  // --- Card System Engine ---
  function openCardsInventory() {
    renderCardsHand();
    if (cardsInventoryOverlay) cardsInventoryOverlay.classList.remove('hidden');
    if (btnOpenCardsInv) btnOpenCardsInv.classList.remove('has-new-card');
  }

  function closeCardsInventory() {
    if (cardsInventoryOverlay) cardsInventoryOverlay.classList.add('hidden');
  }

  function toggleCardsInventory() {
    if (!cardsInventoryOverlay) return;
    if (cardsInventoryOverlay.classList.contains('hidden')) {
      openCardsInventory();
    } else {
      closeCardsInventory();
    }
  }

  function toggleGameMenu(forceClose = false) {
    if (!gameMenuDropdown) return;
    if (forceClose || !gameMenuDropdown.classList.contains('hidden')) {
      gameMenuDropdown.classList.add('hidden');
    } else {
      gameMenuDropdown.classList.remove('hidden');
    }
  }

  function triggerCardDraw() {
    if (gameVariant !== 'cards') return;
    const drawn = deckManager.drawCard();
    if (drawn) {
      if (window.sounds) window.sounds.play('card_draw');
      showCardDrawAnnouncement();
      if (btnOpenCardsInv) btnOpenCardsInv.classList.add('has-new-card');
      renderCardsHand();
      showToast(`🎴 Получена карта: ${drawn.name}!`);
    }
  }

  function showCardDrawAnnouncement() {
    cardDrawAnnouncement.classList.remove('hidden');
    setTimeout(() => {
      cardDrawAnnouncement.classList.add('hidden');
    }, 2400);
  }

  function renderCardsHand() {
    const boardSec = document.querySelector('.game-board-section');
    if (gameVariant !== 'cards') {
      if (btnOpenCardsInv) btnOpenCardsInv.classList.add('hidden');
      if (hudNextCardTimer) hudNextCardTimer.classList.add('hidden');
      if (activeDecreesContainer) activeDecreesContainer.classList.add('hidden');
      if (boardSec) boardSec.classList.add('classic-mode');
      closeCardsInventory();
      return;
    }

    if (btnOpenCardsInv) btnOpenCardsInv.classList.remove('hidden');
    if (hudNextCardTimer) hudNextCardTimer.classList.remove('hidden');
    if (activeDecreesContainer) activeDecreesContainer.classList.remove('hidden');
    if (boardSec) boardSec.classList.remove('classic-mode');

    const handLen = deckManager.hand.length;
    const movesTillNext = 3 - (Math.floor(totalMovesCount / 2) % 3);
    const turnsVal = movesTillNext === 0 ? 3 : movesTillNext;

    if (hudCardsBadge) hudCardsBadge.textContent = `${handLen}/4`;
    if (invCardsCount) invCardsCount.textContent = handLen;
    if (invTurnsUntil) invTurnsUntil.textContent = turnsVal;
    if (hudNextCardTimer) {
      hudNextCardTimer.innerHTML = `Карта через: <strong>${turnsVal}</strong> х.`;
    }

    if (!inventoryCardsContainer) return;
    inventoryCardsContainer.innerHTML = '';

    if (handLen === 0) {
      inventoryCardsContainer.innerHTML = `
        <div class="inventory-empty-hint">
          <div class="inventory-empty-icon">🎴</div>
          <strong>Инвентарь заклинаний пуст</strong>
          <span>Следующая карта будет получена через ${turnsVal} хода.</span>
        </div>
      `;
      return;
    }

    deckManager.hand.forEach(card => {
      const rarityData = CARD_RARITIES[card.rarity] || CARD_RARITIES.COMMON;
      const cardEl = document.createElement('div');
      cardEl.className = `hs-card rarity-${card.rarity.toLowerCase()}`;
      cardEl.title = `${card.name}: ${card.description}`;
      cardEl.style.setProperty('--card-bg', rarityData.bg);
      cardEl.style.setProperty('--card-border', rarityData.border);

      cardEl.innerHTML = `
        <div class="card-top-bar">
          <span class="card-gem"></span>
          <span class="card-type-tag">${card.type === 'decree' ? 'УКАЗ' : 'СПЕЛЛ'}</span>
        </div>
        <div class="card-art-box">
          <span class="card-icon">${card.icon}</span>
        </div>
        <div class="card-name">${card.name}</div>
        <div class="card-desc">${card.description}</div>
        <button class="btn-play-card">Разыграть</button>
      `;

      const btnPlay = cardEl.querySelector('.btn-play-card');
      btnPlay.addEventListener('click', (e) => {
        e.stopPropagation();
        closeCardsInventory();
        initiateCardPlay(card);
      });

      cardEl.addEventListener('click', () => {
        closeCardsInventory();
        initiateCardPlay(card);
      });

      inventoryCardsContainer.appendChild(cardEl);
    });
  }

  function renderActiveDecrees() {
    if (gameVariant !== 'cards') return;
    activeDecreesList.innerHTML = '';

    if (deckManager.activeDecrees.length === 0) {
      activeDecreesList.innerHTML = '<span class="no-decrees-hint">Нет активных проклятий и указов</span>';
      return;
    }

    deckManager.activeDecrees.forEach(d => {
      const badge = document.createElement('div');
      const isEnemyDecree = d.owner !== myColor;
      badge.className = `decree-badge ${isEnemyDecree ? 'enemy-decree' : ''}`;
      badge.setAttribute('tabindex', '0');
      badge.innerHTML = `
        <span class="decree-icon">${d.icon}</span>
        <strong class="decree-name">${d.name}</strong>
        <span class="decree-timer">⏳ ${d.duration} ${d.duration === 1 ? 'ход' : 'х.'}</span>
        
        <div class="decree-tooltip">
          <div class="tooltip-title">${d.icon} ${d.name} (${isEnemyDecree ? 'Вражеский' : 'Ваш'})</div>
          <div class="tooltip-trigger">⚡ <strong>Триггер:</strong> ${d.card.trigger || d.card.description}</div>
          <div class="tooltip-penalty">⚠️ <strong>Штраф:</strong> ${d.card.penalty || 'Штрафной эффект'}</div>
          <div class="tooltip-footer">Осталось ходов: <strong>${d.duration}</strong> • <em>Нажмите, чтобы закрыть</em></div>
        </div>
      `;

      badge.addEventListener('click', (e) => {
        e.stopPropagation();
        badge.classList.toggle('active-tooltip');
      });

      activeDecreesList.appendChild(badge);
    });
  }

  function initiateCardPlay(card) {
    closeCardsInventory();
    if (game.game_over()) return;
    // Check if it's player's turn (in online/bot mode)
    if ((mode === 'online' || mode === 'bot') && game.turn() !== myColor) {
      showToast('Карты можно разыгрывать только в свой ход!');
      return;
    }

    // Special multi-step handling for Shadow Swap
    if (card.id === 'shadow_swap') {
      const bState = game.board();
      let hasKnight = false, hasPawn = false;
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const p = bState[r][c];
          if (p && p.color === myColor) {
            if (p.type === 'n') hasKnight = true;
            if (p.type === 'p') hasPawn = true;
          }
        }
      }
      if (!hasKnight || !hasPawn) {
        showToast('Для «Обмена теней» вам нужны и Конь, и Пешка на доске!');
        return;
      }

      pendingCard = card;
      targetingStep = 1;
      shadowSwapKnight = null;
      targetingBanner.classList.remove('hidden');
      document.getElementById('targeting-instructions').innerHTML = 'Шаг 1 из 2: <strong>Выберите вашего Коня 🐎</strong> (подсвечен золотым)';
      boardUI.setTargetingMode('my_knight');
      showToast('Шаг 1: Кликните по вашему Коню на доске');
      return;
    }

    if (card.requiresTarget) {
      pendingCard = card;
      targetingBanner.classList.remove('hidden');
      document.getElementById('targeting-instructions').innerHTML = card.targetHint || `Выберите цель на доске для «${card.name}»`;
      boardUI.setTargetingMode(card.requiresTarget);
      showToast(card.targetHint || `Выберите цель на доске для «${card.name}»`);
    } else {
      applyCardEffect(card, null, false);
    }
  }

  function cancelTargeting() {
    pendingCard = null;
    targetingStep = 1;
    shadowSwapKnight = null;
    targetingBanner.classList.add('hidden');
    if (boardUI) boardUI.setTargetingMode(null);
  }

  btnCancelTarget.addEventListener('click', cancelTargeting);

  function handleSquareTargeted(square) {
    if (!pendingCard) return;

    if (pendingCard.id === 'shadow_swap') {
      if (targetingStep === 1) {
        shadowSwapKnight = square;
        targetingStep = 2;
        boardUI.setTargetingMode('my_pawn', shadowSwapKnight);
        document.getElementById('targeting-instructions').innerHTML = `Шаг 2 из 2: <strong>Выберите вашу Пешку ♟️</strong> для обмена с конём (${square})`;
        showToast(`Конь (${square}) выбран! Теперь кликните по вашей пешке`);
        return;
      } else if (targetingStep === 2) {
        const swapPawn = square;
        const swapKnight = shadowSwapKnight;
        const card = pendingCard;
        cancelTargeting();
        applyShadowSwap(swapKnight, swapPawn, false, card);
        return;
      }
    }

    const card = pendingCard;
    cancelTargeting();
    applyCardEffect(card, square, false);
  }

  function applyShadowSwap(knightSq, pawnSq, isRemote = false, card = null) {
    const kPiece = game.get(knightSq);
    const pPiece = game.get(pawnSq);
    if (!kPiece || !pPiece) return;

    game.remove(knightSq);
    game.remove(pawnSq);
    game.put(kPiece, pawnSq);

    // If pawn lands on rank 1 or 8, promote it to a Knight so it never gets stuck
    const destRank = parseInt(knightSq[1], 10);
    const isPawnOnBackRank = (pPiece.type === 'p') && ((pPiece.color === 'w' && destRank === 1) || (pPiece.color === 'b' && destRank === 8));
    if (isPawnOnBackRank) {
      game.put({ type: 'n', color: pPiece.color }, knightSq);
    } else {
      game.put(pPiece, knightSq);
    }
    game.load(game.fen());

    if (window.sounds) window.sounds.play('castle');

    if (card) {
      showCardPlayCinematic(card, !isRemote, `Конь (${knightSq}) ⇄ Пешка (${pawnSq})`);
    }

    if (window.logger) {
      window.logger.card(isRemote ? opponentColor : myColor, card, `Конь ${knightSq} ⇄ Пешка ${pawnSq}`, isRemote);
    }

    if (!isRemote && card) {
      deckManager.removeCard(card.instanceId);
      if (mode === 'online') {
        network.sendCardPlay(card, null, myColor, 'shadow_swap', { knightSq, pawnSq }, game.fen());
      }
      showToast(isPawnOnBackRank 
        ? `👥 Обмен теней: Конь переместился на ${pawnSq}, а пешка стала всадником на ${knightSq}!` 
        : `👥 Обмен теней: Конь (${knightSq}) и Пешка (${pawnSq}) поменялись местами!`, 4000);
    } else {
      showToast(`👥 Соперник применил «Обмен теней»: Конь и Пешка поменялись местами!`, 4000);
    }

    boardUI.lastMove = { from: knightSq, to: pawnSq };
    renderCardsHand();
    if (boardUI) boardUI.render();
  }

  function applyCardEffect(card, targetSquare, isRemote = false) {
    if (window.sounds) window.sounds.play('card_play');
    showCardPlayCinematic(card, !isRemote, targetSquare);

    if (!isRemote) {
      deckManager.removeCard(card.instanceId);
      if (mode === 'online') {
        network.sendCardPlay(card, targetSquare, myColor, null, null, game.fen());
      }
    }

    const casterColor = isRemote ? opponentColor : myColor;

    if (window.logger) {
      window.logger.card(casterColor, card, targetSquare, isRemote);
    }

    // Apply Effect
    if (card.type === 'decree') {
      deckManager.addDecree(card, casterColor);
      if (card.id === 'forbidden_square' && targetSquare) {
        deckManager.forbiddenSquares[targetSquare] = { turns: card.duration || 3, byPlayer: casterColor };
        showToast(`☠️ «Чёрная Метка» установлена на ${targetSquare}! Любой враг застынет во льду!`);
      } else {
        showToast(`📜 Разыгран Указ: «${card.name}»!`);
      }
      if (window.sounds) window.sounds.play('curse');
    } else {
      // Instant Spells
      switch (card.id) {
        case 'freeze_piece':
          if (targetSquare) {
            const piece = boardUI.getPieceAt(targetSquare);
            const targetColor = piece ? piece.color : (casterColor === 'w' ? 'b' : 'w');
            const wasInCheck = game.in_check();
            deckManager.freezePiece(targetSquare, targetColor, 1);
            if (window.sounds) window.sounds.play('freeze');
            if (wasInCheck && !game.in_check()) {
              showToast(`❄️ Шах снят! Атакующая фигура на ${targetSquare} закована во лёд!`, 5000);
            } else {
              showToast(`❄️ Фигура на ${targetSquare} заморожена!`);
            }
          }
          break;

        case 'smoke_screen':
          if (targetSquare) {
            let fileChar = targetSquare[0];
            let rankNum = parseInt(targetSquare[1], 10);
            if (fileChar === 'h') fileChar = 'g';
            if (rankNum === 8) rankNum = 7;
            const nextFile = String.fromCharCode(fileChar.charCodeAt(0) + 1);
            const nextRank = rankNum + 1;
            deckManager.smokeArea = {
              squares: [fileChar + rankNum, nextFile + rankNum, fileChar + nextRank, nextFile + nextRank],
              turns: 2
            };
            showToast(`🌫️ Туман окутал клетки ${fileChar + rankNum}–${nextFile + nextRank}! Взятия запрещены!`);
          }
          break;

        case 'reinforcements':
          if (targetSquare) {
            game.put({ type: 'p', color: casterColor }, targetSquare);
            game.load(game.fen());
            if (window.sounds) window.sounds.play('card_play');
            showToast(`🎺 «Зов Резерва»: Пешка призвана на ${targetSquare}!`);
          }
          break;

        case 'infantry_march':
          if (targetSquare) {
            const piece = game.get(targetSquare);
            if (piece && piece.type === 'p') {
              const file = targetSquare[0];
              const rank = parseInt(targetSquare[1], 10);
              const forwardRank = piece.color === 'w' ? rank + 1 : rank - 1;
              const forwardSquare = file + forwardRank;
              if (forwardRank >= 1 && forwardRank <= 8 && !game.get(forwardSquare)) {
                game.remove(targetSquare);
                const isPromo = (piece.color === 'w' && forwardRank === 8) || (piece.color === 'b' && forwardRank === 1);
                game.put({ type: isPromo ? 'q' : 'p', color: piece.color }, forwardSquare);
                game.load(game.fen());
                boardUI.lastMove = { from: targetSquare, to: forwardSquare };
                if (window.sounds) window.sounds.play('move');
                showToast(isPromo 
                  ? `⚔️ Марш Пехоты: Пешка прорвалась на ${forwardSquare} и стала Ферзём!` 
                  : `⚔️ Марш Пехоты: Пешка совершила марш-бросок на ${forwardSquare}!`);
              }
            }
          }
          break;

        case 'kings_shield':
          deckManager.kingsShield[casterColor] = 2;
          showToast('✨ «Аура Стойкости»: Король защищен золотым щитом на 2 хода!');
          break;

        case 'alchemist_gold':
          if (!isRemote) {
            triggerCardDraw();
            triggerCardDraw();
            showToast('🔮 Получено 2 новые карты!');
          } else if (botDeckManager) {
            botDeckManager.drawCard();
            botDeckManager.drawCard();
          }
          break;

        case 'time_warp':
          if (casterColor === 'w') {
            timerWhite += 45;
            timerBlack = Math.max(5, timerBlack - 15);
          } else {
            timerBlack += 45;
            timerWhite = Math.max(5, timerWhite - 15);
          }
          updateTimerDisplay();
          showToast('⏳ Время искажено: +45 сек вам, -15 сек сопернику!');
          break;

        case 'divine_storm':
          // Stuns all enemy knights and bishops
          const enemyCol = casterColor === 'w' ? 'b' : 'w';
          const bState = game.board();
          for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
              const p = bState[r][c];
              if (p && p.color === enemyCol && (p.type === 'n' || p.type === 'b')) {
                const sq = String.fromCharCode(97 + c) + (8 - r);
                deckManager.freezePiece(sq, enemyCol, 1);
              }
            }
          }
          if (window.sounds) window.sounds.play('thunder');
          showToast('⚡ Небесный Гром заморозил всех вражеских коней и слонов!');
          break;
      }
    }

    renderCardsHand();
    renderActiveDecrees();
    if (boardUI) boardUI.render();
  }

  function checkDecreePenalties(moveResult, movedColor) {
    if (gameVariant !== 'cards') return;

    // Check if movedColor violated any decrees set by opponent
    const opponent = movedColor === 'w' ? 'b' : 'w';
    const decrees = deckManager.activeDecrees.filter(d => d.owner === opponent);

    decrees.forEach(d => {
      // 1. Curse Knight
      if (d.id === 'curse_knight' && moveResult.piece === 'n') {
        deckManager.freezePiece(moveResult.to, movedColor, 1);
        if (window.sounds) {
          window.sounds.play('curse_trigger');
          setTimeout(() => window.sounds.play('freeze'), 150);
        }
        showToast(`⚠️ «Оковы Кентавра»: конь на ${moveResult.to} застыл во льду на 1 ход!`, 4000);
      }

      // 2. Curse Rook
      if (d.id === 'curse_rook' && moveResult.piece === 'r') {
        if (d.owner === myColor) {
          if (window.sounds) window.sounds.play('card_draw');
          triggerCardDraw();
          showToast('🎁 Враг походил Ладьёй! Вы получаете бонусную карту!');
        } else if (botDeckManager && d.owner === opponentColor) {
          botDeckManager.drawCard();
          showToast('🎁 Вражеский Указ сработал: Соперник получил бонусную карту за ход ладьёй!');
        }
      }

      // 3. Tax Castle
      if (d.id === 'tax_castle' && (moveResult.flags.includes('k') || moveResult.flags.includes('q'))) {
        deckManager.freezePiece(moveResult.to, movedColor, 1);
        if (window.sounds) {
          window.sounds.play('curse_trigger');
          setTimeout(() => window.sounds.play('freeze'), 150);
        }
        showToast(`⚠️ «Запрет на Бункер»: Король застыл во льду на 1 ход!`, 4000);
      }

      // 4. Blood Tribute
      if (d.id === 'blood_tribute' && moveResult.captured) {
        deckManager.freezePiece(moveResult.to, movedColor, 1);
        if (window.sounds) {
          window.sounds.play('curse_trigger');
          setTimeout(() => window.sounds.play('freeze'), 150);
        }
        showToast(`🩸 «Возмездие Крови»: фигура на ${moveResult.to} заморожена за взятие!`, 4000);
      }
    });

    // Check forbidden square trigger
    if (deckManager.forbiddenSquares[moveResult.to]) {
      deckManager.freezePiece(moveResult.to, movedColor, 1);
      delete deckManager.forbiddenSquares[moveResult.to];
      if (window.sounds) window.sounds.play('freeze');
      showToast(`☠️ «Чёрная Метка»: фигура наступила на проклятую клетку и заморожена!`, 4000);
    }

    // Check King's Shield retaliation if move delivered check
    if (game.in_check()) {
      const kingColor = game.turn();
      if (deckManager.kingsShield && deckManager.kingsShield[kingColor] > 0) {
        deckManager.freezePiece(moveResult.to, movedColor, 1);
        if (window.sounds) {
          window.sounds.play('curse_trigger');
          setTimeout(() => window.sounds.play('freeze'), 150);
        }
        showToast(`✨ «Аура Стойкости»: Король защищён! Атаковавшая фигура на ${moveResult.to} застыла во льду!`, 4000);
      }
    }
  }

  function botAttemptCardPlay() {
    if (!botDeckManager || botDeckManager.hand.length === 0 || game.game_over()) return;
    if (Math.random() > 0.45) return;

    const hand = botDeckManager.hand;
    const card = hand[Math.floor(Math.random() * hand.length)];
    if (!card) return;

    const botColor = opponentColor;
    const humanColor = myColor;

    if (card.type === 'decree') {
      if (card.id === 'forbidden_square') {
        const targetSquares = ['d4', 'e4', 'd5', 'e5', 'c5', 'f5', 'd3', 'e3'];
        const emptySq = targetSquares.find(sq => !game.get(sq) && !deckManager.forbiddenSquares[sq]);
        if (emptySq) {
          botDeckManager.removeCard(card.instanceId);
          applyCardEffect(card, emptySq, true);
        }
      } else {
        botDeckManager.removeCard(card.instanceId);
        applyCardEffect(card, null, true);
      }
      return;
    }

    // Spells
    switch (card.id) {
      case 'freeze_piece': {
        const b = game.board();
        let targetSq = null;
        let bestValue = -1;
        const valMap = { q: 9, r: 5, b: 3, n: 3, p: 1 };
        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            const p = b[r][c];
            if (p && p.color === humanColor && p.type !== 'k') {
              const sq = String.fromCharCode(97 + c) + (8 - r);
              if (!deckManager.isPieceFrozen(sq) && valMap[p.type] > bestValue) {
                bestValue = valMap[p.type];
                targetSq = sq;
              }
            }
          }
        }
        if (targetSq) {
          botDeckManager.removeCard(card.instanceId);
          applyCardEffect(card, targetSq, true);
        }
        break;
      }

      case 'shadow_swap': {
        const b = game.board();
        let kSq = null, pSq = null;
        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            const p = b[r][c];
            if (p && p.color === botColor) {
              const sq = String.fromCharCode(97 + c) + (8 - r);
              if (p.type === 'n' && !kSq) kSq = sq;
              if (p.type === 'p' && !pSq) pSq = sq;
            }
          }
        }
        if (kSq && pSq) {
          botDeckManager.removeCard(card.instanceId);
          applyShadowSwap(kSq, pSq, true, card);
        }
        break;
      }

      case 'smoke_screen': {
        const smokeCenters = ['d4', 'e4', 'd5', 'e5', 'c4'];
        const chosen = smokeCenters[Math.floor(Math.random() * smokeCenters.length)];
        botDeckManager.removeCard(card.instanceId);
        applyCardEffect(card, chosen, true);
        break;
      }

      case 'reinforcements': {
        const ranks = botColor === 'b' ? [8, 7] : [1, 2];
        let spawnSq = null;
        for (const r of ranks) {
          for (let c = 0; c < 8; c++) {
            const sq = String.fromCharCode(97 + c) + r;
            if (!game.get(sq)) {
              spawnSq = sq;
              break;
            }
          }
          if (spawnSq) break;
        }
        if (spawnSq) {
          botDeckManager.removeCard(card.instanceId);
          applyCardEffect(card, spawnSq, true);
        }
        break;
      }

      case 'infantry_march': {
        const b = game.board();
        let pawnToMarch = null;
        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            const p = b[r][c];
            if (p && p.color === botColor && p.type === 'p') {
              const sq = String.fromCharCode(97 + c) + (8 - r);
              const forwardRank = botColor === 'w' ? (8 - r) + 1 : (8 - r) - 1;
              if (forwardRank >= 1 && forwardRank <= 8) {
                const fwdSq = String.fromCharCode(97 + c) + forwardRank;
                if (!game.get(fwdSq)) {
                  pawnToMarch = sq;
                  break;
                }
              }
            }
          }
          if (pawnToMarch) break;
        }
        if (pawnToMarch) {
          botDeckManager.removeCard(card.instanceId);
          applyCardEffect(card, pawnToMarch, true);
        }
        break;
      }

      case 'alchemist_gold': {
        botDeckManager.removeCard(card.instanceId);
        botDeckManager.drawCard();
        botDeckManager.drawCard();
        applyCardEffect(card, null, true);
        break;
      }

      default: {
        if (!card.requiresTarget) {
          botDeckManager.removeCard(card.instanceId);
          applyCardEffect(card, null, true);
        }
        break;
      }
    }
  }

  function handleLocalMove(moveResult) {
    totalMovesCount++;
    if (window.logger) {
      window.logger.move(myColor, moveResult, game.fen(), false);
    }
    updateGameUI(moveResult);

    // Check decree penalties on moved player
    checkDecreePenalties(moveResult, myColor);
    deckManager.tickTurn(myColor);

    // Draw card every 3 full turns (every 6 half-moves)
    if (gameVariant === 'cards' && totalMovesCount % 6 === 0) {
      triggerCardDraw();
      if (botDeckManager) {
        botDeckManager.drawCard();
      }
    }
    renderCardsHand();
    renderActiveDecrees();

    // Play move or capture sound
    if (moveResult.captured) {
      window.sounds.play('capture');
    } else if (moveResult.flags.includes('k') || moveResult.flags.includes('q')) {
      window.sounds.play('castle');
    } else {
      window.sounds.play('move');
    }

    if (game.in_check()) {
      window.sounds.play('check');
    }

    // Network transmission
    if (mode === 'online') {
      network.sendMove(moveResult.from, moveResult.to, moveResult.promotion, timerWhite, timerBlack, game.fen(), totalMovesCount);
    }

    // Check game over
    if (game.game_over()) {
      checkGameOver();
      return;
    }

    // Bot move trigger
    if (mode === 'bot' && game.turn() === opponentColor) {
      setTimeout(() => {
        if (gameVariant === 'cards') {
          botAttemptCardPlay();
        }

        const botMove = bot.getBestMove(game, botDifficulty, gameVariant === 'cards' ? deckManager : null);
        if (botMove) {
          const res = game.move(botMove);
          boardUI.lastMove = { from: res.from, to: res.to };
          boardUI.render();
          handleLocalMove(res);
        }
      }, 550);
    }
  }

  function handleRemoteMove(data) {
    totalMovesCount++;
    if (window.logger) {
      window.logger.move(opponentColor, { from: data.from, to: data.to, promotion: data.promotion }, data.fen, true);
    }
    let res = game.move({
      from: data.from,
      to: data.to,
      promotion: data.promotion || 'q'
    });

    // If move was rejected locally (desync recovery), recover using authoritative FEN
    if (!res && data.fen) {
      if (window.logger) {
        window.logger.warn('DESYNC', 'Локальный движок не нашел легальный ход, восстанавливаем состояние по FEN', {
          data,
          localFenBefore: game.fen(),
          targetFen: data.fen,
          turn: game.turn()
        });
      }
      console.warn('Remote move failed locally. Recovering state via FEN:', data);
      const loaded = game.load(data.fen);
      if (loaded) {
        res = {
          from: data.from,
          to: data.to,
          captured: false,
          flags: ''
        };
      }
    } else if (res && data.fen && game.fen() !== data.fen) {
      if (window.logger) {
        window.logger.info('DESYNC', 'Синхронизация микро-расхождений FEN с соперником', { targetFen: data.fen });
      }
      game.load(data.fen);
    }

    if (res) {
      boardUI.lastMove = { from: data.from, to: data.to };
      checkDecreePenalties(res, opponentColor);
      deckManager.tickTurn(opponentColor);

      if (gameVariant === 'cards' && totalMovesCount % 6 === 0) {
        triggerCardDraw();
      }
      renderCardsHand();
      renderActiveDecrees();
      boardUI.render();

      if (data.timeWhite !== undefined) timerWhite = data.timeWhite;
      if (data.timeBlack !== undefined) timerBlack = data.timeBlack;

      if (res.captured) {
        window.sounds.play('capture');
      } else if (res.flags && (res.flags.includes('k') || res.flags.includes('q'))) {
        window.sounds.play('castle');
      } else {
        window.sounds.play('move');
      }

      if (game.in_check()) {
        window.sounds.play('check');
      }

      updateGameUI(res);
      checkGameOver();
    } else {
      if (window.logger) {
        window.logger.error('DESYNC', 'КРИТИЧЕСКАЯ ОШИБКА: ход соперника полностью не удалось применить!', {
          data,
          currentFen: game.fen(),
          turn: game.turn()
        });
      }
      showToast('⚠️ Ошибка применения хода соперника! Лог записан (кнопка "Логи")', 6000);
      console.error('CRITICAL: Remote move completely failed to apply!', data);
    }
  }

  function updateGameUI(lastMoveObj) {
    updateTimerDisplay();
    updateMoveHistory(lastMoveObj);
    updateCapturedPieces();
  }

  function updateMoveHistory(lastMove) {
    if (!lastMove) return;
    const history = game.history({ verbose: true });
    moveHistoryEl.innerHTML = '';

    for (let i = 0; i < history.length; i += 2) {
      const moveNum = Math.floor(i / 2) + 1;
      const whiteMove = history[i] ? history[i].san : '';
      const blackMove = history[i + 1] ? history[i + 1].san : '';

      const row = document.createElement('div');
      row.className = 'history-row';
      row.innerHTML = `
        <span class="num">${moveNum}.</span>
        <span class="move white-move">${whiteMove}</span>
        <span class="move black-move">${blackMove}</span>
      `;
      moveHistoryEl.appendChild(row);
    }
    moveHistoryEl.scrollTop = moveHistoryEl.scrollHeight;
  }

  function updateCapturedPieces() {
    const counts = { p: 8, n: 2, b: 2, r: 2, q: 1 };
    const board = game.board();

    const currentPieces = { w: { p:0, n:0, b:0, r:0, q:0 }, b: { p:0, n:0, b:0, r:0, q:0 } };
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.type !== 'k') {
          currentPieces[piece.color][piece.type]++;
        }
      }
    }

    const capturedW = [];
    const capturedB = [];
    const pieceValues = { p: 1, n: 3, b: 3, r: 5, q: 9 };
    let scoreW = 0, scoreB = 0;

    ['q', 'r', 'b', 'n', 'p'].forEach(type => {
      const lostW = counts[type] - currentPieces.w[type];
      for (let i = 0; i < lostW; i++) {
        capturedW.push(type);
        scoreB += pieceValues[type];
      }
      const lostB = counts[type] - currentPieces.b[type];
      for (let i = 0; i < lostB; i++) {
        capturedB.push(type);
        scoreW += pieceValues[type];
      }
    });

    const renderPieceIcons = (container, pieces, color) => {
      container.innerHTML = pieces.map(type => `<span class="captured-icon">${getPieceSvg(type, color)}</span>`).join('');
    };

    if (myColor === 'w') {
      renderPieceIcons(capturedTopEl, capturedW, 'w');
      renderPieceIcons(capturedBottomEl, capturedB, 'b');
    } else {
      renderPieceIcons(capturedTopEl, capturedB, 'b');
      renderPieceIcons(capturedBottomEl, capturedW, 'w');
    }

    const diff = scoreW - scoreB;
    if (diff === 0) {
      materialAdvantageEl.textContent = '';
    } else {
      const advColor = diff > 0 ? '+' : '';
      materialAdvantageEl.textContent = `${advColor}${diff}`;
    }
  }

  function checkGameOver() {
    if (gameEnded) return;
    let isCheckmate = game.in_checkmate();
    let isStalemate = game.in_stalemate();

    if (gameVariant === 'cards') {
      const defendingColor = game.turn();
      const currentDeck = (mode === 'bot' && defendingColor === opponentColor) ? botDeckManager : deckManager;

      // In cards mode, if threatened with mate, give player with cards a chance to cast a spell!
      if (isCheckmate) {
        if (defendingColor === myColor && currentDeck && currentDeck.hand && currentDeck.hand.length > 0) {
          showToast('⚠️ ВАМ УГРОЖАЕТ МАТ! Используйте карту из руки (например, заморозьте фигуру), чтобы спастись!', 6000);
          return;
        }
        if (mode === 'online' && defendingColor === opponentColor) {
          showToast('⚠️ Сопернику угрожает мат. Ожидание хода или применения заклинания...', 3500);
          return;
        }
      }

      if (!isCheckmate && !isStalemate) {
        const allMoves = game.moves({ verbose: true });
        if (allMoves.length > 0) {
          const playable = allMoves.filter(m => !deckManager.isPieceFrozen(m.from));
          if (playable.length === 0) {
            if (game.in_check()) {
              if (defendingColor === myColor && currentDeck && currentDeck.hand && currentDeck.hand.length > 0) {
                showToast('⚠️ Все ходы заблокированы льдом! Сыграйте карту, чтобы спастись!', 6000);
                return;
              }
              isCheckmate = true;
            } else {
              isStalemate = true;
            }
          }
        }
      }
    }

    if (isCheckmate) {
      const winner = game.turn() === 'w' ? 'Чёрные' : 'Белые';
      endGame('Шах и мат!', `Победили: ${winner}`);
    } else if (isStalemate) {
      endGame('Ничья!', 'Пат — нет ходов.');
    } else if (game.in_threefold_repetition()) {
      endGame('Ничья!', 'Троекратное повторение ходов.');
    } else if (game.insufficient_material()) {
      endGame('Ничья!', 'Недостаточно материала для мата.');
    } else if (game.in_draw()) {
      endGame('Ничья!', 'Правило 50 ходов.');
    }
  }

  function endGame(title, desc) {
    gameEnded = true;
    stopTimer();
    window.sounds.play('gameover');
    gameOverTitle.textContent = title;
    gameOverDesc.textContent = desc;
    modalGameOver.classList.remove('hidden');

    if (window.logger) {
      window.logger.info('GAME', `Партия завершена: ${title} (${desc})`, {
        turn: game.turn(),
        inCheck: game.in_check(),
        inCheckmate: game.in_checkmate(),
        fen: game.fen(),
        totalMoves: totalMovesCount
      });
    }
  }

  function startNewGame(config) {
    game.reset();
    gameEnded = false;
    if (game && typeof game.set_freeze_fn === 'function') {
      game.set_freeze_fn((sq) => (gameVariant === 'cards' && deckManager) ? deckManager.isPieceFrozen(sq) : false);
    }
    modalGameOver.classList.add('hidden');
    moveHistoryEl.innerHTML = '';
    chatMessagesEl.innerHTML = '';

    gameVariant = config.variant || gameVariantSelect.value;
    deckManager.reset();
    totalMovesCount = 0;
    cancelTargeting();

    timeInitial = config.time || 600;
    timerWhite = timeInitial;
    timerBlack = timeInitial;

    myColor = config.myColor || 'w';
    opponentColor = myColor === 'w' ? 'b' : 'w';

    if (window.logger) {
      window.logger.info('GAME', `Старт партии: Вы играете за [${myColor === 'w' ? 'Белые' : 'Чёрные'}], режим: ${mode}`, {
        config,
        time: timeInitial,
        variant: gameVariant
      });
    }

    nameBottomEl.textContent = `${myName} (${myColor === 'w' ? 'Белые' : 'Чёрные'})`;
    nameTopEl.textContent = `${opponentName} (${opponentColor === 'w' ? 'Белые' : 'Чёрные'})`;

    if (!boardUI) {
      initBoard();
    } else {
      boardUI.setOrientation(myColor);
      boardUI.deckManager = gameVariant === 'cards' ? deckManager : null;
      boardUI.options.deckManager = boardUI.deckManager;
      boardUI.options.playerColor = (mode === 'online' || mode === 'bot') ? myColor : null;
      boardUI.setGame(game);
    }

    if (gameVariant === 'cards') {
      // Deal 2 starting cards
      deckManager.drawCard();
      deckManager.drawCard();
      if (mode === 'bot') {
        botDeckManager = new CardDeckManager();
        botDeckManager.drawCard();
        botDeckManager.drawCard();
      } else {
        botDeckManager = null;
      }
      renderCardsHand();
      renderActiveDecrees();
    } else {
      botDeckManager = null;
      cardsHandSection.classList.add('hidden');
      activeDecreesContainer.classList.add('hidden');
    }

    updateTimerDisplay();
    updateCapturedPieces();
    switchScreen(screenGame);
    startTimer();
  }

  // --- Online Multiplayer Setup ---
  btnCreateOnline.addEventListener('click', async () => {
    mode = 'online';
    const chosenSide = selectColor.value; // 'w', 'b', 'random'
    let hostSide = chosenSide;
    if (hostSide === 'random') {
      hostSide = Math.random() < 0.5 ? 'w' : 'b';
    }
    const guestSide = hostSide === 'w' ? 'b' : 'w';
    const timeVal = parseInt(selectTimeControl.value, 10);
    const chosenVariant = gameVariantSelect.value;

    const roomCode = network.generateRoomCode();
    const config = {
      time: timeVal,
      variant: chosenVariant,
      hostSide: hostSide,
      guestSide: guestSide
    };
    pendingOnlineConfig = config;

    displayRoomCode.textContent = roomCode;
    const shareUrl = `${window.location.origin}${window.location.pathname}#${roomCode}`;
    displayRoomLink.value = shareUrl;

    switchScreen(screenWaiting);

    try {
      await network.createRoom(roomCode, config);
      showToast(`Комната создана! Код: ${roomCode}`);
    } catch (err) {
      showToast('Ошибка создания комнаты. Попробуйте еще раз.');
      switchScreen(screenLobby);
    }
  });

  btnJoinOnline.addEventListener('click', async () => {
    const code = inputJoinCode.value.trim().toUpperCase();
    if (!code) {
      showToast('Введите 6-значный код комнаты!');
      return;
    }
    joinOnlineRoom(code);
  });

  async function joinOnlineRoom(code) {
    mode = 'online';
    showToast(`Подключение к комнате ${code}...`);
    try {
      await network.joinRoom(code);
    } catch (err) {
      showToast('Не удалось подключиться к комнате. Проверьте код.');
    }
  }

  btnCopyLink.addEventListener('click', () => {
    displayRoomLink.select();
    navigator.clipboard.writeText(displayRoomLink.value).then(() => {
      showToast('Ссылка скопирована в буфер обмена!');
    }).catch(() => {
      document.execCommand('copy');
      showToast('Ссылка скопирована!');
    });
  });

  btnCancelWait.addEventListener('click', () => {
    network.cleanup();
    switchScreen(screenLobby);
  });

  // Network Events
  network.on('connected', (info) => {
    window.sounds.play('notify');
    showToast('Соперник подключился!');
    if (window.logger) {
      window.logger.info('NETWORK', 'Соперник подключился (event connected)', info);
    }
    if (!info.isHost) {
      // Guest waiting for host init packet
    } else {
      // Host starts game using deterministic config
      const chosenSide = pendingOnlineConfig ? pendingOnlineConfig.hostSide : (selectColor.value === 'random' ? 'w' : selectColor.value);
      const chosenVariant = pendingOnlineConfig ? pendingOnlineConfig.variant : gameVariantSelect.value;
      const timeVal = pendingOnlineConfig ? pendingOnlineConfig.time : parseInt(selectTimeControl.value, 10);

      const gameConfig = {
        time: timeVal,
        variant: chosenVariant,
        myColor: chosenSide
      };
      startNewGame(gameConfig);
    }
  });

  network.on('init', (config) => {
    // Guest receives init packet from host
    if (window.logger) {
      window.logger.info('NETWORK', 'Гость получил init конфигурацию', config);
    }
    startNewGame({
      time: config.time,
      variant: config.variant,
      myColor: config.guestSide
    });
  });

  network.on('cardPlay', (data) => {
    if (data.action === 'shadow_swap' && data.extraData) {
      applyShadowSwap(data.extraData.knightSq, data.extraData.pawnSq, true, data.card);
    } else {
      applyCardEffect(data.card, data.targetSquare, true);
    }
    if (data.fen && game.fen() !== data.fen) {
      console.warn('Syncing board FEN with remote card state:', data.fen);
      game.load(data.fen);
      if (boardUI) boardUI.render();
    }
  });

  network.on('move', (data) => {
    handleRemoteMove(data);
  });

  network.on('chat', (data) => {
    window.sounds.play('notify');
    appendChatMessage(data.sender, data.text);
  });

  network.on('drawOffer', () => {
    window.sounds.play('notify');
    if (confirm('Соперник предлагает ничью. Согласиться?')) {
      network.sendDrawAccept();
      endGame('Ничья!', 'Игроки согласились на ничью.');
    } else {
      network.sendDrawDecline();
    }
  });

  network.on('drawAccept', () => {
    endGame('Ничья!', 'Соперник принял предложение о ничьей.');
  });

  network.on('drawDecline', () => {
    showToast('Соперник отклонил предложение о ничьей.');
  });

  network.on('resign', () => {
    endGame('Победа!', 'Соперник сдался.');
  });

  network.on('rematchOffer', () => {
    if (confirm('Соперник предлагает реванш! Сыграть снова?')) {
      const newColor = myColor === 'w' ? 'b' : 'w';
      network.sendRematchAccept({ time: timeInitial, hostSide: newColor, guestSide: myColor });
      startNewGame({ time: timeInitial, myColor: newColor });
    }
  });

  network.on('rematchAccept', (data) => {
    const newColor = myColor === 'w' ? 'b' : 'w';
    startNewGame({ time: timeInitial, myColor: newColor });
  });

  network.on('disconnected', () => {
    if (window.logger) {
      window.logger.warn('NETWORK', 'Событие network.disconnected: соединение разорвано', { mode, gameEnded });
    }
    if (mode === 'online' && !gameEnded && !game.game_over()) {
      endGame('Победа!', 'Соперник отключился от игры. Вам автоматически засчитана техническая победа!');
    } else {
      showToast('Соперник отключился.');
    }
  });

  network.on('error', (err) => {
    if (window.logger) {
      window.logger.error('NETWORK', `Сетевая ошибка PeerJS/WebRTC: ${err.type || err.message || err}`, err);
    }
    showToast(`⚠️ Ошибка сети: ${err.type || 'Сбой соединения'}. Лог сохранён (кнопка "Логи")`, 5000);
  });

  // --- Single Player vs Bot ---
  btnPlayBot.addEventListener('click', () => {
    mode = 'bot';
    botDifficulty = selectBotLevel.value;
    opponentName = `Бот (${botDifficulty.toUpperCase()})`;
    const timeVal = parseInt(selectTimeControl.value, 10);

    let side = selectColor.value;
    if (side === 'random') side = Math.random() < 0.5 ? 'w' : 'b';

    startNewGame({
      time: timeVal,
      variant: gameVariantSelect.value,
      myColor: side
    });

    if (side === 'b') {
      setTimeout(() => {
        if (gameVariant === 'cards') {
          botAttemptCardPlay();
        }
        const botMove = bot.getBestMove(game, botDifficulty, gameVariant === 'cards' ? deckManager : null);
        if (botMove) {
          const res = game.move(botMove);
          boardUI.lastMove = { from: res.from, to: res.to };
          boardUI.render();
          handleLocalMove(res);
        }
      }, 500);
    }
  });

  // --- Pass & Play Mode ---
  btnPassPlay.addEventListener('click', () => {
    mode = 'pass';
    myName = 'Игрок 1';
    opponentName = 'Игрок 2';
    const timeVal = parseInt(selectTimeControl.value, 10);

    startNewGame({
      time: timeVal,
      variant: gameVariantSelect.value,
      myColor: 'w'
    });
  });

  // --- Game Controls & Menu Handlers ---
  function handleResign() {
    toggleGameMenu(true);
    if (game.game_over()) return;
    if (confirm('Вы уверены, что хотите сдаться?')) {
      if (mode === 'online') network.sendResign(myColor);
      endGame('Поражение', 'Вы сдались.');
    }
  }

  function handleOfferDraw() {
    toggleGameMenu(true);
    if (mode === 'online') {
      network.sendDrawOffer();
      showToast('Предложение ничьей отправлено сопернику...');
    } else {
      endGame('Ничья!', 'По согласию сторон.');
    }
  }

  function handleFlipBoard() {
    toggleGameMenu(true);
    if (boardUI) boardUI.flip();
  }

  function handleToggleSound() {
    toggleGameMenu(true);
    const isMuted = window.sounds.toggleMute();
    btnToggleMute.innerHTML = isMuted ? '🔇' : '🔊';
    if (menuItemSound) {
      menuItemSound.innerHTML = isMuted ? '🔇 Звук: Выкл' : '🔊 Звук: Вкл';
    }
    showToast(isMuted ? 'Звук выключен' : 'Звук включен');
  }

  function handleLeaveGame() {
    toggleGameMenu(true);
    if (confirm('Покинуть игру и вернуться в главное меню?')) {
      if (mode === 'online' && !gameEnded && network.isConnected()) {
        network.sendResign(myColor);
      }
      stopTimer();
      network.cleanup();
      switchScreen(screenLobby);
    }
  }

  // Sidebar Controls
  if (btnResign) btnResign.addEventListener('click', handleResign);
  if (btnOfferDraw) btnOfferDraw.addEventListener('click', handleOfferDraw);
  if (btnFlipBoard) btnFlipBoard.addEventListener('click', handleFlipBoard);
  if (btnLeaveGame) btnLeaveGame.addEventListener('click', handleLeaveGame);
  if (btnToggleMute) btnToggleMute.addEventListener('click', handleToggleSound);

  // Top HUD Dropdown Menu Items
  if (btnGameMenuToggle) {
    btnGameMenuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleGameMenu();
    });
  }
  if (menuItemResign) menuItemResign.addEventListener('click', handleResign);
  if (menuItemDraw) menuItemDraw.addEventListener('click', handleOfferDraw);
  if (menuItemFlip) menuItemFlip.addEventListener('click', handleFlipBoard);
  if (menuItemSound) menuItemSound.addEventListener('click', handleToggleSound);
  if (menuItemLeave) menuItemLeave.addEventListener('click', handleLeaveGame);
  if (menuItemLogs) {
    menuItemLogs.addEventListener('click', () => {
      toggleGameMenu(true);
      btnOpenLogs.click();
    });
  }

  // Cards Inventory Trigger & Modal Controls
  if (btnOpenCardsInv) {
    btnOpenCardsInv.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleCardsInventory();
    });
  }
  if (btnCloseInventory) {
    btnCloseInventory.addEventListener('click', closeCardsInventory);
  }
  if (inventoryBackdrop) {
    inventoryBackdrop.addEventListener('click', closeCardsInventory);
  }

  // Global document click to close HUD menu
  document.addEventListener('click', (e) => {
    if (gameMenuDropdown && !gameMenuDropdown.classList.contains('hidden')) {
      if (!e.target.closest('.hud-menu-wrapper')) {
        toggleGameMenu(true);
      }
    }
  });

  // Global Escape key handler
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeCardsInventory();
      toggleGameMenu(true);
      if (pendingCard) cancelTargeting();
    }
  });

  btnRematch.addEventListener('click', () => {
    if (mode === 'online') {
      network.sendRematchOffer();
      showToast('Предложение реванша отправлено...');
    } else {
      const newColor = myColor === 'w' ? 'b' : 'w';
      startNewGame({ time: timeInitial, myColor: newColor });
    }
  });

  btnReturnLobby.addEventListener('click', () => {
    modalGameOver.classList.add('hidden');
    stopTimer();
    network.cleanup();
    switchScreen(screenLobby);
  });

  // --- Chat & Reactions ---
  function appendChatMessage(sender, text) {
    const msg = document.createElement('div');
    msg.className = `chat-msg ${sender === 'Вы' ? 'self' : 'other'}`;
    msg.innerHTML = `<strong>${sender}:</strong> <span>${text}</span>`;
    chatMessagesEl.appendChild(msg);
    chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
  }

  function sendChatMessage(text) {
    if (!text.trim()) return;
    appendChatMessage('Вы', text);
    if (mode === 'online') {
      network.sendChat(text, 'Соперник');
    }
    chatInput.value = '';
  }

  btnSendChat.addEventListener('click', () => sendChatMessage(chatInput.value));
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendChatMessage(chatInput.value);
  });

  emojiBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const emoji = btn.dataset.emoji || btn.textContent;
      sendChatMessage(emoji);
    });
  });

  // Auto-join from URL hash (e.g. #ABC123 or ?room=ABC123)
  const hash = window.location.hash ? window.location.hash.substring(1).trim().toUpperCase() : '';
  const urlParams = new URLSearchParams(window.location.search);
  const roomParam = urlParams.get('room') ? urlParams.get('room').trim().toUpperCase() : '';
  const initialRoom = hash || roomParam;

  // Dismiss decree tooltips on click outside
  document.addEventListener('click', () => {
    document.querySelectorAll('.decree-badge.active-tooltip').forEach(b => b.classList.remove('active-tooltip'));
  });

  if (initialRoom && initialRoom.length >= 4) {
    inputJoinCode.value = initialRoom;
    joinOnlineRoom(initialRoom);
  }

  if (urlParams.get('test_bot')) {
    setTimeout(() => {
      btnPlayBot.click();
      if (deckManager) {
        deckManager.drawCard();
        deckManager.drawCard();
        deckManager.drawCard();
        renderCardsHand();
      }
    }, 150);
  } else if (urlParams.get('test_inv')) {
    setTimeout(() => {
      btnPlayBot.click();
      if (deckManager) {
        deckManager.drawCard();
        deckManager.drawCard();
        deckManager.drawCard();
        renderCardsHand();
      }
      setTimeout(() => {
        openCardsInventory();
      }, 300);
    }, 150);
  } else if (urlParams.get('test_menu')) {
    setTimeout(() => {
      btnPlayBot.click();
      setTimeout(() => {
        toggleGameMenu();
      }, 300);
    }, 150);
  }
});
