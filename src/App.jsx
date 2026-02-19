import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

function App() {
  // --- NAVEGACIÓN Y DATOS ---
  const [seccion, setSeccion] = useState('Vehículos')
  const [autos, setAutos] = useState([])
  const [historialJornadas, setHistorialJornadas] = useState([])
  
  // --- ESTADO PARA EDICIÓN ---
  const [editandoId, setEditandoId] = useState(null)

  // --- ESTADOS PARA FORMULARIO VEHÍCULOS ---
  const [marca, setMarca] = useState('')
  const [modelo, setModelo] = useState('')
  const [año, setAño] = useState('')
  const [placa, setPlaca] = useState('')
  const [uso, setUso] = useState('Personal')

  // --- ESTADOS PARA JORNADA ---
  const [plataforma, setPlataforma] = useState('Uber')
  const [monto, setMonto] = useState('')
  const [propina, setPropina] = useState('')
  const [autoSeleccionado, setAutoSeleccionado] = useState('')

  useEffect(() => {
    fetchAutos()
    fetchJornadas()
  }, [])

  // --- LÓGICA DE VEHÍCULOS ---
  async function fetchAutos() {
    const { data } = await supabase.from('vehiculos').select('*').order('id', { ascending: false })
    if (data) setAutos(data)
  }

 async function manejarEnvioAuto(e) {
  e.preventDefault();
  
  // Convertimos a los tipos de datos exactos que espera Supabase
  const datos = { 
    marca: marca.trim(), 
    modelo: modelo.trim(), 
    año: parseInt(año), 
    placa: placa.trim(), 
    uso: uso 
  };

  if (editandoId) {
    // IMPORTANTE: Usamos el ID directamente como se guardó
    const { data, error } = await supabase
      .from('vehiculos')
      .update(datos)
      .match({ id: editandoId }); // 'match' es a veces más efectivo que 'eq' para IDs numéricos

    if (error) {
      alert("Error de Supabase: " + error.message);
      return;
    }
    
    alert("✅ Cambios guardados en base de datos");
    setEditandoId(null);
  } else {
    const { error } = await supabase.from('vehiculos').insert([datos]);
    if (error) {
      alert("Error al crear: " + error.message);
      return;
    }
    alert("✅ Vehículo registrado");
  }

  // Limpiar campos y RECARGAR
  setMarca(''); setModelo(''); setAño(''); setPlaca(''); setUso('Personal');
  
  // Agregamos un pequeño retraso para dar tiempo a Supabase de propagar el cambio
  setTimeout(() => {
    fetchAutos();
  }, 500);
}

  function prepararEdicion(auto) {
    setEditandoId(auto.id)
    setMarca(auto.marca)
    setModelo(auto.modelo)
    setAño(auto.año)
    setPlaca(auto.placa)
    setUso(auto.uso)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function borrarAuto(id) {
    if (confirm("¿Eliminar este vehículo?")) {
      const { error } = await supabase.from('vehiculos').delete().eq('id', id)
      if (!error) fetchAutos()
    }
  }

  // --- LÓGICA DE JORNADAS ---
  async function fetchJornadas() {
    const { data } = await supabase.from('jornadas').select('*, vehiculos(marca, modelo)').order('id', { ascending: false })
    if (data) setHistorialJornadas(data)
  }

  async function guardarJornada(e) {
    e.preventDefault()
    const { error } = await supabase.from('jornadas').insert([{ 
      plataforma, monto_plataforma: parseFloat(monto), propina: parseFloat(propina || 0), auto_id: parseInt(autoSeleccionado) 
    }])
    if (!error) {
      alert("✅ Jornada guardada"); setMonto(''); setPropina(''); fetchJornadas()
    }
  }

  async function borrarJornada(id) {
    if (confirm("¿Eliminar registro?")) {
      const { error } = await supabase.from('jornadas').delete().eq('id', id)
      if (!error) fetchJornadas()
    }
  }

  return (
    <div style={containerStyle}>
      <div style={contentWrapper}>
        
        <header style={headerStyle}>
          <h1 style={titleStyle}>NEXUS <span style={thinStyle}>APP</span></h1>
          <p style={subtitleStyle}>{seccion.toUpperCase()}</p>
        </header>

        {/* --- MÓDULO VEHÍCULOS --- */}
        {seccion === 'Vehículos' && (
          <>
            <form onSubmit={manejarEnvioAuto} style={formStyle}>
              <h3 style={{marginTop: 0, fontSize: '1.2rem'}}>{editandoId ? '✎ Editando Auto' : 'Nuevo Vehículo'}</h3>
              <div style={rowStyle}>
                <input placeholder="Marca" value={marca} onChange={e => setMarca(e.target.value)} style={inputStyle} required />
                <input placeholder="Modelo" value={modelo} onChange={e => setModelo(e.target.value)} style={inputStyle} required />
              </div>
              <div style={rowStyle}>
                <input placeholder="Año" type="number" value={año} onChange={e => setAño(e.target.value)} style={smallInputStyle} required />
                <input placeholder="Placa" value={placa} onChange={e => setPlaca(e.target.value)} style={smallInputStyle} required />
                <select value={uso} onChange={e => setUso(e.target.value)} style={selectStyle}>
                  <option value="Personal">Personal</option>
                  <option value="Uber / inDrive">Uber</option>
                  <option value="Renta Privada">Renta</option>
                  <option value="Mantenimiento">Taller</option>
                </select>
              </div>
              <button type="submit" style={buttonStyle}>
                {editandoId ? 'GUARDAR CAMBIOS' : 'REGISTRAR VEHÍCULO'}
              </button>
              {editandoId && (
                <button type="button" onClick={() => {setEditandoId(null); setMarca(''); setModelo(''); setAño(''); setPlaca('');}} style={{...buttonStyle, backgroundColor: '#222', color: '#fff', marginTop: '5px'}}>CANCELAR</button>
              )}
            </form>

            <div style={gridStyle}>
              {autos.map(auto => (
                <div key={auto.id} style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={placaBadge}>{auto.placa}</span>
                      <h3 style={cardTitle}>{auto.marca} {auto.modelo}</h3>
                      <p style={cardInfo}>{auto.uso}</p>
                    </div>
                    <div style={{display: 'flex', gap: '15px'}}>
                      <button onClick={() => prepararEdicion(auto)} style={{background:'none', border:'none', color:'#fff', cursor:'pointer', fontSize: '1.2rem'}}>✎</button>
                      <button onClick={() => borrarAuto(auto.id)} style={deleteBtn}>✕</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* --- OTROS MÓDULOS (BREVE) --- */}
        {seccion === 'Finanzas' && <div style={{textAlign:'center', padding:'50px'}}>Módulo de Banco en desarrollo</div>}
        {seccion === 'Registros' && <div style={{textAlign:'center', padding:'50px'}}>Módulo de Jornadas en desarrollo</div>}

        {/* NAV INFERIOR */}
        <nav style={navStyle}>
          <div style={navItem} onClick={() => setSeccion('Vehículos')}><span style={{fontSize:'1.2rem', opacity: seccion === 'Vehículos' ? 1 : 0.3}}>🚗</span><span style={{...navLabel, color: seccion === 'Vehículos' ? '#fff' : '#444'}}>Flota</span></div>
          <div style={navItem} onClick={() => setSeccion('Finanzas')}><span style={{fontSize:'1.2rem', opacity: seccion === 'Finanzas' ? 1 : 0.3}}>🏦</span><span style={{...navLabel, color: seccion === 'Finanzas' ? '#fff' : '#444'}}>Banco</span></div>
          <div style={navItem} onClick={() => setSeccion('Registros')}><span style={{fontSize:'1.2rem', opacity: seccion === 'Registros' ? 1 : 0.3}}>⏱️</span><span style={{...navLabel, color: seccion === 'Registros' ? '#fff' : '#444'}}>Jornada</span></div>
        </nav>
      </div>
    </div>
  )
}

// --- ESTILOS ---
const containerStyle = { backgroundColor: '#000', minHeight: '100vh', width: '100vw', display: 'flex', justifyContent: 'center', color: '#fff', paddingBottom: '120px', fontFamily: '-apple-system, sans-serif' }
const contentWrapper = { width: '100%', maxWidth: '500px', padding: '20px' }
const headerStyle = { textAlign: 'center', margin: '40px 0' }
const titleStyle = { fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-2px', margin: 0 }
const thinStyle = { fontWeight: '200', color: '#666' }
const subtitleStyle = { fontSize: '0.65rem', letterSpacing: '4px', color: '#444', fontWeight: '700' }
const formStyle = { background: '#0a0a0a', padding: '25px', borderRadius: '28px', border: '1px solid #1a1a1a', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }
const rowStyle = { display: 'flex', gap: '10px' }
const inputStyle = { flex: 1, backgroundColor: '#111', padding: '16px', borderRadius: '14px', border: '1px solid #222', color: '#fff', fontSize: '16px', outline: 'none' }
const smallInputStyle = { ...inputStyle, flex: 1 }
const selectStyle = { ...inputStyle, appearance: 'none' }
const buttonStyle = { padding: '18px', backgroundColor: '#fff', color: '#000', border: 'none', borderRadius: '14px', fontWeight: '800', cursor: 'pointer', marginTop: '10px' }
const gridStyle = { display: 'grid', gap: '15px' }
const cardStyle = { background: '#0a0a0a', padding: '25px', borderRadius: '24px', border: '1px solid #1a1a1a' }
const placaBadge = { color: '#444', fontSize: '0.75rem', fontWeight: '800' }
const cardTitle = { fontSize: '1.4rem', margin: '5px 0', fontWeight: '700' }
const cardInfo = { color: '#666', fontSize: '1rem', margin: 0 }
const deleteBtn = { background: 'none', border: 'none', color: '#222', cursor: 'pointer', fontSize: '1.2rem' }
const navStyle = { position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: '360px', backgroundColor: 'rgba(10, 10, 10, 0.7)', backdropFilter: 'blur(25px)', display: 'flex', justifyContent: 'space-around', padding: '18px 0', borderRadius: '35px', border: '1px solid rgba(255,255,255,0.05)' }
const navItem = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer' }
const navLabel = { fontSize: '0.6rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }

export default App