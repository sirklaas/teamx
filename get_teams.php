<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Content-Type: application/json');
header('Cache-Control: no-cache');

$jsonContent = file_get_contents('teams.json');
if ($jsonContent === false) {
    echo '{"numberOfTeams":"XX","error":"Could not read file"}';
} else {
    echo $jsonContent;
}
?>