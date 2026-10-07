document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    const browseBtn = document.getElementById('browseBtn');
    const uploadArea = document.getElementById('uploadArea');
    const uploadContainer = document.getElementById('uploadContainer');
    const fileInfo = document.getElementById('fileInfo');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const resultsContainer = document.getElementById('resultsContainer');
    const statsGrid = document.getElementById('statsGrid');
    const columnsGrid = document.getElementById('columnsGrid');
    const previewTable = document.getElementById('previewTable');
    const columnsCount = document.getElementById('columnsCount');
    const previewCount = document.getElementById('previewCount');
    const downloadStatsBtn = document.getElementById('downloadStatsBtn');
    const analyzeAnotherBtn = document.getElementById('analyzeAnotherBtn');

    let csvData = [];
    let columnHeaders = [];
    let analysisResults = {};

    // Handle drag and drop events
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadContainer.style.borderColor = 'var(--accent)';
        uploadContainer.style.backgroundColor = 'rgba(72, 149, 239, 0.05)';
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadContainer.style.borderColor = 'var(--light-gray)';
        uploadContainer.style.backgroundColor = 'white';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadContainer.style.borderColor = 'var(--light-gray)';
        uploadContainer.style.backgroundColor = 'white';
        
        if (e.dataTransfer.files.length) {
            const file = e.dataTransfer.files[0];
            if (file.name.endsWith('.csv')) {
                handleFileSelection(file);
            } else {
                showFileError('Please select a CSV file');
            }
        }
    });

    // Handle click events
    browseBtn.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', () => {
        if (fileInput.files.length) {
            const file = fileInput.files[0];
            handleFileSelection(file);
        }
    });

    downloadStatsBtn.addEventListener('click', downloadStats);
    analyzeAnotherBtn.addEventListener('click', resetAnalyzer);

    function handleFileSelection(file) {
        // Validate file type
        if (!file.name.endsWith('.csv')) {
            showFileError('Please select a CSV file');
            return;
        }

        // Show file info
        fileInfo.style.display = 'block';
        fileInfo.innerHTML = `
            <strong>Selected file:</strong> ${file.name} 
            <span class="tooltip">
                <i class="fas fa-info-circle" style="margin-left: 0.5rem;"></i>
                <span class="tooltiptext">Size: ${formatFileSize(file.size)}</span>
            </span>
        `;

        // Show loading indicator
        loadingIndicator.style.display = 'block';
        uploadContainer.style.display = 'none';

        // Read and parse the CSV file
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const csvContent = e.target.result;
                parseCSV(csvContent);
            } catch (error) {
                showFileError('Error parsing CSV file');
                console.error(error);
            }
        };
        reader.readAsText(file);
    }

    function parseCSV(csvContent) {
        // Reset previous data
        csvData = [];
        columnHeaders = [];
        analysisResults = {};

        // Split into lines
        const lines = csvContent.split(/\r\n|\n/).filter(line => line.trim() !== '');

        if (lines.length === 0) {
            showFileError('CSV file is empty');
            return;
        }

        // Get headers (assuming first line is headers)
        columnHeaders = parseCSVLine(lines[0]);

        // Process data rows
        for (let i = 1; i < lines.length; i++) {
            const values = parseCSVLine(lines[i]);
            if (values.length !== columnHeaders.length) {
                // Skip rows that don't match header count (or handle differently)
                continue;
            }

            const row = {};
            columnHeaders.forEach((header, index) => {
                row[header] = values[index];
            });
            csvData.push(row);
        }

        // Analyze the data
        analyzeData();

        // Display results
        displayResults();

        // Hide loading indicator and show results
        loadingIndicator.style.display = 'none';
        resultsContainer.style.display = 'block';
    }

    function parseCSVLine(line) {
        // Simple CSV parser (note: doesn't handle all edge cases like quoted fields with commas)
        return line.split(',').map(item => item.trim());
    }

    function analyzeData() {
        // Basic stats
        analysisResults = {
            rowCount: csvData.length,
            columnCount: columnHeaders.length,
            fileSize: fileInput.files[0].size,
            fileName: fileInput.files[0].name,
            columns: {}
        };

        // Column analysis
        columnHeaders.forEach(header => {
            const columnValues = csvData.map(row => row[header]);
            const numericValues = columnValues.filter(val => !isNaN(parseFloat(val))).map(Number);
            const isNumeric = numericValues.length > 0;
            const uniqueValues = [...new Set(columnValues)].length;
            const emptyValues = columnValues.filter(val => val === '').length;

            analysisResults.columns[header] = {
                isNumeric,
                uniqueValues,
                emptyValues,
                sampleData: columnValues.slice(0, 5)
            };

            if (isNumeric) {
                analysisResults.columns[header].min = Math.min(...numericValues);
                analysisResults.columns[header].max = Math.max(...numericValues);
                analysisResults.columns[header].avg = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
            }
        });
    }

    function displayResults() {
        // Display basic stats
        statsGrid.innerHTML = `
            <div class="stat-card">
                <div class="stat-value">${analysisResults.rowCount}</div>
                <div class="stat-label">Total Rows</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${analysisResults.columnCount}</div>
                <div class="stat-label">Total Columns</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${formatFileSize(analysisResults.fileSize)}</div>
                <div class="stat-label">File Size</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${new Date().toLocaleDateString()}</div>
                <div class="stat-label">Analysis Date</div>
            </div>
        `;

        // Display column info
        columnsGrid.innerHTML = '';
        columnsCount.textContent = columnHeaders.length;

        columnHeaders.forEach(header => {
            const columnInfo = analysisResults.columns[header];
            const columnCard = document.createElement('div');
            columnCard.className = 'column-card';
            columnCard.innerHTML = `
                <div class="column-name">${header}</div>
                <div class="column-stats">
                    <div>Type: ${columnInfo.isNumeric ? 'Numeric' : 'Text'}</div>
                    <div>Unique values: ${columnInfo.uniqueValues}</div>
                    ${columnInfo.isNumeric ? `
                        <div>Min: ${columnInfo.min.toFixed(2)}</div>
                        <div>Max: ${columnInfo.max.toFixed(2)}</div>
                        <div>Avg: ${columnInfo.avg.toFixed(2)}</div>
                    ` : ''}
                    <div>Empty: ${columnInfo.emptyValues} (${((columnInfo.emptyValues / analysisResults.rowCount) * 100).toFixed(1)}%)</div>
                </div>
            `;
            columnCard.title = `Sample values: ${columnInfo.sampleData.join(', ')}`;
            columnsGrid.appendChild(columnCard);
        });

        // Display data preview (first 10 rows)
        displayDataPreview(10);
    }

    function displayDataPreview(rowCount) {
        previewTable.innerHTML = '';
        previewCount.textContent = `${Math.min(rowCount, csvData.length)} of ${csvData.length} rows`;

        // Create table header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        columnHeaders.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        previewTable.appendChild(thead);

        // Create table body
        const tbody = document.createElement('tbody');
        const displayCount = Math.min(rowCount, csvData.length);
        for (let i = 0; i < displayCount; i++) {
            const row = document.createElement('tr');
            columnHeaders.forEach(header => {
                const td = document.createElement('td');
                td.textContent = csvData[i][header] || 'NULL';
                row.appendChild(td);
            });
            tbody.appendChild(row);
        }
        previewTable.appendChild(tbody);
    }

    function downloadStats() {
        const dataStr = JSON.stringify(analysisResults, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `${analysisResults.fileName.replace('.csv', '')}_analysis.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }

    function resetAnalyzer() {
        fileInput.value = '';
        fileInfo.style.display = 'none';
        fileInfo.textContent = '';
        resultsContainer.style.display = 'none';
        uploadContainer.style.display = 'block';
        loadingIndicator.style.display = 'none';
    }

    function showFileError(message) {
        fileInfo.style.display = 'block';
        fileInfo.innerHTML = `<span style="color: var(--warning);">${message}</span>`;
        setTimeout(() => {
            fileInfo.style.display = 'none';
        }, 3000);
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
});