import { useEffect, useState } from "react";
import "./App.css";
import GEO from "./components/geo";
import GeoGoogleChart from "./components/geo-google-chart";
import GeoReactCharts from "./components/geo-react-chart";
import ReactLeaflet from "./components/react-leaflet";

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
  return (
    <>
      <h2>ReactLeaflet</h2>
      <p>並非最新圖資,需自行取得圖資</p>
      <ReactLeaflet></ReactLeaflet>
    </>
  );
};

function App() {
  const [optionState, setOptionState] = useState("");

  useEffect(() => {
    if (optionState === "") {
      setOptionState("visx-tw");
    }
  }, [optionState]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "100vw",
      }}
    >
      <h1>GEO TW</h1>
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
      </div>
      {optionState === "visx-tw" ? <GEOTW></GEOTW> : null}
      {optionState === "google-geo" ? <GoogleTWGEO></GoogleTWGEO> : null}
      {optionState === "react-chart-geo" ? (
        <GeoReactChart></GeoReactChart>
      ) : null}
      {optionState === "react-leaf-let" ? <ReactLeaf></ReactLeaf> : null}
    </div>
  );
}

export default App;
