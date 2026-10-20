---
name: odoo-task
description: 'Genera títulos de tarea cortos (máx. 2 líneas) al estilo Ingeos (español de España, formato "Área: cambio A + cambio B") a partir del contexto de la sesión/chat o de los últimos commits. Úsala cuando pidan "redactar una tarea", "generar el nombre/título de la tarea", "task title", "describe estos cambios como tarea", o convertir un chat/commits en un ticket. Pensada para proyectos Odoo/Ingeos.'
---

# Odoo task naming (estilo Ingeos)

Genera el nombre de una tarea (una línea) a partir del contexto de la
conversación o de los últimos commits.

## Cuándo

Cuando el usuario pida redactar/generar el nombre o título de una tarea para
los cambios hechos, sin importar si el origen es el chat/sesión o los commits.

## Formato de salida

**Español de España**, con tildes y eñes correctas. Tono impersonal
(sustantivo/gerundio, nunca "he hecho" ni órdenes).

```
<Área>: <cambio concreto A> + <cambio concreto B> [+ <cambio C>]
```

- **Área** = la cabecera *antes de los dos puntos*: el **tema funcional** del
  trabajo, no un módulo ni un fichero. Ej.: *Limpieza de deuda técnica del
  portal*, *Filtrado por modalidad en el portal de cursos*.
- Tras los dos puntos van los cambios concretos, unidos con ` + `. Si el título
  abarca dos temas distintos, puedes encadenar dos áreas con ` + ` sin dos puntos
  (ver último ejemplo).
- Cada cambio es una frase corta y concreta. **Sin detalles de implementación**
  (nada de rutas de fichero, nombres de función, ramas ni commits) salvo que lo
  pidan.
- **Sin** prefijos tipo `feat(...)`/`fix(...)` ni códigos de ticket (`T2026...`)
  salvo que lo pidan.
- **Siempre la variante corta/funcional.** Máximo **dos líneas**; lo normal es
  una.

## Cómo reunir el contexto

1. **Desde la sesión/chat**: resume los cambios funcionales agrupados por tema.
2. **Desde commits**: en cada repo afectado ejecuta
   `git log --oneline -N` (amplía con `git diff --stat <base>..HEAD` si
   necesitas el alcance). Agrupa por ticket/tema e **ignora el ruido**:
   `__pycache__`, merges, commits llamados solo `T2026...`, subidas de versión.
3. Si hay varios tickets, devuelve **una tarea por ticket**.

## Ejemplo de "área"

Cambios: el catálogo público `/cursos` pasa a filtrar por `modality_id` y el
widget CMS lista cursos por modalidad incluyendo Teleformación.

- **Área** (cabecera): `Filtrado por modalidad en el portal de cursos`
- **Tarea final**: `Filtrado por modalidad en el portal de cursos: catálogo público y widget CMS usando el campo de modalidad propio del cliente, con inclusión de los cursos de Teleformación en los listados presenciales de La Almunia y Tarazona`

## Ejemplos

- `Limpieza de deuda técnica del portal: eliminación del CSS muerto y migración de todos los estilos inline a utilidades del tema Oduca + Archivado de imágenes y ficheros legacy sin referencias`
- `Corrección de los defectos detectados tras el cambio de imagen del portal + Revisión de la información de prueba para que todas las pantallas presenten datos coherentes y completos`
