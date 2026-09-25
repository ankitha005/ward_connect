import { CircleMarker, Tooltip } from "react-leaflet";

/**
 * HeatmapLayer — simulates a heatmap using react-leaflet CircleMarkers.
 * Each point is [lat, lng, intensity] where intensity 0–1 controls opacity/size.
 * This avoids the leaflet.heat UMD plugin which is incompatible with Vite ESM.
 */
export default function HeatmapLayer({ points }) {
  if (!points || points.length === 0) return null;

  return (
    <>
      {points.map(([lat, lng, intensity = 1], idx) => {
        const isResolved = intensity < 0.5;
        const color = isResolved ? "#22c55e" : "#ef4444";
        const outerRadius = isResolved ? 20 : 30;
        const innerRadius = isResolved ? 8 : 12;

        return (
          <CircleMarker
            key={idx}
            center={[lat, lng]}
            radius={outerRadius}
            pathOptions={{
              color: "transparent",
              fillColor: color,
              fillOpacity: 0.15,
            }}
          >
            <CircleMarker
              center={[lat, lng]}
              radius={innerRadius}
              pathOptions={{
                color: color,
                weight: 1.5,
                fillColor: color,
                fillOpacity: 0.55,
              }}
            >
              <Tooltip direction="top" offset={[0, -8]} opacity={0.9}>
                <span className="text-xs font-bold">
                  {isResolved ? "✅ Resolved Issue" : "🔴 Open Issue"}
                </span>
              </Tooltip>
            </CircleMarker>
          </CircleMarker>
        );
      })}
    </>
  );
}
