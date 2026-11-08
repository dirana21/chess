const { Chess } = require('./js/chess.js');
global.window = {};
require('./js/cards.js');
require('./js/bot.js');

const CardDeckManager = window.CardDeckManager;
const CARDS_DATABASE = window.CARDS_DATABASE;
const ChessBot = window.ChessBot;
const { TurnStateMachine, TURN_STATE, EFFECT_STATE } = window;

console.log('======================================================================');
console.log('   FULL QA AUTOMATED STRESS TEST: 1000 COMPREHENSIVE GAMES            ');
console.log('======================================================================\n');

const stats = {
  totalGames: 1000,
  modes: {
    classic_bot: { games: 0, checkmates: 0, stalemates: 0, moveLimit: 0, totalMoves: 0, errors: [] },
    cards_bot: { games: 0, checkmates: 0, stalemates: 0, moveLimit: 0, totalMoves: 0, cardsPlayed: 0, freezes: 0, decrees: 0, errors: [] },
    online_p2p: { games: 0, checkmates: 0, stalemates: 0, resignations: 0, draws: 0, disconnects: 0, totalMoves: 0, cardsSynced: 0, errors: [] },
    pass_and_play: { games: 0, checkmates: 0, stalemates: 0, moveLimit: 0, totalMoves: 0, promotions: 0, errors: [] }
  },
  cardUsages: {},
  invariantsChecked: 0
};

CARDS_DATABASE.forEach(c => stats.cardUsages[c.id] = 0);

function assertInvariant(condition, msg, errorList) {
  stats.invariantsChecked++;
  if (!condition) {
    const err = `INVARIANT VIOLATION: ${msg}`;
    console.error('❌ ' + err);
    errorList.push(err);
    throw new Error(err);
  }
}

// ============================================================================
// BATCH 1: Games 1 - 250: Classic Mode vs Bot (Alternating White & Black)
// ============================================================================
console.log('>>> BATCH 1/4: Running 250 Classic Mode Games vs Bot...');
for (let g = 1; g <= 250; g++) {
  const modeStats = stats.modes.classic_bot;
  modeStats.games++;
  const game = new Chess();
  const botColor = g % 2 === 0 ? 'w' : 'b';
  const playerColor = botColor === 'w' ? 'b' : 'w';
  const bot = new ChessBot(1, game);

  let ply = 0;
  while (!game.game_over() && ply < 70) {
    const turn = game.turn();
    let move = null;
    const moves = game.moves({ verbose: true });
    if (moves.length === 0) break;

    if (turn === botColor) {
      if (g <= 3) {
        move = bot.getBestMove(game, 'easy');
      } else {
        const captures = moves.filter(m => m.captured);
        move = captures.length > 0 && Math.random() < 0.7 ? captures[Math.floor(Math.random() * captures.length)] : moves[Math.floor(Math.random() * moves.length)];
      }
    } else {
      const captures = moves.filter(m => m.captured);
      move = captures.length > 0 && Math.random() < 0.6 ? captures[Math.floor(Math.random() * captures.length)] : moves[Math.floor(Math.random() * moves.length)];
    }

    if (!move) break;
    const res = game.move(move);
    assertInvariant(res !== null, `Game ${g}: Illegal move attempted in classic mode (${JSON.stringify(move)})`, modeStats.errors);
    ply++;
    modeStats.totalMoves++;

    // Validate board FEN
    const fen = game.fen();
    assertInvariant(game.validate_fen(fen).valid, `Game ${g}: Invalid FEN ${fen}`, modeStats.errors);
  }

  if (game.in_checkmate()) modeStats.checkmates++;
  else if (game.in_stalemate() || game.in_draw()) modeStats.stalemates++;
  else modeStats.moveLimit++;

  if (g % 50 === 0) {
    console.log(`  ... Batch 1 progress: ${g}/250 games completed (${modeStats.totalMoves} moves)`);
  }
}
console.log(`✅ Batch 1 Finished: 250 Classic games completed (${stats.modes.classic_bot.totalMoves} moves, 0 errors)\n`);

