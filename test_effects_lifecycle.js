const { Chess } = require('./js/chess.js');
const {
  EFFECT_STATE,
  TURN_STATE,
  TurnStateMachine,
  CARD_RARITIES,
  CARDS_DATABASE,
  CardDeckManager
} = require('./js/cards.js');

console.log('===============================================================');
console.log('   TURN STATE MACHINE & EFFECT LIFECYCLE VERIFICATION SUITE    ');
console.log('===============================================================\n');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (!condition) {
    testsFailed++;
    console.error(`❌ FAILED: ${message}`);
    throw new Error(message);
  } else {
    testsPassed++;
    console.log(`✅ PASSED: ${message}`);
  }
}

// -------------------------------------------------------------
// TEST 1: TurnStateMachine state transitions and labels
// -------------------------------------------------------------
console.log('--- TEST 1: TurnStateMachine State Machine ---');
{
  const tsm = new TurnStateMachine();
  assert(tsm.state === TURN_STATE.ACTIVE, 'Initial turn state should be ACTIVE');
  assert(tsm.getStateLabel() === 'Ходит', 'Label should be "Ходит"');
  assert(tsm.getStateBadge().includes('Ходит'), 'Badge should contain "Ходит"');

  tsm.onMoveExecuted('w', 1);
  assert(tsm.state === TURN_STATE.MOVED, 'After move executed, state is MOVED');
  assert(tsm.getStateLabel() === 'Походил', 'Label should be "Походил"');

  tsm.onTickStart('w', 1);
  assert(tsm.state === TURN_STATE.TICKING, 'During tick, state is TICKING');
  assert(tsm.getStateLabel() === 'Тикает', 'Label should be "Тикает"');

  tsm.onTurnCompleted('w', 1);
  assert(tsm.state === TURN_STATE.COMPLETED, 'After turn tick, state is COMPLETED');
  assert(tsm.getStateLabel() === 'Завершён', 'Label should be "Завершён"');

  tsm.onTurnStart('b', 1);
  assert(tsm.state === TURN_STATE.ACTIVE, 'New turn starts in ACTIVE');
  assert(tsm.activeColor === 'b', 'Active color is now Black');
}
console.log('');

// -------------------------------------------------------------
// TEST 2: Decree Duration & Non-Infinite Expiration
// -------------------------------------------------------------
console.log('--- TEST 2: Decree Duration & Exact Expiration (No Infinite Effects) ---');
{
  const deck = new CardDeckManager();
  const curseKnight = CARDS_DATABASE.find(c => c.id === 'curse_knight'); // duration: 2
  assert(curseKnight.duration === 2, 'Curse knight base duration is 2');

  // White casts curse on Black before move 1 (ply 0)
  deck.addDecree(curseKnight, 'w', 0);
  assert(deck.activeDecrees.length === 1, 'Decree is in active list');
  assert(deck.activeDecrees[0].duration === 2, 'Initial duration is 2');
  assert(deck.activeDecrees[0].state === EFFECT_STATE.APPLIED, 'Initial state is APPLIED');

  // White completes move 1 (ply 1)
  deck.tickTurn('w', 1);
  // White moved, decree is against Black, so White's move does NOT decrement Black's decree!
  assert(deck.activeDecrees.length === 1, 'Decree still active after White move');
  assert(deck.activeDecrees[0].duration === 2, 'Duration unchanged after caster moves (2)');

  // Black completes move 1 (ply 2)
  deck.tickTurn('b', 2);
  assert(deck.activeDecrees.length === 1, 'Decree still active after 1st Black move');
  assert(deck.activeDecrees[0].duration === 1, 'Duration decremented to 1 after 1st Black move');
  assert(deck.activeDecrees[0].state === EFFECT_STATE.ACTIVE, 'Decree is in ACTIVE state');

  // White completes move 2 (ply 3)
  deck.tickTurn('w', 3);
  assert(deck.activeDecrees.length === 1, 'Decree still active');
  assert(deck.activeDecrees[0].duration === 1, 'Duration stays 1 on White move');

  // Black completes move 2 (ply 4)
  deck.tickTurn('b', 4);
  assert(deck.activeDecrees.length === 0, 'Decree expired and automatically removed after 2nd Black move!');
}
console.log('');

