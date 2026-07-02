// src/app/components/Search/SearchFilters/SearchFieldRenderer.tsx
//
// 각 SearchMeta 항목을 타입(TEXT/COMBO/YMD/YMDT/CHECKBOX/POPUP)에 따라
// 적절한 SearchFilter로 렌더링.

import { SearchFilter } from "@/app/components/Search/SearchFilter";
import { CommonPopup } from "@/app/components/popup/CommonPopup";
import { usePopup } from "@/app/components/popup/PopupContext";
import { commonApi } from "@/app/services/common/commonApi";
import type { SearchMeta } from "@/features/search/search.meta.types";
import { SearchCondition, popupNameKey } from "@/features/search/search.builder";
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
  /** enableWhen 규칙으로 비활성화된 대상 필드 meta.key 집합 — 시각 disable + 조건아이콘 잠금.
   *  실제 입력 차단은 상위(SearchFilters)가 넘긴 guardedUpdateCondition 이 담당. */
  disabledKeys?: Set<string>;
}

export function SearchFieldRenderer({
  meta,
  getCondition,
  updateCondition,
  disabledKeys,
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

  // 부모 컴포넌트가 재선택되면 filterRef 로 연결된 자식들을 재귀적으로 빈값 처리.
  // (예: DIV 변경 → LGST_GRP_CD/NM, PLN_ID 등 줄줄이 클리어)
  const clearDescendants = (parentKey: string) => {
    const directChildren = meta.filter((x) => x.filterValueKey === parentKey);
    for (const child of directChildren) {
      const childOp = (getCondition(child.key)?.operator ??
        child.condition ??
        "equal") as any;
      const childDataType = child.dataType ?? "STRING";
      if (child.type === "POPUP") {
        const childBaseKey = child.key.replace("_CD", "");
        updateCondition(`${childBaseKey}_CD`, "", childOp, childDataType, "POPUP");
        updateCondition(
          popupNameKey(child.key, meta),
          "",
          childOp,
          childDataType,
          "POPUP",
        );
      } else {
        updateCondition(child.key, "", childOp, childDataType);
      }
      // 손주까지 재귀
      clearDescendants(child.key);
    }
  };

  return (
    <>
      {meta.map((m) => {
        const condition = getCondition(m.key);
        const disabled = disabledKeys?.has(m.key) ?? false;

        const common = {
          key: m.key,
          type: m.type,
          label: m.label,
          span: m.span ?? 1,
          requaluired: m.required,
          condition: getCondition(m.key)?.operator ?? m.condition ?? "equal",
          dataType: m.dataType,
          conditionLocked: m.conditionLocked || disabled,
          className: disabled ? "opacity-50 pointer-events-none" : undefined,
          onConditionChange:
            m.conditionLocked || disabled
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
              const target = meta.find(
                (x) => x.key.indexOf(m.filterComponent!) > -1,
              );
              if (target) {
                target.filterCol = m.filterRefColumn;
                target.filterValueKey = m.key;
              }
            }

            // filterCol/filterValueKey 가 세팅된 COMBO 는 옵션 필터링.
            //   - 부모 값(srcVal) 이 없으면 옵션 자체를 빈 배열로 → 콤보가 비어 아무 것도 못 고르게
            //   - 부모 값이 있으면 그 값과 매치되는 옵션만 표시 (ALL 은 항상 포함)
            const srcVal = m.filterValueKey
              ? getCondition(m.filterValueKey)?.value
              : null;
            const isFiltered = !!m.filterCol;
            const filteredOptions = isFiltered
              ? srcVal && srcVal !== "ALL"
                ? (m.options ?? []).filter(
                    (opt: any) =>
                      opt.CODE === "ALL" || opt[m.filterCol!] === srcVal,
                  )
                : [] // 부모 미선택 → 빈 옵션
              : (m.options ?? []);

            // 현재 선택값이 더 이상 유효한 옵션이 아니면 자동 리셋 (부모 비었을 때 포함).
            const curVal = condition?.value ?? "";
            if (
              isFiltered &&
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
                onChange={(v: string) => {
                  updateCondition(
                    m.key,
                    v,
                    (getCondition(m.key)?.operator ??
                      m.condition ??
                      "equal") as any,
                    m.dataType ?? "STRING",
                  );
                  // 재선택 → filterRef 로 연결된 자식들 재귀 클리어
                  clearDescendants(m.key);
                }}
              />
            );
          }

          case "Y":
            if (m.mode === "N") {
              return (
                <SearchFilter
                  {...common}
                  key={m.key}
                  type="Y"
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
                type="Y"
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

          case "YM":
            if (m.mode === "N") {
              return (
                <SearchFilter
                  {...common}
                  key={m.key}
                  type="YM"
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
                type="YM"
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
            // 코드명 state 키 — 같은 이름의 다른 필드와 충돌하면 <base>__NM 으로 분리.
            const nmKey = popupNameKey(m.key, meta);

            // 값 세팅 시 operator 를 "equal" 로 덮지 않고 현재 선택된 operator(iconbox) 를 유지.
            // m.key(=_CD) 에 onConditionChange 가 기록한 operator 를 단일 소스로 사용.
            const curOp = () =>
              (getCondition(m.key)?.operator ?? m.condition ?? "equal") as any;

            if (m.filterComponent && m.filterRefColumn) {
              const target = meta.find(
                (x) => x.key.indexOf(m.filterComponent!) > -1,
              );
              if (target) {
                target.filterCol = m.filterRefColumn;
                target.filterValueKey = m.key;
              }
            }

            const filterValue = m.filterValueKey
              ? (getCondition(m.filterValueKey)?.value ?? "")
              : "";

            const openPickerPopup = (initialCode = "", initialName = "") => {
              openPopup({
                title: m.label,
                content: (
                  <CommonPopup
                    sqlId={m.sqlId}
                    onApply={(row: any) => {
                      updateCondition(
                        `${baseKey}_CD`,
                        row.CODE,
                        curOp(),
                        m.dataType ?? "STRING",
                        "POPUP",
                      );
                      updateCondition(
                        nmKey,
                        row.NAME,
                        curOp(),
                        m.dataType ?? "STRING",
                        "POPUP",
                      );
                      // 재선택 → 연결된 자식들 재귀 클리어
                      clearDescendants(m.key);
                      closePopup();
                    }}
                    onClose={closePopup}
                    filterCol={m.filterCol ? m.filterCol : ""}
                    filterValue={filterValue}
                    extraParams={buildSqlParams(m)}
                    initialCode={initialCode}
                    initialName={initialName}
                  />
                ),
                width: "2xl",
              });
            };

            // Enter 시 직접 조회 → 1건이면 자동 적용 / 0·2+ 건이면 popup 오픈
            const onEnterSubmit = async (
              typedCode: string,
              typedName: string,
            ) => {
              try {
                const res: any = await commonApi.getCodesAndNames({
                  key: "dsOut",
                  sqlProp: m.sqlId,
                  ...buildSqlParams(m),
                  ...(typedCode ? { code: typedCode } : {}),
                  ...(typedName ? { name: typedName } : {}),
                });
                const datas: any[] = res?.data?.data?.dsOut ?? [];
                if (datas.length === 1) {
                  updateCondition(
                    `${baseKey}_CD`,
                    datas[0].CODE,
                    curOp(),
                    m.dataType ?? "STRING",
                    "POPUP",
                  );
                  updateCondition(
                    nmKey,
                    datas[0].NAME,
                    curOp(),
                    m.dataType ?? "STRING",
                    "POPUP",
                  );
                  // 재선택 → 연결된 자식들 재귀 클리어
                  clearDescendants(m.key);
                  return;
                }
                openPickerPopup(typedCode, typedName);
              } catch (err) {
                console.error(err);
                openPickerPopup(typedCode, typedName);
              }
            };

            return (
              <SearchFilter
                {...common}
                key={m.key}
                type="POPUP"
                code={getCondition(`${baseKey}_CD`)?.value ?? ""}
                name={getCondition(nmKey)?.value ?? ""}
                sqlId={m.sqlId}
                onChangeCode={(v: string) => {
                  updateCondition(
                    `${baseKey}_CD`,
                    v,
                    curOp(),
                    m.dataType ?? "STRING",
                    "POPUP",
                  );
                  // 코드 직접 변경 시 기존 코드명 초기화 (불일치 방지)
                  updateCondition(
                    nmKey,
                    "",
                    curOp(),
                    m.dataType ?? "STRING",
                    "POPUP",
                  );
                }}
                onChangeName={(v: string) =>
                  updateCondition(
                    nmKey,
                    v,
                    curOp(),
                    m.dataType ?? "STRING",
                    "POPUP",
                  )
                }
                onClickSearch={() => openPickerPopup()}
                onEnterSubmit={onEnterSubmit}
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
