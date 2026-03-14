document.addEventListener('DOMContentLoaded', async () => {
    try {
        const config = await api.get('/settings');
        
        // Populate form
        document.getElementById('sysName').value = config.systemName || '';
        document.getElementById('lowStockThreshold').value = config.lowStockThreshold || 10;
        document.getElementById('adminEmail').value = config.adminEmail || '';
        document.getElementById('emailNotif').checked = config.emailNotificationsActive;
        
    } catch (error) {
        console.error('Error loading settings', error);
    }
});

document.getElementById('settingsForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const btn = document.getElementById('saveSettingsBtn');
    const originalText = btn.textContent;
    btn.textContent = 'SYNCHRONIZING...';
    btn.disabled = true;

    const data = {
        systemName: document.getElementById('sysName').value,
        lowStockThreshold: document.getElementById('lowStockThreshold').value,
        adminEmail: document.getElementById('adminEmail').value,
        emailNotificationsActive: document.getElementById('emailNotif').checked
    };

    try {
        await api.put('/settings', data);
        
        // Show success
        document.getElementById('settingsError').classList.add('d-none');
        document.getElementById('settingsSuccess').classList.remove('d-none');
        
        setTimeout(() => {
            document.getElementById('settingsSuccess').classList.add('d-none');
            // If name changed, we could prompt a reload here ideally
            if(data.systemName) {
                document.querySelectorAll('.sidebar-logo').forEach(el => el.textContent = data.systemName);
            }
        }, 3000);
        
    } catch (error) {
        document.getElementById('settingsSuccess').classList.add('d-none');
        const errAlert = document.getElementById('settingsError');
        errAlert.textContent = error.message.error || 'Failed to synchronize settings.';
        errAlert.classList.remove('d-none');
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
});
