// Backend Express API utility functions

const api = {
    async get(endpoint) {
        // endpoint is usually like /products or /dashboard/metrics
        // The backend routes prefix with /api (e.g. /api/products)
        const res = await fetch(`/api${endpoint}`);
        if (!res.ok) throw new Error(`GET ${endpoint} failed: ${res.statusText}`);
        return await res.json();
    },

    async logAction(action, endpoint, details) {
        try {
            await fetch('/api/logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, target: endpoint, details })
            });
        } catch (e) {
            console.error("Failed to write audit log:", e);
        }
    },

    async post(endpoint, data) {
        const res = await fetch(`/api${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const errBody = await res.json().catch(() => ({}));
            throw new Error(errBody.error || `POST ${endpoint} failed: ${res.statusText}`);
        }
        return await res.json();
    },

    async put(endpoint, data) {
        const res = await fetch(`/api${endpoint}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const errBody = await res.json().catch(() => ({}));
            throw new Error(errBody.error || `PUT ${endpoint} failed: ${res.statusText}`);
        }
        return await res.json();
    },

    async delete(endpoint) {
        const res = await fetch(`/api${endpoint}`, {
            method: 'DELETE'
        });
        if (!res.ok) {
            const errBody = await res.json().catch(() => ({}));
            throw new Error(errBody.error || `DELETE ${endpoint} failed: ${res.statusText}`);
        }
        return await res.json();
    }
};

// Global check if logged in
window.checkAuth = () => {
    // Strictly guard protected pages synchronously using sessionStorage
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const isLoginPage = window.location.pathname.includes('login') || window.location.pathname === '/';
    
    if (!isLoggedIn && !isLoginPage) {
        window.location.replace('/login');
    }
};

// Export to window for non-module script compatibility
window.api = api;

// Initial auth check
window.checkAuth();

export default api;
