// src/app/components/grid/commonColumns.tsx
//
// 공통 그리드 컬럼 팩토리.
// 기존 Columns 파일들에 반복적으로 등장하던
// 삭제(_delete), 상태(EDIT_STS), 생성자/생성일/수정자/수정일 컬럼을
// 개별 설정값으로 켜고 끌 수 있도록 제공한다.
//
// 주의: className / DOM 구조 / onChange 동작은 기존 코드와 byte-for-byte 동일하게 유지.

export const makeDeleteColumn = (setRowData?: (updater: any) => void) => ({
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
  headerName: "LBL_ROW_STATUS",
  field: "EDIT_STS",
  width: 80,
  ...overrides,
});

export const makeInsertPersonColumn = (
  overrides: Record<string, any> = {},
) => ({
  headerName: "LBL_INSERT_PERSON_ID",
  field: "CRE_USR_ID",
  ...overrides,
});

export const makeInsertDateColumn = (overrides: Record<string, any> = {}) => ({
  headerName: "LBL_INSERT_DATE",
  field: "CRE_DTTM",
  ...overrides,
});

export const makeUpdatePersonColumn = (
  overrides: Record<string, any> = {},
) => ({
  headerName: "LBL_UPDATE_PERSON_ID",
  field: "UPD_USR_ID",
  ...overrides,
});

export const makeUpdateTimeColumn = (overrides: Record<string, any> = {}) => ({
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
