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

      if (!weatherData.current_weather) {
        throw new Error('No se pudieron obtener los datos meteorológicos.');
      }

      setClima({
        nombre: name,
        pais: country || 'Desconocido',
        temperatura: weatherData.current_weather.temperature,
        sensacion: weatherData.current_weather.apparent_temperature || weatherData.current_weather.temperature,
        viento: weatherData.current_weather.windspeed,
        mensaje: weatherData.current_weather.temperature > 20 ? 'Hace calor' : 'Hace frío'
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '40px' }}>
      <div className="card" style={{ padding: '24px', background: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0', maxWidth: '500px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '8px' }}>Consulta del clima</h1>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>Busca una ciudad y consulta sus condiciones actuales.</p>
        
        <form onSubmit={buscarClima} style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
          <input 
            type="text" 
            value={ciudad} 
            onChange={(e) => setCiudad(e.target.value)} 
            placeholder="Ejemplo: Bogotá"
            style={{ flex: 1, padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
          />
          <button type="submit" style={{ padding: '8px 16px', background: '#f1f1f1', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px', cursor: 'pointer' }}>
            Consultar clima
          </button>
        </form>

        {loading && <p>Cargando...</p>}
        {error && <p className="error" style={{ color: '#d9534f', fontSize: '14px' }}>{error}</p>}

        {clima && (
          <div className="weather-info" style={{ marginTop: '16px', padding: '16px', background: '#f9f9f9', borderRadius: '6px', border: '1px solid #eee' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>{clima.nombre}</h2>
            <p style={{ margin: '4px 0', fontSize: '14px' }}>País: {clima.pais}</p>
            <p style={{ margin: '4px 0', fontSize: '14px' }}>Temperatura: {clima.temperatura} °C</p>
            <p style={{ margin: '4px 0', fontSize: '14px' }}>Sensación térmica: {clima.sensacion} °C</p>
            <p style={{ margin: '4px 0', fontSize: '14px' }}>Viento: {clima.viento} km/h</p>
            <p style={{ margin: '8px 0 0 0', fontSize: '14px', fontWeight: 'bold' }}>{clima.mensaje}</p>
          </div>
        )}
      </div>
    </div>
  );
}