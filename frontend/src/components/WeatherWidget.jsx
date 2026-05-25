// Widget de clima — integração com OpenWeather API

import { useState, useEffect } from 'react';

const OPENWEATHER_KEY = import.meta.env.VITE_OPENWEATHER_KEY || '1f1a4a540c4e9b280fb64598b8aff1bd';

// Mapeia ícones OpenWeather para emojis visuais
const weatherIcons = {
  '01d': '☀️', '01n': '🌙',
  '02d': '⛅', '02n': '⛅',
  '03d': '☁️', '03n': '☁️',
  '04d': '☁️', '04n': '☁️',
  '09d': '🌧️', '09n': '🌧️',
  '10d': '🌦️', '10n': '🌧️',
  '11d': '⛈️', '11n': '⛈️',
  '13d': '❄️', '13n': '❄️',
  '50d': '🌫️', '50n': '🌫️',
};

/**
 * Widget de clima que busca localização do usuário automaticamente
 * Exibe temperatura, condição e cidade
 */
export default function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [city, setCity] = useState('');
  const [inputCity, setInputCity] = useState('');
  const [showInput, setShowInput] = useState(false);

  // Busca clima por coordenadas geográficas
  const fetchWeatherByCoords = async (lat, lon) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=pt_br&appid=${OPENWEATHER_KEY}`
      );
      if (!res.ok) throw new Error('Erro ao buscar clima');
      const data = await res.json();
      setWeather(data);
      setCity(data.name);
    } catch {
      setError('Não foi possível carregar o clima');
    } finally {
      setLoading(false);
    }
  };

  // Busca clima por nome de cidade
  const fetchWeatherByCity = async (cityName) => {
    if (!cityName.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&units=metric&lang=pt_br&appid=${OPENWEATHER_KEY}`
      );
      if (!res.ok) throw new Error('Cidade não encontrada');
      const data = await res.json();
      setWeather(data);
      setCity(data.name);
      setShowInput(false);
    } catch {
      setError('Cidade não encontrada');
    } finally {
      setLoading(false);
    }
  };

  // Tenta geolocalização ao montar
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
        () => {
          // Fallback: São Paulo se geolocation negada
          fetchWeatherByCity('São Paulo');
        }
      );
    } else {
      fetchWeatherByCity('São Paulo');
    }
  }, []);

  const handleCitySubmit = (e) => {
    e.preventDefault();
    fetchWeatherByCity(inputCity);
  };

  const icon = weather?.weather?.[0]?.icon;
  const temp = weather?.main?.temp ? Math.round(weather.main.temp) : null;
  const feels = weather?.main?.feels_like ? Math.round(weather.main.feels_like) : null;
  const condition = weather?.weather?.[0]?.description;
  const humidity = weather?.main?.humidity;

  return (
    <div className="glass rounded-2xl overflow-hidden border border-white/10">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Clima</span>
        </div>
        <button
          id="change-city-btn"
          onClick={() => setShowInput(v => !v)}
          className="text-xs text-slate-500 hover:text-primary-400 transition-colors"
          title="Mudar cidade"
        >
          {showInput ? 'Cancelar' : 'Mudar cidade'}
        </button>
      </div>

      <div className="p-4">
        {/* Input de cidade */}
        {showInput && (
          <form onSubmit={handleCitySubmit} className="mb-3 animate-slide-down">
            <div className="flex gap-2">
              <input
                id="city-input"
                type="text"
                value={inputCity}
                onChange={e => setInputCity(e.target.value)}
                placeholder="Nome da cidade..."
                className="input-field text-xs py-2"
                autoFocus
              />
              <button type="submit" className="btn-primary px-3 py-2 text-xs">
                OK
              </button>
            </div>
          </form>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center gap-3 py-2">
            <div className="skeleton w-10 h-10 rounded-xl" />
            <div className="space-y-2 flex-1">
              <div className="skeleton h-5 w-16 rounded" />
              <div className="skeleton h-3 w-24 rounded" />
            </div>
          </div>
        )}

        {/* Erro */}
        {error && !loading && (
          <p className="text-xs text-red-400 text-center py-2">{error}</p>
        )}

        {/* Dados do clima */}
        {weather && !loading && (
          <div className="animate-fade-in">
            <div className="flex items-center gap-3">
              <span className="text-4xl leading-none" role="img" aria-label={condition}>
                {weatherIcons[icon] || '🌡️'}
              </span>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">{temp}°</span>
                  <span className="text-sm text-slate-500">C</span>
                </div>
                <p className="text-xs text-slate-400 capitalize">{condition}</p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                {city}
              </span>
              <span>💧 {humidity}%</span>
              <span>Sensação {feels}°</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
