<?php
/**
 * audioguy.co.kr 커뮤니티 → 메인 사이트(audioguy 리뉴얼) JSON 엔드포인트
 *
 * 메인 사이트 홈의 "커뮤니티 미리보기" 섹션이 이 파일을 호출해서 최신 게시글
 * 5개를 JSON으로 받아갑니다. gnuboard DB를 직접 조회하므로 정확하고, 같은
 * 호스팅(localhost) DB라 외부 IP 차단·HTML 스크래핑 문제 없음.
 *
 * 업로드 위치: audioguy.co.kr/community/recent.php
 *   (gnuboard의 common.php와 같은 디렉토리)
 * 호출 URL:
 *   https://audioguy.co.kr/community/recent.php?board=joh
 *   https://audioguy.co.kr/community/recent.php?board=c_audioguy
 *
 * 보안:
 *  - board 파라미터는 화이트리스트만 허용 (SQL 인젝션 방지)
 *  - LIMIT 범위 제한
 *  - SELECT만 수행, 절대 쓰지 않음
 *  - DB 비밀번호는 기존 gnuboard 설정(dbconfig.php) 재사용 — 따로 노출 없음
 */

// 외부 도메인(Vercel)에서 가져갈 수 있게 CORS 허용
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=300'); // 5분간 응답 캐시

// gnuboard 환경 로드 (DB 핸들·sql_query 함수 사용)
define('_GNUBOARD_', true);
include_once dirname(__FILE__) . '/common.php';

// 허용 게시판 화이트리스트 — 두 개만 허용
$ALLOWED = array('joh', 'c_audioguy');

$board = isset($_GET['board']) ? trim($_GET['board']) : '';
$limit = isset($_GET['limit']) ? max(1, min(20, (int)$_GET['limit'])) : 5;

if (!in_array($board, $ALLOWED, true)) {
    http_response_code(400);
    echo json_encode(array('error' => 'invalid board'));
    exit;
}

// gnuboard 5의 글 테이블 이름: g5_write_{bo_table}
$table = $g5['write_prefix'] . $board;

// 메인 글만 (댓글 제외), 공지글 제외, 최신순
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
    $posts[] = array(
        'id'     => (string)$row['wr_id'],
        'title'  => $title,
        'date'   => substr($row['wr_datetime'], 0, 10), // YYYY-MM-DD
        'author' => $row['wr_name'] ?: $row['mb_id'],
        'url'    => 'https://audioguy.co.kr/community/bbs/board.php?bo_table=' . $board . '&wr_id=' . $row['wr_id'],
    );
}

echo json_encode($posts, JSON_UNESCAPED_UNICODE);
