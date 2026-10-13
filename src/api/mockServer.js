import { users, projects, tasks, messages, notifications } from './mockData';
import { emitMock } from './socket';

const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms));
const fail = (status, message) => Object.assign(new Error(message), { status });
const publicUser = ({ password, ...u }) => u;
const tokens = new Map(); // token -> userId
let nextId = { project: 100, task: 100, message: 100 };

function auth(token) {
  const id = tokens.get(token);
  const user = users.find((u) => u.id === id);
  if (!user) throw fail(401, 'Sesión expirada');
  return user;
}

const memberProjects = (user) =>
  user.role === 'LEADER' ? projects : projects.filter((p) => p.members.includes(user.id));

function withDetails(p) {
  const pt = tasks.filter((t) => t.projectId === p.id);
  return {
    ...p,
    openTasks: pt.filter((t) => t.status !== 'DONE').length,
    team: p.members.map((id) => publicUser(users.find((u) => u.id === id))),
  };
}

// Enrutador: método + ruta -> respuesta JSON, igual que la API REST real.
export async function mockRequest(method, path, body, token) {
  await delay();
  let m;

  if (method === 'POST' && path === '/auth/login') {
    const u = users.find((x) => x.email.toLowerCase() === body.email.trim().toLowerCase());
    if (!u || u.password !== body.password) throw fail(401, 'Correo o contraseña incorrectos');
    const t = `jwt.${u.id}.${Date.now()}`;
    tokens.set(t, u.id);
    return { token: t, user: publicUser(u) };
  }
  if (method === 'POST' && path === '/auth/register') {
    if (users.some((x) => x.email.toLowerCase() === body.email.toLowerCase()))
      throw fail(409, 'Ese correo ya está registrado');
    const u = { id: users.length + 1, name: body.name, email: body.email, password: body.password, role: body.role || 'MEMBER', phone: '', photo: null, notifications: true };
    users.push(u);
    const t = `jwt.${u.id}.${Date.now()}`;
    tokens.set(t, u.id);
    return { token: t, user: publicUser(u) };
  }
  if (method === 'POST' && path === '/auth/forgot-password') {
    // El backend real enviaría un correo con un enlace de restauración.
    return { ok: true };
  }
  if (method === 'GET' && path === '/auth/validate') {
    return { user: publicUser(auth(token)) };
  }

  const user = auth(token);

  if (method === 'POST' && path === '/auth/change-password') {
    if (user.password !== body.currentPassword) throw fail(400, 'La contraseña actual no coincide');
    user.password = body.newPassword;
    return { ok: true };
  }
  if (method === 'GET' && path === '/me') return publicUser(user);
  if (method === 'PUT' && path === '/me') {
    Object.assign(user, { name: body.name ?? user.name, phone: body.phone ?? user.phone, photo: body.photo ?? user.photo, notifications: body.notifications ?? user.notifications });
    return publicUser(user);
  }
  if (method === 'GET' && path === '/dashboard/metrics') {
    const mine = memberProjects(user).map((p) => p.id);
    const my = tasks.filter((t) => mine.includes(t.projectId));
    return {
      projects: mine.length,
      pending: my.filter((t) => t.status !== 'DONE').length,
      inProgress: my.filter((t) => t.status === 'IN_PROGRESS').length,
      done: my.filter((t) => t.status === 'DONE').length,
      pendingOnly: my.filter((t) => t.status === 'PENDING').length,
    };
  }
  if (method === 'GET' && path === '/projects') return memberProjects(user).map(withDetails);
  if (method === 'POST' && path === '/projects') {
    if (user.role !== 'LEADER') throw fail(403, 'No tienes permisos para crear proyectos');
    const p = { id: ++nextId.project, code: `WS-${nextId.project}`, name: body.name, client: body.client || 'Interno', status: 'PENDING', progress: 0, start: new Date().toISOString().slice(0, 10), end: body.end || '', leaderId: user.id, members: [user.id], description: body.description || '' };
    projects.unshift(p);
    return withDetails(p);
  }
  if ((m = path.match(/^\/projects\/(\d+)$/)) && method === 'GET') {
    const p = projects.find((x) => x.id === +m[1]);
    if (!p) throw fail(404, 'Proyecto no encontrado');
    return withDetails(p);
  }
  if ((m = path.match(/^\/projects\/(\d+)\/tasks$/)) && method === 'GET') {
    return tasks.filter((t) => t.projectId === +m[1]).map((t) => ({ ...t, assignee: publicUser(users.find((u) => u.id === t.assigneeId)) }));
  }
  if ((m = path.match(/^\/tasks\/(\d+)$/)) && method === 'GET') {
    const t = tasks.find((x) => x.id === +m[1]);
    if (!t) throw fail(404, 'Tarea no encontrada');
    return { ...t, assignee: publicUser(users.find((u) => u.id === t.assigneeId)), project: projects.find((p) => p.id === t.projectId) };
  }
  if ((m = path.match(/^\/tasks\/(\d+)\/status$/)) && method === 'PATCH') {
    const t = tasks.find((x) => x.id === +m[1]);
    if (!t) throw fail(404, 'Tarea no encontrada');
    t.status = body.status;
    const pt = tasks.filter((x) => x.projectId === t.projectId);
    const p = projects.find((x) => x.id === t.projectId);
    p.progress = Math.round((pt.filter((x) => x.status === 'DONE').length / pt.length) * 100);
    return t;
  }
  if ((m = path.match(/^\/projects\/(\d+)\/messages$/))) {
    const projectId = +m[1];
    if (method === 'GET') {
      return messages.filter((x) => x.projectId === projectId).map((x) => ({ ...x, user: publicUser(users.find((u) => u.id === x.userId)) }));
    }
    if (method === 'POST') {
      const msg = { id: ++nextId.message, projectId, userId: user.id, text: body.text, at: new Date().toISOString() };
      messages.push(msg);
      const full = { ...msg, user: publicUser(user) };
      // Simula la respuesta de un compañero llegando por el socket.
      setTimeout(() => {
        const other = users.find((u) => u.id !== user.id && projects.find((p) => p.id === projectId)?.members.includes(u.id));
        if (!other) return;
        const reply = { id: ++nextId.message, projectId, userId: other.id, text: 'Recibido, lo reviso ahora.', at: new Date().toISOString() };
        messages.push(reply);
        emitMock(projectId, { ...reply, user: publicUser(other) });
      }, 2200);
      return full;
    }
  }
  if (method === 'GET' && path === '/notifications') return notifications;

  throw fail(404, `Ruta no encontrada: ${method} ${path}`);
}
