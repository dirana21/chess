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

  // Active Effects HUD & Modal Elements
  const btnOpenEffectsModal = document.getElementById('btn-open-effects-modal');
  const hudEffectsBadge = document.getElementById('hud-effects-badge');
  const activeEffectsTicker = document.getElementById('active-effects-ticker');
  const sidebarEffectsCount = document.getElementById('sidebar-effects-count');
  const effectDetailsModal = document.getElementById('effect-details-modal');
  const effectModalBackdrop = document.getElementById('effect-modal-backdrop');
  const btnCloseEffectModal = document.getElementById('btn-close-effect-modal');
  const btnEffectModalOk = document.getElementById('btn-effect-modal-ok');
  const effectModalTabs = document.getElementById('effect-modal-tabs');
  const effectModalDialog = document.querySelector('.effect-modal-dialog');
  const effectModalIcon = document.getElementById('effect-modal-icon');
  const effectModalBadge = document.getElementById('effect-modal-badge');
  const effectModalTitle = document.getElementById('effect-modal-title');
  const effectModalTurns = document.getElementById('effect-modal-turns');
  const effectModalTarget = document.getElementById('effect-modal-target');
  const effectModalTrigger = document.getElementById('effect-modal-trigger');
  const effectModalPenalty = document.getElementById('effect-modal-penalty');
  const effectModalAdvice = document.getElementById('effect-modal-advice');

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

  // Rules & Spell Book Elements
  const btnOpenRulesHeader = document.getElementById('btn-open-rules-header');
  const btnOpenRulesLobby = document.getElementById('btn-open-rules-lobby');
  const menuItemRules = document.getElementById('menu-item-rules');
  const btnOpenRulesInv = document.getElementById('btn-open-rules-inv');
  const modalRules = document.getElementById('modal-rules');
  const btnCloseRules = document.getElementById('btn-close-rules');
  const btnCloseRulesOk = document.getElementById('btn-close-rules-ok');
  const rulesTabBtns = document.querySelectorAll('.rules-tab-btn');
  const rulesTabContents = document.querySelectorAll('.rules-tab-content');

  function openRulesModal(tabName = 'cards-guide') {
    if (!modalRules) return;
    switchRulesTab(tabName);
    modalRules.classList.remove('hidden');
  }

  function closeRulesModal() {
    if (!modalRules) return;
    modalRules.classList.add('hidden');
  }

  function switchRulesTab(tabId) {
    if (rulesTabBtns) {
      rulesTabBtns.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
      });
    }
    if (rulesTabContents) {
      rulesTabContents.forEach(content => {
        const isTarget = content.id === `tab-${tabId}`;
        content.classList.toggle('hidden', !isTarget);
        content.classList.toggle('active', isTarget);
      });
    }
  }

  let showcaseTimeout = null;

  function getCardPerspectiveDescription(card, isViewerCaster, targetSquare = null) {
    if (!card) return '';
    if (isViewerCaster) return card.description;

    const sq = targetSquare ? targetSquare.toUpperCase() : '';
    switch (card.id) {
      case 'curse_knight':
        return 'Если вы походите своим Конём в течение 2 ходов — ваш конь застынет во льду на 1 ход!';
      case 'curse_rook':
        return 'Если вы походите своей Ладьёй в течение 2 ходов — соперник получит +1 бонусную карту!';
      case 'curse_bishop':
        return 'Ваши Слоны ослеплены на 2 хода: они могут перемещаться, но не могут брать фигуры соперника!';
      case 'forbidden_square':
        return sq
          ? `Клетка ${sq} заминирована: если ваша фигура наступит на неё, она застынет во льду на 1 ход!`
          : 'Клетка доски заминирована: если ваша фигура наступит на неё, она застынет во льду на 1 ход!';
      case 'queen_burden':
        return 'Ваш Ферзь перегружен на 2 хода: вы можете ходить ферзём максимум на 2 клетки!';
      case 'tax_castle':
        return 'Если вы совершите рокировку — ваш Король застынет во льду на 1 ход!';
      case 'blood_tribute':
        return 'Если вы срубите фигуру соперника — ваша атаковавшая фигура застынет во льду на 1 ход!';
      case 'freeze_piece':
        return sq
          ? `Ваша фигура на клетке ${sq} заморожена во льду на 1 ход и не может двигаться!`
          : 'Ваша фигура заморожена во льду на 1 ход и не может двигаться!';
      case 'divine_storm':
        return 'Все ваши Кони и Слоны оглушены небесным громом на 1 ход и не могут ходить!';
      case 'smoke_screen':
        return 'В указанной области 2х2 клетки на 1 ход запрещены любые взятия фигур!';
      case 'kings_shield':
        return 'Король соперника получил ауру стойкости: он неуязвим к шахам от ваших коней и пешек на 2 хода!';
      case 'time_warp':
        return 'У вас отнято 15 секунд на таймере, а соперник получил +45 секунд!';
      case 'reinforcements':
        return sq
          ? `Соперник возродил пешку на клетке ${sq}!`
          : 'Соперник возродил потерянную пешку!';
      case 'infantry_march':
        return 'Пешка соперника мгновенно шагнула вперёд на 1 клетку без траты хода!';
      case 'shadow_swap':
        return 'Соперник поменял местами своего Коня и свою Пешку на доске!';
      case 'alchemist_gold':
        return 'Соперник сбросил карту и получил 2 новые случайные карты в руку!';
      default:
        return card.description;
    }
  }

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
      showcaseDesc.textContent = card.description;
    } else {
      showcaseBanner.className = 'showcase-banner caster-enemy';
      showcaseCasterIcon.textContent = '⚔️';
      showcaseCasterTitle.textContent = 'СОПЕРНИК СЫГРАЛ КАРТУ:';
      showcaseDesc.textContent = getCardPerspectiveDescription(card, false, targetText);
    }

    showcaseType.textContent = card.type === 'decree' ? 'УКАЗ / ПРОКЛЯТИЕ' : 'ЗАКЛИНАНИЕ';
    showcaseIcon.textContent = card.icon;
    showcaseName.textContent = card.name;

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
    if (btnOpenCardsInv) {
      btnOpenCardsInv.classList.toggle('has-playable-cards', handLen > 0 && game && game.turn() === myColor);
    }
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

  function getPieceTypeName(code) {
    switch (code) {
      case 'p': return 'Пешки ♟️';
      case 'n': return 'Кони 🐎';
      case 'b': return 'Слоны ⛪';
      case 'r': return 'Ладьи 🏰';
      case 'q': return 'Ферзь 👑';
      case 'k': return 'Король 🛡️';
      default: return 'Фигура';
    }
  }

  function getDecreeDetailsForPerspective(d, isEnemy) {
    switch (d.id) {
      case 'curse_knight':
        return {
          target: isEnemy ? 'Ваши Кони 🐎' : 'Кони соперника 🐎',
          trigger: isEnemy ? 'Если ВЫ сделаете ход своим Конём' : 'Ход вражеским Конём',
          penalty: isEnemy ? 'Ваш Конь застынет во льду на 1 ход ❄️' : 'Конь соперника застынет во льду на 1 ход ❄️',
          shortDesc: isEnemy ? 'Если походите Конём ➔ ваш конь замёрзнет на 1 ход' : 'Ход конём врага ➔ конь замёрзнет на 1 ход',
          advice: isEnemy 
            ? 'Внимание! Если вы походите своим конём в течение следующих 2 ходов, он мгновенно застынет во льду и пропустит ход. Ходите пешками, слонами, ладьями или ферзём!' 
            : 'Этот указ наложен вами на соперника. Если он рискнёт походить конём, его конь замёрзнет!'
        };
      case 'curse_rook':
        return {
          target: isEnemy ? 'Ваши Ладьи 🏰' : 'Ладьи соперника 🏰',
          trigger: isEnemy ? 'Если ВЫ сделаете ход своей Ладьёй' : 'Ход вражеской Ладьёй',
          penalty: isEnemy ? 'Соперник получит +1 бонусную карту из колоды 🎁' : 'Вы берёте +1 бонусную карту из колоды 🎁',
          shortDesc: isEnemy ? 'Если походите Ладьёй ➔ соперник получит +1 карту' : 'Ход ладьёй врага ➔ вы получаете +1 карту',
          advice: isEnemy 
            ? 'Постарайтесь воздержаться от ходов ладьями следующие 2 хода, иначе соперник бесплатно получит новое заклинание!' 
            : 'Если соперник сдвинет ладью с места, вы мгновенно получите новую случайную карту.'
        };
      case 'curse_bishop':
        return {
          target: isEnemy ? 'Ваши Слоны ⛪' : 'Слоны соперника ⛪',
          trigger: isEnemy ? 'Любая попытка взятия фигуры вашим Слоном' : 'Попытка взятия Слоном соперника',
          penalty: isEnemy ? 'Запрет на взятия: ваши слоны ослеплены и не могут рубить' : 'Слоны соперника ослеплены и не могут рубить ваши фигуры',
          shortDesc: isEnemy ? 'Ваши Слоны ослеплены ➔ запрещены любые взятия фигур' : 'Слоны врага ослеплены ➔ не могут рубить фигуры',
          advice: isEnemy 
            ? 'Ваши слоны временно обезоружены: они могут ходить по диагоналям, но не могут брать фигуры. Для взятий используйте другие фигуры!' 
            : 'Слоны соперника ослеплены вашим указом и не могут угрожать вашим фигурам взятиями.'
        };
      case 'queen_burden':
        return {
          target: isEnemy ? 'Ваш Ферзь 👑' : 'Ферзь соперника 👑',
          trigger: isEnemy ? 'Попытка пойти Ферзём дальше чем на 2 клетки' : 'Ход Ферзём соперника дальше 2 клеток',
          penalty: isEnemy ? 'Ход блокируется: дальность ферзя урезана до 2 клеток' : 'Дальность ферзя соперника ограничена максимум 2 клетками',
          shortDesc: isEnemy ? 'Ваш Ферзь перегружен ➔ ходит максимум на 2 клетки' : 'Ферзь врага замедлен ➔ ходит максимум на 2 клетки',
          advice: isEnemy 
            ? 'Тяжесть короны сковала вашего ферзя: он не может совершать дальние ходы через всю доску. Планируйте маневры на 1-2 клетки.' 
            : 'Ферзь противника перегружен и не может совершать резкие дальнобойные выпады.'
        };
      case 'tax_castle':
        return {
          target: isEnemy ? 'Ваша Рокировка 🛡️' : 'Рокировка соперника 🛡️',
          trigger: isEnemy ? 'Если ВЫ совершите любую рокировку' : 'Любая рокировка соперника',
          penalty: isEnemy ? 'Ваш Король застынет во льду на 1 ход ❄️' : 'Король соперника застынет во льду на 1 ход ❄️',
          shortDesc: isEnemy ? 'Если сделаете рокировку ➔ ваш Король замёрзнет на 1 ход' : 'Если враг рокируется ➔ его Король замёрзнет на 1 ход',
          advice: isEnemy 
            ? 'Не делайте рокировку сейчас! Если вы рокируетесь, ваш король мгновенно покроется льдом и станет лёгкой мишенью для атаки соперника.' 
            : 'Если соперник попытается увести короля в рокировку, он сам запрет его во льду.'
        };
      case 'blood_tribute':
        return {
          target: isEnemy ? 'Любые ваши взятия фигур ⚔️' : 'Любые взятия ваших фигур ⚔️',
          trigger: isEnemy ? 'Если ВЫ срубите любую фигуру соперника' : 'Соперник сбивает вашу фигуру',
          penalty: isEnemy ? 'Ваша атаковавшая фигура застынет во льду на 1 ход ❄️' : 'Атаковавшая фигура соперника застынет во льду на 1 ход ❄️',
          shortDesc: isEnemy ? 'Если срубите фигуру врага ➔ ваша фигура замёрзнет на 1 ход' : 'Враг рубит вашу фигуру ➔ его фигура замёрзнет на 1 ход',
          advice: isEnemy 
            ? 'Осторожно! Если вы возьмёте фигуру соперника, нападавшая фигура покроется льдом. Рубите только в крайнем случае или ради мата!' 
            : 'Соперник заплатит заморозкой за каждую взятую вашу фигуру. Отличная защита ваших позиций!'
        };
      case 'forbidden_square':
        return {
          target: isEnemy ? 'Проклятая клетка ☠️' : 'Заминированная клетка ☠️',
          trigger: isEnemy ? 'Если ваша фигура наступит на проклятую клетку' : 'Вражеская фигура наступает на клетку',
          penalty: isEnemy ? 'Ваша фигура застынет во льду на 1 ход ❄️' : 'Фигура соперника застынет во льду на 1 ход ❄️',
          shortDesc: isEnemy ? 'Если наступите на метку ➔ ваша фигура замёрзнет' : 'Враг наступает на метку ➔ замёрзнет на 1 ход',
          advice: isEnemy ? 'Не ставьте свои фигуры на эту клетку, иначе они замёрзнут!' : 'Клетка заминирована вами. Противник замёрзнет, если рискнёт наступить.'
        };
      default:
        return {
          target: isEnemy ? 'Ваши фигуры' : 'Фигуры соперника',
          trigger: isEnemy ? 'Если вы нарушите условие проклятия' : (d.card.trigger || d.card.description),
          penalty: d.card.penalty || 'Штрафной эффект',
          shortDesc: isEnemy ? `Штраф за нарушение: ${d.card.penalty || ''}` : `${d.card.trigger || ''} ➔ ${d.card.penalty || ''}`,
          advice: isEnemy ? 'Внимательно следите за правилами этого проклятия!' : 'Этот указ наложен вами.'
        };
    }
  }

  function getAllActiveEffects() {
    if (!deckManager || gameVariant !== 'cards') return [];
    const list = [];

    // 1. Decrees & Curses (Perspective-Tailored)
    if (deckManager.activeDecrees && deckManager.activeDecrees.length > 0) {
      deckManager.activeDecrees.forEach(d => {
        const isEnemy = d.owner !== myColor;
        const details = getDecreeDetailsForPerspective(d, isEnemy);
        const stateBadge = d.state === 'APPLIED' ? '✨ Только наложен' : (d.state === 'TICKING' ? '⏳ Тикает' : '🟢 Есть эффект');

        list.push({
          id: 'decree_' + (d.instanceId || d.id),
          name: d.name,
          icon: d.icon || '⚡',
          category: isEnemy ? 'enemy_decree' : 'my_decree',
          badgeText: isEnemy ? '⚠️ ВРАЖЕСКОЕ ПРОКЛЯТИЕ' : '🛡️ ВАШ УКАЗ',
          owner: d.owner,
          turns: d.duration,
          state: d.state || 'ACTIVE',
          stateBadge: stateBadge,
          target: details.target,
          trigger: details.trigger,
          penalty: details.penalty,
          shortDesc: details.shortDesc,
          advice: details.advice
        });
      });
    }

    // 2. Frozen Pieces (Perspective-Tailored)
    if (deckManager.frozenPieces) {
      for (const sq in deckManager.frozenPieces) {
        const fp = deckManager.frozenPieces[sq];
        const pieceOnSq = boardUI ? boardUI.getPieceAt(sq) : null;
        const isMyPiece = pieceOnSq ? pieceOnSq.color === myColor : fp.color === myColor;
        const pieceColorName = fp.color === 'w' ? 'Белая' : 'Чёрная';
        const pName = pieceOnSq ? getPieceTypeName(pieceOnSq.type) : 'Фигура';
        const stateBadge = fp.state === 'APPLIED' ? '✨ Только наложен' : (fp.state === 'TICKING' ? '⏳ Тикает' : '🟢 Есть эффект');

        list.push({
          id: 'frozen_' + sq,
          name: `Ледяная Окова (${sq.toUpperCase()})`,
          icon: '❄️',
          category: isMyPiece ? 'my_frozen' : 'enemy_frozen',
          badgeText: isMyPiece ? '❄️ ВАША ФИГУРА ЗАМОРОЖЕНА' : '❄️ ФИГУРА ВРАГА ЗАМОРОЖЕНА',
          owner: fp.color,
          turns: fp.turns,
          state: fp.state || 'ACTIVE',
          stateBadge: stateBadge,
          target: isMyPiece ? `Ваш(а) ${pName} на клетке ${sq.toUpperCase()}` : `Вражеский ${pName} на клетке ${sq.toUpperCase()}`,
          trigger: isMyPiece ? 'Любая попытка совершить ход этой фигурой' : 'Попытка соперника сделать ход этой фигурой',
          penalty: isMyPiece ? 'Ваша фигура скована магическим льдом и не может перемещаться или рубить' : 'Фигура соперника скована магическим льдом и не может ходить',
          shortDesc: isMyPiece ? `Ваша фигура парализована льдом на ${fp.turns} ход(а)` : `Фигура соперника парализована льдом на ${fp.turns} ход(а)`,
          advice: isMyPiece
            ? `Фигура полностью обездвижена ещё ${fp.turns} ход(а). Прикрывайте её соседними фигурами до оттаивания!`
            : `Фигура соперника выведена из строя на ${fp.turns} ход(а). Используйте этот момент для прорыва!`
        });
      }
    }

    // 3. Forbidden Squares (Black Mark / Traps)
    if (deckManager.forbiddenSquares) {
      for (const sq in deckManager.forbiddenSquares) {
        const fs = deckManager.forbiddenSquares[sq];
        const isMyTrap = fs.byPlayer === myColor;
        const stateBadge = fs.state === 'APPLIED' ? '✨ Только наложен' : (fs.state === 'TICKING' ? '⏳ Тикает' : '🟢 Есть эффект');

        list.push({
          id: 'trap_' + sq,
          name: `Чёрная Метка (${sq.toUpperCase()})`,
          icon: '☠️',
          category: isMyTrap ? 'my_trap' : 'enemy_trap',
          badgeText: isMyTrap ? '☠️ ВАША ЛОВУШКА' : '⚠️ ВРАЖЕСКАЯ ЛОВУШКА',
          owner: fs.byPlayer,
          turns: fs.turns,
          state: fs.state || 'ACTIVE',
          stateBadge: stateBadge,
          target: isMyTrap ? `Клетка ${sq.toUpperCase()} (заминирована вами)` : `Проклятая клетка ${sq.toUpperCase()} (ловушка соперника)`,
          trigger: isMyTrap ? `Фигура соперника наступает на клетку ${sq.toUpperCase()}` : `Если ВАША фигура наступит на клетку ${sq.toUpperCase()}`,
          penalty: isMyTrap ? 'Фигура соперника мгновенно застынет во льду на 1 ход' : 'Ваша наступившая фигура мгновенно застынет во льду на 1 ход ❄️',
          shortDesc: isMyTrap ? `Если враг наступит на ${sq.toUpperCase()} ➔ он замёрзнет` : `Если вы наступите на ${sq.toUpperCase()} ➔ фигура замёрзнет`,
          advice: isMyTrap
            ? 'Клетка заминирована вами. Если враг ступит на неё, он немедленно покроется льдом!'
            : `Осторожно! Не ставьте свои фигуры на клетку ${sq.toUpperCase()}, иначе они замёрзнут!`
        });
      }
    }

    // 4. Smoke Screen Area
    if (deckManager.smokeArea && deckManager.smokeArea.turns > 0) {
      const sa = deckManager.smokeArea;
      const stateBadge = sa.state === 'APPLIED' ? '✨ Только наложен' : (sa.state === 'TICKING' ? '⏳ Тикает' : '🟢 Есть эффект');
      list.push({
        id: 'smoke_area',
        name: 'Густой Туман',
        icon: '🌫️',
        category: 'neutral_field',
        badgeText: '🌫️ ПОЛЕВОЙ ЭФФЕКТ',
        owner: null,
        turns: sa.turns,
        state: sa.state || 'ACTIVE',
        stateBadge: stateBadge,
        target: `Область клеток: ${sa.squares.map(s => s.toUpperCase()).join(', ')}`,
        trigger: 'Попытка взять фигуру внутри тумана',
        penalty: 'Взятия фигур в этой области заблокированы магической пеленой',
        shortDesc: 'В области тумана запрещены любые взятия фигур',
        advice: 'В тумане никто не может рубить фигуры. Используйте эту область как надёжное укрытие!'
      });
    }

    // 5. King's Shield
    if (deckManager.kingsShield) {
      ['w', 'b'].forEach(col => {
        if (deckManager.kingsShield[col] > 0) {
          const isMyShield = col === myColor;
          const kData = deckManager.kingsShieldData ? deckManager.kingsShieldData[col] : null;
          const stateBadge = (kData && kData.state === 'APPLIED') ? '✨ Только наложен' : ((kData && kData.state === 'TICKING') ? '⏳ Тикает' : '🟢 Есть эффект');
          list.push({
            id: 'shield_' + col,
            name: isMyShield ? 'Аура Стойкости Короля' : 'Вражеский Щит Короля',
            icon: '🛡️',
            category: isMyShield ? 'my_buff' : 'enemy_buff',
            badgeText: isMyShield ? '🛡️ ВАШ БАФФ' : '🛡️ БАФФ СОПЕРНИКА',
            owner: col,
            turns: deckManager.kingsShield[col],
            state: kData ? kData.state : 'ACTIVE',
            stateBadge: stateBadge,
            target: isMyShield ? 'Ваш Король 👑' : 'Король соперника 👑',
            trigger: isMyShield ? 'Попытка шаха от коней или пешек соперника' : 'Попытка шаха от ваших коней или пешек',
            penalty: isMyShield ? 'Шахи от лёгких фигур полностью игнорируются' : 'Шахи лёгкими фигурами заблокированы аурой',
            shortDesc: isMyShield ? 'Ваш Король защищен от шахов пешек и коней' : 'Король врага защищен от шахов пешек и коней',
            advice: isMyShield
              ? 'Ваш король неуязвим к шахам от пешек и коней. Можете атаковать без опаски!'
              : 'Не пытайтесь шаховать короля соперника конями или пешками — атакуйте тяжёлыми фигурами.'
          });
        }
      });
    }

    return list;
  }

  function openEffectDetailsModal(effect, allEffects = null) {
    if (!effectDetailsModal) return;
    if (!allEffects) allEffects = getAllActiveEffects();

    // Theme dialog border/shadow based on effect category
    if (effectModalDialog) {
      effectModalDialog.classList.remove('modal-enemy', 'modal-freeze', 'modal-trap');
      if (effect.category && effect.category.includes('enemy')) {
        effectModalDialog.classList.add('modal-enemy');
      } else if (effect.category && effect.category.includes('frozen')) {
        effectModalDialog.classList.add('modal-freeze');
      } else if (effect.category && effect.category.includes('trap')) {
        effectModalDialog.classList.add('modal-trap');
      }
    }

    // Populate switcher tabs if more than 1 active effect
    if (effectModalTabs) {
      if (allEffects.length > 1) {
        effectModalTabs.classList.remove('hidden');
        effectModalTabs.innerHTML = '';
        allEffects.forEach(eff => {
          const tab = document.createElement('button');
          const isEnemy = eff.category && eff.category.includes('enemy');
          const isFrozen = eff.category && eff.category.includes('frozen');
          tab.className = `effect-tab-pill ${eff.id === effect.id ? 'active' : ''} ${isEnemy ? 'tab-enemy' : (isFrozen ? 'tab-freeze' : '')}`;
          tab.innerHTML = `<span>${eff.icon}</span> <span>${eff.name}</span>`;
          tab.addEventListener('click', () => {
            openEffectDetailsModal(eff, allEffects);
          });
          effectModalTabs.appendChild(tab);
        });
      } else {
        effectModalTabs.classList.add('hidden');
        effectModalTabs.innerHTML = '';
      }
    }

    if (effectModalIcon) effectModalIcon.textContent = effect.icon || '⚡';
    if (effectModalBadge) effectModalBadge.textContent = effect.badgeText || 'АКТИВНЫЙ ЭФФЕКТ';
    if (effectModalTitle) effectModalTitle.textContent = effect.name || 'Эффект';
    const turnWord = effect.turns === 1 ? 'ход' : (effect.turns < 5 ? 'хода' : 'ходов');
    const stateBadgeText = effect.stateBadge || '🟢 Есть эффект';
    if (effectModalTurns) effectModalTurns.textContent = `${effect.turns} ${turnWord} • ${stateBadgeText}`;
    if (effectModalTarget) effectModalTarget.textContent = effect.target || 'Фигуры на доске';
    if (effectModalTrigger) effectModalTrigger.textContent = effect.trigger || 'Особое условие';
    if (effectModalPenalty) effectModalPenalty.textContent = effect.penalty || 'Штрафной эффект';
    if (effectModalAdvice) effectModalAdvice.textContent = effect.advice || 'Внимательно следите за позицией на доске.';

    effectDetailsModal.classList.remove('hidden');
  }

  function closeEffectDetailsModal() {
    if (effectDetailsModal) effectDetailsModal.classList.add('hidden');
  }

  function renderActiveDecrees() {
    if (gameVariant !== 'cards') {
      if (btnOpenEffectsModal) btnOpenEffectsModal.classList.add('hidden');
      if (activeEffectsTicker) activeEffectsTicker.classList.add('hidden');
      if (sidebarEffectsCount) sidebarEffectsCount.classList.add('hidden');
      return;
    }

    const allEffects = getAllActiveEffects();

    // 1. Update Top HUD Button & Badge
    if (btnOpenEffectsModal && hudEffectsBadge) {
      if (allEffects.length > 0) {
        btnOpenEffectsModal.classList.remove('hidden');
        hudEffectsBadge.textContent = allEffects.length;
        const hasEnemyCurse = allEffects.some(e => e.category && e.category.includes('enemy'));
        btnOpenEffectsModal.classList.toggle('has-enemy-curse', hasEnemyCurse);
      } else {
        btnOpenEffectsModal.classList.add('hidden');
      }
    }

    // 2. Update Top Active Effects Ticker above Board
    if (activeEffectsTicker) {
      if (allEffects.length > 0) {
        activeEffectsTicker.classList.remove('hidden');
        activeEffectsTicker.innerHTML = '';
        allEffects.forEach(eff => {
          const chip = document.createElement('div');
          const isEnemy = eff.category && eff.category.includes('enemy');
          const isFrozen = eff.category && eff.category.includes('frozen');
          const isTrap = eff.category && eff.category.includes('trap');
          const isFriendly = eff.category && (eff.category.includes('my') || eff.category.includes('friendly'));

          let chipClass = 'chip-neutral';
          if (isEnemy) chipClass = 'chip-enemy';
          else if (isFrozen) chipClass = 'chip-freeze';
          else if (isTrap) chipClass = 'chip-trap';
          else if (isFriendly) chipClass = 'chip-friendly';

          chip.className = `ticker-chip ${chipClass}`;
          chip.title = `${eff.name}: нажмите для описания`;
          chip.innerHTML = `
            <span class="chip-icon">${eff.icon}</span>
            <span class="chip-title">${eff.name}</span>
            <span class="chip-turns">⏳ ${eff.turns}х</span>
            <span class="chip-info-btn">🔍</span>
          `;
          chip.addEventListener('click', () => {
            openEffectDetailsModal(eff, allEffects);
          });
          activeEffectsTicker.appendChild(chip);
        });
      } else {
        activeEffectsTicker.classList.add('hidden');
        activeEffectsTicker.innerHTML = '';
      }
    }

    // 3. Update Sidebar Active Effects Container
    if (sidebarEffectsCount) {
      if (allEffects.length > 0) {
        sidebarEffectsCount.classList.remove('hidden');
        sidebarEffectsCount.textContent = allEffects.length;
      } else {
        sidebarEffectsCount.classList.add('hidden');
      }
    }

    if (activeDecreesList) {
      activeDecreesList.innerHTML = '';
      if (allEffects.length === 0) {
        activeDecreesList.innerHTML = `
          <div class="no-decrees-hint">
            <span class="no-decrees-icon">🛡️</span>
            <span>Нет активных проклятий и указов. Все фигуры подчиняются классическим правилам.</span>
          </div>
        `;
        return;
      }

      allEffects.forEach(eff => {
        const isEnemy = eff.category && eff.category.includes('enemy');
        const isFrozen = eff.category && eff.category.includes('frozen');
        const isTrap = eff.category && eff.category.includes('trap');
        const isFriendly = eff.category && (eff.category.includes('my') || eff.category.includes('friendly'));

        let stripClass = 'strip-neutral';
        if (isEnemy) stripClass = 'strip-enemy';
        else if (isFrozen) stripClass = 'strip-freeze';
        else if (isTrap) stripClass = 'strip-trap';
        else if (isFriendly) stripClass = 'strip-friendly';

        const strip = document.createElement('div');
        strip.className = `effect-strip ${stripClass}`;
        strip.title = `Нажмите для подробного описания`;
        strip.innerHTML = `
          <div class="strip-left">
            <span class="strip-icon">${eff.icon}</span>
            <div class="strip-text-group">
              <div class="strip-badge-row">
                <span class="strip-tag">${eff.badgeText}</span>
              </div>
              <strong class="strip-title">${eff.name}</strong>
              <div class="strip-desc">${eff.shortDesc || (eff.trigger + ' ➔ ' + eff.penalty)}</div>
            </div>
          </div>
          <div class="strip-right">
            <span class="strip-timer">⏳ ${eff.turns} ${eff.turns === 1 ? 'ход' : 'х.'}</span>
            <span class="strip-arrow">›</span>
          </div>
        `;

        strip.addEventListener('click', () => {
          openEffectDetailsModal(eff, allEffects);
        });

        activeDecreesList.appendChild(strip);
      });
    }
  }

  // Expose to window for board clicks on frozen pieces / traps
  window.chessApp = {
    getAllActiveEffects,
    openEffectDetailsModal,
    closeEffectDetailsModal
  };

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
      deckManager.addDecree(card, casterColor, totalMovesCount);
      if (card.id === 'forbidden_square' && targetSquare) {
        deckManager.setForbiddenSquare(targetSquare, casterColor, card.duration || 3, totalMovesCount);
        if (casterColor === myColor) {
          showToast(`☠️ Вы установили «Чёрную Метку» на клетку ${targetSquare.toUpperCase()}! Любой враг застынет во льду.`);
        } else {
          showToast(`⚠️ Соперник заминировал клетку ${targetSquare.toUpperCase()}! Не наступайте на неё, иначе фигура замёрзнет!`, 5000);
        }
      } else {
        if (casterColor === myColor) {
          showToast(`📜 Вы издали указ: «${card.name}»! Соперник будет наказан при нарушении.`);
        } else {
          showToast(`⚠️ Соперник наложил проклятие: «${card.name}»! Проверьте правила (кнопка "Эффекты")!`, 5000);
        }
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
            deckManager.freezePiece(targetSquare, targetColor, 1, totalMovesCount, 'freeze_piece');
            if (window.sounds) window.sounds.play('freeze');
            if (casterColor === myColor) {
              if (wasInCheck && !game.in_check()) {
                showToast(`❄️ Шах снят! Фигура соперника на ${targetSquare.toUpperCase()} закована во лёд!`, 5000);
              } else {
                showToast(`❄️ Вы заморозили фигуру соперника на ${targetSquare.toUpperCase()} на 1 ход!`);
              }
            } else {
              showToast(`❄️ Соперник заморозил вашу фигуру на ${targetSquare.toUpperCase()}! Она не может ходить 1 ход!`, 5000);
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
            deckManager.setSmokeArea(
              [fileChar + rankNum, nextFile + rankNum, fileChar + nextRank, nextFile + nextRank],
              2,
              totalMovesCount
            );
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
          deckManager.setKingsShield(casterColor, 2, totalMovesCount);
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
                deckManager.freezePiece(sq, enemyCol, 1, totalMovesCount, 'divine_storm');
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

  function checkDecreePenalties(moveResult, movedColor, currentPly = null) {
    if (gameVariant !== 'cards') return;
    const ply = (currentPly !== null && currentPly !== undefined) ? currentPly : totalMovesCount;

    // Check if movedColor violated any decrees set by opponent
    const opponent = movedColor === 'w' ? 'b' : 'w';
    const decrees = deckManager.activeDecrees.filter(d => d.owner === opponent);

    decrees.forEach(d => {
      // 1. Curse Knight
      if (d.id === 'curse_knight' && moveResult.piece === 'n') {
        deckManager.freezePiece(moveResult.to, movedColor, 1, ply, 'curse_knight');
        if (window.sounds) {
          window.sounds.play('curse_trigger');
          setTimeout(() => window.sounds.play('freeze'), 150);
        }
        if (movedColor === myColor) {
          showToast(`⚠️ «Оковы Кентавра»: вы походили Конём — ваш конь на ${moveResult.to.toUpperCase()} застыл во льду на 1 ход!`, 4500);
        } else {
          showToast(`⚔️ Ваш указ «Оковы Кентавра» сработал: конь соперника на ${moveResult.to.toUpperCase()} застыл во льду!`, 4500);
        }
      }

      // 2. Curse Rook
      if (d.id === 'curse_rook' && moveResult.piece === 'r') {
        if (d.owner === myColor) {
          if (window.sounds) window.sounds.play('card_draw');
          triggerCardDraw();
          showToast('🎁 Ваш указ «Осадный Налог» сработал: соперник походил Ладьёй, вы получаете +1 карту!');
        } else if (botDeckManager && d.owner === opponentColor) {
          botDeckManager.drawCard();
          showToast('⚠️ «Осадный Налог»: вы походили Ладьёй — соперник получил +1 бонусную карту!', 4500);
        }
      }

      // 3. Tax Castle
      if (d.id === 'tax_castle' && (moveResult.flags.includes('k') || moveResult.flags.includes('q'))) {
        deckManager.freezePiece(moveResult.to, movedColor, 1, ply, 'tax_castle');
        if (window.sounds) {
          window.sounds.play('curse_trigger');
          setTimeout(() => window.sounds.play('freeze'), 150);
        }
        if (movedColor === myColor) {
          showToast('⚠️ «Запрет на Бункер»: вы совершили рокировку — ваш Король застыл во льду на 1 ход!', 4500);
        } else {
          showToast('⚔️ Ваш указ «Запрет на Бункер» сработал: Король соперника застыл во льду за рокировку!', 4500);
        }
      }

      // 4. Blood Tribute
      if (d.id === 'blood_tribute' && moveResult.captured) {
        deckManager.freezePiece(moveResult.to, movedColor, 1, ply, 'blood_tribute');
        if (window.sounds) {
          window.sounds.play('curse_trigger');
          setTimeout(() => window.sounds.play('freeze'), 150);
        }
        if (movedColor === myColor) {
          showToast(`🩸 «Возмездие Крови»: вы взяли фигуру соперника — ваша атаковавшая фигура на ${moveResult.to.toUpperCase()} заморожена на 1 ход!`, 4500);
        } else {
          showToast(`🩸 Ваше «Возмездие Крови» сработало: фигура соперника на ${moveResult.to.toUpperCase()} заморожена за взятие!`, 4500);
        }
      }
    });

    // Check forbidden square trigger
    if (deckManager.forbiddenSquares[moveResult.to]) {
      deckManager.freezePiece(moveResult.to, movedColor, 1, ply, 'forbidden_square');
      delete deckManager.forbiddenSquares[moveResult.to];
      if (window.sounds) window.sounds.play('freeze');
      if (movedColor === myColor) {
        showToast(`☠️ «Чёрная Метка»: ваша фигура наступила на проклятую клетку ${moveResult.to.toUpperCase()} и заморожена!`, 4500);
      } else {
        showToast(`☠️ Ваша ловушка «Чёрная Метка» сработала: фигура соперника на ${moveResult.to.toUpperCase()} заморожена!`, 4500);
      }
    }

    // Check King's Shield retaliation if move delivered check
    if (game.in_check()) {
      const kingColor = game.turn();
      if (deckManager.kingsShield && deckManager.kingsShield[kingColor] > 0) {
        deckManager.freezePiece(moveResult.to, movedColor, 1, ply, 'kings_shield');
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
    const movedColor = moveResult.color;
    totalMovesCount++;
    if (window.logger) {
      window.logger.move(movedColor, moveResult, game.fen(), false);
    }
    updateGameUI(moveResult);

    // State Pattern Turn Transition: MOVED ("Походил")
    if (deckManager && deckManager.turnState) {
      deckManager.turnState.onMoveExecuted(movedColor, totalMovesCount);
    }

    // Check decree penalties on moved player
    checkDecreePenalties(moveResult, movedColor, totalMovesCount);
    deckManager.tickTurn(movedColor, totalMovesCount, game);

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
        } else {
          checkGameOver();
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
      const movedColor = res.color || opponentColor;

      // State Pattern Turn Transition: MOVED ("Походил")
      if (deckManager && deckManager.turnState) {
        deckManager.turnState.onMoveExecuted(movedColor, totalMovesCount);
      }

      checkDecreePenalties(res, movedColor, totalMovesCount);
      deckManager.tickTurn(movedColor, totalMovesCount, game);

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
    deckManager.turnState.onTurnStart('w', 0);
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
      renderCardsHand();
      renderActiveDecrees();
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
    let raw = inputJoinCode.value.trim();
    if (!raw) {
      showToast('Введите код комнаты или вставьте ссылку-приглашение!');
      return;
    }
    // Extract code if user pasted a full URL (e.g. https://.../?room=ABC123)
    let code = raw.toUpperCase();
    if (code.includes('ROOM=')) {
      const m = code.match(/ROOM=([A-Z0-9]+)/i);
      if (m) code = m[1].toUpperCase();
    }
    code = code.replace(/[^A-Z0-9]/g, '');
    if (code.length > 6) code = code.slice(-6);

    if (code.length < 4) {
      showToast('Неверный код комнаты! Код состоит из 6 символов.');
      return;
    }
    joinOnlineRoom(code);
  });

  if (inputJoinCode) {
    inputJoinCode.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        btnJoinOnline.click();
      }
    });
  }

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
        } else {
          checkGameOver();
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

  // Active Effects Modal Controls
  if (btnOpenEffectsModal) {
    btnOpenEffectsModal.addEventListener('click', (e) => {
      e.stopPropagation();
      const allEffects = getAllActiveEffects();
      if (allEffects.length > 0) openEffectDetailsModal(allEffects[0], allEffects);
    });
  }
  if (btnCloseEffectModal) btnCloseEffectModal.addEventListener('click', closeEffectDetailsModal);
  if (btnEffectModalOk) btnEffectModalOk.addEventListener('click', closeEffectDetailsModal);
  if (effectModalBackdrop) effectModalBackdrop.addEventListener('click', closeEffectDetailsModal);

  // Rules & Spell Book Modal Controls
  if (btnOpenRulesHeader) btnOpenRulesHeader.addEventListener('click', () => openRulesModal());
  if (btnOpenRulesLobby) btnOpenRulesLobby.addEventListener('click', () => openRulesModal());
  if (menuItemRules) {
    menuItemRules.addEventListener('click', () => {
      toggleGameMenu(true);
      openRulesModal();
    });
  }
  if (btnOpenRulesInv) {
    btnOpenRulesInv.addEventListener('click', (e) => {
      e.stopPropagation();
      openRulesModal('spellbook');
    });
  }
  if (btnCloseRules) btnCloseRules.addEventListener('click', closeRulesModal);
  if (btnCloseRulesOk) btnCloseRulesOk.addEventListener('click', closeRulesModal);
  if (modalRules) {
    modalRules.addEventListener('click', (e) => {
      if (e.target === modalRules) closeRulesModal();
    });
  }
  if (rulesTabBtns) {
    rulesTabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        if (tab) switchRulesTab(tab);
      });
    });
  }

  // Global document click to close HUD menu
  document.addEventListener('click', (e) => {
    if (gameMenuDropdown && !gameMenuDropdown.classList.contains('hidden')) {
      if (!e.target.closest('.hud-menu-wrapper')) {
        toggleGameMenu(true);
      }
    }
  });

  // Global Escape & Hotkey handler
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeEffectDetailsModal();
      closeCardsInventory();
      closeRulesModal();
      if (modalLogs) modalLogs.classList.add('hidden');
      toggleGameMenu(true);
      if (pendingCard) cancelTargeting();
    }
    // Hotkey C or I to toggle cards inventory
    if ((e.key === 'c' || e.key === 'C' || e.key === 'i' || e.key === 'I') && mode && screenGame && !screenGame.classList.contains('hidden') && !e.target.matches('input, textarea')) {
      toggleCardsInventory();
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
  } else if (urlParams.get('test_effects')) {
    setTimeout(() => {
      btnPlayBot.click();
      if (deckManager) {
        const curseCard = CARDS_DATABASE.find(c => c.id === 'curse_knight');
        if (curseCard) deckManager.addDecree(curseCard, 'b'); // enemy curse on white
        deckManager.freezePiece('f3', 'w', 1);
        deckManager.forbiddenSquares['d5'] = { turns: 2, byPlayer: 'b' };
        renderActiveDecrees();
        if (boardUI) boardUI.render();
      }
    }, 200);
  } else if (urlParams.get('test_effect_modal')) {
    setTimeout(() => {
      btnPlayBot.click();
      if (deckManager) {
        const curseCard = CARDS_DATABASE.find(c => c.id === 'curse_knight');
        if (curseCard) deckManager.addDecree(curseCard, 'b'); // enemy curse on white
        deckManager.freezePiece('f3', 'w', 1);
        deckManager.forbiddenSquares['d5'] = { turns: 2, byPlayer: 'b' };
        renderActiveDecrees();
        if (boardUI) boardUI.render();
        setTimeout(() => {
          const allEff = getAllActiveEffects();
          if (allEff.length > 0) openEffectDetailsModal(allEff[0], allEff);
        }, 300);
      }
    }, 150);
  } else if (urlParams.get('test_classic_black')) {
    setTimeout(() => {
      gameVariantSelect.value = 'classic';
      selectColor.value = 'b';
      btnPlayBot.click();
    }, 150);
  } else if (urlParams.get('test_rules')) {
    setTimeout(() => {
      openRulesModal('cards-guide');
    }, 150);
  } else if (urlParams.get('test_spellbook')) {
    setTimeout(() => {
      openRulesModal('spellbook');
    }, 150);
  } else if (urlParams.get('test_showcase')) {
    setTimeout(() => {
      btnPlayBot.click();
      const curseCard = CARDS_DATABASE.find(c => c.id === 'curse_knight');
      if (curseCard) {
        showCardPlayCinematic(curseCard, false);
      }
    }, 200);
  }
});
