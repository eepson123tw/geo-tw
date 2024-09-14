import { useEffect, useState } from "react";
import useMap from "@/composable/useMap";
import ReactLeaflet from "@/components/react-leaflet";

const Loading = () => {
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 1;
        if (next > 100) {
          clearInterval(interval);
          return 100;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loading">
      <div className="progress-container">
        <div
          className="progress-filler"
          style={{ width: `${progress}%` }}
        ></div>
        <div className="progress-text">{progress}%</div>
      </div>
      <div className="loading-text">Loading...</div>
    </div>
  );
};

export default function Virtualization() {
  const { mapData } = useMap();
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
      {Object.keys(mapData).length === 0 ? (
        <Loading />
      ) : (
        <ReactLeaflet mapData={mapData} />
      )}
    </div>
  );
}
