# OpenSpec Approved Spec: Login Unificado IMQ Wellness Portal

**Status**: approved  
**Created**: 2026-06-02  
**Module**: `imq_wellness_portal`  
**Version bump**: `19.0.4.0.0`

---

## 1. Summary

Reimplementar la página de login del portal de bienestar para que resida en `/web/login` (ruta nativa de Odoo), ofreciendo un switch entre:

1. **Acceso con token** — login anónimo por cookie (`imq_wellness_access`).
2. **Acceso usuario registrado** — login nativo de Odoo (`/web/login`).
3. **Registro** — signup nativo de Odoo (`/web/signup`), bloqueado para usuarios que NO se autenticaron previamente con token. Solo quienes tienen una token session válida pueden acceder al signup.

Además, añadir campos legales (política de privacidad y consentimiento informado) al signup, con persistencia en `res.users`.

---

## 2. Motivation

- Actualmente el login de token vive en `/bienestar-emocional`, separado del login de Odoo.
- Los usuarios no tienen un flujo unificado: o usan token (anónimo) o usan Odoo (registrado), pero la transición entre ambos es confusa.
- El signup de Odoo es accesible públicamente, pero debe bloquearse para quienes NO tienen una token session válida.
- Se requiere trazabilidad legal de aceptaciones de privacidad y consentimiento.

---

## 3. Scope

### In Scope

- Unificar login en `/web/login` con switch toggle (token / Odoo login).
- Incrustar signup de Odoo en la misma página, restringido por token session.
- Simplificar token login a un solo campo ("Token de acceso").
- Ocultar botón "Iniciar sesión como superusuario" del login de Odoo.
- Añadir checkboxes de política de privacidad y consentimiento informado al signup.
- Crear campos en `res.users` para almacenar aceptaciones legales (boolean, timestamp, versión).
- Adaptar estilos de Odoo login/signup al design system del portal (`wl-*`).
- Separar controladores: `auth.py` (autenticación), `dashboard.py` (dashboard/privilegios), `main.py` (home y misc).
- Eliminar completamente la ruta `/bienestar-emocional` y sus referencias.
- Cambiar endpoint de auth de token a `/token/auth`.

### Out of Scope

- Cambios en el modelo `imq.wellness.session`.
- Cambios en la lógica de protección de rutas (`ir_http.py`).
- Creación de las páginas `/politica-de-privacidad` y `/consentimiento-informado` (solo los links).

---

## 4. Architecture

### 4.1 Page Structure (`login.xml`)

```
/web/login  →  renderiza login.xml

┌─ Brand Panel (izquierda, sin cambios)
│   Logo + headline + descripción
│
└─ Form Panel (derecha)
    ├─ Switch Toggle: [Acceso con token] | [Acceso usuario registrado]
    ├─ Formulario Token (modo=token)
    │   └─ Campo: "Token de acceso"
    │   └─ Botón: "Acceder al portal"
    ├─ Formulario Odoo Login (modo=login, default)
    │   └─ Email, Contraseña
    │   └─ Botón: "Iniciar sesión"
    │   └─ Link: "¿No tienes cuenta?" → modo=signup
    └─ Formulario Odoo Signup (modo=signup)
        └─ Nombre, Email, Contraseña, Confirmar
        └─ Checkbox: Política de privacidad
        └─ Checkbox: Consentimiento informado
        └─ Botón: "Registrarse"
        └─ Link: "¿Ya tienes cuenta?" → modo=login
        └─ (Si no hay token session: mensaje de bloqueo)
```

### 4.2 State Machine (modo)

| Modo     | Visible     | Query Param             |
| -------- | ----------- | ----------------------- |
| `login`  | Odoo Login  | `?mode=login` (default) |
| `token`  | Token Login | `?mode=token`           |
| `signup` | Odoo Signup | `?mode=signup`          |

- El modo se controla vía **JS toggle** (sin recarga) y **query param** (para estado inicial y bookmarking).
- Si JS está desactivado, el usuario puede recargar la página con el query param correspondiente.

### 4.3 Auth Flow

```
Usuario → /web/login (default mode=login)
    │
    ├─ Click "Acceso con token" → mode=token
    │   └─ Introduce "Token de acceso" → POST /token/auth
    │       └─ Valida contra imq.wellness.token.password
    │       └─ Crea cookie imq_wellness_access
    │       └─ Redirect a /
    │
    ├─ Login Odoo exitoso → POST /web/login
    │   └─ Limpia cookie imq_wellness_access
    │   └─ Redirect a /my/home
    │
    └─ Click "¿No tienes cuenta?" → mode=signup
        └─ Si NO hay cookie token: muestra mensaje de bloqueo
        └─ Si SÍ hay cookie token: muestra formulario signup
            └─ POST /web/signup
                └─ Crea usuario Odoo
                └─ Guarda campos legales en res.users
                └─ Limpia cookie imq_wellness_access
                └─ Redirect a /my/home
```

