'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Tarea } from '../../lib/tareas';

export default function ListaTareas() {
  const [tareas, setTareas] = useState<Tarea[] | null>(null);

  const recargar = useCallback(async () => {
    const res = await fetch('/api/tareas', { cache: 'no-store' });
    setTareas(await res.json());
  }, []);

  useEffect(() => {
    recargar();
    // Cuando la IA agrega algo, avisa por aquí y la lista se recarga.
    window.addEventListener('tareas-cambiaron', recargar);
    return () => window.removeEventListener('tareas-cambiaron', recargar);
  }, [recargar]);

  return (
    <div className="tarjeta">
      <h2>Tareas</h2>

      {tareas === null ? (
        <p className="apagado">Cargando…</p>
      ) : tareas.length === 0 ? (
        <p className="apagado">Todavía no hay tareas.</p>
      ) : (
        <ul className="lista">
          {tareas.map((t) => (
            <li key={t.id}>
              <span className={'pastilla p-' + t.prioridad}>{t.prioridad}</span>
              <span className="titulo">{t.titulo}</span>
              <span className="meta">
                {t.responsable ?? 'sin asignar'}
                {t.origen !== 'manual' ? ' · ' + t.origen : ''}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
