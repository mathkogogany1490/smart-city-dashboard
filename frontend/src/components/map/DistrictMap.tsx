import { useState } from "react";
import type { Area } from "../../api/types";

export function DistrictMap({
  areas,
  selectedDistrictId,
  onSelect,
}: {
  areas: Area[];
  selectedDistrictId: number | null;
  onSelect: (id: number) => void;
}) {
  const [zoom, setZoom] = useState(1);
  const [showLabels, setShowLabels] = useState(true);
  const [showBubbles, setShowBubbles] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [showLayers, setShowLayers] = useState(false);
  const size = 640 / zoom;
  const origin = (640 - size) / 2;

  return (
    <div className="map-block">
      <div className="map-frame">
        <svg viewBox={`${origin} ${origin} ${size} ${size}`} role="img" aria-label="시흥시 권역 지도">
          <defs>
            <pattern id="map-grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M32 0H0V32" fill="none" stroke="rgba(130,170,220,0.09)" />
            </pattern>
          </defs>
          <rect width="640" height="640" fill="url(#map-grid)" />
          {[...areas]
          .sort((left, right) => {
            const leftActive = selectedDistrictId != null && left.district_ids.includes(selectedDistrictId);
            const rightActive = selectedDistrictId != null && right.district_ids.includes(selectedDistrictId);
            return Number(leftActive) - Number(rightActive);
          })
          .map((area) => {
            const active = selectedDistrictId != null && area.district_ids.includes(selectedDistrictId);
            return (
              <g
                key={area.id}
                className={active ? "area-group active" : "area-group"}
                role="button"
                tabIndex={0}
                aria-label={area.name}
                onClick={() => onSelect(area.primary_district_id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") onSelect(area.primary_district_id);
                }}
              >
                <path className="area" d={area.svg_path} />
                {showBubbles ? (
                  <circle className="bubble" cx={area.label_x} cy={area.label_y + 22} r={Math.max(12, Math.sqrt(area.population) / 18)} />
                ) : null}
                {showLabels ? (
                  <g className="area-label">
                    <circle cx={area.label_x} cy={area.label_y - 18} r="3.3" />
                    <text x={area.label_x} y={area.label_y} textAnchor="middle">
                      {area.name}
                    </text>
                  </g>
                ) : null}
              </g>
            );
          })}
        </svg>
        <div className="zoom-tools">
          <button type="button" onClick={() => setZoom((value) => Math.min(1.8, Number((value + 0.2).toFixed(1))))} aria-label="확대">
            +
          </button>
          <button type="button" onClick={() => setZoom((value) => Math.max(0.8, Number((value - 0.2).toFixed(1))))} aria-label="축소">
            −
          </button>
          <button type="button" onClick={() => setZoom(1)} aria-label="초기화">
            ⌖
          </button>
        </div>
      </div>
      <div className="map-actions">
        <button type="button" onClick={() => setShowLegend((value) => !value)}>
          지도 범례
        </button>
        <button type="button" onClick={() => setShowLayers((value) => !value)}>
          레이어 설정
        </button>
        {showLegend ? (
          <div className="popover legend-pop">
            <span>
              <i className="swatch gold" /> 선택 지역
            </span>
            <span>
              <i className="swatch blue" /> 일반 지역
            </span>
          </div>
        ) : null}
        {showLayers ? (
          <div className="popover layer-pop">
            <label>
              <input type="checkbox" checked={showLabels} onChange={(event) => setShowLabels(event.target.checked)} /> 동 이름
            </label>
            <label>
              <input type="checkbox" checked={showBubbles} onChange={(event) => setShowBubbles(event.target.checked)} /> 인구 버블
            </label>
          </div>
        ) : null}
      </div>
    </div>
  );
}
