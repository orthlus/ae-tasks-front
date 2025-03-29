// noinspection DuplicatedCode

import TaskTemplates from './templates.js';

class TaskManager {
    constructor() {
        this.authToken = localStorage.getItem('authToken');
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.tasks = [];
        this.archivedTasks = [];
        this.allSpoilersExpanded = false;
        this.apiConfig = window.API_CONFIG;
        this.isArchiveLoaded = false;

        this.handleResize = () => {
            window.location.hash === '#archive'
                ? this.renderArchived()
                : this.render();
        };

        window.addEventListener('resize', this.handleResize);
        if (this.authToken) {
            this.initApp();
        } else {
            this.showLogin();
        }
        this.setupConfirmationModal();
    }

    showLogin() {
        document.getElementById('loginPage').style.display = 'block';
        document.getElementById('header').style.display = 'none';
        document.getElementById('mainPage').style.display = 'none';
    }

    async handleLogin(login, password) {
        try {
            const response = await fetch(`${this.apiConfig.BASE_URL}${this.apiConfig.AUTH_ENDPOINT}`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({login, password})
            });

            const {token, user} = await response.json();
            localStorage.setItem('authToken', token);
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.authToken = token;
            this.currentUser = user;
            this.initApp();
        } catch (error) {
            alert('Ошибка авторизации');
        }
    }

    initApp() {
        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('header').style.display = 'flex';
        document.getElementById('mainPage').style.display = 'block';
        document.getElementById('username').textContent = this.currentUser?.username;
        this.init();
    }

    async init() {
        this.setupNavigation();
        this.setupEventListeners();
        this.setupUserDropdown();
        this.setupToggleAllSpoilers();
        await this.fetchTasks();
        this.render();
        this.checkHash();
        this.focusInput();
        this.setupAutogrow();
    }

    async fetchTasks() {
        try {
            const response = await fetch(`${this.apiConfig.BASE_URL}/tasks`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.authToken}`
                }
            });
            const data = await response.json();

            this.tasks = data
                .sort((a, b) => b.id - a.id)
                .map(task => this.parseTask(task));

            this.render();
        } catch (error) {
            console.error('Ошибка загрузки задач:', error);
        }
    }

    parseTask(task) {
        const [title, ...description] = task.content.split('\n');
        return {
            id: task.id,
            title: title.trim(),
            description: description.join('\n').trim()
        };
    }

    async fetchArchivedTasks() {
        if (this.isArchiveLoaded) return;

        try {
            const response = await fetch(`${this.apiConfig.BASE_URL}/archive`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.authToken}`
                }
            });
            const data = await response.json();

            this.archivedTasks = data
                .sort((a, b) => b.id - a.id)
                .map(task => this.parseTask(task));

            this.isArchiveLoaded = true;
        } catch (error) {
            console.error('Ошибка загрузки архива:', error);
            alert('Не удалось загрузить архивные задачи');
        }
    }

    setupConfirmationModal() {
        const modal = document.getElementById('confirmationModal');
        const cancelBtn = document.getElementById('modalCancel');
        const confirmBtn = document.getElementById('modalConfirm');
        const confirmationText = document.getElementById('confirmationText');

        cancelBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            this.taskToDelete = null;
        });

        confirmBtn.addEventListener('click', async () => {
            if (this.taskToDelete) {
                await this.deleteTask(
                    this.taskToDelete.id,
                    this.taskToDelete.isPermanent
                );
                modal.style.display = 'none';
                this.taskToDelete = null;
            }
        });

        document.body.addEventListener('click', e => {
            if (e.target.classList.contains('delete-btn')) {
                const taskId = parseInt(e.target.dataset.id);
                const isPermanent = e.target.dataset.permanent === 'true';

                if (this.isMobile()) {
                    const tasksList = isPermanent ? this.archivedTasks : this.tasks;
                    const task = tasksList.find(t => t.id === taskId);
                    if (task) {
                        confirmationText.textContent =
                            `Вы уверены, что хотите удалить задачу #${task.id} "${task.title}"?`;
                    }
                    this.taskToDelete = {id: taskId, isPermanent};
                    modal.style.display = 'flex';
                } else {
                    this.deleteTask(taskId, isPermanent);
                }
            }
        });
    }

    setupAutogrow() {
        const textarea = document.getElementById('taskInput');
        const adjustHeight = () => {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        };

        textarea.addEventListener('input', adjustHeight);
        adjustHeight();
    }

    focusInput() {
        document.getElementById('taskInput').focus();
    }

    checkHash() {
        if (window.location.hash === '#archive') {
            this.showArchive();
        }
    }

    async showArchive() {
        await this.fetchArchivedTasks();
        document.getElementById('mainPage').style.display = 'none';
        const archivePage = document.getElementById('archivePage');
        archivePage.style.display = 'block';
        setTimeout(() => archivePage.style.opacity = '1', 10);
        this.renderArchived();
    }

    showMain() {
        const archivePage = document.getElementById('archivePage');
        archivePage.style.opacity = '0';
        setTimeout(() => {
            archivePage.style.display = 'none';
            document.getElementById('mainPage').style.display = 'block';
            this.focusInput();
        }, 300);
    }

    setupToggleAllSpoilers() {
        const toggleBtn = document.getElementById('toggleAllSpoilers');
        toggleBtn.addEventListener('click', () => {
            this.allSpoilersExpanded = !this.allSpoilersExpanded;
            this.toggleAllSpoilers(this.allSpoilersExpanded);
            toggleBtn.textContent = this.allSpoilersExpanded ? 'Свернуть все' : 'Развернуть все';
        });
    }

    toggleAllSpoilers(expand) {
        document.querySelectorAll('.task-spoiler').forEach(spoiler => {
            spoiler.classList.toggle('active', expand);
        });
    }

    safeParse(jsonString) {
        try {
            return JSON.parse(jsonString);
        } catch (e) {
            return null;
        }
    }

    async addTask(content) {
        const taskInput = document.getElementById('taskInput');
        const saveBtn = document.getElementById('saveBtn');

        try {
            saveBtn.disabled = true;
            taskInput.disabled = true;
            saveBtn.textContent = 'Сохранение...';

            const response = await fetch(`${this.apiConfig.BASE_URL}/tasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.authToken}`
                },
                body: JSON.stringify({content: content.trim()})
            });

            const responseBody = await response.text();

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseData = this.safeParse(responseBody) || {id: Date.now()};

            const newTask = this.parseTask({
                id: responseData.id || Number(responseBody),
                content: content.trim()
            });

            this.tasks.unshift(newTask);
            this.render();
            taskInput.value = '';
            taskInput.style.height = '48px';
        } catch (error) {
            console.error('Полная ошибка сохранения:', error);
            alert(`Ошибка сохранения: ${error.message}`);
        } finally {
            saveBtn.disabled = false;
            taskInput.disabled = false;
            saveBtn.textContent = 'Сохранить задачу';
            taskInput.focus();
        }
    }

    async deleteTask(id, isPermanent = false) {
        try {
            const endpoint = isPermanent ? `/archive/${id}` : `/tasks/${id}`;
            await fetch(`${this.apiConfig.BASE_URL}${endpoint}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.authToken}`
                }
            });

            if (isPermanent) {
                this.archivedTasks = this.archivedTasks.filter(t => t.id !== id);
                this.renderArchived();
            } else {
                this.tasks = this.tasks.filter(t => t.id !== id);
                this.render();
            }
        } catch (error) {
            console.error('Ошибка удаления:', error);
            alert(`Не удалось удалить задачу: ${error.message}`);
        }
    }

    setupNavigation() {
        window.addEventListener('hashchange', () => {
            window.location.hash === '#archive' ? this.showArchive() : this.showMain();
        });
    }

    setupUserDropdown() {
        const username = document.getElementById('username');
        const logoutBtn = document.getElementById('logoutBtn');

        username.addEventListener('click', (e) => {
            e.stopPropagation();
            logoutBtn.classList.toggle('visible');
        });

        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            window.location.reload();
        });

        document.addEventListener('click', () => logoutBtn.classList.remove('visible'));
    }

    setupTaskInteractions() {
        // Удаляем старые обработчики
        document.querySelectorAll('.task').forEach(el => {
            el.replaceWith(el.cloneNode(true));
        });

        // Добавляем новые обработчики для всех задач
        document.querySelectorAll('.task').forEach(taskEl => {
            taskEl.addEventListener('click', (e) => {
                if (e.target.closest('.delete-btn, .copy-btn') ||
                    window.getSelection().toString().length > 0) {
                    return;
                }
                this.toggleTaskDescription(taskEl);
            });
        });

        // Обработчики для кнопок копирования
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleCopyButton(e, btn));
        });
    }

    handleCopyButton(e, btn) {
        e.stopPropagation();
        const taskId = parseInt(btn.dataset.id);
        const tasksList = window.location.hash === '#archive'
            ? this.archivedTasks
            : this.tasks;
        const task = tasksList.find(t => t.id === taskId);

        if (task) {
            const content = `${task.title}${task.description ? '\n' + task.description : ''}`;
            navigator.clipboard.writeText(content)
                .then(() => {
                    btn.classList.add('copied');
                    setTimeout(() => btn.classList.remove('copied'), 2000);
                })
                .catch(console.error);
        }
    }

    toggleTaskDescription(taskElement) {
        const spoiler = taskElement.querySelector('.task-spoiler');
        if (!spoiler) return;

        const wasActive = spoiler.classList.contains('active');
        spoiler.classList.toggle('active');

        if (spoiler.classList.contains('active') && !wasActive) {
            const isMobile = this.isMobile();
            setTimeout(() => {
                spoiler.scrollIntoView({
                    behavior: 'smooth',
                    block: isMobile ? 'center' : 'nearest'
                });
            }, 50);
        }
    }

    render() {
        this.renderTasks();
        this.setupTaskInteractions();
    }

    renderTasks() {
        const container = document.getElementById('tasks');
        container.innerHTML = this.tasks
            .map(task => TaskTemplates.taskElement(task, this.isMobile()))
            .join('');
    }

    renderArchived() {
        const container = document.getElementById('archiveTasks');
        container.innerHTML = this.archivedTasks
            .map(task => TaskTemplates.taskElement(task, this.isMobile(), true))
            .join('');

        this.setupTaskInteractions();

        document.getElementById('clearArchiveBtn').style.display =
            this.archivedTasks.length ? 'block' : 'none';
    }

    isMobile() {
        return window.innerWidth <= 600;
    }

    setupEventListeners() {
        const taskInput = document.getElementById('taskInput');

        taskInput.addEventListener('keydown', async e => {
            if (e.ctrlKey && e.key === 'Enter' && taskInput.value.trim()) {
                e.preventDefault();
                await this.addTask(taskInput.value);
            }
        });

        document.getElementById('clearArchiveBtn').addEventListener('click', () => {
            document.getElementById('passwordModal').style.display = 'flex';
        });

        document.getElementById('cancelPasswordBtn').addEventListener('click', () => {
            document.getElementById('passwordModal').style.display = 'none';
            document.getElementById('passwordInput').value = '';
        });

        document.getElementById('confirmPasswordBtn').addEventListener('click', async () => {
            await this.clearArchive();
        });

        document.getElementById('passwordInput').addEventListener('keydown', async (e) => {
            if (e.key === 'Enter') {
                await this.clearArchive();
            }
        });

        document.getElementById('loginBtn').addEventListener('click', () => {
            const login = document.getElementById('loginInput').value;
            const password = document.getElementById('passwordLoginInput').value;
            this.handleLogin(login, password);
        });
    }

    async clearArchive() {
        const password = document.getElementById('passwordInput').value;
        if (!password) {
            alert('Введите пароль');
            return;
        }

        try {
            const response = await fetch(`${this.apiConfig.BASE_URL}/archive`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${password}`
                }
            });

            if (!response.ok) {
                throw new Error('Неверный пароль');
            }

            this.archivedTasks = [];
            this.renderArchived();
            document.getElementById('passwordModal').style.display = 'none';
            document.getElementById('passwordInput').value = '';
        } catch (error) {
            console.error('Ошибка удаления архива:', error);
            alert(error.message);
        }
    }
}

new TaskManager();