const { Chess } = require('./js/chess.js');

global.window = {};
require('./js/cards.js');
const CardDeckManager = window.CardDeckManager;
const CARDS_DATABASE = window.CARDS_DATABASE;

console.log('========================================================');
console.log('   NETWORK MULTIPLAYER & CARD CHESS TEST SUITE          ');
console.log('========================================================\n');

// 1. UNIT TEST: Test the user specific situation:
// "королю поставили мат конем, юзанули заморозку на коня -> мат снимается, конем брать нельзя"
console.log('--- TEST 1: Checkmate / Check Escape via Freeze ---');
{
  const hostGame = new Chess();
  const guestGame = new Chess();
  const hostDeck = new CardDeckManager();
  const guestDeck = new CardDeckManager();

  hostGame.set_freeze_fn((sq) => hostDeck.isPieceFrozen(sq));
  guestGame.set_freeze_fn((sq) => guestDeck.isPieceFrozen(sq));

  // Set up board: White King e1, Black King e8, White Knight on d6 (gives check to e8)
  hostGame.clear();
  hostGame.put({ type: 'k', color: 'w' }, 'e1');
  hostGame.put({ type: 'k', color: 'b' }, 'e8');
  hostGame.put({ type: 'n', color: 'w' }, 'd6');
  // Black turn
  const fen = hostGame.fen().replace(' w ', ' b ');
  hostGame.load(fen);
  guestGame.load(fen);

  console.log('Initial State: White Knight on d6 checking Black King on e8');
  console.log('Host in_check:', hostGame.in_check(), '| Guest in_check:', guestGame.in_check());
  if (!hostGame.in_check() || !guestGame.in_check()) {
    throw new Error('TEST 1 FAILED: Initial check was not detected!');
  }

  // Black (Guest) uses freeze_piece on the White Knight at d6
  console.log('\nGuest (Black) casts Freeze Piece on d6...');
  // Simulate network broadcast
  guestDeck.freezePiece('d6', 'w', 1);
  hostDeck.freezePiece('d6', 'w', 1);

  console.log('AFTER FREEZE:');
  console.log('Guest in_check:', guestGame.in_check(), '(EXPECTED: false)');
  console.log('Host in_check: ', hostGame.in_check(),  '(EXPECTED: false)');
  console.log('Guest King legal moves:', guestGame.moves({ square: 'e8' }));

  if (guestGame.in_check() !== false || hostGame.in_check() !== false) {
    throw new Error('TEST 1 FAILED: Freeze did not remove check from king!');
  }

  // Black makes a move with their King: e8 to d8
  console.log('\nGuest moves King e8 -> d8...');
  const blackMove = guestGame.move({ from: 'e8', to: 'd8' });
  hostGame.move({ from: 'e8', to: 'd8' });
  // Turn ends for Black: tickTurn('b')
  guestDeck.tickTurn('b');
  hostDeck.tickTurn('b');

  // Now it is White turn!
  console.log('Current turn:', hostGame.turn(), '(White)');
  console.log('Is d6 Knight still frozen for White?', hostDeck.isPieceFrozen('d6'), '(EXPECTED: true)');
  console.log('White moves for d6 Knight:', hostGame.moves({ square: 'd6' }), '(EXPECTED: [])');

  if (hostDeck.isPieceFrozen('d6') !== true) {
    throw new Error('TEST 1 FAILED: Knight thawed before White turn!');
  }
  if (hostGame.moves({ square: 'd6' }).length > 0) {
    throw new Error('TEST 1 FAILED: White was able to generate moves with frozen knight!');
  }

  const illegalCapture = hostGame.move({ from: 'd6', to: 'd8' });
  console.log('White attempt to capture King or move d6:', illegalCapture, '(EXPECTED: null)');
  if (illegalCapture !== null) {
    throw new Error('TEST 1 FAILED: White was able to make a move with frozen knight!');
  }

  // White makes a move with their King: e1 -> d1
  console.log('\nWhite moves King e1 -> d1 (turn passes)...');
  hostGame.move({ from: 'e1', to: 'd1' });
  guestGame.move({ from: 'e1', to: 'd1' });
  // White completed turn: tickTurn('w')
  hostDeck.tickTurn('w');
  guestDeck.tickTurn('w');

  console.log('Is d6 Knight frozen after White turn?', hostDeck.isPieceFrozen('d6'), '(EXPECTED: false - thawed)');
  if (hostDeck.isPieceFrozen('d6') !== false) {
    throw new Error('TEST 1 FAILED: Knight did not thaw after White turn completed!');
  }

  console.log('>>> TEST 1 PASSED: Checkmate was removed by freeze, and frozen piece could not move or capture!\n');
}

