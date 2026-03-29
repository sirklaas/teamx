/**
 * TeamX Input - PocketBase Integration
 * Loads and saves data directly to PocketBase
 * VERSION: 2.5.0 - Added Telefoons and Spa Rood checkboxes (2025-12-12)
 */

(function () {
    'use strict';

    // PocketBase client
    let pb = null;

    // Buro options loaded from PocketBase schema
    let buroOptions = [];


    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function () {
        console.log('TeamX Input - VERSION 2.2.0 - PocketBase Integration initialized');
        console.log('If you see this message, the new code is deployed correctly.');

        initPocketBase();
    });

    function formatMonthDayNl(datum) {
        if (!datum) return '';
        const date = new Date(datum);
        if (Number.isNaN(date.getTime())) return '';
        const months = ['januari', 'februari', 'maart', 'april', 'mei', 'juni',
            'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
        return `${date.getDate()} ${months[date.getMonth()]}`;
    }

    function formatWeekdayNl(datum) {
        if (!datum) return '';
        const date = new Date(datum);
        if (Number.isNaN(date.getTime())) return '';
        const weekdays = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
        return weekdays[date.getDay()];
    }

    function updateDateUiForInput(dateInput) {
        if (!dateInput) return;
        const form = dateInput.closest('form');
        if (!form) return;

        const value = dateInput.value;
        const weekday = formatWeekdayNl(value);
        const monthDay = formatMonthDayNl(value);

        const label = form.querySelector('[data-weekday-for="datum"]');
        if (label) {
            label.textContent = weekday || 'Datum';
        }

        const display = form.querySelector('[data-date-display-for="datum"]');
        if (display) {
            display.textContent = monthDay || '';
        }
    }

    function initDateUiWithin(rootEl) {
        const dateInputs = rootEl.querySelectorAll('input[type="date"][name="datum"]');
        dateInputs.forEach(input => {
            updateDateUiForInput(input);
            input.addEventListener('change', () => updateDateUiForInput(input));
            input.addEventListener('input', () => updateDateUiForInput(input));
        });
    }

    async function loadBuroOptionsFromSchema() {
        try {
            // Fetch collection schema to get buro field options
            const collections = await pb.collections.getList(1, 50);
            const teamxCollection = collections.items.find(c => c.name === CONFIG.COLLECTION);
            if (teamxCollection) {
                const buroField = teamxCollection.schema.find(f => f.name === 'buro');
                if (buroField && buroField.options && buroField.options.values) {
                    buroOptions = buroField.options.values;
                    console.log('Loaded buro options from PB schema:', buroOptions);
                }
            }
        } catch (error) {
            console.error('Error loading buro options from schema:', error);
            // Fallback to config if schema fetch fails
            buroOptions = CONFIG.EVENT_BUREAUS || [];
        }
    }

    function fillBuroSelect(selectEl, selectedValue = '') {
        if (!selectEl) return;
        const currentValue = selectedValue || selectEl.value || '';
        selectEl.innerHTML = '';

        const emptyOpt = document.createElement('option');
        emptyOpt.value = '';
        emptyOpt.textContent = '-';
        selectEl.appendChild(emptyOpt);

        buroOptions.forEach(name => {
            const opt = document.createElement('option');
            opt.value = name;
            opt.textContent = name;
            selectEl.appendChild(opt);
        });

        selectEl.value = currentValue;
    }

    function initBuroSelectsWithin(rootEl) {
        const selects = rootEl.querySelectorAll('select[data-buro-select]');
        selects.forEach(selectEl => {
            const selected = selectEl.getAttribute('data-selected-buro') || '';
            fillBuroSelect(selectEl, selected);
        });
    }

    /**
     * Initialize PocketBase connection
     */
    async function initPocketBase() {
        // Load PocketBase SDK
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/pocketbase@0.21.1/dist/pocketbase.umd.js';
        script.onload = async function () {
            // Initialize PocketBase
            pb = new PocketBase(CONFIG.PB_URL);

            console.log('PocketBase initialized:', CONFIG.PB_URL);

            // Authenticate with PocketBase
            try {
                await pb.admins.authWithPassword("klaas@republick.nl", "biknu8-pyrnaB-mytvyx");
                console.log('Successfully authenticated with PocketBase');
            } catch (error) {
                console.error('Authentication failed:', error);
                showMessage('Authenticatie mislukt', 'error');
                return;
            }

            await loadBuroOptionsFromSchema();
            initBuroSelectsWithin(document);
            initDateUiWithin(document);

            // Load data from PocketBase
            await loadDataFromPocketBase();

            // Initialize form handling
            initFormHandling();
        };
        script.onerror = function () {
            console.error('Failed to load PocketBase SDK');
            showMessage('Fout: Kan geen verbinding maken met database', 'error');
        };
        document.head.appendChild(script);
    }

    /**
     * Load data from PocketBase
     */
    async function loadDataFromPocketBase() {
        try {
            showMessage('Laden...', 'info');

            // Fetch all records from teamx collection
            // Only show records with priority > 0 (hides empty, null, and 0 priority)
            const records = await pb.collection(CONFIG.COLLECTION).getFullList({
                sort: 'datum',
                filter: 'priority > 0'
            });

            console.log('Loaded records (before sort):', records);

            // Client-side sorting to ensure proper date order
            // Sorts by datum ascending (earliest first - today, tomorrow, next week, etc.)
            // Records without dates are placed at the end
            records.sort((a, b) => {
                const dateA = a.datum ? new Date(a.datum) : null;
                const dateB = b.datum ? new Date(b.datum) : null;

                // If both have no date, maintain original order
                if (!dateA && !dateB) return 0;
                // If only a has no date, put it at the end
                if (!dateA) return 1;
                // If only b has no date, put it at the end
                if (!dateB) return -1;

                // Sort by date ascending (earliest first)
                return dateA.getTime() - dateB.getTime();
            });

            console.log('Loaded records (after sort):', records);

            // Clear existing blocks (except blank form)
            const container = document.getElementById('blocksContainer');
            const blankForm = container.querySelector('.blank-form');
            container.innerHTML = '';
            container.appendChild(blankForm);

            // Create blocks for each record
            records.forEach(record => {
                createBlockFromRecord(record);
            });

            initBuroSelectsWithin(container);
            initDateUiWithin(container);

            showMessage(`${records.length} shows geladen`, 'success');

        } catch (error) {
            console.error('Error loading data:', error);
            showMessage('Fout bij laden van data: ' + error.message, 'error');
        }
    }

    /**
     * Create a block from a PocketBase record
     */
    function createBlockFromRecord(record) {
        const container = document.getElementById('blocksContainer');

        const block = document.createElement('div');
        block.className = 'teamx-block';
        block.setAttribute('data-priority', record.priority || 99);
        block.setAttribute('data-record-id', record.id);

        // Map PocketBase fields to form fields
        const showName = record.show || 'Unnamed Show';
        const notities = record.notities || '';
        const hoevelTeams = record.teamnumber || '';
        const players = record.players || '';
        const tvScreen = record.tv_screen || 'None';
        const audioInput = record.audio_input || 'None';
        const parking = record.parking || '';
        const priority = record.priority || '';
        const photoCircle = record.url || '';  // PocketBase field is 'url'

        const startTime = record.start_time || '18:00';
        const buro = record.buro || '';
        const telefoons = record.telefoons || false;
        const spaRood = record.spa_rood || false;

        // Fix: Extract YYYY-MM-DD from PocketBase datetime format
        // PocketBase might return "2025-12-05 00:00:00.000Z" or "2025-12-05T00:00:00Z"
        // HTML date input needs exactly "YYYY-MM-DD"
        let datum = '';
        if (record.datum) {
            // Take only the first 10 characters (YYYY-MM-DD)
            datum = record.datum.substring(0, 10);
        }

        // DEBUG: Log what we're loading from PocketBase
        console.log(`Loading record "${showName}":`, {
            datum: datum,
            original_datum: record.datum,
            photo_circle: photoCircle,
            priority: priority
        });

        const formattedDate = formatMonthDayNl(datum);
        const weekday = formatWeekdayNl(datum);

        block.innerHTML = `
            <h3>${escapeHtml(showName)}</h3>
            <form class="game-form" data-record-id="${record.id}">
                <div class="form-row form-row-top">
                    <div class="form-field">
                        <label class="weekday-label" data-weekday-for="datum">${weekday ? escapeHtml(weekday) : 'Datum'}</label>
                        <input type="date" name="datum" value="${datum}">
                    </div>
                    <div class="form-field">
                        <label>Start</label>
                        <input type="time" name="start_time" value="${escapeHtml(startTime)}">
                    </div>
                    <div class="form-field">
                        <label>Buro</label>
                        <select name="buro" data-buro-select data-selected-buro="${escapeHtml(buro)}">
                            <option value="">-</option>
                        </select>
                    </div>
                </div>
                <div class="divider"></div>

                <div class="form-row">
                    <div class="form-field">
                        <label>Hoeveel Teams</label>
                        <input type="number" name="hoeveel_teams" value="${hoevelTeams}">
                    </div>
                    <div class="form-field">
                        <label>Players</label>
                        <input type="number" name="players" value="${players}">
                    </div>
                </div>

                <div class="form-field">
                    <label>TV Screen</label>
                    <div class="radio-box">
                        <div class="radio-inline">
                            <label><input type="radio" name="tv_screen" value="Beamer" ${tvScreen === 'Beamer' ? 'checked' : ''}> Beamer</label>
                            <label><input type="radio" name="tv_screen" value="TV" ${tvScreen === 'TV' ? 'checked' : ''}> TV</label>
                            <label><input type="radio" name="tv_screen" value="None" ${tvScreen === 'None' || !tvScreen ? 'checked' : ''}> None</label>
                        </div>
                    </div>
                </div>

                <div class="form-field">
                    <label>Audio input</label>
                    <div class="radio-box">
                        <div class="radio-inline">
                            <label><input type="radio" name="audio_input" value="XLR" ${audioInput === 'XLR' ? 'checked' : ''}> XLR</label>
                            <label><input type="radio" name="audio_input" value="Tulp" ${audioInput === 'Tulp' ? 'checked' : ''}> Tulp</label>
                            <label><input type="radio" name="audio_input" value="Aux" ${audioInput === 'Aux' ? 'checked' : ''}> Aux</label>
                            <label><input type="radio" name="audio_input" value="None" ${audioInput === 'None' || !audioInput ? 'checked' : ''}> None</label>
                        </div>
                    </div>
                </div>

                <div class="form-field">
                    <label>Parking</label>
                    <input type="text" name="parking" value="${escapeHtml(parking)}" placeholder="Betaald adres? | Laden lossen mogelijk?">
                </div>

                <div class="form-field">
                    <label>Priority</label>
                    <input type="number" name="priority" value="${priority}">
                </div>

                <div class="form-field">
                    <label>PhotoCircle</label>
                    <input type="text" name="photo_circle" value="${escapeHtml(photoCircle)}">
                </div>

                <div class="form-field">
                    <label>Extra</label>
                    <div class="radio-box">
                        <div class="radio-inline">
                            <label><input type="checkbox" name="telefoons" value="1" ${telefoons ? 'checked' : ''}> Telefoons</label>
                            <label><input type="checkbox" name="spa_rood" value="1" ${spaRood ? 'checked' : ''}> Spa Rood</label>
                        </div>
                    </div>
                </div>

                <div class="form-field notities-field">
                    <label>Notities</label>
                    <textarea name="notities" rows="6">${escapeHtml(notities)}</textarea>
                </div>

                <button type="submit" class="btn-save">Update</button>
            </form>
        `;

        container.appendChild(block);

        const selectEl = block.querySelector('select[data-buro-select]');
        if (selectEl) {
            const selected = selectEl.getAttribute('data-selected-buro') || '';
            fillBuroSelect(selectEl, selected);
        }

        initDateUiWithin(block);

        // Add form submit handler
        const form = block.querySelector('.game-form');
        form.addEventListener('submit', handleFormSubmit);
    }

    /**
     * Initialize form handling
     */
    function initFormHandling() {
        const forms = document.querySelectorAll('.game-form');

        forms.forEach(form => {
            form.addEventListener('submit', handleFormSubmit);
        });
    }

    /**
     * Handle form submission
     */
    async function handleFormSubmit(e) {
        e.preventDefault();

        const form = e.target;
        const recordId = form.getAttribute('data-record-id');
        const formData = new FormData(form);

        // Convert FormData to object
        const data = {};
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }

        // DEBUG: Log all form fields including their DOM values
        console.log('=== FORM SUBMISSION DEBUG ===');
        console.log('Record ID:', recordId);
        console.log('FormData entries:');
        for (let [key, value] of formData.entries()) {
            console.log(`  ${key}: "${value}"`);
        }

        // Also check the actual input elements in the form
        console.log('Direct input values:');
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            if (input.type === 'radio') {
                if (input.checked) {
                    console.log(`  ${input.name} (radio): "${input.value}" [checked]`);
                }
            } else {
                console.log(`  ${input.name}: "${input.value}"`);
            }
        });
        console.log('=== END DEBUG ===');

        if (recordId === 'new') {
            // Create new record
            await createNewRecord(data, form);
        } else {
            // Update existing record
            await updateRecord(recordId, data);
        }
    }

    /**
     * Create new record in PocketBase
     */
    async function createNewRecord(data, form) {
        try {
            // Validate show name
            if (!data.game_name || data.game_name.trim() === '') {
                showMessage('Voer een show naam in', 'error');
                return;
            }

            showMessage('Opslaan...', 'info');

            // Map form fields to PocketBase fields
            const pbData = {
                show: data.game_name,
                datum: data.datum || '',
                start_time: data.start_time || '18:00',
                buro: data.buro || '',
                teamnumber: parseInt(data.hoeveel_teams) || 0,
                players: parseInt(data.players) || 0,
                notities: data.notities || '',
                priority: data.priority !== '' ? parseInt(data.priority) : 1,
                tv_screen: data.tv_screen || 'None',
                audio_input: data.audio_input || 'None',
                parking: data.parking || '',
                url: data.photo_circle || '',  // PocketBase field is 'url'
                telefoons: data.telefoons === '1',
                spa_rood: data.spa_rood === '1'
            };

            console.log('Creating new record:', pbData);

            const record = await pb.collection(CONFIG.COLLECTION).create(pbData);

            console.log('Created record:', record);

            showMessage('Show succesvol aangemaakt!', 'success');

            // Reset form
            form.reset();

            // Reload data to show new record
            await loadDataFromPocketBase();

        } catch (error) {
            console.error('Error creating record:', error);
            showMessage('Fout bij opslaan: ' + error.message, 'error');
        }
    }

    /**
     * Update existing record in PocketBase
     * Always sends all form fields since the form is pre-populated with existing data
     */
    async function updateRecord(recordId, data) {
        try {
            showMessage('Bijwerken...', 'info');

            // Map form fields to PocketBase fields
            // Since the form is pre-populated with existing PocketBase data,
            // we send all fields - they contain either unchanged values or user edits
            const pbData = {
                datum: data.datum || '',
                start_time: data.start_time || '18:00',
                buro: data.buro || '',
                teamnumber: data.hoeveel_teams !== '' ? parseInt(data.hoeveel_teams) || 0 : 0,
                players: data.players !== '' ? parseInt(data.players) || 0 : 0,
                notities: data.notities || '',
                priority: data.priority !== '' ? parseInt(data.priority) : 1,
                tv_screen: data.tv_screen || 'None',
                audio_input: data.audio_input || 'None',
                parking: data.parking || '',
                url: data.photo_circle || '',  // PocketBase field is 'url'
                telefoons: data.telefoons === '1',
                spa_rood: data.spa_rood === '1'
            };

            console.log('Updating record:', recordId, pbData);
            console.log('Form data received:', data);

            const record = await pb.collection(CONFIG.COLLECTION).update(recordId, pbData);

            console.log('Updated record:', record);

            showMessage('Show bijgewerkt!', 'success');

            // Reload data to reflect changes
            await loadDataFromPocketBase();

        } catch (error) {
            console.error('Error updating record:', error);
            showMessage('Fout bij bijwerken: ' + error.message, 'error');
        }
    }

    /**
     * Escape HTML to prevent XSS
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Show message to user
     */
    function showMessage(message, type = 'info') {
        // Remove existing messages
        const existing = document.querySelector('.teamx-message');
        if (existing) {
            existing.remove();
        }

        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = `teamx-message teamx-message-${type}`;
        messageEl.textContent = message;

        // Add styles if not already added
        if (!document.querySelector('style[data-message-style]')) {
            const style = document.createElement('style');
            style.setAttribute('data-message-style', 'true');
            style.textContent = `
                .teamx-message {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 12px 20px;
                    border-radius: 4px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                    z-index: 1000;
                    animation: slideIn 0.3s ease-out;
                    font-family: 'Barlow Semi Condensed', sans-serif;
                    font-weight: 600;
                    font-size: 14px;
                }
                .teamx-message-success {
                    background: #28a745;
                    color: white;
                }
                .teamx-message-error {
                    background: #dc3545;
                    color: white;
                }
                .teamx-message-info {
                    background: #17a2b8;
                    color: white;
                }
                @keyframes slideIn {
                    from {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        // Add to page
        document.body.appendChild(messageEl);

        // Remove after 3 seconds
        setTimeout(() => {
            messageEl.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => messageEl.remove(), 300);
        }, 3000);
    }

    // Export functions for external use if needed
    window.TeamXInput = {
        loadData: loadDataFromPocketBase,
        showMessage: showMessage
    };

})();
