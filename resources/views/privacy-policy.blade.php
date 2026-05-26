<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Política de Privacidad - {{ config('app.name', 'Lectura') }}</title>
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
        .last-updated {
            color: #6b7280;
            font-size: 0.875rem;
            margin-bottom: 2rem;
        }
        p, li {
            color: #4b5563;
            margin-bottom: 1rem;
        }
        ul {
            padding-left: 1.5rem;
        }
        li {
            margin-bottom: 0.5rem;
        }
        .contact-info {
            background-color: #f3f4f6;
            border-radius: 8px;
            padding: 1rem;
            margin-top: 1rem;
        }
        a {
            color: #986535;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <h1>Política de Privacidad</h1>
            <p class="last-updated">Última actualización: {{ now()->format('d/m/Y') }}</p>

            <p>
                Bienvenido a <strong>{{ config('app.name', 'Lectura') }}</strong>. Esta política de privacidad describe cómo recopilamos, 
                usamos y protegemos tu información personal cuando utilizas nuestra aplicación móvil.
            </p>

            <h2>1. Información que Recopilamos</h2>
            <p>Recopilamos la siguiente información cuando usas nuestra aplicación:</p>
            <ul>
                <li><strong>Información de cuenta:</strong> Nombre, dirección de correo electrónico cuando te registras o inicias sesión con Google.</li>
                <li><strong>Datos de uso:</strong> Respuestas a las preguntas diarias de lectura bíblica y tu progreso en la aplicación.</li>
                <li><strong>Información del dispositivo:</strong> Tipo de dispositivo, sistema operativo y versión de la aplicación para mejorar la compatibilidad.</li>
            </ul>

            <h2>2. Cómo Usamos tu Información</h2>
            <p>Utilizamos la información recopilada para:</p>
            <ul>
                <li>Proporcionar y mantener el servicio de la aplicación.</li>
                <li>Guardar tu progreso de lectura y respuestas.</li>
                <li>Generar certificados de reconocimiento mensual.</li>
                <li>Mejorar y personalizar tu experiencia en la aplicación.</li>
                <li>Comunicarnos contigo sobre actualizaciones importantes del servicio.</li>
            </ul>

            <h2>3. Almacenamiento y Seguridad de Datos</h2>
            <p>
                Tu información se almacena de forma segura en servidores protegidos. Implementamos medidas de seguridad 
                técnicas y organizativas para proteger tus datos personales contra acceso no autorizado, pérdida o alteración.
            </p>

            <h2>4. Compartir Información</h2>
            <p>
                <strong>No vendemos ni compartimos tu información personal con terceros</strong> para fines de marketing. 
                Solo compartimos información en los siguientes casos:
            </p>
            <ul>
                <li>Con tu consentimiento explícito.</li>
                <li>Para cumplir con obligaciones legales.</li>
                <li>Con proveedores de servicios que nos ayudan a operar la aplicación (como servicios de almacenamiento en la nube), 
                    quienes están obligados a proteger tu información.</li>
            </ul>

            <h2>5. Servicios de Terceros</h2>
            <p>Nuestra aplicación utiliza los siguientes servicios de terceros:</p>
            <ul>
                <li><strong>Firebase Authentication:</strong> Para gestionar el inicio de sesión seguro. 
                    <a href="https://firebase.google.com/support/privacy" target="_blank">Política de privacidad de Firebase</a>.</li>
                <li><strong>Google Sign-In:</strong> Para facilitar el acceso con tu cuenta de Google. 
                    <a href="https://policies.google.com/privacy" target="_blank">Política de privacidad de Google</a>.</li>
            </ul>

            <h2>6. Tus Derechos</h2>
            <p>Tienes derecho a:</p>
            <ul>
                <li>Acceder a tus datos personales.</li>
                <li>Solicitar la corrección de datos inexactos.</li>
                <li>Solicitar la eliminación de tu cuenta y datos asociados.</li>
                <li>Retirar tu consentimiento en cualquier momento.</li>
            </ul>

            <h2>7. Privacidad de Menores</h2>
            <p>
                Nuestra aplicación está diseñada para usuarios de todas las edades. No recopilamos intencionalmente 
                información personal de niños menores de 13 años sin el consentimiento verificable de sus padres o tutores. 
                Si eres padre o tutor y crees que tu hijo nos ha proporcionado información personal, contáctanos para 
                que podamos tomar las medidas necesarias.
            </p>

            <h2>8. Retención de Datos</h2>
            <p>
                Conservamos tu información personal mientras mantengas una cuenta activa en nuestra aplicación. 
                Si solicitas la eliminación de tu cuenta, eliminaremos tus datos personales en un plazo de 30 días, 
                excepto cuando la ley nos exija conservarlos por más tiempo.
            </p>

            <h2>9. Cambios a esta Política</h2>
            <p>
                Podemos actualizar esta política de privacidad ocasionalmente. Te notificaremos sobre cambios 
                significativos a través de la aplicación o por correo electrónico. Te recomendamos revisar esta 
                política periódicamente.
            </p>

            <h2>10. Contacto</h2>
            <p>
                Si tienes preguntas sobre esta política de privacidad o sobre cómo manejamos tus datos, 
                puedes contactarnos:
            </p>
            <div class="contact-info">
                <p><strong>Correo electrónico:</strong> iglesiareydereyestoto@gmail.com</p>
            </div>
        </div>
    </div>
</body>
</html>
