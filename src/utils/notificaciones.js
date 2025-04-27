const Notification = require('../models/notification');
const Project = require('../models/projects');
const Task = require('../models/tasks');

const generarNotificacionesRetraso = async () => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // 1. Proyectos retrasados
    const proyectos = await Project.find({ status: 'Pendiente' });

    for (const proyecto of proyectos) {
        if (proyecto.fechaInicio && proyecto.fechaInicio < hoy) {
            const yaExiste = await Notification.exists({
                tipo: 'Project',
                referenciaId: proyecto._id,
                mensaje: { $regex: /no ha sido iniciado/i },
                leida: false
            });
    
            if (!yaExiste) {
                await Notification.create({
                    tipo: 'Project',
                    referenciaId: proyecto._id,
                    mensaje: `El proyecto "${proyecto.nombreProyecto}" no ha sido iniciado en la fecha prevista.`,
                    usuarioAsignado: proyecto.encargado || null
                });
            }
        }
    }
    
    // 2. Tareas retrasadas
    const tareas = await Task.find({ status: 'Pendiente' }).populate('project');

    for (const tarea of tareas) {
        const proyecto = tarea.project;
    
        if (
            !proyecto || // seguridad
            ['Suspendido', 'Cancelado'].includes(proyecto.status)
        ) {
            continue; // ignorar tareas de proyectos inválidos
        }
    
        if (tarea.startDate && tarea.startDate < hoy) {
            const yaExiste = await Notification.exists({
                tipo: 'Task',
                referenciaId: tarea._id,
                mensaje: { $regex: /no fue iniciada/i },
                leida: false
            });
    
            if (!yaExiste) {
                await Notification.create({
                    tipo: 'Task',
                    referenciaId: tarea._id,
                    mensaje: `La tarea "${tarea.title}" del proyecto "${proyecto.nombreProyecto}" no fue iniciada a tiempo.`,
                    usuarioAsignado: proyecto.encargado || null
                });
            }
        }
    }

    // 3. PROYECTOS - Finalización tardía (estado: En Proceso)
    const proyectosEnProceso = await Project.find({ status: 'En Proceso' });

    for (const proyecto of proyectosEnProceso) {
        if (
            proyecto.fechaFin &&
            proyecto.fechaFin < hoy
        ) {
            const yaExiste = await Notification.exists({
                tipo: 'Project',
                referenciaId: proyecto._id,
                mensaje: { $regex: /no ha sido finalizado/i },
                leida: false
            });

            if (!yaExiste) {
                await Notification.create({
                    tipo: 'Project',
                    referenciaId: proyecto._id,
                    mensaje: `El proyecto "${proyecto.nombreProyecto}" no ha sido finalizado en la fecha prevista.`,
                    usuarioAsignado: proyecto.encargado || null
                });
            }
        }
    }

    // 4. TAREAS - Finalización tardía (estado: En Proceso)
    const tareasEnProceso = await Task.find({ status: 'En Proceso' }).populate('project');

    for (const tarea of tareasEnProceso) {
        const proyecto = tarea.project;

        if (
            !proyecto ||
            ['Suspendido', 'Cancelado'].includes(proyecto.status)
        ) {
            continue;
        }

        if (tarea.endDate && tarea.endDate < hoy) {
            const yaExiste = await Notification.exists({
                tipo: 'Task',
                referenciaId: tarea._id,
                mensaje: { $regex: /no fue finalizada/i },
                leida: false
            });

            if (!yaExiste) {
                await Notification.create({
                    tipo: 'Task',
                    referenciaId: tarea._id,
                    mensaje: `La tarea "${tarea.title}" del proyecto "${proyecto.nombreProyecto}" no fue finalizada en la fecha prevista.`,
                    usuarioAsignado: proyecto.encargado || null
                });
            }
        }
    }

    console.log('Verificación de notificaciones completada.');
};
module.exports = generarNotificacionesRetraso;
