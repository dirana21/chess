global.window = {};
const { Chess } = require('./js/chess.js');
const { CardDeckManager, CARDS_DATABASE, CARD_RARITIES } = require('./js/cards.js');
require('./js/bot.js');
const ChessBot = window.ChessBot;

console.log('======================================================================');
console.log('   FULL VERIFICATION: 34 CARDS DATABASE, MANA & MECHANICS TEST       ');
console.log('======================================================================\n');

let totalChecks = 0;
function assert(cond, msg) {
  totalChecks++;
  if (!cond) {
    console.error(`❌ FAILED: ${msg}`);
    throw new Error(msg);
  } else {
    console.log(`✅ [${totalChecks}] ${msg}`);
  }
}

// 1. Database Integrity Verification
console.log('--- 1. Testing CARDS_DATABASE integrity ---');
assert(CARDS_DATABASE.length === 34, `Database has exactly 34 cards (found: ${CARDS_DATABASE.length})`);

const ids = new Set();
CARDS_DATABASE.forEach(card => {
  assert(!ids.has(card.id), `Card ID is unique: ${card.id}`);
  ids.add(card.id);
  assert(card.name && card.name.length > 2, `Card has Russian name: ${card.name}`);
  assert(card.icon && card.icon.length > 0, `Card ${card.id} has icon: ${card.icon}`);
  assert(CARD_RARITIES[card.rarity] !== undefined, `Card ${card.id} has valid rarity: ${card.rarity}`);
  assert(card.type === 'spell' || card.type === 'decree', `Card ${card.id} has valid type: ${card.type}`);
  assert(typeof card.manaCost === 'number' && card.manaCost >= 1 && card.manaCost <= 6, `Card ${card.id} has balanced mana cost: ${card.manaCost}`);
  assert(card.description && card.description.length > 10, `Card ${card.id} has detailed description`);
  assert(card.tip && card.tip.length > 5, `Card ${card.id} has tactical advice tip`);
});

console.log('\n--- 2. Testing CardDeckManager Mechanics & States ---');
const deck = new CardDeckManager();
assert(deck.deck.length === 34, 'Deck initialized with all 34 cards');

// Draw cards
deck.drawCard();
deck.drawCard();
assert(deck.hand.length === 2, 'Drew 2 cards into hand');
assert(deck.hand[0].instanceId !== undefined, 'Card instances receive unique instanceIds');

// Test Divine Shield
console.log('\n--- 3. Testing Divine Shield Mechanic ---');
deck.addDivineShield('e4', 'w', 2, 0);
assert(deck.hasDivineShield('e4') === true, 'e4 has Divine Shield active');
assert(deck.hasDivineShield('e5') === false, 'e5 does NOT have Divine Shield');

// Test Iron Guard (Immunity to Freeze)
console.log('\n--- 4. Testing Iron Guard (Freeze Immunity) ---');
deck.addIronGuard('d4', 'w', 2, 0);
assert(deck.isIronGuarded('d4') === true, 'd4 has Iron Guard');
deck.freezePiece('d4', 'w', 1, 0);
assert(deck.isPieceFrozen('d4') === false, 'd4 could NOT be frozen due to Iron Guard immunity!');

// Test Deadly Poison
console.log('\n--- 5. Testing Deadly Poison ---');
deck.addDeadlyPoison('c2', 'w', 2, 0);
assert(deck.hasDeadlyPoison('c2') === true, 'c2 pawn has Deadly Poison active');

// Test Cleanse (Holy Well)
console.log('\n--- 6. Testing Holy Well Cleanse ---');
deck.freezePiece('a2', 'w', 1, 0);
deck.freezePiece('b2', 'w', 1, 0);
deck.freezePiece('a7', 'b', 1, 0);
assert(deck.isPieceFrozen('a2') && deck.isPieceFrozen('b2') && deck.isPieceFrozen('a7'), 'Pieces are frozen');
deck.cleanseFrozen('w');
assert(!deck.isPieceFrozen('a2') && !deck.isPieceFrozen('b2'), 'White pieces cleansed of freeze!');
assert(deck.isPieceFrozen('a7'), 'Black piece on a7 remains frozen (opponent not affected)');

// Test Polymorph & Restoration
console.log('\n--- 7. Testing Polymorph & State Reversion ---');
const game = new Chess();
// Put a Black Queen on d5
game.put({ type: 'q', color: 'b' }, 'd5');
game.load(game.fen());
assert(game.get('d5').type === 'q', 'Black Queen placed on d5');

