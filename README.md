# 성가노트 · 목동성당 / 신정동성당

Cloudflare Pages용 공개 성가표입니다. ChatGPT Sites 로그인·저장소 없이 운영합니다.

## 배포 설정

Cloudflare → Workers & Pages → Create application → Pages → Connect to Git에서 `azolazol/parish-hymns`를 선택합니다.

| 항목 | 값 |
|---|---|
| 프로젝트 이름 | parish-hymns (사용 중이면 다른 이름) |
| Production branch | main |
| Framework preset | None |
| Build command | 비워두기 |
| Build output directory | public |
| Root directory | 기본값 유지 |

GitHub의 Settings → Pages는 설정하지 않아도 됩니다. 저장소는 비공개, Cloudflare의 방문자 사이트는 공개로 운영합니다.

## 현재 포함된 자료

- 목동성당: 2026년 10월 33개 일정 / 11월 32개 일정
- 신정동성당: 2026년 10월 31일+날짜 미기재 성시간 / 11월 31개 날짜별 일정+성시간
- 원본 사진 4장, 날짜별 유튜브 검색, 월별 선택, 원본 다운로드
- 첫 접속 시 최신 등록 월을 선택합니다.
- 관리자 업데이트는 GitHub 권한으로 보호합니다. 사이트 안에서 사진 업로드·자동 OCR은 제공하지 않습니다.

## 매월 업데이트

1. 원본을 `public/sources/mokdong-2026-12.jpeg`처럼 새 이름으로 추가합니다.
2. 해당 성당의 `public/data/mokdong.json` 또는 `shinjeong.json`을 편집합니다.
3. `months` 안에 새 연월 객체를 추가하고 기존 월은 남겨둡니다.
4. `songs`는 입당·봉헌(예물준비)·성체·파견의 네 배열입니다. 빈 칸은 `[]`, 여러 곡은 `[151,163,157]`처럼 입력합니다.
5. 같은 날 별도 미사는 별도 항목으로 넣고 `id`를 고유하게 정합니다. 날짜 미기재는 `day: 0`입니다.
6. 사진과 번호를 대조하고 커밋하면 Cloudflare가 자동 배포합니다.

예시:

```json
"2026-12": {
  "month": "2026-12",
  "source": "sources/mokdong-2026-12.jpeg",
  "fileName": "목동성당_2026-12_성가표.jpeg",
  "entries": [
    {"id":"2026-12-1","day":1,"label":"미사 이름","songs":[[38],[218,219],[151,163,157],[294]]}
  ]
}
```

성가표 사진을 ChatGPT나 Codex에 올려 월별 JSON 변경을 요청할 수도 있습니다. 자동 인식한 번호는 원본 확인이 필요합니다.

## 방문자 카운터 (선택 설정)

`functions/api/visits.js`는 Cloudflare D1이 연결되어야 동작합니다. 연결 전에는 카운터를 숨깁니다.

1. Cloudflare D1 데이터베이스를 생성합니다.
2. D1 콘솔에서 저장소의 `schema.sql`을 실행합니다.
3. Pages 프로젝트의 Settings → Bindings에서 D1을 연결하고 Variable name을 `DB`로 지정합니다.
4. 재배포합니다.

전체·오늘 집계는 성당별로 구분하며 한국 시간 기준입니다. 같은 브라우저의 반복 방문을 중복 제외합니다. 쿠키 삭제·다른 기기는 별도 방문자로 집계됩니다. 기존 Sites 방문 통계는 이전되지 않았으며 연결 후 새로 집계합니다.

## 보관과 복구

원본 이미지와 번호는 GitHub에 누적됩니다. 코드·JSON은 Git 변경 이력으로 복구할 수 있습니다. GitHub의 Code → Download ZIP으로 별도 백업할 수 있습니다. D1 방문 통계는 GitHub ZIP에 포함되지 않으므로 필요 시 D1을 별도로 내보냅니다.

## 주소

- `/` 또는 `/?parish=mokdong`: 목동성당
- `/?parish=shinjeong`: 신정동성당 (보라색)
- `/?parish=shinjeong&month=2026-11`: 특정 월 바로가기
