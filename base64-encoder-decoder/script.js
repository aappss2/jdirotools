document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const inputText = document.getElementById('inputText');
    const outputText = document.getElementById('outputText');
    const encodeBtn = document.querySelector('[data-operation="encode"]');
    const decodeBtn = document.querySelector('[data-operation="decode"]');
    const operationInput = document.getElementById('operation');
    const clearBtn = document.getElementById('clearBtn');
    const copyBtn = document.getElementById('copyBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const outputCopyBtn = document.getElementById('outputCopyBtn');
    const outputDownloadBtn = document.getElementById('outputDownloadBtn');
    const swapBtn = document.getElementById('swapBtn');
    const fileInput = document.getElementById('fileInput');
    const fileName = document.getElementById('fileName');
    const historyList = document.getElementById('historyList');
    const themeToggle = document.getElementById('themeToggle');
    const infoBtn = document.getElementById('infoBtn');
    const infoModal = document.getElementById('infoModal');
    const closeModal = document.querySelector('.close-modal');
    const base64Form = document.getElementById('base64Form');

    // Initialize theme
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);

    // Conversion history
    let history = JSON.parse(localStorage.getItem('base64History')) || [];

    // Initialize UI
    updateHistoryList();
    updateOperationUI();

    // Event Listeners
    encodeBtn.addEventListener('click', () => setOperation('encode'));
    decodeBtn.addEventListener('click', () => setOperation('decode'));
    clearBtn.addEventListener('click', clearAll);
    copyBtn.addEventListener('click', copyInput);
    downloadBtn.addEventListener('click', downloadInput);
    outputCopyBtn.addEventListener('click', copyOutput);
    outputDownloadBtn.addEventListener('click', downloadOutput);
    swapBtn.addEventListener('click', swapInputOutput);
    fileInput.addEventListener('change', handleFileUpload);
    themeToggle.addEventListener('click', toggleTheme);
    infoBtn.addEventListener('click', () => infoModal.style.display = 'block');
    closeModal.addEventListener('click', () => infoModal.style.display = 'none');
    window.addEventListener('click', (e) => {
        if (e.target === infoModal) infoModal.style.display = 'none';
    });

    // Auto-convert when input changes
    inputText.addEventListener('input', debounce(convert, 300));

    // Form submission (for PHP fallback)
    base64Form.addEventListener('submit', function(e) {
        e.preventDefault();
        convert();
    });

    // Functions
    function setOperation(op) {
        operationInput.value = op;
        updateOperationUI();
        convert();
    }

    function updateOperationUI() {
        encodeBtn.classList.toggle('active', operationInput.value === 'encode');
        decodeBtn.classList.toggle('active', operationInput.value === 'decode');
    }

    function convert() {
        const text = inputText.value.trim();
        if (!text) {
            outputText.value = '';
            return;
        }

        try {
            let result;
            if (operationInput.value === 'encode') {
                result = btoa(unescape(encodeURIComponent(text)));
            } else {
                try {
                    result = decodeURIComponent(escape(atob(text)));
                } catch (e) {
                    // If decoding fails, it might be binary data
                    try {
                        const binaryString = atob(text);
                        outputText.value = "Binary data detected. Use download button to save as file.";
                        addToHistory(text, outputText.value);
                        return;
                    } catch (e2) {
                        throw new Error("Invalid Base64 input");
                    }
                }
            }
            outputText.value = result;
            addToHistory(text, result);
        } catch (error) {
            outputText.value = `Error: ${error.message}`;
        }
    }

    function addToHistory(input, output) {
        // Limit history to 10 items
        if (history.length >= 10) {
            history.pop();
        }
        
        const timestamp = new Date().toLocaleString();
        history.unshift({
            input,
            output,
            operation: operationInput.value,
            timestamp
        });
        
        localStorage.setItem('base64History', JSON.stringify(history));
        updateHistoryList();
    }

    function updateHistoryList() {
        historyList.innerHTML = '';
        history.forEach((item, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            const content = document.createElement('div');
            content.className = 'history-item-content';
            content.title = `${item.operation === 'encode' ? 'Encoded' : 'Decoded'} at ${item.timestamp}`;
            content.textContent = `${item.input.substring(0, 50)}${item.input.length > 50 ? '...' : ''} → ${item.output.substring(0, 30)}${item.output.length > 30 ? '...' : ''}`;
            
            const actions = document.createElement('div');
            actions.className = 'history-item-actions';
            
            const restoreBtn = document.createElement('button');
            restoreBtn.className = 'action-btn';
            restoreBtn.title = 'Restore';
            restoreBtn.innerHTML = '<i class="fas fa-undo"></i>';
            restoreBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                inputText.value = item.input;
                operationInput.value = item.operation;
                updateOperationUI();
                convert();
            });
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'action-btn';
            deleteBtn.title = 'Delete';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                history.splice(index, 1);
                localStorage.setItem('base64History', JSON.stringify(history));
                updateHistoryList();
            });
            
            actions.appendChild(restoreBtn);
            actions.appendChild(deleteBtn);
            historyItem.appendChild(content);
            historyItem.appendChild(actions);
            historyList.appendChild(historyItem);
        });
    }

    function clearAll() {
        inputText.value = '';
        outputText.value = '';
    }

    function copyInput() {
        copyToClipboard(inputText);
        showTooltip(clearBtn, 'Copied!');
    }

    function copyOutput() {
        copyToClipboard(outputText);
        showTooltip(outputCopyBtn, 'Copied!');
    }

    function copyToClipboard(element) {
        element.select();
        document.execCommand('copy');
        // Deselect the text
        window.getSelection().removeAllRanges();
    }

    function downloadInput() {
        downloadText(inputText.value, 'input.txt');
    }

    function downloadOutput() {
        const content = outputText.value;
        if (content.startsWith("Binary data detected")) {
            // Handle binary data download
            try {
                const binaryString = atob(inputText.value.trim());
                const blob = new Blob([new Uint8Array([...binaryString].map(char => char.charCodeAt(0)))], {
                    type: 'application/octet-stream'
                });
                downloadBlob(blob, 'decoded_file.bin');
            } catch (e) {
                alert('Error preparing binary file for download');
            }
        } else {
            downloadText(content, operationInput.value === 'encode' ? 'encoded.txt' : 'decoded.txt');
        }
    }

    function downloadText(text, filename) {
        const blob = new Blob([text], { type: 'text/plain' });
        downloadBlob(blob, filename);
    }

    function downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function swapInputOutput() {
        const temp = inputText.value;
        inputText.value = outputText.value;
        outputText.value = temp;
        operationInput.value = operationInput.value === 'encode' ? 'decode' : 'encode';
        updateOperationUI();
    }

    function handleFileUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        fileName.textContent = file.name;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            if (operationInput.value === 'encode') {
                // For encoding, we'll convert the file to Base64
                const base64String = btoa(
                    new Uint8Array(e.target.result)
                        .reduce((data, byte) => data + String.fromCharCode(byte), '')
                );
                inputText.value = base64String;
                convert();
            } else {
                // For decoding, we'll treat the file content as Base64
                const text = e.target.result;
                inputText.value = text;
                convert();
            }
        };
        
        if (operationInput.value === 'encode') {
            reader.readAsArrayBuffer(file);
        } else {
            reader.readAsText(file);
        }
    }

    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    }

    function updateThemeIcon(theme) {
        const icon = themeToggle.querySelector('i');
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        themeToggle.title = theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    }

    function showTooltip(element, message) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = message;
        tooltip.style.position = 'absolute';
        tooltip.style.backgroundColor = 'var(--primary-color)';
        tooltip.style.color = 'white';
        tooltip.style.padding = '5px 10px';
        tooltip.style.borderRadius = '4px';
        tooltip.style.fontSize = '0.8rem';
        tooltip.style.zIndex = '1000';
        
        const rect = element.getBoundingClientRect();
        tooltip.style.top = `${rect.top - 30}px`;
        tooltip.style.left = `${rect.left + rect.width / 2 - 30}px`;
        
        document.body.appendChild(tooltip);
        
        setTimeout(() => {
            tooltip.style.opacity = '0';
            tooltip.style.transition = 'opacity 0.3s';
            setTimeout(() => {
                document.body.removeChild(tooltip);
            }, 300);
        }, 1000);
    }

    // Utility function to debounce rapid events
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this, args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(context, args);
            }, wait);
        };
    }
});