import TaskTemplates from './templates.js';

class TaskManager {
    constructor() {
        this.tasks = [];
        this.archivedTasks = [];
        this.allSpoilersExpanded = false;
        this.apiConfig = window.API_CONFIG;

        this.handleResize = () => {
            if (window.location.hash === '#archive') {
                this.renderArchived();
            } else {
                this.render();
            }
        };

        window.addEventListener('resize', this.handleResize);
        this.init();

        this.taskToDelete = null;
        this.isPermanentDelete = false;
        this.setupConfirmationModal();
    }

    async init() {
        this.setupNavigation();
        this.setupEventListeners();
        this.setupUserDropdown();
        this.setupToggleAllSpoilers();
        this.setupSaveButton();
        this.setupClearArchiveButton();
        this.setupPasswordModal();
        await this.fetchTasks();
        this.render();
        this.checkHash();
        this.focusInput();
        this.setupAutogrow();
    }

    async fetchTasks() {
        try {
            const response = await fetch(`${this.apiConfig.BASE_URL}/tasks`);
            const data = await response.json();

            this.tasks = data
                .sort((a, b) => b.id - a.id)
                .map(task => {
                    const [title, ...description] = task.content.split('\n');
                    return {
                        id: task.id,
                        number: task.id,
                        title: title.trim(),
                        description: description.join('\n').trim()
                    };
                });

            this.render();
        } catch (error) {
            console.error('Ошибка загрузки задач:', error);
        }
    }

