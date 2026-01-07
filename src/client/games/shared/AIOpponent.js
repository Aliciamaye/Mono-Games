/**
 * Advanced AI Opponent System for Mono Games
 * Features: Multiple difficulty levels, learning behaviors, strategic patterns
 * Enhanced with pattern recognition and adaptive strategies
 */

export const AI_LEVELS = {
    1: { 
        name: 'Very Easy', 
        accuracy: 0.35, 
        reactionDelay: 600, 
        mistakeChance: 0.5,
        thinkingDepth: 1,
        patternRecognition: 0.1
    },
    2: { 
        name: 'Easy', 
        accuracy: 0.60, 
        reactionDelay: 400, 
        mistakeChance: 0.30,
        thinkingDepth: 2,
        patternRecognition: 0.3
    },
    3: { 
        name: 'Normal', 
        accuracy: 0.80, 
        reactionDelay: 200, 
        mistakeChance: 0.15,
        thinkingDepth: 3,
        patternRecognition: 0.6
    },
    4: { 
        name: 'Hard', 
        accuracy: 0.92, 
        reactionDelay: 100, 
        mistakeChance: 0.08,
        thinkingDepth: 5,
        patternRecognition: 0.85
    },
    5: { 
        name: 'Expert', 
        accuracy: 0.99, 
        reactionDelay: 40, 
        mistakeChance: 0.02,
        thinkingDepth: 7,
        patternRecognition: 0.95
    }
};

export class AIOpponent {
    constructor(level = 3) {
        this.setLevel(level);
        this.lastActionTime = 0;
        this.moveHistory = [];
        this.patterns = new Map();
        this.wins = 0;
        this.losses = 0;
        this.adaptiveFactor = 1.0;
    }

    /**
     * Set AI difficulty level (1-5)
     */
    setLevel(level) {
        this.level = Math.max(1, Math.min(5, level));
        this.config = AI_LEVELS[this.level];
    }

    /**
     * Get AI level config
     */
    getConfig() {
        return this.config;
    }

    /**
     * Record game result for adaptive learning
     */
    recordResult(won) {
        if (won) {
            this.wins++;
            this.adaptiveFactor = Math.min(1.2, this.adaptiveFactor + 0.05);
        } else {
            this.losses++;
            this.adaptiveFactor = Math.max(0.8, this.adaptiveFactor - 0.03);
        }
    }

    /**
     * Check if AI should make a mistake based on level and adaptive factor
     */
    shouldMakeMistake() {
        const adjustedMistakeChance = this.config.mistakeChance / this.adaptiveFactor;
        return Math.random() < adjustedMistakeChance;
    }

    /**
     * Check if AI can act based on reaction delay
     */
    canAct(currentTime) {
        if (currentTime - this.lastActionTime >= this.config.reactionDelay) {
            this.lastActionTime = currentTime;
            return true;
        }
        return false;
    }

    /**
     * Calculate AI move with accuracy factor and prediction
     * @param {number} targetPosition - The ideal position to reach
     * @param {number} currentPosition - Current AI position
     * @param {number} maxSpeed - Maximum movement speed
     * @returns {number} - Movement delta
     */
    calculateMove(targetPosition, currentPosition, maxSpeed) {
        const diff = targetPosition - currentPosition;

        // Add inaccuracy based on level
        if (this.shouldMakeMistake()) {
            // Make a mistake - move slightly wrong direction or overshoot
            const mistakeAmount = (Math.random() - 0.5) * maxSpeed * 3;
            return Math.max(-maxSpeed, Math.min(maxSpeed, mistakeAmount));
        }

        // Apply accuracy factor with adaptive learning
        const accuracyFactor = this.config.accuracy * this.adaptiveFactor;
        const adjustedDiff = diff * accuracyFactor;

        // Clamp to max speed
        return Math.max(-maxSpeed, Math.min(maxSpeed, adjustedDiff));
    }

    /**
     * Advanced prediction algorithm for trajectory
     * @param {number} ballX - Ball X position
     * @param {number} ballY - Ball Y position
     * @param {number} ballVelX - Ball X velocity
     * @param {number} ballVelY - Ball Y velocity
     * @param {number} targetX - Where ball needs to intersect
     * @returns {number} - Predicted Y position
     */
    predictBallPosition(ballX, ballY, ballVelX, ballVelY, targetX) {
        if (Math.abs(ballVelX) < 0.1) return ballY;

        const timeToTarget = (targetX - ballX) / ballVelX;
        let predictedY = ballY + ballVelY * timeToTarget;

        // Account for wall bounces (assuming standard game bounds)
        const gameHeight = 600; // Standard height
        while (predictedY < 0 || predictedY > gameHeight) {
            if (predictedY < 0) predictedY = Math.abs(predictedY);
            if (predictedY > gameHeight) predictedY = 2 * gameHeight - predictedY;
        }

        // Add prediction error based on AI level
        const predictionError = (1 - this.config.accuracy) * 80 * (Math.random() - 0.5);
        return predictedY + predictionError;
    }