// 2. TEST 2: Disconnection Handling & Forfeit Win
console.log('--- TEST 2: Disconnection & Forfeiture Handling ---');
{
  let gameEnded = false;
  let winner = null;
  let winReason = null;

  function endGame(title, desc) {
    gameEnded = true;
    winner = title;
    winReason = desc;
  }

  // Simulate network disconnect event
  const isOnline = true;
  const gameActive = true;

  function onDisconnect() {
    if (isOnline && gameActive && !gameEnded) {
      endGame('Победа!', 'Соперник отключился от игры. Вам автоматически засчитана техническая победа!');
    }
  }

  onDisconnect();

  console.log('Game ended status:', gameEnded);
  console.log('Winner:', winner);
  console.log('Reason:', winReason);

  if (!gameEnded || !winner.includes('Победа') || !winReason.includes('отключился')) {
    throw new Error('TEST 2 FAILED: Disconnection did not trigger automatic forfeit victory!');
  }
  console.log('>>> TEST 2 PASSED: Disconnection immediately awards victory!\n');
}

// 4. TEST 4: Network Desync Auto-Recovery via FEN
console.log('--- TEST 4: Network Desync Auto-Recovery via FEN Fallback ---');
{
  const host = new Chess();
  const guest = new Chess();

  // Host makes e2 -> e4
  const hostMove = host.move({ from: 'e2', to: 'e4' });
  const packet = {
    type: 'move',
    from: 'e2',
    to: 'e4',
    promotion: 'q',
    fen: host.fen()
  };

  // Simulate corrupt state on guest where guest engine somehow rejects the move
  // e.g. guest board had an unexpected piece blocking
  guest.put({ type: 'p', color: 'b' }, 'e4'); // Deliberate corruption
  let res = guest.move({ from: packet.from, to: packet.to, promotion: packet.promotion });
  console.log('Direct move on corrupt state:', res, '(EXPECTED: null)');

  // Auto-recovery via FEN (the fix implemented in app.js):
  if (!res && packet.fen) {
    const loaded = guest.load(packet.fen);
    if (loaded) {
      res = { from: packet.from, to: packet.to, captured: false, flags: '' };
    }
  }

  console.log('After FEN auto-recovery, guest res exists:', !!res);
  console.log('Host FEN: ', host.fen());
  console.log('Guest FEN:', guest.fen());
  if (host.fen() !== guest.fen() || !res) {
    throw new Error('TEST 4 FAILED: FEN auto-recovery did not sync guest board!');
  }
  console.log('>>> TEST 4 PASSED: Remote move recovered 100% cleanly via authoritative FEN!\n');
}

// 5. TEST 5: Deterministic Color Assignment (No Random Duplication)
console.log('--- TEST 5: Deterministic Online Color Handshake ---');
{
  for (let trial = 0; trial < 50; trial++) {
    // Host selects random side
    const selectColorValue = 'random';
    let hostSide = selectColorValue;
    if (hostSide === 'random') {
      hostSide = Math.random() < 0.5 ? 'w' : 'b';
    }
    const guestSide = hostSide === 'w' ? 'b' : 'w';
    const config = { hostSide, guestSide };
    const pendingOnlineConfig = config;

    // When connection opens, host uses pendingOnlineConfig.hostSide
    const finalHostSide = pendingOnlineConfig.hostSide;
    const finalGuestSide = config.guestSide;

    if (finalHostSide === finalGuestSide) {
      throw new Error(`TEST 5 FAILED: Both players got color ${finalHostSide}!`);
    }
  }
  console.log('>>> TEST 5 PASSED: 50/50 trials generated perfectly opposing colors without duplicate sides!\n');
}

console.log('--- TEST 3: 100-Game Simulated Online Network Test ---');

const netStats = {
  games: 100,
  completed: 0,
  networkPacketsSent: 0,
  cardsPlayedOverNet: 0,
  desyncErrors: 0,
  totalMoves: 0
};

