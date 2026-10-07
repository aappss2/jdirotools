document.addEventListener('DOMContentLoaded', function() {
    // Copy raw meta data to clipboard
    const copyRawBtn = document.getElementById('copyRaw');
    if (copyRawBtn) {
        copyRawBtn.addEventListener('click', function() {
            const rawMeta = document.getElementById('rawMeta').textContent;
            navigator.clipboard.writeText(rawMeta).then(() => {
                showToast('Meta data copied to clipboard!');
            }).catch(err => {
                showToast('Failed to copy: ' + err, 'error');
            });
        });
    }
    
    // Form submission with loading indicator
    const metaForm = document.getElementById('metaForm');
    if (metaForm) {
        metaForm.addEventListener('submit', function(e) {
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            // Show loading indicator
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Extracting...';
            submitBtn.disabled = true;
            
            // Re-enable button after form submission is complete
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 1000);
        });
    }
    
    // Auto-focus URL input on page load
    const urlInput = document.getElementById('url');
    if (urlInput) {
        urlInput.focus();
    }
});

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = '';
    
    // Set background color based on type
    switch(type) {
        case 'error':
            toast.style.backgroundColor = 'var(--error-color)';
            break;
        case 'warning':
            toast.style.backgroundColor = 'var(--warning-color)';
            break;
        default:
            toast.style.backgroundColor = 'var(--success-color)';
    }
    
    toast.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}