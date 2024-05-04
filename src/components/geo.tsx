import { scaleQuantize, scaleOrdinal } from "@visx/scale";
import { Mercator, Graticule } from "@visx/geo";
import { Zoom } from "@visx/zoom";
import { geoCentroid } from "@visx/vendor/d3-geo";
import { LegendOrdinal, LegendItem, LegendLabel } from "@visx/legend";
import * as topojson from "topojson-client";
import topology from "@assets/taiwn-city-topo.json";
import React from "react";

export const background = "#f9f7e8";

export type GeoMercatorProps = {
  width: number;
  height: number;
  events?: boolean;
};

interface FeatureShape {
  type: "Feature";
  id: string;
  geometry: { coordinates: [number, number][][]; type: "Polygon" };
  properties: { name: string; COUNTYNAME: string };
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
const world = topojson.feature(topology, topology.objects.counties) as {
  type: "FeatureCollection";
  features: FeatureShape[];
};

const GEOLegend = (data: { data: typeof world }) => {
  const glyphSize = 20;

  const textOrder = (text: string) => {
    const matchResult = text && text.match(/[\d]+/g);
    return matchResult ? Number(matchResult[0]) : 0;
  };

  const labelAry = new Set(
    data.data.features
      .map((f) => "城市複雜度 => " + f.geometry.coordinates.length)
      .sort((a, b) => textOrder(a) - textOrder(b))
  );

  const ordinalColorScale = scaleOrdinal({
    domain: Array.from(labelAry),
    range: [
      "#ffb01d",
      "#ffa020",
      "#ff9221",
      "#ff8424",
      "#ff7425",
      "#fc5e2f",
      "#f94b3a",
      "#f63a48",
    ],
  });

  return (
    <div
      style={{
        marginRight: "20px",
      }}
    >
      <LegendOrdinal
        scale={ordinalColorScale}
        // labelFormat={(label) => `${label.toUpperCase()}`}
      >
        {(labels) => (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {labels.map((label, i) => (
              <LegendItem
                key={`legend-quantile-${i}`}
                margin="5px 0"
                onClick={() => {
                  console.log(`clicked: ${JSON.stringify(label)}`);
                }}
              >
                <svg width={glyphSize} height={glyphSize}>
                  <circle
                    cx={glyphSize / 2}
                    cy={glyphSize / 2}
                    r={glyphSize / 4}
                    stroke={label.value}
                    strokeWidth="3px"
                    width={glyphSize}
                    height={glyphSize}
                    fill="none"
                  />
                </svg>
                <LegendLabel align="left" margin="0 0 0 4px">
                  {label.text}
                </LegendLabel>
              </LegendItem>
            ))}
          </div>
        )}
      </LegendOrdinal>
    </div>
  );
};

export default function GEO({ width, height }: GeoMercatorProps) {
  const centerX = width / 2;
  const centerY = height / 2;
  const scale = 4600;

  const color = scaleQuantize({
    domain: [
      Math.min(...world.features.map((f) => f.geometry.coordinates.length)),
      Math.max(...world.features.map((f) => f.geometry.coordinates.length)),
    ],
    range: [
      "#ffb01d",
      "#ffa020",
      "#ff9221",
      "#ff8424",
      "#ff7425",
      "#fc5e2f",
      "#f94b3a",
      "#f63a48",
    ],
  });
  return width < 10 ? null : (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "row-reverse",
      }}
    >
      <Zoom<SVGSVGElement>
        width={width}
        height={height}
        scaleXMin={1 / 2}
        scaleXMax={4}
        scaleYMin={1 / 2}
        scaleYMax={4}
      >
        {(zoom) => (
          <svg
            width={width}
            height={height}
            style={{
              cursor: zoom.isDragging ? "grabbing" : "grab",
              touchAction: "none",
              border: "1px solid #ccc",
            }}
            ref={zoom.containerRef}
          >
            <>
              <rect
                width={width}
                height={height}
                fill={background}
                rx={14}
                onTouchStart={zoom.dragStart}
                onTouchMove={zoom.dragMove}
                onTouchEnd={zoom.dragEnd}
                onMouseDown={zoom.dragStart}
                onMouseMove={zoom.dragMove}
                onMouseUp={zoom.dragEnd}
                onMouseLeave={() => {
                  if (zoom.isDragging) zoom.dragEnd();
                }}
              />
              <Mercator<FeatureShape>
                data={world.features}
                scale={scale}
                translate={[centerX - 9700, centerY + 1970]}
                centroid={([x, y]) => (
                  <circle cx={x} cy={y} r={20} stroke="black" />
                )}
              >
                {(mercator) => (
                  <g transform={zoom.toString()}>
                    <Graticule
                      graticule={(g) => mercator.path(g) || ""}
                      stroke="rgba(33,33,33,0)"
                    />
                    {mercator.features.map(
                      ({ feature, path, projection }, i) => (
                        <React.Fragment
                          key={`map-feature-${i}-${feature.geometry.coordinates.length}`}
                        >
                          <path
                            d={path || ""}
                            fill={color(feature.geometry.coordinates.length)}
                            stroke={background}
                            strokeWidth={0.1}
                            onClick={() => {
                              alert(JSON.stringify(feature));
                            }}
                          />
                          <text
                            transform={`translate(${projection(
                              geoCentroid(feature)
                            )})`}
                            fontSize={3}
                            textAnchor="middle"
                          >
                            {feature.properties.COUNTYNAME}
                          </text>
                        </React.Fragment>
                      )
                    )}
                  </g>
                )}
              </Mercator>
            </>
          </svg>
        )}
      </Zoom>
      <GEOLegend data={world}></GEOLegend>
    </div>
  );
}