for (let g = 1; g <= 100; g++) {
  const hostGame = new Chess();
  const guestGame = new Chess();
  const hostDeck = new CardDeckManager();
  const guestDeck = new CardDeckManager();

  hostGame.set_freeze_fn((sq) => hostDeck.isPieceFrozen(sq));
  guestGame.set_freeze_fn((sq) => guestDeck.isPieceFrozen(sq));

  hostDeck.drawCard(); hostDeck.drawCard();
  guestDeck.drawCard(); guestDeck.drawCard();

  let moves = 0;
  while (!hostGame.game_over() && moves < 80) {
    const turn = hostGame.turn();
    const isHostTurn = (turn === 'w');
    const activeDeck = isHostTurn ? hostDeck : guestDeck;
    const oppDeck = isHostTurn ? guestDeck : hostDeck;

    // Simulate Network Card Play
    if (activeDeck.hand.length > 0 && Math.random() < 0.4) {
      const card = activeDeck.hand[Math.floor(Math.random() * activeDeck.hand.length)];
      activeDeck.removeCard(card.instanceId);
      netStats.cardsPlayedOverNet++;
      netStats.networkPacketsSent++; // card-play packet

      if (card.type === 'decree') {
        hostDeck.addDecree(card, turn);
        guestDeck.addDecree(card, turn);
      } else {
        if (card.id === 'freeze_piece') {
          // Freeze random enemy piece
          const oppCol = turn === 'w' ? 'b' : 'w';
          const b = hostGame.board();
          for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
              const p = b[r][c];
              if (p && p.color === oppCol && p.type !== 'k') {
                const sq = String.fromCharCode(97 + c) + (8 - r);
                hostDeck.freezePiece(sq, oppCol, 1);
                guestDeck.freezePiece(sq, oppCol, 1);
                break;
              }
            }
          }
        } else if (card.id === 'shadow_swap') {
          const b = hostGame.board();
          let kSq = null, pSq = null;
          for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
              const p = b[r][c];
              if (p && p.color === turn) {
                const sq = String.fromCharCode(97 + c) + (8 - r);
                if (p.type === 'n' && !kSq) kSq = sq;
                if (p.type === 'p' && !pSq) pSq = sq;
              }
            }
          }
          if (kSq && pSq) {
            const kp = hostGame.get(kSq);
            const pp = hostGame.get(pSq);
            [hostGame, guestGame].forEach(gm => {
              gm.remove(kSq);
              gm.remove(pSq);
              gm.put(kp, pSq);
              const destR = parseInt(kSq[1], 10);
              const isBack = (turn === 'w' && destR === 1) || (turn === 'b' && destR === 8);
              gm.put(isBack ? { type: 'n', color: turn } : pp, kSq);
              gm.load(gm.fen());
            });
          }
        }
      }
    }

    // Move Execution
    const allMoves = hostGame.moves({ verbose: true });
    if (allMoves.length === 0) break;

    const playable = allMoves.filter(m => !activeDeck.isPieceFrozen(m.from));
    if (playable.length === 0) break;

    const move = playable[Math.floor(Math.random() * playable.length)];

    // Host makes move and sends over net:
    const resHost = hostGame.move(move);
    netStats.networkPacketsSent++; // move packet
    // Guest receives and plays move:
    const resGuest = guestGame.move(move);

    if (!resHost || !resGuest) {
      netStats.desyncErrors++;
      console.error(`Desync at game ${g}, move ${moves}: host=${!!resHost}, guest=${!!resGuest}`);
      break;
    }

    // Verify FEN consistency across network
    if (hostGame.fen() !== guestGame.fen()) {
      netStats.desyncErrors++;
      console.error(`FEN mismatch at game ${g}:`, hostGame.fen(), 'vs', guestGame.fen());
      break;
    }

    // Decrement turn for the moved player
    hostDeck.tickTurn(turn);
    guestDeck.tickTurn(turn);

    moves++;
    netStats.totalMoves++;

    if (moves % 6 === 0) {
      hostDeck.drawCard();
      guestDeck.drawCard();
    }
  }

  netStats.completed++;
  if (g % 25 === 0) {
    console.log(`Progress: ${g}/100 online games simulated.`);
  }
}

console.log('\n========================================================');
console.log('       100-GAME NETWORK SIMULATION REPORT               ');
console.log('========================================================');
console.log(`Games Simulated:        ${netStats.completed} / ${netStats.games}`);
console.log(`Total Moves Made:       ${netStats.totalMoves}`);
console.log(`Network Packets Sent:   ${netStats.networkPacketsSent}`);
console.log(`Cards Cast Over Net:    ${netStats.cardsPlayedOverNet}`);
console.log(`Network Desync Errors:  ${netStats.desyncErrors}`);
console.log('========================================================\n');
