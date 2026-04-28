// src/app/components/grid/commonColumns.tsx
//
// 공통 그리드 컬럼 팩토리.
// 기존 Columns 파일들에 반복적으로 등장하던
// 삭제(_delete), 상태(EDIT_STS), 생성자/생성일/수정자/수정일 컬럼을
// 개별 설정값으로 켜고 끌 수 있도록 제공한다.
//
// 주의: className / DOM 구조 / onChange 동작은 기존 코드와 byte-for-byte 동일하게 유지.

export const makeDeleteColumn = (setRowData?: (updater: any) => void) => ({
  type: "text",
  headerName: "LBL_DELETE",
  field: "_delete",
  width: 60,
  filter: false,
  floatingFilter: false,
  cellRenderer: (params: any) => {
    if (!params.data._isNew) return null;
    return (
      <div className="flex items-center justify-center h-full">
        <input
          type="checkbox"
          className="ag-input-field-input ag-checkbox-input"
          onChange={(e) => {
            if (e.target.checked) {
              setRowData?.((prev: any) =>
                prev.filter((row: any) => row !== params.data),
              );
            }
          }}
        />
      </div>
    );
  },
});

export const makeRowStatusColumn = (overrides: Record<string, any> = {}) => ({
  type: "text",
  headerName: "LBL_ROW_STATUS",
  field: "EDIT_STS",
  width: 80,
  ...overrides,
});

export const makeInsertPersonColumn = (
  overrides: Record<string, any> = {},
) => ({
  type: "text",
  headerName: "LBL_INSERT_PERSON_ID",
  field: "CRE_USR_ID",
  ...overrides,
});

export const makeInsertDateColumn = (overrides: Record<string, any> = {}) => ({
  type: "date",
  headerName: "LBL_INSERT_DATE",
  field: "CRE_DTTM",
  ...overrides,
});

export const makeUpdatePersonColumn = (
  overrides: Record<string, any> = {},
) => ({
  type: "text",
  headerName: "LBL_UPDATE_PERSON_ID",
  field: "UPD_USR_ID",
  ...overrides,
});

export const makeUpdateTimeColumn = (overrides: Record<string, any> = {}) => ({
  type: "date",
  headerName: "LBL_UPDATE_TIME",
  field: "UPD_DTTM",
  ...overrides,
});

export type AuditColumnsConfig = {
  delete?: boolean;
  deleteSetRowData?: (updater: any) => void;
  rowStatus?: boolean;
  rowStatusOverrides?: Record<string, any>;
  insertPerson?: boolean;
  insertPersonOverrides?: Record<string, any>;
  insertDate?: boolean;
  insertDateOverrides?: Record<string, any>;
  updatePerson?: boolean;
  updatePersonOverrides?: Record<string, any>;
  updateTime?: boolean;
  updateTimeOverrides?: Record<string, any>;
};

/**
 * 설정값으로 삭제/상태/생성/수정 컬럼을 묶어서 반환.
 * 기존 파일에서 반복되던 블록을 `...makeAuditColumns({ ... })` 스프레드로 치환할 수 있다.
 */
export function makeAuditColumns(config: AuditColumnsConfig = {}): any[] {
  const cols: any[] = [];
  if (config.delete) cols.push(makeDeleteColumn(config.deleteSetRowData));
  if (config.rowStatus)
    cols.push(makeRowStatusColumn(config.rowStatusOverrides));
  if (config.insertPerson)
    cols.push(makeInsertPersonColumn(config.insertPersonOverrides));
  if (config.insertDate)
    cols.push(makeInsertDateColumn(config.insertDateOverrides));
  if (config.updatePerson)
    cols.push(makeUpdatePersonColumn(config.updatePersonOverrides));
  if (config.updateTime)
    cols.push(makeUpdateTimeColumn(config.updateTimeOverrides));
  return cols;
}

/**
 * makeAuditColumns 의 가장 흔한 조합(전 플래그 ON) 프리셋.
 * `...standardAudit(setRowData)` 한 줄로 7-필드 audit 블록을 치환.
 *
 * 첫 인자(setter) 는 두 가지 모양 모두 자동 처리:
 *   - 행 배열 setter: setRowData((rows) => filtered)
 *   - { rows, totalCount, page, limit } 객체 setter: setGridData(prev => ({...}))
 *   둘 다 그냥 넘기면 됨. 내부에서 prev 모양을 보고 알맞게 위임.
 *
 * 일부만 끄거나 override 가 필요하면 두 번째 인자로 부분 설정 전달:
 *   standardAudit(setRowData, { updatePerson: false })
 *   standardAudit(setRowData, { insertPersonOverrides: { width: 110 } })
 */
export const standardAudit = (
  setter?: (updater: any) => void,
  overrides?: Partial<AuditColumnsConfig>,
) => {
  // setter 가 받는 prev 가 객체({ rows, ... }) 인지 배열인지 자동 감지하여 어댑팅.
  const adaptedSetter = setter
    ? (rowsUpdater: any) =>
        setter((prev: any) => {
          if (prev && typeof prev === "object" && Array.isArray(prev.rows)) {
            return {
              ...prev,
              rows:
                typeof rowsUpdater === "function"
                  ? rowsUpdater(prev.rows)
                  : rowsUpdater,
            };
          }
          return typeof rowsUpdater === "function"
            ? rowsUpdater(prev)
            : rowsUpdater;
        })
    : undefined;

  return makeAuditColumns({
    delete: true,
    deleteSetRowData: adaptedSetter,
    rowStatus: true,
    insertPerson: true,
    insertDate: true,
    updatePerson: true,
    updateTime: true,
    ...overrides,
  });
};
