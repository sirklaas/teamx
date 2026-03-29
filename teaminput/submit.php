<?php
/**
 * TeamX Input - Form Submission Handler
 * Handles form data submission and storage
 */

// Enable error reporting for debugging (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set JSON response header
header('Content-Type: application/json');

// Allow CORS if needed
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Get form data
$rawData = [];

// Check if it's JSON or form data
$contentType = isset($_SERVER["CONTENT_TYPE"]) ? trim($_SERVER["CONTENT_TYPE"]) : '';

if (stripos($contentType, 'application/json') !== false) {
    // JSON data
    $json = file_get_contents('php://input');
    $rawData = json_decode($json, true);
} else {
    // Form data
    $rawData = $_POST;
}

// Handle nested structure from JavaScript (action + data)
if (isset($rawData['data']) && is_array($rawData['data'])) {
    $data = $rawData['data'];
    $action = isset($rawData['action']) ? $rawData['action'] : 'update';
} else {
    $data = $rawData;
    $action = 'update';
}

// Validate - make fields optional for flexibility
// Only validate if fields exist and are empty
$errors = [];

// No strict validation - allow empty fields
// This makes the form more flexible

// Sanitize data
$sanitized_data = [
    'game_id' => isset($data['game_id']) ? htmlspecialchars($data['game_id']) : uniqid('game_'),
    'game_name' => isset($data['game_name']) ? htmlspecialchars($data['game_name']) : '',
    'hoeveel_teams' => isset($data['hoeveel_teams']) ? filter_var($data['hoeveel_teams'], FILTER_SANITIZE_NUMBER_INT) : '',
    'players' => isset($data['players']) ? filter_var($data['players'], FILTER_SANITIZE_NUMBER_INT) : '',
    'tv_screen' => isset($data['tv_screen']) ? htmlspecialchars($data['tv_screen']) : '',
    'audio_input' => isset($data['audio_input']) ? htmlspecialchars($data['audio_input']) : '',
    'parking' => isset($data['parking']) ? htmlspecialchars($data['parking']) : '',
    'priority' => isset($data['priority']) ? filter_var($data['priority'], FILTER_SANITIZE_NUMBER_INT) : 1,
    'photo_circle' => isset($data['photo_circle']) ? htmlspecialchars($data['photo_circle']) : '',
    'notities' => isset($data['notities']) ? htmlspecialchars($data['notities']) : '',
    'action' => $action,
    'timestamp' => date('Y-m-d H:i:s')
];

// Save to JSON file (simple storage)
$storage_file = 'data/submissions.json';

// Create data directory if it doesn't exist
if (!file_exists('data')) {
    mkdir('data', 0755, true);
}

// Load existing data
$existing_data = [];
if (file_exists($storage_file)) {
    $json_content = file_get_contents($storage_file);
    $existing_data = json_decode($json_content, true) ?: [];
}

// Add new submission
$sanitized_data['id'] = uniqid('team_', true);
$existing_data[] = $sanitized_data;

// Save to file
$json_output = json_encode($existing_data, JSON_PRETTY_PRINT);
if (file_put_contents($storage_file, $json_output)) {
    // Success
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Data successfully saved',
        'data' => $sanitized_data
    ]);
} else {
    // Error saving
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to save data'
    ]);
}

// Optional: Save to database instead
// Uncomment and configure if you want to use MySQL
/*
function saveToDatabase($data) {
    // Database configuration
    $host = 'localhost';
    $dbname = 'dukowaeu_xluk1';
    $username = 'dukowaeu_xluk1';
    $password = 'J^)8nt5C*uw3o^Y7)J.28[~2';
    
    try {
        $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        $sql = "INSERT INTO team_submissions 
                (hoeveel_teams, players, tv_screen, audio_input, parking, priority, photo_circle, notities, created_at) 
                VALUES 
                (:hoeveel_teams, :players, :tv_screen, :audio_input, :parking, :priority, :photo_circle, :notities, NOW())";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($data);
        
        return $pdo->lastInsertId();
    } catch (PDOException $e) {
        error_log("Database error: " . $e->getMessage());
        return false;
    }
}
*/
?>
