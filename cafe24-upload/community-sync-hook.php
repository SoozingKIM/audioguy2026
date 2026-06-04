<?php
/**
 * gnuboard 글 작성 / 수정 / 삭제 시 sync-to-sanity.php를 호출하는 hook.
 *
 * 사용법:
 *   1) 이 파일을 audioguy.co.kr/community/community-sync-hook.php 에 업로드
 *      (sync-to-sanity.php와 같은 폴더).
 *   2) gnuboard의 `bbs/write_update.php` 마지막 부분(글 저장 후 redirect 직전)
 *      에 다음 한 줄 추가:
 *
 *        include_once G5_PATH . '/community/community-sync-hook.php';
 *
 *      (보통 파일 끝 `goto_url(...)` 또는 alert_close 호출 바로 앞)
 *
 *   3) 삭제 시에도 트리거하려면 `bbs/delete.php` 마지막에도 같은 한 줄 추가.
 *
 * 동작:
 *   - 현재 보드($bo_table)가 `joh` 또는 `c_audioguy`일 때만 동작.
 *   - sanity-config.php에서 $SYNC_TOKEN을 읽어 sync-to-sanity.php에 GET 호출.
 *   - cURL 짧은 타임아웃(500ms)으로 fire-and-forget — sync-to-sanity.php는
 *     백그라운드에서 계속 실행되어 Sanity까지 push 완료. 글 쓰기 응답은
 *     hook 때문에 거의 안 느려짐.
 *
 * 안전:
 *   - 토큰이 hook 파일에 박혀있지 않음 (sanity-config.php에서 동적으로 읽음).
 *   - sanity-config.php 없으면 조용히 return (gnuboard 정상 동작에 영향 없음).
 *   - 어떤 에러가 발생해도 글 쓰기 흐름을 막지 않음 (@ 연산자로 suppress).
 */

// 디버그 — hook 호출이 어디까지 도달하는지 추적. 디버깅 끝나면 지워도 됨.
@file_put_contents(
    __DIR__ . '/sync-debug.log',
    '[' . date('c') . '] hook entered'
        . ' _GNUBOARD_=' . (defined('_GNUBOARD_') ? '1' : '0')
        . ' bo_table=' . (isset($bo_table) ? $bo_table : '-')
        . "\n",
    FILE_APPEND | LOCK_EX
);

if (!defined('_GNUBOARD_')) return;

// 우리 사이트 홈에 노출되는 두 보드만 처리. 다른 보드는 무시.
if (!isset($bo_table) || !in_array($bo_table, array('joh', 'c_audioguy'), true)) {
    @file_put_contents(
        __DIR__ . '/sync-debug.log',
        '[' . date('c') . '] hook skipped — board not in allowlist (was: '
            . (isset($bo_table) ? $bo_table : '-') . ")\n",
        FILE_APPEND | LOCK_EX
    );
    return;
}

// 같은 폴더의 sanity-config.php에서 토큰 가져옴.
$_config_path = __DIR__ . '/sanity-config.php';
if (!file_exists($_config_path)) return;

$SYNC_TOKEN = '';
@include $_config_path;
if (!is_string($SYNC_TOKEN) || $SYNC_TOKEN === '') return;

if (!function_exists('curl_init')) return;

// G5_URL이 없으면 (직접 호출 등) hook 작동 불가 — 그냥 종료.
if (!defined('G5_URL')) return;

$_hook_url = G5_URL . '/community/sync-to-sanity.php'
    . '?token=' . urlencode($SYNC_TOKEN)
    . '&from=gnuboard'
    . '&board=' . urlencode($bo_table);

@file_put_contents(
    __DIR__ . '/sync-debug.log',
    '[' . date('c') . '] hook firing curl: ' . $_hook_url . "\n",
    FILE_APPEND | LOCK_EX
);

$_ch = @curl_init($_hook_url);
if ($_ch !== false) {
    @curl_setopt($_ch, CURLOPT_RETURNTRANSFER, true);
    // 짧은 timeout으로 끊되 sync-to-sanity.php는 ignore_user_abort(true)
    // 덕분에 백그라운드에서 끝까지 실행됨.
    @curl_setopt($_ch, CURLOPT_TIMEOUT_MS, 800);
    @curl_setopt($_ch, CURLOPT_CONNECTTIMEOUT_MS, 800);
    @curl_setopt($_ch, CURLOPT_NOSIGNAL, true);
    $_resp = @curl_exec($_ch);
    $_err = @curl_error($_ch);
    $_code = @curl_getinfo($_ch, CURLINFO_HTTP_CODE);
    @curl_close($_ch);
    @file_put_contents(
        __DIR__ . '/sync-debug.log',
        '[' . date('c') . '] hook curl done http=' . $_code
            . ' err=' . substr($_err, 0, 80)
            . ' resp=' . substr(is_string($_resp) ? $_resp : '', 0, 120)
            . "\n",
        FILE_APPEND | LOCK_EX
    );
}

// 정리 — gnuboard 전역에 변수 누수 방지.
unset($SYNC_TOKEN, $_config_path, $_hook_url, $_ch);
