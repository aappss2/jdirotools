document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const urlsTextarea = document.getElementById('urls');
    const checkBtn = document.getElementById('check-btn');
    const checkRobots = document.getElementById('check-robots');
    const checkHeaders = document.getElementById('check-headers');
    const checkRedirects = document.getElementById('check-redirects');
    const resultsSection = document.querySelector('.results-section');
    const resultsList = document.getElementById('results-list');
    const totalCount = document.getElementById('total-count');
    const successCount = document.getElementById('success-count');
    const warningCount = document.getElementById('warning-count');
    const errorCount = document.getElementById('error-count');
    const exportBtn = document.getElementById('export-btn');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const resultSearch = document.getElementById('result-search');
    const detailsModal = document.querySelector('.details-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    const exampleBtns = document.querySelectorAll('.example-btn');
    
    // Variables
    let results = [];
    let filteredResults = [];
    
    // Event Listeners
    checkBtn.addEventListener('click', checkUrls);
    exportBtn.addEventListener('click', exportResults);
    closeModalBtn.addEventListener('click', closeModal);
    resultSearch.addEventListener('input', filterResults);
    detailsModal.addEventListener('click', function(e) {
        if (e.target === detailsModal) {
            closeModal();
        }
    });
    
    // Example buttons
    exampleBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const url = this.getAttribute('data-url');
            if (urlsTextarea.value.trim() === '') {
                urlsTextarea.value = url;
            } else {
                urlsTextarea.value += '\n' + url;
            }
        });
    });
    
    // Filter buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filterResults();
        });
    });
    
    // Functions
    async function checkUrls() {
        const urlsText = urlsTextarea.value.trim();
        if (!urlsText) {
            alert('Please enter at least one URL');
            return;
        }
        
        // Parse URLs
        let urls = [];
        if (urlsText.includes('\n')) {
            urls = urlsText.split('\n').map(url => url.trim()).filter(url => url);
        } else if (urlsText.includes(',')) {
            urls = urlsText.split(',').map(url => url.trim()).filter(url => url);
        } else {
            urls = [urlsText.trim()];
        }
        
        // Validate URLs
        urls = urls.map(url => {
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                return 'https://' + url;
            }
            return url;
        });
        
        // Show loading state
        const spinner = checkBtn.querySelector('.fa-spinner');
        const btnText = checkBtn.querySelector('.btn-text');
        spinner.classList.remove('hidden');
        btnText.textContent = 'Checking...';
        checkBtn.disabled = true;
        
        // Clear previous results
        results = [];
        resultsList.innerHTML = '';
        
        // Check each URL
        for (const url of urls) {
            try {
                const result = await checkUrl(url);
                results.push(result);
                addResultToTable(result);
                updateSummary();
            } catch (error) {
                console.error('Error checking URL:', url, error);
                const errorResult = {
                    url,
                    status: 'Error',
                    statusCode: 0,
                    responseTime: 0,
                    finalUrl: url,
                    allowedInRobots: false,
                    headers: {},
                    error: error.message
                };
                results.push(errorResult);
                addResultToTable(errorResult);
                updateSummary();
            }
        }
        
        // Hide loading state
        spinner.classList.add('hidden');
        btnText.textContent = 'Check URLs';
        checkBtn.disabled = false;
        
        // Show results section
        resultsSection.classList.remove('hidden');
    }
    
    async function checkUrl(url) {
        const startTime = performance.now();
        
        try {
            // Check robots.txt if enabled
            let allowedInRobots = true;
            if (checkRobots.checked) {
                allowedInRobots = await checkRobotsTxt(url);
            }
            
            // Use our PHP proxy to check the URL
            const proxyUrl = `?proxy=${encodeURIComponent(url)}`;
            const response = await fetch(proxyUrl);
            const endTime = performance.now();
            const responseTime = Math.round(endTime - startTime);
            
            // Get the status code from our proxy
            const status = response.headers.get('X-Proxy-Status') || 200;
            const statusCode = parseInt(status);
            
            // Get headers if enabled
            let headers = {};
            if (checkHeaders.checked) {
                // With our proxy, we can't get full headers, but we can get the status
                headers = {
                    'Status': statusCode + ' ' + getStatusText(statusCode),
                    'X-Proxy-Status': status
                };
            }
            
            return {
                url,
                status: getStatusText(statusCode),
                statusCode,
                responseTime,
                finalUrl: url, // Our simple proxy doesn't follow redirects
                allowedInRobots,
                headers,
                error: null
            };
        } catch (error) {
            const endTime = performance.now();
            const responseTime = Math.round(endTime - startTime);
            
            return {
                url,
                status: 'Error',
                statusCode: 0,
                responseTime,
                finalUrl: url,
                allowedInRobots: false,
                headers: {},
                error: error.message
            };
        }
    }
    
    async function checkRobotsTxt(url) {
        try {
            const urlObj = new URL(url);
            const robotsUrl = `${urlObj.protocol}//${urlObj.hostname}/robots.txt`;
            
            // Use our PHP proxy
            const response = await fetch(`?proxy=${encodeURIComponent(robotsUrl)}`);
            
            if (!response.ok) {
                // If robots.txt doesn't exist, assume all paths are allowed
                return true;
            }
            
            const robotsText = await response.text();
            const userAgent = '*';
            const path = urlObj.pathname + urlObj.search;
            
            // Simple robots.txt parser (not comprehensive)
            const lines = robotsText.split('\n');
            let currentUserAgent = '';
            let isAllowed = true;
            
            for (const line of lines) {
                const trimmedLine = line.trim();
                if (!trimmedLine || trimmedLine.startsWith('#')) continue;
                
                const [directive, value] = trimmedLine.split(':').map(part => part.trim());
                if (!directive || !value) continue;
                
                if (directive.toLowerCase() === 'user-agent') {
                    currentUserAgent = value;
                } else if (currentUserAgent === userAgent || currentUserAgent === '*') {
                    if (directive.toLowerCase() === 'disallow' && value === '/') {
                        isAllowed = false;
                    } else if (directive.toLowerCase() === 'disallow' && path.startsWith(value)) {
                        isAllowed = false;
                    } else if (directive.toLowerCase() === 'allow' && path.startsWith(value)) {
                        isAllowed = true;
                    }
                }
            }
            
            return isAllowed;
        } catch (error) {
            console.error('Error checking robots.txt:', error);
            return true; // Assume allowed if there's an error
        }
    }
    
    function getStatusText(statusCode) {
        if (statusCode >= 200 && statusCode < 300) return 'Success';
        if (statusCode >= 300 && statusCode < 400) return 'Redirect';
        if (statusCode >= 400 && statusCode < 500) return 'Client Error';
        if (statusCode >= 500) return 'Server Error';
        return 'Unknown';
    }
    
    function addResultToTable(result) {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        
        // Determine status class
        let statusClass = '';
        if (result.statusCode >= 200 && result.statusCode < 300) {
            statusClass = 'status-2xx';
        } else if (result.statusCode >= 300 && result.statusCode < 400) {
            statusClass = 'status-3xx';
        } else if (result.statusCode >= 400 && result.statusCode < 500) {
            statusClass = 'status-4xx';
        } else if (result.statusCode >= 500) {
            statusClass = 'status-5xx';
        }
        
        // Status code
        const statusBadge = document.createElement('div');
        statusBadge.className = `col status ${statusClass}`;
        statusBadge.innerHTML = result.statusCode ? 
            `<span class="status-badge ${statusClass}">${result.statusCode}</span>` : 
            '<span class="status-badge status-4xx">Error</span>';
        
        // URL
        const urlCol = document.createElement('div');
        urlCol.className = 'col url';
        urlCol.innerHTML = `<span class="url-text">${result.url}</span>`;
        
        // Response
        const responseCol = document.createElement('div');
        responseCol.className = 'col response';
        responseCol.innerHTML = result.error ? 
            `<span class="response-text">${result.error}</span>` : 
            `<span class="response-text">${result.status}</span>`;
        
        // Time
        const timeCol = document.createElement('div');
        timeCol.className = 'col time';
        timeCol.innerHTML = `<span class="time-text">${result.responseTime}ms</span>`;
        
        // Actions
        const actionsCol = document.createElement('div');
        actionsCol.className = 'col actions';
        actionsCol.innerHTML = `
            <button class="action-btn view-details" data-url="${result.url}">
                <i class="fas fa-info-circle"></i> Details
            </button>
        `;
        
        // Append all columns
        resultItem.appendChild(statusBadge);
        resultItem.appendChild(urlCol);
        resultItem.appendChild(responseCol);
        resultItem.appendChild(timeCol);
        resultItem.appendChild(actionsCol);
        
        resultsList.appendChild(resultItem);
        
        // Add event listener to details button
        resultItem.querySelector('.view-details').addEventListener('click', () => {
            showDetails(result);
        });
    }
    
    function updateSummary() {
        totalCount.textContent = results.length;
        successCount.textContent = results.filter(r => r.statusCode >= 200 && r.statusCode < 300).length;
        warningCount.textContent = results.filter(r => r.statusCode >= 300 && r.statusCode < 400).length;
        errorCount.textContent = results.filter(r => r.statusCode >= 400 || r.statusCode === 0).length;
    }
    
    function filterResults() {
        const searchTerm = resultSearch.value.toLowerCase();
        const activeFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter');
        
        filteredResults = results.filter(result => {
            // Apply filter
            let filterMatch = true;
            if (activeFilter === 'success') {
                filterMatch = result.statusCode >= 200 && result.statusCode < 300;
            } else if (activeFilter === 'redirect') {
                filterMatch = result.statusCode >= 300 && result.statusCode < 400;
            } else if (activeFilter === 'client-error') {
                filterMatch = result.statusCode >= 400 && result.statusCode < 500;
            } else if (activeFilter === 'server-error') {
                filterMatch = result.statusCode >= 500;
            }
            
            // Apply search
            const searchMatch = result.url.toLowerCase().includes(searchTerm) || 
                             (result.status && result.status.toLowerCase().includes(searchTerm)) ||
                             (result.error && result.error.toLowerCase().includes(searchTerm));
            
            return filterMatch && searchMatch;
        });
        
        // Update table
        resultsList.innerHTML = '';
        filteredResults.forEach(result => addResultToTable(result));
    }
    
    function showDetails(result) {
        document.getElementById('detail-url').textContent = result.url;
        document.getElementById('detail-status').textContent = `${result.statusCode} ${result.status}`;
        document.getElementById('detail-time').textContent = `${result.responseTime} ms`;
        document.getElementById('detail-final-url').textContent = result.finalUrl;
        document.getElementById('detail-robots').textContent = result.allowedInRobots ? 'Yes' : 'No';
        
        // Format headers
        let headersText = '';
        if (result.headers && Object.keys(result.headers).length > 0) {
            for (const [key, value] of Object.entries(result.headers)) {
                headersText += `${key}: ${value}\n`;
            }
        } else {
            headersText = 'No headers available';
        }
        document.getElementById('detail-headers').textContent = headersText;
        
        // Show modal
        detailsModal.classList.add('active');
    }
    
    function closeModal() {
        detailsModal.classList.remove('active');
    }
    
    function exportResults() {
        if (results.length === 0) {
            alert('No results to export');
            return;
        }
        
        // Prepare CSV content
        let csvContent = 'URL,Status,Status Code,Response Time (ms),Final URL,Allowed in robots.txt\n';
        
        results.forEach(result => {
            csvContent += `"${result.url}",` +
                         `"${result.status}",` +
                         `"${result.statusCode}",` +
                         `"${result.responseTime}",` +
                         `"${result.finalUrl}",` +
                         `"${result.allowedInRobots ? 'Yes' : 'No'}"\n`;
        });
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'link-status-results.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
});