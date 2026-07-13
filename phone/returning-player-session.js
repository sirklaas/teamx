(function (root, factory) {
    const api = factory();

    if (typeof module === 'object' && module.exports) {
        module.exports = api;
    }

    if (root) {
        root.TeamXReturningPlayerSession = api;
    }
}(typeof window === 'undefined' ? globalThis : window, function () {
    const storageKey = 'teamx.returning-player.v1';

    function isValidPlayer(player) {
        return Boolean(
            player &&
            typeof player.showId === 'string' && player.showId.length > 0 &&
            typeof player.playerName === 'string' && player.playerName.length > 0 &&
            Number.isInteger(player.playerNumber) && player.playerNumber > 0 &&
            Number.isInteger(player.teamNumber) && player.teamNumber > 0
        );
    }

    function save(storage, player) {
        if (!isValidPlayer(player)) {
            return;
        }

        storage.setItem(storageKey, JSON.stringify(player));
    }

    function loadForShow(storage, showId) {
        try {
            const player = JSON.parse(storage.getItem(storageKey));

            if (isValidPlayer(player) && player.showId === showId) {
                return player;
            }
        } catch (_) {
            // Treat unreadable storage as a new-player visit.
        }

        storage.removeItem(storageKey);
        return null;
    }

    return { save, loadForShow };
}));
