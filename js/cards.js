// Card Database and Logic for Card Chess (Hearthstone-style spells & decrees)
const CARD_RARITIES = {
  COMMON: { name: 'Обычная', color: '#9ca3af', border: '#4b5563', bg: 'linear-gradient(135deg, #1f2937, #111827)' },
  RARE: { name: 'Редкая', color: '#60a5fa', border: '#2563eb', bg: 'linear-gradient(135deg, #1e3a8a, #0f172a)' },
  EPIC: { name: 'Эпическая', color: '#c084fc', border: '#9333ea', bg: 'linear-gradient(135deg, #581c87, #1e1b4b)' },
  LEGENDARY: { name: 'Легендарная', color: '#fbbf24', border: '#d97706', bg: 'linear-gradient(135deg, #78350f, #291003)' }
};

const CARD_CATEGORIES = {
  control: { id: 'control', name: 'Контроль и Лёд', icon: '❄️', color: '#38bdf8' },
  defense: { id: 'defense', name: 'Защита и Щиты', icon: '🛡️', color: '#fbbf24' },
  attack: { id: 'attack', name: 'Атака и Урон', icon: '⚔️', color: '#ef4444' },
  secrets: { id: 'secrets', name: 'Секреты и Ловушки', icon: '💣', color: '#a855f7' },
  magic: { id: 'magic', name: 'Магия и Добор', icon: '📖', color: '#818cf8' },
  tactics: { id: 'tactics', name: 'Тактика и Перемещение', icon: '🌀', color: '#34d399' }
};

