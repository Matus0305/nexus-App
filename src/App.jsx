import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

function App() {
  // --- ESTADOS ---
  const [seccion, setSeccion] = useState('Vehículos')
  const [autos, setAutos] = useState([])
  const [mostrarModal, setMostrarModal] = useState(false)
  const [editandoId, setEditandoId] = useState(null)

  // Estados Formulario
  const [marca, setMarca] = useState(''); const [modelo, setModelo] = useState('');
  const [año, setAño] = useState(''); const [placa, setPlaca] = useState('');
  const [uso, setUso] = useState('Personal');

  // --- LOGICA ---
  useEffect(() => { fetchAutos() }, [])

  async function fetchAutos() {
    const { data } = await supabase.from('vehiculos').select('*').order('id', { ascending: false })
    if (data) setAutos(data)
  }

  async function manejarEnvio(e) {
    e.preventDefault()
    const datos = { marca, modelo, año: parseInt(año), placa, uso }
    
    if (editandoId) {
      const { error } = await supabase.from('vehiculos').update(datos).eq('id', editandoId)
      if (!error) alert("Unidad Actualizada")
    } else {
      const { error } = await supabase.from('vehiculos').insert([datos])
      if (!error) alert("Unidad Registrada")
    }
    
    cerrarYLimpiar()
    fetchAutos()
  }

  function prepararEdicion(auto) {
    setEditandoId(auto.id)
    setMarca(auto.marca); setModelo(auto.modelo)
    setAño(auto.año); setPlaca(auto.placa); setUso(auto.uso)
    setMostrarModal(true)
  }

  async function borrarAuto(id) {
    if (confirm("¿Dar de baja esta unidad?")) {
      const { error } = await supabase.from('vehiculos').delete().eq('id', id)
      if (!error) fetchAutos()
    }
  }

  function cerrarYLimpiar() {
    setMostrarModal(false); setEditandoId(null)
    setMarca(''); setModelo(''); setAño(''); setPlaca(''); setUso('Personal')
  }

  return (
    <div style={appContainer}>
      {/* HEADER PREMIUM */}
      <header style={headerStyle}>
        <div style={logoBadge}>NEXUS SYSTEMS</div>
        <h1 style={mainTitle}>Gestión de Flota</h1>
      </header>

      {/* BODY SECTIONS */}
      <main style={mainContent}>
        {seccion === 'Vehículos' && (
          <>
            <div style={statsRow}>
              <div style={statItem}><span>{autos.length}</span><label>UNIDADES</label></div>
              <button onClick={() => setMostrarModal(true)} style={addBtn}>+ NUEVA UNIDAD</button>
            </div>

            <div style={gridStyle}>
              {autos.map(auto => (
                <div key={auto.id} style={glassCard}>
                  <div style={cardHeader}>
                    <span style={unitTag}>ID-{auto.id}</span>
                    <div style={cardActions}>
                      <button onClick={() => prepararEdicion(auto)} style={iconBtn}>✎</button>
                      <button onClick={() => borrarAuto(auto.id)} style={{...iconBtn, color: '#ff453a'}}>✕</button>
                    </div>
                  </div>
                  <h2 style={cardTitle}>{auto.marca} <span style={{fontWeight: 300}}>{auto.modelo}</span></h2>
                  <div style={cardFooter}>
                    <div style={metaData}>
                      <span>{auto.año}</span>
                      <span style={dot}>•</span>
                      <span>{auto.placa.toUpperCase()}</span>
                    </div>
                    <div style={statusBadge}>{auto.uso}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* FORMULARIO MODAL (EL CORAZON DEL CAMBIO) */}
      {mostrarModal && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <div style={modalGlass}>
              <div style={modalHeader}>
                <h3>{editandoId ? 'EDITAR UNIDAD' : 'REGISTRO TÉCNICO'}</h3>
                <button onClick={cerrarYLimpiar} style={closeModalBtn}>✕</button>
              </div>
              
              <form onSubmit={manejarEnvio} style={formLayout}>
                <div style={inputRow}>
                  <div style={inputWrap}><label>MARCA</label><input value={marca} onChange={e => setMarca(e.target.value)} required /></div>
                  <div style={inputWrap}><label>MODELO</label><input value={modelo} onChange={e => setModelo(e.target.value)} required /></div>
                </div>
                <div style={inputRow}>
                  <div style={inputWrap}><label>AÑO</label><input type="number" value={año} onChange={e => setAño(e.target.value)} required /></div>
                  <div style={inputWrap}><label>PLACA</label><input value={placa} onChange={e => setPlaca(e.target.value)} required /></div>
                </div>
                <div style={inputWrap}>
                  <label>TIPO DE USO</label>
                  <select value={uso} onChange={e => setUso(e.target.value)}>
                    <option value="Personal">Personal</option>
                    <option value="Uber / inDrive">Plataforma</option>
                    <option value="Renta Privada">Renta</option>
                  </select>
                </div>
                <button type="submit" style={submitBtn}>
                  {editandoId ? 'GUARDAR CAMBIOS' : 'CONFIRMAR REGISTRO'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* BARRA NAVEGACION INFERIOR */}
      <nav style={navBar}>
        {['Vehículos', 'Finanzas', 'Registros'].map(item => (
          <div key={item} onClick={() => setSeccion(item)} style={{
            ...navTab, 
            color: seccion === item ? '#fff' : '#444',
            borderTop: seccion === item ? '2px solid #fff' : '2px solid transparent'
          }}>
            {item === 'Vehículos' ? 'FLOTA' : item.toUpperCase()}
          </div>
        ))}
      </nav>
    </div>
  )
}

// --- ESTILOS (Gris Carbón + Blanco Eléctrico + Glassmorphism) ---

const appContainer = { backgroundColor: '#000', minHeight: '100vh', color: '#fff', fontFamily: 'Inter, system-ui, sans-serif' }
const headerStyle = { padding: '60px 20px 20px', textAlign: 'center' }
const logoBadge = { fontSize: '0.6rem', letterSpacing: '4px', color: '#666', marginBottom: '10px' }
const mainTitle = { fontSize: '2.2rem', fontWeight: '800', margin: 0, letterSpacing: '-1px' }

const mainContent = { padding: '0 20px 120px' }
const statsRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }
const statItem = { display: 'flex', flexDirection: 'column' }
const addBtn = { background: '#fff', color: '#000', border: 'none', padding: '12px 20px', borderRadius: '12px', fontWeight: '700', fontSize: '0.7rem', cursor: 'pointer' }

const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }
const glassCard = { background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '24px', backdropFilter: 'blur(10px)' }
const cardHeader = { display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }
const unitTag = { fontSize: '0.6rem', color: '#444', fontWeight: 'bold' }
const cardTitle = { fontSize: '1.4rem', margin: '0 0 15px 0' }
const cardFooter = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
const metaData = { color: '#666', fontSize: '0.8rem' }
const dot = { margin: '0 8px' }
const statusBadge = { background: 'rgba(255,255,255,0.05)', padding: '5px 12px', borderRadius: '8px', fontSize: '0.6rem', fontWeight: 'bold' }
const iconBtn = { background: 'none', border: 'none', color: '#444', fontSize: '1.1rem', cursor: 'pointer', transition: '0.3s' }

// ESTILOS MODAL
const modalOverlay = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(15px)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }
const modalContent = { width: '90%', maxWidth: '450px' }
const modalGlass = { background: '#111', border: '1px solid #222', borderRadius: '32px', padding: '30px', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }
const modalHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }
const closeModalBtn = { background: '#222', border: 'none', color: '#fff', width: '35px', height: '35px', borderRadius: '50%', cursor: 'pointer' }

const formLayout = { display: 'flex', flexDirection: 'column', gap: '20px' }
const inputRow = { display: 'flex', gap: '15px' }
const inputWrap = { display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }
const submitBtn = { marginTop: '10px', padding: '18px', borderRadius: '16px', border: 'none', backgroundColor: '#fff', color: '#000', fontWeight: 'bold', cursor: 'pointer' }

const navBar = { position: 'fixed', bottom: 0, left: 0, width: '100%', height: '80px', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(20px)', borderTop: '1px solid #111', display: 'flex', justifyContent: 'space-around', zIndex: 900 }
const navTab = { padding: '25px 0', fontSize: '0.65rem', fontWeight: '700', letterSpacing: '1px', cursor: 'pointer', flex: 1, textAlign: 'center' }

export default App