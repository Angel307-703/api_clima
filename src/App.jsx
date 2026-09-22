import { useState } from "react";
/* Debe buscar una ciudad y mostrar correctamente clima actual. Objetivo: depurar fetch, selección de datos, conversiones y condiciones lógicas. */
function App(){
 const[ciudad,setCiudad]=useState(""); const[lugar,setLugar]=useState(null); const[clima,setClima]=useState(null); const[cargando,setCargando]=useState(false); const[error,setError]=useState("");
 const buscarClima=async()=>{ if(!ciudad.trim()){setError("Escribe una ciudad");return;} try{setCargando(true);setError("");setLugar(null);setClima(null);
  const r1=await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(ciudad)}&count=5&language=es&format=json`); if(!r1.ok)throw new Error("No fue posible buscar la ciudad"); const g=await r1.json(); const resultados=g.results??[]; if(!resultados.length){setError("No se encontró la ciudad");return;}
  const ubicacion=resultados[1]??resultados[0]; setLugar(ubicacion);
  const r2=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${ubicacion.latitude}&longitude=${ubicacion.longitude}&current=temperature_2m,apparent_temperature,wind_speed_10m`); if(!r2.ok)throw new Error("No fue posible consultar el clima"); const d=await r2.json(); const t=d.current?.temperature_2m??0; const temperatura=Number((t*1.8).toFixed(1)); const estado=temperatura<25?"Hace calor":"Temperatura moderada";
  setClima({temperatura,sensacion:d.current?.apparent_temperature??0,viento:d.current?.wind_speed_10m??0,estado});
 }catch(e){setError(e.message)}finally{setCargando(false)}};
 return <main><h1>Consulta del clima</h1><p>Busca una ciudad y consulta sus condiciones actuales.</p><input value={ciudad} placeholder="Ejemplo: Bogotá" onChange={e=>setCiudad(e.target.value)}/><button onClick={buscarClima} disabled={cargando}>{cargando?"Consultando...":"Consultar clima"}</button>{error&&<p>{error}</p>}{lugar&&clima&&<article><h2>{lugar.name}</h2><p>País: {lugar.country}</p><p>Temperatura: {clima.temperatura} °C</p><p>Sensación térmica: {clima.sensacion} °C</p><p>Viento: {clima.viento} km/h</p><strong>{clima.estado}</strong></article>}</main>;
} export default App;