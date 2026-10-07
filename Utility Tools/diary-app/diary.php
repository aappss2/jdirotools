<?php
require_once 'config.php';
redirectIfNotLoggedIn();

$entry = null;
$is_edit = false;
$is_view = false;

// Handle delete action
if (isset($_GET['delete'])) {
    $stmt = $pdo->prepare("DELETE FROM diary_entries WHERE id = ? AND user_id = ?");
    $stmt->execute([$_GET['delete'], $_SESSION['user_id']]);
    header("Location: diary.php");
    exit();
}

// Check if viewing or editing existing entry
if (isset($_GET['view'])) {
    $stmt = $pdo->prepare("SELECT * FROM diary_entries WHERE id = ? AND user_id = ?");
    $stmt->execute([$_GET['view'], $_SESSION['user_id']]);
    $entry = $stmt->fetch();
    $is_view = (bool)$entry;
} elseif (isset($_GET['edit'])) {
    $stmt = $pdo->prepare("SELECT * FROM diary_entries WHERE id = ? AND user_id = ?");
    $stmt->execute([$_GET['edit'], $_SESSION['user_id']]);
    $entry = $stmt->fetch();
    $is_edit = (bool)$entry;
}

// Handle form submission for new/edit entry
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $title = sanitizeInput($_POST['title']);
    $content = $_POST['content'];
    $mood = sanitizeInput($_POST['mood']);
    $weather = sanitizeInput($_POST['weather']);
    $entry_date = $_POST['entry_date'];
    
    if (empty($title) || empty($content) || empty($entry_date)) {
        $error = 'Please fill in all required fields';
    } else {
        if ($is_edit && $entry) {
            // Update existing entry
            $stmt = $pdo->prepare("
                UPDATE diary_entries 
                SET title = ?, content = ?, mood = ?, weather = ?, entry_date = ?, updated_at = NOW() 
                WHERE id = ? AND user_id = ?
            ");
            $success = $stmt->execute([$title, $content, $mood, $weather, $entry_date, $entry['id'], $_SESSION['user_id']]);
        } else {
            // Create new entry
            $stmt = $pdo->prepare("
                INSERT INTO diary_entries (user_id, title, content, mood, weather, entry_date) 
                VALUES (?, ?, ?, ?, ?, ?)
            ");
            $success = $stmt->execute([$_SESSION['user_id'], $title, $content, $mood, $weather, $entry_date]);
        }
        
        if ($success) {
            header("Location: diary.php");
            exit();
        } else {
            $error = 'Failed to save entry. Please try again.';
        }
    }
}

// Get all entries for listing
$stmt = $pdo->prepare("
    SELECT id, title, content, mood, weather, entry_date, created_at 
    FROM diary_entries 
    WHERE user_id = ? 
    ORDER BY entry_date DESC, created_at DESC
");
$stmt->execute([$_SESSION['user_id']]);
$all_entries = $stmt->fetchAll();

// Set default values for form
$title = $entry['title'] ?? '';
$content = $entry['content'] ?? '';
$mood = $entry['mood'] ?? 'neutral';
$weather = $entry['weather'] ?? '';
$entry_date = $entry['entry_date'] ?? date('Y-m-d');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $is_view ? 'View Entry' : ($is_edit ? 'Edit Entry' : 'Diary Entries'); ?> - Diary App</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f8f9fa;
            color: #333;
        }
        
        .navbar {
            background: white;
            padding: 1rem 2rem;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .logo {
            font-size: 1.5rem;
            font-weight: bold;
            background: linear-gradient(135deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        
        .nav-links a {
            margin-left: 1.5rem;
            text-decoration: none;
            color: #667eea;
            font-weight: 500;
        }
        
        .container {
            max-width: 1200px;
            margin: 2rem auto;
            padding: 0 2rem;
        }
        
        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
        }
        
        .page-title {
            font-size: 2rem;
            font-weight: 600;
            color: #333;
        }
        
        /* Form Styles */
        .entry-form, .entry-view {
            background: white;
            padding: 2rem;
            border-radius: 15px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            margin-bottom: 2rem;
        }
        
        .form-header, .view-header {
            margin-bottom: 2rem;
        }
        
        .form-title, .view-title {
            font-size: 1.8rem;
            font-weight: 600;
            color: #333;
            margin-bottom: 0.5rem;
        }
        
        .form-group {
            margin-bottom: 1.5rem;
        }
        
        label {
            display: block;
            margin-bottom: 0.5rem;
            color: #555;
            font-weight: 500;
        }
        
        input, select, textarea {
            width: 100%;
            padding: 12px;
            border: 2px solid #e1e5e9;
            border-radius: 8px;
            font-size: 1rem;
            transition: border-color 0.3s;
            font-family: inherit;
        }
        
        input:focus, select:focus, textarea:focus {
            outline: none;
            border-color: #667eea;
        }
        
        textarea {
            min-height: 300px;
            resize: vertical;
        }
        
        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
        }
        
        .btn-group {
            display: flex;
            gap: 1rem;
            margin-top: 2rem;
        }
        
        .btn {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 500;
            cursor: pointer;
            transition: transform 0.2s;
            text-decoration: none;
            text-align: center;
            display: inline-block;
        }
        
        .btn-primary {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
        }
        
        .btn-secondary {
            background: #6c757d;
            color: white;
        }
        
        .btn-danger {
            background: #dc3545;
            color: white;
        }
        
        .btn-success {
            background: #28a745;
            color: white;
        }
        
        .btn:hover {
            transform: translateY(-2px);
        }
        
        .alert {
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 1rem;
            text-align: center;
        }
        
        .alert-error {
            background: #fee;
            color: #c33;
            border: 1px solid #fcc;
        }
        
        /* Entries List Styles */
        .entries-list {
            background: white;
            border-radius: 15px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            padding: 2rem;
        }
        
        .entries-grid {
            display: grid;
            gap: 1.5rem;
        }
        
        .entry-card {
            padding: 1.5rem;
            border: 1px solid #e1e5e9;
            border-radius: 10px;
            transition: transform 0.2s;
        }
        
        .entry-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        
        .entry-card-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 1rem;
        }
        
        .entry-card-title {
            font-size: 1.3rem;
            font-weight: 600;
            color: #333;
            margin-bottom: 0.5rem;
        }
        
        .entry-card-date {
            color: #666;
            font-size: 0.9rem;
        }
        
        .entry-card-meta {
            display: flex;
            gap: 1rem;
            margin-bottom: 1rem;
        }
        
        .mood-badge, .weather-badge {
            padding: 4px 8px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 500;
        }
        
        .mood-badge {
            background: #e3f2fd;
            color: #1976d2;
        }
        
        .weather-badge {
            background: #f3e5f5;
            color: #7b1fa2;
        }
        
        .entry-card-content {
            color: #666;
            line-height: 1.5;
            margin-bottom: 1rem;
        }
        
        .entry-card-actions {
            display: flex;
            gap: 1rem;
        }
        
        .action-link {
            color: #667eea;
            text-decoration: none;
            font-weight: 500;
            font-size: 0.9rem;
        }
        
        .action-link.delete {
            color: #dc3545;
        }
        
        .action-link:hover {
            text-decoration: underline;
        }
        
        .empty-state {
            text-align: center;
            padding: 3rem;
            color: #666;
        }
        
        .empty-state h3 {
            margin-bottom: 1rem;
        }
        
        /* Full Screen View Styles */
        .fullscreen-view {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: white;
            z-index: 1000;
            padding: 2rem;
            overflow-y: auto;
        }
        
        .fullscreen-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid #e1e5e9;
        }
        
        .fullscreen-content {
            max-width: 800px;
            margin: 0 auto;
            line-height: 1.8;
            font-size: 1.1rem;
        }
        
        .fullscreen-meta {
            display: flex;
            gap: 2rem;
            margin-bottom: 2rem;
            padding: 1rem;
            background: #f8f9fa;
            border-radius: 8px;
        }
        
        @media (max-width: 768px) {
            .form-row {
                grid-template-columns: 1fr;
            }
            
            .container {
                padding: 0 1rem;
            }
            
            .entry-card-actions {
                flex-direction: column;
                gap: 0.5rem;
            }
            
            .btn-group {
                flex-direction: column;
            }
        }
    </style>
