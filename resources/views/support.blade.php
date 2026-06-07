<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Soporte - {{ config('app.name', 'Lectura') }}</title>
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
        .faq {
            background-color: #f3f4f6;
            border-radius: 8px;
            padding: 1.25rem 1.5rem;
            margin: 1rem 0;
        }
        .faq strong {
            color: #1f2937;
        }
        .contact-box {
            background-color: #fef3c7;
            border: 1px solid #fcd34d;
            border-radius: 8px;
            padding: 1.25rem;
            margin-top: 1rem;
        }
        .contact-box p {
            color: #92400e;
        }
        .contact-box a {
            color: #986535;
            font-weight: 600;
        }
        a { color: #986535; }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <h1>Soporte</h1>
            <p class="subtitle">gRafé— Centro de ayuda y contacto</p>

            <p>
                ¿Necesitas ayuda con <strong>gRafé</strong>? Estamos para
                acompañarte. Revisa las preguntas frecuentes a continuación o escríbenos directamente y
                con gusto te ayudaremos.
            </p>

            <h2>Preguntas frecuentes</h2>

            <div class="faq">
                <p style="margin:0 0 0.5rem"><strong>¿Cómo accedo a mi lectura del día?</strong></p>
                <p style="margin:0">Abre la app e inicia sesión. En la pantalla principal encontrarás los
                    capítulos asignados para hoy y el cuestionario correspondiente.</p>
            </div>

            <div class="faq">
                <p style="margin:0 0 0.5rem"><strong>No recibo las notificaciones diarias</strong></p>
                <p style="margin:0">Verifica que las notificaciones estén activadas en los ajustes de tu
                    teléfono para gRafé, y que la app cuente con permiso para enviarte avisos.</p>
            </div>

            <div class="faq">
                <p style="margin:0 0 0.5rem"><strong>Olvidé mi contraseña</strong></p>
                <p style="margin:0">En la pantalla de inicio de sesión toca «¿Olvidaste tu contraseña?»
                    para recibir un enlace de restablecimiento en tu correo. También puedes ingresar con
                    Apple o Google.</p>
            </div>

            <div class="faq">
                <p style="margin:0 0 0.5rem"><strong>¿Cómo elimino mi cuenta?</strong></p>
                <p style="margin:0">Consulta nuestra página de
                    <a href="{{ route('account-deletion') }}">Eliminación de Cuenta</a> para conocer el
                    proceso.</p>
            </div>

            <h2>Contáctanos</h2>
            <p>Si tu pregunta no aparece arriba, escríbenos por cualquiera de estos medios:</p>
            <div class="contact-box">
                <p style="margin:0 0 0.5rem">
                    📧 <strong>Correo:</strong>
                    <a href="mailto:iglesiareydereyes298@gmail.com">iglesiareydereyes298@gmail.com</a>
                </p>
                <p style="margin:0">
                    📘 <strong>Facebook:</strong>
                    <a href="https://www.facebook.com/reydereyestoto" target="_blank" rel="noopener">
                        facebook.com/reydereyestoto
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
