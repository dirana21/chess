// Deck Presets and Deck Building System for Card Chess
// Allows players to customize their 30-card decks and switch between presets.

const DEFAULT_DECK_PRESETS = [
  {
    id: 'preset_balanced',
    name: '⚖️ Сбалансированная',
    icon: '⚖️',
    isDefault: true,
    description: 'Универсальная колода: выверенный баланс всех стихий — контроль, защита, тактика и мощные заклинания.',
    cards: [
      'infantry_march', 'infantry_march', 'blood_pact', 'alchemist_gold', 'healing_prayer', 'healing_prayer',
      'freeze_piece', 'freeze_piece', 'divine_shield', 'divine_shield', 'curse_knight', 'curse_knight',
      'forbidden_square', 'forbidden_square', 'shield_wall', 'shield_wall', 'ice_barrier', 'ice_barrier', 'time_warp',
      'frostmourne', 'arcane_intellect', 'arcane_intellect', 'shadow_swap', 'shadow_swap', 'blood_tribute', 'fire_trail',
      'chain_lightning', 'kings_gambit', 'polymorph', 'coronation'
    ]
  },
  {
    id: 'preset_frost',
    name: '❄️ Ледяной Контроль',
    icon: '❄️',
    isDefault: true,
    description: 'Сковывает армию врага вечным холодом. Максимум заморозок, барьеров и сокрушительная Снежная Буря.',
    cards: [
      'healing_prayer', 'healing_prayer', 'iron_guard', 'iron_guard', 'holy_well',
      'freeze_piece', 'freeze_piece', 'confusion_step', 'confusion_step', 'ice_barrier', 'ice_barrier',
      'curse_knight', 'curse_knight', 'shield_wall', 'shield_wall', 'smoke_screen', 'tax_castle',
      'frostmourne', 'frostmourne', 'arcane_intellect', 'arcane_intellect', 'spell_reflect', 'counterspell',
      'chain_lightning', 'chain_lightning', 'queen_burden', 'queen_burden', 'polymorph',
      'divine_storm', 'blizzard'
    ]
  },
  {
    id: 'preset_aggro',
    name: '⚔️ Штурм и Атака',
    icon: '⚔️',
    isDefault: true,
    description: 'Агрессивный темп: пехотные марши, разрушительные стрелы, огненный след и второй Ферзь.',
    cards: [
      'infantry_march', 'infantry_march', 'blood_pact', 'blood_pact', 'alchemist_gold', 'alchemist_gold', 'mind_vision', 'mind_vision',
      'arrow_volley', 'arrow_volley', 'deadly_poison', 'deadly_poison', 'mirror_image', 'mirror_image', 'curse_bishop', 'curse_bishop',
      'shadow_bolt', 'shadow_bolt', 'fire_trail', 'fire_trail', 'reinforcements', 'reinforcements', 'blood_tribute', 'blood_tribute',
      'kings_gambit', 'kings_gambit', 'time_warp', 'time_warp',
      'meteor_strike', 'coronation'
    ]
  },
  {
    id: 'preset_secrets',
    name: '💣 Мастер Ловушек',
    icon: '💣',
    isDefault: true,
    description: 'Тайные замыслы и контригра: заминируйте ключевые клетки, ослепите слонов и накажите врага за жадность.',
    cards: [
      'alchemist_gold', 'alchemist_gold', 'mind_vision', 'mind_vision',
      'forbidden_square', 'forbidden_square', 'curse_knight', 'curse_knight', 'curse_rook', 'curse_rook',
      'curse_bishop', 'curse_bishop', 'tax_castle', 'tax_castle', 'curse_greed', 'curse_greed', 'explosive_trap', 'explosive_trap',
      'blood_tribute', 'blood_tribute', 'gravity_well', 'gravity_well', 'counterspell', 'counterspell', 'spell_reflect',
      'doomsday', 'polymorph', 'polymorph',
      'meteor_strike', 'resurrection'
    ]
  },
  {
    id: 'preset_tactics',
    name: '🌀 Гроссмейстерская Тактика',
    icon: '🌀',
    isDefault: true,
    description: 'Королевские маневры: рокировки сквозь препятствия, обмены теней, порталы бездны и возрождение.',
    cards: [
      'infantry_march', 'infantry_march', 'healing_prayer', 'healing_prayer',
      'whirlwind', 'whirlwind', 'divine_shield', 'divine_shield', 'mirror_image', 'mirror_image', 'kings_shield', 'kings_shield', 'time_warp', 'time_warp',
      'shadow_swap', 'shadow_swap', 'blessing_kings', 'blessing_kings', 'earthquake', 'earthquake', 'reinforcements', 'reinforcements',
      'void_teleport', 'void_teleport', 'kings_gambit', 'kings_gambit', 'resurrection',
      'coronation', 'divine_storm', 'meteor_strike'
    ]
  }
];

