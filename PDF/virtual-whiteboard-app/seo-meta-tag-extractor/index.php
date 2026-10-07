<?php
// Function to fetch meta tags from a URL
function fetchMetaTags($url) {
    if (!filter_var($url, FILTER_VALIDATE_URL)) {
        return ['error' => 'Invalid URL format'];
    }

    $headers = get_headers($url, 1);
    if (strpos($headers[0], '200') === false) {
        return ['error' => 'URL not reachable'];
    }

    $html = @file_get_contents($url);
    if ($html === false) {
        return ['error' => 'Failed to fetch content'];
    }

    $doc = new DOMDocument();
    @$doc->loadHTML($html);
    
    $metaTags = [];
    $metaTags['title'] = $doc->getElementsByTagName('title')->item(0)->nodeValue ?? '';
    
    $metas = $doc->getElementsByTagName('meta');
    foreach ($metas as $meta) {
        $name = $meta->getAttribute('name') ?: $meta->getAttribute('property');
        if ($name) {
            $metaTags[strtolower($name)] = $meta->getAttribute('content');
        }
    }
    
    // Get all links (for favicon, canonical, etc.)
    $links = $doc->getElementsByTagName('link');
    foreach ($links as $link) {
        $rel = $link->getAttribute('rel');
        if ($rel) {
            $metaTags['link_' . $rel] = $link->getAttribute('href');
        }
    }
    
    // Get h1 tags count
    $h1s = $doc->getElementsByTagName('h1');
    $metaTags['h1_count'] = $h1s->length;
    $h1Contents = [];
    foreach ($h1s as $h1) {
        $h1Contents[] = $h1->nodeValue;
    }
    $metaTags['h1_contents'] = $h1Contents;
    
    // Get images count
    $imgs = $doc->getElementsByTagName('img');
    $metaTags['img_count'] = $imgs->length;
    
    return $metaTags;
}

