/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  GeoJSON,
  MapContainer,
  Marker,
  Popup,
  ScaleControl,
  TileLayer,
  useMap,
} from "react-leaflet";
import L, { LeafletEvent, Control } from "leaflet";
import * as topojson from "topojson-client";
import center from "@turf/center";
import taiwan from "@assets/taiwan-dist-topo.json";
import "leaflet/dist/leaflet.css";

import MarkerClusterGroup from "@/components/MakeClusterGroup";

// 定義地址資料的接口
interface Address {
  street: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  name: string;
  postDTOList: number[];
}

// 定義組織後地址的接口
interface OrganizedAddresses {
  [city: string]: {
    [district: string]: Address[];
  };
}

interface CityObject {
  [cityName: string]: {
    [district: string]: unknown[];
  };
}

const grades = [0, 10, 25, 30, 40, 50, 60, 70];
const colors = [
  "#FFEDA0", // 0
  "#FED976", // 10
  "#FEB24C", // 25
  "#FD8D3C", // 30
  "#E31A1C", // 40
  "#BD0026", // 50
  "#800026", // 60
  "#4D004B", // 70
];

// 定義顏色函數
function getColor(d: number): string {
  for (let i = grades.length - 1; i >= 0; i--) {
    if (d >= grades[i]) {
      return colors[i];
    }
  }
  return colors[0]; // 預設顏色
}
// 定義圖例組件
function Legend() {
  const map = useMap();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!mounted) {
      setMounted(true);
    }
    if (map && mounted) {
      const legend = new Control({ position: "bottomright" });
      legend.onAdd = () => {
        const div = L.DomUtil.create("div", "info legend");
        const labels = [];
        let from;
        let to;

        for (let i = 0; i < grades.length; i++) {
          from = grades[i];
          to = grades[i + 1];
          labels.push(
            `<i style="background:${getColor(from + 1)}"></i>
            <span style="color:white;">${
              from + (to ? "&ndash;" + to : "+")
            } 球館數</span>`
          );
        }
        div.innerHTML = labels.join("<br>");
        return div;
      };
      legend.addTo(map);
    }
  }, [map, mounted]);
  return null;
}

