import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

function App() {
  const [seccion, setSeccion] = useState('Vehículos')
  const [autos, setAutos] = useState([])
  const [mostrarForm, setMostrarForm] = useState(false)
  const [editandoId, setEditandoId] = useState(null)

  // Estados Formulario
  const [marca, setMarca] = useState(''); const [modelo, setModelo] = useState('');
  const [año, setAño] = useState(''); const [placa, setPlaca] = useState('');
  const [uso, setUso] = useState('Personal');

  useEffect(() => { fetchAutos() }, [])

  async function fetchAutos() {
    const { data } = await supabase.from('vehiculos').select('*').order('id', { ascending: false })
    if (data) setAutos(data)
  }

  async function manejarEnvioAuto(e) {
    e.preventDefault()
    const datos = { marca, modelo, año, placa, uso }
    if (editandoId) {
      await supabase.from('vehiculos').update(datos).eq('id', editandoId)
      setEditandoId(null)
    } else {
      await supabase.from('vehiculos').insert([datos])
    }
    setMarca(''); setModelo(''); setAño(''); setPlaca(''); setMostrarForm(false)
    fetchAutos()
  }

  return (
    <div style={containerStyle}>
      <div style={contentWrapper}>
        
        <header style={headerStyle}>
          <h1 style={titleStyle}>NEXUS <span style={{fontWeight:'200', color:'#444'}}>SYSTEMS</span></h1>
          <p style={subtitleStyle}>MANAGEMENT PORTAL</p>
        </header>

        {seccion === 'Vehículos' && (
          <>
            {/* BOTÓN DESPLEGABLE */}
            <button 
              onClick={() => setMostrarForm(!mostrarForm)} 
              style={actionButtonStyle}
            >
              {mostrarForm ? '− CERRAR PANEL' : '+ REGISTRAR UNIDAD'}
            </button>

            {/* FORMULARIO DESPLEGABLE */}
            {mostrarForm && (
              <form onSubmit={manejarEnvioAuto} style={formStyle}>
                <div style={inputGroup}>
                  <input placeholder="MARCA" value={marca} onChange={e => setMarca(e.target.value)} style={minimalInput} required />
                  <input placeholder="MODELO" value={modelo} onChange={e => setModelo(e.target.value)} style={minimalInput} required />
                </div>
                <div style={inputGroup}>
                  <input placeholder="AÑO" type="number" value={año} onChange={e => setAño(e.target.value)} style={minimalInput} required />
                  <input placeholder="PLACA" value={placa} onChange={e => setPlaca(e.target.value)} style={minimalInput} required />
                </div>
                <select value={uso} onChange={e => setUso(e.target.value)} style={minimalSelect}>
                  <option value="Personal">PERSONAL</option>
                  <option value="Uber / inDrive">PLATAFORMA</option>
                  <option value="Renta Privada">RENTA</option>
                </select>
                <button type="submit" style={submitButtonStyle}>CONFIRMAR REGISTRO</button>
              </form>
            )}

            {/* LISTADO TIPO DOCUMENTO */}
            <div style={{marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '1px', backgroundColor: '#222', border: '1px solid #222'}}>
              {autos.map(auto => (
                <div key={auto.id} style={documentCard}>
                  <div style={docHeader}>
                    <span style={docId}>UNIT_ID: {auto.id.toString().padStart(3, '0')}</span>
                    <div style={{display:'flex', gap:'20px'}}>
                       <button onClick={() => {prepararEdicion(auto); setMostrarForm(true)}} style={docLink}>EDITAR</button>
                       <button onClick={() => borrarAuto(auto.id)} style={{...docLink, color:'#ff453a'}}>ELIMINAR</button>
                    </div>
                  </div>
                  
                  <div style={docBody}>
                    <div style={{flex: 2}}>
                      <h2 style={docTitle}>{auto.marca} {auto.modelo}</h2>
                      <p style={docMeta}>{auto.año} — SV_{auto.placa.toUpperCase()}</p>
                    </div>
                    <div style={{flex: 1, textAlign: 'right'}}>
                      <span style={docStatusBadge}>{auto.uso.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* NAVEGACIÓN MINIMALISTA */}
        <nav style={navStyle}>
          {['Vehículos', 'Finanzas', 'Registros'].map(item => (
            <div key={item} onClick={() => setSeccion(item)} style={{
              ...navItem, 
              opacity: seccion === item ? 1 : 0.3,
              borderTop: seccion === item ? '2px solid white' : '2px solid transparent'
            }}>
              {item === 'Vehículos' ? 'FLOTA' : item.toUpperCase()}
            </div>
          ))}
        </nav>
      </div>
    </div>
  )
}

// --- ESTILOS MINIMALISTAS (TIPO DOCUMENTO) ---

const containerStyle = { backgroundColor: '#050505', minHeight: '100vh', color: '#fff', fontFamily: 'monospace' }
const contentWrapper = { maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }
const headerStyle = { marginBottom: '60px' }
const titleStyle = { fontSize: '1rem', letterSpacing: '4px', margin: 0 }
const subtitleStyle = { fontSize: '0.5rem', color: '#444', letterSpacing: '2px' }

const actionButtonStyle = { width: '100%', padding: '15px', backgroundColor: 'transparent', color: '#fff', border: '1px dashed #333', cursor: 'pointer', fontSize: '0.7rem', letterSpacing: '2px', marginBottom: '20px' }

const formStyle = { display: 'flex', flexDirection: 'column', gap: '10px', animation: 'fadeIn 0.3s ease' }
const inputGroup = { display: 'flex', gap: '10px' }
const minimalInput = { flex: 1, background: '#111', border: 'none', padding: '15px', color: '#fff', fontSize: '0.7rem', outline: 'none' }
const minimalSelect = { ...minimalInput, appearance: 'none' }
const submitButtonStyle = { padding: '15px', backgroundColor: '#fff', color: '#000', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.7rem' }

// ESTILO FICHA TÉCNICA
const documentCard = { backgroundColor: '#000', padding: '25px', borderBottom: '1px solid #111' }
const docHeader = { display: 'flex', justifyContent: 'space-between', marginBottom: '15px', borderBottom: '1px solid #111', paddingBottom: '10px' }
const docId = { fontSize: '0.6rem', color: '#444' }
const docLink = { background: 'none', border: 'none', color: '#666', fontSize: '0.6rem', cursor: 'pointer', letterSpacing: '1px' }
const docBody = { display: 'flex', alignItems: 'center' }
const docTitle = { fontSize: '1.2rem', margin: 0, fontWeight: '400', letterSpacing: '-0.5px' }
const docMeta = { fontSize: '0.7rem', color: '#555', margin: '5px 0 0 0' }
const docStatusBadge = { fontSize: '0.5rem', border: '1px solid #333', padding: '4px 8px', letterSpacing: '1px', color: '#888' }

const navStyle = { position: 'fixed', bottom: 0, left: 0, width: '100%', display: 'flex', justifyContent: 'center', backgroundColor: '#000', borderTop: '1px solid #111' }
const navItem = { padding: '20px', fontSize: '0.6rem', letterSpacing: '2px', cursor: 'pointer', transition: '0.3s' }

export default App