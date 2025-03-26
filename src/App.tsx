import React, { useState, useCallback, useMemo, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, ThermometerSun, Search, Loader2, Compass, Wind, Droplets } from 'lucide-react';
import axios from 'axios';
import type { WeatherData, GeocodingResult } from './types';
import { weatherCodes } from './types';

// Debounce function
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Memoized Weather Display Component
const WeatherDisplay = React.memo(({ weather }: { weather: WeatherData }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
    className="bg-white/10 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl"
    layoutId="weather-card"
  >
    <div className="p-8">
      <div className="text-center text-white mb-8">
        <motion.h2 
          className="text-5xl md:text-6xl font-bold mb-4"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
        >
          {weather.location.name}, {weather.location.country}
        </motion.h2>
        
        <motion.div 
          className="text-8xl md:text-9xl font-bold my-8"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          {Math.round(weather.current.temperature_2m)}°C
        </motion.div>

        <motion.p 
          className="text-2xl mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {weatherCodes[weather.current.weather_code]}
        </motion.p>
      </div>

      <motion.div 
        className="grid grid-cols-2 md:grid-cols-4 gap-6"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm transform hover:scale-105 transition-transform">
          <ThermometerSun className="w-8 h-8 mx-auto mb-4 text-yellow-300" />
          <p className="text-white/80 text-sm mb-2">Feels like</p>
          <p className="text-2xl font-bold text-white">
            {Math.round(weather.current.apparent_temperature)}°C
          </p>
        </div>
        
        <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm transform hover:scale-105 transition-transform">
          <Wind className="w-8 h-8 mx-auto mb-4 text-blue-300" />
          <p className="text-white/80 text-sm mb-2">Wind speed</p>
          <p className="text-2xl font-bold text-white">
            {weather.current.wind_speed_10m} {weather.current_units.wind_speed_10m}
          </p>
        </div>

        <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm transform hover:scale-105 transition-transform">
          <Droplets className="w-8 h-8 mx-auto mb-4 text-blue-400" />
          <p className="text-white/80 text-sm mb-2">Humidity</p>
          <p className="text-2xl font-bold text-white">
            {weather.current.relative_humidity_2m}%
          </p>
        </div>

        <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm transform hover:scale-105 transition-transform">
          <Compass className="w-8 h-8 mx-auto mb-4 text-emerald-300" />
          <p className="text-white/80 text-sm mb-2">Pressure</p>
          <p className="text-2xl font-bold text-white">
            {Math.round(weather.current.surface_pressure)} hPa
          </p>
        </div>
      </motion.div>
    </div>
  </motion.div>
));

function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState<Array<{name: string; country: string; latitude: number; longitude: number}>>([]);

  const fetchWeather = useCallback(async (latitude: number, longitude: number, cityName: string, country: string) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get<any>(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,surface_pressure,wind_speed_10m,weather_code`
      );

      const weatherData: WeatherData = {
        current: response.data.current,
        current_units: response.data.current_units,
        location: {
          name: cityName,
          country: country
        }
      };

      setWeather(weatherData);
      setSuggestions([]);
    } catch (err) {
      setError('Failed to fetch weather data. Please try again.');
      setWeather(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = useMemo(() => debounce(async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await axios.get<GeocodingResult>(
        `https://geocoding-api.open-meteo.com/v1/search?name=${searchTerm}&count=5&language=en&format=json`
      );

      if (response.data.results) {
        setSuggestions(response.data.results.map(result => ({
          name: result.name,
          country: result.country,
          latitude: result.latitude,
          longitude: result.longitude,
        })));
      } else {
        setSuggestions([]);
      }
    } catch (err) {
      setSuggestions([]);
    }
  }, 300), []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCity(value);
    handleSearch(value);
  }, [handleSearch]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (suggestions.length > 0) {
      const firstResult = suggestions[0];
      fetchWeather(firstResult.latitude, firstResult.longitude, firstResult.name, firstResult.country);
    }
  }, [suggestions, fetchWeather]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 animate-gradient-x">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-8">
            <motion.h1 
              className="text-4xl md:text-6xl font-bold text-white mb-4"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              Weather Forecast
            </motion.h1>
            <motion.p 
              className="text-white/80 text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Discover the weather in your favorite cities
            </motion.p>
          </div>

          <div className="relative mb-8">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={city}
                  onChange={handleInputChange}
                  placeholder="Search for a city..."
                  className="w-full px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-md text-white placeholder-white/70 outline-none focus:ring-2 focus:ring-white/50 text-lg"
                />
                <AnimatePresence>
                  {suggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white/10 backdrop-blur-md rounded-xl overflow-hidden z-10"
                    >
                      {suggestions.map((suggestion, index) => (
                        <motion.button
                          key={`${suggestion.name}-${suggestion.country}-${index}`}
                          type="button"
                          onClick={() => {
                            setCity(`${suggestion.name}, ${suggestion.country}`);
                            fetchWeather(suggestion.latitude, suggestion.longitude, suggestion.name, suggestion.country);
                          }}
                          className="w-full text-left px-6 py-3 text-white hover:bg-white/20 transition-colors"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          {suggestion.name}, {suggestion.country}
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <button
                type="submit"
                className="px-6 py-4 bg-white/20 hover:bg-white/30 rounded-2xl transition-colors duration-200 backdrop-blur-md"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <Search className="w-6 h-6 text-white" />
                )}
              </button>
            </form>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-red-300 text-center mb-8 text-lg bg-red-500/10 backdrop-blur-md rounded-xl p-4"
              >
                {error}
              </motion.div>
            )}

            <Suspense fallback={
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-white text-center p-8"
              >
                <Loader2 className="w-8 h-8 animate-spin mx-auto" />
              </motion.div>
            }>
              {weather && <WeatherDisplay weather={weather} />}
            </Suspense>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

export default App;