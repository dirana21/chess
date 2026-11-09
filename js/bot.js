// Simple, fast chess bot using minimax + alpha-beta and piece-square tables
class ChessBot {
  constructor(depth = 3, game = null) {
    this.depth = depth;
    this.game = game;

    this.weights = {
      p: 100,
      n: 320,
      b: 330,
      r: 500,
      q: 900,
      k: 20000
    };

    // Piece-Square Tables (White perspective; flipped for black)
    this.pst = {
      p: [
        [  0,  0,  0,  0,  0,  0,  0,  0],
        [ 50, 50, 50, 50, 50, 50, 50, 50],
        [ 10, 10, 20, 30, 30, 20, 10, 10],
        [  5,  5, 10, 25, 25, 10,  5,  5],
        [  0,  0,  0, 20, 20,  0,  0,  0],
        [  5, -5,-10,  0,  0,-10, -5,  5],
        [  5, 10, 10,-20,-20, 10, 10,  5],
        [  0,  0,  0,  0,  0,  0,  0,  0]
      ],
      n: [
        [-50,-40,-30,-30,-30,-30,-40,-50],
        [-40,-20,  0,  0,  0,  0,-20,-40],
        [-30,  0, 10, 15, 15, 10,  0,-30],
        [-30,  5, 15, 20, 20, 15,  5,-30],
        [-30,  0, 15, 20, 20, 15,  0,-30],
        [-30,  5, 10, 15, 15, 10,  5,-30],
        [-40,-20,  0,  5,  5,  0,-20,-40],
        [-50,-40,-30,-30,-30,-30,-40,-50]
      ],
      b: [
        [-20,-10,-10,-10,-10,-10,-10,-20],
        [-10,  0,  0,  0,  0,  0,  0,-10],
        [-10,  0,  5, 10, 10,  5,  0,-10],
        [-10,  5,  5, 10, 10,  5,  5,-10],
        [-10,  0, 10, 10, 10, 10,  0,-10],
        [-10, 10, 10, 10, 10, 10, 10,-10],
        [-10,  5,  0,  0,  0,  0,  5,-10],
        [-20,-10,-10,-10,-10,-10,-10,-20]
      ],
      r: [
        [  0,  0,  0,  0,  0,  0,  0,  0],
        [  5, 10, 10, 10, 10, 10, 10,  5],
        [ -5,  0,  0,  0,  0,  0,  0, -5],
        [ -5,  0,  0,  0,  0,  0,  0, -5],
        [ -5,  0,  0,  0,  0,  0,  0, -5],
        [ -5,  0,  0,  0,  0,  0,  0, -5],
        [ -5,  0,  0,  0,  0,  0,  0, -5],
        [  0,  0,  0,  5,  5,  0,  0,  0]
      ],
      q: [
        [-20,-10,-10, -5, -5,-10,-10,-20],
        [-10,  0,  0,  0,  0,  0,  0,-10],
        [-10,  0,  5,  5,  5,  5,  0,-10],
        [ -5,  0,  5,  5,  5,  5,  0, -5],
        [  0,  0,  5,  5,  5,  5,  0, -5],
        [-10,  5,  5,  5,  5,  5,  0,-10],
        [-10,  0,  5,  0,  0,  0,  0,-10],
        [-20,-10,-10, -5, -5,-10,-10,-20]
      ],
      k: [
        [-30,-40,-40,-50,-50,-40,-40,-30],
        [-30,-40,-40,-50,-50,-40,-40,-30],
        [-30,-40,-40,-50,-50,-40,-40,-30],
        [-30,-40,-40,-50,-50,-40,-40,-30],
        [-20,-30,-30,-40,-40,-30,-30,-20],
        [-10,-20,-20,-20,-20,-20,-20,-10],
        [ 20, 20,  0,  0,  0,  0, 20, 20],
        [ 20, 30, 10,  0,  0, 10, 30, 20]
      ]
    };
  }

