<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reconocimiento de Lectura Bíblica</title>
    <style>
        body {
            font-family: sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f8f5f0;
        }

        .wrapper {
            width: 100%;
            background-color: #f8f5f0;
            padding: 2rem 0;
        }

        .email-container {
            max-width: 580px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 16px rgba(0,0,0,0.08);
        }

        /* Header */
        .header {
            background: linear-gradient(135deg, rgb(152, 101, 53) 0%, #d6a21e 50%, rgb(152, 101, 53) 100%);
            padding: 2rem 1.5rem 1.5rem;
            text-align: center;
        }

        .logo-chip {
            width: 72px;
            height: 72px;
            border-radius: 36px;
            background-color: #ffffff;
            margin: 0 auto 0.6rem;
            text-align: center;
            line-height: 72px;
        }

        .logo-chip img {
            width: 48px;
            height: auto;
            vertical-align: middle;
        }

        .header-name {
            font-size: 1.3rem;
            font-weight: bold;
            letter-spacing: 0.08em;
            color: #ffffff;
            margin: 0;
        }

        /* Gold accent bar */
        .accent-bar {
            height: 4px;
            background: linear-gradient(90deg, #d6a21e, #ffd700, #d6a21e);
        }

        /* Body */
        .body {
            padding: 2rem 2.5rem;
            text-align: center;
        }

        .greeting-label {
            font-size: 0.7rem;
            letter-spacing: 0.2em;
            text-transform: uppercase;
            color: rgb(152, 101, 53);
            font-weight: bold;
            margin: 0 0 0.5rem;
        }

        .greeting-name {
            font-size: 1.6rem;
            font-weight: bold;
            color: #333;
            margin: 0 0 1.25rem;
        }

        .divider {
            width: 60px;
            height: 2px;
            background: linear-gradient(90deg, transparent, #d6a21e, transparent);
            margin: 0 auto 1.25rem;
        }

        .message {
            font-size: 0.95rem;
            color: #4b5563;
            line-height: 1.7;
            margin: 0 0 1.5rem;
        }

        /* Big celebratory day count */
        .count-hero {
            margin: 1.5rem 0 0.5rem;
        }

        .count-number {
            font-size: 4rem;
            font-weight: bold;
            line-height: 1;
            color: #d6a21e;
            margin: 0;
        }

        .count-caption {
            font-size: 0.9rem;
            color: #7a6240;
            margin: 0.25rem 0 0;
        }

        /* Badge */
        .badge-wrapper {
            margin: 1.25rem 0;
        }

        .badge {
            display: inline-block;
            font-size: 0.95rem;
            font-weight: bold;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            padding: 0.5rem 2rem;
            border-radius: 4px;
        }

        .gold {
            background: linear-gradient(135deg, #ffd700, #d6a21e, #ffb700);
            color: #5c4813;
            box-shadow: 0 2px 8px rgba(214,162,30,0.4);
        }

        .silver {
            background: linear-gradient(135deg, #e8e8e8, #c0c0c0, #e0e0e0);
            color: #3a3a3a;
            box-shadow: 0 2px 8px rgba(160,160,160,0.4);
        }

        .bronze {
            background: linear-gradient(135deg, #e09a5a, #cd7f32, #d98c45);
            color: #3d1f0a;
            box-shadow: 0 2px 8px rgba(180,100,40,0.35);
        }

        .days-note {
            font-size: 0.8rem;
            color: #9ca3af;
            margin: 0.4rem 0 0;
        }

        /* Verse block */
        .verse {
            background-color: #f8f5f0;
            border-left: 4px solid #d6a21e;
            border-radius: 0 6px 6px 0;
            padding: 1rem 1.25rem;
            text-align: left;
            margin: 1.5rem 0;
        }

        .verse p {
            font-style: italic;
            font-size: 0.875rem;
            color: #4b5563;
            line-height: 1.6;
            margin: 0 0 0.4rem;
        }

        .verse span {
            font-size: 0.75rem;
            font-style: normal;
            font-weight: bold;
            color: rgb(152, 101, 53);
        }

        /* Attachment notice */
        .attachment-notice {
            background-color: #fffbeb;
            border: 1px solid #fde68a;
            border-radius: 6px;
            padding: 0.75rem 1rem;
            font-size: 0.8rem;
            color: #92400e;
            margin-top: 1rem;
        }

        /* Footer */
        .footer {
            background-color: #f3f0eb;
            border-top: 1px solid #e9dcc4;
            padding: 1.25rem 2rem;
            text-align: center;
        }

        .footer-ministry {
            font-size: 0.95rem;
            font-weight: bold;
            color: rgb(152, 101, 53);
            letter-spacing: 0.05em;
            margin: 0;
        }
    </style>
</head>
<body>
<div class="wrapper">
    <div class="email-container">

        <!-- Header -->
        <div class="header">
            <div class="logo-chip">
                <img src="{{ config('brand.logo_data_uri') }}" alt="gRafé">
            </div>
            <p class="header-name">{{ config('brand.name') }}</p>
        </div>

        <div class="accent-bar"></div>

        <!-- Body -->
        <div class="body">
            @php
                $translations = ['gold' => 'Oro', 'silver' => 'Plata', 'bronze' => 'Bronce'];
                $category = strtolower($award->category);
                $categoryName = $translations[$category] ?? ucfirst($category);
                $monthName = \Carbon\Carbon::parse($award->month_date)->locale('es')->monthName;
                $isBibleMonth = \Carbon\Carbon::parse($award->month_date)->month === 8;
            @endphp

            <p class="greeting-label">¡Lo lograste, {{ $award->user->name }}!</p>
            <p class="greeting-name">Reconocimiento de {{ $categoryName }}</p>
            <div class="divider"></div>

            <div class="count-hero">
                <p class="count-number">{{ $award->days_count }}</p>
                <p class="count-caption">días de lectura completados en {{ $monthName }}</p>
            </div>

            <div class="badge-wrapper">
                <span class="badge {{ $category }}">Categoría {{ $categoryName }}</span>
            </div>

            <p class="message">
                Tu constancia en {{ $monthName }} es un testimonio vivo de fe y amor por Dios.
                ¡Sigue así!
            </p>

            @if ($isBibleMonth)
            <div style="background-color:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:0.9rem 1.25rem;margin:0 0 1.5rem;text-align:center;">
                <p style="margin:0 0 0.3rem;font-size:0.7rem;letter-spacing:0.18em;text-transform:uppercase;color:#92400e;font-weight:bold;">Mes de la Biblia</p>
                <p style="margin:0;font-size:0.88rem;color:#78350f;line-height:1.55;">Este agosto celebramos la Palabra de Dios. Completar el plan este mes tiene un significado especial — gracias por leer, meditar y perseverar.</p>
            </div>
            @endif

            <div class="verse">
                <p>"Nunca se apartará de tu boca este libro de la ley, sino que de día y de noche meditarás en él."</p>
                <span>— Josué 1:8</span>
            </div>

            <div class="attachment-notice">
                🏅 Adjuntamos tu certificado de reconocimiento en PDF.
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p class="footer-ministry">{{ config('brand.name') }}</p>
        </div>

    </div>
</div>
</body>
</html>