// 定義層級操作函數
function layersUtils(
  geoJsonRef: RefObject<L.GeoJSON>,
  mapRef: RefObject<L.Map>
) {
  function highlightOnClick(e: LeafletEvent) {
    const layer = e.target as L.GeoJSON;
    layer.setStyle({
      weight: 0.1,
      dashArray: "",
      fillOpacity: 0.5,
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
      layer.bringToFront();
    }
  }

  function resetHighlight(e: LeafletEvent) {
    geoJsonRef.current && geoJsonRef.current.resetStyle(e.target);
  }

  function zoomToFeature(e: LeafletEvent) {
    mapRef.current && mapRef.current.fitBounds((e.target as any).getBounds());
  }

  return { highlightOnClick, resetHighlight, zoomToFeature };
}

function findCityAndSumVenues(county: any, cities: CityObject) {
  const matchedCity = Object.keys(cities).find((cityName) =>
    cityName.includes(county.properties.COUNTYENG)
  );

  if (matchedCity) {
    const totalVenues = Object.values(cities[matchedCity]).reduce(
      (acc, districtVenues) => acc + districtVenues.length,
      0
    );
    return totalVenues;
  } else {
    console.log(`No matching city found => ${county.properties.COUNTYENG}`);
  }
  return 0;
}

// 定義 GeoJSON 樣式函數
function geoJSONStyle(feature: any, mapData: OrganizedAddresses) {
  const value = findCityAndSumVenues(feature, mapData);
  return {
    color: "#1f2021",
    weight: 0.1,
    fillOpacity: 0.7,
    fillColor: getColor(value),
  };
}

function MarkerGroup({ addressesToShow }: { addressesToShow: Address[] }) {
  return (
    <>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />
      <MarkerClusterGroup>
        {addressesToShow.map((address, idx) => (
          <Marker key={idx} position={[address.latitude, address.longitude]}>
            <Popup>
              <strong>地址：</strong> {address.name} <br />
              <strong>成團數:</strong> {address.postDTOList.length}次
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </>
  );
}

export default function ReactLeafLet({
  mapData,
  propsStyle = { height: "100vh", width: "100%" },
}: {
  mapData: OrganizedAddresses;
  propsStyle?: { height: string; width: string };
}) {
  const [geoJsonId, setGeoJsonId] = useState<string>("");

  // 定義地圖和 GeoJSON 的引用
  const mapRef = useRef<L.Map>(null);
  const geoJsonRef = useRef<L.GeoJSON>(null);

  // 切換 GeoJSON 特徵
  const geoJson = geoJsonId
    ? topojson.feature(taiwan, {
        type: "GeometryCollection",
        geometries: taiwan.objects.districts.geometries.filter(
          (d: any) => d.properties.COUNTYENG === geoJsonId
        ),
      })
    : topojson.feature(taiwan, taiwan.objects.counties);

  // 點擊事件處理函數
  const onDrillDown = (e: LeafletEvent) => {
    const properties = (e.target as any).feature.properties;
    const featureCountyName = properties.COUNTYENG;
    if (!featureCountyName) {
      console.warn("點擊的特徵缺少 COUNTYENG 屬性", properties);
      return;
    }

    setGeoJsonId(featureCountyName);
  };

  // 當 GeoJSON 變更時調整地圖範圍
  useEffect(() => {
    if (mapRef.current && geoJsonRef.current) {
      mapRef.current.fitBounds(geoJsonRef.current.getBounds());
    }
  }, [geoJson]);

  // 定義每個 GeoJSON 特徵的事件處理
  function onEachFeature(_: any, layer: L.Layer) {
    const layerUtils = layersUtils(geoJsonRef, mapRef);
    layer.on({
      mouseover: layerUtils.highlightOnClick,
      mouseout: layerUtils.resetHighlight,
      click: onDrillDown,
    });
  }

  // 獲取 GeoJSON 的中心點
  function getCenterOfGeoJson(geoJson: any) {
    const centerPoint = center(geoJson).geometry.coordinates;
    return [centerPoint[1], centerPoint[0]] as [number, number];
  }

  const mapCenter = getCenterOfGeoJson(geoJson);

  // 根據當前的 geoJsonId 獲取相應的地址
  let addressesToShow: Address[] = [];

  if (geoJsonId) {
    // 如果選中了某個城市，顯示該城市所有區域的地址
    const cityData = mapData[geoJsonId];
    if (cityData) {
      Object.values(cityData).forEach((districtAddresses) => {
        addressesToShow = addressesToShow.concat(districtAddresses);
      });
    }
  } else {
    // 如果未選中，顯示所有城市的地址
    Object.values(mapData).forEach((cityData) => {
      Object.values(cityData).forEach((districtAddresses) => {
        addressesToShow = addressesToShow.concat(districtAddresses);
      });
    });
  }

  const resetMapToCity = useCallback(() => {
    if (!mapRef.current || !geoJsonRef.current) return;
    setGeoJsonId("");
    mapRef.current.fitBounds(geoJsonRef.current.getBounds());
  }, [setGeoJsonId]);

  return (
    <div
      className="mapMainContainer"
      style={{
        height: propsStyle.width === "100vw" ? "100vh" : "",
      }}
    >
      <div className="buttonWrapper">
        <button onClick={resetMapToCity} className="backButton">
          Back To Top View
        </button>
      </div>
      <MapContainer
        className="map"
        center={mapCenter}
        ref={mapRef}
        zoom={7}
        style={propsStyle}
      >
        <GeoJSON
          data={geoJson}
          key={geoJsonId}
          style={(data) => geoJSONStyle(data, mapData)}
          ref={geoJsonRef}
          onEachFeature={onEachFeature}
        />
        <ScaleControl />
        <Legend />
        <MarkerGroup addressesToShow={addressesToShow}></MarkerGroup>
      </MapContainer>
    </div>
  );
}
