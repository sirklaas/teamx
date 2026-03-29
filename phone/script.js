/**
 * TeamX Phone Registration System
 * Modern implementation with PocketBase
 */

class TeamXRegistration {
    constructor() {
        this.pb = new PocketBase(CONFIG.PB_URL);
        this.gameRecord = null;
        this.currentGameId = null;
        this.totalTeams = 0;
        this.totalPlayers = 0;
        this.playerQueue = [];
        this.isProcessingQueue = false;

        this.initializeElements();
        this.initialize();
    }

    initializeElements() {
        // UI Elements
        this.elements = {
            showName: document.querySelector('.show-name'),
            inputGroup: document.querySelector('.input-group'),
            playerNameInput: document.getElementById('playerName'),
            enterButton: document.querySelector('.enter-btn'),
            spinner: document.querySelector('.spinner'),
            playerInfo: document.querySelector('.player-info'),
            playerNameSpan: document.querySelector('.player-name'),
            playerNumberSpan: document.querySelector('.player-number'),
            totalPlayersSpan: document.querySelector('.total-players'),
            numberCircle: document.querySelector('.number-circle'),
            confirmButton: document.querySelector('.confirm-button'),
            enterSound: document.getElementById('enterSound'),
            teamRevealSound: document.getElementById('teamRevealSound'),

            // Modal elements
            nameModal: document.getElementById('nameModal'),
            existingPlayerBtn: document.getElementById('existingPlayer'),
            newPlayerBtn: document.getElementById('newPlayer'),
            nameSuffixInput: document.getElementById('nameSuffix'),
            existingNameSpans: document.querySelectorAll('.existing-name')
        };

        this.setupEventListeners();
    }

    async initialize() {
        try {
            await this.authenticatePocketBase();
            await this.loadGameData();
            this.setupRealtimeUpdates();
        } catch (error) {
            console.error('Initialization failed:', error);
            this.elements.showName.textContent = 'Verbindingsfout - Vernieuw de pagina';
        }
    }

    async authenticatePocketBase() {
        try {
            console.log('Authenticating with PocketBase...');
            await this.pb.admins.authWithPassword(CONFIG.ADMIN_EMAIL, CONFIG.ADMIN_PASSWORD);
            console.log('Authentication successful');
        } catch (error) {
            console.error('Authentication failed:', error);
            throw new Error('Authentication failed');
        }
    }

    async loadGameData() {
        try {
            console.log('Loading game data...');

            // First try: Get shows with priority 1, sorted by date (earliest first)
            let records = await this.pb.collection(CONFIG.COLLECTION_TEAMS).getFullList({
                filter: 'priority = 1 && teamnumber > 0',
                sort: 'datum',
                $autoCancel: false
            });

            console.log('Priority 1 records found:', records.length);

            // Fallback: If no priority 1 shows, try priority 2
            if (records.length === 0) {
                console.log('No priority 1 shows, trying priority 2...');
                records = await this.pb.collection(CONFIG.COLLECTION_TEAMS).getFullList({
                    filter: 'priority = 2 && teamnumber > 0',
                    sort: 'datum',
                    $autoCancel: false
                });
                console.log('Priority 2 records found:', records.length);
            }

            if (records.length === 0) {
                throw new Error('No active game found with priority 1 or 2');
            }

            // Take the first record (earliest date)
            this.gameRecord = records[0];
            this.currentGameId = this.gameRecord.id;
            this.totalTeams = this.gameRecord.teamnumber;
            this.totalPlayers = this.gameRecord.players;

            // Update UI
            this.elements.showName.textContent = this.gameRecord.show || 'QuizMaster Klaas presenteert';
            this.elements.totalPlayersSpan.textContent = this.totalPlayers;

            console.log('Game loaded:', this.gameRecord.show);
            console.log('Show date:', this.gameRecord.datum);
            console.log('Priority:', this.gameRecord.priority);
        } catch (error) {
            console.error('Error loading game data:', error);
            this.elements.showName.textContent = 'Geen actieve quiz gevonden (zet priority op 1 of 2)';
            throw error;
        }
    }

    setupRealtimeUpdates() {
        try {
            this.pb.collection(CONFIG.COLLECTION_PLAYERS).subscribe('*', (e) => {
                console.log('Realtime update:', e.action);
            });
            console.log('Realtime updates initialized');
        } catch (error) {
            console.error('Error setting up realtime updates:', error);
        }
    }

