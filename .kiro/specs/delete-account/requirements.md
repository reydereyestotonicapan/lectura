# Requirements Document

## Introduction

Esta funcionalidad permite a los usuarios de la app móvil eliminar permanentemente su cuenta desde la pantalla de Configuración. Al eliminar la cuenta, se borran de forma irreversible el registro del usuario en la base de datos de Laravel (junto con todos sus datos relacionados), se revocan todos los tokens de Sanctum activos y se elimina la cuenta de Firebase asociada mediante el Firebase Admin SDK. La UI está completamente en español, siguiendo el estilo existente de la app.

## Glossary

- **DeleteAccountController**: Controlador Laravel en `app/Http/Controllers/Api/` que gestiona la eliminación de cuentas.
- **AuthController**: Controlador Laravel existente en `app/Http/Controllers/Api/AuthController.php` que usa el Firebase Admin SDK (`Kreait\Firebase\Contract\Auth`).
- **Firebase Admin SDK**: Librería `kreait/firebase-php` usada en el backend para gestionar usuarios de Firebase; accesible vía `Kreait\Firebase\Contract\Auth`.
- **Sanctum Token**: Token de autenticación de Laravel Sanctum almacenado en `expo-secure-store` en el dispositivo móvil.
- **firebase_uid**: Campo en el modelo `User` de Laravel que almacena el UID del usuario en Firebase.
- **SettingsScreen**: Pantalla de configuración de la app móvil (`mobile/src/screens/SettingsScreen.tsx`) donde se añade el botón de eliminar cuenta.
- **AuthContext**: Contexto de autenticación de la app móvil (`mobile/src/auth/AuthContext.tsx`) que gestiona el estado de sesión y el flujo de cierre de sesión.
- **API Client**: Cliente Axios de la app móvil (`mobile/src/api/client.ts`) usado para todas las llamadas a la API de Laravel.
- **Zona de Peligro**: Sección visual al final de la `SettingsScreen` que agrupa acciones destructivas e irreversibles.

## Requirements

### Requirement 1: Endpoint de eliminación de cuenta en el backend

**User Story:** Como usuario autenticado, quiero que exista un endpoint seguro en la API que elimine permanentemente mi cuenta y todos mis datos, para que mi información no permanezca en el sistema tras solicitar la eliminación.

#### Acceptance Criteria

1. THE `DeleteAccountController` SHALL exponer un endpoint `DELETE /api/account` protegido por el middleware `auth:sanctum`.
2. WHEN el endpoint `DELETE /api/account` recibe una solicitud autenticada, THE `DeleteAccountController` SHALL eliminar el registro del usuario autenticado de la base de datos junto con todos sus datos relacionados mediante eliminación en cascada o eliminación explícita de relaciones.
3. WHEN el endpoint `DELETE /api/account` recibe una solicitud autenticada y el usuario tiene un `firebase_uid` no nulo, THE `DeleteAccountController` SHALL llamar al Firebase Admin SDK para eliminar el usuario de Firebase identificado por ese `firebase_uid`.
4. WHEN la llamada al Firebase Admin SDK falla durante la eliminación de cuenta, THE `DeleteAccountController` SHALL registrar el error en el log de Laravel y continuar con la eliminación del registro de Laravel, devolviendo una respuesta de éxito al cliente.
5. WHEN el endpoint `DELETE /api/account` completa la eliminación del usuario, THE `DeleteAccountController` SHALL revocar todos los tokens de Sanctum activos del usuario antes de eliminar el registro.
6. WHEN el endpoint `DELETE /api/account` completa exitosamente, THE `DeleteAccountController` SHALL devolver una respuesta HTTP 200 con un cuerpo JSON que contenga el campo `message`.
7. IF el token de Sanctum de la solicitud no es válido o ha expirado, THEN THE `DeleteAccountController` SHALL devolver una respuesta HTTP 401.

---

### Requirement 2: Función de llamada a la API en el cliente móvil

**User Story:** Como desarrollador de la app móvil, quiero una función dedicada en la capa de API que llame al endpoint de eliminación de cuenta, para mantener la consistencia con el patrón existente de llamadas a la API.

#### Acceptance Criteria

1. THE `API Client` SHALL exponer una función `deleteAccount` en `mobile/src/api/auth.ts` que realice una petición `DELETE` al endpoint `/account` usando el cliente Axios existente.
2. WHEN la función `deleteAccount` es invocada, THE `API Client` SHALL incluir automáticamente el token de Sanctum en la cabecera `Authorization` de la petición, siguiendo el interceptor existente en `client.ts`.
3. IF el servidor devuelve un error HTTP, THEN THE `API Client` SHALL propagar el error al llamador para que pueda ser manejado en la capa de UI.

