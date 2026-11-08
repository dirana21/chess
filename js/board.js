// Interactive Chess Board renderer with Drag & Drop, Touch support, and animations
class ChessBoardUI {
  constructor(containerEl, options = {}) {
    this.container = containerEl;
    this.options = Object.assign({
      orientation: 'w', // 'w' or 'b'
      interactive: true,
      onMove: null, // callback(from, to, promotion)
      deckManager: null, // reference to CardDeckManager
      onSquareTargeted: null // callback(square) for card targeting
    }, options);

    this.game = null; // instance of Chess
    this.deckManager = this.options.deckManager;
    this.targetingMode = null; // 'empty_square', 'enemy_piece', etc.
    this.orientation = this.options.orientation;
    this.selectedSquare = null;
    this.legalMoves = [];
    this.lastMove = null;
    this.pendingPromotion = null;

    // Drag state
    this.draggedPieceEl = null;
    this.dragOriginSquare = null;

    this.initDOM();
  }

  setGame(game) {
    this.game = game;
    this.selectedSquare = null;
    this.legalMoves = [];
    this.lastMove = null;
    this.render();
  }

  setOrientation(color) {
    this.orientation = color === 'b' ? 'b' : 'w';
    this.render();
  }

  flip() {
    this.setOrientation(this.orientation === 'w' ? 'b' : 'w');
  }

  initDOM() {
    this.container.innerHTML = `
      <div class="chess-board-wrapper">
        <div class="chess-board" id="board-grid"></div>
        <div class="promotion-modal hidden" id="promotion-modal">
          <div class="promotion-dialog">
            <div class="promotion-title">Выберите фигуру</div>
            <div class="promotion-choices" id="promotion-choices"></div>
          </div>
        </div>
      </div>
    `;

    this.boardGrid = this.container.querySelector('#board-grid');
    this.promotionModal = this.container.querySelector('#promotion-modal');
    this.promotionChoices = this.container.querySelector('#promotion-choices');

    this.render();
  }

