# 📱 Phone Page - Player Registration System

Complete code for the mobile player registration page.

---

## HTML Structure

```html
<div class="container">
    <audio id="enterSound" preload="auto">
        <source src="https://www.pinkmilk.eu/teamx/wp-content/uploads/2024/12/success.wav" type="audio/wav">
    </audio>
    <audio id="teamRevealSound" preload="auto">
        <source src="https://www.pinkmilk.eu/teamx/wp-content/uploads/2024/12/stardust.wav" type="audio/wav">
    </audio>
    
    <h1 class="show-name">Loading show name...</h1>
    
    <div class="input-group">
        <input type="text" id="playerName" placeholder="Wat is je voornaam?" autocomplete="off">
        <button class="enter-btn">
            Enter
            <div class="spinner"></div>
        </button>
    </div>
    <div class="player-info">
        <p><span class="player-name"></span> jij bent speler nummer <span class="player-number">000</span> van <span class="total-players">0</span></p>
        <p>en je zit in team</p>
    </div>
    <div class="number-circle"></div>
</div>

<!-- Name Verification Modal -->
<div class="modal" id="nameModal">
    <div class="modal-content">
        <h2>Deze naam staat al<br>in het systeem!</h2>
        <div class="modal-buttons">
            <button id="existingPlayer" class="modal-btn">JA, dat klopt - dat ging per ongeluk <span class="existing-name"></span></button>
            <div class="duplicate-name-section">
                <button id="newPlayer" class="modal-btn">Wij hebben meerdere mensen met deze naam</button>
                <div class="suffix-input">
                    <span>Noem mij maar</span>
                    <span class="existing-name"></span>
                     <input type="text" id="nameSuffix" maxlength="2" pattern="[a-zA-Z]{1,2}">
                </div>
            </div>
        </div>
    </div>
</div>

<button class="confirm-button">
    <span class="button-text">Klik hier <br>als je jouw team gevonden hebt!<br> en download the app!</span>
    <span class="button-icon">→</span>
</button>
<script src="https://unpkg.com/pocketbase@0.21.1/dist/pocketbase.umd.js"></script>
```

---

## CSS Styles

