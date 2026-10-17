import type { TareaNueva } from './esquemas';

export type Tarea = TareaNueva & {
  id: string;
  hecha: boolean;
  creada: number;
  origen: 'manual' | 'correo' | 'asistente';
};

const g = globalThis as unknown as { __tareas?: Map<string, Tarea> };

if (!g.__tareas) {
  g.__tareas = new Map();
  const semilla: Array<[string, Tarea['prioridad'], string | null]> = [
    ['Revisar el PR de pagos', 'alta', 'Marlon'],
    ['Escribir las pruebas del webhook', 'media', null],
    ['Medir el LCP de la portada', 'baja', 'Karla'],
  ];
  semilla.forEach(([titulo, prioridad, responsable], i) => {
    const id = 't' + (i + 1);
    g.__tareas!.set(id, {
      id, titulo, prioridad, responsable,
      hecha: false, creada: Date.now() - (3 - i) * 60000, origen: 'manual',
    });
  });
}

export const tareas = g.__tareas!;

export function listar(): Tarea[] {
  return Array.from(tareas.values()).sort((a, b) => b.creada - a.creada);
}

export function agregar(t: TareaNueva, origen: Tarea['origen']): Tarea {
  const tarea: Tarea = {
    ...t,
    id: 't' + Math.random().toString(36).slice(2, 9),
    hecha: false,
    creada: Date.now(),
    origen,
  };
  tareas.set(tarea.id, tarea);
  return tarea;
}

export function buscar(texto: string): Tarea[] {
  const q = texto.toLowerCase().trim();
  if (!q) return listar();
  return listar().filter(
    (t) =>
      t.titulo.toLowerCase().includes(q) ||
      (t.responsable ?? '').toLowerCase().includes(q),
  );
}
