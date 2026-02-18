import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

function App() {
  const [autos, setAutos] = useState([])
  const [marca, setMarca] = useState('')
  const [modelo, setModelo] = useState('')
  const [año, setAño] = useState('')
  const [placa, setPlaca] = useState('')
  const [uso, setUso] = useState('Personal')

  useEffect(() => {
    fetchAutos()
  }, [])

  async function fetchAutos() {
    const { data, error } = await supabase
      .from('vehiculos')
      .select('*')
      .order('id', { ascending: false })
    if (data) setAutos(data)
  }

  async function agregarAuto(e) {
    e.preventDefault()
    const { error } = await supabase
      .from('vehiculos')
      .insert([{ marca, modelo, año, placa, uso, estado: 'DISPONIBLE' }])
    
    if (!error) {
      setMarca(''); setModelo(''); setAño(''); setPlaca(''); setUso('Personal');
      fetchAutos()
    }
  }

  async function borrarAuto(id) {
    if (confirm("¿Eliminar registro de Nexus App?")) {
      const { error } = await supabase.from('vehiculos').delete().eq('id', id)
      if (!error) fetchAutos()
    }
  }

  return (
    <div style={containerStyle}>
      <div style={contentWrapper}>
        
        <header style={headerStyle}>
          <h1 style={titleStyle}>NEXUS <span style={thinStyle}>APP</span></h1>
          <div style={dividerStyle}></div>
          <p style={subtitleStyle}>GESTIÓN DE FLOTA</p>
        </header>

        {/* FORMULARIO MEJORADO CON TAMAÑOS IGUALES */}
        <form onSubmit={agregarAuto} style={formStyle}>
          <div style={rowStyle}>
            <input placeholder="Marca" value={marca} onChange={e => setMarca(e.target.value)} style={inputStyle} required />
            <input placeholder="Modelo" value={modelo} onChange={e => setModelo(e.target.value)} style={inputStyle} required />
          </div>
          
          <div style={rowStyle}>
            <input placeholder="Año" type="number" value={año} onChange={e => setAño(e.target.value)} style={smallInputStyle} required />
            <input placeholder="Placa" value={placa} onChange={e => setPlaca(e.target.value)} style={smallInputStyle} required />
            <select value={uso} onChange={e => setUso(e.target.value)} style={selectStyle}>
              <option value="Personal">Personal</option>
              <option value="Uber / inDrive">Uber / inDrive</option>
              <option value="Renta Privada">Renta</option>
              <option value="Mantenimiento">Taller</option>
            </select>
          </div>

          <button type="submit" style={buttonStyle}>
            REGISTRAR VEHÍCULO
          </button>
        </form>

        <div style={gridStyle}>
          {autos.length > 0 ? autos.map(auto => (
            <div key={auto.id} style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={placaBadge}>{auto.placa || 'N/A'}</span>
                  <h3 style={cardTitle}>{auto.marca} {auto.modelo}</h3>
                  <p style={cardInfo}>Serie {auto.año} • {auto.uso}</p>
                </div>
                <button onClick={() => borrarAuto(auto.id)} style={deleteBtn}>✕</button>
              </div>

              <div style={statusWrapper}>
                <div style={statusDot}></div>
                <span style={statusText}>{auto.estado}</span>
              </div>
            </div>
          )) : (
            <p style={emptyText}>No hay activos registrados en la red.</p>
          )}
        </div>

        <footer style={footerStyle}>
          © 2026 NEXUS APP • UNA DIVISIÓN MÁS DE NEXUS GROUP
        </footer>
      </div>
    </div>
  )
}

// --- ESTILOS REFINADOS ---

const containerStyle = {
  backgroundColor: '#000000',
  minHeight: '100vh',
  width: '100vw',
  margin: 0,
  padding: 0,
  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
  display: 'flex',
  justifyContent: 'center'
}

const contentWrapper = {
  width: '100%',
  maxWidth: '850px',
  padding: '40px 20px'
}

const headerStyle = { textAlign: 'center', marginBottom: '40px' }
const titleStyle = { fontSize: '2.8rem', fontWeight: '700', letterSpacing: '-2px', margin: 0, color: '#fff' }
const thinStyle = { fontWeight: '200', color: '#888' }
const dividerStyle = { height: '1px', width: '40px', backgroundColor: '#fff', margin: '15px auto', opacity: '0.2' }
const subtitleStyle = { fontSize: '0.7rem', letterSpacing: '4px', color: '#555', fontWeight: '600' }

const formStyle = {
  background: 'rgba(255, 255, 255, 0.03)',
  padding: '25px',
  borderRadius: '24px',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  marginBottom: '40px'
}

const rowStyle = {
  display: 'flex',
  gap: '12px',
  flexWrap: 'wrap'
}

const inputStyle = {
  flex: '1 1 200px',
  fontSize: '16px',
  backgroundColor: '#0f0f0f',
  padding: '16px',
  borderRadius: '14px',
  border: '1px solid #1a1a1a',
  color: '#ffffff',
  outline: 'none',
  boxSizing: 'border-box'
}

// Estilo específico para campos pequeños alineados
const smallInputStyle = {
  ...inputStyle,
  flex: '1 1 100px' 
}

const selectStyle = {
  ...smallInputStyle,
  appearance: 'none',
  cursor: 'pointer',
  backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'white\'%3E%3Cpath d=\'M7 10l5 5 5-5z\'/%3E%3C/svg%3E")',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  backgroundSize: '18px'
}

const buttonStyle = {
  padding: '18px',
  backgroundColor: '#ffffff',
  color: '#000',
  border: 'none',
  borderRadius: '14px',
  fontSize: '0.95rem',
  fontWeight: '700',
  cursor: 'pointer',
  marginTop: '8px'
}

const gridStyle = {
  display: 'grid',
  gap: '16px',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
}

const cardStyle = {
  background: 'linear-gradient(145deg, #0d0d0d, #050505)',
  padding: '25px',
  borderRadius: '26px',
  border: '1px solid rgba(255, 255, 255, 0.04)'
}

const placaBadge = { color: '#444', fontSize: '0.7rem', fontWeight: '800', letterSpacing: '1px' }
const cardTitle = { fontSize: '1.5rem', margin: '6px 0', color: '#eee' }
const cardInfo = { color: '#666', fontSize: '0.95rem', margin: 0 }
const statusWrapper = { display: 'flex', alignItems: 'center', gap: '8px', marginTop: '18px' }
const statusDot = { width: '7px', height: '7px', backgroundColor: '#fff', borderRadius: '50%', boxShadow: '0 0 8px #fff' }
const statusText = { fontSize: '0.65rem', fontWeight: '700', letterSpacing: '1px', color: '#fff' }
const deleteBtn = { background: 'none', border: 'none', color: '#333', fontSize: '1.2rem', cursor: 'pointer' }
const emptyText = { textAlign: 'center', color: '#333', gridColumn: '1 / -1', padding: '40px' }
const footerStyle = { textAlign: 'center', padding: '50px 0', color: '#222', fontSize: '0.65rem', letterSpacing: '2px' }

export default App
