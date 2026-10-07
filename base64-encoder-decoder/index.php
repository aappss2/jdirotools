<?php
// PHP functions for server-side encoding/decoding
function encodeBase64($input) {
    return base64_encode($input);
}

function decodeBase64($input) {
    return base64_decode($input);
}

// Process form submission if any
$input = '';
$output = '';
$operation = 'encode';
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = $_POST['input'] ?? '';
    $operation = $_POST['operation'] ?? 'encode';
    
    try {
        if ($operation === 'encode') {
            $output = encodeBase64($input);
        } else {
            $output = decodeBase64($input);
            // Check if the decoded output is binary data
            if (!mb_check_encoding($output, 'UTF-8')) {
                $output = "Binary data detected. Download or view as text?";
            }
        }
    } catch (Exception $e) {
        $error = "Error: " . $e->getMessage();
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Base64 Encoder/Decoder Tool</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8977523182593956"
     crossorigin="anonymous"></script>
</head>
<body>
    <div class="container">
        <header>
            <h1><i class="fas fa-code"></i> Base64 Encoder/Decoder</h1>
            <p class="subtitle">Convert text or files to/from Base64 format</p>
        </header>

        <div class="tool-container">
            <form id="base64Form" method="POST" enctype="multipart/form-data">
                <div class="input-group">
                    <div class="toolbar">
                        <div class="operation-selector">
                            <button type="button" class="operation-btn <?= $operation === 'encode' ? 'active' : '' ?>" data-operation="encode">
                                <i class="fas fa-lock"></i> Encode
                            </button>
                            <button type="button" class="operation-btn <?= $operation === 'decode' ? 'active' : '' ?>" data-operation="decode">
                                <i class="fas fa-lock-open"></i> Decode
                            </button>
                            <input type="hidden" name="operation" id="operation" value="<?= htmlspecialchars($operation) ?>">
                        </div>
                        <div class="actions">
                            <button type="button" id="clearBtn" class="action-btn" title="Clear">
                                <i class="fas fa-trash"></i>
                            </button>
                            <button type="button" id="copyBtn" class="action-btn" title="Copy to Clipboard">
                                <i class="fas fa-copy"></i>
                            </button>
                            <button type="button" id="downloadBtn" class="action-btn" title="Download">
                                <i class="fas fa-download"></i>
                            </button>
                        </div>
                    </div>
                    <textarea id="inputText" name="input" placeholder="Enter text to encode or paste Base64 to decode..." autofocus><?= htmlspecialchars($input) ?></textarea>
                    <div class="file-upload">
                        <label for="fileInput" class="file-upload-btn">
                            <i class="fas fa-upload"></i> Upload File
                        </label>
                        <input type="file" id="fileInput" class="file-input">
                        <span id="fileName"></span>
                    </div>
                </div>

                <div class="output-group">
                    <div class="toolbar">
                        <span class="output-label">Output:</span>
                        <div class="output-actions">
                            <button type="button" id="outputCopyBtn" class="action-btn" title="Copy Output">
                                <i class="fas fa-copy"></i>
                            </button>
                            <button type="button" id="outputDownloadBtn" class="action-btn" title="Download Output">
                                <i class="fas fa-download"></i>
                            </button>
                            <button type="button" id="swapBtn" class="action-btn" title="Swap Input/Output">
                                <i class="fas fa-exchange-alt"></i>
                            </button>
                        </div>
                    </div>
                    <textarea id="outputText" readonly placeholder="Result will appear here..."><?= htmlspecialchars($output) ?></textarea>
                </div>

                <?php if ($error): ?>
                    <div class="error-message">
                        <i class="fas fa-exclamation-circle"></i> <?= htmlspecialchars($error) ?>
                    </div>
                <?php endif; ?>

                <div class="history-section">
                    <h3><i class="fas fa-history"></i> Recent Conversions</h3>
                    <div id="historyList" class="history-list">
                        <!-- History items will be added by JavaScript -->
                    </div>
                </div>
            </form>
        </div>

        <footer>
            <p>Base64 Encode/Decoder Tool &copy; <?= date('Y') ?></p>
            <div class="footer-links">
                <a href="#" id="themeToggle"><i class="fas fa-moon"></i> Dark Mode</a>
                <a href="#" id="infoBtn"><i class="fas fa-info-circle"></i> About</a>
            </div>
        </footer>
    </div>

    <!-- Info Modal -->
    <div id="infoModal" class="modal">
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h2><i class="fas fa-info-circle"></i> About Base64 Encode/Decoder</h2>
            <p>This tool allows you to encode text or files to Base64 format and decode Base64 back to its original form.</p>
            <h3>Features:</h3>
            <ul>
                <li>Encode plain text to Base64</li>
                <li>Decode Base64 to plain text</li>
                <li>File upload and conversion</li>
                <li>Copy to clipboard</li>
                <li>Download results</li>
                <li>Conversion history</li>
                <li>Dark/Light mode</li>
            </ul>
            <p>Base64 is commonly used for encoding binary data in text-based protocols like HTTP, email attachments, and more.</p>
        </div>
    </div>
<h1>Free Base Encoder/Decoder – Convert Text with Ease</h1>

<p>Our <strong>Base Encoder/Decoder Tool</strong> allows you to quickly encode or decode text using popular base formats like Base64, Base32, and Base16 (Hex). Whether you are a developer, security researcher, or just need to encode data for safe transmission, our tool provides instant results without the need for complex software.</p>

<h2>What is Base Encoding?</h2>
<p>Base encoding is a method of converting binary data into a text format that can be easily stored or transmitted over systems that handle text-only data. Common base encodings include:</p>
<ul>
    <li><strong>Base64:</strong> Commonly used for email attachments, data URLs, and cryptography.</li>
        <li><strong>Base32:</strong> Often used in QR codes and secure data transmission.</li>
            <li><strong>Base16 (Hex):</strong> Widely used in programming, debugging, and data representation.</li>
            </ul>

            <h2>Why Use Our Base Encoder/Decoder?</h2>
            <ul>
                <li><strong>Free & Fast:</strong> Encode and decode instantly without signup.</li>
                    <li><strong>Multiple Formats:</strong> Base64, Base32, and Base16 supported.</li>
                        <li><strong>Secure Processing:</strong> All operations happen in your browser.</li>
                            <li><strong>Developer Friendly:</strong> Great for quick data conversion and debugging.</li>
                            </ul>

                            <h2>How to Use the Base Encoder/Decoder Tool</h2>
                            <ol>
                                <li>Enter your text or data into the input box.</li>
                                    <li>Select the encoding format (Base64, Base32, or Base16).</li>
                                        <li>Click “Encode” to convert your text, or “Decode” to revert encoded data.</li>
                                            <li>Copy the result instantly for your project or communication.</li>
                                            </ol>

                                            <h2>Common Use Cases</h2>
                                            <ul>
                                                <li>Encoding sensitive data for transmission</li>
                                                    <li>Embedding files into HTML/CSS using Base64</li>
                                                        <li>Debugging data in different encoding formats</li>
                                                            <li>Creating QR codes from encoded text</li>
                                                            </ul>

                                                            <h2>Start Encoding & Decoding Now</h2>
                                                            <p>Convert your text or data in seconds with our <strong>Free Base Encoder/Decoder Tool</strong>. No installations, no signups, just fast and reliable encoding.</p>

                                                            <a href="#" class="cta">Try the Base Encoder/Decoder Tool</a>
    <script src="script.js"></script>
</body>
</html>