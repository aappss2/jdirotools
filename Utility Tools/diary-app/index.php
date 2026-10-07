<?php
require_once 'config.php';
redirectIfNotLoggedIn();

// Get user's 3 most recent diary entries
$stmt = $pdo->prepare("
    SELECT id, title, content, mood, weather, entry_date, created_at 
    FROM diary_entries 
    WHERE user_id = ? 
    ORDER BY entry_date DESC, created_at DESC
    LIMIT 3
");
$stmt->execute([$_SESSION['user_id']]);
$entries = $stmt->fetchAll();

// Get entry statistics
$statsStmt = $pdo->prepare("
    SELECT 
        COUNT(*) as total_entries,
        COUNT(DISTINCT DATE(entry_date)) as unique_days,
        MIN(entry_date) as first_entry
    FROM diary_entries 
    WHERE user_id = ?
");
$statsStmt->execute([$_SESSION['user_id']]);
$stats = $statsStmt->fetch();

// Get mood distribution
$moodStmt = $pdo->prepare("
    SELECT mood, COUNT(*) as count 
    FROM diary_entries 
    WHERE user_id = ? 
    GROUP BY mood 
    ORDER BY count DESC
");
$moodStmt->execute([$_SESSION['user_id']]);
$moods = $moodStmt->fetchAll();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Diary App</title>
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
        
        .welcome-section {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 2rem;
            border-radius: 15px;
            margin-bottom: 2rem;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        
        .stat-card {
            background: white;
            padding: 1.5rem;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        
        .stat-number {
            font-size: 2rem;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 0.5rem;
        }
        
        .recent-entries {
            background: white;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            padding: 2rem;
        }
        
        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
        }
        
        .section-title {
            font-size: 1.5rem;
            font-weight: 600;
            color: #333;
        }
        
        .btn {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 500;
            transition: transform 0.2s;
            display: inline-block;
        }
        
        .btn:hover {
            transform: translateY(-2px);
        }
        
        .btn-view-all {
            background: #6c757d;
            margin-left: 1rem;
        }
        
        .entry-list {
            display: grid;
            gap: 1rem;
        }
        
        .entry-item {
            padding: 1.5rem;
            border: 1px solid #e1e5e9;
            border-radius: 8px;
            transition: transform 0.2s;
        }
        
        .entry-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        
        .entry-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 0.5rem;
        }
        
        .entry-title {
            font-size: 1.2rem;
            font-weight: 600;
            color: #333;
        }
        
        .entry-date {
            color: #666;
            font-size: 0.9rem;
        }
        
        .entry-meta {
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
        
        .entry-preview {
            color: #666;
            line-height: 1.5;
            margin-bottom: 1rem;
        }
        
        .entry-actions {
            display: flex;
            gap: 1rem;
        }
        
        .action-link {
            color: #667eea;
            text-decoration: none;
            font-weight: 500;
            font-size: 0.9rem;
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
    </style>
</head>
<body>
    <nav class="navbar">
        <div class="logo">📖 Diary App</div>
        <div class="nav-links">
            <span>Welcome, <?php echo htmlspecialchars($_SESSION['username']); ?>!</span>
            <a href="diary.php">All Entries</a>
            <a href="logout.php">Logout</a>
        </div>
    </nav>
    
    <div class="container">
        <div class="welcome-section">
            <h1>Welcome to Your Digital Diary</h1>
            <p>Capture your thoughts, memories, and experiences</p>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number"><?php echo $stats['total_entries']; ?></div>
                <div>Total Entries</div>
            </div>
            <div class="stat-card">
                <div class="stat-number"><?php echo $stats['unique_days']; ?></div>
                <div>Days Written</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">
                    <?php 
                    if ($stats['first_entry']) {
                        echo date('M j, Y', strtotime($stats['first_entry']));
                    } else {
                        echo 'No entries';
                    }
                    ?>
                </div>
                <div>First Entry</div>
            </div>
        </div>
        
        <div class="recent-entries">
            <div class="section-header">
                <h2 class="section-title">Recent Entries</h2>
                <div>
                    <a href="diary.php" class="btn">+ New Entry</a>
                    <a href="diary.php" class="btn btn-view-all">View All</a>
                </div>
            </div>
            
            <?php if (empty($entries)): ?>
                <div class="empty-state">
                    <h3>No entries yet</h3>
                    <p>Start your diary journey by creating your first entry!</p>
                    <a href="diary.php" class="btn" style="margin-top: 1rem;">Write First Entry</a>
                </div>
            <?php else: ?>
                <div class="entry-list">
                    <?php foreach ($entries as $entry): ?>
                        <div class="entry-item">
                            <div class="entry-header">
                                <h3 class="entry-title"><?php echo htmlspecialchars($entry['title']); ?></h3>
                                <span class="entry-date"><?php echo date('F j, Y', strtotime($entry['entry_date'])); ?></span>
                            </div>
                            <div class="entry-meta">
                                <?php if ($entry['mood'] && $entry['mood'] !== 'neutral'): ?>
                                    <span class="mood-badge">Mood: <?php echo htmlspecialchars($entry['mood']); ?></span>
                                <?php endif; ?>
                                <?php if ($entry['weather']): ?>
                                    <span class="weather-badge">Weather: <?php echo htmlspecialchars($entry['weather']); ?></span>
                                <?php endif; ?>
                            </div>
                            <p class="entry-preview">
                                <?php 
                                $content = strip_tags($entry['content']);
                                echo strlen($content) > 150 ? substr($content, 0, 150) . '...' : $content;
                                ?>
                            </p>
                            <div class="entry-actions">
                                <a href="diary.php?view=<?php echo $entry['id']; ?>" class="action-link">View</a>
                                <a href="diary.php?edit=<?php echo $entry['id']; ?>" class="action-link">Edit</a>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </div>
    </div>
</body>
</html>