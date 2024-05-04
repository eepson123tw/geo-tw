import { useEffect, useState } from "react";
import "./App.css";
import GEO from "./geo";

const GEOTW = () => {
  return (
    <>
      <h2>Visx</h2>
      <p>並非最新圖資</p>
      <GEO width={500} height={500}></GEO>
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
      </div>
      {optionState === "visx-tw" ? <GEOTW></GEOTW> : null}
    </div>
  );
}

export default App;
