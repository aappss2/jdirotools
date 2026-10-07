document.addEventListener('DOMContentLoaded', function() {
    // Canvas setup
    const canvas = document.getElementById('whiteboard');
    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    let currentTool = 'pen';
    let currentColor = '#000000';
    let lineWidth = 5;
    let startX, startY;
    let savedImageData = [];
    let redoImageData = [];
    let currentText = '';
    let currentFont = 'Arial';
    let currentFontSize = 24;

    // UI elements
    const penTool = document.getElementById('pen-tool');
    const eraserTool = document.getElementById('eraser-tool');
    const textTool = document.getElementById('text-tool');
    const lineTool = document.getElementById('line-tool');
    const rectangleTool = document.getElementById('rectangle-tool');
    const circleTool = document.getElementById('circle-tool');
    const colorOptions = document.querySelectorAll('.color-option');
    const customColor = document.getElementById('custom-color');
    const lineWidthSlider = document.getElementById('line-width');
    const widthValue = document.getElementById('width-value');
    const textOptions = document.getElementById('text-options');
    const textInput = document.getElementById('text-input');
    const fontFamily = document.getElementById('font-family');
    const fontSize = document.getElementById('font-size');
    const clearBtn = document.getElementById('clear-btn');
    const saveBtn = document.getElementById('save-btn');
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');
    const currentToolDisplay = document.getElementById('current-tool');
    const cursorPosition = document.getElementById('cursor-position');
    const saveModal = document.getElementById('save-modal');
    const closeModal = document.querySelector('.close-modal');
    const savePngBtn = document.getElementById('save-png');
    const saveJpegBtn = document.getElementById('save-jpeg');
    const imageName = document.getElementById('image-name');

    // Set canvas size
    function resizeCanvas() {
        const container = document.querySelector('.whiteboard-container');
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
        
        // Redraw the last saved state if exists
        if (savedImageData.length > 0) {
            const img = new Image();
            img.onload = function() {
                ctx.drawImage(img, 0, 0);
            };
            img.src = savedImageData[savedImageData.length - 1];
        } else {
            // Initial white background
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            saveState();
        }
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Tool selection
    function setActiveTool(tool) {
        currentTool = tool;
        currentToolDisplay.textContent = `Current Tool: ${tool.charAt(0).toUpperCase() + tool.slice(1)}`;
        
        // Update active button
        document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`${tool}-tool`).classList.add('active');
        
        // Show/hide text options
        textOptions.style.display = tool === 'text' ? 'block' : 'none';
        
        // Change cursor
        if (tool === 'pen' || tool === 'eraser') {
            canvas.style.cursor = 'crosshair';
        } else if (tool === 'text') {
            canvas.style.cursor = 'text';
        } else {
            canvas.style.cursor = 'default';
        }
    }

    penTool.addEventListener('click', () => setActiveTool('pen'));
    eraserTool.addEventListener('click', () => setActiveTool('eraser'));
    textTool.addEventListener('click', () => setActiveTool('text'));
    lineTool.addEventListener('click', () => setActiveTool('line'));
    rectangleTool.addEventListener('click', () => setActiveTool('rectangle'));
    circleTool.addEventListener('click', () => setActiveTool('circle'));

    // Color selection
    function setActiveColor(color) {
        currentColor = color;
        document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('active'));
        if (color === '#ffffff') {
            document.querySelector('.color-option.white').classList.add('active');
        }
        customColor.value = color;
    }

    colorOptions.forEach(option => {
        option.addEventListener('click', function() {
            const color = this.getAttribute('data-color');
            setActiveColor(color);
        });
    });

    customColor.addEventListener('input', function() {
        setActiveColor(this.value);
    });

    // Line width
    lineWidthSlider.addEventListener('input', function() {
        lineWidth = this.value;
        widthValue.textContent = `${lineWidth}px`;
    });

    // Text options
    textInput.addEventListener('input', function() {
        currentText = this.value;
    });

    fontFamily.addEventListener('change', function() {
        currentFont = this.value;
    });

    fontSize.addEventListener('input', function() {
        currentFontSize = this.value;
    });

    // Drawing functions
    function startDrawing(e) {
        isDrawing = true;
        startX = e.offsetX || e.touches[0].clientX - canvas.getBoundingClientRect().left;
        startY = e.offsetY || e.touches[0].clientY - canvas.getBoundingClientRect().top;
        
        if (currentTool === 'pen' || currentTool === 'eraser') {
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineWidth = lineWidth;
            ctx.strokeStyle = currentTool === 'eraser' ? 'white' : currentColor;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
        } else if (currentTool === 'text') {
            // Text will be added on mouse up
        }
        
        // Save state before drawing
        saveState();
    }

    function draw(e) {
        if (!isDrawing) return;
        
        const x = e.offsetX || e.touches[0].clientX - canvas.getBoundingClientRect().left;
        const y = e.offsetY || e.touches[0].clientY - canvas.getBoundingClientRect().top;
        
        cursorPosition.textContent = `X: ${x}, Y: ${y}`;
        
        if (currentTool === 'pen' || currentTool === 'eraser') {
            ctx.lineTo(x, y);
            ctx.stroke();
        } else if (currentTool === 'line') {
            redrawCanvas();
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(x, y);
            ctx.strokeStyle = currentColor;
            ctx.lineWidth = lineWidth;
            ctx.stroke();
        } else if (currentTool === 'rectangle') {
            redrawCanvas();
            ctx.beginPath();
            ctx.rect(startX, startY, x - startX, y - startY);
            ctx.strokeStyle = currentColor;
            ctx.lineWidth = lineWidth;
            ctx.stroke();
        } else if (currentTool === 'circle') {
            redrawCanvas();
            ctx.beginPath();
            const radius = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
            ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
            ctx.strokeStyle = currentColor;
            ctx.lineWidth = lineWidth;
            ctx.stroke();
        }
    }

    function stopDrawing(e) {
        if (!isDrawing) return;
        isDrawing = false;
        
        const x = e.offsetX || (e.touches && e.touches[0] ? e.touches[0].clientX - canvas.getBoundingClientRect().left : 0);
        const y = e.offsetY || (e.touches && e.touches[0] ? e.touches[0].clientY - canvas.getBoundingClientRect().top : 0);
        
        if (currentTool === 'text' && currentText) {
            ctx.font = `${currentFontSize}px ${currentFont}`;
            ctx.fillStyle = currentColor;
            ctx.fillText(currentText, x, y);
            saveState();
        }
    }

    function redrawCanvas() {
        if (savedImageData.length > 0) {
            const img = new Image();
            img.onload = function() {
                ctx.drawImage(img, 0, 0);
            };
            img.src = savedImageData[savedImageData.length - 1];
        } else {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }

    // Save canvas state for undo/redo
    function saveState() {
        const imageData = canvas.toDataURL();
        savedImageData.push(imageData);
        redoImageData = []; // Clear redo stack when new action is performed
        updateUndoRedoButtons();
    }

    // Undo/redo functionality
    function undo() {
        if (savedImageData.length > 1) {
            redoImageData.push(savedImageData.pop());
            const img = new Image();
            img.onload = function() {
                ctx.drawImage(img, 0, 0);
            };
            img.src = savedImageData[savedImageData.length - 1];
            updateUndoRedoButtons();
        }
    }

    function redo() {
        if (redoImageData.length > 0) {
            const imageData = redoImageData.pop();
            savedImageData.push(imageData);
            const img = new Image();
            img.onload = function() {
                ctx.drawImage(img, 0, 0);
            };
            img.src = imageData;
            updateUndoRedoButtons();
        }
    }

    function updateUndoRedoButtons() {
        undoBtn.disabled = savedImageData.length <= 1;
        redoBtn.disabled = redoImageData.length === 0;
    }

    // Clear canvas
    function clearCanvas() {
        if (confirm('Are you sure you want to clear the whiteboard?')) {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            savedImageData = [];
            redoImageData = [];
            saveState();
        }
    }

    // Save canvas as image
    function openSaveModal() {
        saveModal.style.display = 'flex';
    }

    function closeSaveModal() {
        saveModal.style.display = 'none';
    }

    function saveCanvas(format) {
        const link = document.createElement('a');
        let fileName = imageName.value.trim() || 'whiteboard';
        fileName += `.${format}`;
        
        link.download = fileName;
        link.href = canvas.toDataURL(`image/${format}`);
        link.click();
        closeSaveModal();
    }

    // Event listeners
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // Touch support
    canvas.addEventListener('touchstart', function(e) {
        e.preventDefault();
        startDrawing(e);
    });
    
    canvas.addEventListener('touchmove', function(e) {
        e.preventDefault();
        draw(e);
    });
    
    canvas.addEventListener('touchend', function(e) {
        e.preventDefault();
        stopDrawing(e);
    });

    clearBtn.addEventListener('click', clearCanvas);
    saveBtn.addEventListener('click', openSaveModal);
    undoBtn.addEventListener('click', undo);
    redoBtn.addEventListener('click', redo);
    closeModal.addEventListener('click', closeSaveModal);
    savePngBtn.addEventListener('click', () => saveCanvas('png'));
    saveJpegBtn.addEventListener('click', () => saveCanvas('jpeg'));

    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === saveModal) {
            closeSaveModal();
        }
    });

    // Initialize
    setActiveTool('pen');
    setActiveColor('#000000');
    updateUndoRedoButtons();
});