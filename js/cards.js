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
    description: 'Если враг походит Конём в течение 2 ходов — конь застынет во льду на 1 ход.',
    trigger: 'Ход вражеским Конём',
    penalty: 'Заморозка коня на 1 ход',
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
    description: 'Если враг походит Ладьёй в течение 2 ходов — вы берёте +1 бонусную карту.',
    trigger: 'Ход вражеской Ладьёй',
    penalty: 'Вы получаете +1 бонусную карту',
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
    description: 'Слоны врага ослеплены: они могут ходить, но не могут брать фигуры 2 хода.',
    trigger: 'Попытка взятия Слоном',
    penalty: 'Запрет на взятия фигур',
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
    description: 'Выберите клетку. Вражеская фигура, наступив на неё, застынет во льду на 1 ход.',
    trigger: 'Враг ступает на эту клетку',
    penalty: 'Заморозка наступившей фигуры на 1 ход',
    penaltyType: 'freeze_square',
    requiresTarget: 'empty_square',
    targetHint: 'Кликните по любой пустой клетке доски'
  },
  {
    id: 'queen_burden',
    name: 'Тяжёлая Корона',
    icon: '👑',
    rarity: 'EPIC',
    type: 'decree',
    duration: 2,
    description: 'Ферзь врага перегружен: следующие 2 хода он ходит максимум на 2 клетки.',
    trigger: 'Ход Ферзём дальше 2 клеток',
    penalty: 'Ход блокируется (макс. 2 клетки)',
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
    trigger: 'Любая рокировка врага',
    penalty: 'Заморозка короля на 1 ход',
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
    description: 'Если враг возьмёт вашу фигуру — нападавшая фигура застынет во льду на 1 ход.',
    trigger: 'Взятие любой вашей фигуры',
    penalty: 'Заморозка нападавшего на 1 ход',
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
    description: 'Выберите вашу пешку: она мгновенно шагает на 1 клетку вперёд без траты хода!',
    requiresTarget: 'my_pawn',
    targetHint: 'Кликните по вашей пешке, перед которой есть свободная клетка'
  },
  {
    id: 'freeze_piece',
    name: 'Ледяная Стрела',
    icon: '❄️',
    rarity: 'RARE',
    type: 'spell',
    description: 'Заморозьте фигуру врага (кроме короля) на 1 ход: она не сможет двигаться.',
    requiresTarget: 'enemy_piece',
    targetHint: 'Кликните по фигуре врага (кроме короля)'
  },
  {
    id: 'shadow_swap',
    name: 'Обмен Теней',
    icon: '👥',
    rarity: 'RARE',
    type: 'spell',
    description: 'Выберите своего коня и свою пешку: они мгновенно меняются местами на доске!',
    requiresTarget: 'shadow_swap',
    targetHint: 'Шаг 1 из 2: Выберите вашего Коня 🐎'
  },
  {
    id: 'smoke_screen',
    name: 'Густой Туман',
    icon: '🌫️',
    rarity: 'COMMON',
    type: 'spell',
    duration: 1,
    description: 'Выберите область 2х2 клетки: на 1 ход в ней запрещены любые взятия фигур.',
    requiresTarget: 'square',
    targetHint: 'Кликните по клетке для левого-нижнего угла тумана 2х2'
  },
  {
    id: 'reinforcements',
    name: 'Зов Резерва',
    icon: '🎺',
    rarity: 'EPIC',
    type: 'spell',
    description: 'Возрождает потерянную пешку на любую свободную клетку вашего 1-го или 2-го ряда.',
    requiresTarget: 'spawn_square',
    targetHint: 'Кликните по свободной клетке на вашем 1-м или 2-м ряду'
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
    description: 'Оглушает всех вражеских коней и слонов на 1 ход: они не смогут ходить на своём ходу.',
    requiresTarget: false
  }
];

// Effect Lifecycle States (State Pattern)
const EFFECT_STATE = {
  PENDING: 'PENDING',       // Waiting / targeting
  APPLIED: 'APPLIED',       // Just cast/triggered this ply (protected from decrementing on same ply)
  ACTIVE: 'ACTIVE',         // In play, restricting or monitoring actions ("Есть эффект")
  TICKING: 'TICKING',       // Decrementing phase ("Тикает")
  EXPIRED: 'EXPIRED'        // Finished duration, disarmed, thawed ("Нет эффекта")
};

// Turn Lifecycle States (State Pattern)
const TURN_STATE = {
  WAITING: 'WAITING',       // Waiting for player's turn to begin
  ACTIVE: 'ACTIVE',         // Player is currently thinking/moving ("Ходит")
  MOVED: 'MOVED',           // Move executed on board, penalties triggered ("Походил")
  TICKING: 'TICKING',       // End-of-turn duration tick running ("Тикает")
  COMPLETED: 'COMPLETED'    // Turn finished, handed off to opponent ("Завершён")
};

class TurnStateMachine {
  constructor() {
    this.state = TURN_STATE.ACTIVE;
    this.activeColor = 'w';
    this.currentPly = 0;
  }

