export interface WeatherData {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    surface_pressure: number;
    wind_speed_10m: number;
    weather_code: number;
  };
  current_units: {
    temperature_2m: string;
    relative_humidity_2m: string;
    apparent_temperature: string;
    surface_pressure: string;
    wind_speed_10m: string;
  };
  location: {
    name: string;
    country: string;
  };
}

export interface GeocodingResult {
  results?: Array<{
    name: string;
    country: string;
    latitude: number;
    longitude: number;
  }>;
}

export const weatherCodes: { [key: number]: string } = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  71: "Slight snow fall",
  73: "Moderate snow fall",
  75: "Heavy snow fall",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
};