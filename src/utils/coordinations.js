const CANONICAL_COORDINATIONS = [
  { id: 'c1', name: 'Evangelismo', icon: 'Megaphone', color: '#1A237E' },
  { id: 'c2', name: 'Hospitalaria', icon: 'HeartPulse', color: '#5C1800' },
  { id: 'c3', name: 'Evangelismo Carcelario', icon: 'Scale', color: '#283593' },
  { id: 'c4', name: 'Asuntos Étnicos', icon: 'Leaf', color: '#2E7D32' },
  { id: 'c5', name: 'Población Vulnerable y Especiales', icon: 'Heart', color: '#6A1B9A' },
  { id: 'c6', name: 'Evangelismo en Medios de Comunicación', icon: 'Radio', color: '#E65100' },
  { id: 'c7', name: 'Estadísticas', icon: 'BarChart3', color: '#00838F' },
  { id: 'c8', name: 'Capacitación Misionera', icon: 'BookOpenCheck', color: '#AD1457' },
  { id: 'c9', name: 'Misión Juvenil', icon: 'Flame', color: '#0B5D91' },
  { id: 'c10', name: 'Instituciones Públicas', icon: 'Landmark', color: '#8B5CF6' },
  { id: 'c11', name: 'Restauración Espiritual', icon: 'RefreshCw', color: '#16A34A' },
  { id: 'c12', name: 'Población Sorda, Ciega y Sordociega', icon: 'HandHeart', color: '#C2410C' },
];


export function getCanonicalCoordinations(coordinations = []) {
  const incomingById = new Map(coordinations.map(item => [item.id, item]));
  return CANONICAL_COORDINATIONS.map(base => ({ ...base, ...(incomingById.get(base.id) || {}) }));
}

export const contentRegions = [
  { id: 'r1', name: 'Andina' }, { id: 'r2', name: 'Caribe' }, { id: 'r3', name: 'Pacífica' },
  { id: 'r4', name: 'Orinoquía' }, { id: 'r5', name: 'Amazónica' },
];