class DeckStorageManager {
  constructor() {
    this.STORAGE_KEY = 'chess_online_decks_v2';
    this.ACTIVE_KEY = 'chess_online_active_deck_id_v2';
  }

  // Load all available decks (defaults + saved custom decks)
  getAllDecks() {
    let saved = null;
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(this.STORAGE_KEY);
        if (raw) saved = JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Could not read decks from localStorage:', e);
    }

    if (!saved || !Array.isArray(saved) || saved.length === 0) {
      return JSON.parse(JSON.stringify(DEFAULT_DECK_PRESETS));
    }

    // Merge default presets with custom decks, ensuring defaults are always present
    const result = [];
    const defaults = JSON.parse(JSON.stringify(DEFAULT_DECK_PRESETS));

    defaults.forEach(def => {
      const existing = saved.find(s => s.id === def.id);
      if (existing) {
        result.push(existing);
      } else {
        result.push(def);
      }
    });

    // Add user custom decks
    saved.forEach(s => {
      if (!defaults.some(d => d.id === s.id)) {
        result.push(s);
      }
    });

    return result;
  }

  // Save full decks array to localStorage
  saveAllDecks(decks) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(decks));
      }
    } catch (e) {
      console.warn('Could not save decks to localStorage:', e);
    }
  }

  // Get active deck ID
  getActiveDeckId() {
    try {
      if (typeof localStorage !== 'undefined') {
        const active = localStorage.getItem(this.ACTIVE_KEY);
        if (active) return active;
      }
    } catch (e) {
      console.warn('Could not read active deck ID:', e);
    }
    return 'preset_balanced';
  }

  // Set active deck ID
  setActiveDeckId(id) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.ACTIVE_KEY, id);
      }
    } catch (e) {
      console.warn('Could not save active deck ID:', e);
    }
  }

  // Get currently active deck object (guarantees 30 cards)
  getActiveDeck() {
    const all = this.getAllDecks();
    const activeId = this.getActiveDeckId();
    let deck = all.find(d => d.id === activeId);
    if (!deck) deck = all[0];

    // If deck is incomplete (less than 30 cards), top up from balanced preset
    const validCards = this.sanitizeCardList(deck.cards);
    return {
      ...deck,
      cards: validCards
    };
  }

  // Create a new custom deck
  createDeck(name = 'Новая колода', basePresetId = null) {
    const all = this.getAllDecks();
    let baseCards = [];
    if (basePresetId) {
      const base = all.find(d => d.id === basePresetId);
      if (base) baseCards = [...base.cards];
    } else {
      // Default to balanced deck cards
      baseCards = [...DEFAULT_DECK_PRESETS[0].cards];
    }

    const newDeck = {
      id: 'custom_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      name: name.trim() || 'Пользовательская колода',
      icon: '✨',
      isDefault: false,
      description: 'Собственная колода из 30 карт.',
      cards: baseCards
    };

    all.push(newDeck);
    this.saveAllDecks(all);
    this.setActiveDeckId(newDeck.id);
    return newDeck;
  }

  // Save/Update a single deck
  saveDeck(updatedDeck) {
    const all = this.getAllDecks();
    const idx = all.findIndex(d => d.id === updatedDeck.id);
    if (idx !== -1) {
      all[idx] = { ...all[idx], ...updatedDeck };
    } else {
      all.push(updatedDeck);
    }
    this.saveAllDecks(all);
  }

  // Delete custom deck (cannot delete default presets)
  deleteDeck(id) {
    const all = this.getAllDecks();
    const deck = all.find(d => d.id === id);
    if (!deck || deck.isDefault) return false;

    const filtered = all.filter(d => d.id !== id);
    this.saveAllDecks(filtered);

    if (this.getActiveDeckId() === id) {
      this.setActiveDeckId('preset_balanced');
    }
    return true;
  }

  // Reset all presets back to defaults
  resetToDefaults() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(this.STORAGE_KEY);
      }
    } catch (e) {}
    this.setActiveDeckId('preset_balanced');
    return JSON.parse(JSON.stringify(DEFAULT_DECK_PRESETS));
  }

  // Pick a random preset (e.g. for bot opponent)
  getRandomPreset() {
    const presets = DEFAULT_DECK_PRESETS;
    return presets[Math.floor(Math.random() * presets.length)];
  }

  // Sanitize card list: ensure valid IDs and top up to 30 if needed
  sanitizeCardList(cardsArray) {
    if (!cardsArray || !Array.isArray(cardsArray)) {
      return [...DEFAULT_DECK_PRESETS[0].cards];
    }

    const validDbIds = (typeof CARDS_DATABASE !== 'undefined')
      ? new Set(CARDS_DATABASE.map(c => c.id))
      : null;

    let filtered = validDbIds ? cardsArray.filter(id => validDbIds.has(id)) : [...cardsArray];

    // If less than 30 cards, pad with balanced defaults
    if (filtered.length < 30) {
      const fallback = DEFAULT_DECK_PRESETS[0].cards;
      for (let i = 0; filtered.length < 30 && i < fallback.length; i++) {
        filtered.push(fallback[i]);
      }
    }

    // Limit to max 30
    if (filtered.length > 30) {
      filtered = filtered.slice(0, 30);
    }

    return filtered;
  }

  // Get statistics for a deck
  getDeckStats(cardIds, cardsDb = null) {
    const db = cardsDb || (typeof CARDS_DATABASE !== 'undefined' ? CARDS_DATABASE : []);
    const dbMap = new Map(db.map(c => [c.id, c]));

    const countsByMana = { 1: 0, 2: 0, 3: 0, 4: 0, '5+': 0 };
    const countsByCategory = { control: 0, defense: 0, attack: 0, secrets: 0, magic: 0, tactics: 0 };
    const countsByRarity = { COMMON: 0, RARE: 0, EPIC: 0, LEGENDARY: 0 };
    const cardCopies = {};

    let totalMana = 0;
    let validCount = 0;

    (cardIds || []).forEach(id => {
      const card = dbMap.get(id);
      if (!card) return;

      validCount++;
      cardCopies[id] = (cardCopies[id] || 0) + 1;

      const cost = card.manaCost || 1;
      totalMana += cost;
      if (cost >= 5) countsByMana['5+']++;
      else countsByMana[cost]++;

      if (countsByCategory[card.category] !== undefined) {
        countsByCategory[card.category]++;
      }
      if (countsByRarity[card.rarity] !== undefined) {
        countsByRarity[card.rarity]++;
      }
    });

    return {
      totalCards: validCount,
      avgMana: validCount > 0 ? (totalMana / validCount).toFixed(1) : 0,
      countsByMana,
      countsByCategory,
      countsByRarity,
      cardCopies,
      isComplete: validCount === 30
    };
  }
}

const DeckStorage = new DeckStorageManager();

if (typeof window !== 'undefined') {
  window.DEFAULT_DECK_PRESETS = DEFAULT_DECK_PRESETS;
  window.DeckStorageManager = DeckStorageManager;
  window.DeckStorage = DeckStorage;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DEFAULT_DECK_PRESETS,
    DeckStorageManager,
    DeckStorage
  };
}
