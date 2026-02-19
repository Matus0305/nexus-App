import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

function App() {
  // --- ESTADOS NAVEGACIÓN Y DATOS ---
  const [seccion, setSeccion] = useState('Vehículos')
  const [autos, setAutos] = useState([])
  const [historialJornadas, setHistorialJornadas] = useState([])
  
  // --- ESTADOS PARA FORMULARIO VEHÍCULOS ---
  const [marca, setMarca] = useState('')
  const [modelo, setModelo] = useState('')
  const [año, setAño] = useState('')
  const [placa, setPlaca] = useState('')
  const [uso, setUso] = useState('Personal')

  // --- ESTADOS PARA FORMULARIO JORNADA ---
  const [plataforma, setPlataforma] = useState('Uber')
  const [monto, setMonto] = useState('')
  const [propina, setPropina] = useState('')
  const [autoSeleccionado, setAutoSeleccionado] = useState('')

  // --- CARGA INICIAL DE DATOS ---
  useEffect(() => {
    fetchAutos()
    fetchJornadas()
  }, [])

  // --- FUNCIONES DE VEHÍCULOS ---
  async function fetchAutos() {
    const { data } = await supabase
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
      alert("✅ Vehículo registrado")
    }
  }

  async function borrarAuto(id) {
    if (confirm("¿Eliminar vehículo de la flota?")) {
      const { error } = await supabase.from('vehiculos').delete().eq('id', id)
      if (!error) fetchAutos()
    }
  }

  // --- FUNCIONES DE JORNADA (REGISTROS) ---
  async function fetchJornadas() {
    const { data } = await supabase
      .from('jornadas')
      .select(`
        *,
        vehiculos (marca, modelo)
      `)
      .order('fecha', { ascending: false })
    if (data) setHistorialJornadas(data)
  }

  async function guardarJornada(e) {
    e.preventDefault();
    if (!autoSeleccionado || !monto) {
      alert("Selecciona auto y monto");
      return;
    }

    const { error } = await supabase
      .from('jornadas')
      .insert([{ 
        plataforma, 
        monto_plataforma: parseFloat(monto), 
        propina: parseFloat(propina || 0), 
        auto_id: parseInt(autoSeleccionado) 
      }]);

    if (!error) {
      alert("✅ Jornada guardada");
      setMonto(''); setPropina(''); setAutoSeleccionado('');
      fetchJornadas()
    } else {
      alert("Error: " + error.message)
    }
  }

  async function borrarJornada(id) {
    if (confirm("¿Eliminar este registro de jornada?")) {
      const { error } = await supabase.from('jornadas').delete().eq('id', id)
      if (!error) {
        alert("Registro eliminado")
        fetchJornadas()
      }
    }
  }

  return (
    <div style={containerStyle}>
      <div style={contentWrapper}>
        
        <header style={headerStyle}>
          <h1 style={titleStyle}>NEXUS <span style={thinStyle}>APP</span></h1>
          <div style={dividerStyle}></div>
          <p style={subtitleStyle}>{seccion === 'Vehículos' ? 'CONTROL DE FLOTA' : seccion.toUpperCase()}</p>
        </header>

        {/* --- 1. MÓDULO VEHÍCULOS --- */}
        {seccion === 'Vehículos' && (
          <>
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
                  <option value="Uber / inDrive">Uber</option>
                  <option value="Renta Privada">Renta</option>
                  <option value="Mantenimiento">Taller</option>
                </select>
              </div>
              <button type="submit" style={buttonStyle}>REGISTRAR VEHÍCULO</button>
            </form>

            <div style={gridStyle}>
              {autos.map(auto => (
                <div key={auto.id} style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <span style={placaBadge}>{auto.placa || 'N/A'}</span>
                      <h3 style={cardTitle}>{auto.marca} {auto.modelo}</h3>
                      <p style={cardInfo}>{auto.uso}</p>
                    </div>
                    <button onClick={() => borrarAuto(auto.id)} style={deleteBtn}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* --- 2. MÓDULO FINANZAS (BANCO) --- */}
        {seccion === 'Finanzas' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={fintechCard}>
              <p style={{ margin: 0, opacity: 0.6, fontSize: '0.8rem' }}>SALDO TOTAL DISPONIBLE</p>
              <h2 style={{ fontSize: '2.5rem', margin: '10px 0' }}>$0.00</h2>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button style={actionBtn}>+ Ingreso</button>
                <button style={actionBtn}>- Gasto</button>
              </div>
            </div>
            <h3 style={{ fontSize: '1rem', marginLeft: '10px' }}>Tus Cuentas</h3>
            <div style={accountItem}><span>💳 Tarjeta Nexus</span><strong>$0.00</strong></div>
            <div style={accountItem}><span>🏦 Banco Agrícola</span><strong>$0.00</strong></div>
          </div>
        )}

        {/* --- 3. MÓDULO REGISTROS (JORNADAS) --- */}
        {seccion === 'Registros' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <form onSubmit={guardarJornada} style={formStyle}>
              <h3 style={{ marginTop: 0, fontSize: '1.2rem' }}>Nueva Jornada</h3>
              <label style={labelStyle}>Plataforma</label>
              <select value={plataforma} onChange={e => setPlataforma(e.target.value)} style={inputStyle}>
                <option value="Uber">Uber</option>
                <option value="inDrive">inDrive</option>
                <option value="Privado">Privado</option>
              </select>
              <label style={labelStyle}>Vehículo utilizado</label>
              <select value={autoSeleccionado} onChange={e => setAutoSeleccionado(e.target.value)} style={inputStyle} required>
                <option value="">Selecciona el auto...</option>
                {autos.map(a => <option key={a.id} value={a.id}>{a.marca} {a.modelo}</option>)}
              </select>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Monto App</label>
                  <input placeholder="$0.00" type="number" step="0.01" value={monto} onChange={e => setMonto(e.target.value)} style={inputStyle} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Propina</label>
                  <input placeholder="$0.00" type="number" step="0.01" value={propina} onChange={e => setPropina(e.target.value)} style={inputStyle} />
                </div>
              </div>
              <button type="submit" style={buttonStyle}>GUARDAR JORNADA</button>
            </form>

            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginLeft: '10px' }}>Historial de Jornadas</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {historialJornadas.map(j => (
                <div key={j.id} style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ margin: 0, fontSize: '1rem', fontWeight: '700' }}>{j.plataforma} — ${j.monto_plataforma}</p>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#555' }}>
                        {j.vehiculos?.marca} {j.vehiculos?.modelo} • Propina: ${j.propina}
                      </p>
                    </div>
                    <button onClick={() => borrarJornada(j.id)} style={deleteBtn}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* NAVEGACIÓN INFERIOR */}
        <nav style={navStyle}>
          <div style={navItem} onClick={() => setSeccion('Vehículos')}>
            <span style={{ fontSize: '1.2rem', opacity: seccion === 'Vehículos' ? 1 : 0.3 }}>🚗</span>
            <span style={{ ...navLabel, color: seccion === 'Vehículos' ? '#fff' : '#444' }}>Flota</span>
          </div>
          <div style={navItem} onClick={() => setSeccion('Finanzas')}>
            <span style={{ fontSize: '1.2rem', opacity: seccion === 'Finanzas' ? 1 : 0.3 }}>🏦</span>
            <span style={{ ...navLabel, color: seccion === 'Finanzas' ? '#fff' : '#444' }}>Banco</span>
          </div>
          <div style={navItem} onClick={() => setSeccion('Registros')}>
            <span style={{ fontSize: '1.2rem', opacity: seccion === 'Registros' ? 1 : 0.3 }}>⏱️</span>
            <span style={{ ...navLabel, color: seccion === 'Registros' ? '#fff' : '#444' }}>Jornada</span>
          </div>
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
const dividerStyle = { height: '1px', width: '40px', backgroundColor: '#fff', margin: '15px auto', opacity: '0.1' }
const subtitleStyle = { fontSize: '0.65rem', letterSpacing: '4px', color: '#444', fontWeight: '700' }
const formStyle = { background: '#0a0a0a', padding: '25px', borderRadius: '28px', border: '1px solid #1a1a1a', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }
const rowStyle = { display: 'flex', gap: '10px' }
const inputStyle = { flex: 1, backgroundColor: '#111', padding: '16px', borderRadius: '14px', border: '1px solid #222', color: '#fff', fontSize: '16px', outline: 'none' }
const smallInputStyle = { ...inputStyle, flex: 1 }
const selectStyle = { ...inputStyle, appearance: 'none' }
const buttonStyle = { padding: '18px', backgroundColor: '#fff', color: '#000', border: 'none', borderRadius: '14px', fontWeight: '800', cursor: 'pointer', marginTop: '10px' }
const labelStyle = { fontSize: '0.65rem', color: '#555', fontWeight: '800', marginBottom: '-8px', marginLeft: '5px', textTransform: 'uppercase' }
const gridStyle = { display: 'grid', gap: '15px' }
const cardStyle = { background: '#0a0a0a', padding: '25px', borderRadius: '24px', border: '1px solid #1a1a1a' }
const placaBadge = { color: '#444', fontSize: '0.75rem', fontWeight: '800' }
const cardTitle = { fontSize: '1.4rem', margin: '5px 0', fontWeight: '700' }
const cardInfo = { color: '#666', fontSize: '1rem', margin: 0 }
const deleteBtn = { background: 'none', border: 'none', color: '#222', cursor: 'pointer', fontSize: '1.2rem' }
const fintechCard = { background: 'linear-gradient(145deg, #111, #000)', padding: '35px', borderRadius: '32px', border: '1px solid #222', textAlign: 'center' }
const actionBtn = { flex: 1, padding: '14px', borderRadius: '14px', border: 'none', backgroundColor: '#fff', color: '#000', fontWeight: '800', fontSize: '0.85rem' }
const accountItem = { display: 'flex', justifyContent: 'space-between', padding: '22px', background: '#0a0a0a', borderRadius: '20px', border: '1px solid #111', marginBottom: '12px' }
const navStyle = { position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: '360px', backgroundColor: 'rgba(10, 10, 10, 0.7)', backdropFilter: 'blur(25px)', display: 'flex', justifyContent: 'space-around', padding: '18px 0', borderRadius: '35px', border: '1px solid rgba(255,255,255,0.05)' }
const navItem = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer' }
const navLabel = { fontSize: '0.6rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }

export default App