```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Barlow Semi Condensed', sans-serif;
}

body {
    background-color: #f5f5f5;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.container {
    width: 100%;
    max-width: 500px;
    margin: 0 auto;
    padding: 2rem;
    text-align: center;
}

.show-name {
    font-size: 2rem;
    margin-bottom: 7.5rem;
    font-family: 'Barlow Semi Condensed', sans-serif;
    font-weight: 400;
}

.input-group {
    position: relative;
    margin-bottom: 2rem;
    transition: all 0.3s ease;
}

.input-group.center-input {
    transform: translateY(-50px);
}

#playerName {
    width: 100%;
    padding: 1.2rem;
    font-size: 2.5rem;
    border: 4px solid #ddd;
    border-radius: 45px;
    outline: none;
    color: #666;
    text-align: left;
}

#playerName::placeholder {
    color: #666;
    font-size: 2rem;
    text-align: left;
}

.enter-btn {
    position: absolute;
    right: 23px;
    top: 50%;
    transform: translateY(-50%);
    padding: 0.8rem 1.5rem;
    background-color: #3a0ca3;
    color: white;
    border: none;
    border-radius: 17px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 1.2rem;
    box-shadow: 0 4px 6px rgba(0,0,0,0.7);
}

.enter-btn:hover {
    background-color: #0056b3;
    transform: translateY(-50%) scale(1.05);
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.enter-btn.fall {
    transform: translateY(100px);
    opacity: 0;
}

.spinner {
    display: none;
    width: 20px;
    height: 20px;
    border: 2px solid #ffffff;
    border-top: 2px solid transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.player-info {
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.3s ease;
    font-size: 2rem;
    margin-bottom: 2rem;
}

.player-info.show {
    opacity: 1;
    transform: translateY(0);
}

.number-circle {
    width: 200px;
    height: 200px;
    background: white;
    border: 20px solid black;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 7rem;
    margin: 2rem auto;
    opacity: 0;
    transform: scale(0.5);
    transition: all 0.3s ease;
}

.number-circle.show {
    opacity: 1;
    transform: scale(1);
}

.number-circle.pulse {
    animation: pulse 1s infinite;
}

@keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
}

.confirm-button {
    opacity: 0;
    transform: translateY(20px);
    padding: 1rem 2rem;
    background-color: #d90024;
    color: white;
    border: 4px solid white;
    border-radius: 16px;
    font-size: 2rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 1rem;
    margin: 2rem auto;
    transition: all 0.3s ease;
}

.confirm-button.show {
    opacity: 1;
    transform: translateY(0);
}

.confirm-button:hover {
    background-color: #218838;
}

/* Modal Styles */
.modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal.show {
    display: flex;
}

.modal-content {
    background: linear-gradient(135deg, #8B0000 0%, #DC143C 100%); /* Dark red gradient */
    padding: 3rem 2.5rem;
    border-radius: 36px;
    width: 90%;
    max-width: 500px;
    text-align: center;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4); /* Enhanced shadow */
    border: 4px solid white; /* White outline */
}

.modal h2 {
    font-size: 5rem; /* Twice as big (was 2.5rem) */
    line-height: 1.2;
    margin-bottom: 2rem;
    color: white; /* White text for dark red background */
    font-family: 'Barlow Semi Condensed', sans-serif;
    font-weight: 400;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3); /* Text shadow for better readability */
}

.modal-buttons {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.modal-btn {
    padding: 1.5rem;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    font-size: 2rem;
    line-height: 1.2;
    transition: all 0.3s ease;
    color: white;
    font-family: 'Barlow Semi Condensed', sans-serif;
}

#existingPlayer {
    background-color: #ff8811;
}

#existingPlayer:hover {
    background-color: #e67700;
    transform: scale(1.02);
}

#newPlayer {
    background-color: #3a0ca3;
}

#newPlayer:hover {
    background-color: #2d0a7c;
    transform: scale(1.02);
}

.suffix-input {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-top: 1.5rem;
    font-size: 2rem;
}

#nameSuffix {
    width: 60px;
    padding: 0.5rem;
    text-align: center;
    border: 2px solid #ddd;
    border-radius: 8px;
    font-size: 2rem;
}

@media (max-width: 768px) {
    .container {
        padding: 1rem;
    }
    
    .number-circle {
        width: 150px;
        height: 150px;
        font-size: 4rem;
        border-width: 15px;
    }
    
    .modal-content {
        width: 95%;
        padding: 2rem 1.5rem;
    }
    
    .modal h2 {
        font-size: 4rem; /* Slightly smaller on mobile but still big */
    }
}
```

---

## JavaScript Code