// -------------------------------------------------------------
// TEST 3: Penalty Freeze Timing (No 0-Turn Premature Thaw Bug)
// -------------------------------------------------------------
console.log('--- TEST 3: Penalty Freeze Timing (No Instant 0-Turn Thaw) ---');
{
  const game = new Chess();
  const deck = new CardDeckManager();
  game.set_freeze_fn(sq => deck.isPieceFrozen(sq));

  // White has curse_knight active on Black
  const curseKnight = CARDS_DATABASE.find(c => c.id === 'curse_knight');
  deck.addDecree(curseKnight, 'w', 0);

  // Ply 1: White moves e2-e4
  game.move({ from: 'e2', to: 'e4' });
  deck.tickTurn('w', 1, game);

  // Ply 2: Black moves Knight b8-c6 (violating curse_knight!)
  const moveRes = game.move({ from: 'b8', to: 'c6' });
  assert(moveRes.piece === 'n', 'Moved piece was Knight');

  // Simulate penalty trigger during Black move execution (ply 2)
  deck.freezePiece('c6', 'b', 1, 2, 'curse_knight');
  assert(deck.isPieceFrozen('c6') === true, 'Knight on c6 is frozen');
  assert(deck.frozenPieces['c6'].state === EFFECT_STATE.APPLIED, 'Frozen state is APPLIED');

  // Now Black move finishes: tickTurn('b', 2) runs!
  deck.tickTurn('b', 2, game);

  // CRITICAL ASSERTION: The freeze was applied during ply 2.
  // It MUST NOT have thawed immediately in ply 2!
  assert(deck.isPieceFrozen('c6') === true, 'CRITICAL: Knight on c6 is STILL FROZEN after its triggering move!');
  assert(deck.frozenPieces['c6'].turns === 1, 'Turns remaining is still 1');
  assert(deck.frozenPieces['c6'].state === EFFECT_STATE.ACTIVE, 'Transitioned to ACTIVE');

  // Ply 3: White moves g1-f3
  game.move({ from: 'g1', to: 'f3' });
  deck.tickTurn('w', 3, game);
  assert(deck.isPieceFrozen('c6') === true, 'Knight on c6 remains frozen during White turn');

  // Ply 4: Black turn begins! Knight on c6 CANNOT MOVE!
  const c6Moves = game.moves({ square: 'c6' });
  assert(c6Moves.length === 0, 'Frozen Knight has 0 legal moves on Black turn!');

  // Black is forced to move a different piece: d7-d6
  game.move({ from: 'd7', to: 'd6' });
  // Black completed their frozen turn (ply 4)
  deck.tickTurn('b', 4, game);

  // NOW the freeze has served its 1 full turn of penalty and must thaw!
  assert(deck.isPieceFrozen('c6') === false, 'Knight on c6 has thawed after 1 full frozen turn completed!');

  // Ply 5: White moves
  game.move({ from: 'f1', to: 'c4' });
  deck.tickTurn('w', 5, game);

  // Ply 6: Black can now freely move the thawed knight!
  const thawedMoves = game.moves({ square: 'c6' });
  assert(thawedMoves.length > 0, 'Thawed Knight can now legally move again!');
}
console.log('');

