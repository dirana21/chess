global.window = {};
const { Chess } = require('./js/chess.js');
const { CardDeckManager, CARDS_DATABASE } = require('./js/cards.js');
require('./js/decks.js');
require('./js/bot.js');

const ChessBot = window.ChessBot;
const DEFAULT_PRESETS = window.DEFAULT_DECK_PRESETS;

console.log('===============================================================');
console.log('       500 SIMULATED GAMES QA & BALANCE STRESS SUITE          ');
console.log('===============================================================\n');

const stats = {
  totalGames: 0,
  classicGames: 0,
  cardsGames: 0,
  errors: [],
  illegalMoves: 0,
  stuckGames: 0,
  outcomes: {
    whiteCheckmate: 0,
    blackCheckmate: 0,
    stalemate: 0,
    threefold: 0,
    fiftyMove: 0,
    insufficientMaterial: 0,
    maxTurnsReached: 0
  },
  presetWins: {
    'balanced': { games: 0, wins: 0, losses: 0, draws: 0 },
    'frost_control': { games: 0, wins: 0, losses: 0, draws: 0 },
    'assault_aggro': { games: 0, wins: 0, losses: 0, draws: 0 },
    'trap_master': { games: 0, wins: 0, losses: 0, draws: 0 },
    'grandmaster_tactics': { games: 0, wins: 0, losses: 0, draws: 0 },
    'random_custom': { games: 0, wins: 0, losses: 0, draws: 0 }
  },
  cardPlays: {},
  decreeExpirations: 0,
  deckRecycles: 0,
  totalMovesSum: 0
};

// Fast tactical evaluator: calculates static move score in microseconds
const PIECE_VALUES = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };

function getFastTacticalMove(game, deckManager) {
  let moves = game.moves({ verbose: true });
  if (moves.length === 0) return null;

  const turn = game.turn();
  // Filter card restrictions
  if (deckManager) {
    moves = moves.filter(m => !deckManager.isPieceFrozen(m.from));

    // Blind Bishop
    moves = moves.filter(m => {
      if (m.piece === 'b' && m.captured) {
        return !deckManager.activeDecrees.some(d => d.id === 'curse_bishop' && d.owner !== turn);
      }
      return true;
    });

    // Heavy Queen
    moves = moves.filter(m => {
      if (m.piece === 'q') {
        const isHeavy = deckManager.activeDecrees.some(d => d.id === 'queen_burden' && d.owner !== turn);
        if (isHeavy) {
          const fileDiff = Math.abs(m.from.charCodeAt(0) - m.to.charCodeAt(0));
          const rankDiff = Math.abs(parseInt(m.from[1], 10) - parseInt(m.to[1], 10));
          return fileDiff <= 2 && rankDiff <= 2;
        }
      }
      return true;
    });

    // Smoke
    if (deckManager.smokeArea) {
      moves = moves.filter(m => {
        if (m.captured && deckManager.smokeArea.squares.includes(m.to)) return false;
        return true;
      });
    }

    // Shield
    if (deckManager.hasDivineShield) {
      moves = moves.filter(m => {
        if (m.captured && deckManager.hasDivineShield(m.to)) return false;
        return true;
      });
    }
  }

  if (moves.length === 0) return null;

  // Score moves
  let bestScore = -Infinity;
  let bestMoves = [];

  for (const m of moves) {
    let score = Math.random() * 20; // tie breaker jitter

    if (m.captured) {
      const victimVal = PIECE_VALUES[m.captured] || 100;
      const attackerVal = PIECE_VALUES[m.piece] || 100;
      score += (victimVal * 10) - attackerVal;
    }

    if (m.promotion) {
      score += 800;
    }

    if (m.san.includes('+')) {
      score += 50;
    }

    // Center control bonus
    if (['d4', 'e4', 'd5', 'e5'].includes(m.to)) {
      score += 15;
    }

    if (score > bestScore) {
      bestScore = score;
      bestMoves = [m];
    } else if (Math.abs(score - bestScore) < 5) {
      bestMoves.push(m);
    }
  }

  return bestMoves[Math.floor(Math.random() * bestMoves.length)];
}

