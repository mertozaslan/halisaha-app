// Firebase imports
import { db, collection, addDoc, getDocs, updateDoc, doc, query, orderBy } from './firebase-config.js';

class HalisahaApp {
    constructor() {
        // Google Sheets Configuration
        this.SHEET_ID = '1upqhrZcw8BppgkytzUuzYjgNDJ-Y_B1K'; // Bu değeri kendi Google Sheets ID'nizle değiştirin
        this.API_KEY = 'AIzaSyB_cfuHruYola4wXJ6Rf66lOie0ebkevY8'; // Bu değeri kendi API Key'inizle değiştirin
        this.WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyo_IQkZwC9IVO6Jul9fg8yCI5P9cSDDHQfQjOXKvHP9DccGV07woW3YAm537PBq7m5/exec'; // Google Apps Script Web App URL'i
        this.SHEET_RANGES = {
            players: 'Oyuncular!A:H',
            evaluations: 'Degerlendirmeler!A:I',
            weeklyPlayers: 'HaftaninOyuncusu!A:D'
        };
        
        this.players = [];
        this.evaluations = [];
        this.weeklyPlayers = [];
        this.currentPlayer = null;
        
        // Firebase Configuration
        this.db = db;
        
        this.init();
    }

    async init() {
        this.bindEvents();
        await this.loadData();
        this.renderPlayers();
        this.renderStats();
        this.renderWeeklyPlayer();
    }

    // Google Sheets API Methods
    async makeAPIRequest(range) {
        // CSV export kullanarak CORS bypass
        const sheetName = range.split('!')[0];
        const csvUrl = `https://docs.google.com/spreadsheets/d/${this.SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${sheetName}`;
        
        try {
            const response = await fetch(csvUrl);
            const csvText = await response.text();
            const rows = this.parseCSV(csvText);
            return rows;
        } catch (error) {
            console.error('CSV Request Error:', error);
            return this.getLocalStorageData(range);
        }
    }

    parseCSV(csvText) {
        const rows = [];
        const lines = csvText.split('\n');
        
        for (const line of lines) {
            if (line.trim()) {
                // Basit CSV parse (quotes'ları handle eder)
                const row = line.split(',').map(cell => 
                    cell.replace(/^"|"$/g, '').replace(/""/g, '"')
                );
                rows.push(row);
            }
        }
        return rows;
    }

    async updateSheet(action, data) {
        try {
            console.log(`${action} işlemi localStorage'a kaydediliyor...`);
            
            // localStorage'a kaydet
            const key = action;
            const existing = JSON.parse(localStorage.getItem(key) || '[]');
            existing.push(data);
            localStorage.setItem(key, JSON.stringify(existing));
            
            console.log('Veri başarıyla localStorage\'e kaydedildi');
            return true;
        } catch (error) {
            console.error('LocalStorage yazma hatası:', error);
            return false;
        }
    }

    getLocalStorageData(range) {
        const key = range.split('!')[0];
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : [];
    }

    // Firebase Methods
    async loadData() {
        try {
            console.log('Firebase\'den veri yükleniyor...');
            
            // Load players
            const playersSnapshot = await getDocs(collection(this.db, 'players'));
            this.players = [];
            playersSnapshot.forEach((doc) => {
                this.players.push({ id: doc.id, ...doc.data() });
            });

            // Load evaluations
            const evaluationsSnapshot = await getDocs(collection(this.db, 'evaluations'));
            this.evaluations = [];
            evaluationsSnapshot.forEach((doc) => {
                this.evaluations.push({ id: doc.id, ...doc.data() });
            });

            // Load weekly players
            const weeklySnapshot = await getDocs(collection(this.db, 'weeklyPlayers'));
            this.weeklyPlayers = [];
            weeklySnapshot.forEach((doc) => {
                this.weeklyPlayers.push({ id: doc.id, ...doc.data() });
            });

            console.log(`Yüklenen veriler: ${this.players.length} oyuncu, ${this.evaluations.length} değerlendirme`);

        } catch (error) {
            console.error('Firebase veri yükleme hatası:', error);
            this.initializeDefaultData();
        }
    }