  render() {
    if (!this.boardGrid) return;
    this.boardGrid.innerHTML = '';

    const ranks = this.orientation === 'w' ? [8,7,6,5,4,3,2,1] : [1,2,3,4,5,6,7,8];
    const files = this.orientation === 'w' ? ['a','b','c','d','e','f','g','h'] : ['h','g','f','e','d','c','b','a'];

    const boardState = this.game ? this.game.board() : null;
    const inCheck = this.game ? this.game.in_check() : false;
    const turn = this.game ? this.game.turn() : 'w';

    for (let r = 0; r < 8; r++) {
      const rankNum = ranks[r];
      for (let f = 0; f < 8; f++) {
        const fileChar = files[f];
        const square = fileChar + rankNum;
        const isLight = (files.indexOf(fileChar) + rankNum) % 2 !== 0;

        const sqEl = document.createElement('div');
        sqEl.className = `square ${isLight ? 'light' : 'dark'}`;
        sqEl.dataset.square = square;

        // Rank / File notation coordinates on edge squares
        if (f === 0) {
          const rankLabel = document.createElement('span');
          rankLabel.className = 'coord rank-coord';
          rankLabel.textContent = rankNum;
          sqEl.appendChild(rankLabel);
        }
        if (r === 7) {
          const fileLabel = document.createElement('span');
          fileLabel.className = 'coord file-coord';
          fileLabel.textContent = fileChar;
          sqEl.appendChild(fileLabel);
        }

        // Highlight last move
        if (this.lastMove && (this.lastMove.from === square || this.lastMove.to === square)) {
          sqEl.classList.add('last-move');
        }

        // Highlight selected
        if (this.selectedSquare === square) {
          sqEl.classList.add('selected');
        }

        // Check highlight on king
        if (inCheck && this.game) {
          const pieceOnSq = this.getPieceAt(square);
          if (pieceOnSq && pieceOnSq.type === 'k' && pieceOnSq.color === turn) {
            sqEl.classList.add('in-check');
          }
        }

        // --- Card Effects Overlays ---
        if (this.deckManager) {
          // Frozen piece
          if (this.deckManager.isPieceFrozen(square)) {
            sqEl.classList.add('frozen-square');
            const iceOverlay = document.createElement('div');
            iceOverlay.className = 'ice-overlay';
            iceOverlay.innerHTML = '❄️';
            sqEl.appendChild(iceOverlay);
          }

          // Forbidden square
          if (this.deckManager.forbiddenSquares[square]) {
            sqEl.classList.add('forbidden-square');
            const skullOverlay = document.createElement('div');
            skullOverlay.className = 'forbidden-overlay';
            skullOverlay.innerHTML = '☠️';
            sqEl.appendChild(skullOverlay);
          }

          // Smoke screen
          if (this.deckManager.smokeArea && this.deckManager.smokeArea.squares.includes(square)) {
            sqEl.classList.add('smoke-square');
          }
        }

        // Render piece
        const piece = this.getPieceAt(square);
        if (piece) {
          const pieceEl = document.createElement('div');
          pieceEl.className = `piece ${piece.color === 'w' ? 'white-piece' : 'black-piece'}`;
          
          // Check if piece is under active decree
          if (this.deckManager && this.deckManager.activeDecrees.some(d => d.penaltyTarget === piece.type && d.owner !== piece.color)) {
            pieceEl.classList.add('cursed-piece');
          }

          // Check if King has King's Shield active
          if (this.deckManager && this.deckManager.kingsShield && this.deckManager.kingsShield[piece.color] > 0 && piece.type === 'k') {
            sqEl.classList.add('king-shielded-square');
          }

          pieceEl.innerHTML = getPieceSvg(piece.type, piece.color);
          pieceEl.dataset.square = square;

          // Drag & Touch support (only if not frozen)
          const isFrozen = this.deckManager && this.deckManager.isPieceFrozen(square);
          if (!isFrozen) {
            this._bindPieceEvents(pieceEl, square);
          } else {
            pieceEl.style.cursor = 'not-allowed';
            pieceEl.style.filter = 'drop-shadow(0 0 10px #38bdf8)';
            pieceEl.addEventListener('click', (e) => {
              e.stopPropagation();
              this.onSquareClick(square, e);
            });
          }

          sqEl.appendChild(pieceEl);
        }

        // Targeting mode highlight
        if (this.targetingMode) {
          if (this.selectedTargetSquare && this.selectedTargetSquare === square) {
            sqEl.classList.add('targeting-selected');
          } else if (this._isTargetValid(square, piece)) {
            sqEl.classList.add('targetable-square');
            if (this.targetingMode === 'my_knight') sqEl.classList.add('targetable-knight');
            else if (this.targetingMode === 'my_pawn') sqEl.classList.add('targetable-pawn');
            else if (this.targetingMode === 'enemy_piece') sqEl.classList.add('targetable-enemy');
            else if (this.targetingMode === 'empty_square') sqEl.classList.add('targetable-empty');
          }
        }

        // Destination dot or capture ring
        const legalMove = this.legalMoves.find(m => m.to === square);
        if (legalMove) {
          const hintEl = document.createElement('div');
          hintEl.className = piece ? 'hint-capture' : 'hint-move';
          sqEl.appendChild(hintEl);
        }

        sqEl.addEventListener('click', (e) => this.onSquareClick(square, e));
        this.boardGrid.appendChild(sqEl);
      }
    }
  }

  setTargetingMode(mode, selectedSquare = null) {
    this.targetingMode = mode;
    this.selectedTargetSquare = selectedSquare;
    this.selectedSquare = null;
    this.legalMoves = [];
    this.render();
  }

