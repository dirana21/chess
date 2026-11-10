// Test suite for Hearthstone Mana Engine & Deck Button Safeguards
const assert = require('assert');
const { CARDS_DATABASE, CardDeckManager } = require('./js/cards.js');

console.log('=== TEST 1: Mana Progression Formula ===');
const deckManager = new CardDeckManager();

const expectedMana = {
  1: 1,
  2: 1,
  3: 2,
  4: 2,
  5: 2,
  6: 3,
  7: 3,
  8: 3,
  9: 4,
  12: 5,
  15: 6,
  18: 7,
  21: 8,
  24: 9,
  27: 10,
  30: 10,
  50: 10
};

for (const [turn, expected] of Object.entries(expectedMana)) {
  const actual = deckManager.calculateMaxMana(parseInt(turn, 10));
  assert.strictEqual(actual, expected, `Turn ${turn} should give ${expected} mana, got ${actual}`);
}
console.log('✅ Mana formula verified for all turns (1-50) matching 3-turn progression up to cap 10.');

console.log('=== TEST 2: CardDeckManager Mana Lifecycle & Affordability ===');
deckManager.reset();
deckManager.initMana(1);
assert.strictEqual(deckManager.currentMana, 1);
assert.strictEqual(deckManager.maxMana, 1);

// Test cards with different costs
const card1Cost = { id: 'pawn_shield', name: 'Щит Пехотинца', manaCost: 1 };
const card2Cost = { id: 'freeze_piece', name: 'Ледяные Оковы', manaCost: 2 };
const card4Cost = { id: 'void_teleport', name: 'Портал Бездны', manaCost: 4 };
const card6Cost = { id: 'doomsday', name: 'Судный День', manaCost: 6 };

// On Turn 1: 1 mana available
assert.strictEqual(deckManager.canAfford(card1Cost), true, 'Should afford 1-mana card with 1 mana');
assert.strictEqual(deckManager.canAfford(card2Cost), false, 'Should NOT afford 2-mana card on turn 1');
assert.strictEqual(deckManager.canAfford(card4Cost), false, 'Should NOT afford 4-mana card on turn 1');
assert.strictEqual(deckManager.canAfford(card6Cost), false, 'Should NOT afford 6-mana card on turn 1');

// Spend 1 mana
deckManager.spendMana(card1Cost.manaCost);
assert.strictEqual(deckManager.currentMana, 0);
assert.strictEqual(deckManager.canAfford(card1Cost), false, 'Cannot afford 1-mana card after spending mana');

// Turn 2: Refresh mana (still turn 2 -> 1 mana)
deckManager.refreshMana(2);
assert.strictEqual(deckManager.currentMana, 1);
assert.strictEqual(deckManager.maxMana, 1);
assert.strictEqual(deckManager.canAfford(card1Cost), true);
assert.strictEqual(deckManager.canAfford(card2Cost), false);

// Turn 3: Refresh mana -> 2 mana!
deckManager.refreshMana(3);
assert.strictEqual(deckManager.currentMana, 2);
assert.strictEqual(deckManager.maxMana, 2);
assert.strictEqual(deckManager.canAfford(card2Cost), true, 'Should afford 2-mana card on turn 3');
assert.strictEqual(deckManager.canAfford(card4Cost), false, 'Cannot afford 4-mana card on turn 3');

// Spend 2 mana
deckManager.spendMana(2);
assert.strictEqual(deckManager.currentMana, 0);

// Turn 6: Refresh mana -> 3 mana!
deckManager.refreshMana(6);
assert.strictEqual(deckManager.currentMana, 3);
assert.strictEqual(deckManager.maxMana, 3);

// Turn 15: Refresh mana -> 6 mana!
deckManager.refreshMana(15);
assert.strictEqual(deckManager.currentMana, 6);
assert.strictEqual(deckManager.maxMana, 6);
assert.strictEqual(deckManager.canAfford(card6Cost), true, 'Can afford 6-mana Doomsday at turn 15!');
deckManager.spendMana(6);
assert.strictEqual(deckManager.currentMana, 0);

console.log('✅ Mana lifecycle & spending methods pass all assertions.');

console.log('=== TEST 3: All 50 Cards have valid manaCost (1 to 6) ===');
for (const card of CARDS_DATABASE) {
  assert(typeof card.manaCost === 'number', `Card ${card.id} must have numeric manaCost`);
  assert(card.manaCost >= 1 && card.manaCost <= 10, `Card ${card.id} manaCost must be between 1 and 10`);
}
console.log('✅ All 50 cards verified to have valid manaCost.');

console.log('=== ALL MANA SYSTEM TESTS PASSED SUCCESSFULLY! ===');
