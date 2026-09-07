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

- 왼쪽 목록: 기본으로 **에러(4xx/5xx/실패)** + **XHR/fetch** 만 표시. 토글로 전체 보기, URL 검색 가능.
- 요청 클릭 → 오른쪽 **리포트** 탭에 플레인 텍스트 미리보기. **복사** 버튼으로 클립보드에 복사.
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
npm run icons       # icons/icon.svg → PNG 3종
npm run build       # dist/ 생성
npx vite preview    # dist/src/panel/panel.html 을 브라우저에서 목 데이터로 확인
```
