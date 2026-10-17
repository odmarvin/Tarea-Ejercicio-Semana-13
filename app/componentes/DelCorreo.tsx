'use client';

import { useState } from 'react';
import type { Tarea } from '../../lib/tareas';

const EJEMPLO = `Hola equipo,

Revisé la demo de ayer. Tres cosas antes del viernes:

El checkout vuelve a tronar cuando el usuario cancela a medias — Karla,
esto es lo más urgente, nos está costando conversiones.

Alguien tiene que escribir las pruebas del webhook de Stripe, llevamos
dos semanas sin cobertura ahí.

Y cuando se pueda, Marlon, pasa el logo nuevo al header. No corre prisa.

Gracias,
Rodrigo`;

export default function DelCorreo() {
  const [texto, setTexto] = useState(EJEMPLO);
  const [saliendo, setSaliendo] = useState(false);
  const [sacadas, setSacadas] = useState<Tarea[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function extraer() {
    setSaliendo(true);
    setSacadas([]);
    setError(null);

    try {
      const res = await fetch('/api/extraer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto }),
      });
      if (!res.body) throw new Error('El servidor no mandó nada');

      // NDJSON: un JSON por línea. Cada línea que llega es una tarea
      // completa y validada, no un pedazo de texto.
      const lector = res.body.getReader();
      const decodificador = new TextDecoder();
      let resto = '';

      while (true) {
        const { done, value } = await lector.read();
        if (done) break;

        resto += decodificador.decode(value, { stream: true });
        const lineas = resto.split('\n');
        resto = lineas.pop() ?? '';

        for (const linea of lineas) {
          if (!linea.trim()) continue;
          const dato = JSON.parse(linea);
          if (dato.error) { setError(dato.error); continue; }
          setSacadas((previas) => [...previas, dato as Tarea]);
          window.dispatchEvent(new Event('tareas-cambiaron'));
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falló la extracción');
    } finally {
      setSaliendo(false);
    }
  }

  return (
    <div className="tarjeta">
      <h2>Del correo a la lista</h2>
      <p className="apagado">
        Pega un correo o una nota de reunión. Salen las tareas, una por una,
        conforme el modelo las va cerrando.
      </p>

      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        rows={9}
        spellCheck={false}
      />

      <button className="boton" onClick={extraer} disabled={saliendo}>
        {saliendo ? 'Leyendo…' : 'Sacar las tareas'}
      </button>

      {error ? <p className="error">{error}</p> : null}

      {sacadas.length > 0 ? (
        <ul className="lista chica">
          {sacadas.map((t) => (
            <li key={t.id}>
              <span className={'pastilla p-' + t.prioridad}>{t.prioridad}</span>
              <span className="titulo">{t.titulo}</span>
              <span className="meta">{t.responsable ?? 'sin asignar'}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
