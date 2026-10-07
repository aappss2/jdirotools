class DomainCheckerApp {
    constructor() {
        this.selectedTLDs = new Set(['com', 'net', 'org']);
        this.currentResults = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.populateTLDGrid();
        this.populateSuggestions();
    }

    bindEvents() {
        document.getElementById('checkButton').addEventListener('click', () => this.checkDomains());
        document.getElementById('domainInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.checkDomains();
        });
        document.getElementById('exportBtn').addEventListener('click', () => this.exportResults());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearResults());
    }

    populateTLDGrid() {
        const popularTLDs = [
            'com', 'net', 'org', 'io', 'co', 'info', 'biz', 'me', 'us', 'ca',
            'uk', 'de', 'fr', 'it', 'es', 'nl', 'au', 'in', 'jp', 'cn'
        ];
        
        const tldGrid = document.getElementById('tldGrid');
        tldGrid.innerHTML = '';

        popularTLDs.forEach(tld => {
            const button = document.createElement('button');
            button.className = `tld-btn ${this.selectedTLDs.has(tld) ? 'selected' : ''}`;
            button.textContent = `.${tld}`;
            button.addEventListener('click', () => this.toggleTLD(tld, button));
            tldGrid.appendChild(button);
        });
    }

    populateSuggestions() {
        const suggestions = [
            'business', 'shop', 'store', 'online', 'tech', 'app', 'blog', 
            'news', 'media', 'hub', 'network', 'global', 'digital'
        ];
        
        const suggestionTags = document.getElementById('suggestionTags');
        suggestionTags.innerHTML = '';

        suggestions.forEach(suggestion => {
            const tag = document.createElement('span');
            tag.className = 'suggestion-tag';
            tag.textContent = suggestion;
            tag.addEventListener('click', () => {
                document.getElementById('domainInput').value = suggestion;
                this.checkDomains();
            });
            suggestionTags.appendChild(tag);
        });
    }

    toggleTLD(tld, button) {
        if (this.selectedTLDs.has(tld)) {
            this.selectedTLDs.delete(tld);
            button.classList.remove('selected');
        } else {
            this.selectedTLDs.add(tld);
            button.classList.add('selected');
        }
    }

    async checkDomains() {
        const domainInput = document.getElementById('domainInput');
        const domain = domainInput.value.trim();
        
        if (!domain) {
            alert('Please enter a domain name');
            return;
        }

        if (this.selectedTLDs.size === 0) {
            alert('Please select at least one TLD');
            return;
        }

        this.showLoading(true);
        
        try {
            const response = await fetch('check.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'check_domains',
                    domain: domain,
                    tlds: Array.from(this.selectedTLDs)
                })
            });

            const data = await response.json();
            
            if (data.success) {
                this.displayResults(data.results);
                this.currentResults = data.results;
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Error checking domains:', error);
            alert('Error checking domains. Please try again.');
        } finally {
            this.showLoading(false);
        }
    }

    displayResults(results) {
        const resultsSection = document.getElementById('resultsSection');
        const resultsGrid = document.getElementById('resultsGrid');
        
        resultsSection.style.display = 'block';
        resultsGrid.innerHTML = '';

        results.forEach(result => {
            const resultElement = this.createResultElement(result);
            resultsGrid.appendChild(resultElement);
        });

        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    createResultElement(result) {
        const div = document.createElement('div');
        div.className = `domain-result ${result.available ? 'available' : 'taken'}`;
        
        const statusClass = result.available ? 'status-available' : 'status-taken';
        const statusText = result.available ? 'Available' : 'Taken';
        
        div.innerHTML = `
            <div class="domain-info">
                <span class="domain-name">${result.domain}</span>
                <span class="domain-status ${statusClass}">${statusText}</span>
            </div>
            <div class="domain-actions">
                ${result.available ? 
                    `<button class="btn-register" onclick="app.registerDomain('${result.domain}')">
                        <i class="fas fa-shopping-cart"></i> Register
                    </button>` : 
                    `<button class="btn-whois" onclick="app.toggleWhois('${result.domain}')">
                        <i class="fas fa-info-circle"></i> WHOIS
                    </button>`
                }
            </div>
        `;

        return div;
    }

    toggleWhois(domain) {
        const whoisElement = document.querySelector(`[data-whois="${domain}"]`);
        
        if (whoisElement) {
            whoisElement.remove();
            return;
        }

        const result = this.currentResults.find(r => r.domain === domain);
        if (!result || !result.whois) return;

        const whoisDiv = document.createElement('div');
        whoisDiv.className = 'whois-info';
        whoisDiv.setAttribute('data-whois', domain);
        whoisDiv.innerHTML = `
            <h4>WHOIS Information for ${domain}</h4>
            <div class="whois-details">
                <div><strong>Registrar:</strong> ${result.whois.registrar}</div>
                <div><strong>Created:</strong> ${result.whois.created_date}</div>
                <div><strong>Expires:</strong> ${result.whois.expiry_date}</div>
                <div><strong>Name Servers:</strong> ${result.whois.name_servers.join(', ')}</div>
            </div>
        `;

        const domainElement = document.querySelector(`.domain-name:contains("${domain}")`).closest('.domain-result');
        domainElement.appendChild(whoisDiv);
    }

    registerDomain(domain) {
        // In a real application, this would redirect to a domain registrar
        alert(`Redirecting to register: ${domain}\n\nThis would typically redirect to a domain registrar like GoDaddy, Namecheap, etc.`);
        
        // Example integration:
        // window.open(`https://www.godaddy.com/domains/searchresults.aspx?checkAvail=1&domainToCheck=${domain}`, '_blank');
    }

    exportResults() {
        if (this.currentResults.length === 0) {
            alert('No results to export');
            return;
        }

        const csvContent = this.convertToCSV(this.currentResults);
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'domain-checker-results.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    }

    convertToCSV(results) {
        const headers = ['Domain', 'Status', 'TLD'];
        const csvRows = [headers.join(',')];
        
        results.forEach(result => {
            const row = [
                result.domain,
                result.available ? 'Available' : 'Taken',
                result.tld
            ];
            csvRows.push(row.join(','));
        });
        
        return csvRows.join('\n');
    }

    clearResults() {
        this.currentResults = [];
        document.getElementById('resultsSection').style.display = 'none';
        document.getElementById('resultsGrid').innerHTML = '';
    }

    showLoading(show) {
        const loading = document.getElementById('loading');
        const checkButton = document.getElementById('checkButton');
        
        if (show) {
            loading.style.display = 'block';
            checkButton.disabled = true;
            checkButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...';
        } else {
            loading.style.display = 'none';
            checkButton.disabled = false;
            checkButton.innerHTML = '<i class="fas fa-search"></i> Check Availability';
        }
    }
}

// Initialize the app when the page loads
const app = new DomainCheckerApp();

// Add contains polyfill for older browsers
if (!String.prototype.contains) {
    String.prototype.contains = function() {
        return String.prototype.indexOf.apply(this, arguments) !== -1;
    };
}