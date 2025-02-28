import { useNavigate } from "react-router-dom";
import { FileText, BarChart, Calendar, ClipboardList, Table } from "lucide-react";

const reportTypes = [
  { id: "en-construccion", title: "Reporte de Avance", description: "Visualiza el progreso del proyecto basado en tareas completadas y hitos alcanzados.", icon: <BarChart size={40} /> },
  { id: "ReporteCostos", title: "Reporte de Costos", description: "Detalle de los costos acumulados, presupuestados y desviaciones.", icon: <FileText size={40} /> },
  { id: "en-construccion", title: "Reporte de Cumplimiento de Fechas", description: "Analiza si el proyecto está siguiendo el cronograma establecido.", icon: <Calendar size={40} /> },
  { id: "en-construccion", title: "Reporte General del Proyecto", description: "Resumen completo del proyecto incluyendo costos, avance y cumplimiento de plazos.", icon: <ClipboardList size={40} /> },
  { id: "en-construccion", title: "Diagrama de Gantt", description: "Exporta un cronograma de tareas y plazos en formato Excel.", icon: <Table size={40} /> },
];

function Reportes() {
  const navigate = useNavigate();

  return (
    <div className="container mt-4">
      <h1 className="mb-3">Generación de Reportes de Proyecto</h1>
      <p className="text-muted">Seleccione el tipo de reporte que desea generar. Puede exportarlos en PDF o Excel.</p>
      
      {/* Cards de reportes */}
      <div className="row">
        {reportTypes.map((report) => (
          <div key={report.id} className="col-md-4 mb-4">
            <div className="card shadow-sm text-center p-3" onClick={() => navigate(`/${report.id}`)} style={{ cursor: "pointer" }}>
              <div className="card-body">
                <div className="mb-3">{report.icon}</div>
                <h5 className="card-title">{report.title}</h5>
                <p className="card-text text-muted">{report.description}</p>
                <button className="btn btn-primary mt-2">Generar Reporte</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Reportes;