---

### Requirement 3: Flujo de eliminación de cuenta en AuthContext

**User Story:** Como usuario de la app móvil, quiero que al eliminar mi cuenta se limpie completamente mi sesión local (Google Sign-In, Firebase, token de Sanctum), para que no pueda volver a acceder con las credenciales eliminadas.

#### Acceptance Criteria

1. THE `AuthContext` SHALL exponer una función `deleteAccount` que llame al endpoint `DELETE /api/account` y, tras recibir una respuesta exitosa, ejecute el flujo completo de cierre de sesión existente (Google Sign-In, Firebase, token de Sanctum).
2. WHEN la función `deleteAccount` es invocada, THE `AuthContext` SHALL llamar primero al endpoint de la API y, solo si la respuesta es exitosa, proceder a limpiar la sesión local.
3. IF la llamada al endpoint de la API falla, THEN THE `AuthContext` SHALL propagar el error al llamador sin limpiar la sesión local, para que la UI pueda mostrar un mensaje de error al usuario.

---

### Requirement 4: Diálogo de confirmación antes de eliminar la cuenta

**User Story:** Como usuario de la app móvil, quiero que se me pida confirmación explícita antes de que se elimine mi cuenta, para evitar eliminaciones accidentales de una acción irreversible.

#### Acceptance Criteria

1. WHEN el usuario pulsa el botón "Eliminar cuenta" en la `SettingsScreen`, THE `SettingsScreen` SHALL mostrar un diálogo de alerta nativo con título, mensaje de advertencia sobre la irreversibilidad de la acción, y dos opciones: cancelar y confirmar eliminación.
2. THE `SettingsScreen` SHALL mostrar el título del diálogo de confirmación en español como "Eliminar cuenta".
3. THE `SettingsScreen` SHALL mostrar el mensaje del diálogo de confirmación en español advirtiendo que la acción es permanente e irreversible y que se eliminarán todos los datos del usuario.
4. WHEN el usuario selecciona la opción de cancelar en el diálogo de confirmación, THE `SettingsScreen` SHALL cerrar el diálogo sin realizar ninguna acción.
5. WHEN el usuario selecciona la opción de confirmar en el diálogo de confirmación, THE `SettingsScreen` SHALL iniciar el proceso de eliminación de cuenta llamando a la función `deleteAccount` de `AuthContext`.

---

### Requirement 5: Estados de carga y error en la UI durante la eliminación

**User Story:** Como usuario de la app móvil, quiero recibir retroalimentación visual mientras se procesa la eliminación de mi cuenta y ver un mensaje claro si ocurre un error, para saber en todo momento el estado de la operación.

#### Acceptance Criteria

1. WHILE la eliminación de cuenta está en proceso, THE `SettingsScreen` SHALL deshabilitar el botón "Eliminar cuenta" y mostrar un indicador de actividad para prevenir múltiples solicitudes simultáneas.
2. WHILE la eliminación de cuenta está en proceso, THE `SettingsScreen` SHALL deshabilitar todos los demás controles interactivos de la pantalla.
3. IF la función `deleteAccount` devuelve un error, THEN THE `SettingsScreen` SHALL mostrar un diálogo de alerta nativo con un mensaje de error en español indicando que no fue posible eliminar la cuenta y sugiriendo intentarlo de nuevo.
4. IF la función `deleteAccount` devuelve un error, THEN THE `SettingsScreen` SHALL restaurar el botón "Eliminar cuenta" a su estado habilitado para permitir un nuevo intento.

---

### Requirement 6: Sección "Zona de Peligro" en SettingsScreen

**User Story:** Como usuario de la app móvil, quiero ver el botón de eliminar cuenta claramente diferenciado del resto de opciones de configuración, para entender que es una acción destructiva e irreversible.

#### Acceptance Criteria

1. THE `SettingsScreen` SHALL mostrar una sección "Zona de Peligro" al final del contenido desplazable, visualmente separada de las secciones de configuración existentes.
2. THE `SettingsScreen` SHALL mostrar dentro de la sección "Zona de Peligro" un botón con la etiqueta "Eliminar cuenta" estilizado con colores de error/peligro (rojo) para distinguirlo visualmente de los controles de configuración normales.
3. THE `SettingsScreen` SHALL mostrar dentro de la sección "Zona de Peligro" un texto descriptivo en español que advierta al usuario que la eliminación de la cuenta es permanente e irreversible.
4. WHERE el usuario no está autenticado con una sesión activa, THE `SettingsScreen` SHALL ocultar la sección "Zona de Peligro".