    async savePlayer(player) {
        try {
            const docRef = await addDoc(collection(this.db, 'players'), player);
            console.log('Oyuncu Firebase\'e kaydedildi:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('Firebase oyuncu kaydetme hatası:', error);
            throw error;
        }
    }

    async saveEvaluationToFirebase(evaluation) {
        try {
            const docRef = await addDoc(collection(this.db, 'evaluations'), evaluation);
            console.log('Değerlendirme Firebase\'e kaydedildi:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('Firebase değerlendirme kaydetme hatası:', error);
            throw error;
        }
    }

    async updatePlayerInFirebase(playerId, playerData) {
        try {
            await updateDoc(doc(this.db, 'players', playerId), playerData);
            console.log('Oyuncu Firebase\'de güncellendi:', playerId);
        } catch (error) {
            console.error('Firebase oyuncu güncelleme hatası:', error);
            throw error;
        }
    }

    async saveWeeklyPlayer(weeklyPlayer) {
        try {
            const docRef = await addDoc(collection(this.db, 'weeklyPlayers'), weeklyPlayer);
            console.log('Haftanın oyuncusu Firebase\'e kaydedildi:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('Firebase haftalık oyuncu kaydetme hatası:', error);
            throw error;
        }
    }

    initializeDefaultData() {
        // Demo veriler - Firebase boşsa varsayılan veriler
        if (this.players.length === 0) {
            console.log('Demo veriler yükleniyor...');
            this.players = [
                { id: 'demo1', name: 'Ahmet', position: 'Forvet', totalRating: 42, evaluationCount: 6, averageRating: 7.0, lastEvaluationDate: '2024-01-15', isActive: true },
                { id: 'demo2', name: 'Mehmet', position: 'Defans', totalRating: 38, evaluationCount: 5, averageRating: 7.6, lastEvaluationDate: '2024-01-14', isActive: true },
                { id: 'demo3', name: 'Can', position: 'Orta Saha', totalRating: 45, evaluationCount: 6, averageRating: 7.5, lastEvaluationDate: '2024-01-15', isActive: true }
            ];
        }
    }

    bindEvents() {
        // Add Player Modal
        document.getElementById('addPlayerBtn').addEventListener('click', () => {
            this.showModal('addPlayerModal');
        });

        document.getElementById('closeAddPlayerModal').addEventListener('click', () => {
            this.hideModal('addPlayerModal');
        });

        document.getElementById('cancelAddPlayer').addEventListener('click', () => {
            this.hideModal('addPlayerModal');
        });

        // Add Player Form
        document.getElementById('addPlayerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addPlayer();
        });

        // Evaluation Form
        document.getElementById('evaluationForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEvaluation();
        });

        document.getElementById('closeEvaluationBtn').addEventListener('click', () => {
            this.hideEvaluationForm();
        });

        // Weekly Player Modal
        document.getElementById('selectWeeklyPlayerBtn').addEventListener('click', () => {
            this.showWeeklyPlayerModal();
        });

        document.getElementById('closeWeeklyPlayerModal').addEventListener('click', () => {
            this.hideModal('weeklyPlayerModal');
        });

        // Rating sliders
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('rating-slider')) {
                this.updateRatingValue(e.target);
                this.updateCurrentRating();
            }
        });

        // Modal backdrop clicks
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideModal(e.target.id);
            }
        });
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.add('active');
        modal.style.display = 'flex';
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }

    async addPlayer() {
        const formData = new FormData(document.getElementById('addPlayerForm'));
        const playerName = formData.get('playerName').trim();
        const playerPosition = formData.get('playerPosition');

        if (!playerName) {
            alert('Oyuncu adı gerekli!');
            return;
        }

        const newPlayer = {
            name: playerName,
            position: playerPosition,
            totalRating: 0,
            evaluationCount: 0,
            averageRating: 0,
            lastEvaluationDate: '',
            isActive: true,
            createdAt: new Date().toISOString()
        };

        try {
            // Firebase'e kaydet
            const playerId = await this.savePlayer(newPlayer);
            
            // Local array'e ekle
            newPlayer.id = playerId;
            this.players.push(newPlayer);
            
            this.renderPlayers();
            this.hideModal('addPlayerModal');
            document.getElementById('addPlayerForm').reset();
            this.showSuccessMessage('Oyuncu başarıyla eklendi!');
        } catch (error) {
            console.error('Oyuncu ekleme hatası:', error);
            alert('Oyuncu eklenirken hata oluştu. Tekrar deneyin.');
        }
    }

    renderPlayers() {
        const grid = document.getElementById('playersGrid');
        grid.innerHTML = '';

        this.players.filter(player => player.isActive).forEach(player => {
            const playerCard = this.createPlayerCard(player);
            grid.appendChild(playerCard);
        });
    }

    createPlayerCard(player) {
        const card = document.createElement('div');
        card.className = 'player-card';
        card.innerHTML = `
            <div class="player-name">${player.name}</div>
            <div class="player-position">${player.position}</div>
            <div class="player-rating">
                <span class="rating-number">${player.averageRating.toFixed(1)}</span>
                <div class="stars">${this.generateStars(player.averageRating)}</div>
            </div>
            <div class="evaluation-info">
                <small>${player.evaluationCount} değerlendirme</small>
            </div>
            <div class="player-actions">
                <button class="btn btn-primary btn-small evaluate-btn">
                    <i class="fas fa-star"></i> Değerlendir
                </button>
                <button class="btn btn-secondary btn-small history-btn">
                    <i class="fas fa-history"></i> Geçmiş
                </button>
            </div>
        `;

        // Event listeners
        card.querySelector('.evaluate-btn').addEventListener('click', () => {
            this.showEvaluationForm(player);
        });

        card.querySelector('.history-btn').addEventListener('click', () => {
            this.showPlayerHistory(player);
        });

        return card;
    }

    generateStars(rating) {
        const fullStars = Math.floor(rating / 2);
        const hasHalfStar = (rating % 2) >= 1;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        let stars = '';
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star star"></i>';
        }
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt star"></i>';
        }
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star star empty"></i>';
        }
        return stars;
    }

    showEvaluationForm(player) {
        this.currentPlayer = player;
        document.getElementById('evaluatingPlayerName').textContent = player.name;
        document.getElementById('evaluationSection').style.display = 'block';
        
        // Reset form
        document.getElementById('evaluationForm').reset();
        document.getElementById('comment').value = '';
        
        // Reset sliders to default value
        const sliders = document.querySelectorAll('.rating-slider');
        sliders.forEach(slider => {
            slider.value = 5;
            this.updateRatingValue(slider);
        });
        
        this.updateCurrentRating();
        
        // Scroll to evaluation form
        document.getElementById('evaluationSection').scrollIntoView({ 
            behavior: 'smooth' 
        });
    }

    hideEvaluationForm() {
        document.getElementById('evaluationSection').style.display = 'none';
        this.currentPlayer = null;
    }

    updateRatingValue(slider) {
        const valueSpan = slider.parentNode.querySelector('.rating-value');
        valueSpan.textContent = slider.value;
    }

    updateCurrentRating() {
        const sliders = document.querySelectorAll('.rating-slider');
        let total = 0;
        sliders.forEach(slider => {
            total += parseInt(slider.value);
        });
        const average = total / sliders.length;
        document.getElementById('currentRating').textContent = average.toFixed(1);
        
        // Update stars
        const starDisplay = document.getElementById('starDisplay');
        starDisplay.innerHTML = this.generateStars(average);
    }

    async saveEvaluation() {
        if (!this.currentPlayer) return;

        const formData = new FormData(document.getElementById('evaluationForm'));
        const evaluation = {
            playerId: this.currentPlayer.id,
            playerName: this.currentPlayer.name,
            passing: parseInt(formData.get('passing')),
            defense: parseInt(formData.get('defense')),
            attack: parseInt(formData.get('attack')),
            stamina: parseInt(formData.get('stamina')),
            teamwork: parseInt(formData.get('teamwork')),
            comment: formData.get('comment'),
            date: new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString()
        };

        // Calculate overall rating
        const overallRating = (evaluation.passing + evaluation.defense + evaluation.attack + 
                              evaluation.stamina + evaluation.teamwork) / 5;

        try {
            // Firebase'e değerlendirme kaydet
            const evaluationId = await this.saveEvaluationToFirebase(evaluation);
            evaluation.id = evaluationId;
            this.evaluations.push(evaluation);
            
            // Update player stats
            const player = this.players.find(p => p.id === this.currentPlayer.id);
            if (player) {
                player.totalRating += overallRating;
                player.evaluationCount += 1;
                player.averageRating = player.totalRating / player.evaluationCount;
                player.lastEvaluationDate = evaluation.date;
                
                // Firebase'de oyuncu güncelle
                await this.updatePlayerInFirebase(player.id, {
                    totalRating: player.totalRating,
                    evaluationCount: player.evaluationCount,
                    averageRating: player.averageRating,
                    lastEvaluationDate: player.lastEvaluationDate
                });
            }
            
            this.renderPlayers();
            this.renderStats();
            this.hideEvaluationForm();
            this.showSuccessMessage('Değerlendirme başarıyla kaydedildi!');
        } catch (error) {
            console.error('Değerlendirme kaydetme hatası:', error);
            alert('Değerlendirme kaydedilirken hata oluştu. Tekrar deneyin.');
        }
    }

    showPlayerHistory(player) {
        const playerEvaluations = this.evaluations.filter(evaluation => evaluation.playerId === player.id);
        
        let historyHTML = `
            <div class="modal active" id="historyModal" style="display: flex;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>${player.name} - Değerlendirme Geçmişi</h3>
                        <button class="modal-close" onclick="this.closest('.modal').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="history-content">
        `;

        if (playerEvaluations.length === 0) {
            historyHTML += '<p>Henüz değerlendirme yapılmamış.</p>';
        } else {
            playerEvaluations.reverse().forEach(evaluation => {
                const overallRating = (evaluation.passing + evaluation.defense + evaluation.attack + evaluation.stamina + evaluation.teamwork) / 5;
                historyHTML += `
                    <div class="evaluation-history-item">
                        <div class="eval-header">
                            <strong>Tarih: ${evaluation.date}</strong>
                            <span class="eval-rating">${overallRating.toFixed(1)}/10</span>
                        </div>
                        <div class="eval-details">
                            <div class="eval-categories">
                                <span>Pas: ${evaluation.passing}</span>
                                <span>Savunma: ${evaluation.defense}</span>
                                <span>Hücum: ${evaluation.attack}</span>
                                <span>Kondisyon: ${evaluation.stamina}</span>
                                <span>Takım Oyunu: ${evaluation.teamwork}</span>
                            </div>
                            ${evaluation.comment ? `<div class="eval-comment">"${evaluation.comment}"</div>` : ''}
                        </div>
                    </div>
                `;
            });
        }

        historyHTML += `
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', historyHTML);
    }

    showWeeklyPlayerModal() {
        const modal = document.getElementById('weeklyPlayerModal');
        const list = document.getElementById('weeklySelectionList');
        
        list.innerHTML = '';
        
        // Sadece değerlendirilmiş oyuncuları al ve ortalamaya göre sırala
        const evaluatedPlayers = this.players
            .filter(p => p.isActive && p.evaluationCount > 0)
            .sort((a, b) => b.averageRating - a.averageRating);

        if (evaluatedPlayers.length === 0) {
            list.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">Henüz hiçbir oyuncu değerlendirilmedi.</p>';
            this.showModal('weeklyPlayerModal');
            return;
        }

        evaluatedPlayers.forEach((player, index) => {
            const option = document.createElement('div');
            option.className = 'weekly-player-option';
            
            // Sıralama rozeti
            let badge = '';
            if (index === 0) badge = '<span class="rank-badge gold">🥇 1.</span>';
            else if (index === 1) badge = '<span class="rank-badge silver">🥈 2.</span>';
            else if (index === 2) badge = '<span class="rank-badge bronze">🥉 3.</span>';
            else badge = `<span class="rank-badge">${index + 1}.</span>`;
            
            option.innerHTML = `
                <div class="player-rank-info">
                    ${badge}
                    <div class="player-details">
                        <strong>${player.name}</strong>
                        <div class="player-stats">
                            <span class="position">${player.position}</span>
                            <span class="rating">${player.averageRating.toFixed(1)}/10</span>
                            <span class="eval-count">${player.evaluationCount} değerlendirme</span>
                        </div>
                    </div>
                </div>
                <button class="btn btn-gold btn-small select-weekly-btn">
                    <i class="fas fa-crown"></i> Seç
                </button>
            `;

            option.querySelector('.select-weekly-btn').addEventListener('click', () => {
                this.selectWeeklyPlayer(player);
            });

            list.appendChild(option);
        });

        this.showModal('weeklyPlayerModal');
    }

    async selectWeeklyPlayer(player) {
        const weekNumber = this.getCurrentWeekNumber();
        const currentWeek = `${new Date().getFullYear()}-${weekNumber}`;
        
        // Aynı hafta için zaten seçilmiş oyuncu var mı kontrol et
        const existingWeeklyPlayer = this.weeklyPlayers.find(wp => wp.week === currentWeek);
        if (existingWeeklyPlayer) {
            const confirmReplace = confirm(
                `Bu hafta zaten ${existingWeeklyPlayer.playerName} seçildi. ${player.name} ile değiştirmek istiyor musun?`
            );
            if (!confirmReplace) return;
        }

        const weeklyPlayer = {
            playerId: player.id,
            playerName: player.name,
            week: currentWeek,
            date: new Date().toISOString().split('T')[0],
            averageRating: player.averageRating,
            createdAt: new Date().toISOString()
        };

        try {
            // Firebase'e kaydet
            const weeklyId = await this.saveWeeklyPlayer(weeklyPlayer);
            weeklyPlayer.id = weeklyId;
            this.weeklyPlayers.push(weeklyPlayer);
            
            this.renderWeeklyPlayer();
            this.hideModal('weeklyPlayerModal');
            this.showSuccessMessage(
                `🏆 ${player.name} haftanın oyuncusu seçildi! (${player.averageRating.toFixed(1)}/10 ortalama)`
            );
        } catch (error) {
            console.error('Haftanın oyuncusu seçme hatası:', error);
            alert('Haftanın oyuncusu seçilirken hata oluştu. Tekrar deneyin.');
        }
    }

    getCurrentWeekNumber() {
        const date = new Date();
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    }

    renderWeeklyPlayer() {
        const card = document.getElementById('weeklyPlayerCard');
        const currentWeek = `${new Date().getFullYear()}-${this.getCurrentWeekNumber()}`;
        const currentWeeklyPlayer = this.weeklyPlayers.find(wp => wp.week === currentWeek);

        if (currentWeeklyPlayer) {
            // Güncel oyuncu bilgisini al (ortalama değişmiş olabilir)
            const playerData = this.players.find(p => p.id === currentWeeklyPlayer.playerId);
            const currentRating = playerData ? playerData.averageRating : currentWeeklyPlayer.averageRating;
            
            card.innerHTML = `
                <div class="weekly-player-info">
                    <h3><i class="fas fa-crown"></i> ${currentWeeklyPlayer.playerName}</h3>
                    <p>Bu Haftanın Oyuncusu</p>
                    <div class="weekly-player-stats">
                        <span class="weekly-rating">${currentRating ? currentRating.toFixed(1) : '0.0'}/10</span>
                        <div class="weekly-stars">${this.generateStars(currentRating || 0)}</div>
                    </div>
                    <p><small>${currentWeeklyPlayer.date}</small></p>
                </div>
            `;
        } else {
            card.innerHTML = '<p>Henüz haftanın oyuncusu seçilmedi</p>';
        }
    }

    renderStats() {
        const grid = document.getElementById('statsGrid');
        
        const totalPlayers = this.players.filter(p => p.isActive).length;
        const totalEvaluations = this.evaluations.length;
        const averageTeamRating = this.players
            .filter(p => p.isActive && p.evaluationCount > 0)
            .reduce((sum, p) => sum + p.averageRating, 0) / 
            this.players.filter(p => p.isActive && p.evaluationCount > 0).length || 0;
        const weeklyPlayersCount = this.weeklyPlayers.length;

        grid.innerHTML = `
            <div class="stat-card">
                <div class="stat-value">${totalPlayers}</div>
                <div class="stat-label">Aktif Oyuncu</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${totalEvaluations}</div>
                <div class="stat-label">Toplam Değerlendirme</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${averageTeamRating.toFixed(1)}</div>
                <div class="stat-label">Takım Ortalaması</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${weeklyPlayersCount}</div>
                <div class="stat-label">Haftanın Oyuncusu</div>
            </div>
        `;
    }

    showSuccessMessage(message) {
        const existingMessage = document.querySelector('.success-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = 'success-message';
        messageDiv.textContent = message;
        
        document.querySelector('.container').insertBefore(
            messageDiv, 
            document.querySelector('section')
        );

        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new HalisahaApp();
});

// Add CSS for history modal
const historyStyles = `
.evaluation-history-item {
    background: var(--gray-100);
    border-radius: var(--border-radius);
    padding: 1rem;
    margin-bottom: 1rem;
}

.eval-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
}

.eval-rating {
    background: var(--primary-color);
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-weight: 600;
}

.eval-categories {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    margin-bottom: 0.5rem;
}

.eval-categories span {
    background: var(--white);
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
    font-size: 0.85rem;
}

.eval-comment {
    font-style: italic;
    color: var(--gray-600);
    margin-top: 0.5rem;
    padding: 0.5rem;
    background: var(--white);
    border-radius: 6px;
}

.history-content {
    max-height: 60vh;
    overflow-y: auto;
}
`;

// Add styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = historyStyles;
document.head.appendChild(styleSheet); 