<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

const PB_URL = 'https://pb.pinkmilk.eu';
const PB_ADMIN_EMAIL = 'klaas@republick.nl';
const PB_ADMIN_PASSWORD = 'biknu8-pyrnaB-mytvyx';

function respond(int $status, array $payload): void {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function pocketbaseRequest(string $method, string $path, ?string $token = null, ?array $payload = null): array {
    $curl = curl_init(PB_URL . $path);
    $headers = ['Content-Type: application/json'];
    if ($token) {
        $headers[] = 'Authorization: ' . $token;
    }

    curl_setopt_array($curl, [
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 12,
    ]);
    if ($payload !== null) {
        curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($payload, JSON_UNESCAPED_UNICODE));
    }

    $body = curl_exec($curl);
    $status = (int) curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
    curl_close($curl);

    return [
        'status' => $status,
        'body' => is_string($body) ? json_decode($body, true) : null,
    ];
}

function lowerName(string $name): string {
    return function_exists('mb_strtolower') ? mb_strtolower($name, 'UTF-8') : strtolower($name);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, ['success' => false, 'error' => 'Alleen POST is toegestaan.']);
}

$input = json_decode((string) file_get_contents('php://input'), true);
$showId = is_array($input) ? trim((string) ($input['showId'] ?? '')) : '';
$name = is_array($input) ? trim((string) ($input['name'] ?? '')) : '';

if (!preg_match('/^[A-Za-z0-9_-]{1,64}$/', $showId) || $name === '' || strlen($name) > 80) {
    respond(422, ['success' => false, 'error' => 'Ongeldige registratiegegevens.']);
}

$auth = pocketbaseRequest('POST', '/api/collections/_superusers/auth-with-password', null, [
    'identity' => PB_ADMIN_EMAIL,
    'password' => PB_ADMIN_PASSWORD,
]);
$token = $auth['body']['token'] ?? null;
if ($auth['status'] !== 200 || !is_string($token)) {
    respond(502, ['success' => false, 'error' => 'De registratie is tijdelijk niet beschikbaar.']);
}

$showResponse = pocketbaseRequest('GET', '/api/collections/teamx/records/' . rawurlencode($showId), $token);
$show = $showResponse['body'];
if ($showResponse['status'] !== 200 || !is_array($show)) {
    respond(404, ['success' => false, 'error' => 'Deze show is niet gevonden.']);
}

$players = $show['playerData'] ?? [];
if (!is_array($players)) {
    $players = [];
}

foreach ($players as $player) {
    if (is_array($player) && isset($player['naam']) && lowerName((string) $player['naam']) === lowerName($name)) {
        respond(200, ['success' => true, 'player' => $player, 'existing' => true]);
    }
}

$highestNumber = 0;
foreach ($players as $player) {
    if (is_array($player)) {
        $highestNumber = max($highestNumber, (int) ($player['playernr'] ?? 0));
    }
}

$totalTeams = max(1, (int) ($show['teamnumber'] ?? 1));
$teamSizes = array_fill(1, $totalTeams, 0);
foreach ($players as $player) {
    $team = is_array($player) ? (int) ($player['teamnr'] ?? 0) : 0;
    if ($team >= 1 && $team <= $totalTeams) {
        $teamSizes[$team]++;
    }
}
$smallestSize = min($teamSizes);
$eligibleTeams = array_keys(array_filter($teamSizes, static fn (int $size): bool => $size === $smallestSize));
$teamNumber = (int) $eligibleTeams[array_rand($eligibleTeams)];

$newPlayer = [
    'naam' => $name,
    'playernr' => $highestNumber + 1,
    'teamnr' => $teamNumber,
];
$players[] = $newPlayer;

$update = pocketbaseRequest('PATCH', '/api/collections/teamx/records/' . rawurlencode($showId), $token, [
    'playerData' => $players,
]);
if ($update['status'] !== 200) {
    respond(502, ['success' => false, 'error' => 'Opslaan is niet gelukt. Probeer het opnieuw.']);
}

respond(200, ['success' => true, 'player' => $newPlayer, 'existing' => false]);
