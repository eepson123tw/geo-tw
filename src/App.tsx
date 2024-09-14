import { useEffect, useState } from "react";
import "./App.css";
import DropDragGrid from "@/pages/grid-layout";

import useMap from "@/composable/useMap";
import GEO from "@/components/geo";
import GeoGoogleChart from "@/components/geo-google-chart";
import GeoReactCharts from "@/components/geo-react-chart";
import ReactLeaflet from "@/components/react-leaflet";
import ReactSimpleMap from "@/components/react-simple-map";

const GEOTW = () => {
  return (
    <>
      <h2>Visx</h2>
      <p>並非最新圖資,需自行取得圖資</p>
      <GEO width={500} height={500}></GEO>
    </>
  );
};

const GoogleTWGEO = () => {
  return (
    <>
      <h2>Google Chart</h2>
      <p>最新圖資(花錢解鎖)</p>
      <GeoGoogleChart></GeoGoogleChart>
    </>
  );
};

const GeoReactChart = () => {
  return (
    <>
      <h2>Visx</h2>
      <p>並非最新圖資,需自行取得圖資</p>
      <GeoReactCharts></GeoReactCharts>
    </>
  );
};

const ReactLeaf = () => {
  const { mapData } = useMap();
  return (
    <>
      <h2>ReactLeaflet</h2>
      <p>並非最新圖資,需自行取得圖資</p>
      <ReactLeaflet mapData={mapData}></ReactLeaflet>
    </>
  );
};

const ReactSimpleChart = () => {
  const [listVisited, setListVisited] = useState({});

  useEffect(() => {
    const dataString = localStorage.getItem("listVisited") as string;
    const data = JSON.parse(dataString);

    if (data) setListVisited(data);
  }, []);
  return (
    <>
      <h2>ReactSimpleMap</h2>
      <p>並非最新圖資,需自行取得圖資</p>
      <ReactSimpleMap listVisited={listVisited}></ReactSimpleMap>
    </>
  );
};

const defaultProps = {
  className: "layout",
  rowHeight: 30,
  cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
  breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },
  containerPadding: [0, 0],
};

function App() {
  const [optionState, setOptionState] = useState("");

  useEffect(() => {
    if (optionState === "") {
      setOptionState("react-leaf-let");
    }
  }, [optionState]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100vw",
        height: "100vh",
      }}
    >
      <h1>GEO TW</h1>
      <div>
        <div className="btn-list">
          <button onClick={() => setOptionState("default")}>Default</button>
          <button onClick={() => setOptionState("visx-tw")}>Visx</button>
          <button onClick={() => setOptionState("google-geo")}>GoogleTW</button>
          <button onClick={() => setOptionState("react-chart-geo")}>
            ReactGeo
          </button>
          <button onClick={() => setOptionState("react-leaf-let")}>
            ReactLeaflet
          </button>
          <button onClick={() => setOptionState("react-simple-map")}>
            ReactSimpleMap
          </button>
        </div>
        {optionState === "visx-tw" ? <GEOTW></GEOTW> : null}
        {optionState === "google-geo" ? <GoogleTWGEO></GoogleTWGEO> : null}
        {optionState === "react-chart-geo" ? (
          <GeoReactChart></GeoReactChart>
        ) : null}
        {optionState === "react-leaf-let" ? <ReactLeaf></ReactLeaf> : null}
        {optionState === "react-simple-map" ? (
          <ReactSimpleChart></ReactSimpleChart>
        ) : null}
      </div>
      {optionState === "default" && (
        <DropDragGrid {...defaultProps}></DropDragGrid>
      )}
    </div>
  );
}

export default App;