  _isTargetValid(square, piece) {
    if (!this.targetingMode) return false;
    const turn = this.options.playerColor || (this.game ? this.game.turn() : 'w');
    const opponent = turn === 'w' ? 'b' : 'w';

    switch (this.targetingMode) {
      case 'my_knight':
        return piece !== null && piece.color === turn && piece.type === 'n';
      case 'my_pawn': {
        if (!piece || piece.color !== turn || piece.type !== 'p') return false;
        if (this.selectedTargetSquare) return true; // Step 2 of shadow swap
        // For infantry march, square ahead must be on board and unoccupied
        const fChar = square[0];
        const cRank = parseInt(square[1], 10);
        const nRank = turn === 'w' ? cRank + 1 : cRank - 1;
        if (nRank < 1 || nRank > 8) return false;
        return this.getPieceAt(fChar + nRank) === null;
      }
      case 'empty_square':
        return piece === null;
      case 'enemy_piece':
        return piece !== null && piece.color === opponent && piece.type !== 'k';
      case 'square':
        return true;
      case 'spawn_square':
        if (piece !== null) return false;
        const rank = parseInt(square[1], 10);
        return turn === 'w' ? (rank === 1 || rank === 2) : (rank === 7 || rank === 8);
      default:
        return false;
    }
  }

  _filterMovesByDecrees(moves, from) {
    if (!this.deckManager || !moves) return moves;
    const piece = this.getPieceAt(from);
    if (!piece) return moves;

    return moves.filter(m => {
      // 1. Frozen piece cannot move
      if (this.deckManager.isPieceFrozen(m.from)) return false;

      // 2. Blind Bishop: cannot capture
      if (piece.type === 'b' && m.captured) {
        const isBlinded = this.deckManager.activeDecrees.some(d => d.id === 'curse_bishop' && d.owner !== piece.color);
        if (isBlinded) return false;
      }

      // 3. Heavy Queen: max 2 squares distance
      if (piece.type === 'q') {
        const isHeavy = this.deckManager.activeDecrees.some(d => d.id === 'queen_burden' && d.owner !== piece.color);
        if (isHeavy) {
          const fileDiff = Math.abs(from.charCodeAt(0) - m.to.charCodeAt(0));
          const rankDiff = Math.abs(parseInt(from[1], 10) - parseInt(m.to[1], 10));
          if (fileDiff > 2 || rankDiff > 2) return false;
        }
      }

      // 4. Smoke Screen: no captures inside smoke
      if (this.deckManager.smokeArea && m.captured) {
        if (this.deckManager.smokeArea.squares.includes(m.to)) return false;
      }

      return true;
    });
  }

  getPieceAt(square) {
    if (!this.game) return null;
    const file = square.charCodeAt(0) - 97;
    const rank = 8 - parseInt(square[1], 10);
    const board = this.game.board();
    if (board && board[rank] && board[rank][file]) {
      return board[rank][file];
    }
    return null;
  }

  onSquareClick(square, event) {
    if (!this.options.interactive || !this.game || this.game.game_over()) return;

    // Handle Targeting Mode for Spells
    if (this.targetingMode) {
      const piece = this.getPieceAt(square);
      if (this._isTargetValid(square, piece)) {
        if (typeof this.options.onSquareTargeted === 'function') {
          this.options.onSquareTargeted(square);
        }
      }
      return;
    }

    // Check if clicked piece is frozen
    if (this.deckManager && this.deckManager.isPieceFrozen(square)) {
      if (window.sounds) window.sounds.play('freeze');
      if (window.chessApp && window.chessApp.getAllActiveEffects && window.chessApp.openEffectDetailsModal) {
        const effects = window.chessApp.getAllActiveEffects();
        const frozenEff = effects.find(e => e.id === 'frozen_' + square);
        if (frozenEff) {
          window.chessApp.openEffectDetailsModal(frozenEff, effects);
          return;
        }
      }
      return;
    }

    // Check if clicked square has a trap or field effect (when no piece is selected to move)
    if (this.deckManager && this.deckManager.forbiddenSquares && this.deckManager.forbiddenSquares[square] && !this.selectedSquare) {
      if (window.chessApp && window.chessApp.getAllActiveEffects && window.chessApp.openEffectDetailsModal) {
        const effects = window.chessApp.getAllActiveEffects();
        const trapEff = effects.find(e => e.id === 'trap_' + square);
        if (trapEff) {
          window.chessApp.openEffectDetailsModal(trapEff, effects);
          return;
        }
      }
    }

    // If already selected, check if clicked on a legal move destination
    if (this.selectedSquare) {
      if (this.selectedSquare === square) {
        // Deselect
        this.selectedSquare = null;
        this.legalMoves = [];
        this.render();
        return;
      }

      const move = this.legalMoves.find(m => m.to === square);
      if (move) {
        this.attemptMove(this.selectedSquare, square);
        return;
      }
    }

    // Select piece
    const piece = this.getPieceAt(square);
    if (piece && piece.color === this.game.turn()) {
      // Check if user is allowed to play this color
      if (this.options.playerColor && this.options.playerColor !== piece.color) {
        return;
      }
      this.selectedSquare = square;
      this.legalMoves = this._filterMovesByDecrees(this.game.moves({ square: square, verbose: true }), square);
      this.render();
    } else {
      this.selectedSquare = null;
      this.legalMoves = [];
      this.render();
    }
  }

