(() => {
    'use strict';

    const PB_URL = 'https://pb.pinkmilk.eu';
    const GAME_CODE_PATTERN = /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{8}$/;

    class TeamFunGallery {
        constructor() {
            this.pb = new PocketBase(PB_URL);
            this.gameCode = this.getGameCode();
            this.media = [];
            this.selectedIds = new Set();
            this.selectionMode = false;
            this.lightboxIndex = -1;
            this.elements = {
                showDate: document.getElementById('showDate'),
                showName: document.getElementById('showName'),
                statusMessage: document.getElementById('statusMessage'),
                mediaGrid: document.getElementById('mediaGrid'),
                selectButton: document.getElementById('selectButton'),
                downloadButton: document.getElementById('downloadButton'),
                lightbox: document.getElementById('lightbox'),
                lightboxImage: document.getElementById('lightboxImage'),
                lightboxVideo: document.getElementById('lightboxVideo'),
                lightboxCaption: document.getElementById('lightboxCaption'),
                lightboxClose: document.getElementById('lightboxClose'),
                lightboxPrevious: document.getElementById('lightboxPrevious'),
                lightboxNext: document.getElementById('lightboxNext')
            };
        }

        getGameCode() {
            const segments = window.location.pathname.split('/').filter(Boolean);
            return (segments.at(-1) || '').toUpperCase();
        }

        async initialize() {
            this.bindEvents();
            if (!GAME_CODE_PATTERN.test(this.gameCode)) {
                this.showError('Deze TeamFun-link is niet geldig.');
                return;
            }

            try {
                const show = await this.loadShow();
                this.renderShowHeader(show);
                await this.loadMedia(show.id);
                this.renderMedia();
            } catch (error) {
                console.error('TeamFun failed to load', error);
                this.showError('Deze TeamFun-pagina kon niet worden geladen.');
            }
        }

        async loadShow() {
            const result = await this.pb.collection('teamx').getList(1, 1, {
                filter: `gamecode = "${this.gameCode}"`,
                $autoCancel: false
            });

            if (!result.items.length) throw new Error('Unknown game code');
            return result.items[0];
        }

        async loadMedia(showId) {
            this.media = await this.pb.collection('showmedia').getFullList({
                filter: `show_id = "${showId}"`,
                sort: '-created',
                $autoCancel: false
            });
        }

        renderShowHeader(show) {
            this.elements.showDate.textContent = this.formatDate(show.datum) || 'TeamFun';
            this.elements.showName.textContent = show.show || 'Quizmaster Klaas';
        }

        renderMedia() {
            this.elements.mediaGrid.innerHTML = '';
            if (!this.media.length) {
                this.setStatus('Er zijn nog geen foto’s of video’s gedeeld.');
                return;
            }

            this.setStatus('');
            this.media.forEach((item, index) => this.elements.mediaGrid.appendChild(this.createTile(item, index)));
            this.updateSelectionUi();
        }

        createTile(item, index) {
            const url = this.pb.files.getUrl(item, item.file);
            const isVideo = this.isVideo(item.file);
            const tile = document.createElement('button');
            tile.type = 'button';
            tile.className = 'media-tile';
            tile.setAttribute('aria-label', isVideo ? 'Open video' : 'Open foto');
            tile.addEventListener('click', () => {
                if (this.selectionMode) this.toggleSelection(item.id);
                else this.openLightbox(index);
            });

            const selectControl = document.createElement('input');
            selectControl.type = 'checkbox';
            selectControl.className = 'select-control';
            selectControl.checked = this.selectedIds.has(item.id);
            selectControl.setAttribute('aria-label', 'Selecteer voor download');
            selectControl.addEventListener('click', event => event.stopPropagation());
            selectControl.addEventListener('change', () => this.toggleSelection(item.id));
            tile.appendChild(selectControl);

            if (isVideo) {
                const video = document.createElement('video');
                video.src = `${url}#t=0.5`;
                video.muted = true;
                video.playsInline = true;
                video.preload = 'metadata';
                tile.appendChild(video);
                const mark = document.createElement('span');
                mark.className = 'video-mark';
                mark.textContent = '▶';
                tile.appendChild(mark);
            } else {
                const image = document.createElement('img');
                image.src = url;
                image.alt = 'Foto van deze quiz';
                image.loading = 'lazy';
                tile.appendChild(image);
            }
            return tile;
        }

        bindEvents() {
            this.elements.selectButton.addEventListener('click', () => {
                this.selectionMode = !this.selectionMode;
                this.elements.mediaGrid.classList.toggle('selection-active', this.selectionMode);
                this.elements.selectButton.textContent = this.selectionMode ? 'Klaar' : 'Selecteer';
                this.updateSelectionUi();
            });
            this.elements.downloadButton.addEventListener('click', () => this.downloadSelected());
            this.elements.lightboxClose.addEventListener('click', () => this.closeLightbox());
            this.elements.lightboxPrevious.addEventListener('click', () => this.moveLightbox(-1));
            this.elements.lightboxNext.addEventListener('click', () => this.moveLightbox(1));
            this.elements.lightbox.addEventListener('click', event => { if (event.target === this.elements.lightbox) this.closeLightbox(); });
            document.addEventListener('keydown', event => {
                if (this.elements.lightbox.hidden) return;
                if (event.key === 'Escape') this.closeLightbox();
                if (event.key === 'ArrowLeft') this.moveLightbox(-1);
                if (event.key === 'ArrowRight') this.moveLightbox(1);
            });
        }

        toggleSelection(id) {
            if (this.selectedIds.has(id)) this.selectedIds.delete(id);
            else this.selectedIds.add(id);
            this.renderMedia();
        }

        updateSelectionUi() {
            const count = this.selectedIds.size;
            this.elements.downloadButton.disabled = count === 0;
            this.elements.downloadButton.textContent = count ? `Download ${count} geselecteerd${count === 1 ? '' : 'e'}` : 'Download selectie';
            this.elements.mediaGrid.classList.toggle('selection-active', this.selectionMode);
            this.elements.mediaGrid.querySelectorAll('.media-tile').forEach((tile, index) => {
                tile.classList.toggle('is-selected', this.selectedIds.has(this.media[index].id));
            });
        }

        downloadSelected() {
            this.media.filter(item => this.selectedIds.has(item.id)).forEach((item, index) => {
                window.setTimeout(() => {
                    const link = document.createElement('a');
                    link.href = this.pb.files.getUrl(item, item.file, {download: 1});
                    link.download = item.file;
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                }, index * 180);
            });
        }

        openLightbox(index) {
            this.lightboxIndex = index;
            const item = this.media[index];
            const url = this.pb.files.getUrl(item, item.file);
            const isVideo = this.isVideo(item.file);
            this.elements.lightboxImage.hidden = isVideo;
            this.elements.lightboxVideo.hidden = !isVideo;
            if (isVideo) {
                this.elements.lightboxVideo.src = url;
                this.elements.lightboxVideo.play().catch(() => {});
            } else this.elements.lightboxImage.src = url;
            this.elements.lightboxCaption.textContent = item.player_name ? `Gedeeld door ${item.player_name}` : '';
            this.elements.lightbox.hidden = false;
            this.elements.lightboxClose.focus();
        }

        moveLightbox(direction) {
            if (!this.media.length) return;
            this.openLightbox((this.lightboxIndex + direction + this.media.length) % this.media.length);
        }

        closeLightbox() {
            this.elements.lightboxVideo.pause();
            this.elements.lightboxVideo.removeAttribute('src');
            this.elements.lightboxVideo.load();
            this.elements.lightboxImage.removeAttribute('src');
            this.elements.lightbox.hidden = true;
        }

        isVideo(fileName) {
            return /\.(mp4|mov|m4v|webm|quicktime)$/i.test(fileName || '');
        }

        formatDate(value) {
            if (!value) return '';
            const [year, month, day] = value.slice(0, 10).split('-').map(Number);
            if (!year || !month || !day) return '';
            return new Intl.DateTimeFormat('nl-NL', {day:'numeric', month:'long', year:'numeric'}).format(new Date(year, month - 1, day));
        }

        setStatus(message) { this.elements.statusMessage.textContent = message; }
        showError(message) { this.elements.showName.textContent = message; this.setStatus('Controleer de link en probeer het opnieuw.'); }
    }

    document.addEventListener('DOMContentLoaded', () => new TeamFunGallery().initialize());
})();
