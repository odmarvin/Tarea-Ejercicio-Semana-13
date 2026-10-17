import { Output, streamText } from 'ai';
import { z } from 'zod';
import { tareaNueva } from '../../../lib/esquemas';
import { modelo } from '../../../lib/modelo';
import { agregar } from '../../../lib/tareas';

export const maxDuration = 30;

const SISTEMA = `Lees un texto —un correo, una nota de reunión, un mensaje de chat—
y sacas las tareas concretas que contiene.
Una tarea es algo que alguien tiene que HACER. Ignora saludos, contexto y opiniones.
Si el texto no contiene ninguna tarea, devuelve una lista vacía.`;

export async function POST(req: Request) {
  const { texto } = (await req.json()) as { texto: string };

  const result = streamText({
    model: modelo(),
    system: SISTEMA,
    prompt: texto,

    output: Output.array({
      // ╔═════════════════════════════════════════════════════════╗
      // ║  HUECO 2                                                ║
      // ║                                                         ║
      // ║  Este esquema solo pide un título, así que eso es lo    ║
      // ║  único que vas a recibir: las tareas van a llegar sin   ║
      // ║  prioridad y sin responsable, y en la pantalla se ven   ║
      // ║  a medias.                                              ║
      // ║                                                         ║
      // ║  El esquema de verdad ya existe: es `tareaNueva`, en    ║
      // ║  lib/esquemas.ts, importado arriba. Ponlo aquí.         ║
      // ║                                                         ║
      // ║  Fíjate antes en sus .describe(): esos textos VIAJAN al ║
      // ║  modelo. No son comentarios, son las instrucciones que  ║
      // ║  lee para llenar cada campo.                            ║
      // ╚═════════════════════════════════════════════════════════╝
      element: tareaNueva,
    }),
  });

  // Cada elemento sale por aquí EN CUANTO está completo y validado, no al
  // final. Lo mandamos como NDJSON: un JSON por línea.
  //
  // Es la misma idea de la Semana 9 —un canal que gotea— con otro formato.
  const codificador = new TextEncoder();
  const flujo = new ReadableStream({
    async start(c) {
      try {
        for await (const elemento of result.elementStream) {
          const guardada = agregar(elemento, 'correo');
          c.enqueue(codificador.encode(JSON.stringify(guardada) + '\n'));
        }
      } catch (e) {
        c.enqueue(codificador.encode(
          JSON.stringify({ error: e instanceof Error ? e.message : 'falló' }) + '\n',
        ));
      }
      c.close();
    },
  });

  return new Response(flujo, {
    headers: { 'Content-Type': 'application/x-ndjson', 'Cache-Control': 'no-store' },
  });
}
