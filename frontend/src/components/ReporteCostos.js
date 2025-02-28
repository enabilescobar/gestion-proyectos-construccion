import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

function ReporteCostos() {
  const [tipoReporte, setTipoReporte] = useState("proyecto");
  const [proyectos, setProyectos] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [gastos, setGastos] = useState([]);
  const [nombreProyecto, setNombreProyecto] = useState("No especificado");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("❌ No hay token disponible. El usuario no está autenticado.");
      return;
    }

    axios.get("http://localhost:5000/api/projects", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        setProyectos(response.data);
      })
      .catch((error) => console.error("❌ Error al obtener proyectos:", error.response ? error.response.data : error));
  }, []);

  const fetchGastos = async () => {
    try {
      setCargando(true);
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("❌ No hay token disponible. El usuario no está autenticado.");
        return;
      }
  
      let response;
      let presupuestoTemp = 0; // Inicializar el presupuesto
  
      if (tipoReporte === "proyecto" && selectedProject) {
        response = await axios.get(`http://localhost:5000/api/gastos/project/${selectedProject}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        // Obtener el presupuesto del proyecto desde la API
        const projectResponse = await axios.get(`http://localhost:5000/api/projects/${selectedProject}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        presupuestoTemp = projectResponse.data.presupuesto ?? 0; // Asignar presupuesto correctamente
  
      } else if (tipoReporte === "fecha" && fechaInicio && fechaFin) {
        response = await axios.get(`http://localhost:5000/api/gastos?start=${fechaInicio}&end=${fechaFin}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        presupuestoTemp = 0; // No hay presupuesto en reportes por rango de fechas
      }
  
      if (response && response.data) {
        setGastos(response.data);
        abrirNuevaVentana(response.data, nombreProyecto, presupuestoTemp); // Pasar presupuesto correctamente
      } else {
        console.warn("⚠️ No se recibieron datos de gastos.");
      }
    } catch (error) {
      console.error("❌ Error al obtener gastos:", error.response ? error.response.data : error);
    } finally {
      setCargando(false);
    }
  };
    
  const abrirNuevaVentana = (datos, nombreProyecto, presupuesto) => {
    if (presupuesto === undefined || presupuesto === null) {
      presupuesto = 0; // Si por alguna razón el presupuesto es undefined, aseguramos que tenga un valor válido
    }
    
    const nuevaVentana = window.open("", "_blank");
    if (!nuevaVentana) return;
  
    const totalGastos = datos.reduce((sum, gasto) => sum + gasto.amount, 0);
    const diferencia = presupuesto - totalGastos;
    const estaDentroPresupuesto = diferencia >= 0;
  
    // Verificar en consola que el presupuesto es correcto antes de mostrarlo
    console.log("📌 Presupuesto recibido en abrirNuevaVentana:", presupuesto);
  
    nuevaVentana.document.open();
    nuevaVentana.document.write(`
      <html>
      <head>
        <title>Reporte de Costos</title>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.4.0/jspdf.umd.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.18/jspdf.plugin.autotable.min.js"></script>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4; }
          .container { max-width: 900px; margin: auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0px 0px 10px rgba(0,0,0,0.1); }
          h1 { text-align: center; color: #333; }
          .budget-summary { margin-top: 20px; padding: 10px; text-align: center; border-radius: 5px; font-size: 16px; }
          .budget-ok { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
          .budget-over { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #007bff; color: white; }
          .button-container { text-align: center; margin-top: 20px; }
          button { padding: 10px; background-color: #28a745; color: white; border: none; cursor: pointer; border-radius: 5px; }
          button:hover { background-color: #218838; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Reporte de Costos</h1>
          <p class="info"><strong>Proyecto:</strong> ${nombreProyecto}</p>
  
          <table>
            <thead>
              <tr>
                <th>Descripción</th>
                <th>Categoría</th>
                <th>Fecha</th>
                <th>Realizado por</th>
                <th>Monto (Lps.)</th>
              </tr>
            </thead>
            <tbody>
              ${datos.map(gasto => `
                <tr>
                  <td>${gasto.description}</td>
                  <td>${gasto.category}</td>
                  <td>${new Date(gasto.date).toLocaleDateString()}</td>
                  <td>${gasto.doneBy}</td>
                  <td>Lps. ${gasto.amount.toLocaleString()}</td>
                </tr>
              `).join("")}
              <tr style="font-weight: bold; background-color: #e9ecef;">
                <td colspan="4" style="text-align: right;">Total Gastos:</td>
                <td>Lps. ${totalGastos.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
  
          <div class="budget-summary ${estaDentroPresupuesto ? "budget-ok" : "budget-over"}">
            <p><strong>Presupuesto:</strong> Lps. ${presupuesto.toLocaleString()}</p>
            <p><strong>Total Gastos:</strong> Lps. ${totalGastos.toLocaleString()}</p>
            <p><strong>${estaDentroPresupuesto ? "Saldo Disponible:" : "Excedente:"}</strong> Lps. ${Math.abs(diferencia).toLocaleString()}</p>
          </div>
  
          <div class="button-container">
            <button onclick="descargarPDF()">Descargar PDF</button>
          </div>
          
          <script>
            function descargarPDF() {
              const doc = new window.jspdf.jsPDF();
              doc.text("Reporte de Costos", 20, 10);
              window.jspdf.autoTable(doc, {
                head: [["Descripción", "Categoría", "Fecha", "Realizado por", "Monto (Lps.)"]],
                body: ${JSON.stringify(datos.map(gasto => [
                  gasto.description,
                  gasto.category,
                  new Date(gasto.date).toLocaleDateString(),
                  gasto.doneBy,
                  "Lps. " + gasto.amount.toLocaleString()
                ]))}
              });
              doc.save("Reporte_Costos.pdf");
            }
          </script>
        </div>
      </body>
      </html>
    `);
    nuevaVentana.document.close();
  };
        
  return (
    <div className="container mt-4">
      <h1 className="mb-3">Reporte de Costos</h1>
      <p className="text-muted">Seleccione el tipo de reporte y los criterios de búsqueda.</p>

      <select className="form-select" value={tipoReporte} onChange={(e) => setTipoReporte(e.target.value)}>
        <option value="proyecto">Por Proyecto</option>
        <option value="fecha">Por Rango de Fechas</option>
      </select>

      {tipoReporte === "proyecto" ? (
        <select className="form-select mt-3" value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}>
          <option value="">Seleccione un Proyecto</option>
          {proyectos.map((proyecto) => (
            <option key={proyecto._id} value={proyecto._id}>{proyecto.nombreProyecto}</option>
          ))}
        </select>
      ) : (
        <>
          <input type="date" className="form-control mt-3" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
          <input type="date" className="form-control mt-2" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
        </>
      )}

      <button className="btn btn-primary mt-3" onClick={fetchGastos}>Generar Reporte</button>
    </div>
  );
}

export default ReporteCostos;