// Helper: play a card with game engine mutation
function executeCardEffect(card, game, casterColor, casterDeck, targetDeck, totalMoves) {
  const oppColor = casterColor === 'w' ? 'b' : 'w';
  stats.cardPlays[card.id] = (stats.cardPlays[card.id] || 0) + 1;

  // Check Counterspell / Reflect
  if (card.type !== 'decree') {
    const reflectIdx = casterDeck.activeDecrees.findIndex(d => d.id === 'spell_reflect' && d.owner !== casterColor);
    if (reflectIdx !== -1) {
      casterDeck.activeDecrees.splice(reflectIdx, 1);
      targetDeck.drawCard();
      return;
    }
    const csIdx = casterDeck.activeDecrees.findIndex(d => d.id === 'counterspell' && d.owner !== casterColor);
    if (csIdx !== -1) {
      casterDeck.activeDecrees.splice(csIdx, 1);
      return;
    }
  }

  // Handle Decrees
  if (card.type === 'decree') {
    casterDeck.addDecree(card, casterColor, totalMoves);
    if (card.id === 'forbidden_square') {
      const squares = ['d4', 'e4', 'd5', 'e5', 'c4', 'f4', 'c5', 'f5'];
      const targetSq = squares[Math.floor(Math.random() * squares.length)];
      casterDeck.setForbiddenSquare(targetSq, casterColor, card.duration || 3, totalMoves);
    }
    return;
  }

  // Handle Spells
  switch (card.id) {
    case 'freeze_pawn': {
      const board = game.board();
      const enemyPawns = [];
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const p = board[r][c];
          if (p && p.type === 'p' && p.color === oppColor) {
            enemyPawns.push('abcdefgh'[c] + (8 - r));
          }
        }
      }
      if (enemyPawns.length > 0) {
        const sq = enemyPawns[Math.floor(Math.random() * enemyPawns.length)];
        casterDeck.freezePiece(sq, oppColor, card.duration || 2, totalMoves, 'spell');
      }
      break;
    }
    case 'freeze_knight': {
      const board = game.board();
      const enemyKnights = [];
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const p = board[r][c];
          if (p && p.type === 'n' && p.color === oppColor) {
            enemyKnights.push('abcdefgh'[c] + (8 - r));
          }
        }
      }
      if (enemyKnights.length > 0) {
        const sq = enemyKnights[Math.floor(Math.random() * enemyKnights.length)];
        casterDeck.freezePiece(sq, oppColor, card.duration || 2, totalMoves, 'spell');
      }
      break;
    }
    case 'blizzard': {
      const squares = ['d4', 'e4', 'd5', 'e5'];
      for (const sq of squares) {
        casterDeck.freezePiece(sq, oppColor, 1, totalMoves, 'spell');
      }
      break;
    }
    case 'transmutation': {
      casterDeck.drawCard();
      casterDeck.drawCard();
      break;
    }
    case 'divine_shield': {
      const board = game.board();
      const myPieces = [];
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const p = board[r][c];
          if (p && p.color === casterColor && p.type !== 'k') {
            myPieces.push('abcdefgh'[c] + (8 - r));
          }
        }
      }
      if (myPieces.length > 0) {
        const sq = myPieces[Math.floor(Math.random() * myPieces.length)];
        casterDeck.addDivineShield(sq, casterColor, 2, totalMoves);
      }
      break;
    }
    case 'smoke_bomb': {
      casterDeck.setSmokeArea(['d4', 'e4', 'd5', 'e5'], 2, totalMoves);
      break;
    }
    case 'lightning_strike': {
      const board = game.board();
      const targets = [];
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const p = board[r][c];
          if (p && p.color === oppColor && (p.type === 'p' || p.type === 'n' || p.type === 'b')) {
            targets.push('abcdefgh'[c] + (8 - r));
          }
        }
      }
      if (targets.length > 0) {
        const sq = targets[Math.floor(Math.random() * targets.length)];
        game.remove(sq);
      }
      break;
    }
    default:
      break;
  }
}