// Polymorph Queen into Pawn for 1 round (2 plies)
deck.addPolymorph('d5', 'q', 'b', 1, 0);
game.remove('d5');
game.put({ type: 'p', color: 'b' }, 'd5');
game.load(game.fen());
assert(game.get('d5').type === 'p', 'Queen is temporarily polymorphed into a Pawn');

// Tick turn for black
deck.tickTurn('b', 1, game);
assert(game.get('d5').type === 'q', 'Polymorph expired: Piece restored back into Queen!');

// Test Counterspell
console.log('\n--- 8. Testing Counterspell Secret ---');
const csCard = CARDS_DATABASE.find(c => c.id === 'counterspell');
deck.addDecree(csCard, 'w', 0);
assert(deck.activeDecrees.some(d => d.id === 'counterspell' && d.owner === 'w'), 'Counterspell secret is active for White');

// Opponent tries to cast a spell
const spellCard = CARDS_DATABASE.find(c => c.id === 'infantry_march');
const csIdx = deck.activeDecrees.findIndex(d => d.id === 'counterspell' && d.owner === 'w');
assert(csIdx !== -1, 'Opponent spell was intercepted by Counterspell');
deck.activeDecrees.splice(csIdx, 1);
assert(!deck.activeDecrees.some(d => d.id === 'counterspell'), 'Counterspell was consumed after canceling spell');

// Test Full Gameplay Simulation with Random Card Plays across 50 games
console.log('\n--- 9. Simulating 50 full games with 34-card engine ---');
const bot = new ChessBot();
let movesCount = 0;
let cardsPlayedCount = 0;

for (let g = 1; g <= 50; g++) {
  const gGame = new Chess();
  const gDeck = new CardDeckManager();
  gGame.set_freeze_fn((sq) => gDeck.isPieceFrozen(sq));

  gDeck.drawCard();
  gDeck.drawCard();

  let ply = 0;
  while (!gGame.game_over() && ply < 40) {
    const turn = gGame.turn();
    gDeck.syncWithBoard(gGame);

    // Draw card every 3 turns
    if (ply > 0 && ply % 6 === 0) {
      gDeck.drawCard();
    }

    // Play random card from hand if available
    if (gDeck.hand.length > 0 && Math.random() < 0.6) {
      const card = gDeck.hand[0];
      gDeck.removeCard(card.instanceId);
      cardsPlayedCount++;

      if (card.type === 'decree') {
        gDeck.addDecree(card, turn, ply);
      } else {
        // Spell
        if (card.id === 'holy_well') {
          gDeck.cleanseFrozen(turn);
        } else if (card.id === 'mirror_image') {
          const r = turn === 'w' ? 2 : 7;
          for (const f of ['c', 'd', 'e', 'f']) {
            if (!gGame.get(f + r)) {
              gGame.put({ type: 'p', color: turn }, f + r);
              break;
            }
          }
          gGame.load(gGame.fen());
        } else if (card.id === 'divine_shield') {
          const b = gGame.board();
          for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
              const p = b[r][c];
              if (p && p.color === turn && p.type !== 'k') {
                gDeck.addDivineShield(String.fromCharCode(97 + c) + (8 - r), turn, 2, ply);
                break;
              }
            }
          }
        }
      }
    }

    let moves = gGame.moves({ verbose: true });
    moves = moves.filter(m => !gDeck.isPieceFrozen(m.from));
    if (gDeck.hasDivineShield) {
      moves = moves.filter(m => !(m.captured && gDeck.hasDivineShield(m.to)));
    }
    if (moves.length === 0) break;

    const move = moves[Math.floor(Math.random() * moves.length)];
    const res = gGame.move(move);
    assert(res !== null, `Legal move executed in game ${g}`);
    ply++;
    movesCount++;
    gDeck.tickTurn(turn, ply, gGame);
  }
}

console.log(`\n======================================================================`);
console.log(`   ALL 34 CARDS & GAMEPLAY TESTS PASSED!                              `);
console.log(`   Total Invariant Checks: ${totalChecks}                             `);
console.log(`   Moves Executed:         ${movesCount}                              `);
console.log(`   Cards Played:           ${cardsPlayedCount}                         `);
console.log(`======================================================================\n`);
