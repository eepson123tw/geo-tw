import { useCallback, useEffect, useState } from "react";
import parseAddress from "../utils/addressParser";
interface BadmintonMap {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  postDTOList: number[];
  postId: number | null;
  creationDate: string;
}
interface OrganizedAddresses {
  [city: string]: {
    [district: string]: BadmintonMap[];
  };
}

const getData = async (): Promise<BadmintonMap[]> => {
  const res = await fetch("/api/badminton/allCourtAndPost", {});
  const data = await res.json();
  return data;
};

export default function useMap() {
  const [mapData, setMapData] = useState({});
  const getMapFn = useCallback(async () => {
    const data = await getData();
    const organizedAddresses: OrganizedAddresses = {};
    data.forEach((dataItem) => {
      const { address } = dataItem;
      const parsedData = parseAddress(address);
      if (
        parsedData.city &&
        parsedData.district &&
        parsedData.postalCode &&
        parsedData.street
      ) {
        const city = parsedData.city;
        const district = parsedData.district;
        if (!organizedAddresses[city]) {
          organizedAddresses[city] = {};
        }
        if (!organizedAddresses[city][district]) {
          organizedAddresses[city][district] = [];
        }

        organizedAddresses[city][district].push(dataItem);
      }
    });
    setMapData(organizedAddresses);
  }, [setMapData]);

  useEffect(() => {
    getMapFn();
  }, [getMapFn]);

  return {
    mapData,
  };
}
