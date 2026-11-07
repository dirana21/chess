const { Chess } = require('./js/chess.js');

global.window = {};
require('./js/cards.js');
const CardDeckManager = window.CardDeckManager;
const CARDS_DATABASE = window.CARDS_DATABASE;

console.log('--- Starting 500-Game Comprehensive Test Suite ---');

const results = {
  totalGames: 500,
  completedGames: 0,
  checkmates: 0,
  stalemates: 0,
  timeouts: 0,
  totalMoves: 0,
  cardsPlayed: 0,
  cardCounts: {},
  decreeTriggers: 0,
  shadowSwaps: 0,
  freezes: 0,
  reinforcements: 0,
  infantryMarches: 0,
  smokeScreens: 0,
  kingsShields: 0,
  divineStorms: 0,
  alchemistGolds: 0,
  timeWarps: 0,
  errors: []
};

CARDS_DATABASE.forEach(c => results.cardCounts[c.id] = 0);

for (let g = 1; g <= 500; g++) {
  const game = new Chess();
  const deckW = new CardDeckManager();
  const deckB = new CardDeckManager();
  deckW.drawCard(); deckW.drawCard();
  deckB.drawCard(); deckB.drawCard();
  game.set_freeze_fn((sq) => deckW.isPieceFrozen(sq) || deckB.isPieceFrozen(sq));

  let moves = 0;
  while (!game.game_over() && moves < 100) {
    const turn = game.turn();
    const myDeck = turn === 'w' ? deckW : deckB;
    const oppDeck = turn === 'w' ? deckB : deckW;

    // Simulate card play (50% chance if cards in hand)
    if (myDeck.hand.length > 0 && Math.random() < 0.5) {
      const card = myDeck.hand[Math.floor(Math.random() * myDeck.hand.length)];
      myDeck.removeCard(card.instanceId);
      results.cardsPlayed++;
      results.cardCounts[card.id] = (results.cardCounts[card.id] || 0) + 1;

      if (card.type === 'decree') {
        myDeck.addDecree(card, turn);
        if (card.id === 'forbidden_square') {
          const sqs = ['d4', 'e4', 'd5', 'e5', 'c4', 'f4'];
          const empty = sqs.find(s => !game.get(s));
          if (empty) {
            myDeck.forbiddenSquares[empty] = { turns: 3, byPlayer: turn };
          }
        }
      } else {
        switch (card.id) {
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
              if (isPawnOnBackRank) {
                game.put({ type: 'n', color: turn }, kSq);
              } else {
                game.put(pp, kSq);
              }
              game.load(game.fen());
              results.shadowSwaps++;
            }
            break;
          }
          case 'freeze_piece': {
            const b = game.board();
            for (let r = 0; r < 8; r++) {
              for (let c = 0; c < 8; c++) {
                const p = b[r][c];
                if (p && p.color !== turn && p.type !== 'k') {
                  const sq = String.fromCharCode(97 + c) + (8 - r);
                  oppDeck.freezePiece(sq, p.color, 1);
                  results.freezes++;
                  break;
                }
              }
            }
            break;
          }
          case 'reinforcements': {
            const ranks = turn === 'w' ? [1, 2] : [7, 8];
            for (const r of ranks) {
              let placed = false;
              for (let c = 0; c < 8; c++) {
                const sq = String.fromCharCode(97 + c) + r;
                if (!game.get(sq)) {
                  game.put({ type: 'p', color: turn }, sq);
                  game.load(game.fen());
                  results.reinforcements++;
                  placed = true;
                  break;
                }
              }
              if (placed) break;
            }
            break;
          }
          case 'infantry_march': {
            const b = game.board();
            let pSq = null;
            for (let r = 0; r < 8; r++) {
              for (let c = 0; c < 8; c++) {
                const p = b[r][c];
                if (p && p.color === turn && p.type === 'p') {
                  const forwardRank = turn === 'w' ? (8 - r) + 1 : (8 - r) - 1;
                  if (forwardRank >= 1 && forwardRank <= 8) {
                    const fwdSq = String.fromCharCode(97 + c) + forwardRank;
                    if (!game.get(fwdSq)) {
                      pSq = String.fromCharCode(97 + c) + (8 - r);
                      const isPromo = (turn === 'w' && forwardRank === 8) || (turn === 'b' && forwardRank === 1);
                      game.remove(pSq);
                      game.put({ type: isPromo ? 'q' : 'p', color: turn }, fwdSq);
                      game.load(game.fen());
                      results.infantryMarches++;
                      break;
                    }
                  }
                }
              }
              if (pSq) break;
            }
            break;
          }
          case 'smoke_screen': {
            myDeck.smokeArea = { squares: ['d4', 'd5', 'e4', 'e5'], turns: 2 };
            results.smokeScreens++;
            break;
          }
          case 'kings_shield': {
            myDeck.kingsShield[turn] = 2;
            results.kingsShields++;
            break;
          }
          case 'alchemist_gold': {
            myDeck.drawCard();
            myDeck.drawCard();
            results.alchemistGolds++;
            break;
          }
          case 'time_warp': {
            results.timeWarps++;
            break;
          }
          case 'divine_storm': {
            const oppColor = turn === 'w' ? 'b' : 'w';
            const b = game.board();
            for (let r = 0; r < 8; r++) {
              for (let c = 0; c < 8; c++) {
                const p = b[r][c];
                if (p && p.color === oppColor && (p.type === 'n' || p.type === 'b')) {
                  const sq = String.fromCharCode(97 + c) + (8 - r);
                  oppDeck.freezePiece(sq, oppColor, 1);
                  results.divineStorms++;
                }
              }
            }
            break;
          }
        }
      }
    }

    // Move execution
    const allMoves = game.moves({ verbose: true });
    if (allMoves.length === 0) break;

    // Filter restricted moves
    let playable = allMoves.filter(m => !myDeck.isPieceFrozen(m.from));

    // Blind Bishop decree
    playable = playable.filter(m => {
      if (m.piece === 'b' && m.captured) {
        return !oppDeck.activeDecrees.some(d => d.id === 'curse_bishop' && d.owner !== turn);
      }
      return true;
    });

    // Heavy Queen decree
    playable = playable.filter(m => {
      if (m.piece === 'q') {
        const isHeavy = oppDeck.activeDecrees.some(d => d.id === 'queen_burden' && d.owner !== turn);
        if (isHeavy) {
          const fileDiff = Math.abs(m.from.charCodeAt(0) - m.to.charCodeAt(0));
          const rankDiff = Math.abs(parseInt(m.from[1], 10) - parseInt(m.to[1], 10));
          return fileDiff <= 2 && rankDiff <= 2;
        }
      }
      return true;
    });

    // Smoke Screen
    if (oppDeck.smokeArea) {
      playable = playable.filter(m => {
        if (m.captured && oppDeck.smokeArea.squares.includes(m.to)) return false;
        return true;
      });
    }

    if (playable.length === 0) {
      if (game.in_check()) results.checkmates++;
      else results.stalemates++;
      break;
    }

    // Pick random legal playable move
    const move = playable[Math.floor(Math.random() * playable.length)];
    const res = game.move(move);
    if (!res) {
      results.errors.push(`Game ${g}: Illegal move at move ${moves}`);
      break;
    }

    moves++;
    results.totalMoves++;

    // Decree triggers
    const oppDecrees = oppDeck.activeDecrees.filter(d => d.owner !== turn);
    oppDecrees.forEach(d => {
      if (d.id === 'curse_knight' && res.piece === 'n') {
        myDeck.freezePiece(res.to, turn, 1);
        results.decreeTriggers++;
      }
      if (d.id === 'curse_rook' && res.piece === 'r') {
        oppDeck.drawCard();
        results.decreeTriggers++;
      }
      if (d.id === 'tax_castle' && (res.flags.includes('k') || res.flags.includes('q'))) {
        myDeck.freezePiece(res.to, turn, 1);
        results.decreeTriggers++;
      }
      if (d.id === 'blood_tribute' && res.captured) {
        myDeck.freezePiece(res.to, turn, 1);
        results.decreeTriggers++;
      }
    });

    // Forbidden square check
    if (oppDeck.forbiddenSquares[res.to]) {
      myDeck.freezePiece(res.to, turn, 1);
      delete oppDeck.forbiddenSquares[res.to];
      results.decreeTriggers++;
    }

    // King's Shield retaliation
    if (game.in_check()) {
      const oppTurn = game.turn();
      if (oppDeck.kingsShield[oppTurn] > 0) {
        myDeck.freezePiece(res.to, turn, 1);
        results.freezes++;
      }
    }

    myDeck.tickTurn(game.turn());
    oppDeck.tickTurn(game.turn());

    if (moves % 6 === 0) {
      deckW.drawCard();
      deckB.drawCard();
    }
  }

  results.completedGames++;
  if (game.in_checkmate()) results.checkmates++;
  else if (game.in_draw()) results.stalemates++;
  else if (moves >= 100) results.timeouts++;

  if (g % 100 === 0) {
    console.log(`Progress: ${g}/500 games completed.`);
  }
}

console.log('\n========================================');
console.log('       500-GAME TEST SUITE REPORT       ');
console.log('========================================');
console.log(`Games Completed:      ${results.completedGames} / ${results.totalGames}`);
console.log(`Total Moves Made:     ${results.totalMoves} (avg ${Math.round(results.totalMoves / results.completedGames)} per game)`);
console.log(`Checkmates:           ${results.checkmates}`);
console.log(`Stalemates/Draws:     ${results.stalemates}`);
console.log(`Move Limit Draws:     ${results.timeouts}`);
console.log(`Total Cards Played:   ${results.cardsPlayed}`);
console.log(`Shadow Swaps:         ${results.shadowSwaps}`);
console.log(`Decree Triggers:      ${results.decreeTriggers}`);
console.log(`Freezes Applied:      ${results.freezes}`);
console.log(`Reinforcements:       ${results.reinforcements}`);
console.log(`Infantry Marches:     ${results.infantryMarches}`);
console.log(`Smoke Screens:        ${results.smokeScreens}`);
console.log(`Errors / Crashes:     ${results.errors.length}`);
console.log('========================================');
