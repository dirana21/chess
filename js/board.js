// Interactive Chess Board renderer with Drag & Drop, Touch support, and animations
class ChessBoardUI {
  constructor(containerEl, options = {}) {
    this.container = containerEl;
    this.options = Object.assign({
      orientation: 'w', // 'w' or 'b'
      interactive: true,
      onMove: null // callback(from, to, promotion)
    }, options);

    this.game = null; // instance of Chess
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

        // Render piece
        const piece = this.getPieceAt(square);
        if (piece) {
          const pieceEl = document.createElement('div');
          pieceEl.className = `piece ${piece.color === 'w' ? 'white-piece' : 'black-piece'}`;
          pieceEl.innerHTML = getPieceSvg(piece.type, piece.color);
          pieceEl.dataset.square = square;

          // Drag & Touch support
          this._bindPieceEvents(pieceEl, square);

          sqEl.appendChild(pieceEl);
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
      this.legalMoves = this.game.moves({ square: square, verbose: true });
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

    this.promotionModal.classList.remove('hidden');
  }

  _bindPieceEvents(pieceEl, square) {
    let startX = 0, startY = 0;
    let isDragging = false;
    let ghostEl = null;

    const onPointerDown = (e) => {
      if (!this.options.interactive || !this.game || this.game.game_over()) return;
      const piece = this.getPieceAt(square);
      if (!piece || piece.color !== this.game.turn()) return;
      if (this.options.playerColor && this.options.playerColor !== piece.color) return;

      isDragging = true;
      startX = e.clientX || (e.touches && e.touches[0].clientX);
      startY = e.clientY || (e.touches && e.touches[0].clientY);

      this.selectedSquare = square;
      this.legalMoves = this.game.moves({ square: square, verbose: true });
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