function runSingleGame(gameIndex, mode = 'cards', whitePresetId = 'balanced', blackPresetId = 'frost_control') {
  stats.totalGames++;
  if (mode === 'classic') stats.classicGames++;
  else stats.cardsGames++;

  const game = new Chess();
  let deckW = null;
  let deckB = null;

  if (mode === 'cards') {
    const getCardsForPreset = (id) => {
      const p = DEFAULT_PRESETS.find(x => x.id === id);
      if (p) return [...p.cards];
      const allIds = CARDS_DATABASE.map(c => c.id);
      const res = [];
      while (res.length < 30) {
        res.push(allIds[Math.floor(Math.random() * allIds.length)]);
      }
      return res;
    };

    deckW = new CardDeckManager(getCardsForPreset(whitePresetId));
    deckB = new CardDeckManager(getCardsForPreset(blackPresetId));

    game.set_freeze_fn((sq) => {
      return (deckW && deckW.isPieceFrozen(sq)) || (deckB && deckB.isPieceFrozen(sq));
    });

    deckW.drawCard();
    deckW.drawCard();
    deckB.drawCard();
    deckB.drawCard();
  }

  let movesCount = 0;
  const MAX_MOVES = 120; // Realistic game length limit

  try {
    while (!game.game_over() && movesCount < MAX_MOVES) {
      const turn = game.turn();
      const currentDeck = turn === 'w' ? deckW : deckB;
      const targetDeck = turn === 'w' ? deckB : deckW;

      // Cards turn start lifecycle & card draw every 3 player moves
      if (mode === 'cards' && currentDeck) {
        currentDeck.turnState.onTurnStart(turn, movesCount);

        // Track expired decrees
        const initialDecrees = currentDeck.activeDecrees.length;
        currentDeck.activeDecrees = currentDeck.activeDecrees.filter(d => {
          if (d.owner === turn) {
            const passed = Math.floor((movesCount - (d.startMove || 0)) / 2);
            return passed < (d.duration || 3);
          }
          return true;
        });
        stats.decreeExpirations += (initialDecrees - currentDeck.activeDecrees.length);

        // Check if turn warrants card draw (every 3 turns)
        const playerMoves = Math.floor(movesCount / 2);
        if (playerMoves > 0 && playerMoves % 3 === 0 && currentDeck.hand.length < 4) {
          const prevDrawPileSize = currentDeck.drawPile.length;
          currentDeck.drawCard();
          if (prevDrawPileSize === 0) stats.deckRecycles++;
        }

        // AI plays card with 60% probability if hand not empty
        if (currentDeck.hand.length > 0 && Math.random() < 0.6) {
          const cardIdx = Math.floor(Math.random() * currentDeck.hand.length);
          const cardToPlay = currentDeck.hand[cardIdx];
          currentDeck.removeCard(cardToPlay.instanceId);
          executeCardEffect(cardToPlay, game, turn, currentDeck, targetDeck, movesCount);
        }
      }

      // Generate chess move
      const bestMove = getFastTacticalMove(game, currentDeck);
      if (!bestMove) {
        break;
      }

      const moveRes = game.move(bestMove);
      if (!moveRes) {
        stats.illegalMoves++;
        throw new Error(`Engine rejected move: ${JSON.stringify(bestMove)} at FEN: ${game.fen()}`);
      }

      movesCount++;
      stats.totalMovesSum++;
    }

    // Determine Outcome
    let winner = null;
    if (game.in_checkmate()) {
      if (game.turn() === 'b') {
        stats.outcomes.whiteCheckmate++;
        winner = 'w';
      } else {
        stats.outcomes.blackCheckmate++;
        winner = 'b';
      }
    } else if (game.in_stalemate()) {
      stats.outcomes.stalemate++;
    } else if (game.in_threefold_repetition()) {
      stats.outcomes.threefold++;
    } else if (game.insufficient_material()) {
      stats.outcomes.insufficientMaterial++;
    } else if (movesCount >= MAX_MOVES) {
      stats.outcomes.maxTurnsReached++;
    } else {
      stats.outcomes.fiftyMove++;
    }

    // Record Preset Stats if cards mode
    if (mode === 'cards') {
      const wKey = stats.presetWins[whitePresetId] ? whitePresetId : 'random_custom';
      const bKey = stats.presetWins[blackPresetId] ? blackPresetId : 'random_custom';

      stats.presetWins[wKey].games++;
      stats.presetWins[bKey].games++;

      if (winner === 'w') {
        stats.presetWins[wKey].wins++;
        stats.presetWins[bKey].losses++;
      } else if (winner === 'b') {
        stats.presetWins[bKey].wins++;
        stats.presetWins[wKey].losses++;
      } else {
        stats.presetWins[wKey].draws++;
        stats.presetWins[bKey].draws++;
      }
    }

  } catch (err) {
    stats.errors.push({ gameIndex, mode, error: err.message, stack: err.stack });
  }
}

// -------------------------------------------------------------
// EXECUTE 500 GAMES
// -------------------------------------------------------------
const presetIds = ['balanced', 'frost_control', 'assault_aggro', 'trap_master', 'grandmaster_tactics'];
const startTime = Date.now();

console.log('▶ Phase 1: 100 Classic Chess Games...');
for (let i = 1; i <= 100; i++) {
  runSingleGame(i, 'classic');
  if (i % 50 === 0) console.log(`  [Classic] ${i}/100 games completed (${((Date.now() - startTime)/1000).toFixed(1)}s)`);
}

