import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

function App() {
  const [autos, setAutos] = useState([])
  const [modelo, setModelo] = useState('')
  const [año, setAño] = useState('')

  // 1. CARGAR DATOS: Trae los autos de Supabase apenas abre la página
  useEffect(() => {
    fetchAutos()
  }, [])

  async function fetchAutos() {
    const { data, error } = await supabase
      .from('vehiculos')
      .select('*')
      .order('id', { ascending: false })
    
    if (data) setAutos(data)
    if (error) console.error("Error al cargar:", error.message)
  }

  // 2. AGREGAR: Guarda un nuevo auto en la base de datos
  async function agregarAuto(e) {
    e.preventDefault()
    const { error } = await supabase
      .from('vehiculos')
      .insert([{ modelo, año, estado: 'Disponible' }])
    
    if (!error) {
      setModelo('') // Limpia el cuadro de texto
      setAño('')    // Limpia el cuadro de texto
      fetchAutos()  // Actualiza la lista automáticamente
    } else {
      alert("Error al guardar: " + error.message)
    }
  }

  // 3. BORRAR: Elimina un auto por su ID
  async function borrarAuto(id) {
    const confirmar = confirm("¿Deseas eliminar este vehículo de Nexus?")
    if (confirmar) {
      const { error } = await supabase
        .from('vehiculos')
        .delete()
        .eq('id', id)

      if (!error) {
        fetchAutos() // Actualiza la lista
      } else {
        alert("Error al eliminar: " + error.message)
      }
    }
  }

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
      <header style={{ marginBottom: '30px', borderBottom: '2px solid #1a202c', paddingBottom: '10px' }}>
        <h1 style={{ color: '#1a202c', margin: 0 }}>NEXUS: Control de Flota</h1>
        <p style={{ color: '#666' }}>Sistema Interno de Gestión | El Salvador</p>
      </header>

      {/* FORMULARIO PARA REGISTRAR */}
      <form onSubmit={agregarAuto} style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '30px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <input 
          placeholder="Modelo (ej: Nissan Sentra)" 
          value={modelo} 
          onChange={e => setModelo(e.target.value)} 
          style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ddd', flex: 2, minWidth: '200px' }} 
          required 
        />
        <input 
          placeholder="Año" 
          type="number" 
          value={año} 
          onChange={e => setAño(e.target.value)} 
          style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ddd', flex: 1, minWidth: '100px' }} 
          required 
        />
        <button type="submit" style={{ padding: '12px 25px', backgroundColor: '#1a202c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
          + Registrar Auto
        </button>
      </form>

      {/* LISTADO DE VEHÍCULOS */}
      <div style={{ display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        {autos.length > 0 ? autos.map(auto => (
          <div key={auto.id} style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderLeft: '6px solid #1a202c', position: 'relative' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.4em' }}>{auto.modelo}</h3>
            <p style={{ margin: '0 0 15px 0', color: '#555' }}>Año: {auto.año}</p>
            <span style={{ backgroundColor: '#e2e8f0', padding: '5px 12px', borderRadius: '20px', fontSize: '0.85em', fontWeight: 'bold', color: '#1a202c' }}>
              {auto.estado}
            </span>

            {/* BOTÓN ELIMINAR */}
            <button 
              onClick={() => borrarAuto(auto.id)}
              style={{ 
                position: 'absolute', 
                top: '20px', 
                right: '20px', 
                backgroundColor: '#fee2e2', 
                color: '#dc2626', 
                border: 'none', 
                borderRadius: '6px', 
                padding: '8px 12px', 
                cursor: 'pointer', 
                fontSize: '0.8em',
                fontWeight: 'bold'
              }}
            >
              Eliminar
            </button>
          </div>
        )) : (
          <p style={{ textAlign: 'center', color: '#888', gridColumn: '1 / -1' }}>No hay vehículos en la base de datos de Nexus.</p>
        )}
      </div>
    </div>
  )
}

export default App
