# 개인정보처리방침 (Privacy Policy) — Network Error Report

최종 수정: 2026-09-07

Network Error Report(이하 "확장")는 Chrome DevTools 패널 확장 프로그램입니다. DevTools가 열린 탭에서 발생한 네트워크 요청 정보를 정리해 텍스트 리포트로 만들고, 사용자가 누른 버튼에 따라 클립보드에 복사합니다.

## 1. 수집하는 개인정보

확장은 **어떤 개인정보도 수집하지 않습니다.** 사용자 계정, 식별자, 사용 통계, 분석 데이터를 수집하거나 기록하지 않습니다.

## 2. 처리하는 데이터와 처리 위치

- 확장은 Chrome DevTools API(`chrome.devtools.network`)를 통해 **DevTools가 열려 있는 동안** 해당 탭의 네트워크 요청 정보(URL, 메서드, 상태 코드, 요청/응답 헤더, 요청 본문, 응답 본문)를 읽습니다.
- 이 데이터는 **사용자의 브라우저 안에서만** 처리되며, DevTools 패널의 메모리에만 존재합니다. DevTools를 닫거나 페이지를 이동하면 사라집니다.
- 확장은 이 데이터를 **어떤 외부 서버로도 전송하지 않습니다.** 네트워크 통신 기능이 없습니다.
- 데이터가 브라우저 밖으로 나가는 유일한 경로는 사용자가 **"복사" 버튼을 직접 눌러** 리포트를 클립보드에 복사하는 경우입니다. 복사된 내용을 어디에 붙이고 누구와 공유할지는 전적으로 사용자의 선택과 책임입니다.

## 3. 저장하는 데이터

확장은 다음 **사용자 설정만** `chrome.storage.sync`에 저장합니다.

- 리포트에 표기할 필드 선택
- 목록 필터 기본값, 응답 본문 최대 길이, 마스킹 기본값
- Trace 헤더 이름 목록

네트워크 요청 내용(헤더, 토큰, 본문 등)은 **저장하지 않습니다.** `chrome.storage.sync`는 Chrome 계정 동기화를 켠 경우 사용자의 Google 계정을 통해 기기 간 동기화될 수 있으며, 이는 Chrome의 정책을 따릅니다.

## 4. 민감 정보 취급

- `authorization`, `cookie`, `set-cookie`, `x-api-key` 헤더는 리포트에서 **기본적으로 마스킹**됩니다(앞 6자, 뒤 4자만 표시).
- 사용자가 "토큰 전체 포함" 토글을 켜면 원문이 리포트에 포함됩니다. 이 토글은 다른 요청을 선택하면 자동으로 다시 마스킹 상태로 돌아갑니다.
- "토큰 만료" 필드는 JWT의 `exp` 값을 브라우저 안에서 디코드해 만료 시각만 표시하며, 토큰 원문을 노출하거나 검증 서버에 보내지 않습니다.

## 5. 사용하는 권한

| 권한 | 용도 |
|---|---|
| `storage` | 3항의 사용자 설정 저장 |
| `devtools_page` | DevTools 패널 등록 및 네트워크 요청 정보 읽기 |

호스트 권한, 탭 접근 권한, 원격 코드 실행은 사용하지 않습니다.

## 6. 제3자 제공

확장은 어떤 데이터도 제3자에게 제공하지 않으며, 광고·분석·추적 SDK를 포함하지 않습니다.

## 7. 변경 사항

이 방침이 바뀌면 이 문서의 최종 수정일을 갱신하고 저장소 커밋 이력에 기록합니다.

## 8. 문의

https://github.com/harukkun/api-error-report/issues

---

## Summary (English)

Network Error Report is a Chrome DevTools panel extension. It reads network request data (URL, method, status, headers, bodies) of the inspected tab **only while DevTools is open**, formats it into a plain-text report, and copies it to the clipboard **only when the user clicks the copy button**. It does **not collect, store, or transmit** any request data or personal information. The only stored data is user preferences (field selection, filters, trace header names) in `chrome.storage.sync`. Sensitive headers (`authorization`, `cookie`) are masked by default. No analytics, no remote code, no third-party sharing. Permissions used: `storage`, `devtools_page`.
