import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type UIMessage,
} from 'ai';
import { herramientas } from '../../../lib/herramientas';
import { modelo } from '../../../lib/modelo';

export const maxDuration = 30;

const SISTEMA = `Eres el asistente de Tareas Pro, una aplicación de tareas de equipo.
Contestas en español, corto y directo: dos o tres frases, nunca párrafos.
Nunca inventes tareas que no hayas visto: si no sabes, búscalas primero.
Si el usuario pide agregar algo, agrégalo de verdad con la herramienta.`;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: modelo(),
    system: SISTEMA,

    messages: await convertToModelMessages(messages),

    tools: herramientas,
    stopWhen: stepCountIs(5),
  });

  return result.toUIMessageStreamResponse();
}

// herramientas e isStepCount quedan importados a propósito: los vas a usar
// en el hueco 3b. Si tu editor los marca como no usados, tiene razón… por ahora.
void herramientas;
void stepCountIs;
