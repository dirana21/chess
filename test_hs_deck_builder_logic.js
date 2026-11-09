const { CARDS_DATABASE, CARD_CATEGORIES, CARD_RARITIES, CardDeckManager } = require('./js/cards.js');
const { DEFAULT_DECK_PRESETS, DeckStorage } = require('./js/decks.js');

console.log('===============================================================');
console.log('   VERIFICATION: HEARTHSTONE FULLSCREEN DECK BUILDER LOGIC     ');
console.log('===============================================================\n');

let passed = 0;
function assert(cond, msg) {
  if (!cond) {
    console.error(`❌ FAILED: ${msg}`);
    throw new Error(msg);
  } else {
    passed++;
    console.log(`✅ PASSED: ${msg}`);
  }
}

// 1. Pagination math verification
console.log('--- TEST 1: Pagination Math (Desktop 8, Tablet 6, Mobile 4) ---');
{
  const totalCards = CARDS_DATABASE.length; // 50
  assert(totalCards === 50, 'Total collection has exactly 50 cards');

  // Desktop: 8 cards per page (4 cols x 2 rows)
  const desktopPages = Math.ceil(totalCards / 8);
  assert(desktopPages === 7, `Desktop has 7 pages for 50 cards (was ${desktopPages})`);

  // Tablet: 6 cards per page (3 cols x 2 rows)
  const tabletPages = Math.ceil(totalCards / 6);
  assert(tabletPages === 9, `Tablet has 9 pages for 50 cards (was ${tabletPages})`);

  // Mobile: 4 cards per page (2 cols x 2 rows)
  const mobilePages = Math.ceil(totalCards / 4);
  assert(mobilePages === 13, `Mobile has 13 pages for 50 cards (was ${mobilePages})`);
}
console.log('');

// 2. School category filtering & pagination
console.log('--- TEST 2: School Category Filters ---');
{
  const categories = ['control', 'defense', 'attack', 'secrets', 'magic', 'tactics'];
  categories.forEach(cat => {
    const cards = CARDS_DATABASE.filter(c => c.category === cat);
    assert(cards.length > 0, `Category '${cat}' has ${cards.length} cards`);
    const pages = Math.ceil(cards.length / 8);
    assert(pages >= 1, `Category '${cat}' has valid page count (${pages})`);
  });
}
console.log('');

// 3. Mana gem filtering
console.log('--- TEST 3: Mana Gem Filters ---');
{
  const manaKeys = ['1', '2', '3', '4', '5+'];
  manaKeys.forEach(mana => {
    const cards = CARDS_DATABASE.filter(c => {
      const cost = c.manaCost || 1;
      if (mana === '5+') return cost >= 5;
      return cost === parseInt(mana, 10);
    });
    assert(cards.length > 0, `Mana tier '${mana}' has ${cards.length} cards`);
  });
}
console.log('');

// 4. Search filtering
console.log('--- TEST 4: Search Filtering ---');
{
  const queries = ['щит', 'конь', 'огонь', 'замороз', 'указ'];
  queries.forEach(q => {
    const matches = CARDS_DATABASE.filter(card => {
      const catData = CARD_CATEGORIES[card.category] || { name: '' };
      const text = `${card.name} ${card.description} ${card.tip || ''} ${card.type} ${catData.name}`.toLowerCase();
      return text.includes(q.toLowerCase());
    });
    assert(matches.length > 0, `Search query '${q}' found ${matches.length} matching cards`);
  });
}
console.log('');

// 5. Deck Sanity & Constraints (Max 30, Legendaries 1 copy, Epics/Rares/Commons 2 copies)
console.log('--- TEST 5: Deck Rules & Limit Enforcement ---');
{
  const defaultDecks = DEFAULT_DECK_PRESETS;
  defaultDecks.forEach(preset => {
    assert(preset.cards.length === 30, `Preset '${preset.name}' has strictly 30 cards`);
    const copies = {};
    preset.cards.forEach(id => {
      copies[id] = (copies[id] || 0) + 1;
    });

    Object.entries(copies).forEach(([id, count]) => {
      const card = CARDS_DATABASE.find(c => c.id === id);
      assert(card !== undefined, `Card ${id} exists in database`);
      if (card.rarity === 'LEGENDARY') {
        assert(count <= 1, `Legendary card '${card.name}' has at most 1 copy (found ${count})`);
      } else {
        assert(count <= 2, `Card '${card.name}' has at most 2 copies (found ${count})`);
      }
    });
  });
}
console.log('');

console.log('===============================================================');
console.log(`   ALL HEARTHSTONE DECK BUILDER LOGIC TESTS PASSED (${passed} checks) `);
console.log('===============================================================\n');
