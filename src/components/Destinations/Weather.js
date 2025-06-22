import React, { useState, useEffect } from "react";
import {
  FaTemperatureHigh,
  FaArrowUp,
  FaArrowDown,
  FaCloud,
} from "react-icons/fa";
import "./Weather.css";

const WeatherDisplay = ({ city }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [forecast, setForecast] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiKey = "e661c9d0c9d81870a5f45430b08a4031";
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

        const [weatherResponse, forecastResponse] = await Promise.all([
          fetch(weatherUrl),
          fetch(forecastUrl),
        ]);

        if (!weatherResponse.ok) throw new Error("City not found");
        if (!forecastResponse.ok) throw new Error("Forecast not available");

        const weatherData = await weatherResponse.json();
        const forecastData = await forecastResponse.json();

        setWeather(weatherData);
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

  if (loading) return <div className="weather-loading">Loading weather...</div>;
  if (error) return <div className="weather-error">Error: {error}</div>;
  if (!weather || !forecast) return null;

  return (
    <div className="weather-widget">
      <div className="current-weather-main">
        <p className="city-name">{weather.name}</p>
        <div className="current-temp">
          <img
            src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
            alt=""
          />
          {Math.round(weather.main.temp)}°C
        </div>
        <p className="description">{weather.weather[0].description}</p>
      </div>

      <div className="weather-details-grid">
        <div className="detail-item">
          <FaTemperatureHigh />
          <div>
            <p>Feels Like</p>
            <span>{Math.round(weather.main.feels_like)}°</span>
          </div>
        </div>
        <div className="detail-item">
          <FaArrowUp />
          <div>
            <p>High</p>
            <span>{Math.round(weather.main.temp_max)}°</span>
          </div>
        </div>
        <div className="detail-item">
          <FaArrowDown />
          <div>
            <p>Low</p>
            <span>{Math.round(weather.main.temp_min)}°</span>
          </div>
        </div>
        <div className="detail-item">
          <FaCloud />
          <div>
            <p>Clouds</p>
            <span>{weather.clouds.all}%</span>
          </div>
        </div>
      </div>

      <div className="forecast-list">
        {forecast.list
          .filter((_, index) => index % 8 === 0)
          .slice(0, 5)
          .map((day) => (
            <div key={day.dt} className="forecast-day-item">
              <p>
                {new Date(day.dt * 1000).toLocaleDateString("en-US", {
                  weekday: "short",
                })}
              </p>
              <img
                src={`https://openweathermap.org/img/wn/${day.weather[0].icon}.png`}
                alt=""
              />
              <p>{Math.round(day.main.temp)}°</p>
            </div>
          ))}
      </div>
    </div>
  );
};

export default WeatherDisplay;
