# Design Document: delete-account

## Overview

Esta funcionalidad añade un endpoint `DELETE /api/account` al backend Laravel y la UI correspondiente en la app móvil React Native para que los usuarios puedan eliminar permanentemente su cuenta. La eliminación es un hard delete en cascada: se borran todos los datos relacionados del usuario en MySQL, se revocan los tokens de Sanctum y se elimina la cuenta de Firebase mediante el Admin SDK (`kreait/firebase-php`). La UI está completamente en español y sigue los patrones visuales y de código existentes en el proyecto.

---

## Architecture

El flujo de eliminación atraviesa tres capas:

```
SettingsScreen (React Native)
  └─► AuthContext.deleteAccount()
        └─► api/auth.ts deleteAccount()  ──► DELETE /api/account
                                               └─► DeleteAccountController
                                                     ├─► $user->tokens()->delete()
                                                     ├─► $user->delete()  (cascade)
                                                     └─► Firebase Admin SDK (best-effort)
```

**Principios de diseño:**
- La eliminación de Firebase es *best-effort*: si falla, se registra el error pero la eliminación de Laravel continúa y se devuelve éxito al cliente.
- La sesión local (Google Sign-In, Firebase, token Sanctum) se limpia **solo** tras recibir una respuesta exitosa del servidor.
- El botón de eliminar cuenta se deshabilita durante el proceso para evitar solicitudes duplicadas.

---

## Components and Interfaces

### Backend

#### `DeleteAccountController`

**Ubicación:** `app/Http/Controllers/Api/DeleteAccountController.php`

Sigue exactamente el mismo patrón que `AuthController`: recibe `Kreait\Firebase\Contract\Auth` por inyección de dependencias en el constructor.

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Kreait\Firebase\Contract\Auth;

class DeleteAccountController extends Controller
{
    public function __construct(private readonly Auth $auth) {}

    public function destroy(Request $request): JsonResponse
    {
        $user = $request->user();

        // 1. Revocar todos los tokens de Sanctum activos
        $user->tokens()->delete();

        // 2. Eliminar cuenta de Firebase (best-effort)
        if ($user->firebase_uid) {
            try {
                $this->auth->deleteUser($user->firebase_uid);
            } catch (\Throwable $e) {
                Log::error('DeleteAccountController: Firebase deletion failed', [
                    'user_id'      => $user->id,
                    'firebase_uid' => $user->firebase_uid,
                    'error'        => $e->getMessage(),
                ]);
            }
        }

        // 3. Eliminar el registro del usuario (cascade en DB)
        $user->delete();

        return response()->json(['message' => 'Cuenta eliminada correctamente.']);
    }
}
```

#### Ruta

Se añade dentro del grupo `auth:sanctum` existente en `routes/api.php`:

```php
Route::delete('/account', [DeleteAccountController::class, 'destroy']);
```

#### Eliminación en cascada

Los datos relacionados del usuario se eliminan mediante dos mecanismos complementarios:

| Tabla | Mecanismo |
|---|---|
| `personal_access_tokens` | `$user->tokens()->delete()` explícito antes de `$user->delete()` |
| `responses` | `ON DELETE CASCADE` en la FK `user_id` de la migración existente |
| `user_chapter_progress` | `ON DELETE CASCADE` en la FK `user_id` de la migración existente |
| `model_has_roles` (Spatie) | `ON DELETE CASCADE` en la FK `model_id` de la migración de Spatie |

> **Nota:** Si alguna FK no tiene `CASCADE` definido en la migración, el controlador deberá eliminar esas relaciones explícitamente antes de `$user->delete()`. Se recomienda verificar las migraciones durante la implementación.

---

### Mobile — API Layer

#### `mobile/src/api/auth.ts` — función `deleteAccount`

Se añade al archivo existente siguiendo el mismo patrón de `emailLogin` y `firebaseLogin`:

```typescript
export async function deleteAccount(): Promise<void> {
  await client.delete('/account');
}
```

El token de Sanctum se incluye automáticamente por el interceptor de request existente en `client.ts`. Los errores HTTP se propagan al llamador por el comportamiento por defecto de Axios.

---

### Mobile — AuthContext

#### `mobile/src/auth/AuthContext.tsx` — función `deleteAccount`

Se añade `deleteAccount` a la interfaz `AuthState` y a la implementación del provider:

```typescript
// En la interfaz AuthState:
deleteAccount: () => Promise<void>;

