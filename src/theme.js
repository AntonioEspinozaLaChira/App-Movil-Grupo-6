export const colors = {
  navy: '#1f2d3d',
  navyDark: '#16212e',
  blue: '#5b84b8',
  blueLight: '#e8eff8',
  bg: '#f3f4f7',
  card: '#ffffff',
  border: '#d9dde4',
  text: '#1f2d3d',
  muted: '#7a8594',
  danger: '#c0392b',
  success: '#2e8b57',
  warning: '#d68910',
};

export const statusMeta = {
  PENDING: { label: 'PENDIENTE', color: colors.muted, bg: '#eceef2' },
  IN_PROGRESS: { label: 'EN CURSO', color: colors.blue, bg: colors.blueLight },
  DONE: { label: 'HECHO', color: colors.success, bg: '#e3f3ea' },
};
