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
  const cardsHandSection = document.getElementById('cards-hand-section');
  const cardsHandContainer = document.getElementById('cards-hand-container');
  const handCountEl = document.getElementById('hand-count');
  const turnsUntilCardEl = document.getElementById('turns-until-card');
  const targetingBanner = document.getElementById('targeting-banner');
  const targetingCardName = document.getElementById('targeting-card-name');
  const btnCancelTarget = document.getElementById('btn-cancel-target');
  const cardDrawAnnouncement = document.getElementById('card-draw-announcement');

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

  // Application State
  let game = new Chess();
  let network = new ChessNetwork();
  let bot = new ChessBot();
  let deckManager = new CardDeckManager();
  let boardUI = null;

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
  function triggerCardDraw() {
    if (gameVariant !== 'cards') return;
    const drawn = deckManager.drawCard();
    if (drawn) {
      if (window.sounds) window.sounds.play('card_draw');
      showCardDrawAnnouncement();
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
    if (gameVariant !== 'cards') {
      cardsHandSection.classList.add('hidden');
      activeDecreesContainer.classList.add('hidden');
      return;
    }

    cardsHandSection.classList.remove('hidden');
    activeDecreesContainer.classList.remove('hidden');

    handCountEl.textContent = deckManager.hand.length;
    const movesTillNext = 3 - (Math.floor(totalMovesCount / 2) % 3);
    turnsUntilCardEl.textContent = movesTillNext === 0 ? 3 : movesTillNext;

    cardsHandContainer.innerHTML = '';

    if (deckManager.hand.length === 0) {
      cardsHandContainer.innerHTML = `<div class="no-decrees-hint" style="align-self:center;">Рука пуста. Следующая карта через ${turnsUntilCardEl.textContent} хода.</div>`;
      return;
    }

    deckManager.hand.forEach(card => {
      const rarityData = CARD_RARITIES[card.rarity] || CARD_RARITIES.COMMON;
      const cardEl = document.createElement('div');
      cardEl.className = 'hs-card';
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
        initiateCardPlay(card);
      });

      cardEl.addEventListener('click', () => {
        initiateCardPlay(card);
      });

      cardsHandContainer.appendChild(cardEl);
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
    game.put(pPiece, knightSq);

    if (window.sounds) window.sounds.play('castle');

    if (card) {
      showCardPlayCinematic(card, !isRemote, `Конь (${knightSq}) ⇄ Пешка (${pawnSq})`);
    }

    if (!isRemote && card) {
      deckManager.removeCard(card.instanceId);
      if (mode === 'online' && network.connected) {
        network.send({
          type: 'card-play',
          card: card,
          action: 'shadow_swap',
          extraData: { knightSq, pawnSq },
          byPlayer: myColor
        });
      }
      showToast(`👥 Обмен теней: Конь (${knightSq}) и Пешка (${pawnSq}) поменялись местами!`);
    } else {
      showToast(`👥 Соперник применил «Обмен теней»: Конь и Пешка поменялись местами!`);
    }

    renderCardsHand();
    if (boardUI) boardUI.render();
  }

  function applyCardEffect(card, targetSquare, isRemote = false) {
    if (window.sounds) window.sounds.play('card_play');
    showCardPlayCinematic(card, !isRemote, targetSquare);

    if (!isRemote) {
      deckManager.removeCard(card.instanceId);
      if (mode === 'online' && network.connected) {
        network.sendCardPlay(card, targetSquare, myColor);
      }
    }

    const casterColor = isRemote ? opponentColor : myColor;

    // Apply Effect
    if (card.type === 'decree') {
      deckManager.addDecree(card, casterColor);
      if (window.sounds) window.sounds.play('curse');
      showToast(`📜 Разыгран Указ: «${card.name}»!`);
    } else {
      // Instant Spells
      switch (card.id) {
        case 'freeze_piece':
          if (targetSquare) {
            const piece = boardUI.getPieceAt(targetSquare);
            const targetColor = piece ? piece.color : (casterColor === 'w' ? 'b' : 'w');
            deckManager.freezePiece(targetSquare, targetColor, 1);
            if (window.sounds) window.sounds.play('freeze');
            showToast(`❄️ Фигура на ${targetSquare} заморожена!`);
          }
          break;

        case 'smoke_screen':
          if (targetSquare) {
            const file = targetSquare[0];
            const rank = parseInt(targetSquare[1], 10);
            const nextFile = String.fromCharCode(Math.min(104, file.charCodeAt(0) + 1));
            const nextRank = Math.min(8, rank + 1);
            deckManager.smokeArea = {
              squares: [targetSquare, nextFile + rank, file + nextRank, nextFile + nextRank],
              turns: 2
            };
            showToast('🌫️ Туман окутал область 2х2 клетки!');
          }
          break;

        case 'reinforcements':
          if (targetSquare) {
            // Spawn pawn
            game.put({ type: 'p', color: casterColor }, targetSquare);
            showToast(`🎺 Пешка призвана на ${targetSquare}!`);
          }
          break;

        case 'kings_shield':
          deckManager.kingsShield[casterColor] = 2;
          showToast('✨ Король защищен от шаха легких фигур!');
          break;

        case 'alchemist_gold':
          if (!isRemote) {
            triggerCardDraw();
            triggerCardDraw();
            showToast('🔮 Получено 2 новые карты!');
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
          if (window.sounds) window.sounds.play('freeze');
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
  }
  function handleLocalMove(moveResult) {
    totalMovesCount++;
    updateGameUI(moveResult);

    // Check decree penalties on moved player
    checkDecreePenalties(moveResult, myColor);
    deckManager.tickTurn(game.turn());

    // Draw card every 3 full turns (every 6 half-moves)
    if (gameVariant === 'cards' && totalMovesCount % 6 === 0) {
      triggerCardDraw();
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
    if (mode === 'online' && network.connected) {
      network.sendMove(moveResult.from, moveResult.to, moveResult.promotion, timerWhite, timerBlack);
    }

    // Check game over
    if (game.game_over()) {
      checkGameOver();
      return;
    }

    // Bot move trigger
    if (mode === 'bot' && game.turn() === opponentColor) {
      setTimeout(() => {
        // Bot can also randomly play a card if in cards mode
        if (gameVariant === 'cards' && Math.random() < 0.35 && deckManager.hand.length > 0) {
          const botCard = deckManager.hand[Math.floor(Math.random() * deckManager.hand.length)];
          if (botCard && !botCard.requiresTarget) {
            applyCardEffect(botCard, null, true);
          }
        }

        const botMove = bot.getBestMove(game, botDifficulty);
        if (botMove) {
          const res = game.move(botMove);
          boardUI.lastMove = { from: res.from, to: res.to };
          boardUI.render();
          handleLocalMove(res);
        }
      }, 450);
    }
  }

  function handleRemoteMove(data) {
    totalMovesCount++;
    const res = game.move({
      from: data.from,
      to: data.to,
      promotion: data.promotion || 'q'
    });

    if (res) {
      boardUI.lastMove = { from: data.from, to: data.to };
      checkDecreePenalties(res, opponentColor);
      deckManager.tickTurn(game.turn());

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
      } else if (res.flags.includes('k') || res.flags.includes('q')) {
        window.sounds.play('castle');
      } else {
        window.sounds.play('move');
      }

      if (game.in_check()) {
        window.sounds.play('check');
      }

      updateGameUI(res);
      checkGameOver();
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
    if (game.in_checkmate()) {
      const winner = game.turn() === 'w' ? 'Чёрные' : 'Белые';
      endGame('Шах и мат!', `Победили: ${winner}`);
    } else if (game.in_stalemate()) {
      endGame('Ничья!', 'Пат — у игрока нет ходов.');
    } else if (game.in_threefold_repetition()) {
      endGame('Ничья!', 'Троекратное повторение ходов.');
    } else if (game.insufficient_material()) {
      endGame('Ничья!', 'Недостаточно материала для мата.');
    } else if (game.in_draw()) {
      endGame('Ничья!', 'Правило 50 ходов.');
    }
  }

  function endGame(title, desc) {
    stopTimer();
    window.sounds.play('gameover');
    gameOverTitle.textContent = title;
    gameOverDesc.textContent = desc;
    modalGameOver.classList.remove('hidden');
  }

  function startNewGame(config) {
    game.reset();
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
      renderCardsHand();
      renderActiveDecrees();
    } else {
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
    if (!info.isHost) {
      // Guest waiting for host init packet
    } else {
      // Host starts game immediately
      const chosenSide = selectColor.value === 'random' ? (Math.random() < 0.5 ? 'w' : 'b') : selectColor.value;
      const guestSide = chosenSide === 'w' ? 'b' : 'w';
      const timeVal = parseInt(selectTimeControl.value, 10);
      const chosenVariant = gameVariantSelect.value;

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
    showToast('Соперник отключился.');
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
        const botMove = bot.getBestMove(game, botDifficulty);
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

  // --- Game Controls ---
  btnResign.addEventListener('click', () => {
    if (confirm('Вы уверены, что хотите сдаться?')) {
      if (mode === 'online') network.sendResign(myColor);
      endGame('Поражение', 'Вы сдались.');
    }
  });

  btnOfferDraw.addEventListener('click', () => {
    if (mode === 'online') {
      network.sendDrawOffer();
      showToast('Предложение ничьей отправлено сопернику...');
    } else {
      endGame('Ничья!', 'По согласию сторон.');
    }
  });

  btnFlipBoard.addEventListener('click', () => {
    if (boardUI) boardUI.flip();
  });

  btnToggleMute.addEventListener('click', () => {
    const isMuted = window.sounds.toggleMute();
    btnToggleMute.innerHTML = isMuted ? '🔇' : '🔊';
    showToast(isMuted ? 'Звук выключен' : 'Звук включен');
  });

  btnLeaveGame.addEventListener('click', () => {
    if (confirm('Покинуть игру и вернуться в главное меню?')) {
      stopTimer();
      network.cleanup();
      switchScreen(screenLobby);
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

  if (initialRoom && initialRoom.length >= 4) {
    inputJoinCode.value = initialRoom;
    joinOnlineRoom(initialRoom);
  }
});
