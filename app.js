// Firebase compat version kullanıyoruz - global window.db üzerinden erişim

class HalisahaApp {
    constructor() {
        this.players = [];
        this.evaluations = [];
        this.weeklyPlayers = [];
        this.currentPlayer = null;
        this.activeTeam = 1; // Aktif takım sekmesi
        this.userSession = this.getUserSession(); // Kullanıcı oturumu
        
        this.init();
    }

    async init() {
        this.bindEvents();
        await this.loadData();
        this.renderPlayers();
        this.renderWeeklyPlayer();
        this.updateTeamCounts();
    }

    // Firebase Methods
    async loadData() {
        try {
            console.log('Firebase\'den veri yükleniyor...');
            
            // Load players - compat API
            const playersSnapshot = await window.db.collection('players').get();
            this.players = [];
            playersSnapshot.forEach((doc) => {
                this.players.push({ id: doc.id, ...doc.data() });
            });

            // Load evaluations - compat API
            const evaluationsSnapshot = await window.db.collection('evaluations').get();
            this.evaluations = [];
            evaluationsSnapshot.forEach((doc) => {
                this.evaluations.push({ id: doc.id, ...doc.data() });
            });

            // Load weekly players - compat API
            const weeklySnapshot = await window.db.collection('weeklyPlayers').get();
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
            const docRef = await window.db.collection('players').add(player);
            console.log('Oyuncu Firebase\'e kaydedildi:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('Firebase oyuncu kaydetme hatası:', error);
            throw error;
        }
    }

    async saveEvaluationToFirebase(evaluation) {
        try {
            const docRef = await window.db.collection('evaluations').add(evaluation);
            console.log('Değerlendirme Firebase\'e kaydedildi:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('Firebase değerlendirme kaydetme hatası:', error);
            throw error;
        }
    }

    async updatePlayerInFirebase(playerId, playerData) {
        try {
            await window.db.collection('players').doc(playerId).update(playerData);
            console.log('Oyuncu Firebase\'de güncellendi:', playerId);
        } catch (error) {
            console.error('Firebase oyuncu güncelleme hatası:', error);
            throw error;
        }
    }

    async saveWeeklyPlayer(weeklyPlayer) {
        try {
            const docRef = await window.db.collection('weeklyPlayers').add(weeklyPlayer);
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
                { id: 'demo1', name: 'Ahmet', team: 1, totalRating: 42, evaluationCount: 6, averageRating: 7.0, lastEvaluationDate: '2024-01-15', isActive: true },
                { id: 'demo2', name: 'Mehmet', team: 1, totalRating: 38, evaluationCount: 5, averageRating: 7.6, lastEvaluationDate: '2024-01-14', isActive: true },
                { id: 'demo3', name: 'Can', team: 2, totalRating: 45, evaluationCount: 6, averageRating: 7.5, lastEvaluationDate: '2024-01-15', isActive: true }
            ];
        }
    }

    bindEvents() {
        // Team tabs
        document.querySelectorAll('.team-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTeam(parseInt(e.target.dataset.team));
            });
        });

        // Add Player Modal
        document.getElementById('addPlayerBtn').addEventListener('click', () => {
            this.showAddPlayerModal();
        });

        document.getElementById('closeAddPlayerModal').addEventListener('click', () => {
            this.hideModal('addPlayerModal');
        });

        document.getElementById('cancelAddPlayer').addEventListener('click', () => {
            this.hideModal('addPlayerModal');
        });

        document.getElementById('cancelBulkAdd').addEventListener('click', () => {
            this.hideModal('addPlayerModal');
        });

        // Add Mode Tabs
        document.querySelectorAll('.add-mode-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchAddMode(e.target.dataset.mode);
            });
        });

        // Add Player Forms
        document.getElementById('addPlayerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('📝 Tekli oyuncu formu submit edildi');
            this.addPlayer();
        });

        document.getElementById('addBulkPlayersForm').addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('📝 Toplu oyuncu formu submit edildi');
            this.addBulkPlayers();
        });

        // Bulk Addition Features
        document.getElementById('previewBulkBtn').addEventListener('click', () => {
            console.log('👀 Önizleme butonu tıklandı');
            this.previewBulkPlayers();
        });

        document.getElementById('bulkPlayerNames').addEventListener('input', () => {
            // Önizlemeyi otomatik gizle metin değiştiğinde
            document.getElementById('bulkPreview').style.display = 'none';
        });

        // Bulk Confirmation Modal
        document.getElementById('cancelBulkConfirm').addEventListener('click', () => {
            this.hideModal('bulkConfirmModal');
        });

        document.getElementById('proceedBulkAdd').addEventListener('click', () => {
            this.processBulkAddition();
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

    switchTeam(teamNumber) {
        this.activeTeam = teamNumber;
        
        // Update tab states
        document.querySelectorAll('.team-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-team="${teamNumber}"]`).classList.add('active');
        
        // Show/hide team sections
        document.getElementById('team1Players').style.display = teamNumber === 1 ? 'block' : 'none';
        document.getElementById('team2Players').style.display = teamNumber === 2 ? 'block' : 'none';
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
        const playerTeam = parseInt(formData.get('playerTeam'));

        if (!playerName) {
            alert('Oyuncu adı gerekli!');
            return;
        }

        // Aynı takımda aynı isimde oyuncu var mı kontrol et
        const existingPlayer = this.players.find(p => 
            p.isActive && 
            p.team === playerTeam && 
            p.name.toLowerCase() === playerName.toLowerCase()
        );

        if (existingPlayer) {
            alert(`${playerName} isimli oyuncu ${playerTeam}. takımda zaten mevcut!`);
            return;
        }

        const newPlayer = {
            name: playerName,
            team: playerTeam,
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
            this.updateTeamCounts();
            this.hideModal('addPlayerModal');
            document.getElementById('addPlayerForm').reset();
            this.showSuccessMessage(`${playerName} ${playerTeam}. takıma başarıyla eklendi!`);
        } catch (error) {
            console.error('Oyuncu ekleme hatası:', error);
            alert('Oyuncu eklenirken hata oluştu. Tekrar deneyin.');
        }
    }

    renderPlayers() {
        // 1. Takım
        const team1Grid = document.getElementById('team1Grid');
        const team1Players = this.players.filter(player => player.isActive && player.team === 1);
        team1Grid.innerHTML = '';
        team1Players.forEach(player => {
            const playerCard = this.createPlayerCard(player);
            team1Grid.appendChild(playerCard);
        });

        // 2. Takım
        const team2Grid = document.getElementById('team2Grid');
        const team2Players = this.players.filter(player => player.isActive && player.team === 2);
        team2Grid.innerHTML = '';
        team2Players.forEach(player => {
            const playerCard = this.createPlayerCard(player);
            team2Grid.appendChild(playerCard);
        });
    }

    updateTeamCounts() {
        const team1Count = this.players.filter(p => p.isActive && p.team === 1).length;
        const team2Count = this.players.filter(p => p.isActive && p.team === 2).length;
        
        document.getElementById('team1Count').textContent = `${team1Count} oyuncu`;
        document.getElementById('team2Count').textContent = `${team2Count} oyuncu`;
    }

    createPlayerCard(player) {
        const card = document.createElement('div');
        card.className = 'player-card';
        
        const teamBadge = player.team === 1 ? '1. Takım' : '2. Takım';
        const teamClass = player.team === 1 ? 'team-1' : 'team-2';
        
        // Kullanıcının bugün bu oyuncuyu değerlendirip değerlendirmediğini kontrol et
        const hasEvaluatedToday = this.hasUserEvaluatedPlayerToday(player.id);
        const evaluateButtonClass = hasEvaluatedToday ? 'btn btn-secondary btn-small evaluate-btn' : 'btn btn-primary btn-small evaluate-btn';
        const evaluateButtonText = hasEvaluatedToday ? '<i class="fas fa-check"></i> Değerlendirildi' : '<i class="fas fa-star"></i> Değerlendir';
        const evaluateButtonDisabled = hasEvaluatedToday ? 'disabled' : '';
        
        card.innerHTML = `
            <div class="player-header">
                <div class="player-name">${player.name}</div>
                <span class="team-badge ${teamClass}">${teamBadge}</span>
            </div>
            <div class="player-rating">
                <span class="rating-number">${player.averageRating.toFixed(1)}</span>
                <div class="stars">${this.generateStars(player.averageRating)}</div>
            </div>
            <div class="evaluation-info">
                <small><i class="fas fa-chart-line"></i> ${player.evaluationCount} değerlendirme</small>
            </div>
            <div class="player-actions">
                <button class="${evaluateButtonClass}" ${evaluateButtonDisabled}>
                    ${evaluateButtonText}
                </button>
                <button class="btn btn-secondary btn-small history-btn">
                    <i class="fas fa-history"></i> Geçmiş
                </button>
            </div>
        `;

        // Event listeners
        const evaluateBtn = card.querySelector('.evaluate-btn');
        if (!hasEvaluatedToday) {
            evaluateBtn.addEventListener('click', () => {
                this.showEvaluationForm(player);
            });
        }

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
        
        // Takım bilgisini göster
        const teamBadge = document.getElementById('evaluatingPlayerTeam');
        teamBadge.textContent = `${player.team}. Takım`;
        teamBadge.className = `team-badge ${player.team === 1 ? 'team-1' : 'team-2'}`;
        
        document.getElementById('evaluationSection').style.display = 'block';
        
        // Reset form
        document.getElementById('evaluationForm').reset();
        
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

        // Kullanıcının bugün bu oyuncuyu zaten değerlendirip değerlendirmediğini kontrol et
        if (this.hasUserEvaluatedPlayerToday(this.currentPlayer.id)) {
            alert('Bu oyuncuyu bugün zaten değerlendirmişsiniz!');
            this.hideEvaluationForm();
            return;
        }

        const formData = new FormData(document.getElementById('evaluationForm'));
        const evaluation = {
            playerId: this.currentPlayer.id,
            playerName: this.currentPlayer.name,
            userSession: this.userSession, // Kullanıcı oturumu ekle
            passing: parseInt(formData.get('passing')),
            defense: parseInt(formData.get('defense')),
            attack: parseInt(formData.get('attack')),
            stamina: parseInt(formData.get('stamina')),
            teamwork: parseInt(formData.get('teamwork')),
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
            
            this.renderPlayers(); // Player kartlarını yeniden render et (buton durumu için)
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
            const teamBadge = playerData ? `${playerData.team}. Takım` : '';
            const teamClass = playerData ? (playerData.team === 1 ? 'team-1' : 'team-2') : '';
            
            card.innerHTML = `
                <div class="weekly-player-info">
                    <div class="player-header">
                        <h3><i class="fas fa-crown"></i> ${currentWeeklyPlayer.playerName}</h3>
                        <span class="team-badge ${teamClass}">${teamBadge}</span>
                    </div>
                    <p class="weekly-title">Bu Haftanın Oyuncusu</p>
                    <div class="weekly-player-stats">
                        <span class="weekly-rating">${currentRating ? currentRating.toFixed(1) : '0.0'}/10</span>
                        <div class="weekly-stars">${this.generateStars(currentRating || 0)}</div>
                    </div>
                    <p class="weekly-date"><small><i class="fas fa-calendar"></i> ${currentWeeklyPlayer.date}</small></p>
                </div>
            `;
        } else {
            card.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-trophy"></i>
                    <p>Henüz haftanın oyuncusu seçilmedi</p>
                </div>
            `;
        }
    }

    showSuccessMessage(message) {
        const existingMessage = document.querySelector('.success-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = 'success-message';
        messageDiv.textContent = message;
        
        const container = document.querySelector('.container');
        if (container) {
            // Container'ın en başına ekle - basit ve güvenli
            container.prepend(messageDiv);
        } else {
            // Container bulunamazsa body'e ekle
            document.body.prepend(messageDiv);
        }

        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 3000);
    }

    // Kullanıcı oturumu oluştur/al
    getUserSession() {
        let sessionId = localStorage.getItem('halisaha_user_session');
        if (!sessionId) {
            // Benzersiz session ID oluştur
            sessionId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('halisaha_user_session', sessionId);
        }
        return sessionId;
    }

    // Kullanıcının bugün bu oyuncuyu değerlendirip değerlendirmediğini kontrol et
    hasUserEvaluatedPlayerToday(playerId) {
        const today = new Date().toISOString().split('T')[0];
        return this.evaluations.some(evaluation => 
            evaluation.playerId === playerId && 
            evaluation.date === today && 
            evaluation.userSession === this.userSession
        );
    }

    showAddPlayerModal() {
        // Aktif takımı otomatik seç
        document.getElementById('playerTeam').value = this.activeTeam.toString();
        document.getElementById('bulkPlayerTeam').value = this.activeTeam.toString();
        
        // Single mode'u aktif yap ve formu göster
        this.switchAddMode('single');
        this.showModal('addPlayerModal');
    }

    switchAddMode(mode) {
        // Tab durumunu güncelle
        document.querySelectorAll('.add-mode-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
        
        // Form görünümünü değiştir
        const singleForm = document.getElementById('addPlayerForm');
        const bulkForm = document.getElementById('addBulkPlayersForm');
        
        if (mode === 'single') {
            singleForm.style.display = 'block';
            bulkForm.style.display = 'none';
            // Tekli form için aktif takımı seç
            document.getElementById('playerTeam').value = this.activeTeam.toString();
        } else {
            singleForm.style.display = 'none';
            bulkForm.style.display = 'block';
            // Toplu form için aktif takımı seç
            document.getElementById('bulkPlayerTeam').value = this.activeTeam.toString();
            // Önizlemeyi gizle
            document.getElementById('bulkPreview').style.display = 'none';
        }
    }

    previewBulkPlayers() {
        const textarea = document.getElementById('bulkPlayerNames');
        const teamSelect = document.getElementById('bulkPlayerTeam');
        const preview = document.getElementById('bulkPreview');
        const previewList = document.getElementById('previewList');
        const previewSummary = document.getElementById('previewSummary');
        
        const playerNames = textarea.value
            .split('\n')
            .map(name => name.trim())
            .filter(name => name.length > 0);
        
        if (playerNames.length === 0) {
            alert('Lütfen en az bir oyuncu adı girin!');
            return;
        }
        
        const selectedTeam = parseInt(teamSelect.value);
        const existingPlayerNames = this.players
            .filter(p => p.isActive && p.team === selectedTeam)
            .map(p => p.name.toLowerCase());
        
        // Preview listesini oluştur
        previewList.innerHTML = '';
        let validCount = 0;
        let duplicateCount = 0;
        
        playerNames.forEach((name, index) => {
            const item = document.createElement('div');
            const isExisting = existingPlayerNames.includes(name.toLowerCase());
            
            if (isExisting) {
                item.className = 'preview-item duplicate';
                item.innerHTML = `
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>${name}</span>
                    <small>(Zaten mevcut)</small>
                `;
                duplicateCount++;
            } else {
                item.className = 'preview-item valid';
                item.innerHTML = `
                    <i class="fas fa-check"></i>
                    <span>${name}</span>
                    <small>(Yeni oyuncu)</small>
                `;
                validCount++;
            }
            
            previewList.appendChild(item);
        });
        
        // Özet bilgileri
        const teamName = selectedTeam === 1 ? '1. Takım' : '2. Takım';
        previewSummary.innerHTML = `
            <strong>📊 Özet:</strong><br>
            • Toplam: ${playerNames.length} oyuncu<br>
            • Eklenecek: ${validCount} yeni oyuncu<br>
            • Atlanacak: ${duplicateCount} mevcut oyuncu<br>
            • Hedef takım: ${teamName}
        `;
        
        preview.style.display = 'block';
    }

    async addBulkPlayers() {
        console.log('🚀 addBulkPlayers fonksiyonu çalıştı');
        
        const textarea = document.getElementById('bulkPlayerNames');
        const teamSelect = document.getElementById('bulkPlayerTeam');
        
        console.log('📝 Textarea değeri:', textarea.value);
        console.log('👥 Seçilen takım:', teamSelect.value);
        
        const playerNames = textarea.value
            .split('\n')
            .map(name => name.trim())
            .filter(name => name.length > 0);
        
        console.log('📋 İşlenmiş oyuncu isimleri:', playerNames);
        
        if (playerNames.length === 0) {
            alert('Lütfen en az bir oyuncu adı girin!');
            return;
        }
        
        const selectedTeam = parseInt(teamSelect.value);
        const existingPlayerNames = this.players
            .filter(p => p.isActive && p.team === selectedTeam)
            .map(p => p.name.toLowerCase());
        
        console.log('👥 Mevcut oyuncular:', existingPlayerNames);
        
        // Sadece yeni oyuncuları filtrele
        const newPlayerNames = playerNames.filter(name => 
            !existingPlayerNames.includes(name.toLowerCase())
        );
        
        console.log('✨ Eklenecek yeni oyuncular:', newPlayerNames);
        
        if (newPlayerNames.length === 0) {
            alert('Tüm oyuncular zaten mevcut!');
            return;
        }
        
        // Confirm modal'ını hazırla ve göster
        this.showBulkConfirmModal(newPlayerNames, selectedTeam);
    }

    showBulkConfirmModal(newPlayerNames, selectedTeam) {
        const teamName = selectedTeam === 1 ? '1. Takım' : '2. Takım';
        const duplicateCount = this.getBulkDuplicateCount();
        
        // Modal içeriğini güncelle
        document.getElementById('confirmTitle').textContent = `${newPlayerNames.length} yeni oyuncu eklensin mi?`;
        document.getElementById('confirmDescription').textContent = `Bu oyuncular ${teamName}'a eklenecek ve hemen değerlendirilebilir hale gelecek.`;
        
        // Detayları oluştur
        const detailsDiv = document.getElementById('confirmDetails');
        detailsDiv.innerHTML = `
            <h5><i class="fas fa-list"></i> Eklenecek Oyuncular</h5>
            <div class="confirm-player-list">
                ${newPlayerNames.map(name => `
                    <div class="confirm-player-item">
                        <i class="fas fa-user-plus"></i>
                        <span>${name}</span>
                    </div>
                `).join('')}
            </div>
            <div class="confirm-summary">
                <i class="fas fa-info-circle"></i>
                ${newPlayerNames.length} yeni oyuncu → ${teamName}
                ${duplicateCount > 0 ? `<br><small>${duplicateCount} mevcut oyuncu atlandı</small>` : ''}
            </div>
        `;
        
        // Pending data'yı sakla
        this.pendingBulkAddition = {
            playerNames: newPlayerNames,
            team: selectedTeam
        };
        
        // Modal'ı göster
        this.showModal('bulkConfirmModal');
    }

    getBulkDuplicateCount() {
        const textarea = document.getElementById('bulkPlayerNames');
        const teamSelect = document.getElementById('bulkPlayerTeam');
        
        const allNames = textarea.value
            .split('\n')
            .map(name => name.trim())
            .filter(name => name.length > 0);
        
        const selectedTeam = parseInt(teamSelect.value);
        const existingPlayerNames = this.players
            .filter(p => p.isActive && p.team === selectedTeam)
            .map(p => p.name.toLowerCase());
        
        const duplicates = allNames.filter(name => 
            existingPlayerNames.includes(name.toLowerCase())
        );
        
        return duplicates.length;
    }

    async processBulkAddition() {
        if (!this.pendingBulkAddition) {
            console.error('❌ Bekleyen toplu ekleme verisi bulunamadı!');
            return;
        }
        
        const { playerNames: newPlayerNames, team: selectedTeam } = this.pendingBulkAddition;
        
        console.log('✅ Kullanıcı onayladı, toplu ekleme başlıyor...', newPlayerNames);
        
        let addedCount = 0;
        let errorCount = 0;
        
        // Confirmation modal'ını kapat
        this.hideModal('bulkConfirmModal');
        
        // Loading göstergesi için buton durumunu değiştir
        const submitBtn = document.querySelector('#addBulkPlayersForm button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Ekleniyor...';
        submitBtn.disabled = true;
        
        try {
            // Her oyuncu için ayrı ayrı ekle
            for (const playerName of newPlayerNames) {
                try {
                    console.log(`➕ ${playerName} ekleniyor...`);
                    
                    const newPlayer = {
                        name: playerName,
                        team: selectedTeam,
                        totalRating: 0,
                        evaluationCount: 0,
                        averageRating: 0,
                        lastEvaluationDate: '',
                        isActive: true,
                        createdAt: new Date().toISOString()
                    };
                    
                    const playerId = await this.savePlayer(newPlayer);
                    newPlayer.id = playerId;
                    this.players.push(newPlayer);
                    addedCount++;
                    
                    console.log(`✅ ${playerName} başarıyla eklendi (ID: ${playerId})`);
                    
                } catch (error) {
                    console.error(`❌ ${playerName} eklenirken hata:`, error);
                    errorCount++;
                }
            }
            
            console.log(`📊 Sonuç: ${addedCount} eklendi, ${errorCount} hata`);
            
            // UI'yi güncelle
            this.renderPlayers();
            this.updateTeamCounts();
            this.hideModal('addPlayerModal');
            
            // Form'u temizle
            const textarea = document.getElementById('bulkPlayerNames');
            textarea.value = '';
            document.getElementById('bulkPreview').style.display = 'none';
            
            // Pending data'yı temizle
            this.pendingBulkAddition = null;
            
            // Sonuç mesajı
            let message = `🎉 ${addedCount} oyuncu başarıyla eklendi!`;
            if (errorCount > 0) {
                message += ` (${errorCount} oyuncu eklenemedi)`;
            }
            this.showSuccessMessage(message);
            
        } finally {
            // Buton durumunu eski haline getir
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new HalisahaApp();
});

// Add CSS for history modal and success message
const historyStyles = `
.success-message {
    background: #4CAF50;
    color: white;
    padding: 1rem 2rem;
    border-radius: var(--border-radius);
    margin: 1rem 0;
    text-align: center;
    font-weight: 500;
    animation: slideInDown 0.3s ease-out;
    box-shadow: var(--shadow);
}

@keyframes slideInDown {
    from {
        transform: translateY(-20px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

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