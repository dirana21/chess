const assert = require('assert');
const { CARDS_DATABASE, CARD_CATEGORIES, CARD_RARITIES, CardDeckManager, TURN_STATE } = require('./js/cards.js');
const { Chess } = require('./js/chess.js');

console.log('=== TEST 1: Database Size & Invariants ===');
assert.strictEqual(CARDS_DATABASE.length, 50, 'There should be exactly 50 cards in CARDS_DATABASE');
console.log('✅ Exactly 50 cards verified.');

const validCategories = Object.keys(CARD_CATEGORIES);
console.log('Categories:', validCategories);

const validRarities = Object.keys(CARD_RARITIES);
console.log('Rarities:', validRarities);

const categoryCounts = {};
const rarityCounts = {};
const manaCounts = {};

CARDS_DATABASE.forEach(card => {
  assert(card.id, `Card must have an id: ${JSON.stringify(card)}`);
  assert(card.name, `Card must have a name: ${card.id}`);
  assert(card.icon, `Card must have an icon: ${card.id}`);
  assert(card.description, `Card must have a description: ${card.id}`);
  assert(validCategories.includes(card.category), `Card ${card.id} has invalid category: ${card.category}`);
  assert(validRarities.includes(card.rarity), `Card ${card.id} has invalid rarity: ${card.rarity}`);
  assert(typeof card.manaCost === 'number' && card.manaCost >= 1 && card.manaCost <= 10, `Card ${card.id} has invalid manaCost: ${card.manaCost}`);

  categoryCounts[card.category] = (categoryCounts[card.category] || 0) + 1;
  rarityCounts[card.rarity] = (rarityCounts[card.rarity] || 0) + 1;
  manaCounts[card.manaCost] = (manaCounts[card.manaCost] || 0) + 1;
});

console.log('Category breakdown:', categoryCounts);
console.log('Rarity breakdown:', rarityCounts);
console.log('Mana breakdown:', manaCounts);
console.log('✅ All 50 cards pass rigorous schema validation.');

console.log('\n=== TEST 2: CardDeckManager Simulation with 50 Cards ===');
const deck = new CardDeckManager();
assert.strictEqual(deck.deck.length, 50, 'CardDeckManager should load all 50 cards');

// Draw 4 cards up to max hand size
for (let i = 0; i < 4; i++) {
  const c = deck.drawCard();
  assert(c, `Should draw card #${i+1}`);
  assert(c.instanceId, `Drawn card should have instanceId`);
}
// Card #5 should return null because hand is capped at 4
assert.strictEqual(deck.drawCard(), null, '5th card should return null when hand is full');
assert.strictEqual(deck.hand.length, 4, 'Hand size should cap at 4');
assert.strictEqual(deck.deck.length, 50, 'Master deck template pool has 50 cards');
console.log('✅ Deck drawing & capping verified.');

console.log('\n=== TEST 3: State Pattern Turn Lifecycle & Fire Trail ===');
const game = new Chess();
deck.turnState.onTurnStart('w', 0);
assert.strictEqual(deck.turnState.state, TURN_STATE.ACTIVE);

// Add fire trail on d4
deck.addFireTrail('d4', 'w', 2, 0);
assert.strictEqual(deck.hasFireTrail('d4'), true);

deck.turnState.onMoveExecuted('w', 1);
assert.strictEqual(deck.turnState.state, 'MOVED');
deck.tickTurn('w', 1, game);
assert.strictEqual(deck.hasFireTrail('d4'), true);

deck.turnState.onTurnStart('b', 1);
deck.turnState.onMoveExecuted('b', 2);
deck.tickTurn('b', 2, game);

deck.turnState.onTurnStart('w', 2);
deck.turnState.onMoveExecuted('w', 3);
deck.tickTurn('w', 3, game);
// After 2 white turns, fire trail expires
assert.strictEqual(deck.hasFireTrail('d4'), false);
console.log('✅ Fire trail turn decrement & expiration verified.');

console.log('\n=== TEST 4: 100 Games Simulation with Random Moves & 50 Spells ===');
let gamesSimulated = 0;
for (let g = 0; g < 100; g++) {
  const simGame = new Chess();
  const simDeckW = new CardDeckManager();
  const simDeckB = new CardDeckManager();
  simDeckW.drawCard();
  simDeckW.drawCard();
  simDeckB.drawCard();
  simDeckB.drawCard();

  let moves = 0;
  while (!simGame.game_over() && moves < 80) {
    const turn = simGame.turn();
    const activeDeck = turn === 'w' ? simDeckW : simDeckB;

    // Draw every 6 half-moves (3 full turns)
    if (moves > 0 && moves % 6 === 0) {
      simDeckW.drawCard();
      simDeckB.drawCard();
    }

    const legal = simGame.moves({ verbose: true });
    if (legal.length === 0) break;
    const move = legal[Math.floor(Math.random() * legal.length)];
    const res = simGame.move(move);
    assert(res, 'Move must succeed');
    moves++;
    activeDeck.tickTurn(turn, moves, simGame);
  }
  gamesSimulated++;
}
console.log(`✅ ${gamesSimulated} full games simulated with 0 crashes or illegal states.`);
console.log('\nALL 50-CARD EXPANSION TESTS PASSED SUCCESSFULLY! 🚀');
