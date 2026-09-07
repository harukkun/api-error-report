# Chrome 웹 스토어 등록 가이드 (사내용 · 비공개 unlisted)

대시보드 각 폼에 그대로 붙일 텍스트와 절차를 정리한 문서입니다. 대시보드: https://chrome.google.com/webstore/devconsole

## 0. 준비물

```bash
npm run package        # → release/network-error-report-<version>.zip
npm run store-assets   # → store/promo-tile-440x280.png, store/screenshot-*.png
```

- 개인정보처리방침 URL: `https://github.com/harukkun/api-error-report/blob/main/PRIVACY.md`
- 아이콘 128×128: `icons/icon128.png` (zip에 포함되어 자동 인식됨)

## 1. 등록 절차 체크리스트

1. **개발자 계정 등록**: 대시보드 접속 → 개발자 계약 동의 → 등록비 5달러 1회 결제. Google 계정에 **2단계 인증**이 켜져 있어야 함. 회사 계정으로 등록하면 이후 소유권 이전이 쉬움.
2. **새 항목**: "새 항목" → `release/network-error-report-<version>.zip` 업로드.
3. **스토어 등록정보 탭**: 아래 2절 텍스트 입력, 카테고리·언어 선택, 이미지 업로드.
4. **개인정보 보호 탭**: 아래 3절 그대로 입력.
5. **배포 탭**: 공개 상태를 **비공개(Unlisted)** 로 선택. 검색·카테고리에 노출되지 않고 링크를 아는 사람만 설치 가능. 심사는 공개와 동일하게 받음.
6. **검토를 위해 제출**. 보통 몇 시간~며칠. 반려 시 사유 메일이 오며 대부분 권한 사유·정책 URL 관련.
7. 승인 후 대시보드에서 **스토어 링크**를 복사해 사내에 공유. 링크에서 "Chrome에 추가" 한 번으로 설치되고 이후 자동 업데이트됨.

## 2. 스토어 등록정보 (Store listing)

**이름**
```
Network Error Report
```

**요약 (132자 이내)**
```
DevTools에서 에러 난 API 요청을 선택하면 URL·상태·헤더·페이로드·응답을 BE 디버깅 요청용 텍스트 리포트로 정리해 복사합니다.
```

**상세 설명**
```
웹 개발 중 API 요청이 실패하면 백엔드 개발자에게 요청/응답 정보를 전달해야 합니다. Network 탭에서 URL, 상태 코드, 헤더, 페이로드, 응답을 하나씩 복사하는 대신, 이 확장은 요청 하나를 선택하면 정리된 텍스트 리포트를 만들어 클립보드에 복사합니다.

주요 기능
• DevTools 패널 "Error Report" 탭에서 네트워크 요청 목록 확인 (기본: 4xx/5xx/실패한 API 요청만)
• 요청 선택 → 플레인 텍스트 리포트 즉시 미리보기 → 복사 버튼 한 번
• 리포트에 넣을 항목을 체크박스로 선택 (URL, 메서드, 상태, authorization, user-agent, 페이로드, 응답, 요청 시각, 소요 시간, Trace 헤더, cURL 재현 명령 등)
• authorization / cookie 기본 마스킹, 필요 시 토글로 전체 포함
• JWT 토큰 만료 시각 표시 (토큰 원문 미노출)
• 재현 단계 메모 입력
• 실패한 CORS preflight, 에러 난 페이지 요청도 표시
• multipart / form-urlencoded 페이로드 정리, cURL은 -F 로 생성

사용법
1. 페이지에서 F12 → 상단 탭 "Error Report"
2. 에러 요청 클릭
3. 복사 → Slack/Jira에 붙이기

데이터는 브라우저 안에서만 처리되며 외부로 전송되지 않습니다. 자세한 내용은 개인정보처리방침을 참고하세요.

※ 사내 개발팀 용도로 배포되는 확장입니다.
```

**카테고리**: 개발자 도구 (Developer Tools)
**언어**: 한국어

**이미지**
- 스토어 아이콘 128×128: zip의 `icons/icon128.png` 자동 사용
- 스크린샷 (1280×800): `store/screenshot-1-1280x800.png`, `store/screenshot-2-1280x800.png`
- 소형 프로모션 타일 (440×280, 필수): `store/promo-tile-440x280.png`

**공식 URL / 홈페이지**: `https://github.com/harukkun/api-error-report`
**지원 URL**: `https://github.com/harukkun/api-error-report/issues`

## 3. 개인정보 보호 (Privacy practices)

**단일 목적 설명**
```
Chrome DevTools에서 사용자가 선택한 네트워크 요청의 정보(URL, 메서드, 상태 코드, 헤더, 페이로드, 응답)를 백엔드 디버깅 요청용 텍스트 리포트로 정리하고 클립보드에 복사합니다.
```

**권한 사유**

- `storage`
```
리포트에 표기할 필드 선택, 목록 필터 기본값, Trace 헤더 이름 목록 등 사용자 설정을 저장하는 데 사용합니다. 네트워크 요청 내용은 저장하지 않습니다.
```
- `devtools_page`
```
DevTools에 "Error Report" 패널을 추가하고, chrome.devtools.network API로 현재 탭의 네트워크 요청 정보를 읽어 리포트를 구성하는 데 사용합니다. DevTools가 열려 있는 동안만 동작합니다.
```

**원격 코드를 사용하나요?** → 아니오. 모든 코드가 패키지에 포함되어 있습니다.

**데이터 사용 (Data usage)**
- 수집하는 사용자 데이터 항목: **모두 체크 해제** (개인 식별 정보, 건강, 금융, 인증 정보, 개인 통신, 위치, 웹 기록, 사용자 활동, 웹사이트 콘텐츠 — 어느 것도 수집·전송하지 않음)
  - 참고: 확장은 인증 헤더와 응답 본문을 화면에 **표시**하지만, 이를 수집·저장·전송하지 않고 브라우저 메모리에서만 처리합니다. 심사 중 질의가 오면 이 점을 답변.
- 다음 3개 확인 항목 **모두 체크**:
  - 승인된 용도 외로 사용자 데이터를 판매하거나 이전하지 않습니다
  - 항목의 단일 목적과 무관한 용도로 사용자 데이터를 사용·이전하지 않습니다
  - 신용도 판단이나 대출 목적으로 사용자 데이터를 사용·이전하지 않습니다

**개인정보처리방침 URL**
```
https://github.com/harukkun/api-error-report/blob/main/PRIVACY.md
```

## 4. 업데이트 절차

1. `package.json`과 `manifest.json`의 `version`을 **둘 다** 올린다 (예: 0.1.0 → 0.1.1). 다르면 `npm run package`가 멈춘다.
2. `npm run package`
3. 대시보드 → 해당 항목 → 패키지 → **새 패키지 업로드** → zip 선택
4. 등록정보에 변경이 있으면 수정 후 **검토를 위해 제출**. 설치된 사용자에게는 승인 후 수 시간 내 자동 업데이트.

## 5. 나중에 Workspace 도메인 한정으로 바꾸려면

회사가 Google Workspace를 쓰고 **게시자 계정이 그 도메인 계정**이면, 배포 탭의 공개 상태에서 "비공개 → 특정 도메인의 사용자만"을 선택할 수 있습니다. 도메인 외부 사용자는 링크가 있어도 설치할 수 없어 unlisted보다 엄격합니다. 개인 Gmail로 게시한 항목은 이 옵션이 나타나지 않으므로, 이 방식이 필요하면 처음부터 회사 계정으로 등록하는 것이 좋습니다.
