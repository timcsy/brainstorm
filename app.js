// 腦力激盪平台 - 主要應用程式
class BrainstormApp {
    constructor() {
        // 初始化 GUN.js
        this.gun = Gun(['https://gun-manhattan.herokuapp.com/gun']);
        this.currentUser = null;
        this.currentQuestion = null;
        this.questions = this.gun.get('brainstorm-questions');
        this.answers = this.gun.get('brainstorm-answers');
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadQuestions();
        
        // 檢查是否已經加入聊天室
        const userData = localStorage.getItem('brainstorm-user');
        if (userData) {
            this.currentUser = JSON.parse(userData);
            this.showChatRoom();
        }
    }

    bindEvents() {
        // 加入聊天室按鈕
        document.getElementById('joinRoomBtn').addEventListener('click', () => {
            new bootstrap.Modal(document.getElementById('joinRoomModal')).show();
        });

        // 確認加入聊天室
        document.getElementById('confirmJoinBtn').addEventListener('click', () => {
            this.joinChatRoom();
        });

        // 新增問題按鈕
        document.getElementById('addQuestionBtn').addEventListener('click', () => {
            new bootstrap.Modal(document.getElementById('addQuestionModal')).show();
        });

        // 確認新增問題
        document.getElementById('confirmAddQuestionBtn').addEventListener('click', () => {
            this.addQuestion();
        });

        // 提交回答
        document.getElementById('submitAnswerBtn').addEventListener('click', () => {
            this.submitAnswer();
        });

        // 回答輸入框 Enter 鍵提交
        document.getElementById('answerInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.submitAnswer();
            }
        });

        // 匿名選項變更
        document.getElementById('isAnonymous').addEventListener('change', (e) => {
            const usernameInput = document.getElementById('username');
            if (e.target.checked) {
                usernameInput.value = '';
                usernameInput.disabled = true;
                usernameInput.placeholder = '將以匿名身份參與';
            } else {
                usernameInput.disabled = false;
                usernameInput.placeholder = '輸入你的名稱';
            }
        });
    }

    joinChatRoom() {
        const username = document.getElementById('username').value.trim();
        const isAnonymous = document.getElementById('isAnonymous').checked;
        
        if (!isAnonymous && !username) {
            this.showNotification('請輸入顯示名稱', 'error');
            return;
        }

        this.currentUser = {
            id: this.generateId(),
            name: isAnonymous ? '匿名用戶' : username,
            isAnonymous: isAnonymous,
            joinedAt: new Date().toISOString()
        };

        // 儲存用戶資料到本地
        localStorage.setItem('brainstorm-user', JSON.stringify(this.currentUser));

        // 關閉模態框
        bootstrap.Modal.getInstance(document.getElementById('joinRoomModal')).hide();

        // 顯示聊天室
        this.showChatRoom();
        
        this.showNotification(`歡迎 ${this.currentUser.name}！`, 'success');
    }

    showChatRoom() {
        document.getElementById('welcomeScreen').classList.add('d-none');
        document.getElementById('chatRoomScreen').classList.remove('d-none');
        
        // 顯示用戶狀態
        this.showUserStatus();
        
        // 更新加入按鈕為離開按鈕
        const joinBtn = document.getElementById('joinRoomBtn');
        joinBtn.innerHTML = '<i class="fas fa-sign-out-alt me-2"></i>離開聊天室';
        joinBtn.onclick = () => this.leaveChatRoom();
    }

    leaveChatRoom() {
        this.currentUser = null;
        localStorage.removeItem('brainstorm-user');
        
        document.getElementById('chatRoomScreen').classList.add('d-none');
        document.getElementById('welcomeScreen').classList.remove('d-none');
        
        // 移除用戶狀態
        const userStatus = document.querySelector('.user-status');
        if (userStatus) {
            userStatus.remove();
        }
        
        // 重置加入按鈕
        const joinBtn = document.getElementById('joinRoomBtn');
        joinBtn.innerHTML = '<i class="fas fa-sign-in-alt me-2"></i>加入聊天室';
        joinBtn.onclick = () => {
            new bootstrap.Modal(document.getElementById('joinRoomModal')).show();
        };
        
        this.showNotification('已離開聊天室', 'info');
    }

    showUserStatus() {
        // 移除舊的狀態顯示
        const oldStatus = document.querySelector('.user-status');
        if (oldStatus) {
            oldStatus.remove();
        }

        const statusDiv = document.createElement('div');
        statusDiv.className = `user-status ${this.currentUser.isAnonymous ? 'anonymous' : ''}`;
        statusDiv.innerHTML = `
            <i class="fas fa-user me-2"></i>
            ${this.currentUser.name}
        `;
        document.body.appendChild(statusDiv);
    }

    addQuestion() {
        const title = document.getElementById('questionTitle').value.trim();
        const description = document.getElementById('questionDescription').value.trim();
        
        if (!title) {
            this.showNotification('請輸入問題標題', 'error');
            return;
        }

        const questionId = this.generateId();
        const questionData = {
            id: questionId,
            title: title,
            description: description,
            author: this.currentUser.name,
            authorId: this.currentUser.id,
            createdAt: new Date().toISOString(),
            likes: 0,
            likedBy: {}
        };

        // 儲存到 GUN
        this.questions.get(questionId).put(questionData);

        // 清空表單
        document.getElementById('addQuestionForm').reset();
        
        // 關閉模態框
        bootstrap.Modal.getInstance(document.getElementById('addQuestionModal')).hide();

        this.showNotification('問題已發布！', 'success');
        
        // 重新載入問題列表
        setTimeout(() => this.loadQuestions(), 500);
    }

    loadQuestions() {
        const questionsList = document.getElementById('questionsList');
        questionsList.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

        // 從 GUN 載入問題
        const questionsData = [];
        
        this.questions.map().on((data, key) => {
            if (data && typeof data === 'object' && data.id) {
                // 移除已存在的問題（避免重複）
                const existingIndex = questionsData.findIndex(q => q.id === data.id);
                if (existingIndex !== -1) {
                    questionsData[existingIndex] = data;
                } else {
                    questionsData.push(data);
                }
                this.renderQuestions(questionsData);
            }
        });

        // 如果沒有問題，顯示空狀態
        setTimeout(() => {
            if (questionsData.length === 0) {
                questionsList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-question-circle"></i>
                        <p>還沒有問題，成為第一個發問的人吧！</p>
                    </div>
                `;
            }
        }, 2000);
    }

    renderQuestions(questions) {
        // 按讚數和建立時間排序
        questions.sort((a, b) => {
            if (b.likes !== a.likes) {
                return b.likes - a.likes;
            }
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        const questionsList = document.getElementById('questionsList');
        questionsList.innerHTML = questions.map((question, index) => `
            <div class="question-item" onclick="app.selectQuestion('${question.id}')">
                <div class="question-title">${this.escapeHtml(question.title)}</div>
                <div class="question-meta">
                    <small>by ${this.escapeHtml(question.author)} • ${this.formatDate(question.createdAt)}</small>
                    <div class="question-likes">
                        <button class="like-btn ${this.isQuestionLiked(question.id) ? 'liked' : ''}" 
                                onclick="event.stopPropagation(); app.toggleQuestionLike('${question.id}')">
                            <i class="fas fa-heart"></i>
                        </button>
                        <span>${question.likes || 0}</span>
                    </div>
                </div>
                ${index < 3 ? `<div class="sort-indicator">${index + 1}</div>` : ''}
            </div>
        `).join('');
    }

    selectQuestion(questionId) {
        // 從問題列表中找到選中的問題
        this.questions.get(questionId).once((data) => {
            if (data) {
                this.currentQuestion = data;
                
                // 更新 UI
                document.getElementById('selectedQuestionTitle').innerHTML = `
                    <i class="fas fa-comments me-2"></i>${this.escapeHtml(data.title)}
                `;
                
                document.getElementById('noQuestionSelected').classList.add('d-none');
                document.getElementById('answerSection').classList.remove('d-none');
                
                // 更新問題項目的選中狀態
                document.querySelectorAll('.question-item').forEach(item => {
                    item.classList.remove('active');
                });
                event.target.closest('.question-item').classList.add('active');
                
                // 載入答案
                this.loadAnswers(questionId);
            }
        });
    }

    loadAnswers(questionId) {
        const answersList = document.getElementById('answersList');
        answersList.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

        const answersData = [];
        
        // 載入此問題的答案
        this.answers.get(questionId).map().on((data, key) => {
            if (data && typeof data === 'object' && data.id) {
                const existingIndex = answersData.findIndex(a => a.id === data.id);
                if (existingIndex !== -1) {
                    answersData[existingIndex] = data;
                } else {
                    answersData.push(data);
                }
                this.renderAnswers(answersData);
            }
        });

        setTimeout(() => {
            if (answersData.length === 0) {
                answersList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-comment"></i>
                        <p>還沒有回答，成為第一個回答的人吧！</p>
                    </div>
                `;
            }
        }, 2000);
    }

    renderAnswers(answers) {
        // 按讚數排序
        answers.sort((a, b) => (b.likes || 0) - (a.likes || 0));

        const answersList = document.getElementById('answersList');
        answersList.innerHTML = answers.map(answer => `
            <div class="answer-item fade-in">
                <div class="answer-content">${this.escapeHtml(answer.content)}</div>
                <div class="answer-meta">
                    <span class="answer-author">${this.escapeHtml(answer.author)} • ${this.formatDate(answer.createdAt)}</span>
                    <div class="answer-likes">
                        <button class="like-btn ${this.isAnswerLiked(answer.id) ? 'liked' : ''}" 
                                onclick="app.toggleAnswerLike('${answer.id}')">
                            <i class="fas fa-heart"></i>
                        </button>
                        <span>${answer.likes || 0}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    submitAnswer() {
        const answerInput = document.getElementById('answerInput');
        const content = answerInput.value.trim();
        
        if (!content) {
            this.showNotification('請輸入回答內容', 'error');
            return;
        }

        if (!this.currentQuestion) {
            this.showNotification('請先選擇一個問題', 'error');
            return;
        }

        const answerId = this.generateId();
        const answerData = {
            id: answerId,
            questionId: this.currentQuestion.id,
            content: content,
            author: this.currentUser.name,
            authorId: this.currentUser.id,
            createdAt: new Date().toISOString(),
            likes: 0,
            likedBy: {}
        };

        // 儲存到 GUN
        this.answers.get(this.currentQuestion.id).get(answerId).put(answerData);

        // 清空輸入框
        answerInput.value = '';
        
        this.showNotification('回答已提交！', 'success');
        
        // 重新載入答案
        setTimeout(() => this.loadAnswers(this.currentQuestion.id), 500);
    }

    toggleQuestionLike(questionId) {
        if (!this.currentUser) return;

        this.questions.get(questionId).once((data) => {
            if (data) {
                const likedBy = data.likedBy || {};
                const isLiked = likedBy[this.currentUser.id];
                
                if (isLiked) {
                    // 取消讚
                    delete likedBy[this.currentUser.id];
                    data.likes = Math.max(0, (data.likes || 0) - 1);
                } else {
                    // 點讚
                    likedBy[this.currentUser.id] = true;
                    data.likes = (data.likes || 0) + 1;
                }
                
                data.likedBy = likedBy;
                this.questions.get(questionId).put(data);
                
                // 重新載入問題列表
                setTimeout(() => this.loadQuestions(), 300);
            }
        });
    }

    toggleAnswerLike(answerId) {
        if (!this.currentUser || !this.currentQuestion) return;

        this.answers.get(this.currentQuestion.id).get(answerId).once((data) => {
            if (data) {
                const likedBy = data.likedBy || {};
                const isLiked = likedBy[this.currentUser.id];
                
                if (isLiked) {
                    // 取消讚
                    delete likedBy[this.currentUser.id];
                    data.likes = Math.max(0, (data.likes || 0) - 1);
                } else {
                    // 點讚
                    likedBy[this.currentUser.id] = true;
                    data.likes = (data.likes || 0) + 1;
                }
                
                data.likedBy = likedBy;
                this.answers.get(this.currentQuestion.id).get(answerId).put(data);
                
                // 重新載入答案
                setTimeout(() => this.loadAnswers(this.currentQuestion.id), 300);
            }
        });
    }

    isQuestionLiked(questionId) {
        if (!this.currentUser) return false;
        // 這個方法需要在渲染時檢查，實際狀態從 GUN 獲取
        return false;
    }

    isAnswerLiked(answerId) {
        if (!this.currentUser) return false;
        // 這個方法需要在渲染時檢查，實際狀態從 GUN 獲取
        return false;
    }

    generateId() {
        return 'id_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) {
            return '剛剛';
        } else if (diffMins < 60) {
            return `${diffMins} 分鐘前`;
        } else if (diffHours < 24) {
            return `${diffHours} 小時前`;
        } else if (diffDays < 7) {
            return `${diffDays} 天前`;
        } else {
            return date.toLocaleDateString('zh-TW');
        }
    }

    showNotification(message, type = 'info') {
        // 移除現有通知
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)} me-2"></i>
            ${message}
        `;
        
        document.body.appendChild(notification);
        
        // 顯示動畫
        setTimeout(() => notification.classList.add('show'), 100);
        
        // 自動移除
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    getNotificationIcon(type) {
        switch (type) {
            case 'success': return 'check-circle';
            case 'error': return 'exclamation-circle';
            case 'warning': return 'exclamation-triangle';
            case 'info': return 'info-circle';
            default: return 'info-circle';
        }
    }
}

// 初始化應用程式
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new BrainstormApp();
});