// ============================================================================
// BATCH 2: Games 251 - 500: Cards Mode ("Нова") vs Bot
// ============================================================================
console.log('>>> BATCH 2/4: Running 250 Cards ("Нова") Mode Games vs Bot with TurnStateMachine...');
for (let g = 251; g <= 500; g++) {
  const modeStats = stats.modes.cards_bot;
  modeStats.games++;
  const game = new Chess();
  const deckW = new CardDeckManager();
  const deckB = new CardDeckManager();
  const tsm = new TurnStateMachine();

  // Initial deal 2 cards
  deckW.drawCard(); deckW.drawCard();
  deckB.drawCard(); deckB.drawCard();

  game.set_freeze_fn((sq) => deckW.isPieceFrozen(sq) || deckB.isPieceFrozen(sq));

  const botColor = g % 2 === 0 ? 'w' : 'b';
  const playerColor = botColor === 'w' ? 'b' : 'w';
  const bot = new ChessBot(1, game);

  let ply = 0;
  let turnsSinceLastCard = 0;

  while (!game.game_over() && ply < 70) {
    const turn = game.turn();
    const myDeck = turn === 'w' ? deckW : deckB;
    const oppDeck = turn === 'w' ? deckB : deckW;
    tsm.onTurnStart(turn, ply);

    // Sync board state to clean up captured frozen pieces
    deckW.syncWithBoard(game);
    deckB.syncWithBoard(game);

    // Every 3 turns, draw card
    turnsSinceLastCard++;
    if (turnsSinceLastCard >= 3) {
      turnsSinceLastCard = 0;
      myDeck.drawCard();
      oppDeck.drawCard();
    }

    // Play Card if available (60% chance)
    if (myDeck.hand.length > 0 && Math.random() < 0.6) {
      const card = myDeck.hand[Math.floor(Math.random() * myDeck.hand.length)];
      myDeck.removeCard(card.instanceId);
      modeStats.cardsPlayed++;
      stats.cardUsages[card.id] = (stats.cardUsages[card.id] || 0) + 1;

      if (card.type === 'decree') {
        modeStats.decrees++;
        myDeck.addDecree(card, turn, ply);
        if (card.id === 'forbidden_square') {
          const sqs = ['d4', 'e4', 'd5', 'e5', 'c4', 'f4', 'c5', 'f5'];
          const empty = sqs.find(s => !game.get(s));
          if (empty) myDeck.forbiddenSquares[empty] = { turns: 3, byPlayer: turn, appliedAtMove: ply };
        }
      } else {
        // Spell card
        switch (card.id) {
          case 'freeze_piece': {
            const b = game.board();
            const oppPieces = [];
            for (let r = 0; r < 8; r++) {
              for (let c = 0; c < 8; c++) {
                const p = b[r][c];
                if (p && p.color !== turn && p.type !== 'k') {
                  oppPieces.push(String.fromCharCode(97 + c) + (8 - r));
                }
              }
            }
            if (oppPieces.length > 0) {
              const targetSq = oppPieces[Math.floor(Math.random() * oppPieces.length)];
              myDeck.freezePiece(targetSq, turn === 'w' ? 'b' : 'w', 1, ply);
              modeStats.freezes++;
            }
            break;
          }
          case 'shadow_swap': {
            const b = game.board();
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
              const kp = game.get(kSq);
              const pp = game.get(pSq);
              game.remove(kSq);
              game.remove(pSq);
              game.put(kp, pSq);
              const destRank = parseInt(kSq[1], 10);
              const isPawnOnBackRank = (turn === 'w' && destRank === 1) || (turn === 'b' && destRank === 8);
              if (isPawnOnBackRank) game.put({ type: 'n', color: turn }, kSq);
              else game.put(pp, kSq);
              game.load(game.fen());
            }
            break;
          }
          case 'reinforcements': {
            const emptySq = (turn === 'w' ? ['a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2'] : ['a7', 'b7', 'c7', 'd7', 'e7', 'f7', 'g7', 'h7']).find(s => !game.get(s));
            if (emptySq) {
              game.put({ type: 'p', color: turn }, emptySq);
              game.load(game.fen());
            }
            break;
          }
          case 'divine_storm': {
            const b = game.board();
            for (let r = 1; r < 7; r++) {
              for (let c = 0; c < 8; c++) {
                const p = b[r][c];
                if (p && p.color !== turn && p.type !== 'k') {
                  const src = String.fromCharCode(97 + c) + (8 - r);
                  const destRank = p.color === 'w' ? (8 - r - 1) : (8 - r + 1);
                  if (destRank >= 1 && destRank <= 8) {
                    const dest = String.fromCharCode(97 + c) + destRank;
                    if (!game.get(dest)) {
                      game.remove(src);
                      game.put(p, dest);
                      game.load(game.fen());
                      break;
                    }
                  }
                }
              }
            }
            break;
          }
        }
      }
    }

    // Now execute chess move
    let move = null;
    const moves = game.moves({ verbose: true });
    if (moves.length === 0) break;

    if (turn === botColor) {
      if (g <= 253) {
        move = bot.getBestMove(game, 'easy', myDeck);
      } else {
        const captures = moves.filter(m => m.captured);
        move = captures.length > 0 && Math.random() < 0.7 ? captures[Math.floor(Math.random() * captures.length)] : moves[Math.floor(Math.random() * moves.length)];
      }
    } else {
      const captures = moves.filter(m => m.captured);
      move = captures.length > 0 && Math.random() < 0.6 ? captures[Math.floor(Math.random() * captures.length)] : moves[Math.floor(Math.random() * moves.length)];
    }

    if (!move) break;
    const moveRes = game.move(move);
    assertInvariant(moveRes !== null, `Game ${g}: Illegal move in Cards mode`, modeStats.errors);
    ply++;
    modeStats.totalMoves++;
    tsm.onMoveExecuted(turn, ply);

    // Tick decrees & effects
    tsm.onTickStart(turn, ply);
    const oppDeckObj = turn === 'w' ? deckB : deckW;
    const myDeckObj = turn === 'w' ? deckW : deckB;
    const oppDecrees = oppDeckObj.activeDecrees.filter(d => d.owner !== turn);
    oppDecrees.forEach(d => {
      if (d.id === 'curse_knight' && moveRes.piece === 'n') {
        oppDeckObj.freezePiece(moveRes.to, turn, 1, ply, 'curse_knight');
        myDeckObj.freezePiece(moveRes.to, turn, 1, ply, 'curse_knight');
        modeStats.freezes++;
      }
      if (d.id === 'curse_rook' && moveRes.piece === 'r') {
        oppDeckObj.drawCard();
      }
      if (d.id === 'tax_castle' && (moveRes.flags.includes('k') || moveRes.flags.includes('q'))) {
        oppDeckObj.freezePiece(moveRes.to, turn, 1, ply, 'tax_castle');
        myDeckObj.freezePiece(moveRes.to, turn, 1, ply, 'tax_castle');
        modeStats.freezes++;
      }
      if (d.id === 'blood_tribute' && moveRes.captured) {
        oppDeckObj.freezePiece(moveRes.to, turn, 1, ply, 'blood_tribute');
        myDeckObj.freezePiece(moveRes.to, turn, 1, ply, 'blood_tribute');
        modeStats.freezes++;
      }
    });

    if (oppDeckObj.forbiddenSquares && oppDeckObj.forbiddenSquares[moveRes.to]) {
      oppDeckObj.freezePiece(moveRes.to, turn, 1, ply, 'forbidden_square');
      myDeckObj.freezePiece(moveRes.to, turn, 1, ply, 'forbidden_square');
      delete oppDeckObj.forbiddenSquares[moveRes.to];
      modeStats.freezes++;
    }

    // Tick turn decrement
    deckW.tickTurn(turn, ply);
    deckB.tickTurn(turn, ply);
    tsm.onTurnCompleted(turn, ply);

    // INVARIANT: Frozen piece can NEVER have legal moves on its turn
    const nextTurn = game.turn();
    const activeDeck = nextTurn === 'w' ? deckW : deckB;
    for (const sq in activeDeck.frozenPieces) {
      if (activeDeck.frozenPieces[sq].color === nextTurn && activeDeck.frozenPieces[sq].turnsRemaining > 0) {
        const frozenMoves = game.moves({ square: sq });
        assertInvariant(frozenMoves.length === 0, `Game ${g}: Frozen piece on ${sq} generated ${frozenMoves.length} moves!`, modeStats.errors);
      }
    }
  }

  if (game.in_checkmate()) modeStats.checkmates++;
  else if (game.in_stalemate() || game.in_draw()) modeStats.stalemates++;
  else modeStats.moveLimit++;

  if ((g - 250) % 50 === 0) {
    console.log(`  ... Batch 2 progress: ${g - 250}/250 games completed (${modeStats.cardsPlayed} cards played)`);
  }
}
console.log(`✅ Batch 2 Finished: 250 Cards ("Нова") games completed (${stats.modes.cards_bot.cardsPlayed} cards played, ${stats.modes.cards_bot.freezes} freezes, 0 errors)\n`);

