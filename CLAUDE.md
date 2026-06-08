# CLAUDE.md

이 파일은 본 저장소(react-tms-carr-ts-pr)에서 작업하는 Claude(Claude Code)에 대한 지침 **인덱스**입니다.
세부 규칙은 주제별로 `docs/claude/` 에 분리되어 있으며, 아래 `@import` 로 자동 로드됩니다.

---

## 가장 중요 (요약)

- **모든 코드 수정/추가/삭제 전에 한국어로 계획을 설명하고 사용자 OK 후에만 변경한다.** (조회·검색은 확인 불필요) — 상세: `docs/claude/dev-workflow.md` §1
- **리팩터링/구조변경 시 시각 결과물(className·inline style·DOM 구조)은 byte-for-byte 보존.** — 상세: `docs/claude/dev-workflow.md` §2
- **조회조건(SearchFilters) 스타일이 가장 중요** — 임의 변경 금지, 토큰 준수: `docs/claude/search-style.md`

---

## 문서 맵

| 주제 | 파일 |
|---|---|
| 개발 방식 (작업 전 확인·스타일 금지·기타·메모리) | `docs/claude/dev-workflow.md` |
| 화면 구조 (base hook·preset·View/Controller/Model/Api) | `docs/claude/screen-architecture.md` |
| 컬럼 규칙 (편집 정책·위젯 타입·audit) | `docs/claude/column-rules.md` |
| 엑셀 다운로드 표준 | `docs/claude/excel-download.md` |
| 팝업(모달) 규칙 | `docs/claude/popup.md` |
| **조회조건 스타일 표준 ★** | `docs/claude/search-style.md` |
| 복잡도별 참조 화면 | `docs/claude/reference-screens.md` |

---

@docs/claude/dev-workflow.md
@docs/claude/screen-architecture.md
@docs/claude/column-rules.md
@docs/claude/excel-download.md
@docs/claude/popup.md
@docs/claude/search-style.md
@docs/claude/reference-screens.md
