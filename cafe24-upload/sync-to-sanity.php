<?php
/**
 * audioguy.co.kr → Sanity 직접 동기화 (push 방식).
 *
 * 업로드 위치: audioguy.co.kr/community/sync-to-sanity.php (common.php와 같은 폴더)
 *
 * 한국 IP (Cafe24 자체)에서 Sanity Mutations API를 직접 호출하므로
 * 외부 IP 차단 / GitHub Actions / cron 모두 우회. gnuboard 글 작성 hook이
 * 이 URL을 호출하면 즉시 communityCache 싱글톤이 갱신됨.
 *
 * 호출:
 *   https://audioguy.co.kr/community/sync-to-sanity.php?token=<SYNC_TOKEN>
 *   - 정상:  200 + {"ok": true, "jobs": N, "column": N, "updatedAt": "..."}
 *   - 인증:  403 + {"ok": false, "error": "forbidden"}
 *   - 실패:  500 + {"ok": false, "http_code": ..., "error": "..."}
 *
 *   ?debug=1 추가 시 디버그 메시지 표시.
 *
 * 의존:
 *   - sanity-config.php (같은 폴더, gitignored). 다음 변수를 정의해야 함:
 *       $SYNC_TOKEN          — 이 엔드포인트 접근 토큰
 *       $SANITY_PROJECT_ID
 *       $SANITY_DATASET
 *       $SANITY_API_VERSION
 *       $SANITY_WRITE_TOKEN  — Sanity에 쓰기 권한 가진 토큰
 */

if (!defined('JSON_UNESCAPED_UNICODE')) {
    define('JSON_UNESCAPED_UNICODE', 256);
}

// hook(write_update.php)이 500ms cURL fire-and-forget으로 호출했을 때,
// 클라이언트 abort 후에도 PHP가 끝까지 실행되도록 보장. 이걸 안 하면 cafe24
// PHP-FPM이 client abort 시 프로세스를 죽여서 Sanity push가 절반에 멈춤.
ignore_user_abort(true);
@set_time_limit(60);

// 모든 호출(특히 from=gnuboard hook)을 디버그 로그에 기록. 디버깅 끝나면
// 이 한 줄과 sync-debug.log 파일은 지워도 됨.
@file_put_contents(
    __DIR__ . '/sync-debug.log',
    '[' . date('c') . '] sync-to-sanity called'
        . ' from=' . (isset($_GET['from']) ? $_GET['from'] : '-')
        . ' board=' . (isset($_GET['board']) ? $_GET['board'] : '-')
        . ' ip=' . (isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '-')
        . "\n",
    FILE_APPEND | LOCK_EX
);

// PHP 5.5 이하 호환 — hash_equals 폴리필
if (!function_exists('hash_equals')) {
    function hash_equals($known, $user) {
        if (!is_string($known) || !is_string($user)) return false;
        if (strlen($known) !== strlen($user)) return false;
        $diff = 0;
        for ($i = 0, $n = strlen($known); $i < $n; $i++) {
            $diff |= ord($known[$i]) ^ ord($user[$i]);
        }
        return $diff === 0;
    }
}

// PHP 5.3 이하 호환 — http_response_code 폴리필
if (!function_exists('http_response_code')) {
    function http_response_code($code = null) {
        if ($code === null) {
            return isset($GLOBALS['__http_response_code']) ? $GLOBALS['__http_response_code'] : 200;
        }
        $texts = array(
            200 => 'OK', 201 => 'Created', 204 => 'No Content',
            301 => 'Moved Permanently', 302 => 'Found', 304 => 'Not Modified',
            400 => 'Bad Request', 401 => 'Unauthorized', 403 => 'Forbidden',
            404 => 'Not Found', 500 => 'Internal Server Error', 503 => 'Service Unavailable',
        );
        $text = isset($texts[$code]) ? $texts[$code] : 'Status';
        $protocol = isset($_SERVER['SERVER_PROTOCOL']) ? $_SERVER['SERVER_PROTOCOL'] : 'HTTP/1.0';
        header($protocol . ' ' . $code . ' ' . $text, true, $code);
        $GLOBALS['__http_response_code'] = $code;
        return $code;
    }
}

$debug = isset($_GET['debug']) && $_GET['debug'] === '1';
if ($debug) {
    ini_set('display_errors', '1');
    error_reporting(E_ALL);
} else {
    error_reporting(0);
}

header('Content-Type: application/json; charset=utf-8');