  attemptMove(from, to, promotion = null) {
    if (!this.game) return;

    // Check if move is pawn promotion
    const piece = this.getPieceAt(from);
    const isPawn = piece && piece.type === 'p';
    const isPromoting = isPawn && ((piece.color === 'w' && to[1] === '8') || (piece.color === 'b' && to[1] === '1'));

    if (isPromoting && !promotion) {
      this.promptPromotion(piece.color, (chosenPiece) => {
        this.attemptMove(from, to, chosenPiece);
      });
      return;
    }

    const moveData = {
      from: from,
      to: to,
      promotion: promotion || 'q'
    };

    // Check custom card restrictions
    if (this.deckManager) {
      if (this.deckManager.isPieceFrozen(from)) {
        if (window.sounds) window.sounds.play('freeze');
        this.selectedSquare = null;
        this.legalMoves = [];
        this.render();
        return;
      }
      const piece = this.getPieceAt(from);
      const targetPiece = this.getPieceAt(to);

      // 1. Blind Bishop: cannot capture
      if (piece && piece.type === 'b' && targetPiece) {
        const isBlinded = this.deckManager.activeDecrees.some(d => d.id === 'curse_bishop' && d.owner !== piece.color);
        if (isBlinded) {
          if (window.sounds) window.sounds.play('illegal');
          return;
        }
      }

      // 2. Heavy Queen: max 2 squares distance
      if (piece && piece.type === 'q') {
        const isHeavy = this.deckManager.activeDecrees.some(d => d.id === 'queen_burden' && d.owner !== piece.color);
        if (isHeavy) {
          const fileDiff = Math.abs(from.charCodeAt(0) - to.charCodeAt(0));
          const rankDiff = Math.abs(parseInt(from[1], 10) - parseInt(to[1], 10));
          if (fileDiff > 2 || rankDiff > 2) {
            if (window.sounds) window.sounds.play('illegal');
            return;
          }
        }
      }

      // 3. Smoke Screen: no captures inside smoke
      if (this.deckManager.smokeArea && targetPiece) {
        if (this.deckManager.smokeArea.squares.includes(to)) {
          if (window.sounds) window.sounds.play('illegal');
          return;
        }
      }
    }

    const result = this.game.move(moveData);
    if (result) {
      this.lastMove = { from, to };
      this.selectedSquare = null;
      this.legalMoves = [];
      this.render();

      if (typeof this.options.onMove === 'function') {
        this.options.onMove(result);
      }
    } else {
      if (window.sounds) window.sounds.play('illegal');
      this.selectedSquare = null;
      this.legalMoves = [];
      this.render();
    }
  }