console.log('\n▶ Phase 2: 350 Nova Cards Games (All Presets Round-Robin)...');
for (let i = 101; i <= 450; i++) {
  const pW = presetIds[(i - 101) % presetIds.length];
  const pB = presetIds[(i - 100) % presetIds.length];
  runSingleGame(i, 'cards', pW, pB);
  if ((i - 100) % 70 === 0) console.log(`  [Cards Round-Robin] ${i - 100}/350 games completed (${((Date.now() - startTime)/1000).toFixed(1)}s)`);
}

console.log('\n▶ Phase 3: 50 Custom & Stress Deck Games...');
for (let i = 451; i <= 500; i++) {
  const pW = Math.random() < 0.5 ? 'random_custom' : presetIds[i % presetIds.length];
  const pB = Math.random() < 0.5 ? 'random_custom' : presetIds[(i + 2) % presetIds.length];
  runSingleGame(i, 'cards', pW, pB);
  if ((i - 450) % 25 === 0) console.log(`  [Stress Decks] ${i - 450}/50 games completed (${((Date.now() - startTime)/1000).toFixed(1)}s)`);
}

const duration = ((Date.now() - startTime) / 1000).toFixed(2);

// -------------------------------------------------------------
// STATISTICAL REPORT
// -------------------------------------------------------------
console.log('\n===============================================================');
console.log(`         500 GAMES QA COMPLETE IN ${duration} SECONDS             `);
console.log('===============================================================');
console.log(`Total Games Simulated:   ${stats.totalGames}`);
console.log(`- Classic Mode Games:    ${stats.classicGames}`);
console.log(`- Nova (Cards) Games:    ${stats.cardsGames}`);
console.log(`Total Moves Executed:    ${stats.totalMovesSum} (Avg ${(stats.totalMovesSum / stats.totalGames).toFixed(1)} moves/game)`);
console.log(`Errors / Exceptions:     ${stats.errors.length}`);
console.log(`Illegal Moves Attempted: ${stats.illegalMoves}`);
console.log(`Card Plays Executed:     ${Object.values(stats.cardPlays).reduce((a, b) => a + b, 0)}`);
console.log(`Deck Recycles / Loops:   ${stats.deckRecycles}`);
console.log(`Decrees Expired Cleanly: ${stats.decreeExpirations}`);

console.log('\n--- Outcomes Breakdown ---');
console.log(`- White Checkmate:       ${stats.outcomes.whiteCheckmate} (${((stats.outcomes.whiteCheckmate / stats.totalGames) * 100).toFixed(1)}%)`);
console.log(`- Black Checkmate:       ${stats.outcomes.blackCheckmate} (${((stats.outcomes.blackCheckmate / stats.totalGames) * 100).toFixed(1)}%)`);
console.log(`- Stalemate:             ${stats.outcomes.stalemate} (${((stats.outcomes.stalemate / stats.totalGames) * 100).toFixed(1)}%)`);
console.log(`- Threefold Repetition:  ${stats.outcomes.threefold} (${((stats.outcomes.threefold / stats.totalGames) * 100).toFixed(1)}%)`);
console.log(`- 50-move Rule Draw:     ${stats.outcomes.fiftyMove} (${((stats.outcomes.fiftyMove / stats.totalGames) * 100).toFixed(1)}%)`);
console.log(`- Insufficient Material: ${stats.outcomes.insufficientMaterial} (${((stats.outcomes.insufficientMaterial / stats.totalGames) * 100).toFixed(1)}%)`);
console.log(`- Max Turns Safeguard:   ${stats.outcomes.maxTurnsReached} (${((stats.outcomes.maxTurnsReached / stats.totalGames) * 100).toFixed(1)}%)`);

console.log('\n--- Deck Presets Balance & Win Rates ---');
for (const [id, data] of Object.entries(stats.presetWins)) {
  if (data.games > 0) {
    const winRate = ((data.wins / data.games) * 100).toFixed(1);
    const lossRate = ((data.losses / data.games) * 100).toFixed(1);
    const drawRate = ((data.draws / data.games) * 100).toFixed(1);
    console.log(`* ${id.padEnd(20)}: ${String(data.games).padStart(3)} games | Wins: ${String(data.wins).padStart(3)} (${winRate.padStart(4)}%) | Losses: ${String(data.losses).padStart(3)} (${lossRate.padStart(4)}%) | Draws: ${String(data.draws).padStart(3)} (${drawRate.padStart(4)}%)`);
  }
}

if (stats.errors.length > 0) {
  console.log('\n❌ ERRORS DETECTED:');
  stats.errors.slice(0, 5).forEach(e => console.log(e));
  process.exit(1);
} else {
  console.log('\n✅ 0 ERRORS OR CRASHES ACROSS ALL 500 GAMES!');
}
