import React, { useState } from 'react';
import './styles.css';

export default function App() {
  const [ciudad, setCiudad] = useState('');
  const [clima, setClima] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const buscarClima = async (e) => {
    e.preventDefault();
    if (!ciudad.trim()) return;

    setLoading(true);
    setError(null);
    setClima(null);

    try {
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(ciudad)}&count=1&language=es&format=json`);
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        throw new Error('No se encontró la ciudad especificada.');
      }

      const ubicacion = geoData.results[0];
      const { latitude, longitude, name, country } = ubicacion;

      const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
      const weatherData = await weatherRes.json();

      setClima({
        nombre: name,
        pais: country || 'Desconocido',
        temperatura: weatherData.current_weather.temperature,
        sensacion: weatherData.current_weather.apparent_temperature,
        viento: weatherData.current_weather.wind_speed,
        mensaje: weatherData.current_weather.temperature < 20 ? 'Hace calor' : 'Hace frío'
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1>Consulta del clima</h1>
        <p>Busca una ciudad y consulta sus condiciones actuales.</p>
        <form onSubmit={buscarClima}>
          <input 
            type="text" 
            value={ciudad} 
            onChange={(e) => setCiudad(e.target.value)} 
            placeholder="Ejemplo: Bogotá"
          />
          <button type="submit">Consultar clima</button>
        </form>

        {loading && <p>Cargando...</p>}
        {error && <p className="error">{error}</p>}

        {clima && (
          <div className="weather-info">
            <h2>{clima.nombre}</h2>
            <p>País: {clima.pais}</p>
            <p>Temperatura: {clima.temperatura} °C</p>
            <p>Sensación térmica: {clima.sensacion} °C</p>
            <p>Viento: {clima.viento} km/h</p>
            <p>{clima.mensaje}</p>
          </div>
        )}
      </div>
    </div>
  );
}