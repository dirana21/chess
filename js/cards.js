// Card Database and Logic for Card Chess (Hearthstone-style spells & decrees)
const CARD_RARITIES = {
  COMMON: { name: 'Обычная', color: '#9ca3af', border: '#4b5563', bg: 'linear-gradient(135deg, #1f2937, #111827)' },
  RARE: { name: 'Редкая', color: '#60a5fa', border: '#2563eb', bg: 'linear-gradient(135deg, #1e3a8a, #0f172a)' },
  EPIC: { name: 'Эпическая', color: '#c084fc', border: '#9333ea', bg: 'linear-gradient(135deg, #581c87, #1e1b4b)' },
  LEGENDARY: { name: 'Легендарная', color: '#fbbf24', border: '#d97706', bg: 'linear-gradient(135deg, #78350f, #291003)' }
};

const CARDS_DATABASE = [
  // =========================================================================
  // --- 1. УКАЗЫ И СЕКРЕТЫ (Открытая контр-игра и ловушки) ---
  // =========================================================================
  {
    id: 'curse_knight',
    name: 'Оковы Кентавра',
    icon: '🐎',
    rarity: 'RARE',
    type: 'decree',
    manaCost: 2,
    duration: 2,
    description: 'Если враг походит Конём в течение 2 ходов — конь застынет во льду на 1 ход.',
    trigger: 'Ход вражеским Конём',
    penalty: 'Заморозка коня на 1 ход',
    penaltyType: 'freeze',
    penaltyTarget: 'n',
    requiresTarget: false,
    tip: 'Идеально разыгрывать перед началом атаки, чтобы заблокировать прыжки вражеских коней.'
  },
  {
    id: 'curse_rook',
    name: 'Осадный Налог',
    icon: '🏰',
    rarity: 'RARE',
    type: 'decree',
    manaCost: 2,
    duration: 2,
    description: 'Если враг походит Ладьёй в течение 2 ходов — вы берёте +1 бонусную карту из колоды.',
    trigger: 'Ход вражеской Ладьёй',
    penalty: 'Вы получаете +1 бонусную карту',
    penaltyType: 'draw_card',
    penaltyTarget: 'r',
    requiresTarget: false,
    tip: 'Заставьте соперника платить новыми картами в вашу руку за занятие открытых вертикалей.'
  },
  {
    id: 'curse_bishop',
    name: 'Слепая Вера',
    icon: '⛪',
    rarity: 'COMMON',
    type: 'decree',
    manaCost: 2,
    duration: 2,
    description: 'Слоны врага ослеплены: они могут ходить, но не могут брать фигуры 2 хода.',
    trigger: 'Попытка взятия Слоном',
    penalty: 'Запрет на взятия фигур слонами',
    penaltyType: 'disarm',
    penaltyTarget: 'b',
    requiresTarget: false,
    tip: 'Обезопасьте своих коней и пешки от связок дальнобойных вражеских слонов.'
  },
  {
    id: 'forbidden_square',
    name: 'Чёрная Метка',
    icon: '☠️',
    rarity: 'RARE',
    type: 'decree',
    manaCost: 2,
    duration: 3,
    description: 'Выберите клетку. Вражеская фигура, наступив на неё, застынет во льду на 1 ход.',
    trigger: 'Враг ступает на эту клетку',
    penalty: 'Заморозка наступившей фигуры на 1 ход',
    penaltyType: 'freeze_square',
    requiresTarget: 'empty_square',
    targetHint: 'Кликните по любой пустой клетке доски',
    tip: 'Минируйте центральные форпосты (d4, e4, d5, e5), куда враг стремится поставить фигуру.'
  },
  {
    id: 'queen_burden',
    name: 'Тяжёлая Корона',
    icon: '👑',
    rarity: 'EPIC',
    type: 'decree',
    manaCost: 4,
    duration: 2,
    description: 'Ферзь врага перегружен: следующие 2 хода он ходит максимум на 2 клетки.',
    trigger: 'Ход Ферзём дальше 2 клеток',
    penalty: 'Ход блокируется (макс. 2 клетки)',
    penaltyType: 'queen_slow',
    requiresTarget: false,
    tip: 'Связывает руки ферзю соперника, не давая ему свободно летать через всю доску.'
  },
  {
    id: 'tax_castle',
    name: 'Запрет на Бункер',
    icon: '🛡️',
    rarity: 'COMMON',
    type: 'decree',
    manaCost: 2,
    duration: 3,
    description: 'Если враг сделает рокировку, его Король застынет во льду на 1 ход.',
    trigger: 'Любая рокировка врага',
    penalty: 'Заморозка короля на 1 ход',
    penaltyType: 'castle_freeze',
    requiresTarget: false,
    tip: 'Если враг готовится спрятать короля в рокировку — накажите его немедленным пропуском хода!'
  },
  {
    id: 'blood_tribute',
    name: 'Возмездие Крови',
    icon: '🩸',
    rarity: 'EPIC',
    type: 'decree',
    manaCost: 3,
    duration: 2,
    description: 'Если враг возьмёт вашу фигуру — нападавшая фигура застынет во льду на 1 ход.',
    trigger: 'Взятие любой вашей фигуры',
    penalty: 'Заморозка нападавшего на 1 ход',
    penaltyType: 'retaliation',
    requiresTarget: false,
    tip: 'Лишает соперника темпа: если он срубит вашу фигуру, его нападающий застынет во льду!'
  },
  {
    id: 'explosive_trap',
    name: 'Взрывная Ловушка',
    icon: '💣',
    rarity: 'RARE',
    type: 'decree',
    manaCost: 2,
    duration: 3,
    description: 'Секрет: если враг шагнет на вашу половину доски — нападавшая фигура застынет во льду на 1 ход!',
    trigger: 'Ход врага на вашу половину доски',
    penalty: 'Заморозка нападающего во льду на 1 ход',
    penaltyType: 'explosive_trap',
    requiresTarget: false,
    tip: 'Останавливает агрессивные прорывы и дерзкие наскоки вражеских фигур.'
  },
  {
    id: 'gravity_well',
    name: 'Гравитационная Воронка',
    icon: '🕳️',
    rarity: 'RARE',
    type: 'decree',
    manaCost: 3,
    duration: 2,
    description: 'Если враг походит в центр (d4, d5, e4, e5) — его фигура застынет во льду на 1 ход!',
    trigger: 'Ход врага на центральные клетки',
    penalty: 'Заморозка вошедшей фигуры на 1 ход',
    penaltyType: 'gravity_well',
    requiresTarget: false,
    tip: 'Блокирует центр доски от оккупации вражескими фигурами.'
  },
  {
    id: 'curse_greed',
    name: 'Проклятие Жадности',
    icon: '💰',
    rarity: 'COMMON',
    type: 'decree',
    manaCost: 2,
    duration: 3,
    description: 'Если враг возьмет вашу пешку — он потеряет 1 случайную карту из руки, а вы возьмете +1 карту!',
    trigger: 'Взятие врагом вашей пешки',
    penalty: 'Сброс карты соперником и +1 карта вам',
    penaltyType: 'curse_greed',
    requiresTarget: false,
    tip: 'Накажите соперника потерей ценных карт, если он позарится на ваши пешки.'
  },
  {
    id: 'counterspell',
    name: 'Антимагическая Сфера',
    icon: '🔮',
    rarity: 'EPIC',
    type: 'decree',
    manaCost: 3,
    duration: 3,
    description: 'Секрет: следующее заклинание соперника полностью нейтрализуется и развеивается в пыль!',
    trigger: 'Розыгрыш заклинания соперником',
    penalty: 'Полная отмена эффекта заклинания',
    penaltyType: 'counterspell',
    requiresTarget: false,
    tip: 'Разрушьте коварный замысел противника до того, как он его осуществит.'
  },

  // =========================================================================
  // --- 2. ТАКТИЧЕСКИЕ ЗАКЛИНАНИЯ (Моментальные и целевые) ---
  // =========================================================================
  {
    id: 'infantry_march',
    name: 'Марш Пехоты',
    icon: '⚔️',
    rarity: 'COMMON',
    type: 'spell',
    manaCost: 1,
    description: 'Выберите вашу пешку: она мгновенно шагает на 1 клетку вперёд без траты хода!',
    requiresTarget: 'my_pawn',
    targetHint: 'Кликните по вашей пешке, перед которой есть свободная клетка',
    tip: 'Бесплатный темп! Продвиньте пешку вперёд без траты хода — отлично для захвата центра.'
  },
  {
    id: 'freeze_piece',
    name: 'Ледяная Стрела',
    icon: '❄️',
    rarity: 'RARE',
    type: 'spell',
    manaCost: 2,
    description: 'Заморозьте фигуру врага (кроме короля) на 1 ход: она не сможет двигаться и рубить.',
    requiresTarget: 'enemy_piece',
    targetHint: 'Кликните по фигуре врага (кроме короля)',
    tip: 'Если вам объявили шах или ферзь навис над королём — заморозьте угрозу и спаситесь!'
  },
  {
    id: 'shadow_swap',
    name: 'Обмен Теней',
    icon: '👥',
    rarity: 'RARE',
    type: 'spell',
    manaCost: 3,
    description: 'Выберите своего коня и свою пешку: они мгновенно меняются местами на доске!',
    requiresTarget: 'shadow_swap',
    targetHint: 'Шаг 1 из 2: Выберите вашего Коня 🐎',
    tip: 'Мгновенно перебросьте коня вглубь лагеря врага на место передовой пешки.'
  },
  {
    id: 'smoke_screen',
    name: 'Густой Туман',
    icon: '🌫️',
    rarity: 'COMMON',
    type: 'spell',
    manaCost: 2,
    duration: 2,
    description: 'Выберите область 2х2 клетки: на 2 хода в ней запрещены любые взятия фигур.',
    requiresTarget: 'square',
    targetHint: 'Кликните по клетке для левого-нижнего угла тумана 2х2',
    tip: 'В тумане запрещены взятия — спасайте атакованных офицеров в центре доски.'
  },
  {
    id: 'reinforcements',
    name: 'Зов Резерва',
    icon: '🎺',
    rarity: 'EPIC',
    type: 'spell',
    manaCost: 3,
    description: 'Возрождает новую пешку на любую свободную клетку вашего 1-го или 2-го ряда.',
    requiresTarget: 'spawn_square',
    targetHint: 'Кликните по свободной клетке на вашем 1-м или 2-м ряду',
    tip: 'Призывает пешку на свободную клетку. Закрывайте открытые линии и укрепляйте фланги.'
  },
  {
    id: 'kings_shield',
    name: 'Аура Стойкости',
    icon: '✨',
    rarity: 'COMMON',
    type: 'spell',
    manaCost: 2,
    duration: 2,
    description: 'Ваш Король получает иммунитет к шахам от пешек и коней на 2 хода.',
    requiresTarget: false,
    tip: 'Активируйте при вскрытии позиций, чтобы обезопасить монарха от шахов конями.'
  },
  {
    id: 'alchemist_gold',
    name: 'Трансмутация',
    icon: '🔮',
    rarity: 'COMMON',
    type: 'spell',
    manaCost: 1,
    description: 'Сбросьте эту карту и мгновенно получите 2 случайные новые карты в руку.',
    requiresTarget: false,
    tip: 'Сбросьте эту карту и получите 2 случайные новые карты для обновления стратегии.'
  },
  {
    id: 'time_warp',
    name: 'Власть Времени',
    icon: '⏳',
    rarity: 'RARE',
    type: 'spell',
    manaCost: 2,
    description: 'Добавляет вам +45 секунд на таймере и отнимает 15 секунд у соперника.',
    requiresTarget: false,
    tip: 'Добавляет время вам и отнимает у врага. Решает исход партий в цейтноте!'
  },
  {
    id: 'divine_storm',
    name: 'Небесный Гром',
    icon: '⚡',
    rarity: 'LEGENDARY',
    type: 'spell',
    manaCost: 5,
    description: 'Оглушает всех вражеских коней и слонов на 1 ход: они не смогут ходить на своём ходу.',
    requiresTarget: false,
    tip: 'Массовое оглушение! Все вражеские кони и слоны застывают во льду на 1 ход.'
  },
  {
    id: 'divine_shield',
    name: 'Божественный Щит',
    icon: '🛡️',
    rarity: 'RARE',
    type: 'spell',
    manaCost: 2,
    duration: 2,
    description: 'Выбранная ваша фигура получает золотой щит на 2 хода: соперник не может её срубить!',
    requiresTarget: 'my_piece',
    targetHint: 'Выберите вашу фигуру (кроме короля) для защиты щитом',
    tip: 'Защитите ценного ферзя или атакованную ладью от неминуемого взятия!'
  },
  {
    id: 'void_teleport',
    name: 'Портал Бездны',
    icon: '🌀',
    rarity: 'EPIC',
    type: 'spell',
    manaCost: 4,
    description: 'Мгновенно телепортирует выбранную вашу фигуру на любую свободную клетку вашей половины доски.',
    requiresTarget: 'void_teleport',
    targetHint: 'Шаг 1 из 2: Выберите вашу фигуру (кроме короля) для телепортации',
    tip: 'Спасает попавшую в окружение фигуру или перебрасывает ладью на нужную вертикаль.'
  },
  {
    id: 'mirror_image',
    name: 'Зеркальные Копии',
    icon: '🪞',
    rarity: 'COMMON',
    type: 'spell',
    manaCost: 2,
    description: 'Призывает до 2 призрачных пешек на свободные клетки вашего 2-го ряда.',
    requiresTarget: false,
    tip: 'Создает непроходимую стену перед королем и восстанавливает пешечную структуру.'
  },
  {
    id: 'polymorph',
    name: 'Превращение в Лягушку',
    icon: '🐸',
    rarity: 'EPIC',
    type: 'spell',
    manaCost: 4,
    duration: 2,
    description: 'Обращает вражеского офицера (ферзя, ладью, слона, коня) в беззащитную пешку на 2 хода!',
    requiresTarget: 'enemy_officer',
    targetHint: 'Выберите вражеского офицера (ферзь, ладья, слон, конь)',
    tip: 'Превратите вражеского ферзя в пешку и сокрушите оборону противника!'
  },
  {
    id: 'deadly_poison',
    name: 'Смертельный Яд',
    icon: '🧪',
    rarity: 'RARE',
    type: 'spell',
    manaCost: 2,
    duration: 2,
    description: 'Покрывает выбранную пешку ядом на 2 хода. Если враг возьмет её — нападавший погибает!',
    requiresTarget: 'my_pawn',
    targetHint: 'Выберите вашу пешку для нанесения яда',
    tip: 'Поставьте ядовитую пешку под бой чужого ферзя — враг не сможет её срубить без гибели.'
  },
  {
    id: 'whirlwind',
    name: 'Вихрь Ветров',
    icon: '🌪️',
    rarity: 'COMMON',
    type: 'spell',
    manaCost: 2,
    description: 'Порыв шторма сдвигает всех коней на доске на 1 клетку вправо (если клетка свободна).',
    requiresTarget: false,
    tip: 'Срывает планы вражеских коней и открывает новые неожиданные линии атаки.'
  },
  {
    id: 'iron_guard',
    name: 'Железный Панцирь',
    icon: '🛡️',
    rarity: 'COMMON',
    type: 'spell',
    manaCost: 1,
    duration: 2,
    description: 'Снимает заморозку с вашей фигуры и делает её неуязвимой ко льду и оглушению на 2 хода.',
    requiresTarget: 'my_piece',
    targetHint: 'Выберите вашу фигуру для наделения железной броней',
    tip: 'Быстро размораживайте своих атакующих ферзя и коней.'
  },
  {
    id: 'arcane_intellect',
    name: 'Чародейский Интеллект',
    icon: '📖',
    rarity: 'COMMON',
    type: 'spell',
    manaCost: 3,
    description: 'Вы мгновенно берёте 2 новые карты из колоды в руку.',
    requiresTarget: false,
    tip: 'Классический добор! Наполняет руку новыми тактическими возможностями.'
  },
  {
    id: 'mind_vision',
    name: 'Взгляд в Разум',
    icon: '👁️',
    rarity: 'RARE',
    type: 'spell',
    manaCost: 1,
    description: 'Создает в вашей руке точную копию случайной карты из руки соперника!',
    requiresTarget: false,
    tip: 'Узнайте, что задумал оппонент, и обратите его же магию против него.'
  },
  {
    id: 'confusion_step',
    name: 'Астральное Оглушение',
    icon: '💫',
    rarity: 'RARE',
    type: 'spell',
    manaCost: 2,
    description: 'Оглушает выбранную вражескую фигуру: она застывает во льду на 1 ход.',
    requiresTarget: 'enemy_piece',
    targetHint: 'Выберите вражескую фигуру (кроме короля) для оглушения',
    tip: 'Точечный контроль опасных фигур соперника.'
  },
  {
    id: 'meteor_strike',
    name: 'Метеоритный Удар',
    icon: '☄️',
    rarity: 'LEGENDARY',
    type: 'spell',
    manaCost: 5,
    description: 'Падающий метеорит мгновенно уничтожает выбранную вражескую пешку, коня или слона!',
    requiresTarget: 'enemy_light_piece',
    targetHint: 'Выберите вражескую пешку, коня или слона',
    tip: 'Ликвидируйте надоедливого коня-блокера или слона одним кликом!'
  },
  {
    id: 'blessing_kings',
    name: 'Благословение Королей',
    icon: '🌟',
    rarity: 'EPIC',
    type: 'spell',
    manaCost: 3,
    description: 'Пешка мгновенно возвышается и превращается в благородного Коня (🐎)!',
    requiresTarget: 'my_pawn',
    targetHint: 'Выберите вашу пешку для возвышения в Коня',
    tip: 'Превратите скромную пешку в мощную атакующую силу прямо в середине партии.'
  },
  {
    id: 'holy_well',
    name: 'Священный Источник',
    icon: '💧',
    rarity: 'COMMON',
    type: 'spell',
    manaCost: 1,
    description: 'Священная вода снимает заморозку и очищает ВСЕ ваши фигуры на доске!',
    requiresTarget: false,
    tip: 'Идеальный ответ на Небесный Гром и массовые заморозки соперника.'
  },
  {
    id: 'resurrection',
    name: 'Великое Возрождение',
    icon: '🕊️',
    rarity: 'LEGENDARY',
    type: 'spell',
    manaCost: 4,
    description: 'Возрождает могучего Коня на выбранной свободной клетке вашей базовой линии.',
    requiresTarget: 'spawn_square',
    targetHint: 'Кликните по свободной клетке вашего 1-го ряда',
    tip: 'Верните в строй боевую единицу при переходе в эндшпиль.'
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
    this.ply = 0;
  }

  reset() {
    this.state = TURN_STATE.ACTIVE;
    this.activeColor = 'w';
    this.ply = 0;
  }

  onTurnStart(color, ply) {
    this.activeColor = color;
    this.ply = ply;
    this.state = TURN_STATE.ACTIVE;
  }

  onMoveExecuted(color, ply) {
    this.activeColor = color;
    this.ply = ply;
    this.state = TURN_STATE.MOVED;
  }

  onTickStart(color, ply) {
    this.activeColor = color;
    this.ply = ply;
    this.state = TURN_STATE.TICKING;
  }

  onTurnCompleted(color, ply) {
    this.activeColor = color;
    this.ply = ply;
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
    this.divineShields = {}; // { [square]: { color, turns, createdPly, state } }
    this.ironGuards = {}; // { [square]: { color, turns, createdPly, state } }
    this.deadlyPoisons = {}; // { [square]: { color, turns, createdPly, state } }
    this.polymorphedPieces = {}; // { [square]: { originalType, color, turns, createdPly, state } }
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
    this.divineShields = {};
    this.ironGuards = {};
    this.deadlyPoisons = {};
    this.polymorphedPieces = {};
    this.infantryMarchActive = false;
  }

  drawCard() {
    if (this.hand.length >= this.maxHandSize) {
      return null; // Hand full
    }
    // Weighted random by rarity: Common 50%, Rare 35%, Epic 12%, Legendary 3%
    const rand = Math.random() * 100;
    let targetRarity = 'COMMON';
    if (rand > 97) targetRarity = 'LEGENDARY';
    else if (rand > 85) targetRarity = 'EPIC';
    else if (rand > 50) targetRarity = 'RARE';

    const pool = this.deck.filter(c => c.rarity === targetRarity);
    const chosen = pool[Math.floor(Math.random() * pool.length)] || this.deck[Math.floor(Math.random() * this.deck.length)];

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
    // If piece has Iron Guard, it is immune to freeze!
    if (this.isIronGuarded(square)) return;

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
    if (this.isIronGuarded(square)) return false;
    const fp = this.frozenPieces[square];
    if (!fp) return false;
    return fp.turns > 0 && fp.state !== EFFECT_STATE.EXPIRED;
  }

  cleanseFrozen(color) {
    for (const sq in this.frozenPieces) {
      if (this.frozenPieces[sq].color === color) {
        delete this.frozenPieces[sq];
      }
    }
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

  addDivineShield(square, color, turns = 2, currentPly = null) {
    const ply = (currentPly !== null && currentPly !== undefined) ? currentPly : this.currentPly;
    this.divineShields[square] = {
      square: square,
      color: color,
      turns: turns,
      createdPly: ply,
      state: EFFECT_STATE.APPLIED
    };
  }

  hasDivineShield(square) {
    const ds = this.divineShields[square];
    if (!ds) return false;
    return ds.turns > 0 && ds.state !== EFFECT_STATE.EXPIRED;
  }

  addIronGuard(square, color, turns = 2, currentPly = null) {
    const ply = (currentPly !== null && currentPly !== undefined) ? currentPly : this.currentPly;
    // Clear freeze immediately upon receiving Iron Guard
    if (this.frozenPieces[square]) delete this.frozenPieces[square];
    this.ironGuards[square] = {
      square: square,
      color: color,
      turns: turns,
      createdPly: ply,
      state: EFFECT_STATE.APPLIED
    };
  }

  isIronGuarded(square) {
    const ig = this.ironGuards[square];
    if (!ig) return false;
    return ig.turns > 0 && ig.state !== EFFECT_STATE.EXPIRED;
  }

  addDeadlyPoison(square, color, turns = 2, currentPly = null) {
    const ply = (currentPly !== null && currentPly !== undefined) ? currentPly : this.currentPly;
    this.deadlyPoisons[square] = {
      square: square,
      color: color,
      turns: turns,
      createdPly: ply,
      state: EFFECT_STATE.APPLIED
    };
  }

  hasDeadlyPoison(square) {
    const dp = this.deadlyPoisons[square];
    if (!dp) return false;
    return dp.turns > 0 && dp.state !== EFFECT_STATE.EXPIRED;
  }

  addPolymorph(square, originalType, color, turns = 2, currentPly = null) {
    const ply = (currentPly !== null && currentPly !== undefined) ? currentPly : this.currentPly;
    this.polymorphedPieces[square] = {
      square: square,
      originalType: originalType,
      color: color,
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

    for (const sq in this.divineShields) {
      const piece = chessGame.get(sq);
      if (!piece || piece.color !== this.divineShields[sq].color) {
        delete this.divineShields[sq];
      }
    }

    for (const sq in this.ironGuards) {
      const piece = chessGame.get(sq);
      if (!piece || piece.color !== this.ironGuards[sq].color) {
        delete this.ironGuards[sq];
      }
    }

    for (const sq in this.deadlyPoisons) {
      const piece = chessGame.get(sq);
      if (!piece || piece.color !== this.deadlyPoisons[sq].color) {
        delete this.deadlyPoisons[sq];
      }
    }

    for (const sq in this.polymorphedPieces) {
      const piece = chessGame.get(sq);
      if (!piece || piece.color !== this.polymorphedPieces[sq].color) {
        delete this.polymorphedPieces[sq];
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

    // 6. Decrement Divine Shields
    for (const sq in this.divineShields) {
      const ds = this.divineShields[sq];
      if (ds.color === justMovedColor) {
        if (ds.createdPly === ply) {
          ds.state = EFFECT_STATE.ACTIVE;
        } else {
          ds.turns--;
          if (ds.turns <= 0) {
            delete this.divineShields[sq];
          }
        }
      }
    }

    // 7. Decrement Iron Guards
    for (const sq in this.ironGuards) {
      const ig = this.ironGuards[sq];
      if (ig.color === justMovedColor) {
        if (ig.createdPly === ply) {
          ig.state = EFFECT_STATE.ACTIVE;
        } else {
          ig.turns--;
          if (ig.turns <= 0) {
            delete this.ironGuards[sq];
          }
        }
      }
    }

    // 8. Decrement Deadly Poisons
    for (const sq in this.deadlyPoisons) {
      const dp = this.deadlyPoisons[sq];
      if (dp.color === justMovedColor) {
        if (dp.createdPly === ply) {
          dp.state = EFFECT_STATE.ACTIVE;
        } else {
          dp.turns--;
          if (dp.turns <= 0) {
            delete this.deadlyPoisons[sq];
          }
        }
      }
    }

    // 9. Decrement Polymorphs & Restore Original Piece
    for (const sq in this.polymorphedPieces) {
      const pm = this.polymorphedPieces[sq];
      if (pm.color === justMovedColor) {
        if (pm.createdPly === ply) {
          pm.state = EFFECT_STATE.ACTIVE;
        } else {
          pm.turns--;
          if (pm.turns <= 0) {
            if (chessGame && typeof chessGame.get === 'function' && typeof chessGame.put === 'function') {
              const current = chessGame.get(sq);
              if (current && current.type === 'p' && current.color === pm.color) {
                chessGame.remove(sq);
                chessGame.put({ type: pm.originalType, color: pm.color }, sq);
                chessGame.load(chessGame.fen());
              }
            }
            delete this.polymorphedPieces[sq];
          }
        }
      }
    }

    // 10. Board synchronization
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
