/**
 * Inventrix Real-time Notification System
 * Handles toast alerts and live stock telemetry
 */

const notifications = {
    show(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toastId = 'toast-' + Date.now();
        const icon = type === 'warning' ? 'bi-exclamation-triangle' : 'bi-info-circle';
        const colorClass = type === 'warning' ? 'text-warning' : 'text-info';

        const toastHTML = `
            <div id="${toastId}" class="toast bg-dark text-white border-secondary mb-2" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="toast-header bg-dark text-white border-bottom border-secondary py-2">
                    <i class="bi ${icon} ${colorClass} me-2"></i>
                    <strong class="me-auto">INVENTRIX_SYSTEM</strong>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close" onclick="this.parentElement.parentElement.remove()"></button>
                </div>
                <div class="toast-body py-3">
                    ${message}
                </div>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', toastHTML);
        const toastEl = document.getElementById(toastId);
        
        // Simple auto-hide after 5 seconds
        setTimeout(() => {
            if (toastEl) {
                toastEl.classList.add('fade');
                setTimeout(() => toastEl.remove(), 500);
            }
        }, 5000);
    }
};

window.notifications = notifications;
