import { google } from '@ai-sdk/google';

/* Un solo lugar donde se decide con qué modelo se habla.
   Cambiar de modelo —o de proveedor entero— es cambiar este archivo
   y nada más. El resto del código no sabe ni le importa. */

export function modelo() {
  return google(process.env.MODELO ?? 'gemini-3.5-flash');
}

/* Para cambiar a otro proveedor:
 *
 *   import { openai } from '@ai-sdk/openai';
 *   export function modelo() { return openai('gpt-5-mini'); }
 *
 * Nada más cambia. Ni las rutas, ni las herramientas, ni el cliente.
 * Eso es lo que significa que el AI SDK sea una capa: el enchufe es
 * el mismo aunque cambies el aparato. */
