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
            returningGreeting: document.querySelector('.returning-greeting'),
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
            whooshSound: document.getElementById('whooshSound'),

            // Modal elements
            nameModal: document.getElementById('nameModal'),
            existingPlayerBtn: document.getElementById('existingPlayer'),
            confirmNewPlayerBtn: document.getElementById('confirmNewPlayer'),
            previewNewNameSpan: document.getElementById('previewNewName'),
            nameSuffixInput: document.getElementById('nameSuffix'),
            existingNameSpans: document.querySelectorAll('.existing-name')
        };

        this.setupEventListeners();
    }

    async initialize() {
        const maxRetries = 3;
        const retryDelay = 1000; // Wait 1 second between retries

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                if (attempt > 1) {
                    console.log(`Retrying initialization (attempt ${attempt}/${maxRetries})...`);
                }
                await this.loadGameData();
                this.restoreReturningPlayer();
                this.setupRealtimeUpdates();
                return; // Success! Exit the function
            } catch (error) {
                console.warn(`Initialization attempt ${attempt} failed:`, error);
                if (attempt === maxRetries) {
                    console.error('Max initialization retries reached. Showing connection error.');
                    this.elements.showName.textContent = 'Verbindingsfout - Vernieuw de pagina';
                } else {
                    // Wait before the next attempt
                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                }
            }
        }
    }

    async loadGameData() {
        try {
            console.log('Loading game data...');

            // Get showId or gamecode from URL if present
            const params = new URLSearchParams(window.location.search);
            const urlShowId = params.get('showId') || params.get('id');
            const urlGameCode = params.get('gamecode') || params.get('code');

            let records = [];
            if (urlShowId) {
                try {
                    console.log('Fetching show matching URL showId:', urlShowId);
                    const record = await this.pb.collection(CONFIG.COLLECTION_TEAMS).getOne(urlShowId, {
                        $autoCancel: false
                    });
                    if (record) records = [record];
                } catch (e) {
                    console.warn('Failed to fetch show by URL ID:', e);
                }
            } else if (urlGameCode) {
                try {
                    console.log('Fetching show matching URL gamecode:', urlGameCode);
                    const list = await this.pb.collection(CONFIG.COLLECTION_TEAMS).getFullList({
                        filter: `gamecode = "${urlGameCode}"`,
                        $autoCancel: false
                    });
                    if (list && list.length > 0) records = [list[0]];
                } catch (e) {
                    console.warn('Failed to fetch show by URL gamecode:', e);
                }
            }

            // Active show lookup: Priority is strictly leading (1 first, then 2, 3...)
            // with newest created (-created) as secondary sort for ties
            if (records.length === 0) {
                records = await this.pb.collection(CONFIG.COLLECTION_TEAMS).getFullList({
                    filter: 'priority > 0',
                    sort: 'priority,-created',
                    $autoCancel: false
                });
                console.log('Active priority records found:', records.length);
            }

            // Fallback: Fetch most recently updated show in database if no priority > 0 exists
            if (records.length === 0) {
                console.log('No active game found by priority. Fetching most recently updated show...');
                records = await this.pb.collection(CONFIG.COLLECTION_TEAMS).getFullList({
                    sort: '-updated',
                    perPage: 1,
                    $autoCancel: false
                });
                console.log('Most recently updated records found:', records.length);
            }

            if (records.length === 0) {
                throw new Error('No active game found in database');
            }

            // Take the first record (latest date/created)
            this.gameRecord = records[0];
            this.currentGameId = this.gameRecord.id;
            this.totalTeams = Math.max(1, parseInt(this.gameRecord.teamnumber, 10) || 1);
            this.totalPlayers = parseInt(this.gameRecord.players, 10) || 0;

            // Update UI
            this.elements.showName.textContent = this.gameRecord.show || 'QuizMaster Klaas presenteert';
            this.elements.totalPlayersSpan.textContent = this.totalPlayers;

            console.log('Game loaded:', this.gameRecord.show);
            console.log('Show date:', this.gameRecord.datum);
            console.log('Priority:', this.gameRecord.priority);
            console.log('Total teams:', this.totalTeams);
        } catch (error) {
            console.error('Error loading game data:', error);
            this.elements.showName.textContent = 'Geen actieve quiz gevonden (zet priority op 1 of 2)';
            throw error;
        }
    }

    setupRealtimeUpdates() {
        // Registration is handled by the same-origin server helper. The phone
        // page does not need a direct realtime subscription to player records.
    }

    restoreReturningPlayer() {
        const returningPlayer = TeamXReturningPlayerSession.loadForShow(
            window.localStorage,
            this.currentGameId
        );

        if (!returningPlayer) {
            return;
        }

        this.elements.returningGreeting.textContent = `Hi ${returningPlayer.playerName}, welkom terug`;
        this.elements.returningGreeting.classList.add('show');
        this.hideNameEntryForReturningPlayer();
        this.showTeamAssignment({
            naam: returningPlayer.playerName,
            playernr: returningPlayer.playerNumber,
            teamnr: returningPlayer.teamNumber
        });
    }

    hideNameEntryForReturningPlayer() {
        this.elements.inputGroup.style.display = 'none';
        this.elements.playerNameInput.disabled = true;
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

        // Handle suffix input dynamically in duplicate name modal
        this.elements.nameSuffixInput.addEventListener('input', () => {
            let suffix = this.elements.nameSuffixInput.value.toUpperCase();
            // Remove non-letter characters
            suffix = suffix.replace(/[^A-Z]/g, '');
            this.elements.nameSuffixInput.value = suffix;

            const baseName = this.currentDuplicateName || '';
            if (suffix && /^[A-Z]{1,2}$/.test(suffix)) {
                this.elements.previewNewNameSpan.textContent = `${baseName} ${suffix}`;
                this.elements.confirmNewPlayerBtn.disabled = false;
            } else {
                this.elements.previewNewNameSpan.textContent = `${baseName} ...`;
                this.elements.confirmNewPlayerBtn.disabled = true;
            }
        });

    }



    async handleNameSubmission() {
        const name = this.elements.playerNameInput.value.trim();
        if (!name) return;

        // Disable input and button immediately to prevent multiple clicks
        this.elements.playerNameInput.disabled = true;
        this.elements.enterButton.disabled = true;
        this.showLoading(true);

        try {
            const existingPlayer = await this.checkExistingName(name);

            if (existingPlayer.exists) {
                this.showNameModal(name, existingPlayer.player);
                this.showLoading(false);
            } else {
                this.addToPlayerQueue(name);
            }
        } catch (error) {
            console.error('Submission error:', error);
            this.elements.playerNameInput.disabled = false;
            this.elements.enterButton.disabled = false;
            this.showLoading(false);
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
        this.currentDuplicateName = name;
        this.elements.existingNameSpans.forEach(span => span.textContent = name);
        this.elements.nameSuffixInput.value = '';
        this.elements.previewNewNameSpan.textContent = `${name} ...`;
        this.elements.confirmNewPlayerBtn.disabled = true;
        this.elements.nameModal.classList.add('show');

        // Existing player button
        this.elements.existingPlayerBtn.onclick = () => {
            this.closeModal();
            this.showExistingTeam(existingPlayer);
        };

        // Confirm new player button
        this.elements.confirmNewPlayerBtn.onclick = () => {
            const suffix = this.elements.nameSuffixInput.value.trim().toUpperCase();
            if (suffix && /^[A-Z]{1,2}$/.test(suffix)) {
                this.closeModal();
                this.addToPlayerQueue(`${name} ${suffix}`);
                this.elements.nameSuffixInput.value = '';
            }
        };
    }

    closeModal() {
        this.elements.nameModal.classList.remove('show');
        // Re-enable input if modal is closed (in case they want to change name)
        this.elements.playerNameInput.disabled = false;
        this.elements.enterButton.disabled = false;
        this.elements.playerNameInput.focus();
    }

    showExistingTeam(player) {
        this.showTeamAssignment(player);
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

    async createPlayer(name) {
        this.showLoading(true);
        this.playSound('enter');

        try {
            const response = await fetch('api/register.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    showId: this.currentGameId,
                    name
                })
            });
            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Registratie mislukt');
            }

            this.showTeamAssignment(result.player);
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
        TeamXReturningPlayerSession.save(window.localStorage, {
            showId: this.currentGameId,
            playerName: player.naam,
            playerNumber: player.playernr,
            teamNumber: player.teamnr
        });

        // Update player info
        this.elements.playerNameSpan.textContent = player.naam;
        this.elements.playerNumberSpan.textContent = player.playernr.toString().padStart(3, '0');
        this.elements.numberCircle.textContent = player.teamnr;

        // Animate UI
        this.animateTeamReveal();

        const mediaUrl = new URL('media.html', window.location.href);
        mediaUrl.searchParams.set('showId', this.currentGameId);
        mediaUrl.searchParams.set('playerName', player.naam);
        mediaUrl.searchParams.set('team', player.teamnr);

        this.elements.confirmButton.onclick = () => {
            window.location.href = mediaUrl.toString();
        };
    }

    animateTeamReveal() {
        // Hide input and show player info
        this.elements.inputGroup.classList.add('center-input');
        this.elements.enterButton.classList.add('fall');

        setTimeout(() => {
            this.elements.playerInfo.classList.add('show');
            this.elements.numberCircle.classList.add('show');
            
            // Delay stardust sound to avoid overlap with success sound
            setTimeout(() => {
                this.playSound('reveal');
            }, 800);

            setTimeout(() => {
                this.elements.numberCircle.classList.add('pulse');
                this.elements.confirmButton.classList.add('show');
                // Play whoosh sound when button appears
                setTimeout(() => {
                    this.playSound('whoosh');
                }, 100);
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
        
        // Re-enable input
        this.elements.playerNameInput.disabled = false;
        this.elements.enterButton.disabled = false;
        this.elements.playerNameInput.value = '';
        this.elements.playerNameInput.focus();
        
        this.showLoading(false);
    }

    playSound(type) {
        try {
            const sound = type === 'enter' ? this.elements.enterSound : 
                         type === 'reveal' ? this.elements.teamRevealSound : 
                         this.elements.whooshSound;
            if (sound) {
                sound.currentTime = 0;
                sound.volume = 1.0;
                const playPromise = sound.play();
                if (playPromise !== undefined) {
                    playPromise.catch(e => {
                        console.log('Sound play failed:', e.message);
                        console.log('Sound type:', type, 'Sound src:', sound.src);
                    });
                }
            } else {
                console.log('Sound element not found for type:', type);
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
