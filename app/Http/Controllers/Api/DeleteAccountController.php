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

        // 3. Eliminar relaciones sin CASCADE explícito antes de borrar el usuario
        // Las tablas `responses` y `awards` no tienen ON DELETE CASCADE en su FK user_id.
        // `user_chapter_progress` sí tiene CASCADE, por lo que se elimina automáticamente.
        $user->responses()->delete();
        $user->awards()->delete();

        // 4. Eliminar el registro del usuario (user_chapter_progress tiene CASCADE en DB)
        $user->delete();

        return response()->json(['message' => 'Cuenta eliminada correctamente.']);
    }
}
