const TaskTemplates = {
    taskElement(task, isMobile, isArchive = false) {
        const description = this.processDescription(task.description);
        const descriptionHtml = description ? `
            <div class="task-spoiler">
                <div class="task-content">${description}</div>
            </div>` : '';

        return `
            <div class="task" data-id="${task.id}">
                ${isMobile ? this.mobileTaskHtml(task, descriptionHtml, isArchive)
                : this.desktopTaskHtml(task, descriptionHtml, isArchive)}
            </div>`;
    },

    mobileTaskHtml(task, descriptionHtml, isArchive) {
        return `
            <div class="task-header-mobile">
                <div class="task-number-wrapper">
                    <div class="task-number">#${task.id}</div>
                    ${this.copyButton(task.id)}
                </div>
                <div class="task-title-mobile">${task.title}</div>
                <div class="task-actions">
                    ${!isArchive ? this.editButton(task.id) : ''}
                    ${this.deleteButton(task.id, isArchive)}
                </div>
            </div>
            ${descriptionHtml}`;
    },

    desktopTaskHtml(task, descriptionHtml, isArchive) {
        return `
            <div class="task-number-wrapper">
                <div class="task-number">#${task.id}</div>
                ${this.copyButton(task.id)}
            </div>
            <div class="task-content-wrapper">
                <div class="task-title">${task.title}</div>
                ${descriptionHtml}
            </div>
            <div class="task-actions">
                ${!isArchive ? this.editButton(task.id) : ''}
                ${this.deleteButton(task.id, isArchive)}
            </div>`;
    },

    deleteButton(id, isArchive) {
        return `<button class="delete-btn" data-id="${id}" data-permanent="${isArchive}"> × </button>`;
    },

    editButton(id) {
        return `<button class="edit-btn" data-id="${id}" title="Редактировать">✎</button>`;
    },

    copyButton(id) {
        return `<button class="copy-btn" data-id="${id}" title="Копировать задачу">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                </button>`;
    },

    processDescription(description) {
        if (!description) return '';
        return description
            .replace(
                /(https?:\/\/[^\s]+)/g,
                '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
            )
            .split('\n')
            .map(paragraph => `<p>${paragraph}</p>`)
            .join('');
    },

    editInputHtml(taskId) {
        return `
            <div class="edit-container">
                <textarea 
                        class="edit-textarea autogrow-textarea" 
                        placeholder="Введите дополнение к описанию"
                        autocomplete="off"
                        rows="1"
                        data-lpignore="true"
                ></textarea>
                <div class="edit-buttons">
                    <button class="cancel-edit-btn">Отмена</button>
                    <button class="save-edit-btn" data-id="${taskId}">Сохранить</button>
                </div>
            </div>
        `;
    }
};

export default TaskTemplates;