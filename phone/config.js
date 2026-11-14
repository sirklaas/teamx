/**
 * Configuration file for TeamX Phone Registration
 * Shared configuration with teaminput folder
 */

const CONFIG = {
    // PocketBase configuration
    PB_URL: 'https://pb.pinkmilk.eu',
    
    // Collections
    COLLECTION_TEAMS: 'teamx',
    COLLECTION_PLAYERS: 'allplayers',
    
    // Priority for active show
    ACTIVE_PRIORITY: 5,
    
    // Sound effects
    SOUNDS: {
        enter: 'success.mp3',
        reveal: 'stardust.mp3'
    },
    
    // UI Configuration
    UI: {
        animationDuration: 300,
        refreshInterval: 10000,
        pulseDelay: 500
    }
};