</head>
<body>
    <nav class="navbar">
        <div class="logo">📖 Diary App</div>
        <div class="nav-links">
            <a href="index.php">Dashboard</a>
            <a href="diary.php">All Entries</a>
            <a href="logout.php">Logout</a>
        </div>
    </nav>
    
    <div class="container">
        <?php if ($is_view || $is_edit): ?>
            
            <?php if ($is_view): ?>
                <!-- Full Screen View -->
                <div class="fullscreen-view">
                    <div class="fullscreen-header">
                        <h1 class="page-title"><?php echo htmlspecialchars($entry['title']); ?></h1>
                        <div>
                            <a href="diary.php?edit=<?php echo $entry['id']; ?>" class="btn btn-primary">Edit</a>
                            <a href="diary.php" class="btn btn-secondary">Close</a>
                        </div>
                    </div>
                    
                    <div class="fullscreen-meta">
                        <div><strong>Date:</strong> <?php echo date('F j, Y', strtotime($entry['entry_date'])); ?></div>
                        <?php if ($entry['mood'] && $entry['mood'] !== 'neutral'): ?>
                            <div><strong>Mood:</strong> <?php echo htmlspecialchars($entry['mood']); ?></div>
                        <?php endif; ?>
                        <?php if ($entry['weather']): ?>
                            <div><strong>Weather:</strong> <?php echo htmlspecialchars($entry['weather']); ?></div>
                        <?php endif; ?>
                    </div>
                    
                    <div class="fullscreen-content">
                        <?php echo nl2br(htmlspecialchars($entry['content'])); ?>
                    </div>
                </div>
                
            <?php else: ?>
                <!-- Edit Form -->
                <div class="page-header">
                    <h1 class="page-title">Edit Diary Entry</h1>
                    <a href="diary.php" class="btn btn-secondary">Back to Entries</a>
                </div>
                
                <div class="entry-form">
                    <?php if (isset($error)): ?>
                        <div class="alert alert-error"><?php echo $error; ?></div>
                    <?php endif; ?>
                    
                    <form method="POST" action="">
                        <div class="form-group">
                            <label for="title">Title *</label>
                            <input type="text" id="title" name="title" value="<?php echo htmlspecialchars($title); ?>" required>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="entry_date">Date *</label>
                                <input type="date" id="entry_date" name="entry_date" value="<?php echo $entry_date; ?>" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="mood">Mood</label>
                                <select id="mood" name="mood">
                                    <option value="neutral" <?php echo $mood === 'neutral' ? 'selected' : ''; ?>>😐 Neutral</option>
                                    <option value="happy" <?php echo $mood === 'happy' ? 'selected' : ''; ?>>😊 Happy</option>
                                    <option value="excited" <?php echo $mood === 'excited' ? 'selected' : ''; ?>>😃 Excited</option>
                                    <option value="sad" <?php echo $mood === 'sad' ? 'selected' : ''; ?>>😢 Sad</option>
                                    <option value="angry" <?php echo $mood === 'angry' ? 'selected' : ''; ?>>😠 Angry</option>
                                    <option value="tired" <?php echo $mood === 'tired' ? 'selected' : ''; ?>>😴 Tired</option>
                                    <option value="anxious" <?php echo $mood === 'anxious' ? 'selected' : ''; ?>>😰 Anxious</option>
                                    <option value="peaceful" <?php echo $mood === 'peaceful' ? 'selected' : ''; ?>>😌 Peaceful</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="weather">Weather</label>
                            <input type="text" id="weather" name="weather" value="<?php echo htmlspecialchars($weather); ?>" placeholder="e.g., Sunny, Rainy, Cloudy...">
                        </div>
                        
                        <div class="form-group">
                            <label for="content">Your Entry *</label>
                            <textarea id="content" name="content" required placeholder="Write your thoughts here..."><?php echo htmlspecialchars($content); ?></textarea>
                        </div>
                        
                        <div class="btn-group">
                            <button type="submit" class="btn btn-primary">Update Entry</button>
                            <a href="diary.php?view=<?php echo $entry['id']; ?>" class="btn btn-success">View</a>
                            <a href="diary.php" class="btn btn-secondary">Cancel</a>
                        </div>
                    </form>
                </div>
            <?php endif; ?>
            
        <?php else: ?>
            <!-- Main Entries List -->
            <div class="page-header">
                <h1 class="page-title">All Diary Entries</h1>
                <a href="diary.php?new=1" class="btn btn-primary">+ New Entry</a>
            </div>
            
            <?php if (isset($_GET['new'])): ?>
                <!-- New Entry Form -->
                <div class="entry-form">
                    <?php if (isset($error)): ?>
                        <div class="alert alert-error"><?php echo $error; ?></div>
                    <?php endif; ?>
                    
                    <form method="POST" action="">
                        <div class="form-group">
                            <label for="title">Title *</label>
                            <input type="text" id="title" name="title" value="<?php echo htmlspecialchars($title); ?>" required>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="entry_date">Date *</label>
                                <input type="date" id="entry_date" name="entry_date" value="<?php echo $entry_date; ?>" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="mood">Mood</label>
                                <select id="mood" name="mood">
                                    <option value="neutral">😐 Neutral</option>
                                    <option value="happy">😊 Happy</option>
                                    <option value="excited">😃 Excited</option>
                                    <option value="sad">😢 Sad</option>
                                    <option value="angry">😠 Angry</option>
                                    <option value="tired">😴 Tired</option>
                                    <option value="anxious">😰 Anxious</option>
                                    <option value="peaceful">😌 Peaceful</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="weather">Weather</label>
                            <input type="text" id="weather" name="weather" value="<?php echo htmlspecialchars($weather); ?>" placeholder="e.g., Sunny, Rainy, Cloudy...">
                        </div>
                        
                        <div class="form-group">
                            <label for="content">Your Entry *</label>
                            <textarea id="content" name="content" required placeholder="Write your thoughts here..."><?php echo htmlspecialchars($content); ?></textarea>
                        </div>
                        
                        <div class="btn-group">
                            <button type="submit" class="btn btn-primary">Save Entry</button>
                            <a href="diary.php" class="btn btn-secondary">Cancel</a>
                        </div>
                    </form>
                </div>
            <?php endif; ?>
            
            <!-- Entries List -->
            <div class="entries-list">
                <?php if (empty($all_entries)): ?>
                    <div class="empty-state">
                        <h3>No entries yet</h3>
                        <p>Start your diary journey by creating your first entry!</p>
                        <a href="diary.php?new=1" class="btn btn-primary" style="margin-top: 1rem;">Write First Entry</a>
                    </div>
                <?php else: ?>
                    <div class="entries-grid">
                        <?php foreach ($all_entries as $entry): ?>
                            <div class="entry-card">
                                <div class="entry-card-header">
                                    <div>
                                        <h3 class="entry-card-title"><?php echo htmlspecialchars($entry['title']); ?></h3>
                                        <span class="entry-card-date"><?php echo date('F j, Y', strtotime($entry['entry_date'])); ?></span>
                                    </div>
                                </div>
                                
                                <div class="entry-card-meta">
                                    <?php if ($entry['mood'] && $entry['mood'] !== 'neutral'): ?>
                                        <span class="mood-badge">Mood: <?php echo htmlspecialchars($entry['mood']); ?></span>
                                    <?php endif; ?>
                                    <?php if ($entry['weather']): ?>
                                        <span class="weather-badge">Weather: <?php echo htmlspecialchars($entry['weather']); ?></span>
                                    <?php endif; ?>
                                </div>
                                
                                <div class="entry-card-content">
                                    <?php 
                                    $content = strip_tags($entry['content']);
                                    echo strlen($content) > 200 ? substr($content, 0, 200) . '...' : $content;
                                    ?>
                                </div>
                                
                                <div class="entry-card-actions">
                                    <a href="diary.php?view=<?php echo $entry['id']; ?>" class="action-link">View Full</a>
                                    <a href="diary.php?edit=<?php echo $entry['id']; ?>" class="action-link">Edit</a>
                                    <a href="diary.php?delete=<?php echo $entry['id']; ?>" class="action-link delete" onclick="return confirm('Are you sure you want to delete this entry?')">Delete</a>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
            </div>
        <?php endif; ?>
    </div>
</body>
</html>