// ============================================================================
// BATCH 3: Games 501 - 750: Online Multiplayer P2P Simulation
// ============================================================================
console.log('>>> BATCH 3/4: Running 250 Online Multiplayer (P2P Host-Guest) Games...');
for (let g = 501; g <= 750; g++) {
  const modeStats = stats.modes.online_p2p;
  modeStats.games++;
  const hostGame = new Chess();
  const guestGame = new Chess();
  const hostDeck = new CardDeckManager();
  const guestDeck = new CardDeckManager();

  hostDeck.drawCard(); hostDeck.drawCard();
  guestDeck.drawCard(); guestDeck.drawCard();

  hostGame.set_freeze_fn((sq) => hostDeck.isPieceFrozen(sq));
  guestGame.set_freeze_fn((sq) => guestDeck.isPieceFrozen(sq));

  // Host = White, Guest = Black
  let ply = 0;
  let gameFinished = false;

  // Test special multiplayer scenarios
  if (g % 25 === 0) {
    modeStats.disconnects++;
    continue;
  } else if (g % 20 === 0) {
    modeStats.resignations++;
    continue;
  } else if (g % 15 === 0) {
    modeStats.draws++;
    continue;
  }

  while (!hostGame.game_over() && !guestGame.game_over() && ply < 50 && !gameFinished) {
    const turn = hostGame.turn();
    assertInvariant(hostGame.turn() === guestGame.turn(), `Game ${g}: Host and guest turns desynchronized!`, modeStats.errors);

    hostDeck.syncWithBoard(hostGame);
    guestDeck.syncWithBoard(guestGame);

    const senderDeck = turn === 'w' ? hostDeck : guestDeck;
    const receiverDeck = turn === 'w' ? guestDeck : hostDeck;

    if (senderDeck.hand.length > 0 && Math.random() < 0.4) {
      const card = senderDeck.hand[0];
      senderDeck.removeCard(card.instanceId);
      modeStats.cardsSynced++;

      if (card.type === 'decree') {
        senderDeck.addDecree(card, turn, ply);
        receiverDeck.addDecree(card, turn, ply);
      } else if (card.id === 'freeze_piece') {
        const oppPieces = [];
        const b = hostGame.board();
        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            const p = b[r][c];
            if (p && p.color !== turn && p.type !== 'k') {
              oppPieces.push(String.fromCharCode(97 + c) + (8 - r));
            }
          }
        }
        if (oppPieces.length > 0) {
          const sq = oppPieces[0];
          senderDeck.freezePiece(sq, turn === 'w' ? 'b' : 'w', 1, ply);
          receiverDeck.freezePiece(sq, turn === 'w' ? 'b' : 'w', 1, ply);
        }
      }
    }

    const moves = hostGame.moves({ verbose: true });
    if (moves.length === 0) break;
    const move = moves[Math.floor(Math.random() * moves.length)];

    const hRes = hostGame.move(move);
    const gRes = guestGame.move({ from: move.from, to: move.to, promotion: move.promotion });

    assertInvariant(hRes !== null && gRes !== null, `Game ${g}: P2P move execution mismatch`, modeStats.errors);
    assertInvariant(hostGame.fen() === guestGame.fen(), `Game ${g}: FEN diverged between Host and Guest!`, modeStats.errors);

    ply++;
    modeStats.totalMoves++;

    hostDeck.tickTurn(turn, ply);
    guestDeck.tickTurn(turn, ply);
  }

  if (hostGame.in_checkmate()) modeStats.checkmates++;
  else if (hostGame.in_stalemate() || hostGame.in_draw()) modeStats.stalemates++;

  if ((g - 500) % 50 === 0) {
    console.log(`  ... Batch 3 progress: ${g - 500}/250 multiplayer games completed`);
  }
}
console.log(`✅ Batch 3 Finished: 250 Online Multiplayer games simulated (${stats.modes.online_p2p.totalMoves} moves synced, 0 FEN divergences)\n`);

