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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, ['success' => false, 'error' => 'Alleen POST is toegestaan.']);
}

$input = json_decode((string) file_get_contents('php://input'), true);
$mediaId = is_array($input) ? trim((string) ($input['mediaId'] ?? '')) : '';
$gameCode = is_array($input) ? strtoupper(trim((string) ($input['gameCode'] ?? ''))) : '';

if (!preg_match('/^[A-Za-z0-9_-]{1,64}$/', $mediaId)) {
    respond(422, ['success' => false, 'error' => 'Ongeldig media ID.']);
}

$auth = pocketbaseRequest('POST', '/api/collections/_superusers/auth-with-password', null, [
    'identity' => PB_ADMIN_EMAIL,
    'password' => PB_ADMIN_PASSWORD,
]);
$token = $auth['body']['token'] ?? null;
if ($auth['status'] !== 200 || !is_string($token)) {
    respond(502, ['success' => false, 'error' => 'Authenticatie met database mislukt.']);
}

if ($gameCode !== '') {
    $mediaResponse = pocketbaseRequest('GET', '/api/collections/showmedia/records/' . rawurlencode($mediaId), $token);
    if ($mediaResponse['status'] !== 200 || !is_array($mediaResponse['body'])) {
        respond(404, ['success' => false, 'error' => 'Foto of video niet gevonden.']);
    }
    $media = $mediaResponse['body'];

    $showResponse = pocketbaseRequest('GET', '/api/collections/teamx/records?filter=' . rawurlencode('gamecode = "' . $gameCode . '"'), $token);
    $showItems = $showResponse['body']['items'] ?? [];
    if (!empty($showItems)) {
        $show = $showItems[0];
        if (($media['show_id'] ?? '') !== ($show['id'] ?? '')) {
            respond(403, ['success' => false, 'error' => 'Geen toestemming om deze media te verwijderen.']);
        }
    }
}

$deleteResponse = pocketbaseRequest('DELETE', '/api/collections/showmedia/records/' . rawurlencode($mediaId), $token);

if ($deleteResponse['status'] === 204 || $deleteResponse['status'] === 200) {
    respond(200, ['success' => true, 'deletedId' => $mediaId]);
}

respond(502, ['success' => false, 'error' => 'Verwijderen is mislukt. Probeer het opnieuw.']);
