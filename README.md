# Network Error Report

Chrome DevTools 패널 확장. 네트워크 요청 리스트에서 요청을 선택하면 BE 디버깅 요청에 바로 붙일 수 있는 플레인 텍스트 에러 리포트를 생성하고 클립보드로 복사합니다.

## 설치 (개발자 모드)

```bash
npm install
npm run build
```

1. `chrome://extensions` → 우측 상단 **개발자 모드** 켬
2. **압축해제된 확장 프로그램을 로드합니다** → 이 저장소의 `dist/` 폴더 선택
3. 아무 페이지에서 DevTools(F12) → 상단 탭 **Error Report**

DevTools가 열려 있는 동안 발생한 요청만 캡처됩니다 (Network 탭과 동일).

## 사용

- 왼쪽 목록: 기본으로 **에러(4xx/5xx/실패)** + **API 요청**만 표시. API 요청은 XHR/fetch이며, HAR에 리소스 타입이 없으면 `accept`/`content-type` 헤더로 추정합니다. 에러가 난 페이지(document) 요청과 실패한 CORS preflight(OPTIONS)는 항상 포함됩니다. 토글로 전체 보기, URL 검색 가능.
- 요청 클릭 → 오른쪽 **리포트** 탭에 플레인 텍스트 미리보기. **메모 / 재현 단계**를 입력하면 리포트 상단에 포함됩니다(요청별로 유지). **복사** 버튼으로 클립보드에 복사.
- **토큰 만료** 필드를 체크하면 authorization이 JWT일 때 `exp`를 디코드해 만료 시각과 남은 시간을 표시합니다. 토큰 원문은 노출되지 않습니다.
- form 페이로드(`multipart/form-data`, `x-www-form-urlencoded`)는 키/값 객체로 표시되고, cURL은 multipart일 때 `-F` 옵션으로 생성됩니다.
- 패널 테마는 DevTools 테마 설정을 따릅니다.
- 오른쪽 **표기 필드** 체크박스로 리포트에 넣을 항목을 선택. 기본 선택은 URL, Method, authorization, user-agent, Payload, Status, Response 7개. 체크 상태는 `chrome.storage.sync`에 저장.
- `authorization`/`cookie`는 기본 마스킹. **토큰 전체 포함**을 켜면 원문이 들어가며, 다른 요청을 선택하면 다시 마스킹으로 돌아갑니다.
- **원본** 탭: Headers / Payload / Response / cURL 원문.
- **설정** 탭: 기본 필터, 마스킹, 응답 최대 길이, Trace 헤더 목록.

## 필드 추가 방법

`src/lib/fields.ts`의 `FIELDS` 배열에 항목을 추가하면 체크박스와 리포트에 자동 반영됩니다.

## 아이콘

`icons/icon.svg`가 원본입니다. 수정 후 `npm run icons`를 실행하면 16/48/128 PNG가 다시 생성됩니다. 16px 전용 굵기 조정은 SVG 요소의 `data-s16` 속성으로 지정합니다.

## 개발

```bash
npm test            # vitest
npm run icons        # icons/icon.svg → PNG 3종
npm run build        # dist/ 생성
npm run package      # dist → release/network-error-report-<version>.zip (버전 일치 검사 포함)
npm run store-assets # store/ 프로모션 타일 + 스크린샷 생성 (Chrome headless 사용)
npx vite preview    # dist/src/panel/panel.html 을 브라우저에서 목 데이터로 확인
```

## 웹 스토어 배포

사내용(비공개 unlisted) 등록 절차와 대시보드에 붙일 텍스트는 [docs/STORE_LISTING.md](docs/STORE_LISTING.md), 개인정보처리방침은 [PRIVACY.md](PRIVACY.md)를 참고하세요.
