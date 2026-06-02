<?php
/**
 * audioguy.co.kr 커뮤니티 → 메인 사이트 JSON 엔드포인트 (v5 — 토큰 인증)
 *
 * 업로드 위치: audioguy.co.kr/community/recent.php (common.php와 같은 폴더)
 *
 * 변경점 (v4 → v5):
 *   - 토큰 인증(?token=...) 추가. 유효 토큰 없으면 403.
 *     Cafe24 방화벽에서 미국 등 IP를 허용해도 무단 봇 접근 차단.
 *
 * 호출:
 *   https://audioguy.co.kr/community/recent.php?board=joh&token=<TOKEN>
 *   https://audioguy.co.kr/community/recent.php?board=c_audioguy&token=<TOKEN>
 *   ?debug=1 추가 시 캐시 상태/에러 표시
 */

if (!defined('JSON_UNESCAPED_UNICODE')) {
    define('JSON_UNESCAPED_UNICODE', 256);
}

// PHP 5.5 이하 호환 — hash_equals 폴리필 (타이밍 공격 방어)
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

$debug = isset($_GET['debug']) && $_GET['debug'] === '1';
if ($debug) {
    ini_set('display_errors', '1');
    error_reporting(E_ALL);
} else {
    error_reporting(0);
}

$json_ct = 'Content-Type: application/json; charset=utf-8';
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header($json_ct);

// === 토큰 인증 (외부 무단 접근 차단) ===
// 토큰은 같은 폴더의 `recent-config.php`에서 읽음. 그 파일은 git에 안
// 들어가고 FTP로만 업로드함 (recent-config.php.example 참조).
// 같은 토큰 값을 GitHub Secret `COMMUNITY_API_TOKEN`과 로컬 .env.local에도
// 동일하게 등록해야 sync가 통과함.
$EXPECTED_TOKEN = '';
@include __DIR__ . '/recent-config.php';

$provided_token = isset($_GET['token']) ? (string) $_GET['token'] : '';
if (!is_string($EXPECTED_TOKEN) || $EXPECTED_TOKEN === ''
    || !hash_equals($EXPECTED_TOKEN, $provided_token)) {
    http_response_code(403);
    echo json_encode(array('error' => 'forbidden'));
    exit;
}

// 허용 게시판
$ALLOWED = array('joh', 'c_audioguy');
$board = isset($_GET['board']) ? trim($_GET['board']) : '';
$limit = isset($_GET['limit']) ? max(1, min(20, (int) $_GET['limit'])) : 5;

if (!in_array($board, $ALLOWED, true)) {
    echo json_encode(array('error' => 'invalid board'));
    exit;
}

// === 캐시 디렉토리 후보 — 쓰기 가능한 위치 자동 탐지 ===
$here = dirname(__FILE__);
$cache_candidates = array(
    $here . '/cache-recent',         // 1순위: recent.php 옆 (보통 쓰기 가능)
    $here . '/data/cache-recent',    // 2순위: gnuboard data 폴더 안
    sys_get_temp_dir() . '/audioguy-recent', // 3순위: 시스템 임시 (항상 쓰기 가능)
);
$cache_dir = null;
foreach ($cache_candidates as $dir) {
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }
    if (is_dir($dir) && is_writable($dir)) {
        $cache_dir = $dir;
        break;
    }
}

$cache_file = $cache_dir ? ($cache_dir . '/' . $board . '.json') : null;
$cache_ttl = 300; // 5분

// === 캐시 hit이면 DB 안 거치고 즉시 응답 ===
if ($cache_file && file_exists($cache_file) && (time() - filemtime($cache_file)) < $cache_ttl) {
    $cached = file_get_contents($cache_file);
    if ($cached !== false && strlen($cached) >= 2) {
        if ($debug) echo "[cache HIT] " . $cache_file . "\n";
        echo $cached;
        exit;
    }
}

if ($debug) {
    echo "[cache MISS] cache_dir=" . ($cache_dir ?: 'none') . "\n";
}

// === 캐시 miss — gnuboard 로드 + DB 조회 ===
define('_GNUBOARD_', true);
$common_path = $here . '/common.php';
if (!file_exists($common_path)) {
    echo json_encode(array('error' => 'common.php not found', 'looked_at' => $common_path));
    exit;
}
include_once $common_path;

if (!headers_sent()) {
    header($json_ct);
}

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
    $posts[] = array(
        'id'     => (string) $row['wr_id'],
        'title'  => $title,
        'date'   => substr($row['wr_datetime'], 0, 10),
        'author' => $author,
        'url'    => 'https://audioguy.co.kr/community/bbs/board.php?bo_table=' . $board . '&wr_id=' . $row['wr_id'],
    );
}

$json = json_encode($posts, JSON_UNESCAPED_UNICODE);

// === 캐시 파일에 쓰기 (실패해도 응답은 정상) ===
if ($cache_file) {
    @file_put_contents($cache_file, $json, LOCK_EX);
    if ($debug) echo "[cache WRITE] " . $cache_file . "\n";
}

echo $json;
