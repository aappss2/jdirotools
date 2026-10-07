document.addEventListener('DOMContentLoaded', function() {
    // Emoji data
    const emojiData = [
        // Smileys & Emotion
        { emoji: '😀', name: 'Grinning Face', category: 'smileys' },
        { emoji: '😃', name: 'Grinning Face with Big Eyes', category: 'smileys' },
        { emoji: '😄', name: 'Grinning Face with Smiling Eyes', category: 'smileys' },
        { emoji: '😁', name: 'Beaming Face with Smiling Eyes', category: 'smileys' },
        { emoji: '😆', name: 'Grinning Squinting Face', category: 'smileys' },
        { emoji: '😅', name: 'Grinning Face with Sweat', category: 'smileys' },
        { emoji: '🤣', name: 'Rolling on the Floor Laughing', category: 'smileys' },
        { emoji: '😂', name: 'Face with Tears of Joy', category: 'smileys' },
        { emoji: '🙂', name: 'Slightly Smiling Face', category: 'smileys' },
        { emoji: '🙃', name: 'Upside-Down Face', category: 'smileys' },
        { emoji: '😉', name: 'Winking Face', category: 'smileys' },
        { emoji: '😊', name: 'Smiling Face with Smiling Eyes', category: 'smileys' },
        { emoji: '😇', name: 'Smiling Face with Halo', category: 'smileys' },
        { emoji: '🥰', name: 'Smiling Face with Hearts', category: 'smileys' },
        { emoji: '😍', name: 'Smiling Face with Heart-Eyes', category: 'smileys' },
        { emoji: '🤩', name: 'Star-Struck', category: 'smileys' },
        { emoji: '😘', name: 'Face Blowing a Kiss', category: 'smileys' },
        { emoji: '😗', name: 'Kissing Face', category: 'smileys' },
        { emoji: '😚', name: 'Kissing Face with Closed Eyes', category: 'smileys' },
        { emoji: '😙', name: 'Kissing Face with Smiling Eyes', category: 'smileys' },
        
        // Animals & Nature
        { emoji: '🐶', name: 'Dog Face', category: 'animals' },
        { emoji: '🐱', name: 'Cat Face', category: 'animals' },
        { emoji: '🐭', name: 'Mouse Face', category: 'animals' },
        { emoji: '🐹', name: 'Hamster', category: 'animals' },
        { emoji: '🐰', name: 'Rabbit Face', category: 'animals' },
        { emoji: '🦊', name: 'Fox', category: 'animals' },
        { emoji: '🐻', name: 'Bear', category: 'animals' },
        { emoji: '🐼', name: 'Panda', category: 'animals' },
        { emoji: '🦁', name: 'Lion', category: 'animals' },
        { emoji: '🐮', name: 'Cow Face', category: 'animals' },
        { emoji: '🐷', name: 'Pig Face', category: 'animals' },
        { emoji: '🐸', name: 'Frog', category: 'animals' },
        { emoji: '🐵', name: 'Monkey Face', category: 'animals' },
        { emoji: '🦄', name: 'Unicorn', category: 'animals' },
        { emoji: '🐔', name: 'Chicken', category: 'animals' },
        { emoji: '🐧', name: 'Penguin', category: 'animals' },
        { emoji: '🦉', name: 'Owl', category: 'animals' },
        { emoji: '🦇', name: 'Bat', category: 'animals' },
        { emoji: '🐺', name: 'Wolf', category: 'animals' },
        { emoji: '🐗', name: 'Boar', category: 'animals' },
        
        // Food & Drink
        { emoji: '🍏', name: 'Green Apple', category: 'food' },
        { emoji: '🍎', name: 'Red Apple', category: 'food' },
        { emoji: '🍐', name: 'Pear', category: 'food' },
        { emoji: '🍊', name: 'Tangerine', category: 'food' },
        { emoji: '🍋', name: 'Lemon', category: 'food' },
        { emoji: '🍌', name: 'Banana', category: 'food' },
        { emoji: '🍉', name: 'Watermelon', category: 'food' },
        { emoji: '🍇', name: 'Grapes', category: 'food' },
        { emoji: '🍓', name: 'Strawberry', category: 'food' },
        { emoji: '🫐', name: 'Blueberries', category: 'food' },
        { emoji: '🍈', name: 'Melon', category: 'food' },
        { emoji: '🍒', name: 'Cherries', category: 'food' },
        { emoji: '🍑', name: 'Peach', category: 'food' },
        { emoji: '🥭', name: 'Mango', category: 'food' },
        { emoji: '🍍', name: 'Pineapple', category: 'food' },
        { emoji: '🥥', name: 'Coconut', category: 'food' },
        { emoji: '🥝', name: 'Kiwi Fruit', category: 'food' },
        { emoji: '🍅', name: 'Tomato', category: 'food' },
        { emoji: '🍆', name: 'Eggplant', category: 'food' },
        { emoji: '🥑', name: 'Avocado', category: 'food' },
        
        // Travel & Places
        { emoji: '🚗', name: 'Car', category: 'travel' },
        { emoji: '🚕', name: 'Taxi', category: 'travel' },
        { emoji: '🚙', name: 'SUV', category: 'travel' },
        { emoji: '🚌', name: 'Bus', category: 'travel' },
        { emoji: '🚎', name: 'Trolleybus', category: 'travel' },
        { emoji: '🏎️', name: 'Race Car', category: 'travel' },
        { emoji: '🚓', name: 'Police Car', category: 'travel' },
        { emoji: '🚑', name: 'Ambulance', category: 'travel' },
        { emoji: '🚒', name: 'Fire Engine', category: 'travel' },
        { emoji: '🚐', name: 'Minibus', category: 'travel' },
        { emoji: '🚚', name: 'Delivery Truck', category: 'travel' },
        { emoji: '🚛', name: 'Articulated Lorry', category: 'travel' },
        { emoji: '🚜', name: 'Tractor', category: 'travel' },
        { emoji: '🛴', name: 'Kick Scooter', category: 'travel' },
        { emoji: '🚲', name: 'Bicycle', category: 'travel' },
        { emoji: '🛵', name: 'Motor Scooter', category: 'travel' },
        { emoji: '🏍️', name: 'Motorcycle', category: 'travel' },
        { emoji: '🚨', name: 'Police Light', category: 'travel' },
        { emoji: '🚔', name: 'Oncoming Police Car', category: 'travel' },
        { emoji: '🚍', name: 'Oncoming Bus', category: 'travel' },
        
        // Objects
        { emoji: '⌚', name: 'Watch', category: 'objects' },
        { emoji: '📱', name: 'Mobile Phone', category: 'objects' },
        { emoji: '📲', name: 'Mobile Phone with Arrow', category: 'objects' },
        { emoji: '💻', name: 'Laptop', category: 'objects' },
        { emoji: '⌨️', name: 'Keyboard', category: 'objects' },
        { emoji: '🖥️', name: 'Desktop Computer', category: 'objects' },
        { emoji: '🖨️', name: 'Printer', category: 'objects' },
        { emoji: '🖱️', name: 'Computer Mouse', category: 'objects' },
        { emoji: '🖲️', name: 'Trackball', category: 'objects' },
        { emoji: '🕹️', name: 'Joystick', category: 'objects' },
        { emoji: '🗜️', name: 'Clamp', category: 'objects' },
        { emoji: '💽', name: 'Computer Disk', category: 'objects' },
        { emoji: '💾', name: 'Floppy Disk', category: 'objects' },
        { emoji: '💿', name: 'Optical Disk', category: 'objects' },
        { emoji: '📀', name: 'DVD', category: 'objects' },
        { emoji: '📼', name: 'Videocassette', category: 'objects' },
        { emoji: '📷', name: 'Camera', category: 'objects' },
        { emoji: '📸', name: 'Camera with Flash', category: 'objects' },
        { emoji: '📹', name: 'Video Camera', category: 'objects' },
        { emoji: '🎥', name: 'Movie Camera', category: 'objects' },
        
        // Symbols
        { emoji: '❤️', name: 'Red Heart', category: 'symbols' },
        { emoji: '🧡', name: 'Orange Heart', category: 'symbols' },
        { emoji: '💛', name: 'Yellow Heart', category: 'symbols' },
        { emoji: '💚', name: 'Green Heart', category: 'symbols' },
        { emoji: '💙', name: 'Blue Heart', category: 'symbols' },
        { emoji: '💜', name: 'Purple Heart', category: 'symbols' },
        { emoji: '🖤', name: 'Black Heart', category: 'symbols' },
        { emoji: '🤍', name: 'White Heart', category: 'symbols' },
        { emoji: '🤎', name: 'Brown Heart', category: 'symbols' },
        { emoji: '💔', name: 'Broken Heart', category: 'symbols' },
        { emoji: '❣️', name: 'Heart Exclamation', category: 'symbols' },
        { emoji: '💕', name: 'Two Hearts', category: 'symbols' },
        { emoji: '💞', name: 'Revolving Hearts', category: 'symbols' },
        { emoji: '💓', name: 'Beating Heart', category: 'symbols' },
        { emoji: '💗', name: 'Growing Heart', category: 'symbols' },
        { emoji: '💖', name: 'Sparkling Heart', category: 'symbols' },
        { emoji: '💘', name: 'Heart with Arrow', category: 'symbols' },
        { emoji: '💝', name: 'Heart with Ribbon', category: 'symbols' },
        { emoji: '💟', name: 'Heart Decoration', category: 'symbols' },
        { emoji: '☮️', name: 'Peace Symbol', category: 'symbols' },
        
        // Flags
        { emoji: '🏳️', name: 'White Flag', category: 'flags' },
        { emoji: '🏴', name: 'Black Flag', category: 'flags' },
        { emoji: '🏴‍☠️', name: 'Pirate Flag', category: 'flags' },
        { emoji: '🏁', name: 'Chequered Flag', category: 'flags' },
        { emoji: '🚩', name: 'Triangular Flag', category: 'flags' },
        { emoji: '🎌', name: 'Crossed Flags', category: 'flags' },
        { emoji: '🏳️‍🌈', name: 'Rainbow Flag', category: 'flags' },
        { emoji: '🏳️‍⚧️', name: 'Transgender Flag', category: 'flags' },
        { emoji: '🇺🇳', name: 'United Nations', category: 'flags' },
        { emoji: '🇦🇫', name: 'Afghanistan', category: 'flags' },
        { emoji: '🇦🇽', name: 'Åland Islands', category: 'flags' },
        { emoji: '🇦🇱', name: 'Albania', category: 'flags' },
        { emoji: '🇩🇿', name: 'Algeria', category: 'flags' },
        { emoji: '🇦🇸', name: 'American Samoa', category: 'flags' },
        { emoji: '🇦🇩', name: 'Andorra', category: 'flags' },
        { emoji: '🇦🇴', name: 'Angola', category: 'flags' },
        { emoji: '🇦🇮', name: 'Anguilla', category: 'flags' },
        { emoji: '🇦🇶', name: 'Antarctica', category: 'flags' },
        { emoji: '🇦🇬', name: 'Antigua & Barbuda', category: 'flags' },
        { emoji: '🇦🇷', name: 'Argentina', category: 'flags' }
    ];

    // DOM elements
    const allEmojisContainer = document.getElementById('all-emojis');
    const recentEmojisContainer = document.getElementById('recent-emojis');
    const searchInput = document.querySelector('.search-input');
    const categoryTabs = document.querySelectorAll('.category-tab');
    const notification = document.querySelector('.notification');
    const themeToggle = document.querySelector('.theme-toggle');

    // State
    let recentEmojis = JSON.parse(localStorage.getItem('recentEmojis')) || [];
    let darkMode = localStorage.getItem('darkMode') === 'true';

    // Initialize
    function init() {
        renderAllEmojis();
        renderRecentEmojis();
        setupEventListeners();
        applyDarkMode();
    }

    // Render all emojis
    function renderAllEmojis(filter = '', category = 'all') {
        allEmojisContainer.innerHTML = '';
        
        const filteredEmojis = emojiData.filter(emoji => {
            const matchesSearch = emoji.name.toLowerCase().includes(filter.toLowerCase()) || 
                                emoji.emoji.includes(filter);
            const matchesCategory = category === 'all' || emoji.category === category;
            return matchesSearch && matchesCategory;
        });

        if (filteredEmojis.length === 0) {
            allEmojisContainer.innerHTML = `
                <div class="empty-state">
                    <i class="far fa-frown"></i>
                    <p>No emojis found matching your search</p>
                </div>
            `;
            return;
        }

        filteredEmojis.forEach(emoji => {
            const emojiCard = createEmojiCard(emoji);
            allEmojisContainer.appendChild(emojiCard);
        });
    }

    // Render recent emojis
    function renderRecentEmojis() {
        recentEmojisContainer.innerHTML = '';
        
        if (recentEmojis.length === 0) {
            recentEmojisContainer.innerHTML = `
                <div class="empty-state">
                    <i class="far fa-clock"></i>
                    <p>Your recently used emojis will appear here</p>
                </div>
            `;
            return;
        }

        // Only show the 12 most recent emojis
        const recentToShow = recentEmojis.slice(0, 12);
        
        recentToShow.forEach(emoji => {
            const emojiCard = createEmojiCard(emoji);
            recentEmojisContainer.appendChild(emojiCard);
        });
    }

    // Create emoji card element
    function createEmojiCard(emojiData) {
        const card = document.createElement('div');
        card.className = 'emoji-card';
        card.innerHTML = `
            <div class="emoji">${emojiData.emoji}</div>
            <div class="emoji-name">${emojiData.name}</div>
        `;
        
        card.addEventListener('click', () => {
            copyToClipboard(emojiData.emoji);
            addToRecentEmojis(emojiData);
            showNotification();
        });
        
        return card;
    }

    // Copy to clipboard
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).catch(err => {
            console.error('Could not copy text: ', err);
        });
    }

    // Add to recent emojis
    function addToRecentEmojis(emojiData) {
        // Remove if already exists to avoid duplicates
        recentEmojis = recentEmojis.filter(e => e.emoji !== emojiData.emoji);
        
        // Add to beginning of array
        recentEmojis.unshift(emojiData);
        
        // Limit to 20 recent emojis
        if (recentEmojis.length > 20) {
            recentEmojis = recentEmojis.slice(0, 20);
        }
        
        // Save to localStorage and re-render
        localStorage.setItem('recentEmojis', JSON.stringify(recentEmojis));
        renderRecentEmojis();
    }

    // Show notification
    function showNotification() {
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 2000);
    }

    // Setup event listeners
    function setupEventListeners() {
        // Search input
        searchInput.addEventListener('input', (e) => {
            const filter = e.target.value;
            const activeCategory = document.querySelector('.category-tab.active').dataset.category;
            renderAllEmojis(filter, activeCategory);
        });

        // Category tabs
        categoryTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                categoryTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                const category = tab.dataset.category;
                const filter = searchInput.value;
                renderAllEmojis(filter, category);
            });
        });

        // Theme toggle
        themeToggle.addEventListener('click', toggleDarkMode);
    }

    // Toggle dark mode
    function toggleDarkMode() {
        darkMode = !darkMode;
        localStorage.setItem('darkMode', darkMode);
        applyDarkMode();
    }

    // Apply dark mode
    function applyDarkMode() {
        if (darkMode) {
            document.body.classList.add('dark-theme');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            themeToggle.title = 'Toggle light mode';
        } else {
            document.body.classList.remove('dark-theme');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            themeToggle.title = 'Toggle dark mode';
        }
    }

    // Initialize the app
    init();
});