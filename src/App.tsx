import {
  ElementRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "./App.css";
import bgImg from "./assets/weather-bg.jpg";
import { useLocation } from "./useLocation";
import { api } from "./axios";
import { BiCloud, BiDroplet, BiSolidThermometer } from "react-icons/bi";
import { MdOutlineVisibility } from "react-icons/md";
import { fahrenheatToCelsius, formatTime } from "./helper";

type WeatherJsonResponse = {
  coord: {
    lon: number;
    lat: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  base: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    sea_level: number;
    grnd_level: number;
  };
  visibility: number;
  wind: {
    speed: number;
    deg: number;
    gust: number;
  };
  rain?: {
    "1h": number;
  };
  snow?: {
    "1h": number;
  };
  clouds: {
    all: number;
  };
  dt: number;
  sys: {
    type: number;
    id: number;
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  id: number;
  name: string;
  cod: number;
};

function App() {
  const { coords, error } = useLocation();
  const [weatherJson, setWeatherJson] = useState<WeatherJsonResponse | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState(error);
  const [cordinates, setCoordinates] = useState<Array<number> | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedValue, setDebouncedValue] = useState("");
  const [loading, setLoading] = useState(false);

  const latLon = useMemo(() => cordinates || coords, [coords, cordinates]);

  const inputRef = useRef<ElementRef<"input">>(null);

  // useEffect(() => {
  //   inputRef.current?.focus();
  // }, []);

  // debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(search);
    }, 1000);
    return () => clearTimeout(timer);
  }, [search]);

  const getWeather = useCallback(async (lat: number, lon: number) => {
    setLoading(true);
    try {
      const response = await api.get(import.meta.env.VITE_WEATHER_API_URL, {
        params: {
          lat,
          lon,
          appid: import.meta.env.VITE_WEATHER_API_KEY,
        },
      });

      setWeatherJson(response.data);
    } catch (e) {
      if (e instanceof Error) {
        setErrorMessage(`api Failled ${e.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (latLon && latLon.length === 2) {
      getWeather(latLon[0], latLon[1]);
    }
  }, [latLon, getWeather]);

  useEffect(() => {
    const getWeatherCoordinates = async () => {
      if (debouncedValue === "") {
        setCoordinates([...coords]);
        return;
      }
      try {
        const response = await api.get(
          import.meta.env.VITE_WEATHER_API_LOCATION_URL,
          {
            params: {
              q: debouncedValue,
              appid: import.meta.env.VITE_WEATHER_API_KEY,
            },
          }
        );
        if (response.data.length === 0) {
          alert("country not found");
          return;
        }
        setCoordinates([response.data[0]?.lat, response.data[0]?.lon]);
      } catch (e) {
        if (e instanceof Error) {
          setErrorMessage(`api Failled ${e.message}`);
        }
      }
    };
    getWeatherCoordinates();
  }, [debouncedValue, coords]);

  if (error) return <p>{error}</p>;
  if (loading)
    return (
      <main
        className="h-screen bg-cover bg-no-repeat overflow-hidden flex items-center justify-center text-white"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)),url(${bgImg})`,
        }}
      >
        <p>Loading...</p>
      </main>
    );

  return (
    <main
      className="h-screen bg-cover bg-no-repeat overflow-hidden p-3 md:p-5"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)),url(${bgImg})`,
      }}
    >
      <div className="container mx-auto text-center grid grid-cols-3 border border-white/20 rounded-md">
        <div className=" p-5 col-span-1 border-r border-white/20">
          <div className="">
            <input
              type="text"
              placeholder="Enter Country Name"
              className="border border-white/20 bg-transparent h-10 w-full rounded outline-none p-2 text-white"
              onChange={(e) => setSearch(e.target.value)}
              value={search}
              ref={inputRef}
            />
          </div>

          <div className="h-[200px] aspect-[1]  mx-auto">
            <img
              src={`https://openweathermap.org/img/wn/${weatherJson?.weather?.[0]?.icon}@4x.png`}
              alt="icon"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-white">
            <h1 className="text-8xl ">
              {fahrenheatToCelsius(weatherJson?.main?.temp)}°
            </h1>
            <p className="text-4xl">{weatherJson?.weather?.[0]?.main}</p>
            <span className="text-sm">
              {weatherJson?.weather?.[0]?.description}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-white/70 mt-5">
            <div className="p-5 border border-white/20 rounded-md text-left">
              <div className="flex gap-3 items-center">
                <BiSolidThermometer className="size-8" />
                <h3 className="text-lg">Feels Like</h3>
              </div>
              <p className="text-2xl mt-2 ml-1">
                {fahrenheatToCelsius(weatherJson?.main?.feels_like)}°
              </p>
            </div>
            <div className="p-5 border border-white/20 rounded-md text-left">
              <div className="flex gap-3 items-center">
                <BiDroplet className="size-8" />
                <h3>Humidity</h3>
              </div>
              <p className="text-2xl mt-2 ml-1">
                {weatherJson?.main?.humidity}%
              </p>
            </div>
            <div className="p-5 border border-white/20 rounded-md text-left">
              <div className="flex gap-3 items-center">
                <MdOutlineVisibility className="size-8" />
                <h3>Visibility</h3>
              </div>
              <p className="text-2xl mt-2 ml-1">{weatherJson?.visibility}mi</p>
            </div>
            <div className="p-5 border border-white/20 rounded-md text-left">
              <div className="flex gap-3 items-center">
                <BiCloud className="size-8" />
                <h3>Clouds</h3>
              </div>
              <p className="text-2xl mt-2 ml-1">{weatherJson?.clouds?.all}%</p>
            </div>
          </div>
        </div>
        <div className=" p-5 col-span-2">
          <div className="flex gap-5 items-center justify-center">
            <div className="text-white border-r border-white pr-5">
              <h1 className="text-2xl ">{weatherJson?.name}</h1>
            </div>
            <div className="text-white">
              <p>
                sun rise:{" "}
                {weatherJson?.sys && formatTime(weatherJson.sys.sunrise)}
              </p>
              <p>
                sun set :{" "}
                {weatherJson?.sys && formatTime(weatherJson.sys.sunset)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;
