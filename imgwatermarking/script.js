document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const imageUpload = document.getElementById('imageUpload');
    const dropArea = document.getElementById('dropArea');
    const imageCanvas = document.getElementById('imageCanvas');
    const ctx = imageCanvas.getContext('2d');
    const placeholder = document.getElementById('placeholder');
    const downloadBtn = document.getElementById('downloadBtn');
    const resetBtn = document.getElementById('resetBtn');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const notification = document.getElementById('notification');
    
    // Watermark controls
    const watermarkText = document.getElementById('watermarkText');
    const textColor = document.getElementById('textColor');
    const textOpacity = document.getElementById('textOpacity');
    const textOpacityValue = document.getElementById('textOpacityValue');
    const textSize = document.getElementById('textSize');
    const textSizeValue = document.getElementById('textSizeValue');
    const textFont = document.getElementById('textFont');
    const textBold = document.getElementById('textBold');
    const textItalic = document.getElementById('textItalic');
    const textPosition = document.getElementById('textPosition');
    const textRotation = document.getElementById('textRotation');
    const textRotationValue = document.getElementById('textRotationValue');
    
    const imageWatermarkUpload = document.getElementById('imageWatermarkUpload');
    const uploadWatermarkBtn = document.getElementById('uploadWatermarkBtn');
    const imageOpacity = document.getElementById('imageOpacity');
    const imageOpacityValue = document.getElementById('imageOpacityValue');
    const imageSize = document.getElementById('imageSize');
    const imageSizeValue = document.getElementById('imageSizeValue');
    const imagePosition = document.getElementById('imagePosition');
    const imageRotation = document.getElementById('imageRotation');
    const imageRotationValue = document.getElementById('imageRotationValue');
    
    // Tab controls
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Variables
    let originalImage = null;
    let watermarkImage = null;
    let currentTab = 'text-tab';
    
    // Initialize event listeners
    initEventListeners();
    
    function initEventListeners() {
        // Image upload
        imageUpload.addEventListener('change', handleImageUpload);
        dropArea.addEventListener('click', () => imageUpload.click());
        dropArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropArea.classList.add('dragover');
        });
        dropArea.addEventListener('dragleave', () => {
            dropArea.classList.remove('dragover');
        });
        dropArea.addEventListener('drop', (e) => {
            e.preventDefault();
            dropArea.classList.remove('dragover');
            if (e.dataTransfer.files.length) {
                imageUpload.files = e.dataTransfer.files;
                handleImageUpload({ target: imageUpload });
            }
        });
        
        // Download and reset
        downloadBtn.addEventListener('click', downloadImage);
        resetBtn.addEventListener('click', resetAll);
        
        // Text watermark controls
        watermarkText.addEventListener('input', updateWatermark);
        textColor.addEventListener('input', updateWatermark);
        textOpacity.addEventListener('input', function() {
            textOpacityValue.textContent = `${this.value}%`;
            updateWatermark();
        });
        textSize.addEventListener('input', function() {
            textSizeValue.textContent = `${this.value}px`;
            updateWatermark();
        });
        textFont.addEventListener('change', updateWatermark);
        textBold.addEventListener('change', updateWatermark);
        textItalic.addEventListener('change', updateWatermark);
        textPosition.addEventListener('change', updateWatermark);
        textRotation.addEventListener('input', function() {
            textRotationValue.textContent = `${this.value}°`;
            updateWatermark();
        });
        
        // Image watermark controls
        imageWatermarkUpload.addEventListener('change', handleWatermarkImageUpload);
        uploadWatermarkBtn.addEventListener('click', () => imageWatermarkUpload.click());
        imageOpacity.addEventListener('input', function() {
            imageOpacityValue.textContent = `${this.value}%`;
            updateWatermark();
        });
        imageSize.addEventListener('input', function() {
            imageSizeValue.textContent = `${this.value}%`;
            updateWatermark();
        });
        imagePosition.addEventListener('change', updateWatermark);
        imageRotation.addEventListener('input', function() {
            imageRotationValue.textContent = `${this.value}°`;
            updateWatermark();
        });
        
        // Tab controls
        tabBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const tabId = this.getAttribute('data-tab');
                switchTab(tabId);
            });
        });
    }
    
    function handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        if (!file.type.match('image.*')) {
            showNotification('Please select an image file', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(event) {
            originalImage = new Image();
            originalImage.onload = function() {
                // Set canvas dimensions to match the image
                imageCanvas.width = originalImage.width;
                imageCanvas.height = originalImage.height;
                
                // Draw the original image
                ctx.drawImage(originalImage, 0, 0);
                
                // Hide placeholder and show canvas
                placeholder.style.display = 'none';
                imageCanvas.style.display = 'block';
                
                // Enable download button
                downloadBtn.disabled = false;
                
                // Update file info
                fileName.textContent = `File: ${file.name}`;
                fileSize.textContent = `Size: ${formatFileSize(file.size)}`;
                
                // Apply watermark if any
                updateWatermark();
            };
            originalImage.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
    
    function handleWatermarkImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        if (!file.type.match('image.*')) {
            showNotification('Please select an image file for watermark', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(event) {
            watermarkImage = new Image();
            watermarkImage.onload = function() {
                updateWatermark();
            };
            watermarkImage.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
    
    function updateWatermark() {
        if (!originalImage) return;
        
        // Clear canvas and redraw original image
        ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
        ctx.drawImage(originalImage, 0, 0);
        
        // Apply watermark based on current tab
        if (currentTab === 'text-tab') {
            applyTextWatermark();
        } else {
            if (watermarkImage) {
                applyImageWatermark();
            }
        }
    }
    
    function applyTextWatermark() {
        const text = watermarkText.value;
        if (!text) return;
        
        // Set text styles
        const fontSize = parseInt(textSize.value);
        const fontStyle = `${textItalic.checked ? 'italic ' : ''}${textBold.checked ? 'bold ' : ''}${fontSize}px ${textFont.value}`;
        ctx.font = fontStyle;
        ctx.fillStyle = textColor.value;
        ctx.globalAlpha = parseInt(textOpacity.value) / 100;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Calculate rotation in radians
        const rotation = (parseInt(textRotation.value) * Math.PI) / 180;
        
        // Apply watermark based on position
        const position = textPosition.value;
        
        if (position === 'tile') {
            // Tile watermark across the image
            const textWidth = ctx.measureText(text).width;
            const textHeight = fontSize;
            const spacingX = textWidth * 1.5;
            const spacingY = textHeight * 2;
            
            ctx.save();
            ctx.rotate(rotation);
            
            for (let x = -imageCanvas.width; x < imageCanvas.width * 2; x += spacingX) {
                for (let y = -imageCanvas.height; y < imageCanvas.height * 2; y += spacingY) {
                    ctx.fillText(text, x, y);
                }
            }
            
            ctx.restore();
        } else {
            // Single watermark at specified position
            let x, y;
            
            switch (position) {
                case 'top-left':
                    x = imageCanvas.width * 0.2;
                    y = imageCanvas.height * 0.2;
                    break;
                case 'top-right':
                    x = imageCanvas.width * 0.8;
                    y = imageCanvas.height * 0.2;
                    break;
                case 'bottom-left':
                    x = imageCanvas.width * 0.2;
                    y = imageCanvas.height * 0.8;
                    break;
                case 'bottom-right':
                    x = imageCanvas.width * 0.8;
                    y = imageCanvas.height * 0.8;
                    break;
                case 'center':
                default:
                    x = imageCanvas.width / 2;
                    y = imageCanvas.height / 2;
                    break;
            }
            
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rotation);
            ctx.fillText(text, 0, 0);
            ctx.restore();
        }
        
        // Reset global alpha
        ctx.globalAlpha = 1.0;
    }
    
    function applyImageWatermark() {
        if (!watermarkImage) return;
        
        const opacity = parseInt(imageOpacity.value) / 100;
        const sizePercentage = parseInt(imageSize.value) / 100;
        const rotation = (parseInt(imageRotation.value) * Math.PI) / 180;
        const position = imagePosition.value;
        
        // Calculate watermark dimensions
        let watermarkWidth = watermarkImage.width * sizePercentage;
        let watermarkHeight = watermarkImage.height * sizePercentage;
        
        // Maintain aspect ratio if needed
        const maxDimension = Math.max(watermarkWidth, watermarkHeight);
        if (maxDimension > Math.min(imageCanvas.width, imageCanvas.height) * 0.5) {
            const scaleFactor = (Math.min(imageCanvas.width, imageCanvas.height) * 0.5) / maxDimension;
            watermarkWidth *= scaleFactor;
            watermarkHeight *= scaleFactor;
        }
        
        if (position === 'tile') {
            // Tile image watermark across the canvas
            const spacingX = watermarkWidth * 1.5;
            const spacingY = watermarkHeight * 1.5;
            
            ctx.save();
            ctx.globalAlpha = opacity;
            
            for (let x = -imageCanvas.width; x < imageCanvas.width * 2; x += spacingX) {
                for (let y = -imageCanvas.height; y < imageCanvas.height * 2; y += spacingY) {
                    ctx.save();
                    ctx.translate(x + watermarkWidth / 2, y + watermarkHeight / 2);
                    ctx.rotate(rotation);
                    ctx.drawImage(
                        watermarkImage,
                        -watermarkWidth / 2,
                        -watermarkHeight / 2,
                        watermarkWidth,
                        watermarkHeight
                    );
                    ctx.restore();
                }
            }
            
            ctx.restore();
        } else {
            // Single image watermark at specified position
            let x, y;
            
            switch (position) {
                case 'top-left':
                    x = imageCanvas.width * 0.1;
                    y = imageCanvas.height * 0.1;
                    break;
                case 'top-right':
                    x = imageCanvas.width * 0.9 - watermarkWidth;
                    y = imageCanvas.height * 0.1;
                    break;
                case 'bottom-left':
                    x = imageCanvas.width * 0.1;
                    y = imageCanvas.height * 0.9 - watermarkHeight;
                    break;
                case 'bottom-right':
                    x = imageCanvas.width * 0.9 - watermarkWidth;
                    y = imageCanvas.height * 0.9 - watermarkHeight;
                    break;
                case 'center':
                default:
                    x = (imageCanvas.width - watermarkWidth) / 2;
                    y = (imageCanvas.height - watermarkHeight) / 2;
                    break;
            }
            
            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.translate(x + watermarkWidth / 2, y + watermarkHeight / 2);
            ctx.rotate(rotation);
            ctx.drawImage(
                watermarkImage,
                -watermarkWidth / 2,
                -watermarkHeight / 2,
                watermarkWidth,
                watermarkHeight
            );
            ctx.restore();
        }
    }
    
    function downloadImage() {
        if (!originalImage) return;
        
        // Create a temporary link
        const link = document.createElement('a');
        link.download = 'watermarked-image.png';
        link.href = imageCanvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification('Image downloaded successfully!', 'success');
    }
    
    function resetAll() {
        // Reset canvas
        ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
        imageCanvas.style.display = 'none';
        placeholder.style.display = 'flex';
        
        // Reset file info
        fileName.textContent = '';
        fileSize.textContent = '';
        
        // Reset upload
        imageUpload.value = '';
        originalImage = null;
        
        // Reset watermark image
        imageWatermarkUpload.value = '';
        watermarkImage = null;
        
        // Reset controls
        watermarkText.value = 'Your Brand';
        textColor.value = '#FFFFFF';
        textOpacity.value = '70';
        textOpacityValue.textContent = '70%';
        textSize.value = '30';
        textSizeValue.textContent = '30px';
        textFont.value = 'Arial';
        textBold.checked = false;
        textItalic.checked = false;
        textPosition.value = 'center';
        textRotation.value = '0';
        textRotationValue.textContent = '0°';
        
        imageOpacity.value = '50';
        imageOpacityValue.textContent = '50%';
        imageSize.value = '30';
        imageSizeValue.textContent = '30%';
        imagePosition.value = 'center';
        imageRotation.value = '0';
        imageRotationValue.textContent = '0°';
        
        // Disable download button
        downloadBtn.disabled = true;
        
        showNotification('All settings have been reset', 'info');
    }
    
    function switchTab(tabId) {
        // Update active tab button
        tabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
        });
        
        // Update active tab content
        tabContents.forEach(content => {
            content.classList.toggle('active', content.id === tabId);
        });
        
        // Update current tab
        currentTab = tabId;
        
        // Update watermark if image is loaded
        updateWatermark();
    }
    
    function showNotification(message, type) {
        notification.textContent = message;
        notification.className = 'notification';
        
        // Set color based on type
        switch (type) {
            case 'success':
                notification.style.backgroundColor = 'var(--success-color)';
                break;
            case 'error':
                notification.style.backgroundColor = 'var(--danger-color)';
                break;
            case 'info':
                notification.style.backgroundColor = 'var(--info-color)';
                break;
            default:
                notification.style.backgroundColor = 'var(--primary-color)';
        }
        
        notification.classList.add('show');
        
        // Hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
    
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i]);
    }
});