  reset() {
    this.state = TURN_STATE.ACTIVE;
    this.activeColor = 'w';
    this.currentPly = 0;
  }

  onTurnStart(color, ply = 0) {
    this.activeColor = color;
    this.currentPly = ply;
    this.state = TURN_STATE.ACTIVE;
  }

  onMoveExecuted(color, ply) {
    this.activeColor = color;
    this.currentPly = ply;
    this.state = TURN_STATE.MOVED;
  }

  onTickStart(color, ply) {
    this.activeColor = color;
    this.currentPly = ply;
    this.state = TURN_STATE.TICKING;
  }

  onTurnCompleted(color, ply) {
    this.currentPly = ply;
    this.state = TURN_STATE.COMPLETED;
  }

  getStateLabel() {
    switch (this.state) {
      case TURN_STATE.ACTIVE: return 'Ходит';
      case TURN_STATE.MOVED: return 'Походил';
      case TURN_STATE.TICKING: return 'Тикает';
      case TURN_STATE.COMPLETED: return 'Завершён';
      default: return 'Ожидание';
    }
  }

  getStateBadge() {
    switch (this.state) {
      case TURN_STATE.ACTIVE: return '🟢 Ходит';
      case TURN_STATE.MOVED: return '⚡ Походил';
      case TURN_STATE.TICKING: return '⏳ Тикает';
      case TURN_STATE.COMPLETED: return '✔️ Завершён';
      default: return '⚪ Ожидание';
    }
  }
}

class CardDeckManager {
  constructor() {
    this.deck = [...CARDS_DATABASE];
    this.hand = [];
    this.maxHandSize = 4;
    this.currentPly = 0;
    this.turnState = new TurnStateMachine();

    this.activeDecrees = []; // Array of decree objects
    this.frozenPieces = {}; // { [square]: { square, color, targetColor, turns, createdPly, state, source } }
    this.forbiddenSquares = {}; // { [square]: { square, byPlayer, targetColor, turns, createdPly, state } }
    this.smokeArea = null; // { squares: [...], turns, createdPly, state }
    this.kingsShield = { w: 0, b: 0 };
    this.kingsShieldData = {
      w: { turns: 0, createdPly: 0, state: EFFECT_STATE.EXPIRED },
      b: { turns: 0, createdPly: 0, state: EFFECT_STATE.EXPIRED }
    };
    this.infantryMarchActive = false;
  }