function fail($code, $body) {
    http_response_code($code);
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

// === 설정 로드 ===
$SYNC_TOKEN = '';
$SANITY_PROJECT_ID = '';
$SANITY_DATASET = '';
$SANITY_API_VERSION = '';
$SANITY_WRITE_TOKEN = '';
@include __DIR__ . '/sanity-config.php';

// === 토큰 인증 ===
$provided = isset($_GET['token']) ? (string) $_GET['token'] : '';
if (!is_string($SYNC_TOKEN) || $SYNC_TOKEN === ''
    || !hash_equals($SYNC_TOKEN, $provided)) {
    fail(403, array('ok' => false, 'error' => 'forbidden'));
}

if (!$SANITY_PROJECT_ID || !$SANITY_DATASET || !$SANITY_API_VERSION || !$SANITY_WRITE_TOKEN) {
    fail(500, array('ok' => false, 'error' => 'sanity-config.php missing required values'));
}

// === gnuboard 로드 + DB에서 두 보드 최근 5건 fetch ===
define('_GNUBOARD_', true);
$common_path = __DIR__ . '/common.php';
if (!file_exists($common_path)) {
    fail(500, array('ok' => false, 'error' => 'common.php not found', 'looked_at' => $common_path));
}
include_once $common_path;

function fetch_recent($board, $limit = 5) {
    global $g5;
    $table = $g5['write_prefix'] . $board;
    $sql = "SELECT wr_id, wr_subject, wr_datetime, wr_name, mb_id
            FROM `{$table}`
            WHERE wr_is_comment = 0
              AND (wr_option IS NULL OR wr_option NOT LIKE '%notice%')
            ORDER BY wr_datetime DESC
            LIMIT {$limit}";
    $result = sql_query($sql);
    $posts = array();
    while ($row = sql_fetch_array($result)) {
        $title = html_entity_decode(strip_tags($row['wr_subject']), ENT_QUOTES, 'UTF-8');
        $author = $row['wr_name'] ? $row['wr_name'] : $row['mb_id'];
        $wr_id = (string) $row['wr_id'];
        $item = array(
            '_key' => $wr_id,
            '_type' => 'communityPostItem',
            'wrId' => $wr_id,
            'title' => $title,
            'url' => 'https://audioguy.co.kr/community/bbs/board.php?bo_table=' . $board . '&wr_id=' . $wr_id,
        );
        $date = substr($row['wr_datetime'], 0, 10);
        if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
            $item['date'] = $date;
        }
        if ($author !== '') {
            $item['author'] = $author;
        }
        $posts[] = $item;
    }
    return $posts;
}

$jobs = fetch_recent('joh', 5);
$column = fetch_recent('c_audioguy', 5);

// === Sanity Mutations API 호출 ===
$updated_at = gmdate('Y-m-d\TH:i:s\Z');

$payload = json_encode(array(
    'mutations' => array(
        array(
            'createOrReplace' => array(
                '_id' => 'communityCache',
                '_type' => 'communityCache',
                'jobs' => $jobs,
                'column' => $column,
                'updatedAt' => $updated_at,
            ),
        ),
    ),
), JSON_UNESCAPED_UNICODE);

$sanity_url = "https://{$SANITY_PROJECT_ID}.api.sanity.io/v{$SANITY_API_VERSION}/data/mutate/{$SANITY_DATASET}";

if (!function_exists('curl_init')) {
    fail(500, array('ok' => false, 'error' => 'PHP cURL extension is not available on this host'));
}

$ch = curl_init($sanity_url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    'Content-Type: application/json',
    'Authorization: Bearer ' . $SANITY_WRITE_TOKEN,
));
$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curl_err = curl_error($ch);
curl_close($ch);

if ($http_code === 200) {
    echo json_encode(array(
        'ok' => true,
        'jobs' => count($jobs),
        'column' => count($column),
        'updatedAt' => $updated_at,
    ), JSON_UNESCAPED_UNICODE);
} else {
    $body = array(
        'ok' => false,
        'http_code' => $http_code,
        'curl_error' => $curl_err,
    );
    if ($debug) {
        $body['sanity_response'] = $response;
        $body['sanity_url'] = $sanity_url;
        // 토큰 자체는 노출하지 않되, 어떤 토큰을 쓰고 있는지 식별할 수 있도록
        // 앞 4자리 + 길이만 표시 (config 갱신이 반영됐는지 확인용).
        $body['token_prefix'] = substr($SANITY_WRITE_TOKEN, 0, 4);
        $body['token_length'] = strlen($SANITY_WRITE_TOKEN);
    } else {
        $body['hint'] = '?debug=1 추가하면 Sanity 응답 본문이 표시됩니다.';
    }
    fail(500, $body);
}