// En AuthProvider:
const deleteAccount = async () => {
  await apiDeleteAccount(); // lanza si falla — no limpiar sesión
  await signOut();          // solo si la API tuvo éxito
};
```

**Flujo de error:** si `apiDeleteAccount()` lanza, el error se propaga al llamador (`SettingsScreen`) sin ejecutar `signOut()`, preservando la sesión local intacta.

---

### Mobile — SettingsScreen

#### Sección "Zona de Peligro"

Se añade al final del `ScrollView` existente, después del `tipsCard`. La sección incluye:

1. Un separador visual y el encabezado "Zona de Peligro" usando `SectionHeader`.
2. Un texto de advertencia en español.
3. Un botón rojo "Eliminar cuenta".

La sección completa se oculta cuando `isAuthenticated` es `false`.

```tsx
// Estado local en SettingsScreen
const [isDeleting, setIsDeleting] = useState(false);
const { deleteAccount, isAuthenticated } = useAuth();

const handleDeleteAccount = () => {
  Alert.alert(
    'Eliminar cuenta',
    'Esta acción es permanente e irreversible. Se eliminarán todos tus datos y no podrás recuperar tu cuenta.',
    [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar cuenta',
        style: 'destructive',
        onPress: confirmDelete,
      },
    ],
  );
};

