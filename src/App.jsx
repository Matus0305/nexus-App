import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

function App() {
  // --- ESTADOS DE CONTROL ---
  const [seccion, setSeccion] = useState('Vehículos')
  const [autos, setAutos] = useState([])
  const [mostrarModal, setMostrarModal] = useState(false)
  const [editandoId, setEditandoId] = useState(null)

  // --- ESTADOS FORMULARIO ---
  const [marca, setMarca] = useState('')
  const [modelo, setModelo] = useState('')
  const [año, setAño] = useState('')
  const [placa, setPlaca] = useState('')
  const [uso, setUso] = useState('Personal')
  const [salud, setSalud] = useState('Operativo')
  const [frecuencia, setFrecuencia] = useState(3000);

  // --- CARGA DE DATOS ---
  useEffect(() => {
    fetchAutos()
  }, [])

  async function fetchAutos() {
    try {
      const { data, error } = await supabase
        .from('vehiculos')
        .select('*')
        .order('id', { ascending: false })
      if (error) throw error
      if (data) setAutos(data)
    } catch (err) {
      console.error("Error cargando autos:", err.message)
    }
  }

  // --- FUNCIONES DE ACCIÓN ---
  async function manejarEnvio(e) {
    e.preventDefault()
    const datos = { marca, modelo, año: parseInt(año), placa, uso, salud, frecuencia_mantenimiento: parseInt(frecuencia)      
    }
    
    try {
      if (editandoId) {
        await supabase.from('vehiculos').update(datos).eq('id', editandoId)
      } else {
        await supabase.from('vehiculos').insert([datos])
      }
      cerrarYLimpiar()
      fetchAutos()
    } catch (err) {
      alert("Error en la operación")
    }
  }

  function prepararEdicion(auto) {
    setEditandoId(auto.id)
    setMarca(auto.marca || '')
    setModelo(auto.modelo || '')
    setAño(auto.año || '')
    setPlaca(auto.placa || '')
    setUso(auto.uso || 'Personal')
    setSalud(auto.salud|| 'Operativo');
    setMostrarModal(true);
  }

  async function borrarAuto(id) {
    if (window.confirm("¿Dar de baja esta unidad?")) {
      await supabase.from('vehiculos').delete().eq('id', id)
      fetchAutos()
    }
  }

  function cerrarYLimpiar() {
    setMostrarModal(false)
    setEditandoId(null)
    setMarca(''); setModelo(''); setAño(''); setPlaca(''); setUso('Personal'); setSalud('Operativo');
  }
    
//// --- FUNCIONES DE APOYO ---
  const obtenerColor = (estado) => {
    if (estado === 'Taller') return '#ff453a';
    if (estado === 'Preventivo') return '#ffd60a';
    return '#32d74b';
  };

  async function resetearMantenimiento(auto) {
    if (confirm(`¿Confirmas cambio de aceite para el ${auto.marca}? Se reiniciará el conteo.`)) {
      const { error } = await supabase
        .from('vehiculos')
        .update({ km_ultimo_mant: auto.km_actual })
        .eq('id', auto.id);
      
      if (!error) {
        alert("✅ Servicio registrado. Barra reiniciada.");
        fetchAutos();
      }
    }
  }

  // --- INICIO DEL RENDER ---
  return (
    <div style={styles.appContainer}>
      {/* HEADER */}
      <header style={styles.header}>
        <div style={styles.logoBadge}>NEXUS APP</div>
        <h1 style={styles.mainTitle}>Gestión de Flota</h1>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main style={styles.main}>
        {seccion === 'Vehículos' && (
          <>
            <div style={styles.statsRow}>
              <div style={styles.statItem}>
                <span style={styles.statNum}>{autos.length}</span>
                <label style={styles.statLabel}>UNIDADES</label>
              </div>
              <button onClick={() => setMostrarModal(true)} style={styles.addBtn}>
                + NUEVA UNIDAD
              </button>
            </div>
           {/* LISTADO DE AUTOS */}
<div style={styles.grid}>           
  {autos.map(auto => {
    // --- LÓGICA DINÁMICA DENTRO DEL MAP ---
    const millasRecorridas = (auto.km_actual || 0) - (auto.km_ultimo_mant || 0);
    const meta = auto.frecuencia_mantenimiento || 3000;
    const progresoVida = Math.max(0, ((meta - millasRecorridas) / meta) * 100);

    let estadoAuto = 'Operativo';
    if (millasRecorridas >= meta) estadoAuto = 'Taller';
    else if (millasRecorridas >= meta * 0.9) estadoAuto = 'Preventivo';

    const colorEstado = obtenerColor(estadoAuto);

    // --- RETORNO VISUAL ---
    return (
      <div key={auto.id} style={styles.glassCard}>
        <div style={styles.cardHeader}>
          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <div style={{
              width: '10px', 
              height: '10px', 
              borderRadius: '50%', 
              backgroundColor: colorEstado, 
              boxShadow: `0 0 12px ${colorEstado}`,
              transition: 'all 0.3s ease'
            }}></div>
            <span style={styles.unitTag}>UNIT-{auto.id}</span>
          </div>
          <div style={styles.cardActions}>
            <button onClick={() => prepararEdicion(auto)} style={styles.iconBtn}>✎</button>
            <button onClick={() => resetearMantenimiento(auto)} style={{...styles.iconBtn, color: '#32d74b', fontSize: '0.7rem', border: '1px solid #32d74b', padding: '4px 8px', borderRadius: '6px'}}>
              RESET MI
            </button>
            <button onClick={() => borrarAuto(auto.id)} style={{...styles.iconBtn, color: '#ff453a'}}>✕</button>
          </div>
        </div>
        
        <h2 style={styles.cardTitle}>{auto.marca} <span style={{fontWeight: 300}}>{auto.modelo}</span></h2>
        
        {/* BARRA DE PROGRESO */}
        <div style={{height: '4px', background: '#111', borderRadius: '10px', marginTop: '15px', overflow: 'hidden'}}>
          <div style={{height: '100%', width: `${progresoVida}%`, backgroundColor: colorEstado, transition: 'width 1s ease'}}></div>
        </div>

        <div style={styles.cardFooter}>
          <div style={styles.metaData}>
            {auto.año} | {auto.placa?.toUpperCase()}
          </div>
          <div style={{...styles.statusBadge, color: colorEstado}}>{estadoAuto.toUpperCase()}</div>
        </div>
      </div>
    );
  })} 
</div> 
</>   
)}
      </main>

      {/* MODAL GLASSMORPHISM */}
      {mostrarModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalGlass}>
            <div style={styles.modalHeader}>
              <h3 style={{margin:0, fontSize:'0.9rem', letterSpacing:'1px'}}>
                {editandoId ? 'EDITAR REGISTRO' : 'REGISTRO TÉCNICO'}
              </h3>
              <button onClick={cerrarYLimpiar} style={styles.closeBtn}>✕</button>
            </div>
            
            <form onSubmit={manejarEnvio} style={styles.form}>
              <div style={styles.inputRow}>
                <div style={styles.inputWrap}><label style={styles.label}>MARCA</label>
                  <input style={styles.input} value={marca} onChange={e => setMarca(e.target.value)} required />
                </div>
                <div style={styles.inputWrap}><label style={styles.label}>MODELO</label>
                  <input style={styles.input} value={modelo} onChange={e => setModelo(e.target.value)} required />
                </div>
              </div>
              <div style={styles.inputRow}>
                <div style={styles.inputWrap}><label style={styles.label}>AÑO</label>
                  <input style={styles.input} type="number" value={año} onChange={e => setAño(e.target.value)} required />
                </div>
                <div style={styles.inputWrap}><label style={styles.label}>PLACA</label>
                  <input style={styles.input} value={placa} onChange={e => setPlaca(e.target.value)} required />
                </div>
              </div>
              <div style={styles.inputWrap}>
                <label style={styles.label}>TIPO DE USO</label>
                <select style={styles.input} value={uso} onChange={e => setUso(e.target.value)}>
                  <option value="Personal">Personal</option>
                  <option value="Uber / inDrive">Plataforma</option>
                  <option value="Renta Privada">Renta</option>
                </select>
              </div>
              <div style={styles.inputWrap}>
                <label style={styles.label}>ESTADO MECÁNICO</label>
                <select style={styles.input} value={salud} onChange={e => setSalud(e.target.value)}>
                <option value="Operativo">OPERATIVO</option>
                <option value="Preventivo">MANTENIMIENTO PRÓXIMO</option>
                <option value="Taller">EN REPARACIÓN</option>
                </select>
              </div>
              <div style={styles.inputWrap}>
               <label style={styles.label}>META DE MANTENIMIENTO (MILLAS)</label>
              <input 
               style={styles.input} 
               type="number" 
               value={frecuencia} 
               onChange={e => setFrecuencia(e.target.value)} 
               placeholder="Ej. 3000 o 5000"
               required 
                 />
                </div>
              <button type="submit" style={styles.submitBtn}>
                {editandoId ? 'GUARDAR CAMBIOS' : 'CONFIRMAR REGISTRO'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* NAV INFERIOR */}
      <nav style={styles.navBar}>
        {['Vehículos', 'Finanzas', 'Registros'].map(item => (
          <div key={item} onClick={() => setSeccion(item)} style={{
            ...styles.navTab, 
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

// --- OBJETO DE ESTILOS (Gris Carbón & Blanco Eléctrico) ---
const styles = {
  appContainer: { backgroundColor: '#000', minHeight: '100vh', color: '#fff', fontFamily: "'Inter', sans-serif", WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale',},
  header: { padding: '60px 20px 20px', textAlign: 'center' },
  logoBadge: { fontSize: '0.6rem', letterSpacing: '4px', color: '#444', marginBottom: '10px', fontWeight: 'bold' },
  mainTitle: { fontSize: '2.2rem', fontWeight: '800', margin: 0, letterSpacing: '-1px' },
  main: { padding: '0 20px 120px', maxWidth: '800px', margin: '0 auto' },
  statsRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  statItem: { display: 'flex', flexDirection: 'column' },
  statNum: { fontSize: '1.5rem', fontWeight: '800' },
  statLabel: { fontSize: '0.6rem', color: '#444', letterSpacing: '1px' },
  addBtn: { background: '#fff', color: '#000', border: 'none', padding: '12px 20px', borderRadius: '12px', fontWeight: '800', fontSize: '0.7rem', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
  glassCard: { background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '24px', backdropFilter: 'blur(10px)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '15px' },
  unitTag: { fontSize: '0.6rem', color: '#333', fontWeight: 'bold' },
  cardTitle: { fontSize: '1.4rem', margin: '0 0 15px 0', color: '#fff' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  metaData: { color: '#666', fontSize: '0.8rem', fontWeight: '500' },
  statusBadge: { background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '10px', fontSize: '0.6rem', fontWeight: 'bold', color: '#888' },
  iconBtn: { background: 'none', border: 'none', color: '#444', fontSize: '1.1rem', cursor: 'pointer', padding: '5px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' },
  modalGlass: { background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '32px', padding: '30px', width: '100%', maxWidth: '400px', boxSizing: 'border-box' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  closeBtn: { background: '#1a1a1a', border: 'none', color: '#fff', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', alignItems: 'stretch' },
  inputRow: { display: 'flex', gap: '15px', width: '100%'},
  inputWrap: { display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: 0 },
  label: { fontSize: '0.6rem', color: '#444', fontWeight: 'bold', marginLeft: '5px' },
  input: { background: '#111', border: '1px solid #1a1a1a', padding: '15px', borderRadius: '14px', color: '#fff', fontSize: '0.9rem', outline: 'none', width: '100%', boxSizing: 'border-box' },
  submitBtn: { marginTop: '10px', padding: '18px', borderRadius: '16px', border: 'none', backgroundColor: '#fff', color: '#000', fontWeight: 'bold', cursor: 'pointer' },
  navBar: { position: 'fixed', bottom: 0, left: 0, width: '100%', height: '85px', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(25px)', borderTop: '1px solid #111', display: 'flex', justifyContent: 'space-around', zIndex: 900 },
  navTab: { display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: '800', letterSpacing: '1px', cursor: 'pointer', flex: 1 }
}

export default App