/**
 * TeamX Phone Photo/Video Sharing System
 */

class TeamXMedia {
    constructor() {
        this.pb = new PocketBase(CONFIG.PB_URL);
        this.showId = null;
        this.playerName = 'Onbekende Speler';
        this.teamNumber = 0;
        this.showRecord = null;
        this.mediaList = [];

        this.parseUrlParams();
        this.initializeElements();
        this.initialize();
    }

    parseUrlParams() {
        const params = new URLSearchParams(window.location.search);
        this.showId = params.get('showId');
        this.playerName = params.get('playerName') || 'Onbekende Speler';
        this.teamNumber = parseInt(params.get('team')) || 0;
        console.log("URL Params parsed:", { showId: this.showId, playerName: this.playerName, teamNumber: this.teamNumber });
    }

    initializeElements() {
        this.elements = {
            showName: document.getElementById('showName'),
            mediaInput: document.getElementById('mediaInput'),
            uploadProgressContainer: document.getElementById('uploadProgressContainer'),
            progressStatus: document.getElementById('progressStatus'),
            progressBar: document.getElementById('progressBar'),
            galleryGrid: document.getElementById('galleryGrid'),
            noMediaMsg: document.getElementById('noMediaMsg'),
            
            // Lightbox elements
            lightbox: document.getElementById('lightbox'),
            lightboxClose: document.querySelector('.lightbox-close'),
            lightboxImg: document.getElementById('lightboxImg'),
            lightboxVideo: document.getElementById('lightboxVideo'),
            lightboxCaption: document.getElementById('lightboxCaption')
        };
    }

    async initialize() {
        if (!this.showId) {
            this.elements.showName.textContent = "Fout: Geen Show ID";
            alert("Show ID ontbreekt. Registreer eerst via de hoofdpagina.");
            return;
        }

        try {
            await this.authenticatePocketBase();
            await this.loadShowData();
            await this.loadExistingMedia();
            this.setupRealtimeSubscription();
            this.setupEventListeners();
            this.setupPwaInstall();
        } catch (error) {
            console.error('Initialization failed:', error);
            this.elements.showName.textContent = 'Fout bij laden';
        }

    }

    async authenticatePocketBase() {
        try {
            // Note: Public can view/list/create according to the rule,
            // but we can authenticate if needed. If public create rule is active, auth is optional.
            console.log('Connecting to PocketBase...');
        } catch (error) {
            console.error('Connection failed:', error);
        }
    }

    async loadShowData() {
        try {
            this.showRecord = await this.pb.collection(CONFIG.COLLECTION_TEAMS).getOne(this.showId, {
                $autoCancel: false
            });
            this.elements.showName.textContent = this.showRecord.show || 'QuizMaster Klaas Show';
        } catch (error) {
            console.error('Failed to load show record:', error);
            this.elements.showName.textContent = 'QuizMaster Klaas Show';
        }
    }

    async loadExistingMedia() {
        try {
            // Get all files related to this show, sorted by created date descending
            this.mediaList = await this.pb.collection('showmedia').getFullList({
                filter: `show_id = "${this.showId}"`,
                sort: '-created',
                $autoCancel: false
            });

            this.renderGallery();
        } catch (error) {
            console.error('Error loading gallery:', error);
            this.elements.noMediaMsg.style.display = 'block';
        }
    }

    setupRealtimeSubscription() {
        try {
            this.pb.collection('showmedia').subscribe('*', (e) => {
                if (e.record.show_id !== this.showId) return;

                if (e.action === 'create') {
                    // Prepend new upload to our list if it doesn't already exist
                    if (!this.mediaList.find(m => m.id === e.record.id)) {
                        this.mediaList.unshift(e.record);
                        this.renderGallery();
                    }
                }
            });
            console.log('Realtime gallery updates listening...');
        } catch (error) {
            console.error('Failed to setup realtime updates:', error);
        }
    }

