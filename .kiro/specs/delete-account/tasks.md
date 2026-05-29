# Implementation Plan: delete-account

## Overview

Implementar la funcionalidad de eliminación de cuenta en tres capas: el endpoint `DELETE /api/account` en Laravel (con eliminación en cascada, revocación de tokens Sanctum y eliminación best-effort en Firebase), la función `deleteAccount` en la capa de API y en `AuthContext` de la app móvil, y la sección "Zona de Peligro" en `SettingsScreen` con diálogo de confirmación, estados de carga y manejo de errores.

## Tasks

- [x] 1. Crear `DeleteAccountController` en el backend Laravel
  - Crear `app/Http/Controllers/Api/DeleteAccountController.php` siguiendo el mismo patrón que `AuthController` (inyección de `Kreait\Firebase\Contract\Auth` en el constructor)
  - Implementar el método `destroy(Request $request): JsonResponse` que: (1) revoca todos los tokens Sanctum con `$user->tokens()->delete()`, (2) elimina el usuario de Firebase con best-effort (captura `\Throwable`, registra con `Log::error()` y continúa), (3) elimina el registro con `$user->delete()`, (4) devuelve HTTP 200 con `{"message": "Cuenta eliminada correctamente."}`
  - Verificar en las migraciones existentes que las FKs de `responses` y `user_chapter_progress` tienen `ON DELETE CASCADE`; si alguna no lo tiene, añadir eliminación explícita de relaciones antes de `$user->delete()`
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

- [x] 2. Registrar la ruta y escribir tests del backend
  - [x] 2.1 Añadir la ruta `Route::delete('/account', [DeleteAccountController::class, 'destroy'])` dentro del grupo `auth:sanctum` en `routes/api.php`
    - _Requirements: 1.1_

  - [ ]* 2.2 Escribir tests de propiedad para `DeleteAccountController` en `tests/Feature/Api/DeleteAccountTest.php`
    - **Property 1: Eliminación completa del usuario y sus datos**
    - Usar `RefreshDatabase`, mockear `Kreait\Firebase\Contract\Auth` con Mockery (igual que en `AuthTest.php`)
    - Cubrir: request no autenticado → 401; eliminación exitosa → 200 + mensaje JSON + usuario ausente en DB + tokens eliminados; usuario con `firebase_uid` → `deleteUser()` llamado; usuario sin `firebase_uid` → SDK no llamado; Firebase SDK lanza → usuario eliminado igualmente, 200 devuelto, error registrado; usuario con `responses` y `user_chapter_progress` → todos los registros relacionados eliminados
    - **Validates: Requirements 1.2, 1.5**

- [x] 3. Checkpoint — Verificar backend
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Añadir `deleteAccount` a la capa de API móvil
  - [x] 4.1 Añadir la función `deleteAccount` en `mobile/src/api/auth.ts` siguiendo el mismo patrón que `emailLogin` y `firebaseLogin`
    - La función debe hacer `await client.delete('/account')` y devolver `Promise<void>`
    - El token Sanctum se incluye automáticamente por el interceptor existente en `client.ts`
    - Los errores HTTP deben propagarse al llamador (comportamiento por defecto de Axios)
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ]* 4.2 Escribir tests unitarios para `deleteAccount` en la capa de API
    - Verificar que `deleteAccount()` realiza `DELETE /account`
    - Verificar que los errores HTTP se propagan al llamador
    - _Requirements: 2.1, 2.3_

- [x] 5. Añadir `deleteAccount` a `AuthContext`
  - [x] 5.1 Actualizar la interfaz `AuthState` en `mobile/src/auth/AuthContext.tsx` para incluir `deleteAccount: () => Promise<void>`
    - Implementar `deleteAccount` en `AuthProvider`: llamar primero a `apiDeleteAccount()` (importada desde `../api/auth`); solo si tiene éxito, llamar a `signOut()`; si `apiDeleteAccount()` lanza, propagar el error sin limpiar la sesión
    - Exponer `deleteAccount` en el value del `AuthContext.Provider`
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ]* 5.2 Escribir tests unitarios para `AuthContext.deleteAccount`
    - Verificar que llama a la API y luego a `signOut()` en éxito
    - Verificar que propaga el error sin llamar a `signOut()` en fallo
    - _Requirements: 3.2, 3.3_