    /**
     * For Pong: Calculate paddle movement with prediction
     */
    calculatePaddleMove(ballX, ballY, ballVelX, ballVelY, paddleX, paddleY, paddleHeight, paddleSpeed) {
        const paddleCenter = paddleY + paddleHeight / 2;
        
        // Use prediction if ball is moving toward paddle
        const movingTowardPaddle = (paddleX < 300 && ballVelX < 0) || (paddleX > 300 && ballVelX > 0);
        
        let targetY;
        if (movingTowardPaddle && this.config.patternRecognition > Math.random()) {
            targetY = this.predictBallPosition(ballX, ballY, ballVelX, ballVelY, paddleX);
        } else {
            targetY = ballY;
        }

        // Add prediction error based on level
        const predictionError = (1 - this.config.accuracy) * 100 * (Math.random() - 0.5);
        const adjustedTarget = targetY + predictionError;

        if (this.shouldMakeMistake()) {
            // Random movement on mistake
            return (Math.random() - 0.5) * paddleSpeed;
        }

        const diff = adjustedTarget - paddleCenter;
        const threshold = paddleHeight * 0.15;

        if (Math.abs(diff) < threshold) {
            return 0; // Close enough
        }

        return diff > 0 ? 
            paddleSpeed * this.config.accuracy * this.adaptiveFactor : 
            -paddleSpeed * this.config.accuracy * this.adaptiveFactor;
    }

    /**
     * For Tic-Tac-Toe: Get best move with advanced strategy
     * @param {Array} board - 3x3 board array (null, 'X', or 'O')
     * @param {string} aiSymbol - 'X' or 'O'
     */
    getTicTacToeMove(board, aiSymbol) {
        const opponentSymbol = aiSymbol === 'X' ? 'O' : 'X';
        const emptySpots = [];

        for (let i = 0; i < 9; i++) {
            if (!board[i]) emptySpots.push(i);
        }

        if (emptySpots.length === 0) return null;

        // Record move pattern
        this.moveHistory.push([...board]);

        // Maybe make a mistake
        if (this.shouldMakeMistake()) {
            return emptySpots[Math.floor(Math.random() * emptySpots.length)];
        }

        // Based on level, use different strategies
        if (this.level >= 4) {
            // Alpha-Beta Pruning minimax for hard/expert
            return this.alphaBetaMove(board, aiSymbol, opponentSymbol);
        } else if (this.level >= 3) {
            // Standard minimax for normal
            return this.minimaxMove(board, aiSymbol, opponentSymbol);
        } else if (this.level >= 2) {
            // Strategic heuristics for easy
            return this.strategicMove(board, aiSymbol, opponentSymbol, emptySpots);
        }

        // Very Easy: Random with slight preference for center/corners
        if (!board[4] && Math.random() < 0.6) return 4; // Center preference
        return emptySpots[Math.floor(Math.random() * emptySpots.length)];
    }

    /**
     * Strategic move selection with heuristics
     */
    strategicMove(board, aiSymbol, opponentSymbol, emptySpots) {
        // 1. Check for winning move
        const winMove = this.findWinningMove(board, aiSymbol);
        if (winMove !== null) return winMove;

        // 2. Block opponent's winning move
        const blockMove = this.findWinningMove(board, opponentSymbol);
        if (blockMove !== null && Math.random() < this.config.accuracy) return blockMove;

        // 3. Create fork (two ways to win)
        if (this.config.patternRecognition > 0.5) {
            const forkMove = this.findForkMove(board, aiSymbol);
            if (forkMove !== null && Math.random() < this.config.patternRecognition) return forkMove;
        }

        // 4. Block opponent's fork
        if (Math.random() < this.config.accuracy) {
            const blockForkMove = this.findForkMove(board, opponentSymbol);
            if (blockForkMove !== null) return blockForkMove;
        }

        // 5. Take center if available
        if (!board[4] && Math.random() < this.config.accuracy) return 4;

        // 6. Take opposite corner
        const oppositeCorner = this.findOppositeCorner(board, opponentSymbol);
        if (oppositeCorner !== null && Math.random() < this.config.accuracy) return oppositeCorner;

        // 7. Take any corner
        const corners = [0, 2, 6, 8].filter(i => !board[i]);
        if (corners.length && Math.random() < this.config.accuracy) {
            return corners[Math.floor(Math.random() * corners.length)];
        }

        // 8. Take any side
        const sides = [1, 3, 5, 7].filter(i => !board[i]);
        if (sides.length) {
            return sides[Math.floor(Math.random() * sides.length)];
        }

        return emptySpots[Math.floor(Math.random() * emptySpots.length)];
    }