// Process form submission
$metaData = [];
$url = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['url'])) {
    $url = trim($_POST['url']);
    if (!empty($url)) {
        // Add http:// if not present
        if (!preg_match("~^(?:f|ht)tps?://~i", $url)) {
            $url = "http://" . $url;
        }
        $metaData = fetchMetaTags($url);
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SEO Meta Tag Extractor</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <header>
            <h1><i class="fas fa-search"></i> SEO Meta Tag Extractor</h1>
            <p>Extract and analyze meta tags from any website URL</p>
        </header>
        
        <div class="search-box">
            <form id="metaForm" method="POST">
                <div class="input-group">
                    <input type="url" name="url" id="url" placeholder="Enter website URL (e.g., https://example.com)" 
                           value="<?php echo htmlspecialchars($url); ?>" required>
                    <button type="submit"><i class="fas fa-search"></i> Extract</button>
                </div>
            </form>
        </div>
        
        <?php if (!empty($metaData)): ?>
            <?php if (isset($metaData['error'])): ?>
                <div class="error-box">
                    <p><i class="fas fa-exclamation-circle"></i> <?php echo $metaData['error']; ?></p>
                </div>
            <?php else: ?>
                <div class="results-container">
                    <div class="url-display">
                        <h3><i class="fas fa-link"></i> Analyzing: <span><?php echo htmlspecialchars($url); ?></span></h3>
                    </div>
                    
                    <div class="results-grid">
                        <!-- Basic Info Card -->
                        <div class="result-card">
                            <div class="card-header">
                                <i class="fas fa-info-circle"></i> Basic Information
                            </div>
                            <div class="card-body">
                                <div class="meta-row">
                                    <span class="meta-label">Page Title:</span>
                                    <span class="meta-value"><?php echo htmlspecialchars($metaData['title'] ?? 'Not found'); ?></span>
                                </div>
                                <div class="meta-row">
                                    <span class="meta-label">H1 Tags:</span>
                                    <span class="meta-value"><?php echo $metaData['h1_count']; ?> found</span>
                                </div>
                                <div class="meta-row">
                                    <span class="meta-label">Images:</span>
                                    <span class="meta-value"><?php echo $metaData['img_count']; ?> found</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- SEO Meta Card -->
                        <div class="result-card">
                            <div class="card-header">
                                <i class="fas fa-search"></i> SEO Meta Tags
                            </div>
                            <div class="card-body">
                                <?php 
                                $seoTags = [
                                    'description' => 'Description',
                                    'keywords' => 'Keywords',
                                    'og:title' => 'OG Title',
                                    'og:description' => 'OG Description',
                                    'og:image' => 'OG Image',
                                    'twitter:title' => 'Twitter Title',
                                    'twitter:description' => 'Twitter Description',
                                    'twitter:image' => 'Twitter Image'
                                ];
                                
                                foreach ($seoTags as $tag => $label): 
                                    if (isset($metaData[$tag])): ?>
                                        <div class="meta-row">
                                            <span class="meta-label"><?php echo $label; ?>:</span>
                                            <span class="meta-value"><?php echo htmlspecialchars($metaData[$tag]); ?></span>
                                        </div>
                                    <?php endif; 
                                endforeach; ?>
                            </div>
                        </div>
                        
                        <!-- Links Card -->
                        <div class="result-card">
                            <div class="card-header">
                                <i class="fas fa-external-link-alt"></i> Important Links
                            </div>
                            <div class="card-body">
                                <?php 
                                $linkTags = [
                                    'link_canonical' => 'Canonical URL',
                                    'link_icon' => 'Favicon',
                                    'link_apple-touch-icon' => 'Apple Touch Icon'
                                ];
                                
                                foreach ($linkTags as $tag => $label): 
                                    if (isset($metaData[$tag])): ?>
                                        <div class="meta-row">
                                            <span class="meta-label"><?php echo $label; ?>:</span>
                                            <span class="meta-value">
                                                <?php if (strpos($tag, 'icon') !== false): ?>
                                                    <a href="<?php echo htmlspecialchars($metaData[$tag]); ?>" target="_blank">
                                                        <img src="<?php echo htmlspecialchars($metaData[$tag]); ?>" class="icon-preview" alt="Icon">
                                                    </a>
                                                <?php else: ?>
                                                    <a href="<?php echo htmlspecialchars($metaData[$tag]); ?>" target="_blank">
                                                        <?php echo htmlspecialchars($metaData[$tag]); ?>
                                                    </a>
                                                <?php endif; ?>
                                            </span>
                                        </div>
                                    <?php endif; 
                                endforeach; ?>
                            </div>
                        </div>
                        
                        <!-- H1 Contents Card -->
                        <?php if (!empty($metaData['h1_contents'])): ?>
                        <div class="result-card full-width">
                            <div class="card-header">
                                <i class="fas fa-heading"></i> H1 Contents
                            </div>
                            <div class="card-body">
                                <ul class="h1-list">
                                    <?php foreach ($metaData['h1_contents'] as $h1): ?>
                                        <li><?php echo htmlspecialchars($h1); ?></li>
                                    <?php endforeach; ?>
                                </ul>
                            </div>
                        </div>
                        <?php endif; ?>
                        
                        <!-- Raw Meta Tags Card -->
                        <div class="result-card full-width">
                            <div class="card-header">
                                <i class="fas fa-code"></i> All Meta Tags
                                <button id="copyRaw" class="copy-btn"><i class="far fa-copy"></i> Copy</button>
                            </div>
                            <div class="card-body">
                                <pre id="rawMeta"><?php echo htmlspecialchars(json_encode($metaData, JSON_PRETTY_PRINT)); ?></pre>
                            </div>
                        </div>
                    </div>
                </div>
            <?php endif; ?>
        <?php endif; ?>
        
        <footer>
            <p>SEO Meta Tag Extractor &copy; <?php echo date('Y'); ?></p>
            <p class="credits">Extract meta tags, Open Graph, Twitter Cards, and more</p>
        </footer>
    </div>
    
    <div id="toast"></div>
    h1>Free SEO Meta Tag Extractor – Analyze Any Webpage Instantly</h1>

    <p>Our <strong>SEO Meta Tag Extractor Tool</strong> allows you to quickly extract and analyze all the important SEO meta tags from any website. Whether you are an SEO professional, digital marketer, or web developer, this tool helps you understand how a site is optimized for search engines.</p>

    <h2>What is a Meta Tag Extractor?</h2>
    <p>A meta tag extractor is a tool that scans a webpage and retrieves meta information such as the page title, meta description, meta keywords, and other SEO-related data. These tags play a crucial role in how search engines interpret and rank your content.</p>

    <h2>Key Features of Our SEO Meta Tag Extractor</h2>
    <ul>
        <li><strong>Free & Instant:</strong> Extract meta tags from any webpage in seconds.</li>
            <li><strong>Detailed Analysis:</strong> Get title, description, keywords, viewport, and more.</li>
                <li><strong>SEO Insights:</strong> Identify missing or poorly optimized tags.</li>
                    <li><strong>Works with Any URL:</strong> Just enter a link and get results.</li>
                    </ul>

                    <h2>Why Meta Tags Matter for SEO</h2>
                    <p>Meta tags help search engines understand what your webpage is about. The title and description tags are often displayed in search results, directly affecting your click-through rate (CTR). Properly optimized meta tags improve visibility and ranking potential.</p>

                    <h2>How to Use the SEO Meta Tag Extractor</h2>
                    <ol>
                        <li>Enter the full URL of the webpage you want to analyze.</li>
                            <li>Click the “Extract” button.</li>
                                <li>View a detailed list of meta tags and SEO-related information.</li>
                                    <li>Use the data to improve your website’s SEO strategy.</li>
                                    </ol>

                                    <h2>Benefits for SEO Professionals & Marketers</h2>
                                    <ul>
                                        <li>Audit competitor websites for SEO strategies</li>
                                            <li>Find missing or duplicate meta tags</li>
                                                <li>Ensure pages meet SEO best practices</li>
                                                    <li>Speed up website optimization workflows</li>
                                                    </ul>

                                                    <h2>Start Extracting Meta Tags Now</h2>
                                                    <p>Analyze any website’s SEO performance in seconds with our <strong>Free SEO Meta Tag Extractor Tool</strong>. Get valuable insights and improve your site’s rankings.</p>

                                                    <a href="#" class="cta">Use the SEO Meta Tag Extractor Tool</a>
    <script src="script.js"></script>
</body>
</html>