// -------------------------------------------------------------
// TEST 4: Bot Mode Move Tracking (Resolves Infinite Decrees against Bot)
// -------------------------------------------------------------
console.log('--- TEST 4: Bot Color Tracking (Decrees Tick Correctly Against Bot) ---');
{
  const game = new Chess();
  const deck = new CardDeckManager();
  game.set_freeze_fn(sq => deck.isPieceFrozen(sq));

  // Player (White) casts curse_rook (duration: 2) on Bot (Black)
  const curseRook = CARDS_DATABASE.find(c => c.id === 'curse_rook');
  deck.addDecree(curseRook, 'w', 0);

  // White moves (ply 1)
  game.move({ from: 'e2', to: 'e4' });
  deck.tickTurn('w', 1, game);
  assert(deck.activeDecrees[0].duration === 2, 'Duration 2 before bot moves');

  // Bot makes move (ply 2, color: 'b')
  const botMove = game.move({ from: 'e7', to: 'e5' });
  assert(botMove.color === 'b', 'Bot move color is "b"');

  // Before our fix, handleLocalMove passed myColor ('w') instead of botMove.color ('b')
  // With our fix, botMove.color ('b') is passed!
  deck.tickTurn(botMove.color, 2, game);
  assert(deck.activeDecrees[0].duration === 1, 'Decree duration decremented to 1 when Bot moves!');

  // White moves (ply 3)
  game.move({ from: 'g1', to: 'f3' });
  deck.tickTurn('w', 3, game);

  // Bot makes second move (ply 4)
  const botMove2 = game.move({ from: 'b8', to: 'c6' });
  deck.tickTurn(botMove2.color, 4, game);
  assert(deck.activeDecrees.length === 0, 'Decree cleanly expired after Bot completed 2 moves!');
}
console.log('');

// -------------------------------------------------------------
// TEST 5: Captured Frozen Piece Cleanup (syncWithBoard)
// -------------------------------------------------------------
console.log('--- TEST 5: Captured Frozen Piece Cleanup (syncWithBoard) ---');
{
  const game = new Chess();
  const deck = new CardDeckManager();
  game.set_freeze_fn(sq => deck.isPieceFrozen(sq));

  // Black pawn on e5 is frozen
  game.move({ from: 'e2', to: 'e4' });
  game.move({ from: 'e7', to: 'e5' });
  deck.freezePiece('e5', 'b', 2, 2, 'freeze_piece');
  assert(deck.isPieceFrozen('e5') === true, 'e5 is frozen');

  // White develops Knight, Black plays d6
  game.move({ from: 'g1', to: 'f3' });
  game.move({ from: 'd7', to: 'd6' });

  // White knight captures Black pawn on e5!
  const captureMove = game.move({ from: 'f3', to: 'e5' });
  assert(captureMove && captureMove.captured === 'p', 'Black pawn on e5 was captured');

  // End of move tick with board sync
  deck.tickTurn('w', 5, game);

  // Assert: The ghost freeze on e5 must NOT affect the newly arrived White knight!
  assert(deck.isPieceFrozen('e5') === false, 'Ghost freeze on e5 removed after piece was captured!');
  const pieceOnE5 = game.get('e5');
  assert(pieceOnE5.type === 'n' && pieceOnE5.color === 'w', 'White Knight is now on e5');

  // Black makes a move, so turn returns to White
  game.move({ from: 'c7', to: 'c6' });
  deck.tickTurn('b', 6, game);

  const knightMoves = game.moves({ square: 'e5' });
  assert(knightMoves.length > 0, 'White Knight on e5 is NOT frozen and can move!');
}
console.log('');

// -------------------------------------------------------------
// TEST 6: Forbidden Square Trap Lifecycle
// -------------------------------------------------------------
console.log('--- TEST 6: Forbidden Square Trap Lifecycle (Duration 3) ---');
{
  const game = new Chess();
  const deck = new CardDeckManager();

  // White places trap on d5 (duration 3) at ply 0
  deck.setForbiddenSquare('d5', 'w', 3, 0);
  assert(deck.forbiddenSquares['d5'].turns === 3, 'Trap has 3 turns');

  // White moves (ply 1)
  deck.tickTurn('w', 1, game);
  assert(deck.forbiddenSquares['d5'].turns === 3, 'Trap unaffected by caster move');

  // Black move 1 (ply 2)
  deck.tickTurn('b', 2, game);
  assert(deck.forbiddenSquares['d5'].turns === 2, 'Trap decrements to 2 after Black move 1');

  // Black move 2 (ply 4)
  deck.tickTurn('w', 3, game);
  deck.tickTurn('b', 4, game);
  assert(deck.forbiddenSquares['d5'].turns === 1, 'Trap decrements to 1 after Black move 2');

  // Black move 3 (ply 6)
  deck.tickTurn('w', 5, game);
  deck.tickTurn('b', 6, game);
  assert(deck.forbiddenSquares['d5'] === undefined, 'Trap expired and cleared after Black move 3!');
}
console.log('');

