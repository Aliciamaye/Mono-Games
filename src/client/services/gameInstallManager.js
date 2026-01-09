// Game Download & Install Manager
// Handles downloading free games and unlocking/installing premium games

export class GameInstallManager {
    constructor() {
        this.installedGames = this.loadInstalledGames();
        this.downloadQueue = [];
        this.isDownloading = false;
    }

    loadInstalledGames() {
        const stored = localStorage.getItem('installed_games');
        if (stored) {
            return new Set(JSON.parse(stored));
        }
        // Core games are always installed
        return new Set(['snake', 'tetris', 'pong', '2048', 'tic-tac-toe', 'connect-four',
            'memory-match', 'breakout', 'brick-breaker', 'flappy-bird', 'doodle-jump',
            'minesweeper', 'racing', 'infinite-roads', 'space-shooter', 'platformer',
            'cube-runner', 'match-3']);
    }

    saveInstalledGames() {
        localStorage.setItem('installed_games', JSON.stringify(Array.from(this.installedGames)));
    }

    isInstalled(gameId) {
        return this.installedGames.has(gameId);
    }

    // FREE GAME DOWNLOADS
    async downloadFreeGame(game) {
        if (this.isInstalled(game.id)) {
            return { success: false, message: 'Already installed!' };
        }

        if (game.type !== 'free') {
            return { success: false, message: 'Not a free game!' };
        }

        // Simulate download with progress
        return this.simulateDownload(game);
    }

    // PREMIUM GAME PURCHASE & INSTALL
    async purchasePremiumGame(game) {
        if (this.isInstalled(game.id)) {
            return { success: false, message: 'Already owned!' };
        }

        if (game.type !== 'premium') {
            return { success: false, message: 'Not a premium game!' };
        }

        // Check if user has enough diamonds
        const diamonds = parseInt(localStorage.getItem('diamonds') || '0');
        if (diamonds < game.diamondCost) {
            return {
                success: false,
                message: `Not enough diamonds! Need ${game.diamondCost}💎, have ${diamonds}💎`
            };
        }

        // Deduct diamonds
        localStorage.setItem('diamonds', (diamonds - game.diamondCost).toString());

        // Download and install
        return this.simulateDownload(game);
    }

    // Simulate download with progress callback
    async simulateDownload(game, onProgress) {
        return new Promise((resolve) => {
            this.isDownloading = true;
            let progress = 0;

            const interval = setInterval(() => {
                progress += Math.random() * 15;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);

                    // Mark as installed
                    this.installedGames.add(game.id);
                    this.saveInstalledGames();
                    this.isDownloading = false;

                    resolve({
                        success: true,
                        message: `${game.name} installed successfully!`
                    });
                }

                if (onProgress) {
                    onProgress(Math.min(progress, 100));
                }
            }, 200);
        });
    }

    // Uninstall game (not core games)
    uninstallGame(gameId) {
        // Cannot uninstall core games
        const coreGames = ['snake', 'tetris', 'pong', '2048', 'tic-tac-toe', 'connect-four',
            'memory-match', 'breakout', 'brick-breaker', 'flappy-bird', 'doodle-jump',
            'minesweeper', 'racing', 'infinite-roads', 'space-shooter', 'platformer',
            'cube-runner', 'match-3'];

        if (coreGames.includes(gameId)) {
            return { success: false, message: 'Cannot uninstall core games!' };
        }

        if (!this.isInstalled(gameId)) {
            return { success: false, message: 'Game not installed!' };
        }

        this.installedGames.delete(gameId);
        this.saveInstalledGames();

        return { success: true, message: 'Game uninstalled!' };
    }

    // Get total storage used
    getTotalStorage() {
        let total = 0;
        this.installedGames.forEach(gameId => {
            // Would need to look up file size from game catalog
            total += 0.5; // Placeholder
        });
        return total.toFixed(2) + ' MB';
    }
}