const CARDS_DATABASE = [
  // =========================================================================
  // --- 1. СЕКРЕТЫ И ЛОВУШКИ (Открытая контр-игра и тайные замыслы) ---
  // =========================================================================
  {
    id: 'curse_knight',
    name: 'Оковы Кентавра',
    icon: '🐎',
    rarity: 'RARE',
    type: 'decree',
    manaCost: 2,
    category: 'secrets',
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
    category: 'secrets',
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
    category: 'secrets',
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
    category: 'secrets',
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
    id: 'tax_castle',
    name: 'Запрет на Бункер',
    icon: '🛡️',
    rarity: 'COMMON',
    type: 'decree',
    manaCost: 2,
    category: 'secrets',
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
    category: 'secrets',
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
    category: 'secrets',
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
    category: 'secrets',
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
    category: 'secrets',
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
    category: 'secrets',
    duration: 3,
    description: 'Секрет: следующее заклинание соперника полностью нейтрализуется и развеивается в пыль!',
    trigger: 'Розыгрыш заклинания соперником',
    penalty: 'Полная отмена эффекта заклинания',
    penaltyType: 'counterspell',
    requiresTarget: false,
    tip: 'Разрушьте коварный замысел противника до того, как он его осуществит.'
  },
  {
    id: 'spell_reflect',
    name: 'Отражающий Щит',
    icon: '🪞',
    rarity: 'LEGENDARY',
    type: 'decree',
    manaCost: 3,
    category: 'secrets',
    duration: 3,
    description: 'Легендарный секрет: следующее направленное заклинание врага нейтрализуется, а вы берете +2 карты!',
    trigger: 'Враг разыгрывает заклинание',
    penalty: 'Нейтрализация и +2 карты вам',
    penaltyType: 'spell_reflect',
    requiresTarget: false,
    tip: 'Вершина контрмагии! Обращает агрессию заклинателя в мощный приток ресурсов.'
  },
  {
    id: 'doomsday',
    name: 'Судный День',
    icon: '⏳',
    rarity: 'LEGENDARY',
    type: 'decree',
    manaCost: 4,
    category: 'secrets',
    duration: 3,
    description: 'Часы Судного Дня: если за 3 хода враг не возьмёт вашу фигуру — одна его пешка испаряется с доски!',
    trigger: 'Пассивность соперника 3 хода',
    penalty: 'Уничтожение пешки соперника',
    penaltyType: 'doomsday',
    requiresTarget: false,
    tip: 'Принуждает врага атаковать на невыгодных условиях или терпеть неминуемые потери.'
  },

  // =========================================================================
  // --- 2. КОНТРОЛЬ И ЛЁД (Оглушение, замедление и превращения) ---
  // =========================================================================
  {
    id: 'freeze_piece',
    name: 'Ледяная Стрела',
    icon: '❄️',
    rarity: 'RARE',
    type: 'spell',
    manaCost: 2,
    category: 'control',
    description: 'Заморозьте фигуру врага (кроме короля) на 1 ход: она не сможет двигаться и рубить.',
    requiresTarget: 'enemy_piece',
    targetHint: 'Кликните по фигуре врага (кроме короля)',
    tip: 'Если вам объявили шах или ферзь навис над королём — заморозьте угрозу и спаситесь!'
  },
  {
    id: 'confusion_step',
    name: 'Астральное Оглушение',
    icon: '💫',
    rarity: 'RARE',
    type: 'spell',
    manaCost: 2,
    category: 'control',
    description: 'Оглушает выбранную вражескую фигуру: она застывает во льду на 1 ход.',
    requiresTarget: 'enemy_piece',
    targetHint: 'Выберите вражескую фигуру (кроме короля) для оглушения',
    tip: 'Точечный контроль опасных фигур соперника перед решающим ударом.'
  },
  {
    id: 'queen_burden',
    name: 'Тяжёлая Корона',
    icon: '👑',
    rarity: 'EPIC',
    type: 'decree',
    manaCost: 4,
    category: 'control',
    duration: 2,
    description: 'Ферзь врага перегружен: следующие 2 хода он ходит максимум на 2 клетки.',
    trigger: 'Ход Ферзём дальше 2 клеток',
    penalty: 'Ход блокируется (макс. 2 клетки)',
    penaltyType: 'queen_slow',
    requiresTarget: false,
    tip: 'Связывает руки ферзю соперника, не давая ему свободно летать через всю доску.'
  },
  {
    id: 'polymorph',
    name: 'Превращение в Лягушку',
    icon: '🐸',
    rarity: 'EPIC',
    type: 'spell',
    manaCost: 4,
    category: 'control',
    duration: 2,
    description: 'Обращает вражеского офицера (ферзя, ладью, слона, коня) в беззащитную пешку на 2 хода!',
    requiresTarget: 'enemy_officer',
    targetHint: 'Выберите вражеского офицера (ферзь, ладья, слон, конь)',
    tip: 'Превратите вражеского ферзя в пешку и сокрушите оборону противника!'
  },
  {
    id: 'divine_storm',
    name: 'Небесный Гром',
    icon: '⚡',
    rarity: 'LEGENDARY',
    type: 'spell',
    manaCost: 5,
    category: 'control',
    description: 'Оглушает всех вражеских коней и слонов на 1 ход: они не смогут ходить на своём ходу.',
    requiresTarget: false,
    tip: 'Массовое оглушение! Все вражеские кони и слоны застывают во льду на 1 ход.'
  },
  {
    id: 'chain_lightning',
    name: 'Цепная Молния',
    icon: '⚡',
    rarity: 'EPIC',
    type: 'spell',
    manaCost: 4,
    category: 'control',
    description: 'Молния поражает выбранную фигуру врага льдом на 1 ход и перекидывается на ещё одну соседнюю фигуру!',
    requiresTarget: 'enemy_piece',
    targetHint: 'Выберите вражескую фигуру для удара молнией',
    tip: 'Выводит из строя сразу двух защитников в скоплении вражеских сил.'
  },
  {
    id: 'frostmourne',
    name: 'Ледяная Скорбь',
    icon: '🗡️',
    rarity: 'EPIC',
    type: 'spell',
    manaCost: 3,
    category: 'control',
    duration: 2,
    description: 'Зачаровывает вашу фигуру: следующие 2 хода любая взятая ею вражеская фигура замораживает соседей!',
    requiresTarget: 'my_piece',
    targetHint: 'Выберите вашу легкую фигуру или ладью',
    tip: 'Превращает атакующего в источник заморозки для всего окружения.'
  },
  {
    id: 'blizzard',
    name: 'Снежная Буря',
    icon: '🌨️',
    rarity: 'LEGENDARY',
    type: 'spell',
    manaCost: 6,
    category: 'control',
    description: 'Леденящий буран накрывает вражескую армию: ВСЕ пешки соперника замерзают во льду на 1 ход!',
    requiresTarget: false,
    tip: 'Парализует всю пешечную структуру противника и выигрывает решающий темп.'
  },

  // =========================================================================
  // --- 3. ЗАЩИТА И ЩИТЫ (Неуязвимость, очищение и броня) ---
  // =========================================================================
  {
    id: 'divine_shield',
    name: 'Божественный Щит',
    icon: '🛡️',
    rarity: 'RARE',
    type: 'spell',
    manaCost: 2,
    category: 'defense',
    duration: 2,
    description: 'Выбранная ваша фигура получает золотой щит на 2 хода: соперник не может её срубить!',
    requiresTarget: 'my_piece',
    targetHint: 'Выберите вашу фигуру (кроме короля) для защиты щитом',
    tip: 'Защитите ценного ферзя или атакованную ладью от неминуемого взятия!'
  },
  {
    id: 'iron_guard',
    name: 'Железный Панцирь',
    icon: '⚙️',
    rarity: 'COMMON',
    type: 'spell',
    manaCost: 1,
    category: 'defense',
    duration: 2,
    description: 'Снимает заморозку с вашей фигуры и делает её неуязвимой ко льду и оглушению на 2 хода.',
    requiresTarget: 'my_piece',
    targetHint: 'Выберите вашу фигуру для наделения железной броней',
    tip: 'Быстро размораживайте своих атакующих ферзя и коней.'
  },
  {
    id: 'kings_shield',
    name: 'Аура Стойкости',
    icon: '✨',
    rarity: 'COMMON',
    type: 'spell',
    manaCost: 2,
    category: 'defense',
    duration: 2,
    description: 'Ваш Король получает иммунитет к шахам от пешек и коней на 2 хода.',
    requiresTarget: false,
    tip: 'Активируйте при вскрытии позиций, чтобы обезопасить монарха от шахов конями.'
  },
  {
    id: 'smoke_screen',
    name: 'Густой Туман',
    icon: '🌫️',
    rarity: 'COMMON',
    type: 'spell',
    manaCost: 2,
    category: 'defense',
    duration: 2,
    description: 'Выберите область 2х2 клетки: на 2 хода в ней запрещены любые взятия фигур.',
    requiresTarget: 'square',
    targetHint: 'Кликните по клетке для левого-нижнего угла тумана 2х2',
    tip: 'В тумане запрещены взятия — спасайте атакованных офицеров в центре доски.'
  },
  {
    id: 'holy_well',
    name: 'Священный Источник',
    icon: '💧',
    rarity: 'COMMON',
    type: 'spell',
    manaCost: 1,
    category: 'defense',
    description: 'Священная вода снимает заморозку и очищает ВСЕ ваши фигуры на доске!',
    requiresTarget: false,
    tip: 'Идеальный ответ на Небесный Гром и массовые заморозки соперника.'
  },
  {
    id: 'healing_prayer',
    name: 'Слово Очищения',
    icon: '🕊️',
    rarity: 'COMMON',
    type: 'spell',
    manaCost: 1,
    category: 'defense',
    description: 'Мгновенно развеивает ВСЕ вражеские указы и проклятия, наложенные соперником на вас!',
    requiresTarget: false,
    tip: 'Снимает оковы кентавра, осадные налоги и любые дебафы врага одним нажатием.'
  },
  {
    id: 'mirror_image',
    name: 'Зеркальные Копии',
    icon: '🪞',
    rarity: 'COMMON',
    type: 'spell',
    manaCost: 2,
    category: 'defense',
    description: 'Призывает до 2 призрачных пешек на свободные клетки вашего 2-го ряда.',
    requiresTarget: false,
    tip: 'Создает непроходимую стену перед королем и восстанавливает пешечную структуру.'
  },
  {
    id: 'shield_wall',
    name: 'Стена Щитов',
    icon: '🛡️',
    rarity: 'COMMON',
    type: 'spell',
    manaCost: 2,
    category: 'defense',
    duration: 2,
    description: 'Все ваши пешки встают в сомкнутый строй на 2 хода: их нельзя заморозить или оглушить!',
    requiresTarget: false,
    tip: 'Укрепляет пешечный центр и защищает от вражеских стрел и буранов.'
  },
  {
    id: 'ice_barrier',
    name: 'Ледяная Преграда',
    icon: '🧊',
    rarity: 'RARE',
    type: 'decree',
    manaCost: 2,
    category: 'defense',
    duration: 3,
    description: 'Секрет: при объявлении шаха вашему Королю атакующая фигура застывает во льду на 1 ход, а шах снимается!',
    trigger: 'Объявление шаха вашему Королю',
    penalty: 'Заморозка агрессора и спасение монарха',
    penaltyType: 'ice_barrier',
    requiresTarget: false,
    tip: 'Спасает от неожиданного мата или двойного шаха в критический момент.'
  },

  // =========================================================================
  // --- 4. АТАКА И УРОН (Уничтожение, яды, обстрелы и прорывы) ---
  // =========================================================================
  {
    id: 'deadly_poison',
    name: 'Смертельный Яд',
    icon: '🧪',
    rarity: 'RARE',
    type: 'spell',
    manaCost: 2,
    category: 'attack',
    duration: 2,
    description: 'Покрывает выбранную пешку ядом на 2 хода. Если враг возьмет её — нападавший погибает!',
    requiresTarget: 'my_pawn',
    targetHint: 'Выберите вашу пешку для нанесения яда',
    tip: 'Поставьте ядовитую пешку под бой чужого ферзя — враг не сможет её срубить без гибели.'
  },
  {
    id: 'meteor_strike',
    name: 'Метеоритный Удар',
    icon: '☄️',
    rarity: 'LEGENDARY',
    type: 'spell',
    manaCost: 5,
    category: 'attack',
    description: 'Падающий метеорит мгновенно уничтожает выбранную вражескую пешку, коня или слона!',
    requiresTarget: 'enemy_light_piece',
    targetHint: 'Выберите вражескую пешку, коня или слона',
    tip: 'Ликвидируйте надоедливого коня-блокера или слона одним кликом!'
  },
  {
    id: 'shadow_bolt',
    name: 'Теневой Разряд',
    icon: '🌑',
    rarity: 'RARE',
    type: 'spell',
    manaCost: 3,
    category: 'attack',
    description: 'Теневая волна отбрасывает выбранную вражескую фигуру назад на 1 клетку к её тылу!',
    requiresTarget: 'enemy_piece',
    targetHint: 'Выберите фигуру врага (кроме короля), позади которой свободно',
    tip: 'Сбрасывает вражеских коней и ферзей с выгодных атакующих позиций.'
  },
  {
    id: 'arrow_volley',
    name: 'Шквал Стрел',
    icon: '🏹',
    rarity: 'COMMON',
    type: 'spell',
    manaCost: 2,
    category: 'attack',
    description: 'Град стрел накрывает выбранную 4-ю или 5-ю горизонталь: все пешки врага на ней застывают на 1 ход.',
    requiresTarget: 'square',
    targetHint: 'Кликните по любой клетке на 4-й или 5-й горизонтали',
    tip: 'Останавливает пешечную лавину соперника прямо на передовой линии.'
  },
  {
    id: 'fire_trail',
    name: 'Огненный След',
    icon: '🔥',
    rarity: 'EPIC',
    type: 'spell',
    manaCost: 3,
    category: 'attack',
    duration: 2,
    description: 'Поджигает выбранную клетку на 2 хода: вражеская фигура, наступив на огонь, мгновенно сгорает!',
    requiresTarget: 'empty_square',
    targetHint: 'Выберите пустую клетку для создания огненной ловушки',
    tip: 'Смертельная огненная брешь на пути главного маршрута вражеских офицеров.'
  },

  // =========================================================================
  // --- 5. МАГИЯ И ДОБОР (Ресурсы, карты, копирование и манипуляции временем) ---
  // =========================================================================
  {
    id: 'alchemist_gold',
    name: 'Трансмутация',
    icon: '🔮',
    rarity: 'COMMON',
    type: 'spell',
    manaCost: 1,
    category: 'magic',
    description: 'Сбросьте эту карту и мгновенно получите 2 случайные новые карты в руку.',
    requiresTarget: false,
    tip: 'Сбросьте эту карту и получите 2 случайные новые карты для обновления стратегии.'
  },
  {
    id: 'arcane_intellect',
    name: 'Чародейский Интеллект',
    icon: '📖',
    rarity: 'COMMON',
    type: 'spell',
    manaCost: 3,
    category: 'magic',
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
    category: 'magic',
    description: 'Создает в вашей руке точную копию случайной карты из руки соперника!',
    requiresTarget: false,
    tip: 'Узнайте, что задумал оппонент, и обратите его же магию против него.'
  },
  {
    id: 'time_warp',
    name: 'Власть Времени',
    icon: '⏳',
    rarity: 'RARE',
    type: 'spell',
    manaCost: 2,
    category: 'magic',
    description: 'Добавляет вам +45 секунд на таймере и отнимает 15 секунд у соперника.',
    requiresTarget: false,
    tip: 'Добавляет время вам и отнимает у врага. Решает исход партий в цейтноте!'
  },
  {
    id: 'blood_pact',
    name: 'Кровавый Пакт',
    icon: '🩸',
    rarity: 'COMMON',
    type: 'spell',
    manaCost: 1,
    category: 'magic',
    description: 'Вы жертвуете 20 секунд своего времени и мгновенно берёте 2 карты из колоды!',
    requiresTarget: false,
    tip: 'Быстрый обмен времени на решающее преимущество по картам в руке.'
  },
  {
    id: 'spell_theft',
    name: 'Похищение Магии',
    icon: '🗝️',
    rarity: 'RARE',
    type: 'spell',
    manaCost: 2,
    category: 'magic',
    description: 'Проникает в библиотеку оппонента и вытягивает случайное заклинание прямо в вашу руку!',
    requiresTarget: false,
    tip: 'Оставляет соперника без ценного козыря и пополняет ваш арсенал.'
  },

  // =========================================================================
  // --- 6. ТАКТИКА И ПЕРЕМЕЩЕНИЕ (Маневры, призывы, возвышение и рокировки) ---
  // =========================================================================
  {
    id: 'infantry_march',
    name: 'Марш Пехоты',
    icon: '⚔️',
    rarity: 'COMMON',
    type: 'spell',
    manaCost: 1,
    category: 'tactics',
    description: 'Выберите вашу пешку: она мгновенно шагает на 1 клетку вперёд без траты хода!',
    requiresTarget: 'my_pawn',
    targetHint: 'Кликните по вашей пешке, перед которой есть свободная клетка',
    tip: 'Бесплатный темп! Продвиньте пешку вперёд без траты хода — отлично для захвата центра.'
  },
  {
    id: 'shadow_swap',
    name: 'Обмен Теней',
    icon: '👥',
    rarity: 'RARE',
    type: 'spell',
    manaCost: 3,
    category: 'tactics',
    description: 'Выберите своего коня и свою пешку: они мгновенно меняются местами на доске!',
    requiresTarget: 'shadow_swap',
    targetHint: 'Шаг 1 из 2: Выберите вашего Коня 🐎',
    tip: 'Мгновенно перебросьте коня вглубь лагеря врага на место передовой пешки.'
  },
  {
    id: 'void_teleport',
    name: 'Портал Бездны',
    icon: '🌀',
    rarity: 'EPIC',
    type: 'spell',
    manaCost: 4,
    category: 'tactics',
    description: 'Мгновенно телепортирует выбранную вашу фигуру на любую свободную клетку вашей половины доски.',
    requiresTarget: 'void_teleport',
    targetHint: 'Шаг 1 из 2: Выберите вашу фигуру (кроме короля) для телепортации',
    tip: 'Спасает попавшую в окружение фигуру или перебрасывает ладью на нужную вертикаль.'
  },
  {
    id: 'reinforcements',
    name: 'Зов Резерва',
    icon: '🎺',
    rarity: 'EPIC',
    type: 'spell',
    manaCost: 3,
    category: 'tactics',
    description: 'Возрождает новую пешку на любую свободную клетку вашего 1-го или 2-го ряда.',
    requiresTarget: 'spawn_square',
    targetHint: 'Кликните по свободной клетке на вашем 1-м или 2-м ряду',
    tip: 'Призывает пешку на свободную клетку. Закрывайте открытые линии и укрепляйте фланги.'
  },
  {
    id: 'whirlwind',
    name: 'Вихрь Ветров',
    icon: '🌪️',
    rarity: 'COMMON',
    type: 'spell',
    manaCost: 2,
    category: 'tactics',
    description: 'Порыв шторма сдвигает всех коней на доске на 1 клетку вправо (если клетка свободна).',
    requiresTarget: false,
    tip: 'Срывает планы вражеских коней и открывает новые неожиданные линии атаки.'
  },
  {
    id: 'blessing_kings',
    name: 'Благословение Королей',
    icon: '🌟',
    rarity: 'EPIC',
    type: 'spell',
    manaCost: 3,
    category: 'tactics',
    description: 'Пешка мгновенно возвышается и превращается в благородного Коня (🐎)!',
    requiresTarget: 'my_pawn',
    targetHint: 'Выберите вашу пешку для возвышения в Коня',
    tip: 'Превратите скромную пешку в мощную атакующую силу прямо в середине партии.'
  },
  {
    id: 'resurrection',
    name: 'Великое Возрождение',
    icon: '🕊️',
    rarity: 'LEGENDARY',
    type: 'spell',
    manaCost: 4,
    category: 'tactics',
    description: 'Возрождает могучего Коня на выбранной свободной клетке вашей базовой линии.',
    requiresTarget: 'spawn_square',
    targetHint: 'Кликните по свободной клетке вашего 1-го ряда',
    tip: 'Верните в строй боевую единицу при переходе в эндшпиль.'
  },
  {
    id: 'kings_gambit',
    name: 'Королевский Гамбит',
    icon: '👑',
    rarity: 'EPIC',
    type: 'spell',
    manaCost: 4,
    category: 'tactics',
    description: 'Мгновенная рокировка: Король меняется местами с выбранной ладьёй в обход любых препятствий!',
    requiresTarget: 'my_rook',
    targetHint: 'Выберите вашу Ладью для мгновенной рокировки',
    tip: 'Экстренная эвакуация короля из-под атаки в безопасный угол доски.'
  },
  {
    id: 'earthquake',
    name: 'Землетрясение',
    icon: '🌋',
    rarity: 'RARE',
    type: 'spell',
    manaCost: 3,
    category: 'tactics',
    description: 'Земля дрожит: все заблокированные пешки на доске сдвигаются на 1 шаг влево, взламывая центр!',
    requiresTarget: false,
    tip: 'Ломает статичные пешечные цепи и открывает оперативный простор для ладей.'
  },
  {
    id: 'coronation',
    name: 'Коронация',
    icon: '👑',
    rarity: 'LEGENDARY',
    type: 'spell',
    manaCost: 5,
    category: 'tactics',
    description: 'Великий триумф: выбранная союзная Ладья или Слон возвышается до могучего Ферзя (👑)!',
    requiresTarget: 'my_officer',
    targetHint: 'Выберите вашу Ладью или Слона для возвышения',
    tip: 'Создайте второго Ферзя на доске и обрушьте сокрушительную мощь на противника!'
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
  constructor(customCardIds = null) {
    this.deckCardIds = (customCardIds && Array.isArray(customCardIds) && customCardIds.length > 0)
      ? [...customCardIds]
      : null;

    this.masterDeck = this._buildMasterDeck(this.deckCardIds);
    this.deck = [...this.masterDeck];
    this.drawPile = this._shuffle([...this.masterDeck]);
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
    this.fireTrails = {}; // { [square]: { color, turns, createdPly, state } }
    this.infantryMarchActive = false;
  }

  _buildMasterDeck(cardIds) {
    if (!cardIds || !Array.isArray(cardIds) || cardIds.length === 0) {
      return [...CARDS_DATABASE];
    }
    const dbMap = new Map(CARDS_DATABASE.map(c => [c.id, c]));
    const list = cardIds.map(id => dbMap.get(id)).filter(Boolean);
    return list.length > 0 ? list : [...CARDS_DATABASE];
  }

  _shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  reset(newCustomCardIds = null) {
    if (newCustomCardIds) {
      this.deckCardIds = [...newCustomCardIds];
      this.masterDeck = this._buildMasterDeck(this.deckCardIds);
      this.deck = [...this.masterDeck];
    }
    this.drawPile = this._shuffle([...this.masterDeck]);
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
    this.fireTrails = {};
    this.infantryMarchActive = false;
  }

  drawCard() {
    if (this.hand.length >= this.maxHandSize) {
      return null; // Hand full
    }
    // If draw pile is empty, reshuffle masterDeck so players never run out
    if (this.drawPile.length === 0) {
      this.drawPile = this._shuffle([...this.masterDeck]);
    }

    const chosen = this.drawPile.pop() || this.deck[Math.floor(Math.random() * this.deck.length)];

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

  addFireTrail(square, color, turns = 2, currentPly = null) {
    const ply = (currentPly !== null && currentPly !== undefined) ? currentPly : this.currentPly;
    this.fireTrails[square] = {
      square: square,
      color: color,
      turns: turns,
      createdPly: ply,
      state: EFFECT_STATE.APPLIED
    };
  }

  hasFireTrail(square) {
    const ft = this.fireTrails[square];
    if (!ft) return false;
    return ft.turns > 0 && ft.state !== EFFECT_STATE.EXPIRED;
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

    // 9. Decrement Fire Trails
    for (const sq in this.fireTrails) {
      const ft = this.fireTrails[sq];
      if (ft.color === justMovedColor) {
        if (ft.createdPly === ply) {
          ft.state = EFFECT_STATE.ACTIVE;
        } else {
          ft.turns--;
          if (ft.turns <= 0) {
            delete this.fireTrails[sq];
          }
        }
      }
    }

    // 10. Decrement Polymorphs & Restore Original Piece
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

    // 11. Board synchronization
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
  window.CARD_CATEGORIES = CARD_CATEGORIES;
  window.CARDS_DATABASE = CARDS_DATABASE;
  window.CardDeckManager = CardDeckManager;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    EFFECT_STATE,
    TURN_STATE,
    TurnStateMachine,
    CARD_RARITIES,
    CARD_CATEGORIES,
    CARDS_DATABASE,
    CardDeckManager
  };
}
