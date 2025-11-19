// noinspection DuplicatedCode

import TaskTemplates from './templates.js';

class TaskManager {
    constructor() {
        this.tasks = [];
        this.archivedTasks = [];
        this.allSpoilersExpanded = false;
        this.apiConfig = window.API_CONFIG;
        this.isArchiveLoaded = false;
        this.expandedTaskIds = new Set();
        this.scrollHandler = this.handleScroll.bind(this);
        window.addEventListener('scroll', this.scrollHandler);
        this.handleWheel = this.handleWheel.bind(this);
        window.addEventListener('wheel', this.handleWheel, {passive: false});

        this.handleResize = () => {
            if (document.activeElement.tagName === 'TEXTAREA') return;
            window.location.hash === '#archive'
                ? this.renderArchived()
                : this.render();
        };

        window.addEventListener('resize', this.handleResize);
        this.initApp();
        this.setupConfirmationModal();
    }

    handleWheel(e) {
        if (e.ctrlKey) {
            e.preventDefault();
            const scrollAmount = 1000; // Количество пикселей для прокрутки
            if (e.deltaY < 0) {
                window.scrollBy({top: -scrollAmount, behavior: 'instant'});
            } else {
                window.scrollBy({top: scrollAmount, behavior: 'instant'});
            }
        }
    }

    handleScroll() {
        if (this.isMobile() && document.activeElement.tagName !== 'TEXTAREA') {
            this.restoreExpandedState();
        }
    }

    initApp() {
        document.getElementById('mainPage').style.display = 'block';
        this.init();
    }

    async init() {
        this.setupNavigation();
        this.setupEventListeners();
        // this.setupUserDropdown();
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
        this.allSpoilersExpanded = expand;
        document.querySelectorAll('.task').forEach(taskEl => {
            const spoiler = taskEl.querySelector('.task-spoiler');
            if (spoiler) {
                const taskId = parseInt(taskEl.dataset.id);
                if (expand) {
                    this.expandedTaskIds.add(taskId);
                } else {
                    this.expandedTaskIds.delete(taskId);
                }
                spoiler.classList.toggle('active', expand);
            }
        });
    }

    safeParse(jsonString) {
        try {
            return JSON.parse(jsonString);
        } catch (e) {
            return null;
        }
    }

    async updateTaskDescription(taskId, newDescription) {
        try {
            await fetch(`${this.apiConfig.BASE_URL}/tasks/${taskId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({content: newDescription})
            });
            const task = this.tasks.find(t => t.id === taskId);
            if (task) {
                task.description = `${task.description}\n${newDescription}`;
            }

            this.render();
        } catch (error) {
            console.error('Ошибка обновления:', error);
            alert('Не удалось обновить задачу');
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

    setupTaskInteractions() {
        document.querySelectorAll('.task').forEach(taskEl => {
            // Удаляем все старые обработчики
            const newTaskEl = taskEl.cloneNode(true);
            taskEl.parentNode.replaceChild(newTaskEl, taskEl);

            // Добавляем новые обработчики
            newTaskEl.addEventListener('click', (e) => {
                if (e.target.closest('.delete-btn, .copy-btn, a, .edit-btn, .edit-container, .edit-textarea') ||
                    window.getSelection().toString().length > 0) {
                    return;
                }
                this.toggleTaskDescription(newTaskEl);
            });
        });

        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleCopyButton(e, btn));
        });

        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleEditButton(e));
        });
    }

    handleEditButton(e) {
        e.stopPropagation();
        const taskId = parseInt(e.target.dataset.id);
        const taskEl = e.target.closest('.task');
        const existingEditor = taskEl.querySelector('.edit-container');
        if (existingEditor) return;

        const actionsBlock = taskEl.querySelector('.task-actions');
        if (actionsBlock) actionsBlock.style.display = 'none';

        const editorHtml = TaskTemplates.editInputHtml(taskId);

        const contentWrapper = taskEl.querySelector('.task-content-wrapper');
        if (contentWrapper) {
            contentWrapper.insertAdjacentHTML('beforeend', editorHtml);
        } else {
            taskEl.insertAdjacentHTML('beforeend', editorHtml);
        }

        taskEl.querySelector('.save-edit-btn').addEventListener('click', (e) => {
            const textarea = taskEl.querySelector('.edit-textarea');
            const newDescription = textarea.value.trim();

            if (newDescription === "") {
                taskEl.querySelector('.edit-container').remove();
                if (actionsBlock) actionsBlock.style.display = 'flex';
            } else {
                this.updateTaskDescription(taskId, newDescription).finally(() => {
                    if (actionsBlock) actionsBlock.style.display = 'flex';
                });
            }
        });

        taskEl.querySelector('.cancel-edit-btn').addEventListener('click', () => {
            taskEl.querySelector('.edit-container').remove();
            if (actionsBlock) actionsBlock.style.display = 'flex';
        });

        taskEl.querySelector('.edit-textarea').focus();
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

    restoreExpandedState() {
        requestAnimationFrame(() => {
            document.querySelectorAll('.task').forEach(taskEl => {
                const taskId = parseInt(taskEl.dataset.id);
                const spoiler = taskEl.querySelector('.task-spoiler');
                if (spoiler) {
                    spoiler.classList.toggle('active',
                        this.expandedTaskIds.has(taskId) || this.allSpoilersExpanded);
                }
            });
        });
    }

    toggleTaskDescription(taskElement) {
        const spoiler = taskElement.querySelector('.task-spoiler');
        if (!spoiler) return;

        const taskId = parseInt(taskElement.dataset.id);
        const wasActive = spoiler.classList.contains('active');

        if (wasActive) {
            this.expandedTaskIds.delete(taskId);
        } else {
            this.expandedTaskIds.add(taskId);
        }

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
        this.restoreExpandedState();
    }

    renderTasks() {
        const container = document.getElementById('tasks');
        container.innerHTML = this.tasks
            .map(task => TaskTemplates.taskElement(task, this.isMobile()))
            .join('');

        const taskCountElement = document.getElementById('taskCount');
        if (taskCountElement) {
            taskCountElement.textContent = `Текущие задачи: ${this.tasks.length} шт`;
        }
    }

    renderArchived() {
        const container = document.getElementById('archiveTasks');
        container.innerHTML = this.archivedTasks
            .map(task => TaskTemplates.taskElement(task, this.isMobile(), true))
            .join('');

        this.setupTaskInteractions();
        this.restoreExpandedState();
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
            if (e.shiftKey && e.key === 'Enter' && taskInput.value.trim()) {
                e.preventDefault();
                await this.addTask(taskInput.value);
            }
        });

        document.getElementById('saveBtn').addEventListener('click', async () => {
            const taskInput = document.getElementById('taskInput');
            if (taskInput.value.trim()) {
                await this.addTask(taskInput.value);
            }
        });
    }
}

new TaskManager();