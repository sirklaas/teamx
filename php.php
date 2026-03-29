<?php
header('Content-Type: application/json');

// Get the POST data
$data = json_decode(file_get_contents('php://input'), true);

if (isset($data['numberOfTeams'])) {
    $teamData = ['numberOfTeams' => $data['numberOfTeams']];
    
    // Write to the JSON file
    $success = file_put_contents('teams.json', json_encode($teamData));
    
    if ($success !== false) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Unable to write to file']);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Invalid data']);
}
?>