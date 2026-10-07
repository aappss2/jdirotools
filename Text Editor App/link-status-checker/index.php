<?php
// Simple PHP proxy for CORS requests
if (isset($_GET['proxy'])) {
    $url = $_GET['proxy'];
    
    // Validate URL
    if (!filter_var($url, FILTER_VALIDATE_URL)) {
        header('HTTP/1.1 400 Bad Request');
        exit('Invalid URL');
    }
    
    // Only allow HTTP/HTTPS protocols
    $urlParts = parse_url($url);
    if (!in_array($urlParts['scheme'], ['http', 'https'])) {
        header('HTTP/1.1 403 Forbidden');
        exit('Protocol not allowed');
    }
    
    // Set timeout
    $context = stream_context_create([
        'http' => [
            'timeout' => 5, // 5 second timeout
            'ignore_errors' => true // Get content even if HTTP error
        ]
    ]);
    
    // Fetch the content
    $content = @file_get_contents($url, false, $context);
    
    if ($content === false) {
        header('HTTP/1.1 500 Internal Server Error');
        exit('Failed to fetch URL');
    }
    
    // Get the actual response code
    $status_line = $http_response_header[0];
    preg_match('{HTTP\/\S*\s(\d{3})}', $status_line, $match);
    $status = $match[1];
    
    // Set appropriate headers
    header('Content-Type: text/plain');
    header('Access-Control-Allow-Origin: *');
    header('X-Proxy-Status: ' . $status);
    echo $content;
    exit;
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Link Status Checker</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <header>
            <h1><i class="fas fa-link"></i> Link Status Checker</h1>
            <p class="subtitle">Check the HTTP status and availability of your URLs</p>
        </header>

        <div class="input-section">
            <div class="url-input">
                <textarea id="urls" placeholder="Enter URLs to check (one per line or comma separated)" rows="5"></textarea>
                <div class="examples">
                    <span>Examples:</span>
                    <button class="example-btn" data-url="https://google.com">Google</button>
                    <button class="example-btn" data-url="https://github.com/404">GitHub 404</button>
                    <button class="example-btn" data-url="https://httpstat.us/500">Server Error</button>
                </div>
            </div>
            <div class="options">
                <div class="option-group">
                    <label><input type="checkbox" id="check-robots" checked> Check robots.txt</label>
                    <label><input type="checkbox" id="check-headers" checked> Fetch headers</label>
                    <label><input type="checkbox" id="check-redirects" checked> Follow redirects</label>
                </div>
                <button id="check-btn" class="primary-btn">
                    <i class="fas fa-spinner fa-spin hidden"></i>
                    <span class="btn-text">Check URLs</span>
                </button>
            </div>
        </div>

        <div class="results-section hidden">
            <div class="results-header">
                <h2>Results</h2>
                <div class="summary">
                    <span class="total"><i class="fas fa-link"></i> <span id="total-count">0</span> URLs</span>
                    <span class="success"><i class="fas fa-check-circle"></i> <span id="success-count">0</span> Success</span>
                    <span class="warning"><i class="fas fa-exclamation-triangle"></i> <span id="warning-count">0</span> Warnings</span>
                    <span class="error"><i class="fas fa-times-circle"></i> <span id="error-count">0</span> Errors</span>
                </div>
                <button id="export-btn" class="secondary-btn">
                    <i class="fas fa-download"></i> Export
                </button>
            </div>

            <div class="results-container">
                <div class="result-filters">
                    <div class="filter-group">
                        <button class="filter-btn active" data-filter="all">All</button>
                        <button class="filter-btn" data-filter="success">Success (2xx)</button>
                        <button class="filter-btn" data-filter="redirect">Redirect (3xx)</button>
                        <button class="filter-btn" data-filter="client-error">Client Error (4xx)</button>
                        <button class="filter-btn" data-filter="server-error">Server Error (5xx)</button>
                    </div>
                    <div class="search-box">
                        <i class="fas fa-search"></i>
                        <input type="text" id="result-search" placeholder="Search results...">
                    </div>
                </div>

                <div id="results-table">
                    <div class="table-header">
                        <div class="col status">Status</div>
                        <div class="col url">URL</div>
                        <div class="col response">Response</div>
                        <div class="col time">Time</div>
                        <div class="col actions">Actions</div>
                    </div>
                    <div id="results-list" class="table-body">
                        <!-- Results will be inserted here -->
                    </div>
                </div>
            </div>
        </div>

        <div class="details-modal hidden">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>URL Details</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="detail-row">
                        <span class="detail-label">URL:</span>
                        <span class="detail-value" id="detail-url"></span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Status:</span>
                        <span class="detail-value" id="detail-status"></span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Response Time:</span>
                        <span class="detail-value" id="detail-time"></span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Final URL:</span>
                        <span class="detail-value" id="detail-final-url"></span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Allowed in robots.txt:</span>
                        <span class="detail-value" id="detail-robots"></span>
                    </div>
                    <div class="detail-row full-width">
                        <span class="detail-label">Headers:</span>
                        <pre class="detail-value" id="detail-headers"></pre>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="script.js"></script>
</body>
</html>