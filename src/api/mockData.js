// Datos en memoria que simulan la API REST corporativa de WebStrategy S.A.C.
export const users = [
  { id: 1, name: 'Ana Rojas', email: 'ana.rojas@webstrategy.pe', password: '123456', role: 'LEADER', phone: '987654321', photo: null, notifications: true },
  { id: 2, name: 'Luis Paredes', email: 'luis.paredes@webstrategy.pe', password: '123456', role: 'MEMBER', phone: '999111222', photo: null, notifications: true },
  { id: 3, name: 'Carla Meza', email: 'carla.meza@webstrategy.pe', password: '123456', role: 'MEMBER', phone: '999333444', photo: null, notifications: true },
];

export const projects = [
  { id: 1, code: 'WS-114', name: 'Portal Corporativo Andesa', client: 'Andesa Retail', status: 'IN_PROGRESS', progress: 68, start: '2026-09-04', end: '2026-09-30', leaderId: 1, members: [1, 2, 3], description: 'Rediseño e implementación del portal corporativo con CMS headless. Integración al ERP y despliegue en la nube del cliente.' },
  { id: 2, code: 'WS-121', name: 'Rediseño E-commerce Vitral', client: 'Vitral Home', status: 'IN_PROGRESS', progress: 34, start: '2026-09-10', end: '2026-10-20', leaderId: 1, members: [1, 3], description: 'Nueva experiencia de compra responsive con checkout simplificado.' },
  { id: 3, code: 'WS-098', name: 'Intranet WebStrategy', client: 'Interno', status: 'DONE', progress: 91, start: '2026-08-01', end: '2026-09-15', leaderId: 1, members: [1, 2], description: 'Intranet corporativa para el equipo de WebStrategy.' },
];

export const tasks = [
  { id: 1, code: 'WS-114-07', projectId: 1, title: 'Maquetar landing de campaña', status: 'IN_PROGRESS', assigneeId: 1, due: '2026-09-12', priority: 'Alta', hours: 8, description: 'Landing responsive para la campaña de setiembre, con módulos reutilizables y medición de eventos.' },
  { id: 2, code: 'WS-114-08', projectId: 1, title: 'Integrar API de pagos', status: 'PENDING', assigneeId: 2, due: '2026-09-18', priority: 'Alta', hours: 16, description: 'Integración con pasarela de pagos del cliente.' },
  { id: 3, code: 'WS-114-09', projectId: 1, title: 'QA responsive iOS / Android', status: 'PENDING', assigneeId: 3, due: '2026-09-19', priority: 'Media', hours: 6, description: 'Matriz de pruebas en dispositivos.' },
  { id: 4, code: 'WS-114-10', projectId: 1, title: 'Migrar assets al CDN', status: 'DONE', assigneeId: 2, due: '2026-09-05', priority: 'Baja', hours: 4, description: 'Subida y versionado de recursos estáticos.' },
  { id: 5, code: 'WS-114-02', projectId: 1, title: 'Definir esquema de tokens JWT', status: 'DONE', assigneeId: 1, due: '2026-09-02', priority: 'Alta', hours: 5, description: 'Esquema de autenticación del portal.' },
  { id: 6, code: 'WS-121-01', projectId: 2, title: 'Prototipo del checkout', status: 'IN_PROGRESS', assigneeId: 3, due: '2026-10-02', priority: 'Alta', hours: 12, description: 'Prototipo de alta fidelidad del flujo de pago.' },
  { id: 7, code: 'WS-121-02', projectId: 2, title: 'Catálogo con filtros', status: 'PENDING', assigneeId: 1, due: '2026-10-08', priority: 'Media', hours: 10, description: 'Listado de productos con filtros.' },
  { id: 8, code: 'WS-098-05', projectId: 3, title: 'Cierre y documentación', status: 'PENDING', assigneeId: 1, due: '2026-09-15', priority: 'Baja', hours: 3, description: 'Documentación final de la intranet.' },
];

export const messages = [
  { id: 1, projectId: 1, userId: 2, text: 'Subí la rama con la integración de pagos, falta el manejo de reintentos.', at: '2026-09-10T09:14:00' },
  { id: 2, projectId: 1, userId: 1, text: 'Perfecto. Reviso hoy y te dejo comentarios en la tarea WS-114-08.', at: '2026-09-10T09:31:00' },
  { id: 3, projectId: 1, userId: 3, text: 'Ojo que en Android el formulario se corta con el teclado abierto.', at: '2026-09-10T10:02:00' },
  { id: 4, projectId: 2, userId: 3, text: 'Compartí el prototipo del checkout en el repositorio.', at: '2026-09-11T11:00:00' },
];

export const notifications = [
  { id: 1, text: 'Luis Paredes cambió «Integrar API de pagos» a IN_PROGRESS.', ref: 'PORTAL CORPORATIVO ANDESA', ago: 'hace 12 min', unread: true },
  { id: 2, text: 'Nuevo mensaje en la sala de Rediseño E-commerce Vitral.', ref: 'CHAT', ago: 'hace 40 min', unread: true },
  { id: 3, text: 'Se te asignó la tarea «Catálogo con filtros».', ref: 'REDISEÑO E-COMMERCE VITRAL', ago: 'hoy 08:20', unread: true },
  { id: 4, text: 'Intranet WebStrategy pasó a etapa de CIERRE.', ref: 'INTRANET', ago: 'ayer', unread: false },
];