---

## 5. Components

### 5.1 Views (`views/login.xml`)

- Template `imq_wellness_portal.login_template` hereda de `website.layout`.
- Contiene los 3 formularios en el DOM, con atributos `data-mode` para JS toggle.
- Los formularios de Odoo se renderizan inline (no heredan templates nativos) para control total del markup y estilos.
- Se incluye CSRF token en todos los formularios POST.

### 5.2 Controllers

#### `controllers/auth.py` — Autenticación

| Ruta          | Método | Descripción                                                                                                       |
| ------------- | ------ | ----------------------------------------------------------------------------------------------------------------- |
| `/web/login`  | GET    | Renderiza login.xml con modo según query param. Hereda de `odoo.addons.web.controllers.main.Home` o reimplementa. |
| `/web/signup` | GET    | Redirige a `/web/login?mode=signup`                                                                               |
| `/token/auth` | POST   | Valida token (1 campo), crea cookie, redirect                                                                     |
| `/web/login`  | POST   | Hereda login nativo Odoo, limpia cookie token                                                                     |
| `/web/signup` | POST   | Hereda signup nativo Odoo, guarda legales, limpia cookie                                                          |

#### `controllers/dashboard.py` — Dashboard y Privilegios

| Ruta                      | Método | Descripción                                   |
| ------------------------- | ------ | --------------------------------------------- |
| `/my`, `/my/home`         | GET    | Renderiza dashboard wellness según privilegio |
| `/my/company`             | GET    | Dashboard de empresa para RRHH                |
| `_get_portal_privilege()` | Func   | Determina privilegio del usuario              |

#### `controllers/main.py` — Home y Misc

| Ruta | Método | Descripción                                |
| ---- | ------ | ------------------------------------------ |
| `/`  | GET    | Homepage wellness (override Website.index) |

### 5.3 Models

#### `models/res_users.py` — Extensión de `res.users`

```python
class ResUsers(models.Model):
    _inherit = 'res.users'

    wl_privacy_accepted = fields.Boolean(string='Aceptó Política de Privacidad')
    wl_privacy_accepted_at = fields.Datetime(string='Fecha aceptación Política')
    wl_privacy_version = fields.Char(string='Versión Política')

    wl_consent_accepted = fields.Boolean(string='Aceptó Consentimiento Informado')
    wl_consent_accepted_at = fields.Datetime(string='Fecha aceptación Consentimiento')
    wl_consent_version = fields.Char(string='Versión Consentimiento')
```

#### `models/token.py` — Ajustes

- Eliminar campo `token` del modelo; ya no se usa como identificador separado.
- `validate_credentials(password)` → recibe el valor único introducido por el usuario, busca entre todos los registros activos y valida el hash `password` con `check_password_hash`.
- Eliminar `get_record_by_token()`; ya no es necesaria.

### 5.4 Assets

#### `static/src/scss/login.scss`

- Añadir estilos para el switch toggle.
- Añadir estilos para los formularios de Odoo envueltos en `.wl-form`.
- Ocultar botón superusuario vía CSS (`display: none` en `.oe_login_form .btn-secondary` o similar).

#### `static/src/js/login.js`

- Event listeners para el switch toggle.
- Mostrar/ocultar formularios según `data-mode`.
- Actualizar URL con `history.pushState` al cambiar de modo.
- Leer query param `mode` al cargar la página para establecer estado inicial.
- Validación client-side de checkboxes legales antes de submit signup.

---

## 6. Data Flow

### 6.1 Token Login (1 campo)

```
Usuario introduce "Token de acceso" (valor único)
    │
    ▼
POST /token/auth
    │
    ▼
WellnessToken.validate_credentials(password_value)
    │
    ├─ Obtiene todos los registros activos
    │
    └─ Para cada registro, prueba check_password_hash(record.password, password_value)
        hasta encontrar coincidencia
    │
    ▼
Crea WellnessSession → cookie imq_wellness_access
Redirect a /
```

> **Nota de implementación**: El usuario introduce un único valor que actúa como "token de acceso". Este valor se valida contra el campo `password` (hash) del modelo `imq.wellness.token`. El campo `token` del modelo se elimina; ya no se usa como identificador separado.

### 6.2 Signup Restriction

```
GET /web/login?mode=signup
    │
    ▼
Controller verifica cookie imq_wellness_access
    │
    ├─ Cookie válida → renderiza formulario signup completo
    │
    └─ Cookie inválida/ausente → renderiza mensaje de bloqueo
        "Debes acceder con tu token de empresa antes de registrarte"
        + botón "Acceder con token" → mode=token
```