    /**
     * Find fork opportunity (position that creates multiple win threats)
     */
    findForkMove(board, symbol) {
        for (let i = 0; i < 9; i++) {
            if (!board[i]) {
                board[i] = symbol;
                let winningMoves = 0;

                // Count how many winning moves this creates
                for (let j = 0; j < 9; j++) {
                    if (!board[j]) {
                        board[j] = symbol;
                        if (this.checkWinner(board) === symbol) {
                            winningMoves++;
                        }
                        board[j] = null;
                    }
                }

                board[i] = null;
                if (winningMoves >= 2) return i;
            }
        }
        return null;
    }

    /**
     * Find opposite corner strategy
     */
    findOppositeCorner(board, opponentSymbol) {
        const corners = [[0, 8], [2, 6], [6, 2], [8, 0]];
        for (const [corner, opposite] of corners) {
            if (board[corner] === opponentSymbol && !board[opposite]) {
                return opposite;
            }
        }
        return null;
    }

    findWinningMove(board, symbol) {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
            [0, 4, 8], [2, 4, 6] // Diagonals
        ];

        for (const line of lines) {
            const values = line.map(i => board[i]);
            const symbolCount = values.filter(v => v === symbol).length;
            const emptyCount = values.filter(v => !v).length;

            if (symbolCount === 2 && emptyCount === 1) {
                return line.find(i => !board[i]);
            }
        }
        return null;
    }

    /**
     * Alpha-Beta pruning minimax for optimal performance
     */
    alphaBetaMove(board, aiSymbol, opponentSymbol) {
        let bestScore = -Infinity;
        let bestMove = null;
        const alpha = -Infinity;
        const beta = Infinity;

        for (let i = 0; i < 9; i++) {
            if (!board[i]) {
                board[i] = aiSymbol;
                const score = this.alphaBeta(board, 0, alpha, beta, false, aiSymbol, opponentSymbol);
                board[i] = null;

                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }
        return bestMove;
    }

    /**
     * Alpha-Beta pruning recursive function
     */
    alphaBeta(board, depth, alpha, beta, isMaximizing, aiSymbol, opponentSymbol) {
        const winner = this.checkWinner(board);
        if (winner === aiSymbol) return 10 - depth;
        if (winner === opponentSymbol) return depth - 10;
        if (board.every(cell => cell)) return 0;

        if (depth >= this.config.thinkingDepth) {
            return this.evaluateBoard(board, aiSymbol, opponentSymbol);
        }

        if (isMaximizing) {
            let maxScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (!board[i]) {
                    board[i] = aiSymbol;
                    const score = this.alphaBeta(board, depth + 1, alpha, beta, false, aiSymbol, opponentSymbol);
                    board[i] = null;
                    maxScore = Math.max(maxScore, score);
                    alpha = Math.max(alpha, score);
                    if (beta <= alpha) break; // Beta cutoff
                }
            }
            return maxScore;
        } else {
            let minScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (!board[i]) {
                    board[i] = opponentSymbol;
                    const score = this.alphaBeta(board, depth + 1, alpha, beta, true, aiSymbol, opponentSymbol);
                    board[i] = null;
                    minScore = Math.min(minScore, score);
                    beta = Math.min(beta, score);
                    if (beta <= alpha) break; // Alpha cutoff
                }
            }
            return minScore;
        }
    }

    /**
     * Evaluate board position heuristically
     */
    evaluateBoard(board, aiSymbol, opponentSymbol) {
        let score = 0;
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        for (const line of lines) {
            const values = line.map(i => board[i]);
            const aiCount = values.filter(v => v === aiSymbol).length;
            const oppCount = values.filter(v => v === opponentSymbol).length;

            if (aiCount > 0 && oppCount === 0) {
                score += aiCount * aiCount;
            } else if (oppCount > 0 && aiCount === 0) {
                score -= oppCount * oppCount;
            }
        }

        // Bonus for center control
        if (board[4] === aiSymbol) score += 3;
        if (board[4] === opponentSymbol) score -= 3;

        return score;
    }

    minimaxMove(board, aiSymbol, opponentSymbol) {
        let bestScore = -Infinity;
        let bestMove = null;

        for (let i = 0; i < 9; i++) {
            if (!board[i]) {
                board[i] = aiSymbol;
                const score = this.minimax(board, 0, false, aiSymbol, opponentSymbol);
                board[i] = null;

                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }
        return bestMove;
    }

    minimax(board, depth, isMaximizing, aiSymbol, opponentSymbol) {
        const winner = this.checkWinner(board);
        if (winner === aiSymbol) return 10 - depth;
        if (winner === opponentSymbol) return depth - 10;
        if (board.every(cell => cell)) return 0;

        if (depth >= this.config.thinkingDepth) {
            return 0; // Neutral at depth limit
        }

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (!board[i]) {
                    board[i] = aiSymbol;
                    bestScore = Math.max(bestScore, this.minimax(board, depth + 1, false, aiSymbol, opponentSymbol));
                    board[i] = null;
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (!board[i]) {
                    board[i] = opponentSymbol;
                    bestScore = Math.min(bestScore, this.minimax(board, depth + 1, true, aiSymbol, opponentSymbol));
                    board[i] = null;
                }
            }
            return bestScore;
        }
    }

    checkWinner(board) {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        for (const [a, b, c] of lines) {
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }
        return null;
    }

    /**
     * For Connect Four: Get column to drop
     * @param {Array} board - 6x7 2D array
     * @param {number} aiPiece - AI's piece (1 or 2)
     */
    getConnectFourMove(board, aiPiece) {
        const opponentPiece = aiPiece === 1 ? 2 : 1;
        const validCols = [];

        for (let col = 0; col < 7; col++) {
            if (board[0][col] === 0) validCols.push(col);
        }

        if (validCols.length === 0) return null;

        // Maybe make mistake
        if (this.shouldMakeMistake()) {
            return validCols[Math.floor(Math.random() * validCols.length)];
        }

        // Check for winning move
        for (const col of validCols) {
            if (this.simulateWin(board, col, aiPiece)) {
                return col;
            }
        }

        // Block opponent's winning move
        if (Math.random() < this.config.accuracy) {
            for (const col of validCols) {
                if (this.simulateWin(board, col, opponentPiece)) {
                    return col;
                }
            }
        }

        // Prefer center columns
        const centerPreference = [3, 2, 4, 1, 5, 0, 6];
        for (const col of centerPreference) {
            if (validCols.includes(col)) {
                return col;
            }
        }

        return validCols[Math.floor(Math.random() * validCols.length)];
    }

    simulateWin(board, col, piece) {
        // Find the row where piece would land
        let row = -1;
        for (let r = 5; r >= 0; r--) {
            if (board[r][col] === 0) {
                row = r;
                break;
            }
        }
        if (row === -1) return false;

        // Temporarily place piece
        board[row][col] = piece;
        const wins = this.checkConnectFourWin(board, row, col, piece);
        board[row][col] = 0;

        return wins;
    }

    checkConnectFourWin(board, row, col, piece) {
        const directions = [
            [0, 1], [1, 0], [1, 1], [1, -1]
        ];

        for (const [dr, dc] of directions) {
            let count = 1;

            // Check positive direction
            for (let i = 1; i < 4; i++) {
                const r = row + dr * i;
                const c = col + dc * i;
                if (r >= 0 && r < 6 && c >= 0 && c < 7 && board[r][c] === piece) {
                    count++;
                } else break;
            }

            // Check negative direction
            for (let i = 1; i < 4; i++) {
                const r = row - dr * i;
                const c = col - dc * i;
                if (r >= 0 && r < 6 && c >= 0 && c < 7 && board[r][c] === piece) {
                    count++;
                } else break;
            }

            if (count >= 4) return true;
        }

        return false;
    }
}

// Singleton factory for getting AI instance
let aiInstance = null;

export function getAI(level = 3) {
    if (!aiInstance) {
        aiInstance = new AIOpponent(level);
    } else if (aiInstance.level !== level) {
        aiInstance.setLevel(level);
    }
    return aiInstance;
}

export default AIOpponent;