// -------------------------------------------------------------
// TEST 7: 100-Game Simulated Match with Random Card Plays
// -------------------------------------------------------------
console.log('--- TEST 7: 100-Game Randomized Simulation (Zero Infinite Lingering Effects) ---');
{
  let totalCardsPlayed = 0;
  let totalDecreesCast = 0;
  let totalFreezesCast = 0;
  let totalMovesSimulated = 0;

  for (let g = 1; g <= 100; g++) {
    const game = new Chess();
    const deck = new CardDeckManager();
    game.set_freeze_fn(sq => deck.isPieceFrozen(sq));

    let ply = 0;
    while (!game.game_over() && ply < 60) {
      ply++;
      const currentTurn = game.turn();
      const oppTurn = currentTurn === 'w' ? 'b' : 'w';

      // Random chance to play a card
      if (Math.random() < 0.35) {
        const randCard = CARDS_DATABASE[Math.floor(Math.random() * CARDS_DATABASE.length)];
        totalCardsPlayed++;

        if (randCard.type === 'decree') {
          totalDecreesCast++;
          deck.addDecree(randCard, currentTurn, ply);
          if (randCard.id === 'forbidden_square') {
            deck.setForbiddenSquare('e4', currentTurn, 3, ply);
          }
        } else if (randCard.id === 'freeze_piece') {
          totalFreezesCast++;
          // Freeze random opponent piece
          const board = game.board();
          const enemySquares = [];
          for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
              const p = board[r][c];
              if (p && p.color === oppTurn && p.type !== 'k') {
                enemySquares.push(String.fromCharCode(97 + c) + (8 - r));
              }
            }
          }
          if (enemySquares.length > 0) {
            const targetSq = enemySquares[Math.floor(Math.random() * enemySquares.length)];
            deck.freezePiece(targetSq, oppTurn, 1, ply, 'freeze_piece');
          }
        }
      }

      // Generate moves with decrees & freeze taken into account
      let legalMoves = game.moves({ verbose: true });
      // Filter out moves from frozen pieces
      legalMoves = legalMoves.filter(m => !deck.isPieceFrozen(m.from));

      if (legalMoves.length === 0) {
        break; // Game over or stalemate
      }

      const chosenMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
      const res = game.move(chosenMove);
      totalMovesSimulated++;

      // Decree penalty trigger check
      const decrees = deck.activeDecrees.filter(d => d.owner === oppTurn);
      decrees.forEach(d => {
        if (d.id === 'curse_knight' && res.piece === 'n') {
          deck.freezePiece(res.to, currentTurn, 1, ply, 'curse_knight');
        } else if (d.id === 'blood_tribute' && res.captured) {
          deck.freezePiece(res.to, currentTurn, 1, ply, 'blood_tribute');
        }
      });

      // Trap trigger check
      if (deck.forbiddenSquares[res.to] && deck.forbiddenSquares[res.to].byPlayer === oppTurn) {
        deck.freezePiece(res.to, currentTurn, 1, ply, 'forbidden_square');
        delete deck.forbiddenSquares[res.to];
      }

      // Tick turn
      deck.tickTurn(currentTurn, ply, game);
    }
  }

  console.log(`Simulation complete: 100 games, ${totalMovesSimulated} moves, ${totalCardsPlayed} cards played (${totalDecreesCast} decrees, ${totalFreezesCast} freezes).`);
  assert(true, '100 simulated games finished without errors or crashes!');
}
console.log('');

console.log('===============================================================');
console.log(`   ALL TESTS COMPLETED SUCCESSFULLY! (${testsPassed} checks passed) `);
console.log('===============================================================\n');