    setupEventListeners() {
        // Enter button click
        this.elements.enterButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleNameSubmission();
        });

        // Enter key press
        this.elements.playerNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.handleNameSubmission();
            }
        });

        // Focus input on page load
        this.elements.playerNameInput.focus();

        // Modal close on outside click
        this.elements.nameModal.addEventListener('click', (e) => {
            if (e.target === this.elements.nameModal) {
                this.closeModal();
            }
        });
    }

    async handleNameSubmission() {
        const name = this.elements.playerNameInput.value.trim();
        if (!name) return;

        const existingPlayer = await this.checkExistingName(name);

        if (existingPlayer.exists) {
            this.showNameModal(name, existingPlayer.player);
        } else {
            this.addToPlayerQueue(name);
        }
    }

    async checkExistingName(name) {
        try {
            // Get playerData from show record
            const currentShow = await this.pb.collection(CONFIG.COLLECTION_TEAMS).getOne(this.currentGameId, {
                $autoCancel: false
            });

            const playerdata = currentShow.playerData || [];
            const existingPlayer = playerdata.find(p => p.naam && p.naam.toLowerCase() === name.toLowerCase());

            return {
                exists: !!existingPlayer,
                player: existingPlayer || null
            };
        } catch (error) {
            console.error('Error checking existing name:', error);
            return { exists: false, player: null };
        }
    }

    showNameModal(name, existingPlayer) {
        this.elements.existingNameSpans.forEach(span => span.textContent = name);
        this.elements.nameModal.classList.add('show');

        // Existing player button
        this.elements.existingPlayerBtn.onclick = () => {
            this.closeModal();
            this.showExistingTeam(existingPlayer);
        };

        // New player with same name button
        this.elements.newPlayerBtn.onclick = () => {
            const suffix = this.elements.nameSuffixInput.value.trim();
            if (suffix && /^[a-zA-Z]{1,2}$/.test(suffix)) {
                this.closeModal();
                this.addToPlayerQueue(`${name} ${suffix}`);
                this.elements.nameSuffixInput.value = '';
            } else {
                alert('Voer 1 of 2 letters van je achternaam in');
            }
        };
    }

    closeModal() {
        this.elements.nameModal.classList.remove('show');
    }

    showExistingTeam(player) {
        this.playSound('enter');

        // Update player info
        this.elements.playerNameSpan.textContent = player.naam;
        this.elements.playerNumberSpan.textContent = player.playernr.toString().padStart(3, '0');
        this.elements.numberCircle.textContent = player.teamnr;

        // Animate UI
        this.animateTeamReveal();
    }

    addToPlayerQueue(name) {
        this.playerQueue.push(name);
        this.processPlayerQueue();
    }

    async processPlayerQueue() {
        if (this.isProcessingQueue || this.playerQueue.length === 0) return;

        this.isProcessingQueue = true;
        const name = this.playerQueue.shift();

        try {
            await this.createPlayer(name);
        } catch (error) {
            console.error('Error processing player:', error);
            alert('Er is een fout opgetreden. Probeer het opnieuw.');
            this.resetUI();
        } finally {
            this.isProcessingQueue = false;
            if (this.playerQueue.length > 0) {
                setTimeout(() => this.processPlayerQueue(), 700);
            }
        }
    }

    async createPlayer(name, retryCount = 0) {
        this.showLoading(true);
        this.playSound('enter');

        try {
            // Get current playerData from show record
            const currentShow = await this.pb.collection(CONFIG.COLLECTION_TEAMS).getOne(this.currentGameId, {
                $autoCancel: false
            });

            const playerdata = currentShow.playerData || [];
            console.log('Current playerdata length:', playerdata.length);

            // Get unique player number
            const playerNumber = this.getNextPlayerNumber(playerdata);

            // Get team assignment
            const teamNumber = this.getNextTeamFromData(playerdata);

            // Create new player object
            const newPlayer = {
                naam: name,
                teamnr: teamNumber,
                playernr: playerNumber
            };

            // Add to playerdata array
            playerdata.push(newPlayer);

            // Update show record with new playerData
            try {
                await this.pb.collection(CONFIG.COLLECTION_TEAMS).update(this.currentGameId, {
                    playerData: playerdata
                }, {
                    $autoCancel: false
                });

                console.log('Player added to playerdata:', newPlayer);
            } catch (updateError) {
                // If update fails due to concurrent modification, retry
                if (retryCount < 3) {
                    console.warn(`Update conflict, retrying... (attempt ${retryCount + 1})`);
                    this.showLoading(false);
                    return await this.createPlayer(name, retryCount + 1);
                }
                throw updateError;
            }

            // Show team assignment
            this.showTeamAssignment(newPlayer);
        } catch (error) {
            console.error('Error creating player:', error);
            throw error;
        } finally {
            this.showLoading(false);
        }
    }

    getNextPlayerNumber(playerdata) {
        // Simple approach: find highest number and add 1
        let nextNumber = 1;
        
        if (playerdata && playerdata.length > 0) {
            const playerNumbers = playerdata.map(p => p.playernr || 0).filter(n => n > 0);
            if (playerNumbers.length > 0) {
                const highestNumber = Math.max(...playerNumbers);
                nextNumber = highestNumber + 1;
                console.log(`Highest existing number: ${highestNumber}, assigning: ${nextNumber}`);
            } else {
                console.log('No valid player numbers found, starting at 1');
            }
        } else {
            console.log('No existing players, starting at 1');
        }

        // Log warning if we exceed expected player count
        if (nextNumber > this.totalPlayers) {
            console.warn(`Player count (${nextNumber}) exceeds expected total (${this.totalPlayers})`);
        }

        return nextNumber;
    }

    getTeamSizesFromData(playerdata) {
        const teamSizes = {};
        for (let i = 1; i <= this.totalTeams; i++) {
            teamSizes[i] = 0;
        }

        if (playerdata && playerdata.length > 0) {
            playerdata.forEach(player => {
                // Only count players with valid team numbers (1 to totalTeams)
                if (player.teamnr && player.teamnr >= 1 && player.teamnr <= this.totalTeams) {
                    teamSizes[player.teamnr]++;
                } else if (player.teamnr && (player.teamnr < 1 || player.teamnr > this.totalTeams)) {
                    console.warn('Player with invalid team number found:', player.teamnr);
                }
            });
        }

        return teamSizes;
    }

    getNextTeamFromData(playerdata) {
        const teamSizes = this.getTeamSizesFromData(playerdata);
        return this.getNextTeam(teamSizes);
    }

    getNextTeam(teamSizes) {
        const minSize = Math.min(...Object.values(teamSizes));
        const eligibleTeams = Object.keys(teamSizes).filter(team =>
            teamSizes[team] === minSize
        );

        const randomIndex = Math.floor(Math.random() * eligibleTeams.length);
        return parseInt(eligibleTeams[randomIndex]);
    }

    showTeamAssignment(player) {
        // Update player info
        this.elements.playerNameSpan.textContent = player.naam;
        this.elements.playerNumberSpan.textContent = player.playernr.toString().padStart(3, '0');
        this.elements.numberCircle.textContent = player.teamnr;

        // Animate UI
        this.animateTeamReveal();

        // Setup confirm button with URL
        const targetUrl = this.gameRecord?.url || 'https://www.pinkmilk.eu/photocircle/';
        
        if (!this.gameRecord?.url) {
            console.warn('No URL set in game record, using default photocircle URL');
        }
        
        this.elements.confirmButton.onclick = () => {
            console.log('Navigating to:', targetUrl);
            window.location.href = targetUrl;
        };
    }

    animateTeamReveal() {
        // Hide input and show player info
        this.elements.inputGroup.classList.add('center-input');
        this.elements.enterButton.classList.add('fall');

        setTimeout(() => {
            this.elements.playerInfo.classList.add('show');
            this.elements.numberCircle.classList.add('show');
            this.playSound('reveal');

            setTimeout(() => {
                this.elements.numberCircle.classList.add('pulse');
                this.elements.confirmButton.classList.add('show');
            }, CONFIG.UI.pulseDelay);
        }, CONFIG.UI.animationDuration);
    }

    showLoading(show) {
        this.elements.spinner.style.display = show ? 'block' : 'none';
        this.elements.enterButton.disabled = show;
        this.elements.enterButton.textContent = show ? '' : 'Enter';
        if (show) {
            this.elements.enterButton.appendChild(this.elements.spinner);
        }
    }

    resetUI() {
        this.elements.inputGroup.classList.remove('center-input');
        this.elements.enterButton.classList.remove('fall');
        this.elements.playerInfo.classList.remove('show');
        this.elements.numberCircle.classList.remove('show', 'pulse');
        this.elements.confirmButton.classList.remove('show');
        this.showLoading(false);
    }

    playSound(type) {
        try {
            const sound = type === 'enter' ? this.elements.enterSound : this.elements.teamRevealSound;
            if (sound) {
                sound.play().catch(e => console.log('Sound play failed:', e));
            }
        } catch (error) {
            console.log('Sound error:', error);
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new TeamXRegistration();
});
