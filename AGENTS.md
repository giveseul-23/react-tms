# Codex 프로젝트 작업 지침
이 저장소에서 코드를 변경하기 전에는 다음 문서를 읽고 지침을 따릅니다.

## 기본 참조 경로
- 기존 Sencha 소스:
  - C:\DEV_TMS\git\olympusboot3\olympusboot3\src\main\webapp\resource\app\vc\view
- 신규 React TypeScript 소스:
  - .\src\features\tms

## 외부 참조 소스
기존 Sencha 소스는 아래 경로를 우선 참조합니다.
- C:\DEV_TMS\git\olympusboot3\olympusboot3\src\main\webapp\resource\app\vc\view
React 전환 작업 시 대상 화면과 매칭되는 Sencha 파일을 먼저 확인합니다.

## 작업 원칙
이 저장소에서 코드를 변경하기 전에는 다음 문서를 읽고 지침을 따릅니다.
- CLAUDE.md
- docs/

직접 전달받은 사용자 지시와 충돌하지 않는 한, CLAUDE.md를 기본 프로젝트 지침으로 사용합니다.
특정 영역을 작업할 때는 코드를 수정하기 전에 docs/ 아래의 관련 문서를 먼저 확인합니다.
작업 종류별로 아래 문서를 우선 확인합니다.
- 화면 구조/View/Controller/Model/Api 작업: docs/claude/screen-architecture.md
- Grid 컬럼 작업: docs/claude/column-rules.md
- SearchFilters/조회조건 작업: docs/claude/search-style.md
- 엑셀 다운로드/업로드 작업: docs/claude/excel-download.md
- 팝업/모달 작업: docs/claude/popup.md
- 신규 화면 또는 유사 화면 선정: docs/claude/reference-screens.md
- 기존 화면 수정 시 표준 이탈 여부 확인: docs/standard-deviations.md

1. 요청받은 React 대상 경로의 기존 구현과 주변 패턴을 확인하고, 유사한 기존 React 화면을 1개 이상 확인합니다.
2. 대응되는 기존 Sencha 화면, Controller, Model, Service, 관련 공통 로직을 확인하고, 레이아웃(region/height/tab), grid authId, selection model, toolbar 버튼 위치, pagination 여부를 함께 비교합니다.
3. docs/ 아래의 관련 개발 기준 문서를 확인합니다.
4. 기존 React 프로젝트의 구조, 네이밍, 공통 컴포넌트, Grid/DataGrid 패턴에 맞춰 구현합니다.
5. Sencha 변환 시 Store/Model/Controller 역할은 React의 Model, Controller hook, Api 구조에 맞게 분리하고, Grid 컬럼/검색조건/버튼 권한/저장·삭제·재처리 흐름은 기존 동작을 보존합니다.

## 검증 원칙
- 변경 후 가능한 경우 `npm run build`를 실행하여 TypeScript/빌드 오류를 확인합니다.
- 빌드 실행이 불가능한 경우 최종 응답에 사유를 명시합니다.
- 화면 로직 변경 시 주요 사용자 동작 기준의 수동 검증 포인트를 함께 정리합니다.