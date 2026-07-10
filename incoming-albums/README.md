# AG Studio DISCOGRAPHY 앨범 5개 등록

이 폴더에 **커버 사진**을 넣고 **albums.json**을 채워주세요.
다 되면 저(Claude)에게 "넣었어"라고 하면, 커버를 Sanity에 업로드하고
Discography Entry 문서(brand = **audioguy**)를 5개 만들어 AG Studio DISCOGRAPHY에 노출시킵니다.

## 1) 커버 사진
- 파일명: `1.jpg`, `2.jpg`, `3.jpg`, `4.jpg`, `5.jpg` (jpg/png/webp 무엇이든, 제가 정사각으로 처리)
- **정사각(1:1) 앨범 커버**가 가장 잘 맞습니다. (표시가 aspect-square)

## 2) albums.json 채우기
각 항목에 아래를 입력:
- `title`   : 앨범명 (필수)
- `artist`  : 아티스트 (필수)
- `releaseDate` : 발매일 `YYYY-MM-DD` (필수) — 없으면 대략이라도 OK
- `file`    : 위에서 넣은 커버 파일명 (기본 1~5.jpg 그대로면 안 바꿔도 됨)

예시:
```json
[
  { "file": "1.jpg", "title": "Album One", "artist": "아티스트A", "releaseDate": "2025-03-01" },
  { "file": "2.jpg", "title": "Album Two", "artist": "아티스트B", "releaseDate": "2025-02-10" }
]
```

## 참고
- 5개 미만만 넣어도 됩니다 (빈 항목은 title이 비어 있으면 제가 건너뜁니다).
- 이 앨범들은 최신 생성순으로 AG Studio DISCOGRAPHY(최근 5개)에 표시되고, `/discography` 목록에도 audioguy 브랜드로 함께 나옵니다.
