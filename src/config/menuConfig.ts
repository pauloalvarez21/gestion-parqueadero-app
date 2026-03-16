// Crea este archivo en: src/config/menuConfig.ts

export const MENU_OPTIONS = [
  {
    id: 'entrada',
    title: 'Registrar Entrada',
    icon: '🚗', // bi-box-arrow-in-right
    roles: ['ADMIN', 'OPERADOR'],
    route: 'Entrada',
  },
  {
    id: 'salida',
    title: 'Registrar Salida',
    icon: '🏁', // bi-box-arrow-left
    roles: ['ADMIN', 'OPERADOR'],
    route: 'Salida',
  },
  {
    id: 'tickets',
    title: 'Tickets Activos',
    icon: '🎫', // bi-ticket-perforated-fill
    roles: ['ADMIN', 'OPERADOR'],
    route: 'Tickets',
  },
  {
    id: 'usuario',
    title: 'Crear Usuario',
    icon: '👤', // bi-person-plus-fill
    roles: ['ADMIN'],
    route: 'RegistroUsuario',
  },
  {
    id: 'espacios',
    title: 'Gestionar Espacios',
    icon: '🅿️', // bi-grid-3x3-gap-fill
    roles: ['ADMIN', 'OPERADOR'],
    route: 'Espacios',
  },
  {
    id: 'tarifas',
    title: 'Tarifas',
    icon: '💰', // bi-currency-dollar
    roles: ['ADMIN'],
    route: 'Tarifas',
  },
  {
    id: 'vehiculos',
    title: 'Vehículos',
    icon: '🚙', // bi-car-front-fill
    roles: ['ADMIN', 'OPERADOR'],
    route: 'Vehiculos',
  },
  {
    id: 'estadisticas',
    title: 'Estadísticas',
    icon: '📊', // bi-bar-chart-line-fill
    roles: ['ADMIN'],
    route: 'Estadisticas',
  },
];
