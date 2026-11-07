// Card Database and Logic for Card Chess (Hearthstone-style spells & decrees)
const CARD_RARITIES = {
  COMMON: { name: 'Обычная', color: '#9ca3af', border: '#4b5563', bg: 'linear-gradient(135deg, #1f2937, #111827)' },
  RARE: { name: 'Редкая', color: '#60a5fa', border: '#2563eb', bg: 'linear-gradient(135deg, #1e3a8a, #0f172a)' },
  EPIC: { name: 'Эпическая', color: '#c084fc', border: '#9333ea', bg: 'linear-gradient(135deg, #581c87, #1e1b4b)' },
  LEGENDARY: { name: 'Легендарная', color: '#fbbf24', border: '#d97706', bg: 'linear-gradient(135deg, #78350f, #291003)' }
};

const CARDS_DATABASE = [
  // --- 1. УКАЗЫ И ПРОКЛЯТИЯ (Открытая контр-игра) ---
  {
    id: 'curse_knight',
    name: 'Оковы Кентавра',
    icon: '🐎',
    rarity: 'RARE',
    type: 'decree',
    duration: 2, // rounds
    cost: 'Каждые 3 хода',
    description: 'Враг проклят: если он походит Конем в течение 2 ходов, этот конь застынет во льду на 1 ход.',
    penaltyType: 'freeze',
    penaltyTarget: 'n',
    requiresTarget: false
  },
  {
    id: 'curse_rook',
    name: 'Осадный Налог',
    icon: '🏰',
    rarity: 'RARE',
    type: 'decree',
    duration: 2,
    description: 'Если враг походит Ладьёй в течение 2 ходов, вы немедленно берёте бонусную карту из колоды.',
    penaltyType: 'draw_card',
    penaltyTarget: 'r',
    requiresTarget: false
  },
  {
    id: 'curse_bishop',
    name: 'Слепая Вера',
    icon: '⛪',
    rarity: 'COMMON',
    type: 'decree',
    duration: 2,
    description: 'Слоны врага ослеплены: они могут ходить, но не могут совершать взятия фигур 2 хода.',
    penaltyType: 'disarm',
    penaltyTarget: 'b',
    requiresTarget: false
  },
  {
    id: 'forbidden_square',
    name: 'Чёрная Метка',
    icon: '☠️',
    rarity: 'RARE',
    type: 'decree',
    duration: 3,
    description: 'Выберите пустую клетку. Любая фигура врага, наступившая на неё, замораживается на 1 ход.',
    penaltyType: 'freeze_square',
    requiresTarget: 'empty_square'
  },
  {
    id: 'queen_burden',
    name: 'Тяжёлая Корона',
    icon: '👑',
    rarity: 'EPIC',
    type: 'decree',
    duration: 2,
    description: 'Ферзь врага перегружен: он может ходить максимум на 2 клетки в любом направлении следующие 2 хода.',
    penaltyType: 'queen_slow',
    requiresTarget: false
  },
  {
    id: 'tax_castle',
    name: 'Запрет на Бункер',
    icon: '🛡️',
    rarity: 'COMMON',
    type: 'decree',
    duration: 3,
    description: 'Если враг сделает рокировку, его Король застынет во льду на 1 ход.',
    penaltyType: 'castle_freeze',
    requiresTarget: false
  },
  {
    id: 'blood_tribute',
    name: 'Возмездие Крови',
    icon: '🩸',
    rarity: 'EPIC',
    type: 'decree',
    duration: 2,
    description: 'Если враг заберёт вашу фигуру, атаковавшая фигура отбрасывается назад или замораживается.',
    penaltyType: 'retaliation',
    requiresTarget: false
  },

  // --- 2. ТАКТИЧЕСКИЕ ЗАКЛИНАНИЯ (Моментальные) ---
  {
    id: 'infantry_march',
    name: 'Марш Пехоты',
    icon: '⚔️',
    rarity: 'COMMON',
    type: 'spell',
    description: 'В этот ход ЛЮБАЯ ваша пешка может сделать ход сразу на 2 клетки вперёд (даже если уже ходила).',
    requiresTarget: false
  },
  {
    id: 'freeze_piece',
    name: 'Ледяная Стрела',
    icon: '❄️',
    rarity: 'RARE',
    type: 'spell',
    description: 'Заморозьте любую фигуру врага (кроме короля) на 1 ход. Она не сможет двигаться.',
    requiresTarget: 'enemy_piece'
  },
  {
    id: 'shadow_swap',
    name: 'Обмен Теней',
    icon: '👥',
    rarity: 'RARE',
    type: 'spell',
    description: 'Выберите своего коня и свою пешку. Они мгновенно меняются местами на доске!',
    requiresTarget: 'my_knight_and_pawn'
  },
  {
    id: 'smoke_screen',
    name: 'Густой Туман',
    icon: '🌫️',
    rarity: 'COMMON',
    type: 'spell',
    duration: 1,
    description: 'Выберите область 2х2 клетки. На 1 ход в этой области полностью запрещены любые взятия фигур.',
    requiresTarget: 'square'
  },
  {
    id: 'reinforcements',
    name: 'Зов Резерва',
    icon: '🎺',
    rarity: 'EPIC',
    type: 'spell',
    description: 'Возрождает потерянную пешку на любую свободную клетку вашего 1-го или 2-го ряда.',
    requiresTarget: 'spawn_square'
  },
  {
    id: 'kings_shield',
    name: 'Аура Стойкости',
    icon: '✨',
    rarity: 'COMMON',
    type: 'spell',
    duration: 2,
    description: 'Ваш Король получает иммунитет к шахам от пешек и коней на 2 хода.',
    requiresTarget: false
  },
  {
    id: 'alchemist_gold',
    name: 'Трансмутация',
    icon: '🔮',
    rarity: 'COMMON',
    type: 'spell',
    description: 'Сбросьте эту карту и мгновенно получите 2 случайные новые карты в руку.',
    requiresTarget: false
  },
  {
    id: 'time_warp',
    name: 'Власть Времени',
    icon: '⏳',
    rarity: 'RARE',
    type: 'spell',
    description: 'Добавляет вам +45 секунд на таймере и отнимает 15 секунд у соперника.',
    requiresTarget: false
  },
  {
    id: 'divine_storm',
    name: 'Небесный Гром',
    icon: '⚡',
    rarity: 'LEGENDARY',
    type: 'spell',
    description: 'Оглушает всех вражеских коней и слонов на 1 ход (они не могут ходить на следующем ходу).',
    requiresTarget: false
  }
];

