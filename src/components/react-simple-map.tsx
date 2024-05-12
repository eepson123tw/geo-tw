import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  Marker,
} from "react-simple-maps";
import { geoCentroid } from "d3-geo";
import province from "@/assets/prov.json";
import topology from "@assets/taiwan-city-topo.json";

const chartData = [topology];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function MapChart({ listVisited }: { listVisited?: any }) {
  const getGeoBackgroundColor = (index: string) => {
    const data = province.find((e) => e.id === index);
    const { city } = data || {};

    if (listVisited[index] && listVisited[index].visited) return "#00ff0030";

    if (city) return "#ff000030";

    return "#00000010";
  };
  const getGeoBackgroundHoverColor = (index: string) => {
    const data = province.find((e) => e.id === index);
    const { city } = data || {};

    if (listVisited[index] && listVisited[index].visited) return "#00ff0050";

    if (city) return "#ff000050";

    return "#00000050";
  };

  return (
    <ComposableMap
      data-tip=""
      projection="geoMercator"
      projectionConfig={{
        scale: 6000,
        center: [120, 23],
      }}
      style={{
        width: "100%",
        height: "100%",
      }}
    >
      <ZoomableGroup>
        {chartData.map((geoUrl, index) => (
          <Geographies key={index.toString()} geography={geoUrl}>
            {({ geographies }) => (
              <>
                {geographies.map((geo, index) => {
                  const centroid = geoCentroid(geo);
                  const provinceIndex = geo.rsmKey.split("-").pop();
                  const data = province.find((e) => e.id === provinceIndex);

                  const { offset, code = "" } = data || {};
                  const codeForIsLand = geo?.properties?.code;

                  return (
                    <g key={index.toString()}>
                      <Marker coordinates={centroid}>
                        <text
                          x={offset!.x}
                          y={offset!.y}
                          fontSize={3}
                          textAnchor="middle"
                        >
                          {codeForIsLand || code}
                        </text>
                      </Marker>
                    </g>
                  );
                })}
                {geographies.map((geo, index) => {
                  const provinceIndex = geo.rsmKey.split("-").pop();

                  return (
                    <Geography
                      key={index.toString()}
                      geography={geo}
                      style={{
                        default: {
                          fill: getGeoBackgroundColor(provinceIndex),
                          stroke: "#212529",
                          strokeWidth: 0.2,
                          outline: "none",
                        },
                        hover: {
                          fill: getGeoBackgroundHoverColor(provinceIndex),
                          stroke: "#212529",
                          strokeWidth: 0.8,
                          outline: "none",
                        },
                      }}
                    />
                  );
                })}
              </>
            )}
          </Geographies>
        ))}
      </ZoomableGroup>
    </ComposableMap>
  );
}
