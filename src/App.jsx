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
      setMarca(''); setModelo(''); setAño(''); setPlaca('');
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
          <p style={subtitleStyle}>GESTIÓN DE FLOTA EL SALVADOR</p>
        </header>

        {/* FORMULARIO ESTILO APPLE CARD */}
        <form onSubmit={agregarAuto} style={formStyle}>
          <div style={rowStyle}>
            <input placeholder="Marca (Ej: Nissan)" value={marca} onChange={e => setMarca(e.target.value)} style={inputStyle} required />
            <input placeholder="Modelo (Ej: Versa)" value={modelo} onChange={e => setModelo(e.target.value)} style={inputStyle} required />
          </div>
          
          <div style={rowStyle}>
            <input placeholder="Año" type="number" value={año} onChange={e => setAño(e.target.value)} style={inputStyle} required />
            <input placeholder="Placa" value={placa} onChange={e => setPlaca(e.target.value)} style={inputStyle} required />
          </div>

          <select value={uso} onChange={e => setUso(e.target.value)} style={selectStyle}>
            <option value="Personal">Uso: Personal</option>
            <option value="Uber / inDrive">Uso: Uber / inDrive</option>
            <option value="Renta Privada">Uso: Renta Privada</option>
            <option value="Mantenimiento">Uso: Mantenimiento</option>
          </select>

          <button type="submit" style={buttonStyle}>
            REGISTRAR VEHÍCULO
          </button>
        </form>

        {/* GRID DE VEHÍCULOS OPTIMIZADO */}
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
          © 2026 NEXUS APP • TECNOLOGÍA VEHICULAR
        </footer>
      </div>
    </div>
  )
}

// --- ESTILOS MEJORADOS TIPO APPLE ---

const containerStyle = {
  backgroundColor: '#000000',
  minHeight: '100vh',
  width: '100%',
  margin: 0,
  padding: 0,
  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif',
  color: '#ffffff',
  display: 'flex',
  justifyContent: 'center'
}

const contentWrapper = {
  width: '100%',
  maxWidth: '900px', // Limita el ancho en PC para que no se vea "estirado"
  padding: '40px 20px'
}

const headerStyle = {
  textAlign: 'center',
  marginBottom: '50px'
}

const titleStyle = {
  fontSize: '3rem',
  fontWeight: '700',
  letterSpacing: '-2px',
  margin: 0,
  color: '#ffffff'
}

const thinStyle = {
  fontWeight: '200',
  color: '#888'
}

const dividerStyle = {
  height: '1px',
  width: '60px',
  backgroundColor: '#ffffff',
  margin: '15px auto',
  opacity: '0.3'
}

const subtitleStyle = {
  fontSize: '0.75rem',
  letterSpacing: '4px',
  color: '#666',
  fontWeight: '600'
}

const formStyle = {
  background: 'rgba(255, 255, 255, 0.04)',
  padding: '30px',
  borderRadius: '30px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  display: 'flex',
  flexDirection: 'column',
  gap: '15px',
  marginBottom: '50px'
}

const rowStyle = {
  display: 'flex',
  gap: '15px',
  flexWrap: 'wrap'
}

const inputStyle = {
  flex: '1 1 200px',
  fontSize: '17px',
  backgroundColor: '#111',
  padding: '18px',
  borderRadius: '16px',
  border: '1px solid #222',
  color: '#ffffff',
  outline: 'none',
  transition: 'border 0.3s'
}

const selectStyle = {
  ...inputStyle,
  appearance: 'none',
  cursor: 'pointer'
}

const buttonStyle = {
  padding: '20px',
  backgroundColor: '#ffffff',
  color: '#000000',
  border: 'none',
  borderRadius: '16px',
  fontSize: '1rem',
  fontWeight: '700',
  cursor: 'pointer',
  marginTop: '10px',
  transition: 'transform 0.1s active'
}

const gridStyle = {
  display: 'grid',
  gap: '20px',
  gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))'
}

const cardStyle = {
  background: 'linear-gradient(145deg, #0f0f0f, #050505)',
  padding: '30px',
  borderRadius: '32px',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  minHeight: '180px'
}

const placaBadge = {
  color: '#444',
  fontSize: '0.75rem',
  fontWeight: '800',
  letterSpacing: '1px'
}

const cardTitle = {
  fontSize: '1.7rem',
  margin: '8px 0',
  fontWeight: '700',
  letterSpacing: '-0.5px'
}

const cardInfo = {
  color: '#666',
  fontSize: '1rem',
  margin: 0,
  fontWeight: '400'
}

const statusWrapper = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginTop: '20px'
}

const statusDot = {
  width: '8px',
  height: '8px',
  backgroundColor: '#ffffff',
  borderRadius: '50%',
  boxShadow: '0 0 10px rgba(255,255,255,0.5)'
}

const statusText = {
  fontSize: '0.7rem',
  fontWeight: '700',
  letterSpacing: '1px',
  color: '#ffffff'
}

const deleteBtn = {
  background: 'none',
  border: 'none',
  color: '#333',
  fontSize: '1.4rem',
  cursor: 'pointer',
  padding: '5px'
}

const emptyText = {
  textAlign: 'center',
  color: '#333',
  gridColumn: '1 / -1',
  padding: '40px'
}

const footerStyle = {
  textAlign: 'center',
  padding: '60px 0',
  color: '#222',
  fontSize: '0.7rem',
  letterSpacing: '2px'
}

export default App
