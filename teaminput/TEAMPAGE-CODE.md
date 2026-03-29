# 📺 TeamPage - Team Display System

Complete code for the large screen team display page that shows all teams and players in real-time.

---

## HTML Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Team Overview</title>
    <link href="https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:wght@400&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="info-section">
                <div class="title-block">
                    <p class="title-line"> <span id="showName"></span></p>
                    <p class="title-line">De teams van vandaag zijn:</p>
                </div>
            </div>
            <div class="qr-code-container">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=https://www.pinkmilk.eu/teamx" alt="Team URL QR Code" class="qr-code">
            </div>
        </div>
        
        <div id="teamsContainer" class="teams-container"></div>
        
        <div class="team-summaries-container" id="teamSummariesContainer"></div>
    </div>
    <script src="https://unpkg.com/pocketbase@0.21.1/dist/pocketbase.umd.js"></script>
    <script src="script.js"></script>
    <script>
        function toggleFullScreen() {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
            }
        }
        
        // Trigger fullscreen with F key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'f' || e.key === 'F') {
                toggleFullScreen();
            }
        });
    </script>
</body>
</html>
```

---

## CSS Styles

```css
/* Add the dynamic background */
body::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: linear-gradient(
        125deg,
        #ff7eb3,
        #ff758c,
        #ff8c42,
        #ffd700,
        #b388ff,
        #8c9eff
    );
    background-size: 300% 300%;
    z-index: -1;
    animation: gradientMove 35s ease infinite;
    opacity: .7; /* Adjust this value to make background more or less visible */
}

@keyframes gradientMove {
    0% {
        background-position: 0% 50%;
    }
    50% {
        background-position: 100% 50%;
    }
    100% {
        background-position: 0% 50%;
    }
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Barlow Semi Condensed', sans-serif;
}

body {
    background-color: #f5f5f5;
    min-height: 100vh;
    padding: 2rem;
}

.container {
    width: 100%;
    max-width: 100%;
    margin: 0 auto;
    padding: 2rem;
    overflow: visible;
}

.info-section {
    margin-bottom: 2rem;
    text-align: center;
}

.info-section p {
    font-size: 5rem;
    margin-bottom: 0.25rem;  /* Half the original spacing */
    font-weight: 400;
    line-height: 1;  /* This will tighten up the line spacing */
}

.teams-container {
    display: flex;
    justify-content: center;
    align-items: stretch;
    margin: 5rem auto;  /* Top margin controls spacing between heading and circles */
    padding: 0;
    width: 100%;
    gap: 2rem;
    overflow: visible;
}

.team-column {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
    /* Remove gap from here as we'll control spacing in children */
}

.team-circle {
    --base-size: min(150px, calc(80vw / var(--team-count)));
    --border-width: calc(var(--base-size) * 0.09);
    width: var(--base-size);
    height: var(--base-size);
    background: white;
    border: var(--border-width) solid black;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: calc(var(--base-size) * 0.4);
    font-weight: bold;
    color: #333;
    margin-bottom: 1.5rem;
}

.team-numbers {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    width: 180px;
    /* Add margin to push summary to bottom */
    margin-bottom: auto;
}

.team-slot {
    background: linear-gradient(135deg, #F8D2BA 20%, #AB13A8 100%);
    color: #333;
    padding: 0.05rem 1.0rem;
    border-radius: 12px;
    text-align: center;
    width: 100%;
    font-size: 2rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    border: 2px solid white; /* Added white outline */
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2); /* Optional: adds depth */
}

.team-slot .player-number {
    font-size: 0.8em;
    color: #666;
    margin-right: 0.5rem;
}

.team-summary {
    font-size: 1.5rem;
    padding: 0.5rem 1rem;
    background: #e9ecef;
    border-radius: 4px;
    text-align: center;
    width: 180px;
    /* Add margin-top to ensure consistent spacing */
    margin-top: 1.5rem;
}

