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
  let boardUI = null;

  let mode = 'online'; // 'online', 'bot', 'pass'
  let myColor = 'w';
  let opponentColor = 'b';
  let opponentName = 'Соперник';
  let myName = 'Вы';
  let botDifficulty = 'medium';

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
      playerColor: (mode === 'online' || mode === 'bot') ? myColor : null,
      onMove: handleLocalMove
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

  // --- Move Handling ---
  function handleLocalMove(moveResult) {
    updateGameUI(moveResult);

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
        const botMove = bot.getBestMove(game, botDifficulty);
        if (botMove) {
          const res = game.move(botMove);
          boardUI.lastMove = { from: res.from, to: res.to };
          boardUI.render();
          handleLocalMove(res);
        }
      }, 350);
    }
  }

  function handleRemoteMove(data) {
    const res = game.move({
      from: data.from,
      to: data.to,
      promotion: data.promotion || 'q'
    });

    if (res) {
      boardUI.lastMove = { from: data.from, to: data.to };
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
      boardUI.options.playerColor = (mode === 'online' || mode === 'bot') ? myColor : null;
      boardUI.setGame(game);
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

    const roomCode = network.generateRoomCode();
    const config = {
      time: timeVal,
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

      const gameConfig = {
        time: timeVal,
        myColor: chosenSide
      };
      startNewGame(gameConfig);
    }
  });

  network.on('init', (config) => {
    // Guest receives init packet from host
    startNewGame({
      time: config.time,
      myColor: config.guestSide
    });
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
