import { useState, useEffect, useRef } from 'react';
import {
  Cloud, Sun, CloudRain, Wind, CloudLightning, Droplets, Snowflake,
  Thermometer, Eye, Gauge, Waves, Sunset, Sunrise, MapPin, RefreshCw, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const WeatherWidget = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const panelRef = useRef(null);

  const fetchWeather = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
      if (!API_KEY) { setLoading(false); return; }

      const lat = 12.9716;
      const lon = 77.5946;

      const [weatherRes, aqiRes] = await Promise.all([
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`),
        fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`)
      ]);

      if (weatherRes.ok && aqiRes.ok) {
        const w = await weatherRes.json();
        const aqiData = await aqiRes.json();
        const aqi = aqiData.list[0];

        setWeatherData({
          temp: Math.round(w.main.temp),
          feelsLike: Math.round(w.main.feels_like),
          tempMin: Math.round(w.main.temp_min),
          tempMax: Math.round(w.main.temp_max),
          humidity: w.main.humidity,
          pressure: w.main.pressure,
          visibility: Math.round(w.visibility / 1000),
          windSpeed: Math.round(w.wind.speed * 3.6), // m/s to km/h
          windDeg: w.wind.deg,
          condition: w.weather[0].main,
          description: w.weather[0].description,
          cloudiness: w.clouds.all,
          sunrise: new Date(w.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sunset: new Date(w.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          aqiIndex: aqi.main.aqi,
          pm25: aqi.components.pm2_5.toFixed(1),
          pm10: aqi.components.pm10.toFixed(1),
          co: aqi.components.co.toFixed(1),
          no2: aqi.components.no2.toFixed(1),
          updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      }
    } catch (err) {
      console.error('Weather fetch failed:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Close panel on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (loading || !weatherData) return (
    <div className="animate-pulse bg-slate-100 rounded-full h-8 w-28 hidden md:block" />
  );

  const getIcon = (condition, size = 16) => {
    const c = condition.toLowerCase();
    const cls = `w-${size === 16 ? 4 : 7} h-${size === 16 ? 4 : 7}`;
    if (c.includes('clear') || c.includes('sun')) return <Sun className={`${cls} text-yellow-500`} />;
    if (c.includes('rain') || c.includes('drizzle')) return <CloudRain className={`${cls} text-blue-400`} />;
    if (c.includes('thunderstorm')) return <CloudLightning className={`${cls} text-purple-500`} />;
    if (c.includes('snow')) return <Snowflake className={`${cls} text-blue-200`} />;
    if (c.includes('mist') || c.includes('fog')) return <Droplets className={`${cls} text-slate-400`} />;
    if (c.includes('cloud')) return <Cloud className={`${cls} text-slate-400`} />;
    return <Wind className={`${cls} text-slate-500`} />;
  };

  const getAqiInfo = (index) => {
    const map = {
      1: { text: 'Good', color: 'bg-green-500', textColor: 'text-green-600', desc: 'Air quality is satisfactory.' },
      2: { text: 'Fair', color: 'bg-yellow-400', textColor: 'text-yellow-600', desc: 'Acceptable air quality.' },
      3: { text: 'Moderate', color: 'bg-orange-400', textColor: 'text-orange-600', desc: 'Sensitive groups may be affected.' },
      4: { text: 'Poor', color: 'bg-red-500', textColor: 'text-red-600', desc: 'Health effects for everyone.' },
      5: { text: 'Very Poor', color: 'bg-purple-600', textColor: 'text-purple-600', desc: 'Emergency conditions.' },
    };
    return map[index] || { text: 'N/A', color: 'bg-slate-400', textColor: 'text-slate-500', desc: '' };
  };

  const getWindDir = (deg) => {
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return dirs[Math.round(deg / 45) % 8];
  };

  const aqiInfo = getAqiInfo(weatherData.aqiIndex);

  return (
    <div className="relative hidden md:block" ref={panelRef}>
      {/* Trigger pill */}
      <motion.button
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => setIsOpen(v => !v)}
        className={`flex items-center gap-3 px-4 py-1.5 rounded-full border shadow-sm transition-all duration-200 cursor-pointer select-none ${
          isOpen
            ? 'bg-slate-800 border-slate-700 text-white shadow-lg'
            : 'bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-md'
        }`}
      >
        <div className={`flex items-center gap-1.5 ${isOpen ? '' : 'border-r border-slate-200 pr-3'}`}>
          {getIcon(weatherData.condition)}
          <span className={`font-bold text-sm ${isOpen ? 'text-white' : 'text-slate-700'}`}>{weatherData.temp}°C</span>
        </div>
        {!isOpen && (
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${aqiInfo.color} animate-pulse`} />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">AQI: {aqiInfo.text}</span>
          </div>
        )}
        {isOpen && <X size={14} className="text-slate-400" />}
      </motion.button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-5 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-2 font-semibold">
                    <MapPin size={12} />
                    Bengaluru, Karnataka
                  </div>
                  <div className="flex items-end gap-3">
                    <div className="scale-150 origin-left ml-2 mb-1">
                      {getIcon(weatherData.condition, 28)}
                    </div>
                    <div>
                      <p className="text-5xl font-black leading-none">{weatherData.temp}°</p>
                      <p className="text-slate-300 text-sm capitalize font-medium mt-1">{weatherData.description}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); fetchWeather(true); }}
                  className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                >
                  <RefreshCw size={14} className={`text-slate-400 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/10 text-xs text-slate-400 font-semibold">
                <span>Feels {weatherData.feelsLike}°C</span>
                <span className="text-slate-600">|</span>
                <span>↓ {weatherData.tempMin}° ↑ {weatherData.tempMax}°</span>
                <span className="text-slate-600">|</span>
                <span>Updated {weatherData.updatedAt}</span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="p-4 grid grid-cols-3 gap-3">
              {[
                { icon: <Droplets size={15} className="text-blue-400" />, label: 'Humidity', value: `${weatherData.humidity}%` },
                { icon: <Wind size={15} className="text-slate-400" />, label: 'Wind', value: `${weatherData.windSpeed} km/h ${getWindDir(weatherData.windDeg)}` },
                { icon: <Gauge size={15} className="text-purple-400" />, label: 'Pressure', value: `${weatherData.pressure} hPa` },
                { icon: <Eye size={15} className="text-teal-400" />, label: 'Visibility', value: `${weatherData.visibility} km` },
                { icon: <Cloud size={15} className="text-slate-400" />, label: 'Cloudiness', value: `${weatherData.cloudiness}%` },
                { icon: <Thermometer size={15} className="text-red-400" />, label: 'Feels Like', value: `${weatherData.feelsLike}°C` },
              ].map((item, i) => (
                <div key={i} className="bg-slate-50 rounded-xl p-2.5 flex flex-col items-center text-center gap-1">
                  {item.icon}
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</p>
                  <p className="text-xs font-black text-slate-700">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Sunrise / Sunset */}
            <div className="px-4 pb-3 flex gap-3">
              <div className="flex-1 bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-center gap-2">
                <Sunrise size={16} className="text-amber-500" />
                <div>
                  <p className="text-[9px] font-bold text-amber-500 uppercase tracking-wider">Sunrise</p>
                  <p className="text-xs font-black text-slate-700">{weatherData.sunrise}</p>
                </div>
              </div>
              <div className="flex-1 bg-orange-50 border border-orange-100 rounded-xl p-3 flex items-center gap-2">
                <Sunset size={16} className="text-orange-500" />
                <div>
                  <p className="text-[9px] font-bold text-orange-500 uppercase tracking-wider">Sunset</p>
                  <p className="text-xs font-black text-slate-700">{weatherData.sunset}</p>
                </div>
              </div>
            </div>

            {/* AQI Section */}
            <div className="px-4 pb-4">
              <div className={`rounded-xl p-4 border ${
                weatherData.aqiIndex <= 2 ? 'bg-green-50 border-green-200' :
                weatherData.aqiIndex === 3 ? 'bg-orange-50 border-orange-200' :
                'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                    <Waves size={14} /> Air Quality Index
                  </p>
                  <span className={`text-xs font-black px-2.5 py-0.5 rounded-full text-white ${aqiInfo.color}`}>
                    {aqiInfo.text}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium mb-3">{aqiInfo.desc}</p>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'PM2.5', value: weatherData.pm25, unit: 'μg' },
                    { label: 'PM10', value: weatherData.pm10, unit: 'μg' },
                    { label: 'CO', value: weatherData.co, unit: 'μg' },
                    { label: 'NO₂', value: weatherData.no2, unit: 'μg' },
                  ].map((p, i) => (
                    <div key={i} className="bg-white/70 rounded-lg p-2 text-center">
                      <p className="text-[9px] font-bold text-slate-400">{p.label}</p>
                      <p className="text-xs font-black text-slate-700">{p.value}</p>
                      <p className="text-[8px] text-slate-400">{p.unit}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WeatherWidget;