  reset() {
    this.hand = [];
    this.currentPly = 0;
    this.turnState.reset();
    this.activeDecrees = [];
    this.frozenPieces = {};
    this.forbiddenSquares = {};
    this.smokeArea = null;
    this.kingsShield = { w: 0, b: 0 };
    this.kingsShieldData = {
      w: { turns: 0, createdPly: 0, state: EFFECT_STATE.EXPIRED },
      b: { turns: 0, createdPly: 0, state: EFFECT_STATE.EXPIRED }
    };
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

  // --- Effects State Management ---

  freezePiece(square, color, turns = 1, currentPly = null, source = 'spell') {
    const ply = (currentPly !== null && currentPly !== undefined) ? currentPly : this.currentPly;
    this.frozenPieces[square] = {
      square: square,
      color: color,
      targetColor: color,
      turns: turns,
      createdPly: ply,
      state: EFFECT_STATE.APPLIED,
      source: source
    };
  }

  isPieceFrozen(square) {
    const fp = this.frozenPieces[square];
    if (!fp) return false;
    return fp.turns > 0 && fp.state !== EFFECT_STATE.EXPIRED;
  }

  addDecree(card, owner, currentPly = null) {
    const ply = (currentPly !== null && currentPly !== undefined) ? currentPly : this.currentPly;
    const opponent = owner === 'w' ? 'b' : 'w';
    this.activeDecrees.push({
      instanceId: card.instanceId || ('d_' + Math.random().toString(36).substr(2, 9)),
      id: card.id,
      name: card.name,
      icon: card.icon,
      owner: owner,
      targetColor: opponent,
      duration: card.duration || 2,
      createdPly: ply,
      state: EFFECT_STATE.APPLIED,
      penaltyType: card.penaltyType,
      penaltyTarget: card.penaltyTarget,
      card: card
    });
  }

  setForbiddenSquare(square, byPlayer, turns = 3, currentPly = null) {
    const ply = (currentPly !== null && currentPly !== undefined) ? currentPly : this.currentPly;
    const targetColor = byPlayer === 'w' ? 'b' : 'w';
    this.forbiddenSquares[square] = {
      square: square,
      byPlayer: byPlayer,
      targetColor: targetColor,
      turns: turns,
      createdPly: ply,
      state: EFFECT_STATE.APPLIED
    };
  }

  setSmokeArea(squares, turns = 2, currentPly = null) {
    const ply = (currentPly !== null && currentPly !== undefined) ? currentPly : this.currentPly;
    this.smokeArea = {
      squares: squares,
      turns: turns,
      createdPly: ply,
      state: EFFECT_STATE.APPLIED
    };
  }

  setKingsShield(color, turns = 2, currentPly = null) {
    const ply = (currentPly !== null && currentPly !== undefined) ? currentPly : this.currentPly;
    this.kingsShield[color] = turns;
    this.kingsShieldData[color] = {
      turns: turns,
      createdPly: ply,
      state: EFFECT_STATE.APPLIED
    };
  }

  // Clear frozen piece artifacts if piece was captured, swapped or removed
  syncWithBoard(chessGame) {
    if (!chessGame || typeof chessGame.get !== 'function') return;
    for (const sq in this.frozenPieces) {
      const piece = chessGame.get(sq);
      if (!piece || piece.color !== this.frozenPieces[sq].color) {
        delete this.frozenPieces[sq];
      }
    }
  }

  // Decrement decree and frozen counters when a player finishes their turn
  tickTurn(justMovedColor, currentPly = null, chessGame = null) {
    if (currentPly !== null && currentPly !== undefined) {
      this.currentPly = currentPly;
    } else {
      this.currentPly++;
    }
    const ply = this.currentPly;
    this.turnState.onTickStart(justMovedColor, ply);

    // 1. Decrement decrees when the affected player (opponent of decree owner) completes a move
    this.activeDecrees.forEach(d => {
      if (d.owner !== justMovedColor) {
        // If created in this exact same ply, it was just applied, do not tick down yet!
        if (d.createdPly === ply) {
          d.state = EFFECT_STATE.ACTIVE;
        } else {
          d.state = EFFECT_STATE.TICKING;
          d.duration--;
          if (d.duration <= 0) {
            d.state = EFFECT_STATE.EXPIRED;
          } else {
            d.state = EFFECT_STATE.ACTIVE;
          }
        }
      }
    });
    this.activeDecrees = this.activeDecrees.filter(d => d.duration > 0 && d.state !== EFFECT_STATE.EXPIRED);

    // 2. Decrement frozen pieces for the player whose piece was frozen during their turn
    for (const sq in this.frozenPieces) {
      const fp = this.frozenPieces[sq];
      if (fp.color === justMovedColor) {
        // If frozen in this exact same ply (e.g. decree penalty triggered by this move),
        // it was just applied, do NOT tick down on the move that caused it!
        if (fp.createdPly === ply) {
          fp.state = EFFECT_STATE.ACTIVE;
        } else {
          fp.state = EFFECT_STATE.TICKING;
          fp.turns--;
          if (fp.turns <= 0) {
            fp.state = EFFECT_STATE.EXPIRED;
            delete this.frozenPieces[sq];
          } else {
            fp.state = EFFECT_STATE.ACTIVE;
          }
        }
      }
    }

    // 3. Decrement forbidden squares after affected player's move
    for (const sq in this.forbiddenSquares) {
      const trap = this.forbiddenSquares[sq];
      if (trap.byPlayer !== justMovedColor) {
        if (trap.createdPly === ply) {
          trap.state = EFFECT_STATE.ACTIVE;
        } else {
          trap.state = EFFECT_STATE.TICKING;
          trap.turns--;
          if (trap.turns <= 0) {
            trap.state = EFFECT_STATE.EXPIRED;
            delete this.forbiddenSquares[sq];
          } else {
            trap.state = EFFECT_STATE.ACTIVE;
          }
        }
      }
    }

    // 4. Decrement Smoke Screen
    if (this.smokeArea) {
      if (this.smokeArea.createdPly === ply) {
        this.smokeArea.state = EFFECT_STATE.ACTIVE;
      } else {
        this.smokeArea.turns--;
        if (this.smokeArea.turns <= 0) {
          this.smokeArea = null;
        }
      }
    }

    // 5. Decrement King's Shield
    if (this.kingsShield[justMovedColor] > 0) {
      const data = this.kingsShieldData[justMovedColor];
      if (data && data.createdPly === ply) {
        data.state = EFFECT_STATE.ACTIVE;
      } else {
        this.kingsShield[justMovedColor]--;
        if (data) data.turns = this.kingsShield[justMovedColor];
        if (this.kingsShield[justMovedColor] <= 0 && data) {
          data.state = EFFECT_STATE.EXPIRED;
        }
      }
    }

    // 6. Board synchronization: clear frozen pieces that were captured or removed
    if (chessGame) {
      this.syncWithBoard(chessGame);
    }

    this.infantryMarchActive = false;
    this.turnState.onTurnCompleted(justMovedColor, ply);
  }
}

if (typeof window !== 'undefined') {
  window.EFFECT_STATE = EFFECT_STATE;
  window.TURN_STATE = TURN_STATE;
  window.TurnStateMachine = TurnStateMachine;
  window.CARD_RARITIES = CARD_RARITIES;
  window.CARDS_DATABASE = CARDS_DATABASE;
  window.CardDeckManager = CardDeckManager;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    EFFECT_STATE,
    TURN_STATE,
    TurnStateMachine,
    CARD_RARITIES,
    CARDS_DATABASE,
    CardDeckManager
  };
}