class CardDeckManager {
  constructor() {
    this.deck = [...CARDS_DATABASE];
    this.hand = [];
    this.maxHandSize = 4;
    this.activeDecrees = []; // { id, name, icon, player, duration, card }
    this.frozenPieces = {}; // { 'e4': turnsLeft }
    this.forbiddenSquares = {}; // { 'd5': { turns: 3, byPlayer: 'w' } }
    this.smokeArea = null; // { squares: ['e4', 'e5', 'd4', 'd5'], turns: 1 }
    this.kingsShield = { w: 0, b: 0 };
    this.infantryMarchActive = false;
  }

  reset() {
    this.hand = [];
    this.activeDecrees = [];
    this.frozenPieces = {};
    this.forbiddenSquares = {};
    this.smokeArea = null;
    this.kingsShield = { w: 0, b: 0 };
    this.infantryMarchActive = false;
  }

  drawCard() {
    if (this.hand.length >= this.maxHandSize) {
      return null; // Hand full
    }
    // Weighted random by rarity
    const weights = { COMMON: 50, RARE: 35, EPIC: 12, LEGENDARY: 3 };
    const rand = Math.random() * 100;
    let targetRarity = 'COMMON';
    if (rand > 97) targetRarity = 'LEGENDARY';
    else if (rand > 85) targetRarity = 'EPIC';
    else if (rand > 50) targetRarity = 'RARE';

    const pool = this.deck.filter(c => c.rarity === targetRarity);
    const chosen = pool[Math.floor(Math.random() * pool.length)] || this.deck[0];

    const cardInstance = {
      instanceId: 'c_' + Math.random().toString(36).substr(2, 9),
      ...chosen
    };

    this.hand.push(cardInstance);
    return cardInstance;
  }

  removeCard(instanceId) {
    const idx = this.hand.findIndex(c => c.instanceId === instanceId);
    if (idx !== -1) {
      return this.hand.splice(idx, 1)[0];
    }
    return null;
  }

  // Decrement decree and frozen counters on each turn
  tickTurn(activeColor) {
    // Decrement decrees of the player whose turn just ended or started
    this.activeDecrees.forEach(d => {
      if (d.owner !== activeColor) {
        d.duration--;
      }
    });
    this.activeDecrees = this.activeDecrees.filter(d => d.duration > 0);

    // Decrement frozen pieces for the active color
    for (const sq in this.frozenPieces) {
      if (this.frozenPieces[sq].color === activeColor) {
        this.frozenPieces[sq].turns--;
        if (this.frozenPieces[sq].turns <= 0) {
          delete this.frozenPieces[sq];
        }
      }
    }

    // Decrement forbidden squares
    for (const sq in this.forbiddenSquares) {
      this.forbiddenSquares[sq].turns--;
      if (this.forbiddenSquares[sq].turns <= 0) {
        delete this.forbiddenSquares[sq];
      }
    }

    if (this.smokeArea) {
      this.smokeArea.turns--;
      if (this.smokeArea.turns <= 0) {
        this.smokeArea = null;
      }
    }

    if (this.kingsShield[activeColor] > 0) {
      this.kingsShield[activeColor]--;
    }

    this.infantryMarchActive = false;
  }

  freezePiece(square, color, turns = 1) {
    this.frozenPieces[square] = { color, turns };
  }

  isPieceFrozen(square) {
    return !!this.frozenPieces[square];
  }

  addDecree(card, owner) {
    this.activeDecrees.push({
      instanceId: card.instanceId,
      id: card.id,
      name: card.name,
      icon: card.icon,
      owner: owner,
      duration: card.duration || 2,
      penaltyType: card.penaltyType,
      penaltyTarget: card.penaltyTarget,
      card: card
    });
  }
}

window.CARD_RARITIES = CARD_RARITIES;
window.CARDS_DATABASE = CARDS_DATABASE;
window.CardDeckManager = CardDeckManager;