  promptPromotion(color, callback) {
    this.promotionChoices.innerHTML = '';
    const choices = ['q', 'r', 'b', 'n'];

    choices.forEach(pType => {
      const btn = document.createElement('button');
      btn.className = 'promotion-btn';
      btn.innerHTML = getPieceSvg(pType, color);
      btn.onclick = () => {
        this.promotionModal.classList.add('hidden');
        callback(pType);
      };
      this.promotionChoices.appendChild(btn);
    });

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'promotion-cancel-btn';
    cancelBtn.textContent = '✕ Отмена';
    cancelBtn.onclick = () => {
      this.promotionModal.classList.add('hidden');
      this.selectedSquare = null;
      this.legalMoves = [];
      this.render();
    };
    this.promotionChoices.appendChild(cancelBtn);

    this.promotionModal.classList.remove('hidden');
  }

  _bindPieceEvents(pieceEl, square) {
    let startX = 0, startY = 0;
    let isDragging = false;
    let ghostEl = null;

    const onPointerDown = (e) => {
      if (!this.options.interactive || !this.game || this.game.game_over()) return;

      // In targeting mode, execute target click immediately and do NOT drag!
      if (this.targetingMode) {
        e.preventDefault();
        e.stopPropagation();
        this.onSquareClick(square, e);
        return;
      }

      const piece = this.getPieceAt(square);
      if (!piece || piece.color !== this.game.turn()) return;
      if (this.options.playerColor && this.options.playerColor !== piece.color) return;

      // Check if piece is frozen
      if (this.deckManager && this.deckManager.isPieceFrozen(square)) {
        if (window.sounds) window.sounds.play('freeze');
        return;
      }

      isDragging = true;
      startX = e.clientX || (e.touches && e.touches[0].clientX);
      startY = e.clientY || (e.touches && e.touches[0].clientY);

      this.selectedSquare = square;
      this.legalMoves = this._filterMovesByDecrees(this.game.moves({ square: square, verbose: true }), square);
      this.render();

      // Create floating drag clone
      ghostEl = pieceEl.cloneNode(true);
      ghostEl.classList.add('dragging-ghost');
      document.body.appendChild(ghostEl);
      this._positionGhost(ghostEl, startX, startY);

      pieceEl.style.opacity = '0.3';

      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
    };

    const onPointerMove = (e) => {
      if (!isDragging || !ghostEl) return;
      const x = e.clientX || (e.touches && e.touches[0].clientX);
      const y = e.clientY || (e.touches && e.touches[0].clientY);
      this._positionGhost(ghostEl, x, y);
    };

    const onPointerUp = (e) => {
      if (!isDragging) return;
      isDragging = false;
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);

      if (ghostEl) {
        ghostEl.remove();
        ghostEl = null;
      }
      pieceEl.style.opacity = '1';

      const x = e.clientX || (e.changedTouches && e.changedTouches[0].clientX);
      const y = e.clientY || (e.changedTouches && e.changedTouches[0].clientY);

      // Find drop square
      const dropEl = document.elementFromPoint(x, y);
      const sqTarget = dropEl ? dropEl.closest('.square') : null;
      if (sqTarget && sqTarget.dataset.square) {
        const targetSquare = sqTarget.dataset.square;
        if (targetSquare !== square) {
          const isLegal = this.legalMoves.find(m => m.to === targetSquare);
          if (isLegal) {
            this.attemptMove(square, targetSquare);
            return;
          }
        }
      }
    };

    pieceEl.addEventListener('pointerdown', onPointerDown);
    pieceEl.addEventListener('click', (e) => {
      if (this.targetingMode) {
        e.stopPropagation();
        this.onSquareClick(square, e);
      }
    });
  }

  _positionGhost(el, x, y) {
    const size = 50;
    el.style.position = 'fixed';
    el.style.left = (x - size / 2) + 'px';
    el.style.top = (y - size / 2) + 'px';
    el.style.width = size + 'px';
    el.style.height = size + 'px';
    el.style.pointerEvents = 'none';
    el.style.zIndex = '99999';
  }
}

window.ChessBoardUI = ChessBoardUI;
