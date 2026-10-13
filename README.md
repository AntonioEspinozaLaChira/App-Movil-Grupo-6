# WebStrategy Proyectos (Avance 2)

App móvil React Native (Expo, JavaScript) para la gestión de proyectos internos de WebStrategy S.A.C.

## Ejecutar
```bash
npm install
npx expo start      # escanear el QR con Expo Go (Android/iOS) o presionar a / i
```

## Módulos implementados
- **2.1 Autenticación**: login (con biometría si el dispositivo la tiene), registro, cambio y recuperación de contraseña, sesión con token en SecureStore (Keychain/Keystore).
- **2.2 Perfil**: ver/editar datos, foto de perfil (galería), preferencias de notificaciones.
- **2.3 Core del negocio**: Dashboard, Proyectos (listado/detalle/creación según rol), Tareas (cambio rápido de estado), Chat por proyecto en tiempo real, Notificaciones.

## API
`src/api/config.js` → `USE_MOCK: true` usa un servidor simulado en memoria (`src/api/mockServer.js`) con los mismos endpoints que la API REST corporativa. Para conectar el backend real: `USE_MOCK: false` y ajustar `BASE_URL` / `WS_URL`.

Usuarios demo: `ana.rojas@webstrategy.pe` (jefe de proyecto) y `luis.paredes@webstrategy.pe` (miembro), contraseña `123456`.