const confirmDelete = async () => {
  setIsDeleting(true);
  try {
    await deleteAccount();
    // AuthContext.signOut() navega automáticamente al login
  } catch {
    Alert.alert(
      'Error',
      'No fue posible eliminar la cuenta. Por favor, inténtalo de nuevo.',
    );
  } finally {
    setIsDeleting(false);
  }
};
```

**Renderizado condicional de la Zona de Peligro:**

```tsx
{isAuthenticated && (
  <>
    <SectionHeader
      title="Zona de Peligro"
      subtitle="Acciones permanentes e irreversibles"
      style={styles.dangerSection}
    />
    <View style={styles.dangerCard}>
      <Text style={styles.dangerWarning}>
        Eliminar tu cuenta borrará permanentemente todos tus datos, incluyendo tu historial de lecturas y respuestas. Esta acción no se puede deshacer.
      </Text>
      <TouchableOpacity
        style={[styles.dangerButton, isDeleting && styles.dangerButtonDisabled]}
        onPress={handleDeleteAccount}
        disabled={isDeleting}
        activeOpacity={0.8}
      >
        {isDeleting
          ? <ActivityIndicator color={colors.textInverse} size="small" />
          : <Text style={styles.dangerButtonText}>Eliminar cuenta</Text>
        }
      </TouchableOpacity>
    </View>
  </>
)}
```

**Estilos relevantes** (usando tokens del sistema de diseño existente):

```typescript
dangerSection: { marginBottom: 20, marginTop: 32 },
dangerCard: {
  backgroundColor: colors.errorBg,
  borderRadius: Radii.xl,
  padding: 16,
  borderWidth: 1,
  borderColor: colors.errorBorder,
  gap: 16,
},
dangerWarning: {
  fontSize: 13,
  color: colors.error,
  lineHeight: 20,
},
dangerButton: {
  backgroundColor: colors.error,
  borderRadius: Radii.lg,
  paddingVertical: 14,
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 48,
},
dangerButtonDisabled: { opacity: 0.6 },
dangerButtonText: {
  color: colors.textInverse,
  fontSize: 15,
  fontWeight: '700',
},
```

**Deshabilitar controles durante la eliminación:** el prop `disabled={isDeleting}` se aplica también a los `TouchableOpacity` de selección de tema y fuente de lectura para cumplir el requisito 5.2.

---

## Data Models

No se crean nuevos modelos ni migraciones. El modelo `User` existente ya tiene las relaciones necesarias:

```php
// User.php — relaciones existentes
public function responses(): HasMany      { return $this->hasMany(Response::class); }
public function chapterProgress(): HasMany { return $this->hasMany(UserChapterProgress::class); }
```

Los tokens de Sanctum se gestionan a través del trait `HasApiTokens` ya presente en el modelo.

---

## Interfaces

### API Contract

**Request:**
```
DELETE /api/account
Authorization: Bearer {sanctum_token}
```

**Response (éxito):**
```json
HTTP 200
{
  "message": "Cuenta eliminada correctamente."
}
```

**Response (no autenticado):**
```json
HTTP 401
{
  "message": "Unauthenticated."
}
```

### TypeScript — actualización de `AuthState`

```typescript
interface AuthState {
  // ... campos existentes ...
  deleteAccount: () => Promise<void>;
}
```

---

## Error Handling

| Escenario | Comportamiento |
|---|---|
| Token Sanctum inválido/expirado | Middleware `auth:sanctum` devuelve 401 automáticamente |
| Firebase SDK lanza excepción | Se registra con `Log::error()`, la eliminación de Laravel continúa, se devuelve 200 |
| Error de base de datos en `$user->delete()` | Laravel devuelve 500; la sesión local no se limpia |
| Error de red en la app móvil | `deleteAccount()` en AuthContext lanza; SettingsScreen muestra Alert de error en español; botón se re-habilita |
| Usuario pulsa "Cancelar" en el diálogo | No se realiza ninguna acción |

---

## Testing Strategy

### Backend (Pest PHP)

Los tests siguen el patrón de `tests/Feature/Api/AuthTest.php`: usan `RefreshDatabase`, mockean `Kreait\Firebase\Contract\Auth` con Mockery, y actúan como usuario autenticado con `actingAs()`.

**Archivo:** `tests/Feature/Api/DeleteAccountTest.php`

Casos a cubrir:
- Unauthenticated request → 401
- Successful delete → 200 + JSON message + user absent from DB + tokens deleted
- User with firebase_uid → Firebase SDK `deleteUser()` called
- User without firebase_uid → Firebase SDK not called
- Firebase SDK throws → user still deleted, 200 returned, error logged
- User with responses and chapter progress → all related records deleted

### Mobile (Jest / React Native Testing Library)

Los tests de la capa móvil son example-based dado que prueban interacciones UI y flujos de contexto deterministas.

Casos a cubrir:
- `deleteAccount()` en `api/auth.ts` hace DELETE a `/account`
- `AuthContext.deleteAccount()` llama a la API y luego a `signOut()` en éxito
- `AuthContext.deleteAccount()` propaga el error sin llamar a `signOut()` en fallo
- `SettingsScreen` muestra Alert con texto en español al pulsar el botón
- `SettingsScreen` deshabilita el botón durante la carga
- `SettingsScreen` muestra Alert de error en español si `deleteAccount` falla
- `SettingsScreen` oculta la Zona de Peligro cuando `isAuthenticated` es false

---

## Correctness Properties

*Una propiedad es una característica o comportamiento que debe mantenerse verdadero en todas las ejecuciones válidas del sistema — esencialmente, una declaración formal sobre lo que el sistema debe hacer. Las propiedades sirven como puente entre las especificaciones legibles por humanos y las garantías de corrección verificables por máquinas.*

### Property 1: Eliminación completa del usuario y sus datos

*Para cualquier* usuario autenticado con cualquier combinación de tokens de Sanctum activos, respuestas y registros de progreso de capítulos, tras una llamada exitosa a `DELETE /api/account`, el usuario y todos sus datos relacionados (tokens, respuestas, progreso) deben estar ausentes de la base de datos.

**Validates: Requirements 1.2, 1.5**

### Property 2: La Zona de Peligro no se muestra a usuarios no autenticados

*Para cualquier* estado de la `SettingsScreen` en el que `isAuthenticated` sea `false`, la sección "Zona de Peligro" y el botón "Eliminar cuenta" no deben estar presentes en el árbol de componentes renderizado.

**Validates: Requirements 6.4**
