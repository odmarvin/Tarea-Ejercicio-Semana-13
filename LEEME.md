# Tareas Pro · IA — Semana 13

**Integración de IA (I): LLMs, streaming, salidas estructuradas y tool calling**
Programación IV · Ing. Rodrigo Rodríguez · USPG

Esta app corre desde el primer minuto. Tiene **tres huecos** marcados en el
código, uno por bloque de la clase. Cada hueco tiene un síntoma que vas a ver
con tus ojos antes de arreglarlo.

---

## Arranque (5 minutos, antes de que empiece la clase)

### 1. Instala

```bash
pnpm install
```

### 2. Saca tu llave de Google AI Studio

Entra a <https://aistudio.google.com/apikey>, inicia sesión con tu cuenta de
Google y dale a **Create API key**. Es gratis y no pide tarjeta.

Copia la llave. Se ve así: `AIza...`

### 3. Ponla en su lugar

```bash
cp .env.local.ejemplo .env.local
```

Abre `.env.local` y pega la llave en `GOOGLE_GENERATIVE_AI_API_KEY`.

> La llave va en `.env.local` y **nunca** en el código del cliente. Es la misma
> regla de la Semana 10 con Stripe: lo que cuesta dinero vive en el servidor.
> `.env.local` ya está en el `.gitignore`.

### 4. Levanta

```bash
pnpm dev
```

Abre <http://localhost:3000>. Vas a ver tres paneles: la lista de tareas, el
extractor de correos y el asistente.

---

## Los tres huecos

| | Dónde | Qué está roto | Cómo se ve |
|---|---|---|---|
| **1** | `app/api/chat/route.ts` | El asistente no recibe la conversación | Contesta, pero no a lo que preguntaste |
| **2** | `app/api/extraer/route.ts` | El esquema solo pide el título | Las tareas salen sin prioridad ni responsable |
| **3a** | `lib/herramientas.ts` | La herramienta de crear no tiene `execute` | Pide crear la tarea y no pasa nada |
| **3b** | `app/api/chat/route.ts` | El asistente no tiene herramientas conectadas | Te dice «ya la agregué» y es mentira |

Cada hueco trae su explicación completa en un comentario, ahí mismo en el
archivo. No hay que adivinar: hay que entender.

---

## Lo que vas a construir

**Bloque 1 · El asistente que sí escucha.** Una ruta que le habla al modelo y
devuelve la respuesta en streaming, token por token. Es el mismo canal que
goteaba de la Semana 9, con un protocolo encima.

**Bloque 2 · Del correo a la lista.** Pegas un correo y salen tareas tipadas
—con prioridad y responsable— apareciendo una por una. El contrato que las
valida es el mismo esquema de Zod de la Semana 4.

**Bloque 3 · El asistente con manos.** Le pides que agregue una tarea y la
agrega de verdad, porque le diste herramientas. El modelo no ejecuta nada:
pide, y tu código decide.

---

## Si algo falla

**`API key not valid`** — la llave quedó mal pegada. Fíjate que no se haya
colado un espacio ni que esté entre comillas.

**Un 404 del modelo, o un error de cuota** — el nombre del modelo cambia con
el tiempo. Abre `.env.local` y prueba con otro de la lista que está ahí
comentada: `gemini-2.5-flash` es el más estable.

**«Resource exhausted» o 429** — te pasaste del límite gratuito por minuto.
Espera un minuto. No mandes la misma petición veinte veces seguidas.

**El asistente no contesta nada y la consola del navegador se queja** — casi
siempre es el hueco 1 todavía sin tapar, o un error del servidor: míralo en la
terminal donde corre `pnpm dev`, ahí sale completo.

---

## Lo que NO está en esta app, y lo vas a necesitar en el producto

- **Límite por usuario.** Aquí cualquiera puede mandar mil peticiones. En
  producción eso es tu tarjeta.
- **Un tope de tamaño en el texto de entrada.** Pegar un PDF de 300 páginas
  cuesta tokens de verdad.
- **Confirmación antes de actuar.** Una herramienta que borra o cobra lleva
  `needsApproval`. Hay un ejemplo comentado al final de `lib/herramientas.ts`.