.qr-code-container {
    position: fixed;
    top: 70px;  /* 70px from top */
    left: 45px;  /* 45px from left */
    width: 200px; /* Increased to accommodate padding */
    height: 200px; /* Increased to accommodate padding */
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    padding: 10px; /* Creates white outline */
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.qr-code {
    width: 180px; /* Specific size requested */
    height: 180px; /* Specific size requested */
    object-fit: contain;
}

@media (max-width: 768px) {
    .container {
        padding: 1rem;
    }
    
    .teams-container {
        gap: 1rem;
    }
    
    .team-slot {
        padding: 0.5rem 1rem;
    }

    .info-section p {
        font-size: 3rem;
    }

    .team-numbers,
    .team-summary {
        width: 140px;
    }
}
```

---

## JavaScript Code

```javascript
/**
 * TeamPage - Team Overview Display System
 * Improved version with enhanced real-time updates
 */

document.addEventListener('DOMContentLoaded', async function() {
    // Mobile debug helper
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
    
    // Game state variables
    let gameRecord = null;
    let currentGameId = null;
    let playersByTeam = {};
    let autoRefreshInterval = null;
    
    //-------------------------------------------------------------------------
    // SECTION 2: POCKETBASE CONNECTION AND AUTHENTICATION
    //-------------------------------------------------------------------------
    /**
     * Initialize PocketBase connection and authenticate
     * @returns {Promise<boolean>} Success status
     */
    async function authenticatePocketBase() {
        try {
            console.log('Attempting to authenticate with PocketBase...');
            const authData = await pb.admins.authWithPassword("klaas@republick.nl", "biknu8-pyrnaB-mytvyx");
            console.log('Authentication successful');
            return true;
        } catch (error) {
            console.error('Authentication failed:', error);
            document.getElementById('showName').textContent = 'Authentication Error';
            return false;
        }
    }

    /**
     * Set CSS variable for team count (used for scaling team circles)
     * @param {number} totalTeams - Total number of teams
     */
    function setTeamCountCSS(totalTeams) {
        document.documentElement.style.setProperty('--team-count', totalTeams);
    }

    //-------------------------------------------------------------------------
    // SECTION 3: GAME DATA LOADING
    //-------------------------------------------------------------------------
    /**
     * Load game configuration data from teamx collection
     * Logic: First upcoming show (earliest date) with priority 1,
     *        fallback to priority 2 if no priority 1 exists
     * @returns {Promise<Object>} Game record data
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
            if (!records || records.length === 0) {
                console.log('No priority 1 shows, trying priority 2...');
                records = await pb.collection('teamx').getFullList({
                    filter: 'priority = 2 && teamnumber > 0',
                    sort: 'datum'
                });
                console.log('Priority 2 records found:', records.length);
            }
            
            if (!records || records.length === 0) {
                document.getElementById('showName').textContent = 'Geen actieve quiz gevonden (zet priority op 1 of 2)';
                console.error('No game records found with priority 1 or 2 and teams > 0');
                throw new Error('No game data found');
            }
            
            // Take the first record (earliest date)
            gameRecord = records[0];
            currentGameId = gameRecord.id;
            
            console.log('Game data loaded. ID:', gameRecord.id);
            console.log('Game Show Name:', gameRecord.show);
            console.log('Show date:', gameRecord.datum);
            console.log('Priority:', gameRecord.priority);
            
            return gameRecord;
        } catch (error) {
            console.error('Error loading game data:', error);
            document.getElementById('showName').textContent = 'Error loading game data';
            throw error;
        }
    }

    /**
     * Load all players for the current game
     * @returns {Promise<Array>} All player records
     */
    async function loadPlayers() {
        try {
            console.log('Loading players for game ID:', currentGameId);
            // Use string comparison for the show field which contains the game ID
            const players = await pb.collection('allplayers').getFullList({
                filter: `show="${currentGameId}"`,
                sort: '+playernr'
            });
            console.log(`Found ${players.length} players`);
            return players;
        } catch (error) {
            console.error('Error loading players:', error);
            return [];
        }
    }

    /**
     * Organize players by team
     * @param {Array} players - All player records
     * @returns {Object} Players organized by team
     */
    function organizePlayersByTeam(players) {
        const teamData = {};
        
        players.forEach(player => {
            const teamNumber = player.teamnr;
            
            if (!teamData[teamNumber]) {
                teamData[teamNumber] = [];
            }
            
            teamData[teamNumber].push(player);
        });
        
        // Sort players within each team by player number
        for (const team in teamData) {
            teamData[team].sort((a, b) => {
                const numA = parseInt(a.playernr || "999");
                const numB = parseInt(b.playernr || "999");
                return numA - numB;
            });
        }
        
        return teamData;
    }

    //-------------------------------------------------------------------------
    // SECTION 4: UI CREATION AND UPDATES
    //-------------------------------------------------------------------------
    /**
     * Create a team column element
     * @param {number} teamNumber - The team number
     * @param {Array} teamPlayers - Players in this team
     * @returns {HTMLElement} Team column element
     */
    function createTeamColumn(teamNumber, teamPlayers) {
        const column = document.createElement('div');
        column.className = 'team-column';

        // Create circle
        const circle = document.createElement('div');
        circle.className = 'team-circle';
        circle.textContent = teamNumber;
        
        // Create container for player names
        const numbersContainer = document.createElement('div');
        numbersContainer.className = 'team-numbers';
        
        // Add player slots
        teamPlayers.forEach(player => {
            const slot = document.createElement('div');
            slot.className = 'team-slot';
            
            // Create player number span
            const numberSpan = document.createElement('span');
            numberSpan.className = 'player-number';
            numberSpan.textContent = player.playernr;
            
            // Add number and name
            slot.appendChild(numberSpan);
            slot.appendChild(document.createTextNode(player.naam));
            
            numbersContainer.appendChild(slot);
        });

        column.appendChild(circle);
        column.appendChild(numbersContainer);

        return column;
    }

    /**
     * Update the display with current game and player data
     * @param {Object} gameRecord - The game configuration
     * @param {Object} playersByTeam - Players organized by team
     */
    function updateDisplay(gameRecord, playersByTeam) {
        try {
            if (!gameRecord) {
                throw new Error('No game record provided');
            }

            const totalTeams = gameRecord.teamnumber;
            setTeamCountCSS(totalTeams);
            
            // Update show name - directly use the text field
            document.getElementById('showName').textContent = gameRecord.show || 'Team Overview';
            
            // Clear and update teams container
            const container = document.getElementById('teamsContainer');
            if (!container) {
                console.error('Teams container not found in DOM');
                return;
            }
            
            container.innerHTML = '';

            // Create columns for each team
            for (let i = 1; i <= totalTeams; i++) {
                const teamPlayers = playersByTeam[i] || [];
                const column = createTeamColumn(i, teamPlayers);
                container.appendChild(column);
            }

            console.log('Display updated with', totalTeams, 'teams');
        } catch (error) {
            console.error('Error updating display:', error);
            document.getElementById('showName').textContent = 'Error updating display';
        }
    }

    /**
     * Force a refresh of the data and display
     */
    async function refreshData() {
        try {
            console.log('Manual refresh triggered');
            const players = await loadPlayers();
            playersByTeam = organizePlayersByTeam(players);
            updateDisplay(gameRecord, playersByTeam);
        } catch (error) {
            console.error('Error during manual refresh:', error);
        }
    }

    //-------------------------------------------------------------------------
    // SECTION 5: REALTIME UPDATES
    //-------------------------------------------------------------------------
    /**
     * Set up real-time subscriptions for player data changes
     */
    function setupRealtimeUpdates() {
        try {
            // 1. Subscribe to allplayers collection for this game using string comparison
            console.log('Setting up real-time subscription for game ID:', currentGameId);
            
            // Unsubscribe from any existing subscriptions first
            try {
                pb.collection('allplayers').unsubscribe();
                console.log('Unsubscribed from previous subscriptions');
            } catch (e) {
                // Ignore errors when unsubscribing (might not have any)
            }
            
            // Create the subscription
            pb.collection('allplayers').subscribe('*', async function(e) {
                console.log('Real-time event received:', e.action);
                
                // Only refresh on create, update or delete actions
                if (['create', 'update', 'delete'].includes(e.action)) {
                    // Reload all players and update display
                    const players = await loadPlayers();
                    playersByTeam = organizePlayersByTeam(players);
                    updateDisplay(gameRecord, playersByTeam);
                    console.log('Display updated after real-time event');
                }
            });
            
            // 2. Set up a backup interval refresh (every 10 seconds)
            if (autoRefreshInterval) {
                clearInterval(autoRefreshInterval);
            }
            
            autoRefreshInterval = setInterval(refreshData, 10000);
            
            console.log('Real-time updates and backup refresh set up successfully');
        } catch (error) {
            console.error('Error setting up real-time updates:', error);
            
            // If real-time updates fail, still set up the backup refresh
            if (autoRefreshInterval) {
                clearInterval(autoRefreshInterval);
            }
            autoRefreshInterval = setInterval(refreshData, 5000);
            console.log('Backup refresh set up after real-time subscription failure');
        }
    }

    //-------------------------------------------------------------------------
    // SECTION 6: INITIALIZATION
    //-------------------------------------------------------------------------
    /**
     * Initialize the team overview display
     */
    async function initializeTeamAssignments() {
        try {
            // First authenticate
            const isAuthenticated = await authenticatePocketBase();
            if (!isAuthenticated) {
                return;
            }

            // Then load game data
            gameRecord = await loadGameData();
            if (!gameRecord) {
                document.getElementById('showName').textContent = 'No game data available';
                return;
            }

            // Load players and organize by team
            const players = await loadPlayers();
            playersByTeam = organizePlayersByTeam(players);
            
            // Update the display
            updateDisplay(gameRecord, playersByTeam);

            // Set up real-time subscription and backup refresh
            setupRealtimeUpdates();
            
            // Set up a manual refresh button if one exists in the DOM
            const refreshButton = document.getElementById('refreshButton');
            if (refreshButton) {
                refreshButton.addEventListener('click', refreshData);
            }
            
            // Optional: Add keyboard shortcut for refresh (F5 or Ctrl+R)
            document.addEventListener('keydown', function(e) {
                if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
                    e.preventDefault();
                    refreshData();
                }
            });

        } catch (error) {
            console.error('Error in initialization:', error);
            document.getElementById('showName').textContent = 'Error loading data';
        }
    }

    // Start the initialization
    initializeTeamAssignments();

    // Cleanup on page unload
    window.addEventListener('unload', () => {
        if (autoRefreshInterval) {
            clearInterval(autoRefreshInterval);
        }
        pb.collection('allplayers').unsubscribe();
    });
});
```

---

## Key Features

### 🎯 Functionality
- **Real-time Updates**: Automatically updates when players register (PocketBase subscriptions)
- **Team Display**: Shows all teams with numbered circles and player lists
- **Dynamic Sizing**: Team circles scale based on number of teams
- **QR Code**: Fixed position QR code for easy mobile access
- **Fullscreen Mode**: Press 'F' key to toggle fullscreen
- **Auto-refresh**: Backup refresh every 10 seconds

### 🎨 Styling
- **Animated Gradient Background**: Moving rainbow gradient (70% opacity)
- **QR Code Position**: 70px from top, 45px from left
- **Team Circles**: White circles with black borders, dynamically sized
- **Player Slots**: Gradient background (#F8D2BA to #AB13A8) with white border
- **Responsive**: Adapts to different screen sizes

### 🔧 Configuration
- **PocketBase URL**: `https://pinkmilk.pockethost.io`
- **Active Show**: Loads first show by date with `priority = 1`, fallback to `priority = 2`
- **Collections**: `teamx` (shows) and `allplayers` (player data)
- **QR Code**: Links to `https://www.pinkmilk.eu/teamx`

### ⌨️ Keyboard Shortcuts
- **F**: Toggle fullscreen mode
- **F5 / Ctrl+R**: Manual refresh (prevented default, triggers custom refresh)

---

## Important Notes

1. **Priority System**: Loads first show by date with priority 1, fallback to priority 2
2. **Spacing Control**: `.teams-container` margin (line 66 in CSS) controls spacing between heading and circles
3. **QR Code Position**: Top: 70px, Left: 45px (lines 138-139 in CSS)
4. **Real-time**: Uses PocketBase real-time subscriptions + 10-second backup refresh
5. **Player Sorting**: Players sorted by player number within each team

---

## URL Structure

- **TeamPage**: `https://www.pinkmilk.eu/teamx/teampage/`
- **Phone Registration**: `https://www.pinkmilk.eu/teamx` (QR code destination)
- **Input Page**: `https://www.pinkmilk.eu/teaminput/`