- [x] 6. Implementar la sección "Zona de Peligro" en `SettingsScreen`
  - [x] 6.1 Añadir estado local `isDeleting` y obtener `deleteAccount` e `isAuthenticated` de `useAuth()` en `mobile/src/screens/SettingsScreen.tsx`
    - Implementar `handleDeleteAccount` que muestra `Alert.alert` con título "Eliminar cuenta", mensaje de advertencia en español sobre la irreversibilidad, opción "Cancelar" (style: cancel) y opción "Eliminar cuenta" (style: destructive) que llama a `confirmDelete`
    - Implementar `confirmDelete` que: (1) llama a `setIsDeleting(true)`, (2) llama a `await deleteAccount()`, (3) en error muestra `Alert.alert` con mensaje de error en español, (4) en el bloque `finally` llama a `setIsDeleting(false)`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.3, 5.4_

  - [x] 6.2 Renderizar la sección "Zona de Peligro" condicionalmente al final del `ScrollView` (después del `tipsCard`)
    - Envolver en `{isAuthenticated && (...)}` para ocultarla cuando el usuario no está autenticado
    - Incluir `SectionHeader` con title="Zona de Peligro" y subtitle="Acciones permanentes e irreversibles"
    - Incluir `View` con `dangerCard` que contenga el texto de advertencia en español y el `TouchableOpacity` del botón "Eliminar cuenta"
    - El botón debe mostrar `ActivityIndicator` cuando `isDeleting` es `true`, y el texto "Eliminar cuenta" cuando es `false`
    - Aplicar `disabled={isDeleting}` al botón de eliminar cuenta
    - _Requirements: 5.1, 6.1, 6.2, 6.3, 6.4_

  - [x] 6.3 Deshabilitar los controles interactivos existentes durante la eliminación
    - Añadir `disabled={isDeleting}` a los `TouchableOpacity` de selección de tema (en `themeRow`) y de fuente de lectura (en `optionsWrap`)
    - _Requirements: 5.2_

  - [x] 6.4 Añadir los estilos de la "Zona de Peligro" a `createStyles`
    - Añadir `dangerSection`, `dangerCard`, `dangerWarning`, `dangerButton`, `dangerButtonDisabled` y `dangerButtonText` usando los tokens del sistema de diseño existente (`colors.error`, `colors.errorBg`, `colors.errorBorder`, `colors.textInverse`, `Radii.xl`, `Radii.lg`)
    - _Requirements: 6.1, 6.2_

  - [ ]* 6.5 Escribir tests de componente para `SettingsScreen`
    - **Property 2: La Zona de Peligro no se muestra a usuarios no autenticados**
    - Verificar que el `Alert` de confirmación muestra el texto en español correcto
    - Verificar que el botón se deshabilita durante la carga (`isDeleting = true`)
    - Verificar que se muestra el `Alert` de error en español si `deleteAccount` falla
    - Verificar que la sección "Zona de Peligro" no aparece cuando `isAuthenticated` es `false`
    - **Validates: Requirements 6.4**

- [x] 7. Checkpoint final — Verificar implementación completa
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia requisitos específicos para trazabilidad
- La eliminación de Firebase es best-effort: un fallo en el SDK no impide la eliminación del registro en Laravel
- La sesión local solo se limpia tras recibir una respuesta exitosa del servidor
- Los checkpoints aseguran validación incremental entre backend y frontend

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["2.2", "4.1"] },
    { "id": 3, "tasks": ["4.2", "5.1"] },
    { "id": 4, "tasks": ["5.2", "6.1"] },
    { "id": 5, "tasks": ["6.2", "6.3", "6.4"] },
    { "id": 6, "tasks": ["6.5"] }
  ]
}
```