### 6.3 Legal Fields on Signup

```
POST /web/signup
    │
    ▼
Hereda signup nativo Odoo → crea res.users
    │
    ▼
Guarda campos legales:
    wl_privacy_accepted = True
    wl_privacy_accepted_at = now()
    wl_privacy_version = "1.0"  (hardcoded inicial)
    wl_consent_accepted = True
    wl_consent_accepted_at = now()
    wl_consent_version = "1.0"
    │
    ▼
Limpia cookie imq_wellness_access
Redirect a /my/home
```

---

## 7. Error Handling

| Escenario                  | Comportamiento                                                        |
| -------------------------- | --------------------------------------------------------------------- |
| Token inválido             | Redirect a `/web/login?mode=token&error=invalid` con mensaje de error |
| Rate limit excedido        | Redirect a `/web/login?mode=token&error=ratelimit`                    |
| Signup sin token session   | Mensaje inline en la página, sin redirect                             |
| Signup sin aceptar legales | Validación client-side (JS) + server-side                             |
| Odoo login fallido         | Comportamiento nativo de Odoo (mensaje en formulario)                 |

---

## 8. Security Considerations

- CSRF token obligatorio en todos los formularios POST.
- Rate limiting en `/token/auth` (ya existe, mantener).
- Cookie `imq_wellness_access` con `httponly`, `samesite=Lax`, `secure` en HTTPS.
- Signup bloqueado para quienes NO tienen token session válida.
- Campos legales no editables por el usuario desde el frontend (solo seteables en signup).

---

## 9. Testing Strategy

### 9.1 Manual Tests

1. Acceder a `/web/login` → muestra Odoo login por defecto.
2. Click "Acceso con token" → muestra formulario de 1 campo.
3. Introducir token válido → cookie creada, redirect a `/`.
4. Con cookie token, ir a `/web/login?mode=signup` → muestra signup.
5. Sin cookie token, ir a `/web/login?mode=signup` → mensaje de bloqueo.
6. Completar signup con checkboxes legales → usuario creado, cookie token eliminada.
7. Login con usuario Odoo → accede a `/my/home`.
8. Verificar que no aparece botón superusuario.
9. Verificar que logout desde navbar usa `/web/logout` (Odoo).
10. Verificar que `/bienestar-emocional` devuelve 404 (ruta eliminada).

### 9.2 Unit Tests (opcional, post-MVP)

- `test_token_validate_single_field()`
- `test_signup_restricted_without_token_session()`
- `test_legal_fields_persisted_on_signup()`
- `test_cookie_cleared_on_odoo_login()`

---

## 10. Migration Notes

- Los tokens existentes en `imq.wellness.token` siguen funcionando; el campo `password` ya estaba hasheado.
- El campo `token` del modelo se elimina; los datos existentes en ese campo se pierden (era identificador, no afecta la validación).
- Los usuarios existentes no tienen campos legales (NULL/False), lo cual es aceptable.
- La ruta `/bienestar-emocional` se elimina completamente.

---

## 11. Files Changed

### New Files

- `controllers/auth.py`
- `controllers/dashboard.py`
- `models/res_users.py`
- `views/res_users_view.xml` (opcional, para mostrar campos legales en backend)

### Modified Files

- `controllers/main.py` (limpiar auth y dashboard, mantener home)
- `models/token.py` (eliminar campo `token`, ajustar validate_credentials para 1 campo)
- `models/__init__.py` (añadir res_users)
- `controllers/__init__.py` (añadir auth, dashboard)
- `views/login.xml` (reestructurar con 3 formularios + switch)
- `views/token_view.xml` (eliminar campo `token` de las vistas)
- `static/src/scss/login.scss` (estilos toggle + Odoo form overrides)
- `static/src/js/login.js` (lógica de switch toggle)
- `__manifest__.py` (añadir nuevos archivos data, bump version)

### Deleted / Deprecated

- Ruta `/bienestar-emocional/auth` → reemplazada por `/token/auth`
- Ruta `/bienestar-emocional` → eliminada completamente
- Campo `token` del modelo `imq.wellness.token` → eliminado
- Campo "Token de acceso" del formulario HTML (el input `name="token"` se elimina)

---

## 12. Open Questions

None — all clarifications received and incorporated.

---

## 13. Approval Log

| Date       | Actor | Action                                                                              |
| ---------- | ----- | ----------------------------------------------------------------------------------- |
| 2026-06-02 | User  | Approved design with adjustments: `/token/auth`, split controllers, openspec format |
