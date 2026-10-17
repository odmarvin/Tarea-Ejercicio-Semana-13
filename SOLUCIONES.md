# Soluciones — Semana 13

No lo abras antes de intentarlo. El código no es el punto; el síntoma sí.

---

## Hueco 1 · El asistente no escucha

`app/api/chat/route.ts`

```ts
messages: await convertToModelMessages(messages),
```

**Por qué.** `useChat` manda `UIMessage[]`: mensajes con *partes* —texto,
llamadas a herramientas, archivos, razonamiento— porque eso es lo que la
interfaz necesita pintar. El modelo espera otra forma, `ModelMessage[]`, que
no tiene nada de eso. `convertToModelMessages` hace la traducción.

Son dos formas distintas a propósito. Si fueran la misma, cada cambio en lo
que pinta tu UI sería un cambio en lo que recibe el modelo.

---

## Hueco 2 · Las tareas salen a medias

`app/api/extraer/route.ts`

```ts
output: Output.array({ schema: tareaNueva }),
```

**Por qué.** El esquema no es una validación que corre *después*: es parte de
la petición. El modelo lo recibe y produce algo que encaje.

Y los `.describe()` de `lib/esquemas.ts` viajan con él. Esa es la diferencia
entre `responsable: z.string().nullable()` y
`.describe('El nombre de quien debe hacerla, o null si el texto no lo dice')`.
Con el primero el modelo inventa un nombre cuando no lo encuentra. Con el
segundo pone `null`.

**Pruébalo:** quítale el `.describe()` a `responsable`, manda el mismo correo,
y cuenta cuántos nombres se inventó.

---

## Hueco 3a · La herramienta sin manos

`lib/herramientas.ts`

```ts
execute: async (datos) => {
  const creada = agregar(datos, 'asistente');
  return { id: creada.id, titulo: creada.titulo, prioridad: creada.prioridad };
},
```

**Por qué.** Lo que devuelve `execute` vuelve al modelo como resultado de la
herramienta, y con eso redacta su respuesta. Si devuelves `undefined`, el
modelo se queda sin saber si funcionó y lo rellena con lo que le parezca.

Devuelve poco y concreto. Devolver la tarea entera, con `creada` y `hecha`,
solo gasta tokens en cosas que el modelo no va a usar.

---

## Hueco 3b · El asistente que miente

`app/api/chat/route.ts`

```ts
tools: herramientas,
stopWhen: isStepCount(5),
```

**Por qué `tools`.** Sin herramientas, el modelo solo sabe producir texto. Le
pides que agregue una tarea y produce el texto más probable después de esa
petición, que es «listo, ya la agregué». No está mintiendo: está haciendo
exactamente lo único que puede hacer.

**Por qué `stopWhen`.** Un paso es: el modelo habla → pide una herramienta →
tu código la corre. Sin `stopWhen`, ahí termina todo: la tarea se crea pero el
asistente nunca vuelve a hablar para contártelo. Con `isStepCount(5)` el SDK
le devuelve el resultado y le da otro turno, hasta cinco veces.

Cinco y no cincuenta: cada paso es una llamada que cuesta. El tope es tu
presupuesto, no un detalle técnico.

---

## Lo que vale la pena probar después

**Rompe el bucle.** Pon `isStepCount(1)` y pídele que agregue una tarea. Se
crea, y el asistente se queda callado. Ese silencio es el bucle sin cerrar.

**Quítale el system prompt.** Borra `SISTEMA` del `streamText` del chat y
pregúntale cualquier cosa. Deja de ser el asistente de tu producto y vuelve a
ser un modelo genérico. El prompt de sistema no es decoración.

**Cámbiale el proveedor.** `lib/modelo.ts`, tres líneas. Instala
`@ai-sdk/openai` o `@ai-sdk/anthropic`, cambia la función, y todo lo demás
—rutas, herramientas, cliente— sigue igual.
