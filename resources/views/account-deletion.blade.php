<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Eliminación de Cuenta - {{ config('app.name', 'Lectura') }}</title>
    @if (file_exists(public_path('build/manifest.json')) || file_exists(public_path('hot')))
        @vite(['resources/css/app.css', 'resources/js/app.js'])
    @endif
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f9fafb;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem 1rem;
        }
        .card {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            padding: 2rem;
        }
        h1 {
            color: #1f2937;
            font-size: 2rem;
            margin-bottom: 0.5rem;
        }
        h2 {
            color: #374151;
            font-size: 1.25rem;
            margin-top: 2rem;
            margin-bottom: 1rem;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 0.5rem;
        }
        .subtitle {
            color: #6b7280;
            font-size: 0.875rem;
            margin-bottom: 2rem;
        }
        p, li {
            color: #4b5563;
            margin-bottom: 1rem;
        }
        ul, ol {
            padding-left: 1.5rem;
        }
        li {
            margin-bottom: 0.5rem;
        }
        .steps {
            background-color: #fef3c7;
            border: 1px solid #fcd34d;
            border-radius: 8px;
            padding: 1.5rem;
            margin: 1.5rem 0;
        }
        .steps ol {
            margin: 0;
            padding-left: 1.5rem;
        }
        .steps li {
            color: #92400e;
            font-weight: 500;
        }
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
        }
        .data-table th {
            background-color: #f3f4f6;
            padding: 10px 14px;
            text-align: left;
            font-size: 0.875rem;
            color: #374151;
            border: 1px solid #e5e7eb;
        }
        .data-table td {
            padding: 10px 14px;
            font-size: 0.875rem;
            color: #4b5563;
            border: 1px solid #e5e7eb;
            vertical-align: top;
        }
        .badge-deleted {
            background-color: #fee2e2;
            color: #991b1b;
            padding: 2px 8px;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 600;
        }
        .badge-kept {
            background-color: #fef3c7;
            color: #92400e;
            padding: 2px 8px;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 600;
        }
        .contact-box {
            background-color: #f3f4f6;
            border-radius: 8px;
            padding: 1.25rem;
            margin-top: 1rem;
        }
        .contact-box a {
            color: #986535;
            font-weight: 600;
        }
        .warning {
            background-color: #fee2e2;
            border: 1px solid #fca5a5;
            border-radius: 8px;
            padding: 1rem 1.25rem;
            margin: 1rem 0;
            color: #991b1b;
        }
        a { color: #986535; }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <h1>Eliminación de Cuenta</h1>
            <p class="subtitle">{{ config('app.name', 'Lectura') }} — Solicitud de eliminación de cuenta y datos</p>

            <p>
                Si deseas eliminar tu cuenta de <strong>{{ config('app.name', 'Lectura') }}</strong> y todos los datos 
                asociados, puedes hacerlo siguiendo los pasos indicados a continuación o contactándonos directamente.
            </p>

            <div class="warning">
                ⚠️ <strong>Esta acción es irreversible.</strong> Una vez eliminada tu cuenta, no podrás recuperar 
                tu historial de respuestas, progreso de lectura ni reconocimientos obtenidos.
            </div>

            <h2>Cómo solicitar la eliminación de tu cuenta</h2>

            <div class="steps">
                <p style="color: #92400e; font-weight: 700; margin-bottom: 0.75rem;">Opción 1 — Por correo electrónico:</p>
                <ol>
                    <li>Envía un correo a <a href="mailto:iglesiareydereyestoto@gmail.com">iglesiareydereyestoto@gmail.com</a></li>
                    <li>Usa el asunto: <strong>"Solicitud de eliminación de cuenta"</strong></li>
                    <li>Incluye el correo electrónico asociado a tu cuenta</li>
                    <li>Procesaremos tu solicitud en un plazo máximo de <strong>30 días</strong></li>
                </ol>
            </div>

            <h2>Datos que se eliminan</h2>
            <p>Al eliminar tu cuenta, se eliminarán permanentemente los siguientes datos:</p>

            <table class="data-table">
                <thead>
                    <tr>
                        <th>Tipo de dato</th>
                        <th>Acción</th>
                        <th>Plazo</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Nombre y correo electrónico</td>
                        <td><span class="badge-deleted">Eliminado</span></td>
                        <td>Inmediato</td>
                    </tr>
                    <tr>
                        <td>Historial de respuestas al quiz</td>
                        <td><span class="badge-deleted">Eliminado</span></td>
                        <td>Inmediato</td>
                    </tr>
                    <tr>
                        <td>Progreso de lectura</td>
                        <td><span class="badge-deleted">Eliminado</span></td>
                        <td>Inmediato</td>
                    </tr>
                    <tr>
                        <td>Certificados de reconocimiento (PDF)</td>
                        <td><span class="badge-kept">Retenido 30 días</span></td>
                        <td>Eliminado a los 30 días</td>
                    </tr>
                    <tr>
                        <td>Tokens de autenticación</td>
                        <td><span class="badge-deleted">Eliminado</span></td>
                        <td>Inmediato</td>
                    </tr>
                </tbody>
            </table>

            <h2>Período de retención</h2>
            <p>
                Los certificados de reconocimiento mensual (archivos PDF almacenados en la nube) se conservan 
                durante un máximo de <strong>30 días</strong> adicionales tras la eliminación de la cuenta, 
                después de los cuales son eliminados permanentemente de nuestros servidores.
            </p>
            <p>
                El resto de tus datos personales se eliminan de forma inmediata una vez procesada la solicitud.
            </p>

            <h2>Contacto</h2>
            <p>Para cualquier duda sobre el proceso de eliminación de cuenta:</p>
            <div class="contact-box">
                <p style="margin:0">
                    📧 <strong>Correo:</strong> 
                    <a href="mailto:iglesiareydereyestoto@gmail.com">
                        iglesiareydereyestoto@gmail.com
                    </a>
                </p>
            </div>

            <p style="margin-top: 1.5rem;">
                <a href="{{ route('privacy-policy') }}">← Ver Política de Privacidad</a>
            </p>
        </div>
    </div>
</body>
</html>
