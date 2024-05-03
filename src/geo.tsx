import { scaleQuantize } from "@visx/scale";
import { Mercator, Graticule } from "@visx/geo";
import { Zoom } from "@visx/zoom";
import { geoCentroid } from "@visx/vendor/d3-geo";
import * as topojson from "topojson-client";
import topology from "@assets/taiwan-topo.json";
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
  properties: { name: string; "woe-name": string };
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
const world = topojson.feature(topology, topology.objects.default) as {
  type: "FeatureCollection";
  features: FeatureShape[];
};

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

export default function GEO({ width, height }: GeoMercatorProps) {
  const centerX = width / 2;
  const centerY = height / 2;
  const scale = 4600;

  return width < 10 ? null : (
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
                  {mercator.features.map(({ feature, path, projection }, i) => (
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
                        {feature.properties.name}
                      </text>
                    </React.Fragment>
                  ))}
                </g>
              )}
            </Mercator>
          </>
        </svg>
      )}
    </Zoom>
  );
}
