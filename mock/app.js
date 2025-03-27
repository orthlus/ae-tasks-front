class TaskManager {
    constructor() {
        this.tasks = [];
        this.archivedTasks = [];
        this.currentId = 1;
        this.allSpoilersExpanded = false;

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

    init() {
        this.setupNavigation();
        this.setupEventListeners();
        this.setupUserDropdown();
        this.setupToggleAllSpoilers();
        this.setupSaveButton();
        this.setupClearArchiveButton();
        this.setupPasswordModal();
        this.addMockTasks();
        this.render();
        this.checkHash();
        this.focusInput();
        this.setupAutogrow();
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
        textarea.addEventListener('keydown', function(e) {
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

        saveBtn.addEventListener('click', () => {
            this.saveTask();
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

    showPasswordModal() {
        document.getElementById('passwordModal').style.display = 'flex';
        document.getElementById('passwordInput').focus();
    }

    addMockTasks() {
        const mockTasks = [
            'Заплатить за интернет\nСрок до 15 числа\nСумма: 500 руб.',
            'Купить продукты\nМолоко, хлеб, яйца, фрукты',
            'Очень длинное название задачи, которое должно переноситься на несколько строк\nДетали задачи\nДополнительная информация\n'.repeat(10),
            'Подготовить отчет\nЕженедельный отчет по продажам\nДанные за последнюю неделю\nАнализ динамики\nВыводы и рекомендации',
            'Позвонить клиенту\nИванов Иван\nОбсудить новый проект\nУточнить сроки',
            'спойлер::Секретная информация\nДетали проекта X\nБюджет: 1 000 000 руб.\nСроки: до конца квартала',
            'Обновить резюме\nДобавить последний опыт работы\nОбновить навыки\nПроверить контакты',
            'Записаться к врачу\nТерапевт\nДата: следующая неделя\nВзять медицинскую карту',
            'Изучить новый фреймворк\nReact 18\nНовые фичи\nДокументация\nПрактические примеры',
            'Планерка\nЕжедневная встреча в 10:00\nПодготовить список вопросов\nОбсудить текущие задачи',
            'Ремонт в квартире\nСоставить смету\nВыбрать материалы\nНайти рабочих\nСрок: до конца месяца',
            'Отправить документы\nСканы паспорта\nИНН\nДиплом\nНа почту hr@company.com',
            'Книга для чтения\n"Чистый код" Роберт Мартин\nГлавы 5-8\nСделать заметки',
            'Фитнес\nТренировка в 19:00\nРазминка\nОсновной блок\nЗаминка',
            'Подарок на день рождения\nВыбрать подарок коллеге\nУпаковка\nОткрытка',
            'Резервное копирование\nВажные документы\nФото\nНастройки приложений\nНа внешний диск'
        ]
        mockTasks.forEach(task => this.addTask(task));
    }

    addTask(content) {
        const [title, ...description] = content.split('\n');
        const task = {
            id: this.currentId++,
            title: title.trim(),
            description: description.join('\n'),
            number: this.currentId - 1,
            createdAt: new Date()
        };
        this.tasks.unshift(task);
        this.render();
    }

    deleteTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            this.archivedTasks.unshift(task);
            this.tasks = this.tasks.filter(t => t.id !== id);
            this.render();
        }
    }

    permanentlyDeleteTask(id) {
        this.archivedTasks = this.archivedTasks.filter(t => t.id !== id);
        this.renderArchived();
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

        container.innerHTML = this.tasks.map(task => {
            const descriptionHtml = task.description ? `
            <div class="task-spoiler">
                <div class="task-content">${task.description}</div>
            </div>` : '';

            return `
        <div class="task" data-id="${task.id}">
            ${isMobile ? `
            <div class="task-header-mobile">
                <div class="task-number">#${task.number}</div>
                <div class="task-title-mobile" data-id="${task.id}">${task.title}</div>
                <div class="task-actions">
                    <button class="delete-btn" data-id="${task.id}">×</button>
                </div>
            </div>
            ${descriptionHtml}
            ` : `
            <div class="task-number">#${task.number}</div>
            <div class="task-content-wrapper">
                <div class="task-title" data-id="${task.id}">${task.title}</div>
                ${descriptionHtml}
            </div>
            <div class="task-actions">
                <button class="delete-btn" data-id="${task.id}">×</button>
            </div>
            `}
        </div>`;
        }).join('');

        this.setupTaskInteractions();
    }

    renderArchived() {
        const container = document.getElementById('archiveTasks');
        const clearArchiveBtn = document.getElementById('clearArchiveBtn');
        const isMobile = window.innerWidth <= 600;

        clearArchiveBtn.style.display = this.archivedTasks.length ? 'block' : 'none';

        container.innerHTML = this.archivedTasks.map(task => {
            const descriptionHtml = task.description ? `
            <div class="task-spoiler">
                <div class="task-content">${task.description}</div>
            </div>` : '';

            return `
        <div class="task" data-id="${task.id}">
            ${isMobile ? `
            <div class="task-header-mobile">
                <div class="task-number">#${task.number}</div>
                <div class="task-title-mobile" data-id="${task.id}">${task.title}</div>
                <div class="task-actions">
                    <button class="delete-btn" data-id="${task.id}" data-permanent="true">×</button>
                </div>
            </div>
            ${descriptionHtml}
            ` : `
            <div class="task-number">#${task.number}</div>
            <div class="task-content-wrapper">
                <div class="task-title" data-id="${task.id}">${task.title}</div>
                ${descriptionHtml}
            </div>
            <div class="task-actions">
                <button class="delete-btn" data-id="${task.id}" data-permanent="true">×</button>
            </div>
            `}
        </div>`;
        }).join('');

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
        document.querySelectorAll('.task-title, .task-title-mobile').forEach(el => {
            el.replaceWith(el.cloneNode(true));
        });

        // Добавляем новые обработчики
        document.querySelectorAll('.task-title, .task-title-mobile').forEach(titleEl => {
            titleEl.addEventListener('click', (e) => {
                if (e.target.classList.contains('delete-btn')) return;

                const taskEl = titleEl.closest('.task');
                this.toggleTaskDescription(taskEl);
            });
        });
    }

    toggleTaskDescription(taskElement) {
        const spoiler = taskElement.querySelector('.task-spoiler');
        if (!spoiler) return;

        spoiler.classList.toggle('active');

        if (spoiler.classList.contains('active')) {
            spoiler.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
}

new TaskManager();