  evaluateBoard(game) {
    let totalScore = 0;
    const board = game.board();

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece) {
          const val = this.weights[piece.type];
          const pstTable = this.pst[piece.type];
          let pstVal = 0;
          if (pstTable) {
            pstVal = piece.color === 'w' ? pstTable[r][c] : pstTable[7 - r][c];
          }
          const score = val + pstVal;
          totalScore += piece.color === 'w' ? score : -score;
        }
      }
    }
    return totalScore;
  }

  minimax(game, depth, alpha, beta, isMaximizing) {
    if (depth === 0 || game.game_over()) {
      if (game.in_checkmate()) {
        return isMaximizing ? -99999 : 99999;
      }
      if (game.in_draw() || game.in_stalemate()) {
        return 0;
      }
      return this.evaluateBoard(game);
    }

    const moves = game.moves({ verbose: true });
    // Move ordering: prioritize captures
    moves.sort((a, b) => (b.captured ? 1 : 0) - (a.captured ? 1 : 0));

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const m of moves) {
        game.move(m);
        const evalScore = this.minimax(game, depth - 1, alpha, beta, false);
        game.undo();
        maxEval = Math.max(maxEval, evalScore);
        alpha = Math.max(alpha, evalScore);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const m of moves) {
        game.move(m);
        const evalScore = this.minimax(game, depth - 1, alpha, beta, true);
        game.undo();
        minEval = Math.min(minEval, evalScore);
        beta = Math.min(beta, evalScore);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }

  getBestMove(game = null, difficulty = 'medium', deckManager = null) {
    const activeGame = game || this.game;
    if (!activeGame) return null;
    let moves = activeGame.moves({ verbose: true });
    if (moves.length === 0) return null;

    // Filter out moves restricted by Card Chess decrees & ice
    if (deckManager) {
      const activeColor = activeGame.turn();
      moves = moves.filter(m => !deckManager.isPieceFrozen(m.from));

      // Blind Bishop decree: no captures
      moves = moves.filter(m => {
        if (m.piece === 'b' && m.captured) {
          return !deckManager.activeDecrees.some(d => d.id === 'curse_bishop' && d.owner !== activeColor);
        }
        return true;
      });

      // Heavy Queen decree: max 2 squares
      moves = moves.filter(m => {
        if (m.piece === 'q') {
          const isHeavy = deckManager.activeDecrees.some(d => d.id === 'queen_burden' && d.owner !== activeColor);
          if (isHeavy) {
            const fileDiff = Math.abs(m.from.charCodeAt(0) - m.to.charCodeAt(0));
            const rankDiff = Math.abs(parseInt(m.from[1], 10) - parseInt(m.to[1], 10));
            return fileDiff <= 2 && rankDiff <= 2;
          }
        }
        return true;
      });

      // Smoke screen: no captures inside smoke
      if (deckManager.smokeArea) {
        moves = moves.filter(m => {
          if (m.captured && deckManager.smokeArea.squares.includes(m.to)) return false;
          return true;
        });
      }

      // Divine shield: no captures of shielded pieces
      if (deckManager.hasDivineShield) {
        moves = moves.filter(m => {
          if (m.captured && deckManager.hasDivineShield(m.to)) return false;
          return true;
        });
      }
    }

    if (moves.length === 0) return null;

    if (difficulty === 'easy') {
      if (Math.random() < 0.4) {
        return moves[Math.floor(Math.random() * moves.length)];
      }
      this.depth = 1;
    } else if (difficulty === 'hard') {
      this.depth = 3;
    } else {
      this.depth = 2;
    }

    const isWhite = activeGame.turn() === 'w';
    let bestMove = null;
    let bestValue = isWhite ? -Infinity : Infinity;
    const alpha = -Infinity;
    const beta = Infinity;

    // Shuffle moves slightly so repeated openings have variety
    moves.sort(() => Math.random() - 0.5);
    moves.sort((a, b) => (b.captured ? 1 : 0) - (a.captured ? 1 : 0));

    for (const m of moves) {
      activeGame.move(m);
      const moveValue = this.minimax(activeGame, this.depth - 1, alpha, beta, !isWhite);
      activeGame.undo();

      if (isWhite) {
        if (moveValue > bestValue) {
          bestValue = moveValue;
          bestMove = m;
        }
      } else {
        if (moveValue < bestValue) {
          bestValue = moveValue;
          bestMove = m;
        }
      }
    }

    return bestMove || moves[0];
  }
}

window.ChessBot = ChessBot;