// UI Component for Game Download/Install
export function createDownloadUI(installManager) {
    const container = document.createElement('div');
    container.className = 'download-ui';
    container.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, #4ECDC4, #44A08D);
    border: 6px solid #2C3E50;
    border-radius: 32px;
    padding: 2rem;
    min-width: 400px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    z-index: 10000;
    font-family: 'Comic Sans MS', cursive;
  `;

    container.innerHTML = `
    <h2 style="color: white; margin: 0 0 1.5rem 0; text-align: center; font-size: 2rem;">
      📦 Game Library
    </h2>
    
    <div id="game-tabs" style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem;">
      <button class="tab-btn active" data-tab="free">🆓 Free</button>
      <button class="tab-btn" data-tab="premium">💎 Premium</button>
      <button class="tab-btn" data-tab="installed">✅ Installed</button>
    </div>
    
    <div id="game-list" style="max-height: 400px; overflow-y: auto;">
      <!-- Games will be populated here -->
    </div>
    
    <div id="download-progress" style="display: none; margin-top: 1.5rem;">
      <div style="background: rgba(0,0,0,0.3); border-radius: 12px; overflow: hidden;">
        <div id="progress-bar" style="height: 30px; background: linear-gradient(90deg, #FFD93D, #FFA07A); transition: width 0.3s; border-radius: 12px;"></div>
      </div>
      <p id="progress-text" style="text-align: center; color: white; margin-top: 0.5rem;"></p>
    </div>
    
    <button id="close-downloads" style="width: 100%; padding: 1rem; margin-top: 1.5rem; background: #FF6B6B; border: 4px solid #2C3E50; border-radius: 16px; color: white; font-weight: 900; cursor: pointer;">
      ✕ Close
    </button>
  `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
    .tab-btn {
      flex: 1;
      padding: 0.75rem;
      background: rgba(255,255,255,0.2);
      border: 3px solid #2C3E50;
      border-radius: 12px;
      color: white;
      font-weight: 900;
      cursor: pointer;
      transition: all 0.2s;
    }
    .tab-btn.active {
      background: white;
      color: #2C3E50;
      transform: translateY(-4px);
    }
    .game-item {
      background: rgba(255,255,255,0.9);
      border: 3px solid #2C3E50;
      border-radius: 16px;
      padding: 1rem;
      margin: 0.75rem 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .game-info h3 {
      margin: 0;
      font-size: 1.2rem;
      color: #2C3E50;
    }
    .game-info p {
      margin: 0.25rem 0 0 0;
      font-size: 0.9rem;
      color: #666;
    }
    .download-btn {
      padding: 0.75rem 1.5rem;
      background: #4ECDC4;
      border: 3px solid #2C3E50;
      border-radius: 12px;
      color: white;
      font-weight: 900;
      cursor: pointer;
      white-space: nowrap;
    }
    .premium-btn {
      background: linear-gradient(135deg, #FFD93D, #FFA07A);
      color: #2C3E50;
    }
  `;
    document.head.appendChild(style);

    // Tab switching
    container.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            populateGameList(btn.dataset.tab);
        });
    });

    // Populate game list based on tab
    function populateGameList(tab) {
        const listContainer = container.querySelector('#game-list');
        listContainer.innerHTML = '';

        import('../config/gameCatalog').then(({ default: catalog }) => {
            let games = [];

            if (tab === 'free') {
                games = catalog.getFreeGames();
            } else if (tab === 'premium') {
                games = catalog.getPremiumGames();
            } else if (tab === 'installed') {
                games = catalog.getAllGames().filter(g => installManager.isInstalled(g.id));
            }

            games.forEach(game => {
                const item = createGameItem(game, installManager);
                listContainer.appendChild(item);
            });
        });
    }

    function createGameItem(game, installManager) {
        const item = document.createElement('div');
        item.className = 'game-item';

        const installed = installManager.isInstalled(game.id);

        item.innerHTML = `
      <div class="game-info">
        <h3>${game.thumbnail} ${game.name}</h3>
        <p>${game.fileSize} MB • ${game.category}</p>
      </div>
      ${!installed ? `
        <button class="download-btn ${game.type === 'premium' ? 'premium-btn' : ''}" data-game-id="${game.id}">
          ${game.type === 'premium' ? `💎 ${game.diamondCost}` : '📥 Download'}
        </button>
      ` : game.type !== 'core' ? `
        <button class="download-btn" style="background: #999" data-game-id="${game.id}" data-action="uninstall">
          🗑️ Uninstall
        </button>
      ` : `
        <span style="color: #4ECDC4; font-weight: 900;">✓ Installed</span>
      `}
    `;

        // Add download handler
        const btn = item.querySelector('button[data-game-id]');
        if (btn) {
            btn.addEventListener('click', async () => {
                if (btn.dataset.action === 'uninstall') {
                    const result = installManager.uninstallGame(game.id);
                    if (result.success) {
                        populateGameList('installed');
                    }
                    return;
                }

                const progressDiv = container.querySelector('#download-progress');
                const progressBar = container.querySelector('#progress-bar');
                const progressText = container.querySelector('#progress-text');

                progressDiv.style.display = 'block';
                btn.disabled = true;

                const result = game.type === 'free'
                    ? await installManager.downloadFreeGame(game)
                    : await installManager.purchasePremiumGame(game);

                if (!result.success) {
                    alert(result.message);
                    progressDiv.style.display = 'none';
                    btn.disabled = false;
                    return;
                }

                // Show download progress
                const intervalId = setInterval(() => {
                    const progress = Math.random() * 100;
                    progressBar.style.width = progress + '%';
                    progressText.textContent = `Downloading ${game.name}... ${Math.round(progress)}%`;
                }, 100);

                setTimeout(() => {
                    clearInterval(intervalId);
                    progressBar.style.width = '100%';
                    progressText.textContent = result.message;
                    setTimeout(() => {
                        progressDiv.style.display = 'none';
                        populateGameList(game.type);
                    }, 1500);
                }, 2000);
            });
        }

        return item;
    }

    // Initial load
    populateGameList('free');

    // Close button
    container.querySelector('#close-downloads').addEventListener('click', () => {
        container.remove();
    });

    document.body.appendChild(container);
    return container;
}

export default GameInstallManager;
