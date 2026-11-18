<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificado de Lectura Bíblica - gRafé</title>
    <style>
        @page {
            margin: 0;
        }

        * {
            box-sizing: border-box;
        }

        html, body {
            margin: 0;
            padding: 0;
        }

        /* Built-in Helvetica (sans-serif) — embeds no font, so the PDF stays
           small and low-memory. It covers Latin accents (á, í, ó…). Avoid
           glyphs outside Latin-1 (★, ✝) as they'd need a heavy embedded font. */
        body {
            font-family: sans-serif;
            color: #fffdf8;
        }

        /* Full-bleed brand gold. An absolutely-positioned layer sized to the
           Letter page paints the whole background but stays out of flow, so it
           doesn't spill a blank second page.
           NOTE: a full-page CSS gradient makes DomPDF render thousands of
           rectangles (~1.3 MB PDF, ~75 MB RAM) and blows the queue worker's
           128 MB limit, so this uses a solid brand gold instead. */
        .bg {
            position: absolute;
            top: 0;
            left: 0;
            width: 8.5in;
            height: 11in;
            background-color: #c28c1a;
        }

        .stage {
            position: relative;
            width: 100%;
            padding: 2.75rem 3rem;
            text-align: center;
        }

        /* Brand header */
        .brand {
            position: relative;
        }

        /* White chip so the gRafé logo pops on the gold background */
        .logo-chip {
            width: 84px;
            height: 84px;
            border-radius: 42px;
            background-color: #fffdf8;
            margin: 0 auto 0.7rem;
            text-align: center;
            box-shadow: 0 6px 18px rgba(60, 40, 10, 0.25);
        }

        .logo-chip img {
            width: 58px;
            height: auto;
            margin-top: 18px;
        }

        .brand-name {
            font-size: 1.35rem;
            font-weight: bold;
            letter-spacing: 0.14em;
            color: #fffdf8;
            margin: 0;
        }

        .plan-label {
            font-size: 0.66rem;
            letter-spacing: 0.32em;
            text-transform: uppercase;
            color: rgba(255, 253, 248, 0.75);
            margin: 1.75rem 0 0.4rem;
        }

        .title {
            font-size: 1.35rem;
            font-weight: bold;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            margin: 0 0 1.5rem;
            color: #fffdf8;
        }

        /* The hero medal — category */
        .medal {
            width: 158px;
            height: 158px;
            border-radius: 79px;
            margin: 0 auto;
            text-align: center;
            /* thick brand-cream ring around the category color */
            border: 6px solid rgba(255, 253, 248, 0.9);
            box-shadow: 0 10px 30px rgba(60, 40, 10, 0.35);
        }

        .medal-inner {
            display: block;
            padding-top: 58px;
        }

        .medal-category {
            font-size: 1.9rem;
            font-weight: bold;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            margin: 0;
            line-height: 1;
        }

        /* Category color themes for the medal — solid fills keep the PDF light */
        .gold {
            background-color: #edc23c;
        }
        .gold .medal-category { color: #5c4813; }

        .silver {
            background-color: #d0d0d0;
        }
        .silver .medal-category { color: #3a3a3a; }

        .bronze {
            background-color: #c67b34;
        }
        .bronze .medal-category { color: #3d1f0a; }

        /* Big day count — the exciting focal number */
        .count {
            font-size: 5.5rem;
            font-weight: bold;
            line-height: 1;
            margin: 1.25rem 0 0;
            color: #fffdf8;
        }

        .count-label {
            font-size: 0.95rem;
            letter-spacing: 0.06em;
            color: rgba(255, 253, 248, 0.92);
            margin: 0.25rem 0 0;
        }

        /* Reader */
        .granted {
            font-size: 0.72rem;
            letter-spacing: 0.22em;
            text-transform: uppercase;
            color: rgba(255, 253, 248, 0.78);
            margin: 1.75rem 0 0.35rem;
        }

        .reader {
            font-size: 2.1rem;
            font-weight: bold;
            color: #fffdf8;
            margin: 0 auto;
            padding: 0 0 0.5rem;
            border-bottom: 2px solid rgba(255, 253, 248, 0.55);
            display: inline-block;
        }

        /* Verse */
        .verse {
            max-width: 480px;
            margin: 1.75rem auto 0;
            padding: 1.1rem 1.4rem;
            background: rgba(255, 253, 248, 0.14);
            border-left: 4px solid rgba(255, 253, 248, 0.85);
            border-radius: 0 8px 8px 0;
            text-align: left;
            font-style: italic;
            font-size: 0.92rem;
            line-height: 1.6;
            color: #fffdf8;
        }

        .verse-ref {
            display: block;
            margin-top: 0.5rem;
            font-style: normal;
            font-weight: bold;
            font-size: 0.75rem;
            letter-spacing: 0.05em;
            color: rgba(255, 253, 248, 0.9);
        }

        /* Footer — issue date only, centered */
        .footer {
            max-width: 420px;
            margin: 1.75rem auto 0;
            border-top: 1px solid rgba(255, 253, 248, 0.3);
            padding-top: 1.1rem;
            font-size: 0.8rem;
            color: rgba(255, 253, 248, 0.9);
        }

        .footer .label {
            font-size: 0.62rem;
            letter-spacing: 0.14em;
            text-transform: uppercase;
            color: rgba(255, 253, 248, 0.7);
            margin: 0 0 0.2rem;
        }

        /* Bible Month banner — only rendered in August */
        .bible-month-banner {
            display: inline-block;
            margin: 0.6rem auto 1.1rem;
            padding: 0.3rem 1.1rem;
            border: 1px solid rgba(255, 253, 248, 0.7);
            border-radius: 20px;
            font-size: 0.62rem;
            letter-spacing: 0.22em;
            text-transform: uppercase;
            color: rgba(255, 253, 248, 0.9);
        }
    </style>
</head>
<body>
@php
    $translations = ['gold' => 'Oro', 'silver' => 'Plata', 'bronze' => 'Bronce'];
    $category = strtolower($award->category);
    $categoryName = $translations[$category] ?? ucfirst($category);
    // Month comes from the award itself, never from now(), so a certificate
    // generated late still shows the month it was actually earned.
    $awardDate = \Carbon\Carbon::parse($award->month_date)->locale('es');
    $monthName = $awardDate->monthName;
    $isBibleMonth = $awardDate->month === 8;
@endphp
<div class="bg"></div>
<div class="stage">

    <!-- Brand -->
    <div class="brand">
        <div class="logo-chip">
            <img src="{{ config('brand.logo_data_uri') }}" alt="gRafé">
        </div>
        <p class="brand-name">{{ config('brand.name') }}</p>
    </div>

    <!-- Category hero -->
    <p class="plan-label">Plan de Lectura Bíblica &bull; {{ $monthName }}</p>
    @if ($isBibleMonth)
        <span class="bible-month-banner">Mes de la Biblia</span>
    @endif
    <h1 class="title">Reconocimiento de {{ $categoryName }}</h1>

    <div class="medal {{ $category }}">
        <span class="medal-inner">
            <span class="medal-category">{{ $categoryName }}</span>
        </span>
    </div>

    <!-- Exciting day count -->
    <p class="count">{{ $award->days_count }}</p>
    <p class="count-label">días de lectura completados en {{ $monthName }}</p>

    <!-- Reader -->
    <p class="granted">Otorgado con alegría a</p>
    <p class="reader">{{ $award->user->name }}</p>

    <!-- Verse -->
    <div class="verse">
        "Nunca se apartará de tu boca este libro de la ley, sino que de día y de noche meditarás en él."
        <span class="verse-ref">— Josué 1:8</span>
    </div>

    <!-- Footer -->
    <div class="footer">
        <p class="label">Fecha de emisión</p>
        Totonicapán,
        {{ $awardDate->day }} de
        {{ $monthName }} de
        {{ $awardDate->year }}
    </div>

</div>
</body>
</html>
