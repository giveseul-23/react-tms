"use client";

// 공지 내용 등록/편집 팝업 (서버 pop/NoticeRegisterPop 대응)
// 제목(TITLE) + 내용(CONTENTS) 입력 → 부모가 선택 행에 머지.

import { useState } from "react";
import { FormPopupLayout } from "@/app/components/popup/FormPopupLayout";
import { Field } from "@/app/components/popup/Field";
import { Lang } from "@/app/services/common/Lang";

type Props = {
  initialValues?: { TITLE?: string; CONTENTS?: string };
  onConfirm: (data: { TITLE: string; CONTENTS: string }) => void;
  onClose: () => void;
};

export function NoticeRegisterPop({
  initialValues = {},
  onConfirm,
  onClose,
}: Props) {
  const [title, setTitle] = useState(initialValues.TITLE ?? "");
  const [contents, setContents] = useState(initialValues.CONTENTS ?? "");

  return (
    <FormPopupLayout
      cardClassName="space-y-4"
      confirmLabel={Lang.get("BTN_CONFIRM")}
      onCancel={onClose}
      onConfirm={() => onConfirm({ TITLE: title, CONTENTS: contents })}
    >
      <Field
        layout="vertical"
        type="text"
        label={Lang.get("LBL_TITLE")}
        value={title}
        onChange={setTitle}
      />
      <Field
        layout="vertical"
        type="textarea"
        rows={6}
        label={Lang.get("LBL_NOTICE_CONTENTS")}
        value={contents}
        onChange={setContents}
        placeholder={Lang.get("MSG_INPUT_CONTENTS")}
      />
    </FormPopupLayout>
  );
}
