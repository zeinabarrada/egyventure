import React, { useState, useEffect } from "react";
import { FaTemperatureHigh, FaWater, FaWind, FaCloud } from "react-icons/fa";
import "./Weather.css";
const WeatherDisplay = ({ city }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [forecast, setForecast] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch current weather
        const weatherResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=e661c9d0c9d81870a5f45430b08a4031&units=metric`
        );
        if (!weatherResponse.ok) {
          throw new Error("City not found");
        }
        const weatherData = await weatherResponse.json();
        setWeather(weatherData);

        // Fetch forecast
        const forecastResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=e661c9d0c9d81870a5f45430b08a4031&units=metric`
        );
        if (!forecastResponse.ok) {
          throw new Error("Forecast not available");
        }
        const forecastData = await forecastResponse.json();
        setForecast(forecastData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (city) {
      fetchWeather();
    }
  }, [city]);

  if (loading)
    return <div className="weather-loading">Loading weather data...</div>;
  if (error) return <div className="weather-error">Error: {error}</div>;
  if (!weather) return null;

  return (
    <div className="weather-container">
      <h2>Weather in {city}</h2>

      <div className="current-weather">
        <div className="weather-main">
          <img
            src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
            alt={weather.weather[0].description}
          />
          <span className="temp">{Math.round(weather.main.temp)}°C</span>
        </div>

        <div className="weather-details">
          <div className="detail">
            <FaTemperatureHigh />
            <span>Feels like: {Math.round(weather.main.feels_like)}°C</span>
          </div>

          <div className="detail">
            <FaCloud />
            <span>{weather.weather[0].description}</span>
          </div>
        </div>
      </div>

      {forecast && (
        <div className="forecast-container">
          <h3>5-Day Forecast</h3>
          <div className="forecast-items">
            {forecast.list
              .filter((item, index) => index % 8 === 0)
              .slice(0, 5)
              .map((day) => (
                <div key={day.dt} className="forecast-item">
                  <div className="forecast-day">
                    {new Date(day.dt * 1000).toLocaleDateString("en-US", {
                      weekday: "short",
                    })}
                  </div>
                  <img
                    src={`https://openweathermap.org/img/wn/${day.weather[0].icon}.png`}
                    alt={day.weather[0].description}
                  />
                  <div className="forecast-temp">
                    {Math.round(day.main.temp_max)}° /{" "}
                    {Math.round(day.main.temp_min)}°
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherDisplay;