    setupConfirmationModal() {
        const modal = document.getElementById('confirmationModal');
        const cancelBtn = document.getElementById('modalCancel');
        const confirmBtn = document.getElementById('modalConfirm');

        cancelBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            this.taskToDelete = null;
        });

        confirmBtn.addEventListener('click', () => {
            if (this.taskToDelete) {
                if (this.isPermanentDelete) {
                    this.permanentlyDeleteTask(this.taskToDelete);
                } else {
                    this.deleteTask(this.taskToDelete);
                }
            }
            modal.style.display = 'none';
            this.taskToDelete = null;
        });
    }

    setupAutogrow() {
        const textarea = document.getElementById('taskInput');

        function adjustHeight() {
            textarea.style.height = 'auto';
            textarea.style.height = (textarea.scrollHeight) + 'px';
        }

        textarea.addEventListener('input', adjustHeight);
        textarea.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && !e.ctrlKey) {
                adjustHeight();
            }
        });

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

    showArchive() {
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
        const spoilers = document.querySelectorAll('.task-spoiler');
        spoilers.forEach(spoiler => {
            if (expand) {
                spoiler.classList.add('active');
            } else {
                spoiler.classList.remove('active');
            }
        });
    }

    setupSaveButton() {
        const saveBtn = document.getElementById('saveBtn');
        const taskInput = document.getElementById('taskInput');

        saveBtn.addEventListener('click', async () => {
            if (taskInput.value.trim()) {
                await this.addTask(taskInput.value);
            }
        });

        taskInput.addEventListener('keydown', async e => {
            if (e.ctrlKey && e.key === 'Enter' && taskInput.value.trim()) {
                e.preventDefault();
                await this.addTask(taskInput.value);
            }
        });
    }

    saveTask() {
        const taskInput = document.getElementById('taskInput');
        if (taskInput.value.trim()) {
            this.addTask(taskInput.value);
            taskInput.value = '';
            taskInput.style.height = 'auto';
            taskInput.style.height = '48px';
            taskInput.focus();
        }
    }

    setupClearArchiveButton() {
        const clearArchiveBtn = document.getElementById('clearArchiveBtn');
        clearArchiveBtn.addEventListener('click', () => {
            if (this.archivedTasks.length > 0) {
                this.showPasswordModal();
            }
        });
    }

    setupPasswordModal() {
        const passwordModal = document.getElementById('passwordModal');
        const cancelBtn = document.getElementById('cancelPasswordBtn');
        const confirmBtn = document.getElementById('confirmPasswordBtn');
        const passwordInput = document.getElementById('passwordInput');

        const hideModal = () => {
            passwordModal.style.display = 'none';
            passwordInput.value = '';
        };

        cancelBtn.addEventListener('click', hideModal);

        confirmBtn.addEventListener('click', () => {
            // Здесь должна быть проверка пароля
            // Для демо просто проверяем, что введен любой пароль
            if (passwordInput.value.trim()) {
                this.archivedTasks = [];
                this.renderArchived();
                hideModal();
            } else {
                alert('Введите пароль');
            }
        });

        passwordInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                confirmBtn.click();
            }
        });
    }

    async addTask(content) {
        const taskInput = document.getElementById('taskInput');
        const saveBtn = document.getElementById('saveBtn');

        try {
            // Блокируем кнопку и поле ввода на время отправки
            saveBtn.disabled = true;
            taskInput.disabled = true;
            saveBtn.textContent = 'Сохранение...';

            const response = await fetch(`${this.apiConfig.BASE_URL}/tasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: content // отправляем полный текст как есть
                })
            });

            if (!response.ok) throw new Error('Ошибка сохранения');

            const newTaskId = Number(await response.text());

            // Добавляем задачу в начало списка
            this.tasks.unshift({
                id: newTaskId,
                number: newTaskId,
                title: content.split('\n')[0].trim(),
                description: content.split('\n').slice(1).join('\n').trim()
            });

            this.tasks.sort((a, b) => b.id - a.id);

            this.render();
            taskInput.value = '';
            taskInput.style.height = '48px';
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Не удалось сохранить задачу. Проверьте соединение и повторите попытку.');
        } finally {
            saveBtn.disabled = false;
            taskInput.disabled = false;
            saveBtn.textContent = 'Сохранить задачу';
            taskInput.focus();
        }
    }

    showPasswordModal() {
        document.getElementById('passwordModal').style.display = 'flex';
        document.getElementById('passwordInput').focus();
    }

    async deleteTask(id) {
        try {
            await fetch(`${this.apiConfig.BASE_URL}/tasks/${id}`, {method: 'DELETE'});
            this.tasks = this.tasks.filter(t => t.id !== id);
            this.render();
        } catch (error) {
            console.error('Ошибка удаления:', error);
        }
    }

    async permanentlyDeleteTask(id) {
        try {
            await fetch(`${this.apiConfig.BASE_URL}/archive/${id}`, {method: 'DELETE'});
            this.archivedTasks = this.archivedTasks.filter(t => t.id !== id);
            this.renderArchived();
        } catch (error) {
            console.error('Ошибка удаления:', error);
        }
    }

    setupNavigation() {
        window.addEventListener('hashchange', () => {
            if (window.location.hash === '#archive') {
                this.showArchive();
            } else {
                this.showMain();
            }
        });
    }

    setupUserDropdown() {
        const username = document.getElementById('username');
        const logoutBtn = document.getElementById('logoutBtn');

        username.addEventListener('click', (e) => {
            e.stopPropagation();
            logoutBtn.classList.toggle('visible');
        });

        document.addEventListener('click', () => {
            logoutBtn.classList.remove('visible');
        });

        logoutBtn.addEventListener('click', () => {
            alert('Выход выполнен');
            logoutBtn.classList.remove('visible');
        });
    }

    render() {
        this.renderTasks();
        this.setupTaskInteractions();
    }

    renderTasks() {
        const container = document.getElementById('tasks');
        const isMobile = window.innerWidth <= 600;

        container.innerHTML = this.tasks
            .sort((a, b) => b.id - a.id)
            .map(task => TaskTemplates.taskElement(task, isMobile))
            .join('');

        this.setupTaskInteractions();
    }

    renderArchived() {
        const container = document.getElementById('archiveTasks');
        const clearArchiveBtn = document.getElementById('clearArchiveBtn');
        const isMobile = window.innerWidth <= 600;

        clearArchiveBtn.style.display = this.archivedTasks.length ? 'block' : 'none';

        container.innerHTML = this.archivedTasks
            .map(task => TaskTemplates.taskElement(task, isMobile, true))
            .join('');

        this.setupTaskInteractions(true);
    }

    setupEventListeners() {
        const taskInput = document.getElementById('taskInput');
        const saveBtn = document.getElementById('saveBtn');

        taskInput.addEventListener('keydown', e => {
            if (e.ctrlKey && e.key === 'Enter') {
                this.saveTask();
                e.preventDefault();
            }
        });

        saveBtn.addEventListener('click', () => {
            this.saveTask();
        });

        document.body.addEventListener('click', e => {
            if (e.target.classList.contains('delete-btn')) {
                e.preventDefault();
                e.stopPropagation();

                this.taskToDelete = parseInt(e.target.dataset.id);
                this.isPermanentDelete = e.target.dataset.permanent === 'true';

                document.getElementById('confirmationModal').style.display = 'flex';
            }

            if (e.target.classList.contains('confirmation-modal')) {
                document.getElementById('confirmationModal').style.display = 'none';
                this.taskToDelete = null;
            }
        });

        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' &&
                document.getElementById('confirmationModal').style.display === 'flex') {
                document.getElementById('confirmationModal').style.display = 'none';
                this.taskToDelete = null;
            }
        });

        this.setupTaskInteractions();

        window.addEventListener('hashchange', () => {
            if (window.location.hash === '#archive') {
                this.showArchive();
            } else {
                this.showMain();
            }
        });
    }

    setupTaskInteractions(isArchive = false) {
        // Удаляем старые обработчики
        document.querySelectorAll('.task').forEach(el => {
            el.replaceWith(el.cloneNode(true));
        });

        // Добавляем обработчик на весь блок задачи
        document.querySelectorAll('.task').forEach(taskEl => {
            taskEl.addEventListener('click', (e) => {
                // Игнорируем клики по кнопке удаления, копирования и тексту
                if (e.target.closest('.delete-btn, .copy-btn') ||
                    window.getSelection().toString().length > 0) {
                    return;
                }

                this.toggleTaskDescription(taskEl);
            });
        });
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const taskId = parseInt(btn.dataset.id);
                const tasksList = isArchive ? this.archivedTasks : this.tasks;
                const task = tasksList.find(t => t.id === taskId);

                if (task) {
                    const content = `${task.title}${task.description ? '\n' + task.description.replace(/<[^>]*>?/gm, '') : ''}`;
                    navigator.clipboard.writeText(content)
                        .then(() => {
                            btn.classList.add('copied');
                            btn.innerHTML = `
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>`;
                            setTimeout(() => {
                                btn.classList.remove('copied');
                                btn.innerHTML = `
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                </svg>`;
                            }, 2000);
                        })
                        .catch(err => {
                            console.error('Ошибка копирования:', err);
                        });
                }
            });
        });
    }

    toggleTaskDescription(taskElement) {
        const spoiler = taskElement.querySelector('.task-spoiler');
        if (!spoiler) return;

        spoiler.classList.toggle('active');

        if (spoiler.classList.contains('active')) {
            spoiler.scrollIntoView({behavior: 'smooth', block: 'nearest'});
        }
    }
}

new TaskManager();