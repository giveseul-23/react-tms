// src/app/components/Search/SearchFilters/SearchFieldRenderer.tsx
//
// 각 SearchMeta 항목을 타입(TEXT/COMBO/YMD/YMDT/CHECKBOX/POPUP)에 따라
// 적절한 SearchFilter로 렌더링.

import { SearchFilter } from "@/app/components/Search/SearchFilter";
import { CommonPopup } from "@/app/components/popup/CommonPopup";
import { usePopup } from "@/app/components/popup/PopupContext";
import type { SearchMeta } from "@/features/search/search.meta.types";
import { SearchCondition } from "@/features/search/search.builder";
import { CONDITION_ICON_MAP } from "@/app/components/Search/conditionIcons";

type SearchDataType = "STRING" | "NUMBER" | "DATE";

interface SearchFieldRendererProps {
  meta: readonly SearchMeta[];
  getCondition: (key: string) => SearchCondition | undefined;
  updateCondition: (
    key: string,
    value: string,
    operator: keyof typeof CONDITION_ICON_MAP,
    dataType: SearchDataType,
    sourceType?: "POPUP" | "NORMAL",
  ) => void;
}

export function SearchFieldRenderer({
  meta,
  getCondition,
  updateCondition,
}: SearchFieldRendererProps) {
  const { openPopup, closePopup } = usePopup();

  // state 키 참조("SRCH_XXX") → 현재 state 값
  // 서버 메타가 SRCH_ 접두로 내려주므로 접두를 떼고 state 키(DBCOLUMN)로 조회
  const resolveRef = (ref: string | undefined): string => {
    if (!ref) return "";
    const stateKey = ref.replace(/^SRCH_/, "");
    return String(getCondition(stateKey)?.value ?? "");
  };

  // 필드 메타의 sqlParam1/2/3/keyParam 을 해석해 서버 payload 용 객체로 변환
  const buildSqlParams = (m: SearchMeta): Record<string, string> => {
    const out: Record<string, string> = {};
    if (m.sqlParam1) out.sqlParam1 = resolveRef(m.sqlParam1);
    if (m.sqlParam2) out.sqlParam2 = resolveRef(m.sqlParam2);
    if (m.sqlParam3) out.sqlParam3 = resolveRef(m.sqlParam3);
    // COMBO 는 keyParam 이 combo 타입 용도라 제외
    if (m.type !== "COMBO" && m.keyParam) {
      out.keyParam = resolveRef(m.keyParam);
    }
    return out;
  };

  return (
    <>
      {meta.map((m) => {
        const condition = getCondition(m.key);

        const common = {
          key: m.key,
          type: m.type,
          label: m.label,
          span: m.span ?? 1,
          requaluired: m.required,
          condition:
            getCondition(m.key)?.operator ?? m.condition ?? "equal",
          dataType: m.dataType,
          conditionLocked: m.conditionLocked,
          onConditionChange: m.conditionLocked
            ? undefined
            : (op: string) => {
                const currentValue = getCondition(m.key)?.value ?? "";
                updateCondition(m.key, currentValue, op as any, m.dataType);
              },
          required: m.required ? m.required : false,
        };

        switch (m.type) {
          case "TEXT":
            return (
              <SearchFilter
                {...common}
                key={m.key}
                type="TEXT"
                value={condition?.value ?? ""}
                onChange={(v: string) =>
                  updateCondition(
                    m.key,
                    v,
                    (getCondition(m.key)?.operator ??
                      m.condition ??
                      "equal") as any,
                    m.dataType ?? "STRING",
                  )
                }
              />
            );

          case "COMBO": {
            // filterComponent/filterRefColumn이 있으면 대상 필드에 filterCol/filterValueKey 주입
            if (m.filterComponent && m.filterRefColumn) {
              const filterM = meta.filter(
                (x) => x.key.indexOf(m.filterComponent!) > -1,
              );
              filterM[0].filterCol = m.filterRefColumn;
              filterM[0].filterValueKey = m.key;
            }

            // filterCol/filterValueKey가 세팅된 COMBO는 옵션 필터링
            const srcVal = m.filterValueKey
              ? getCondition(m.filterValueKey)?.value
              : null;
            const filteredOptions =
              m.filterCol && srcVal && srcVal !== "ALL"
                ? (m.options ?? []).filter(
                    (opt: any) =>
                      opt.CODE === "ALL" || opt[m.filterCol!] === srcVal,
                  )
                : (m.options ?? []);

            // 소스 값 변경 시 현재 선택값이 필터 목록에 없으면 자동 리셋
            const curVal = condition?.value ?? "";
            if (
              m.filterCol &&
              srcVal &&
              curVal &&
              curVal !== "ALL" &&
              !filteredOptions.some((opt: any) => opt.CODE === curVal)
            ) {
              requestAnimationFrame(() =>
                updateCondition(
                  m.key,
                  "",
                  (getCondition(m.key)?.operator ??
                    m.condition ??
                    "equal") as any,
                  m.dataType ?? "STRING",
                ),
              );
            }

            return (
              <SearchFilter
                {...common}
                key={m.key}
                type="COMBO"
                value={curVal}
                options={filteredOptions}
                onChange={(v: string) =>
                  updateCondition(
                    m.key,
                    v,
                    (getCondition(m.key)?.operator ??
                      m.condition ??
                      "equal") as any,
                    m.dataType ?? "STRING",
                  )
                }
              />
            );
          }

          case "YMD":
            if (m.mode === "N") {
              return (
                <SearchFilter
                  {...common}
                  key={m.key}
                  type="YMD"
                  mode="N"
                  fromValue={getCondition(m.key)?.value ?? ""}
                  toValue=""
                  onChangeFrom={(v: string) =>
                    updateCondition(
                      m.key,
                      v,
                      (getCondition(m.key)?.operator ??
                        m.condition ??
                        "equal") as any,
                      m.dataType ?? "STRING",
                    )
                  }
                />
              );
            }
            return (
              <SearchFilter
                {...common}
                key={m.key}
                type="YMD"
                mode="Y"
                fromValue={getCondition(`${m.key}_FRM`)?.value ?? ""}
                toValue={getCondition(`${m.key}_TO`)?.value ?? ""}
                onChangeFrom={(v: string) =>
                  updateCondition(
                    `${m.key}_FRM`,
                    v,
                    m.condition ?? "equal",
                    m.dataType ?? "STRING",
                  )
                }
                onChangeTo={(v: string) =>
                  updateCondition(
                    `${m.key}_TO`,
                    v,
                    m.condition ?? "equal",
                    m.dataType ?? "STRING",
                  )
                }
              />
            );

          case "YMDT":
            if (m.mode === "N") {
              return (
                <SearchFilter
                  {...common}
                  key={m.key}
                  type="YMDT"
                  mode="N"
                  fromValue={getCondition(m.key)?.value ?? ""}
                  toValue=""
                  onChangeFrom={(v: string) =>
                    updateCondition(
                      m.key,
                      v,
                      (getCondition(m.key)?.operator ??
                        m.condition ??
                        "equal") as any,
                      m.dataType ?? "STRING",
                    )
                  }
                />
              );
            }
            return (
              <SearchFilter
                {...common}
                key={m.key}
                type="YMDT"
                mode="Y"
                fromValue={getCondition(`${m.key}_FRM`)?.value ?? ""}
                toValue={getCondition(`${m.key}_TO`)?.value ?? ""}
                onChangeFrom={(v: string) =>
                  updateCondition(
                    `${m.key}_FRM`,
                    v,
                    m.condition ?? "equal",
                    m.dataType ?? "STRING",
                  )
                }
                onChangeTo={(v: string) =>
                  updateCondition(
                    `${m.key}_TO`,
                    v,
                    m.condition ?? "equal",
                    m.dataType ?? "STRING",
                  )
                }
              />
            );

          case "CHECKBOX":
            return (
              <SearchFilter
                {...common}
                key={m.key}
                type="CHECKBOX"
                id={m.key}
                checked={Boolean(condition?.value)}
                onCheckedChange={(checked: boolean) =>
                  updateCondition(
                    m.key,
                    checked ? "Y" : "",
                    "equal",
                    m.dataType ?? "STRING",
                  )
                }
              />
            );

          case "POPUP": {
            const baseKey = m.key.replace("_CD", "");

            if (m.filterComponent && m.filterRefColumn) {
              const filterM = meta.filter(
                (x) => x.key.indexOf(m.filterComponent!) > -1,
              );
              filterM[0].filterCol = m.filterRefColumn;
              filterM[0].filterValueKey = m.key;
            }

            return (
              <SearchFilter
                {...common}
                key={m.key}
                type="POPUP"
                code={getCondition(`${baseKey}_CD`)?.value ?? ""}
                name={getCondition(`${baseKey}_NM`)?.value ?? ""}
                sqlId={m.sqlId}
                onChangeCode={(v: string) =>
                  updateCondition(`${baseKey}_CD`, v, "equal", m.dataType ?? "STRING", "POPUP")
                }
                onChangeName={(v: string) =>
                  updateCondition(`${baseKey}_NM`, v, "equal", m.dataType ?? "STRING", "POPUP")
                }
                onClickSearch={() =>
                  openPopup({
                    title: m.label,
                    content: (
                      <CommonPopup
                        sqlId={m.sqlId}
                        onApply={(row: any) => {
                          updateCondition(
                            `${baseKey}_CD`,
                            row.CODE,
                            "equal",
                            m.dataType ?? "STRING",
                            "POPUP",
                          );
                          updateCondition(
                            `${baseKey}_NM`,
                            row.NAME,
                            "equal",
                            m.dataType ?? "STRING",
                            "POPUP",
                          );
                          closePopup();
                        }}
                        onClose={closePopup}
                        filterCol={m.filterCol ? m.filterCol : ""}
                        filterValue={
                          m.filterValueKey
                            ? getCondition(m.filterValueKey)?.value ?? ""
                            : ""
                        }
                        extraParams={buildSqlParams(m)}
                      />
                    ),
                    width: "2xl",
                  })
                }
              />
            );
          }

          default:
            return null;
        }
      })}
    </>
  );
}
