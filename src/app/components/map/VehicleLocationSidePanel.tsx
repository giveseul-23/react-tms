"use client";

// 차량위치 우측 슬라이드 패널 공통 컴포넌트.
//  콘텐츠 영역 안에 갇히는 ContentSidePanel 셸 + VehicleLocationView 조합.
//  위치 조회 방식만 fetchPositions 로 주입.

import { ContentSidePanel } from "@/app/components/layout/ContentSidePanel";
import VehicleLocationView from "@/app/components/map/VehicleLocationView";

type Props = {
  open: boolean;
  onClose: () => void;
  /** 조회 대상 차량 ID 목록 */
  vehIds: string[];
  /** 차량 ID 배열 → 위치행 배열 (화면별 API 주입) */
  fetchPositions: (vehIds: string[]) => Promise<any[]>;
  width?: number;
  emptyText?: string;
};

export default function VehicleLocationSidePanel({
  open,
  onClose,
  vehIds,
  fetchPositions,
  width = 520,
  emptyText,
}: Props) {
  return (
    <ContentSidePanel
      open={open}
      onClose={onClose}
      title="BTN_SHOW_VEHICLE_LOCATION"
      width={width}
    >
      <div className="h-full min-h-0">
        <VehicleLocationView
          vehIds={vehIds}
          fetchPositions={fetchPositions}
          emptyText={emptyText}
        />
      </div>
    </ContentSidePanel>
  );
}
