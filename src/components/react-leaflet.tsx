import { type RefObject, useEffect, useRef, useState } from "react";
import { GeoJSON, MapContainer, ScaleControl } from "react-leaflet";
import * as topojson from "topojson-client";
import taiwan from "@assets/taiwan-city-topo.json";
import "leaflet/dist/leaflet.css";
import center from "@turf/center";
import L, { LeafletEvent } from "leaflet";

function getColor(d: number) {
  return d > 25
    ? "#800026"
    : d > 20
    ? "#E31A1C"
    : d > 15
    ? "#FD8D3C"
    : d > 10
    ? "#FEB24C"
    : d > 5
    ? "#FED976"
    : "#FFEDA0";
}

function layersUtils(
  geoJsonRef: RefObject<L.GeoJSON>,
  mapRef: RefObject<L.Map>
) {
  function highlightOnClick(e: LeafletEvent) {
    const layer = e.target;

    layer.setStyle({
      weight: 2,
      color: "#f90303",
      dashArray: "",
      fillOpacity: 0.7,
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
      layer.bringToFront();
    }
  }

  function resetHighlight(e: LeafletEvent) {
    geoJsonRef.current && geoJsonRef.current.resetStyle(e.target);
  }

  function zoomToFeature(e: LeafletEvent) {
    mapRef.current && mapRef.current.fitBounds(e.target.getBounds());
  }

  return { highlightOnClick, resetHighlight, zoomToFeature };
}

function geoJSONStyle() {
  return {
    color: "#1f2021",
    weight: 1,
    fillOpacity: 0.5,
    fillColor: getColor(Math.floor(Math.random() * 26)),
  };
}

export default function ChoroplethMapDrillDown() {
  const [geoJsonId, setGeoJsonId] = useState("");

  const geoJson = topojson.feature(
    taiwan,
    geoJsonId
      ? taiwan.objects.counties.geometries.find(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (d: any) => d.properties.COUNTYENG === geoJsonId
        )
      : taiwan.objects.counties
  );

  const mapRef = useRef<L.Map>(null);
  const geoJsonRef = useRef<L.GeoJSON>(null);

  const onDrillDown = (e: LeafletEvent) => {
    const featureCountryName = e.target.feature.properties.COUNTYENG;
    if (!taiwan.objects.counties) {
      return;
    }
    console.log(JSON.stringify(e.target.feature.properties.COUNTYNAME));
    setGeoJsonId(featureCountryName);
  };

  useEffect(() => {
    if (mapRef.current && geoJsonRef.current) {
      mapRef.current.fitBounds(geoJsonRef.current.getBounds());
    }
  });
  function onEachFeature(_: unknown, layer: L.Layer) {
    const layerUtils = layersUtils(geoJsonRef, mapRef);
    layer.on({
      mouseover: layerUtils.highlightOnClick,
      mouseout: layerUtils.resetHighlight,
      click: onDrillDown,
    });
  }

  function getCenterOfGeoJson(geoJson: typeof taiwan) {
    return center(geoJson).geometry.coordinates.reverse();
  }

  const mapCenter = getCenterOfGeoJson(geoJson);

  return (
    <div className="mapMainContainer">
      <div className="buttonWrapper">
        <button onClick={() => setGeoJsonId("")} className="backButton">
          Back To Country View
        </button>
      </div>
      <MapContainer className="map" center={mapCenter} ref={mapRef} zoom={7}>
        <GeoJSON
          data={geoJson}
          key={geoJsonId}
          style={geoJSONStyle}
          ref={geoJsonRef}
          onEachFeature={onEachFeature}
        />
        <ScaleControl />
      </MapContainer>
    </div>
  );
}
