import { useEffect, useState } from "react";

export const useLocation = () => {
  const [coords, setCoords] = useState<Array<number>>([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords([position.coords.latitude, position.coords.longitude]);
      },
      (error) => {
        setError(error.message);
      }
    );
  }, []);
  return { coords, error };
};
