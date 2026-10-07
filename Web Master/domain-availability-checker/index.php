<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Domain Availability Checker</title>
    <link rel="stylesheet" href="style.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body>
    <div class="container">
        <header class="header">
            <h1><i class="fas fa-globe"></i> Domain Availability Checker</h1>
            <p>Check domain availability across multiple TLDs instantly</p>
        </header>

        <div class="search-section">
            <div class="search-box">
                <input type="text" id="domainInput" placeholder="Enter domain name (without extension)" autocomplete="off">
                <button id="checkButton">
                    <i class="fas fa-search"></i> Check Availability
                </button>
            </div>
            
            <div class="tld-selection">
                <h3>Popular TLDs</h3>
                <div class="tld-grid" id="tldGrid">
                    <!-- TLD buttons will be populated by JavaScript -->
                </div>
            </div>

            <div class="suggestions">
                <h3>Quick Suggestions</h3>
                <div class="suggestion-tags" id="suggestionTags">
                    <!-- Suggestions will be populated by JavaScript -->
                </div>
            </div>
        </div>

        <div class="results-section" id="resultsSection" style="display: none;">
            <div class="results-header">
                <h2>Domain Results</h2>
                <div class="results-actions">
                    <button id="exportBtn" class="btn-secondary">
                        <i class="fas fa-download"></i> Export Results
                    </button>
                    <button id="clearBtn" class="btn-secondary">
                        <i class="fas fa-trash"></i> Clear Results
                    </button>
                </div>
            </div>
            <div class="results-grid" id="resultsGrid">
                <!-- Results will be populated by JavaScript -->
            </div>
        </div>

        <div class="loading" id="loading" style="display: none;">
            <div class="spinner"></div>
            <p>Checking domain availability...</p>
        </div>
    </div>

    <script src="script.js"></script>
</body>
</html>