    setupEventListeners() {
        // File selection event
        this.elements.mediaInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleFileUpload(file);
            }
        });

        // Lightbox close
        this.elements.lightboxClose.addEventListener('click', () => this.closeLightbox());
        this.elements.lightbox.addEventListener('click', (e) => {
            if (e.target === this.elements.lightbox) {
                this.closeLightbox();
            }
        });

    }



    renderGallery() {
        this.elements.galleryGrid.innerHTML = '';
        
        if (this.mediaList.length === 0) {
            this.elements.noMediaMsg.style.display = 'block';
            return;
        }

        this.elements.noMediaMsg.style.display = 'none';

        this.mediaList.forEach(item => {
            const itemUrl = this.pb.files.getUrl(item, item.file);
            const isVideo = item.file.toLowerCase().endsWith('.mp4') || 
                            item.file.toLowerCase().endsWith('.mov') || 
                            item.file.toLowerCase().endsWith('.quicktime') || 
                            item.file.toLowerCase().endsWith('.webm');

            const itemDiv = document.createElement('div');
            itemDiv.className = 'gallery-item';
            
            if (isVideo) {
                const videoEl = document.createElement('video');
                videoEl.src = itemUrl + '#t=0.5'; // preload poster frame
                videoEl.preload = 'metadata';
                videoEl.playsInline = true;
                videoEl.muted = true;
                itemDiv.appendChild(videoEl);

                const badge = document.createElement('div');
                badge.className = 'video-badge';
                badge.innerHTML = '▶';
                itemDiv.appendChild(badge);
            } else {
                const imgEl = document.createElement('img');
                imgEl.src = itemUrl;
                imgEl.loading = 'lazy';
                imgEl.alt = `Geüpload door ${item.player_name}`;
                itemDiv.appendChild(imgEl);
            }

            const metaDiv = document.createElement('div');
            metaDiv.className = 'item-meta';
            metaDiv.textContent = item.player_name || 'Speler';
            itemDiv.appendChild(metaDiv);

            // Lightbox trigger click
            itemDiv.addEventListener('click', () => this.openLightbox(itemUrl, isVideo, item));

            this.elements.galleryGrid.appendChild(itemDiv);
        });
    }

    async handleFileUpload(file) {
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');

        if (!isImage && !isVideo) {
            alert('Ongeldig bestandstype. Selecteer een foto of video.');
            return;
        }

        this.showProgress(true);
        this.updateProgress(10, 'Optimaliseren...');

        try {
            let fileToUpload = file;

            if (isImage) {
                // Compress image before uploading
                fileToUpload = await this.compressImage(file, 1600, 1600, 0.8);
            } else if (isVideo) {
                // Limit video uploads to 100MB (approx 1 minute of high-res video)
                if (file.size > 100 * 1024 * 1024) {
                    throw new Error('Video is te groot. Selecteer een kortere video (maximaal 1 minuut / 100MB).');
                }
            }

            this.updateProgress(30, 'Verbinden...');

            // Create form data for upload
            const formData = new FormData();
            formData.append('show_id', this.showId);
            formData.append('file', fileToUpload, isImage ? 'photo.jpg' : file.name);
            formData.append('player_name', this.playerName);
            formData.append('team_number', this.teamNumber);

            this.updateProgress(50, 'Uploaden naar album...');

            // Upload directly to PocketBase
            await this.pb.collection('showmedia').create(formData, {
                $autoCancel: false
            });

            this.updateProgress(100, 'Succesvol geüpload!');
            setTimeout(() => this.showProgress(false), 1500);

            // Clear input
            this.elements.mediaInput.value = '';
        } catch (error) {
            console.error('Upload failed:', error);
            alert(`Upload mislukt: ${error.message || error}`);
            this.showProgress(false);
        }
    }

    compressImage(file, maxWidth, maxHeight, quality) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > maxWidth) {
                            height = Math.round((height * maxWidth) / width);
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width = Math.round((width * maxHeight) / height);
                            height = maxHeight;
                        }
                    }

                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error("optimalisatie canvas toBlob mislukt"));
                        }
                    }, 'image/jpeg', quality);
                };
                img.onerror = (err) => reject(err);
            };
            reader.onerror = (err) => reject(err);
        });
    }

    showProgress(show) {
        this.elements.uploadProgressContainer.style.display = show ? 'block' : 'none';
        if (!show) {
            this.elements.progressBar.style.width = '0%';
        }
    }

    updateProgress(percent, text) {
        this.elements.progressBar.style.width = `${percent}%`;
        this.elements.progressStatus.textContent = text;
    }

    openLightbox(url, isVideo, item) {
        this.elements.lightboxImg.style.display = 'none';
        this.elements.lightboxVideo.style.display = 'none';

        if (isVideo) {
            this.elements.lightboxVideo.src = url;
            this.elements.lightboxVideo.style.display = 'block';
            this.elements.lightboxVideo.play().catch(e => console.log('Video autoplay blocked'));
        } else {
            this.elements.lightboxImg.src = url;
            this.elements.lightboxImg.style.display = 'block';
        }

        const teamLabel = item.team_number ? ` (Team ${item.team_number})` : '';
        this.elements.lightboxCaption.textContent = `Geüpload door ${item.player_name}${teamLabel}`;
        this.elements.lightbox.style.display = 'flex';
    }

    closeLightbox() {
        this.elements.lightboxVideo.pause();
        this.elements.lightboxVideo.src = '';
        this.elements.lightboxImg.src = '';
        this.elements.lightbox.style.display = 'none';
    }

    setupPwaInstall() {
        const installBtn = document.getElementById('installAppBtn');
        const iosModal = document.getElementById('iosInstallModal');
        const closeIosBtn = document.querySelector('.close-ios-btn');
        
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            if (installBtn) installBtn.style.display = 'inline-flex';
        });

        // Detect iOS
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

        // Show button on load for all devices if not running in standalone (installed) mode
        if (!isStandalone) {
            if (installBtn) installBtn.style.display = 'inline-flex';
        }

        if (installBtn) {
            installBtn.addEventListener('click', async () => {
                if (deferredPrompt) {
                    deferredPrompt.prompt();
                    const { outcome } = await deferredPrompt.userChoice;
                    console.log(`User response to install: ${outcome}`);
                    deferredPrompt = null;
                    installBtn.style.display = 'none';
                } else if (isIOS && iosModal) {
                    iosModal.classList.add('show');
                } else {
                    alert('Om deze app te installeren, tik op de 3 puntjes (Chrome) of het deel-icoon (Safari) en kies "Toevoegen aan beginscherm".');
                }
            });
        }

        if (closeIosBtn && iosModal) {
            closeIosBtn.addEventListener('click', () => {
                iosModal.classList.remove('show');
            });
            iosModal.addEventListener('click', (e) => {
                if (e.target === iosModal) {
                    iosModal.classList.remove('show');
                }
            });
        }
    }
}


// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new TeamXMedia();
});