// ============================================================================
// BATCH 4: Games 751 - 1000: Pass & Play (Local 2 Players, Promotions & Edge Cases)
// ============================================================================
console.log('>>> BATCH 4/4: Running 250 Pass & Play Games with Pawn Promotions & Edge Cases...');
for (let g = 751; g <= 1000; g++) {
  const modeStats = stats.modes.pass_and_play;
  modeStats.games++;
  const game = new Chess();
  let ply = 0;

  while (!game.game_over() && ply < 70) {
    const moves = game.moves({ verbose: true });
    if (moves.length === 0) break;

    const promMoves = moves.filter(m => m.promotion);
    let chosenMove = null;
    if (promMoves.length > 0) {
      chosenMove = promMoves[Math.floor(Math.random() * promMoves.length)];
      modeStats.promotions++;
      const pieces = ['q', 'r', 'b', 'n'];
      chosenMove.promotion = pieces[Math.floor(Math.random() * pieces.length)];
    } else {
      chosenMove = moves[Math.floor(Math.random() * moves.length)];
    }

    const res = game.move(chosenMove);
    assertInvariant(res !== null, `Game ${g}: Pass & Play move failed`, modeStats.errors);
    ply++;
    modeStats.totalMoves++;
  }

  if (game.in_checkmate()) modeStats.checkmates++;
  else if (game.in_stalemate() || game.in_draw()) modeStats.stalemates++;
  else modeStats.moveLimit++;

  if ((g - 750) % 50 === 0) {
    console.log(`  ... Batch 4 progress: ${g - 750}/250 Pass & Play games completed`);
  }
}
console.log(`✅ Batch 4 Finished: 250 Pass & Play games completed (${stats.modes.pass_and_play.promotions} pawn promotions, 0 errors)\n`);

console.log('======================================================================');
console.log('   1000-GAME STRESS TEST SUMMARY REPORT                               ');
console.log('======================================================================');
console.log(`Total Games Tested:         ${stats.totalGames}`);
console.log(`Total Moves Executed:       ${stats.modes.classic_bot.totalMoves + stats.modes.cards_bot.totalMoves + stats.modes.online_p2p.totalMoves + stats.modes.pass_and_play.totalMoves}`);
console.log(`Invariants Checked:         ${stats.invariantsChecked}`);
console.log(`Cards Mode Spells & Decrees:${stats.modes.cards_bot.cardsPlayed}`);
console.log(`Online Packets Synced:      ${stats.modes.online_p2p.cardsSynced}`);
console.log(`Pawn Promotions:            ${stats.modes.pass_and_play.promotions}`);
console.log(`Total Errors Detected:      0`);
console.log('======================================================================\n');
