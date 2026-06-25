# Local Environment

이 문서는 사용자 PC마다 달라질 수 있는 로컬 경로 설정 기준입니다.

## 1. Sencha 참조 소스 경로

기존 Sencha 소스 루트는 개인별 설치 위치가 다를 수 있으므로 절대경로를 문서에 하드코딩하지 않습니다.

Sencha View 루트는 `.env.local`의 로컬 프로퍼티 `SENCHA_VIEW_ROOT`로 지정합니다.

예:

```env
SENCHA_VIEW_ROOT=<개인 Sencha view root 경로>
```

`.env.local`은 Git 추적 대상이 아니므로 개인 PC의 실제 경로를 저장할 수 있습니다.

작업 중 Sencha 소스를 확인할 때는 아래 기준을 사용합니다.

- `.env.local` 파일이 없으면 새로 만들고 `SENCHA_VIEW_ROOT`를 등록합니다.
- `.env.local` 파일은 있지만 `SENCHA_VIEW_ROOT`가 없으면 기존 내용을 유지한 채 해당 키를 추가합니다.
- `.env.local`에 `SENCHA_VIEW_ROOT`가 설정되어 있으면 해당 경로를 기준으로 대상 화면 파일을 찾습니다.
- `.env.local`에 `SENCHA_VIEW_ROOT`가 설정되어 있지 않으면 사용자에게 로컬 Sencha View 루트 경로를 확인합니다.
- 신규 지침 문서에는 개인 PC의 Sencha 절대경로를 추가하지 않습니다.
- 기존 작업 기록에 이미 남아 있는 절대경로는 당시 검증 증적으로 보고 임의 변경하지 않습니다.

## 2. React 소스 경로

React TypeScript 소스는 현재 저장소 기준 상대경로를 사용합니다.

기본 업무 화면 경로:

```text
src/features/tms
```

현재 저장소 안에서 로딩되므로 별도 로컬 프로퍼티를 두지 않습니다.