```javascript
/**
 * TeamX - Player Registration and Team Assignment System
 * Fixed version for proper field types
 */

document.addEventListener('DOMContentLoaded', async function() {
    // Mobile debug helper - REMOVE AFTER DEBUGGING
    window.onerror = function(message, source, lineno, colno, error) {
        console.error(`Error: ${message}\nLine: ${lineno}`, error);
        return true;
    };

    //-------------------------------------------------------------------------
    // SECTION 1: INITIALIZATION AND VARIABLES
    //-------------------------------------------------------------------------
    // PocketBase configuration
    const baseUrl = 'https://pinkmilk.pockethost.io';
    const pb = new PocketBase(baseUrl);
    
    // UI Elements
    const showName = document.querySelector('.show-name');
    const inputGroup = document.querySelector('.input-group');
    const playerNameInput = document.getElementById('playerName');
    const enterButton = document.querySelector('.enter-btn');
    const spinner = document.querySelector('.spinner');
    const playerInfo = document.querySelector('.player-info');
    const playerNameSpan = document.querySelector('.player-name');
    const playerNumberSpan = document.querySelector('.player-number');
    const numberCircle = document.querySelector('.number-circle');
    const confirmButton = document.querySelector('.confirm-button');
    const enterSound = document.getElementById('enterSound');
    const teamRevealSound = document.getElementById('teamRevealSound');
    
    // Name duplication modal elements
    const nameModal = document.getElementById('nameModal');
    const existingPlayerBtn = document.getElementById('existingPlayer');
    const newPlayerBtn = document.getElementById('newPlayer');
    const nameSuffixInput = document.getElementById('nameSuffix');
    const existingNameSpans = document.querySelectorAll('.existing-name');
    
    // Game state variables
    let gameRecord = null;
    let totalTeams = 0;
    let totalPlayers = 0;
    let currentGameId = null;
    
    // Queue system for handling player registrations
    const playerQueue = [];
    let isProcessingQueue = false;

    //-------------------------------------------------------------------------
    // SECTION 2: POCKETBASE CONNECTION AND AUTHENTICATION
    //-------------------------------------------------------------------------
    /**
     * Initialize PocketBase connection and authenticate
     * @returns {Promise<boolean>} Success status
     */
    async function initializePocketBase() {
        try {
            console.log('Attempting to authenticate with PocketBase...');
            const authData = await pb.admins.authWithPassword("klaas@republick.nl", "biknu8-pyrnaB-mytvyx");
            console.log('Successfully authenticated with PocketBase');
            const success = await loadGameData();
            return success;
        } catch (error) {
            console.error('Authentication error:', error);
            alert('Kan geen verbinding maken met de database. Vernieuw de pagina.');
            return false;
        }
    }

    //-------------------------------------------------------------------------
    // SECTION 3: GAME DATA LOADING
    //-------------------------------------------------------------------------
    /**
     * Load game configuration data from teamx collection
     * Logic: First upcoming show (earliest date) with priority 1, 
     *        fallback to priority 2 if no priority 1 exists
     * @returns {Promise<boolean>} Success status
     */
    async function loadGameData() {
        try {
            console.log('Attempting to load game data...');
            
            // First try: Get shows with priority 1, sorted by date (earliest first)
            let records = await pb.collection('teamx').getFullList({
                filter: 'priority = 1 && teamnumber > 0',
                sort: 'datum'
            });
            
            console.log('Priority 1 records found:', records.length);
            
            // Fallback: If no priority 1 shows, try priority 2
            if (records.length === 0) {
                console.log('No priority 1 shows, trying priority 2...');
                records = await pb.collection('teamx').getFullList({
                    filter: 'priority = 2 && teamnumber > 0',
                    sort: 'datum'
                });
                console.log('Priority 2 records found:', records.length);
            }
            
            console.log('Records returned:', records);
            
            if (records.length > 0) {
                // Take the first record (earliest date)
                gameRecord = records[0];
                currentGameId = gameRecord.id;
                
                // Debug info visible in console
                console.log('Game loaded. ID:', gameRecord.id);
                console.log('Show name:', gameRecord.show);
                console.log('Show date:', gameRecord.datum);
                console.log('Priority:', gameRecord.priority);
                
                // Update UI with game information
                showName.textContent = gameRecord.show || 'QuizMaster Klaas presenteert';
                totalTeams = gameRecord.teamnumber;
                totalPlayers = gameRecord.players;
                
                // Enable real-time updates for player counts
                setupRealtimeUpdates();
                
                return true;
            } else {
                console.error('No game records found with priority 1 or 2!');
                showName.textContent = 'Geen actieve quiz gevonden';
                alert('Geen actieve quiz gevonden. Zet een show op priority 1 of 2.');
                return false;
            }
        } catch (error) {
            console.error('Error loading game data:', error);
            showName.textContent = 'Error loading game';
            alert('Error: ' + (error.message || 'Kan geen spelgegevens laden'));
            return false;
        }
    }
    
    /**
     * Set up realtime updates for allplayers collection
     */
    function setupRealtimeUpdates() {
        try {
            // Subscribe to the allplayers collection for this game ID
            pb.collection('allplayers').subscribe(`show="${currentGameId}"`, function(e) {
                // This will be called when any player record is created/updated/deleted
                console.log('Player data updated:', e);
            });
            console.log('Realtime updates initialized for game ID:', currentGameId);
        } catch (error) {
            console.error('Error setting up realtime updates:', error);
        }
    }

    //-------------------------------------------------------------------------
    // SECTION 4: TEAM ASSIGNMENTS AND PLAYER REGISTRATION
    //-------------------------------------------------------------------------
    /**
     * Check if a name already exists in the allplayers collection
     * @param {string} name - The player name to check
     * @returns {Promise<Object>} Result with exists flag and player data if found
     */
    async function checkExistingName(name) {
        try {
            // Query allplayers collection for this specific game and name
            const existingPlayers = await pb.collection('allplayers').getFullList({
                filter: `show="${currentGameId}" && naam~"${name}"` 
            });
            
            if (existingPlayers.length > 0) {
                console.log('Found existing player with name:', name);
                return {
                    exists: true,
                    player: existingPlayers[0]
                };
            }
            
            return {
                exists: false,
                player: null
            };
        } catch (error) {
            console.error('Error checking existing name:', error);
            return {
                exists: false,
                player: null
            };
        }
    }

    /**
     * Get current player count for this game
     * @returns {Promise<number>} Current player count
     */
    async function getCurrentPlayerCount() {
        try {
            const result = await pb.collection('allplayers').getFullList({
                filter: `show="${currentGameId}"`,
                fields: 'id' // Only get IDs to minimize data transfer
            });
            
            console.log('Current player count:', result.length);
            return result.length;
        } catch (error) {
            console.error('Error getting player count:', error);
            return 0;
        }
    }

    /**
     * Get a unique random player number
     * @returns {Promise<number>} A unique player number
     */
    async function getUniqueRandomPlayerNumber() {
        try {
            // Get all used player numbers for this game
            const players = await pb.collection('allplayers').getFullList({
                filter: `show="${currentGameId}"`,
                fields: 'playernr' // Only fetch the player numbers
            });
            
            // Create a set of used numbers for efficient lookup
            const usedNumbers = new Set();
            players.forEach(player => {
                if (player.playernr) {
                    usedNumbers.add(parseInt(player.playernr));
                }
            });
            
            console.log(`Currently used player numbers: ${Array.from(usedNumbers).sort((a,b) => a-b).join(', ')}`);
            
            // If all possible numbers are taken within range, use an extended range
            if (usedNumbers.size >= totalPlayers) {
                console.log(`All numbers 1-${totalPlayers} are taken, using extended range`);
                return totalPlayers + getRandomInt(1, 20); // Add a small buffer above totalPlayers
            }
            
            // Find all available numbers in range
            let availableNumbers = [];
            for (let i = 1; i <= totalPlayers; i++) {
                if (!usedNumbers.has(i)) {
                    availableNumbers.push(i);
                }
            }
            
            // If we have available numbers, pick one randomly
            if (availableNumbers.length > 0) {
                const randomIndex = Math.floor(Math.random() * availableNumbers.length);
                const chosenNumber = availableNumbers[randomIndex];
                console.log(`Assigned player number ${chosenNumber} from ${availableNumbers.length} available numbers`);
                return chosenNumber;
            }
            
            // Fallback: use a timestamp-based number
            const fallbackNumber = 100 + (Date.now() % 900);
            console.log(`Using fallback player number: ${fallbackNumber}`);
            return fallbackNumber;
        } catch (error) {
            console.error('Error getting unique player number:', error);
            // Fallback to a timestamp-based number if anything fails
            return 100 + (Date.now() % 900);
        }
    }

    /**
     * Initialize team assignments by calculating current team sizes
     * @returns {Promise<Object>} Team sizes
     */
    async function initializeTeamAssignments() {
        try {
            // Initialize team sizes
            const teamSizes = {};
            for (let i = 1; i <= totalTeams; i++) {
                teamSizes[i] = 0;
            }
            
            // Get all players for this game
            const players = await pb.collection('allplayers').getFullList({
                filter: `show="${currentGameId}"`,
                fields: 'teamnr' // Only fetch the team numbers
            });
            
            // Count players in each team
            players.forEach(player => {
                if (player.teamnr) {
                    teamSizes[player.teamnr] = (teamSizes[player.teamnr] || 0) + 1;
                }
            });
            
            console.log('Current team sizes:', teamSizes);
            return teamSizes;
        } catch (error) {
            console.error('Error initializing team assignments:', error);
            // Return default team sizes if anything fails
            const defaultTeamSizes = {};
            for (let i = 1; i <= totalTeams; i++) {
                defaultTeamSizes[i] = 0;
            }
            return defaultTeamSizes;
        }
    }

    /**
     * Determine the next team to assign a player to
     * @param {Object} teamSizes - Current team sizes
     * @returns {Promise<number>} Team number to assign
     */
    async function getNextTeam(teamSizes) {
        const totalCurrentPlayers = Object.values(teamSizes).reduce((a, b) => a + b, 0);
        const targetMinSize = Math.floor((totalCurrentPlayers + 1) / totalTeams);

        const minSize = Math.min(...Object.values(teamSizes));
        const maxSize = Math.max(...Object.values(teamSizes));

        let eligibleTeams;

        if (maxSize - minSize > 1) {
            // Balance teams if there's a big difference
            eligibleTeams = Object.keys(teamSizes).filter(team => 
                teamSizes[team] === minSize
            );
        } else {
            // Otherwise, assign to teams with room
            eligibleTeams = Object.keys(teamSizes).filter(team => 
                teamSizes[team] <= targetMinSize
            );
        }

        if (eligibleTeams.length === 0) {
            eligibleTeams = Object.keys(teamSizes);
        }

        const randomIndex = Math.floor(Math.random() * eligibleTeams.length);
        return parseInt(eligibleTeams[randomIndex]);
    }

    /**
     * Helper function to get a random number in a range
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Random integer in the range
     */
    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    //-------------------------------------------------------------------------
    // SECTION 5: UI HANDLING
    //-------------------------------------------------------------------------
    /**
     * Show the name duplication modal
     * @param {string} name - The duplicate name found
     * @param {Object} existingPlayer - The existing player record
     */
    function showNameModal(name, existingPlayer) {
        existingNameSpans.forEach(span => span.textContent = name);
        nameModal.classList.add('show');

        existingPlayerBtn.onclick = () => {
            nameModal.classList.remove('show');
            showExistingTeam(existingPlayer);
        };

        newPlayerBtn.onclick = () => {
            const suffix = nameSuffixInput.value.trim();
            if (suffix && /^[a-zA-Z]{1,2}$/.test(suffix)) {
                nameModal.classList.remove('show');
                addToPlayerQueue(`${name} ${suffix}`);
            } else {
                alert('Voer 1 of 2 letters van je achternaam in');
            }
        };
    }

    /**
     * Show team assignment for an existing player
     * @param {Object} player - The player record
     */
    function showExistingTeam(player) {
        enterSound.play();
        
        playerNameSpan.textContent = player.naam;
        playerNumberSpan.textContent = player.playernr.toString().padStart(3, '0');
        const playerNumberText = document.querySelector('.player-number').parentElement;
        playerNumberText.innerHTML = `${player.naam} jij bent speler nummer <span class="player-number">${player.playernr.toString().padStart(3, '0')}</span> van ${totalPlayers}`;
        
        numberCircle.textContent = player.teamnr;

        inputGroup.classList.add('center-input');
        enterButton.classList.add('fall');
        
        setTimeout(() => {
            playerInfo.classList.add('show');
            numberCircle.classList.add('show');
            teamRevealSound.play();
            setTimeout(() => {
                numberCircle.classList.add('pulse');
                confirmButton.classList.add('show');
            }, 500);
        }, 300);
    }

    /**
     * Show UI for a successfully registered player
     * @param {Object} player - The player data
     */
    function showTeamAssignment(player) {
        playerNameSpan.textContent = player.naam;
        playerNumberSpan.textContent = player.playernr.toString().padStart(3, '0');
        const playerNumberText = document.querySelector('.player-number').parentElement;
        playerNumberText.innerHTML = `${player.naam} jij bent speler nummer <span class="player-number">${player.playernr.toString().padStart(3, '0')}</span> van ${totalPlayers}`;
        
        numberCircle.textContent = player.teamnr;

        inputGroup.classList.add('center-input');
        enterButton.classList.add('fall');
        
        setTimeout(() => {
            playerInfo.classList.add('show');
            numberCircle.classList.add('show');
            teamRevealSound.play();
            setTimeout(() => {
                numberCircle.classList.add('pulse');
                confirmButton.classList.add('show');
            }, 500);
        }, 300);

        if (gameRecord && gameRecord.url) {
            confirmButton.addEventListener('click', () => {
                window.location.href = gameRecord.url;
            });
        }
    }

    //-------------------------------------------------------------------------
    // SECTION 6: PLAYER REGISTRATION QUEUE
    //-------------------------------------------------------------------------
    /**
     * Add a player name to the registration queue
     * @param {string} name - The player name
     */
    function addToPlayerQueue(name) {
        playerQueue.push(name);
        processPlayerQueue();
    }

    /**
     * Process the next player in the queue
     * @returns {Promise<void>}
     */
    async function processPlayerQueue() {
        if (isProcessingQueue || playerQueue.length === 0) return;
        
        isProcessingQueue = true;
        const name = playerQueue.shift();
        
        try {
            await createPlayer(name);
        } catch (error) {
            console.error('Error processing player in queue:', error);
            alert('Er is een probleem opgetreden bij het toevoegen van je naam. Probeer het opnieuw.');
            // Re-enable UI elements
            spinner.style.display = 'none';
            enterButton.disabled = false;
        } finally {
            isProcessingQueue = false;
            // Process next player in queue if any
            if (playerQueue.length > 0) {
                setTimeout(processPlayerQueue, 700); // Small delay between processing
            }
        }
    }

    /**
     * Create a new player in the allplayers collection
     * @param {string} name - The player name
     * @returns {Promise<void>}
     */
    async function createPlayer(name) {
        spinner.style.display = 'block';
        enterButton.disabled = true;
        enterSound.play();

        try {
            // Get a unique player number
            const playerNumber = await getUniqueRandomPlayerNumber();
            console.log(`Assigned player number ${playerNumber} to ${name}`);
            
            // Calculate which team to assign
            const teamSizes = await initializeTeamAssignments();
            const teamNumber = await getNextTeam(teamSizes);
            console.log(`Assigned team ${teamNumber} to ${name}`);

            // Create a new player record in the allplayers collection
            const newPlayerData = {
                show: currentGameId,    // Game ID as string
                naam: name,             // Player name
                teamnr: teamNumber,     // Team number
                playernr: playerNumber  // Player number
            };

            console.log('Creating player record with data:', newPlayerData);

            // Create the record with retry logic
            let createdPlayer = null;
            let retryCount = 0;
            
            while (!createdPlayer && retryCount < 3) {
                try {
                    createdPlayer = await pb.collection('allplayers').create(newPlayerData);
                    console.log('Player record created successfully:', createdPlayer);
                } catch (createError) {
                    retryCount++;
                    console.error(`Error creating player record (attempt ${retryCount}/3):`, createError);
                    
                    if (retryCount >= 3) {
                        throw createError;
                    }
                    
                    // Wait before retrying
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }

            if (!createdPlayer) {
                throw new Error('Failed to create player record after retries');
            }

            // Show the team assignment UI
            showTeamAssignment(createdPlayer);
            
        } catch (error) {
            console.error('Error creating player:', error);
            alert('Er is een probleem opgetreden bij het toevoegen van je naam. Probeer het opnieuw.');
            spinner.style.display = 'none';
            enterButton.disabled = false;
        }
    }

    //-------------------------------------------------------------------------
    // SECTION 7: EVENT LISTENERS
    //-------------------------------------------------------------------------
    /**
     * Handle name submission
     * @param {string} name - The player name
     * @returns {Promise<void>}
     */
    async function handleNameSubmission(name) {
        if (!name) return;
        
        const nameCheck = await checkExistingName(name);
        
        if (nameCheck.exists) {
            showNameModal(name, nameCheck.player);
        } else {
            addToPlayerQueue(name);
        }
    }

    // Button click event
    enterButton.addEventListener('click', async (e) => {
        e.preventDefault();
        const playerName = playerNameInput.value.trim();
        if (playerName) {
            await handleNameSubmission(playerName);
        }
    });

    // Enter key press event
    playerNameInput.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const playerName = playerNameInput.value.trim();
            if (playerName) {
                await handleNameSubmission(playerName);
            }
        }
    });

    // Close modal when clicking outside
    nameModal.addEventListener('click', (e) => {
        if (e.target === nameModal) {
            nameModal.classList.remove('show');
        }
    });

    //-------------------------------------------------------------------------
    // SECTION 8: INITIALIZATION
    //-------------------------------------------------------------------------
    // Initialize the page
    await initializePocketBase();

    // Cleanup on page unload
    window.addEventListener('unload', () => {
        pb.collection('allplayers').unsubscribe();
    });
});
```

---

## Key Features

### 🎯 Functionality
- **Player Registration**: Players enter their name and get assigned to a team
- **Duplicate Name Handling**: Modal appears if name already exists
- **Team Assignment**: Automatically balances players across teams
- **Random Player Numbers**: Assigns unique random numbers within the player count
- **Real-time Updates**: Uses PocketBase real-time subscriptions
- **Sound Effects**: Success and team reveal sounds

### 🎨 Styling
- **Confirm Button**: Red background (#d90024) with white 4px border
- **Modal**: Dark red gradient background with white text and border
- **Responsive**: Mobile-optimized design
- **Animations**: Smooth transitions and pulse effects

### 🔧 Configuration
- **PocketBase URL**: `https://pinkmilk.pockethost.io`
- **Active Show**: Loads show with `priority = 5`
- **Collections**: `teamx` (shows) and `allplayers` (player data)

---

## Important Notes

1. **Priority System**: The phone page loads the show with `priority = 5` from the `teamx` collection
2. **White Border**: Confirm button has `border: 4px solid white`
3. **Multi-line Text**: Button text uses `<br>` tags for line breaks
4. **Sound Files**: Hosted at `https://www.pinkmilk.eu/teamx/wp-content/uploads/2024/12/`
