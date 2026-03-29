/**
 * PocketBase Configuration
 * Update the PB_URL with your PocketBase instance URL
 */

const CONFIG = {
    // Your PocketBase URL - update this!
    PB_URL: 'https://pinkmilk.pockethost.io', // PocketHost URL
    
    // Collection name
    COLLECTION: 'teamx',

    // Eventbureau options (stored as text in 'buro' field)
    EVENT_BUREAUS: ['Special', 'Mark', 'Showbird'],
    
    // Field mappings from PocketBase to form
    FIELDS: {
        id: 'id',
        show: 'show',
        teamnumber: 'hoeveel_teams',
        players: 'players',
        playerData: 'notities',
        priority: 'priority',
        tv_screen: 'tv_screen',
        audio_input: 'audio_input',
        parking: 'parking',
        photo_circle: 'photo_circle'
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
