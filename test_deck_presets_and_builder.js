const assert = require('assert');
const { CARDS_DATABASE, CardDeckManager } = require('./js/cards.js');
const { DEFAULT_DECK_PRESETS, DeckStorageManager } = require('./js/decks.js');
const { Chess } = require('./js/chess.js');

// Mock localStorage for Node environment
const mockStorage = {};
global.localStorage = {
  getItem: (k) => mockStorage[k] || null,
  setItem: (k, v) => { mockStorage[k] = String(v); },
  removeItem: (k) => { delete mockStorage[k]; }
};

console.log('=== TEST 1: Default Presets Validation ===');
const storage = new DeckStorageManager();
const decks = storage.getAllDecks();
assert.strictEqual(decks.length, 5, 'Should have 5 default presets');

decks.forEach(preset => {
  assert(preset.id, 'Preset must have an id');
  assert(preset.name, 'Preset must have a name');
  assert.strictEqual(preset.cards.length, 30, `${preset.name} must contain exactly 30 cards`);

  // Verify copy limits: max 2 for normal, max 1 for legendary
  const copies = {};
  preset.cards.forEach(id => {
    const card = CARDS_DATABASE.find(c => c.id === id);
    assert(card, `Card ${id} must exist in CARDS_DATABASE`);
    copies[id] = (copies[id] || 0) + 1;
    const limit = card.rarity === 'LEGENDARY' ? 1 : 2;
    assert(copies[id] <= limit, `${card.name} exceeded copy limit in ${preset.name}`);
  });
});
console.log('✅ All 5 default presets are 100% valid with 30 legal cards each.');

console.log('\n=== TEST 2: Active Preset Switching ===');
assert.strictEqual(storage.getActiveDeckId(), 'preset_balanced');
storage.setActiveDeckId('preset_frost');
assert.strictEqual(storage.getActiveDeckId(), 'preset_frost');
const activeFrost = storage.getActiveDeck();
assert.strictEqual(activeFrost.name, '❄️ Ледяной Контроль');
assert.strictEqual(activeFrost.cards.length, 30);
console.log('✅ Active preset switching works seamlessly.');

console.log('\n=== TEST 3: Custom Deck Creation, Customization & Limits ===');
const custom = storage.createDeck('Моя Смертельная Колода', 'preset_aggro');
assert(custom.id.startsWith('custom_'));
assert.strictEqual(custom.name, 'Моя Смертельная Колода');
assert.strictEqual(custom.cards.length, 30);

// Remove 1 card and add another
custom.cards.pop();
assert.strictEqual(custom.cards.length, 29);
custom.cards.push('blizzard'); // Legendary
storage.saveDeck(custom);

const retrieved = storage.getAllDecks().find(d => d.id === custom.id);
assert(retrieved, 'Custom deck should be persisted');
assert(retrieved.cards.includes('blizzard'), 'Custom deck should contain blizzard');

// Switch active deck to custom
storage.setActiveDeckId(custom.id);
assert.strictEqual(storage.getActiveDeckId(), custom.id);
console.log('✅ Custom deck created, modified and persisted.');

console.log('\n=== TEST 4: Gameplay with Custom Deck in CardDeckManager ===');
// Create a specialized custom 30-card deck made of 15 pairs of specific cards
const specializedDeckIds = [
  'freeze_piece', 'freeze_piece',
  'frostmourne', 'frostmourne',
  'chain_lightning', 'chain_lightning',
  'blizzard', // Legendary (1 copy)
  'shield_wall', 'shield_wall',
  'coronation', // Legendary (1 copy)
  'infantry_march', 'infantry_march',
  'arcane_intellect', 'arcane_intellect',
  'shadow_swap', 'shadow_swap',
  'curse_knight', 'curse_knight',
  'time_warp', 'time_warp',
  'divine_shield', 'divine_shield',
  'alchemist_gold', 'alchemist_gold',
  'mind_vision', 'mind_vision',
  'healing_prayer', 'healing_prayer',
  'holy_well', 'holy_well'
];
assert.strictEqual(specializedDeckIds.length, 30);

const customDeckManager = new CardDeckManager(specializedDeckIds);
assert.strictEqual(customDeckManager.masterDeck.length, 30);
assert.strictEqual(customDeckManager.drawPile.length, 30);

// Draw all 30 cards across multiple hands and ensure every single card drawn is from the custom deck!
const drawnCardIds = [];
while (drawnCardIds.length < 30) {
  while (customDeckManager.hand.length > 0) {
    customDeckManager.removeCard(customDeckManager.hand[0].instanceId);
  }
  const drawn = customDeckManager.drawCard();
  if (drawn) {
    drawnCardIds.push(drawn.id);
    assert(specializedDeckIds.includes(drawn.id), `Drawn card ${drawn.id} must belong to custom deck!`);
  }
}
assert.strictEqual(drawnCardIds.length, 30);
console.log('✅ CardDeckManager draws exclusively from player customized deck.');

console.log('\n=== TEST 5: Custom Deck Deletion & Fallback ===');
const deleted = storage.deleteDeck(custom.id);
assert.strictEqual(deleted, true);
assert.strictEqual(storage.getAllDecks().some(d => d.id === custom.id), false);
// Since custom was active, it should safely fall back to preset_balanced
assert.strictEqual(storage.getActiveDeckId(), 'preset_balanced');
console.log('✅ Custom deck deletion & safe active fallback verified.');

console.log('\nALL DECK PRESETS & BUILDER TESTS PASSED SUCCESSFULLY! 🚀');
