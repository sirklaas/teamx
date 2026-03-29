<?php
/**
 * TeamX Input - Data Viewer
 * Simple page to view submitted data
 * 
 * SECURITY: Add authentication before using in production!
 */

// Simple password protection (change this!)
$password = 'teamx2024';

session_start();

// Check if logged in
if (!isset($_SESSION['logged_in'])) {
    if (isset($_POST['password']) && $_POST['password'] === $password) {
        $_SESSION['logged_in'] = true;
    } else {
        // Show login form
        ?>
        <!DOCTYPE html>
        <html lang="nl">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Login - TeamX Data Viewer</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    margin: 0;
                }
                .login-box {
                    background: white;
                    padding: 40px;
                    border-radius: 10px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                }
                input[type="password"] {
                    width: 250px;
                    padding: 10px;
                    border: 2px solid #ddd;
                    border-radius: 5px;
                    margin: 10px 0;
                }
                button {
                    width: 100%;
                    padding: 10px;
                    background: #667eea;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 16px;
                }
                button:hover {
                    background: #764ba2;
                }
            </style>
        </head>
        <body>
            <div class="login-box">
                <h2>TeamX Data Viewer</h2>
                <form method="post">
                    <input type="password" name="password" placeholder="Enter password" required>
                    <button type="submit">Login</button>
                </form>
            </div>
        </body>
        </html>
        <?php
        exit();
    }
}

// Handle logout
if (isset($_GET['logout'])) {
    session_destroy();
    header('Location: view-data.php');
    exit();
}

// Load data
$data_file = 'data/submissions.json';
$submissions = [];

if (file_exists($data_file)) {
    $json_content = file_get_contents($data_file);
    $submissions = json_decode($json_content, true) ?: [];
}

// Reverse to show newest first
$submissions = array_reverse($submissions);

?>
<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Data Viewer - TeamX Input</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            background: #f5f5f5;
            padding: 20px;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
        }
        header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        h1 {
            font-size: 2em;
        }
        .logout-btn {
            background: rgba(255,255,255,0.2);
            color: white;
            padding: 10px 20px;
            border: 2px solid white;
            border-radius: 5px;
            text-decoration: none;
            transition: background 0.3s;
        }
        .logout-btn:hover {
            background: rgba(255,255,255,0.3);
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            text-align: center;
        }
        .stat-number {
            font-size: 2.5em;
            font-weight: bold;
            color: #667eea;
        }
        .stat-label {
            color: #666;
            margin-top: 5px;
        }
        .submissions {
            background: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th {
            background: #667eea;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
        }
        td {
            padding: 12px;
            border-bottom: 1px solid #eee;
        }
        tr:hover {
            background: #f9f9f9;
        }
        .notities-cell {
            max-width: 300px;
            white-space: pre-wrap;
            font-size: 0.9em;
        }
        .empty-state {
            text-align: center;
            padding: 60px;
            color: #999;
        }
        .empty-state svg {
            width: 100px;
            height: 100px;
            margin-bottom: 20px;
            opacity: 0.3;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>📊 TeamX Data Viewer</h1>
            <a href="?logout=1" class="logout-btn">Logout</a>
        </header>

        <div class="stats">
            <div class="stat-card">
                <div class="stat-number"><?php echo count($submissions); ?></div>
                <div class="stat-label">Total Submissions</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">
                    <?php 
                    $total_teams = array_sum(array_column($submissions, 'hoeveel_teams'));
                    echo $total_teams;
                    ?>
                </div>
                <div class="stat-label">Total Teams</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">
                    <?php 
                    $total_players = array_sum(array_column($submissions, 'players'));
                    echo $total_players;
                    ?>
                </div>
                <div class="stat-label">Total Players</div>
            </div>
        </div>

        <div class="submissions">
            <h2 style="margin-bottom: 20px;">Recent Submissions</h2>
            
            <?php if (empty($submissions)): ?>
                <div class="empty-state">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <h3>No submissions yet</h3>
                    <p>Data will appear here once forms are submitted</p>
                </div>
            <?php else: ?>
                <div style="overflow-x: auto;">
                    <table>
                        <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>Teams</th>
                                <th>Players</th>
                                <th>TV Screen</th>
                                <th>Audio</th>
                                <th>Parking</th>
                                <th>Priority</th>
                                <th>PhotoCircle</th>
                                <th>Notities</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($submissions as $submission): ?>
                                <tr>
                                    <td><?php echo htmlspecialchars($submission['timestamp']); ?></td>
                                    <td><?php echo htmlspecialchars($submission['hoeveel_teams']); ?></td>
                                    <td><?php echo htmlspecialchars($submission['players']); ?></td>
                                    <td><?php echo htmlspecialchars($submission['tv_screen']); ?></td>
                                    <td><?php echo htmlspecialchars($submission['audio_input']); ?></td>
                                    <td><?php echo htmlspecialchars($submission['parking']); ?></td>
                                    <td><?php echo htmlspecialchars($submission['priority']); ?></td>
                                    <td><?php echo htmlspecialchars($submission['photo_circle']); ?></td>
                                    <td class="notities-cell"><?php echo htmlspecialchars($submission['notities']); ?></td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            <?php endif; ?>
        </div>
    </div>
</body>
</html>
