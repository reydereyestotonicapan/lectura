<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificado de Lectura Bíblica - Iglesia de Dios pentecostés del Rey de reyes</title>
    <style>
        body {
            font-family: sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f8f5f0;
        }

        .container {
            width: 90%;
            max-width: 700px;
            margin: 2rem auto;
        }

        /* Outer frame */
        .outer-frame {
            background: linear-gradient(135deg, rgb(152, 101, 53) 0%, #d6a21e 40%, #ffb700 60%, rgb(152, 101, 53) 100%);
            padding: 8px;
            border-radius: 14px;
        }

        /* Inner certificate */
        .certificate {
            background-color: #fffdf8;
            border-radius: 8px;
            padding: 2.5rem 2.5rem 2rem;
            position: relative;
            overflow: hidden;
        }

        /* Watermark cross */
        .certificate::before {
            content: "✝";
            position: absolute;
            font-size: 18rem;
            color: rgba(214, 162, 30, 0.05);
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            pointer-events: none;
            line-height: 1;
        }

        /* Header band */
        .header-band {
            background: linear-gradient(90deg, rgb(152, 101, 53), #d6a21e, rgb(152, 101, 53));
            margin: -2.5rem -2.5rem 0;
            padding: 1.5rem 2rem;
            text-align: center;
            position: relative;
        }

        .church-logo {
            display: block;
            margin: 0 auto 0.75rem;
            width: 70px;
            height: auto;
        }

        .church-name {
            font-size: 0.75rem;
            font-weight: bold;
            color: rgba(255, 255, 255, 0.85);
            letter-spacing: 0.12em;
            text-transform: uppercase;
            margin: 0;
        }

        /* Ornamental divider */
        .divider {
            display: flex;
            align-items: center;
            margin: 1.5rem 0;
            gap: 0.75rem;
        }

        .divider-line {
            flex: 1;
            height: 1px;
            background: linear-gradient(90deg, transparent, #d6a21e, transparent);
        }

        .divider-diamond {
            width: 8px;
            height: 8px;
            background: #d6a21e;
            transform: rotate(45deg);
            flex-shrink: 0;
        }

        /* Body content */
        .body {
            text-align: center;
            padding-top: 1.75rem;
            position: relative;
        }

        .label {
            font-size: 0.7rem;
            letter-spacing: 0.2em;
            text-transform: uppercase;
            color: rgb(152, 101, 53);
            font-weight: bold;
            margin: 0 0 0.25rem;
        }

        .main-title {
            font-size: 2rem;
            font-weight: bold;
            color: rgb(152, 101, 53);
            margin: 0 0 0.25rem;
            letter-spacing: 0.04em;
        }

        .subtitle {
            font-size: 0.9rem;
            color: #7a6240;
            margin: 0 0 1.5rem;
            font-style: italic;
        }

        .presents-to {
            font-size: 0.875rem;
            color: #6b7280;
            margin: 0 0 0.5rem;
        }

        .reader-name {
            font-size: 1.75rem;
            font-weight: bold;
            color: #333;
            margin: 0.25rem 0 0.25rem;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid #d6a21e;
            display: inline-block;
        }

        .reason {
            font-size: 0.875rem;
            color: #4b5563;
            max-width: 420px;
            margin: 1.25rem auto 1rem;
            line-height: 1.6;
        }

        /* Achievement ribbon */
        .ribbon-wrapper {
            display: inline-block;
            position: relative;
            margin: 0.5rem 0 1.25rem;
        }

        .achievement {
            font-size: 1.1rem;
            font-weight: bold;
            padding: 0.6rem 2.5rem;
            border-radius: 4px;
            display: inline-block;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            position: relative;
        }

        .gold {
            background: linear-gradient(135deg, #ffd700, #d6a21e, #ffb700);
            color: #5c4813;
            box-shadow: 0 2px 8px rgba(214, 162, 30, 0.5);
        }

        .silver {
            background: linear-gradient(135deg, #e8e8e8, #c0c0c0, #e0e0e0);
            color: #3a3a3a;
            box-shadow: 0 2px 8px rgba(160, 160, 160, 0.5);
        }

        .bronze {
            background: linear-gradient(135deg, #e09a5a, #cd7f32, #d98c45);
            color: #3d1f0a;
            box-shadow: 0 2px 8px rgba(180, 100, 40, 0.4);
        }

        .days-count {
            font-size: 0.8rem;
            color: #7a6240;
            margin: 0.25rem 0 0;
        }

        /* Bible verse */
        .verse {
            font-style: italic;
            margin: 1.25rem auto;
            max-width: 460px;
            padding: 1rem 1.5rem;
            background-color: #f8f5f0;
            border-left: 4px solid #d6a21e;
            color: #4b5563;
            text-align: left;
            font-size: 0.9rem;
            line-height: 1.6;
            border-radius: 0 6px 6px 0;
        }

        .verse-ref {
            display: block;
            margin-top: 0.5rem;
            font-style: normal;
            font-size: 0.75rem;
            color: rgb(152, 101, 53);
            font-weight: bold;
        }

        /* Footer section inside certificate */
        .cert-footer {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 1.75rem;
            padding-top: 1rem;
            border-top: 1px solid #e9dcc4;
            gap: 1rem;
        }

        .date-section {
            text-align: left;
        }

        .date-label {
            font-size: 0.65rem;
            letter-spacing: 0.15em;
            text-transform: uppercase;
            color: #9ca3af;
            margin: 0 0 0.2rem;
        }

        .date-value {
            font-size: 0.85rem;
            color: #4b5563;
            margin: 0;
        }

        .signature-section {
            text-align: center;
        }

        .signature-dots {
            border-bottom: 1.5px dotted #d6a21e;
            width: 160px;
            margin-bottom: 0.3rem;
        }

        .signature-title {
            font-size: 0.75rem;
            color: rgb(152, 101, 53);
            font-weight: bold;
            letter-spacing: 0.05em;
            margin: 0;
        }

        .signature-subtitle {
            font-size: 0.65rem;
            color: #9ca3af;
            margin: 0;
        }

        /* Small footer below outer frame */
        .page-footer {
            text-align: center;
            color: #9ca3af;
            font-size: 0.7rem;
            margin-top: 1rem;
            padding-bottom: 2rem;
        }
    </style>
</head>
<body>
<div class="container">

    <div class="outer-frame">
        <div class="certificate">

            <!-- Header band -->
            <div class="header-band">
                <img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyBpZD0iQ2FwYV8xIiBkYXRhLW5hbWU9IkNhcGEgMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiB2aWV3Qm94PSIwIDAgMjUwIDE1MCI+CiAgPGRlZnM+CiAgICA8c3R5bGU+CiAgICAgIC5jbHMtMSB7CiAgICAgICAgZmlsbDogdXJsKCNsaW5lYXItZ3JhZGllbnQpOwogICAgICAgIHN0cm9rZS13aWR0aDogMHB4OwogICAgICB9CiAgICA8L3N0eWxlPgogICAgPGxpbmVhckdyYWRpZW50IGlkPSJsaW5lYXItZ3JhZGllbnQiIHgxPSI0LjAzIiB5MT0iNzUiIHgyPSIyNDUuOTciIHkyPSI3NSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiNmZGUxOWMiLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIuMzQiIHN0b3AtY29sb3I9IiNkOWI1NzciLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjOTg2NTM1Ii8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Ik0yNDUuOTMsNTAuMTdjMC0uMjgtLjAyLS41Ni0uMDctLjg1di0uMThjLS4wMi0uMTItLjA1LS4yNS0uMDktLjM5LS44NS00LjY5LTQuNTUtOC4zOC05LjI2LTkuMTktLjE5LS4wNC0uMzktLjA5LS41OC0uMTFoLS4wOWMtLjgzLS4wOS0xLjY5LS4xMS0yLjU2LDBoLS4wNGMtLjA5LDAtLjE2LjA0LS4yMy4wNS0uNDQuMDUtLjg2LjE0LTEuMjkuMjUtLjAyLDAtLjA0LjAyLS4wNy4wMi0uMTQuMDQtLjI2LjA3LS40MS4xMS0uMDQuMDItLjA3LjAyLS4xMi4wNC0uNDQuMTQtLjg2LjMtMS4yOS40OS0uMDQuMDItLjA3LjA0LS4xMi4wNS0uMDUuMDQtLjEyLjA3LS4xOC4xMS0uMTEuMDUtLjIxLjExLS4zNC4xNi0uMjUuMTQtLjUxLjMtLjc2LjQ2LS4wOS4wNS0uMTguMTEtLjI2LjE4LS4wNy4wNS0uMTYuMTEtLjIzLjE2LS4wNy4wNS0uMTYuMTEtLjI1LjE2LS4yOC4yMy0uNTYuNDYtLjg1LjcxLS4wNy4wNy0uMTQuMTQtLjIxLjIxLS4wMi4wMi0uMDQuMDUtLjA3LjA3bC0uMzIuMzJjLS4xNC4xNC0uMjYuMy0uMzkuNDQtLjA3LjA5LS4xNC4xOS0uMjEuMjgtLjE5LjI1LS4zNy41MS0uNTYuNzgtLjA5LjEyLS4xOS4yNS0uMjguMzktLjA0LjA3LS4wNy4xMi0uMTEuMTktLjA1LjA5LS4wOS4xOC0uMTQuMjgtLjE0LjI1LS4yNS40OS0uMzcuNzYtLjEyLjI4LS4yNS41NS0uMzUuODVzLS4xOS42Mi0uMjguOTRjLS4wNC4xNC0uMDkuMjYtLjEyLjQxLDAsLjAyLS4wMi4wNS0uMDIuMDctLjA1LjI4LS4xNC41NS0uMTkuODMtLjY0LDQuNjQsMS41NSw4LjgyLDUuMDYsMTEuMTIuNTYuMzkuNTUsMS4yLS4wNCwxLjU1bC0xMzQuNTQsNzcuNjlIMjMuNzJjLTEuNjgsMC0zLjAzLTEuMzYtMy4wMy0zLjAzdi02My4wNGw3NS43Niw0My43NmMxLjYxLjkyLDMuNTguOTIsNS4yMSwwLDMuNDktMi4wMSwzLjQ5LTcuMDQsMC05LjA1bC0yOS42NC0xNy4xMiw1Mi43Mi01Mi43NCwzOC41NSwzOC41NWMxLjczLDEuNzEsNC40MywyLjIyLDYuNTEuOTksMi45NS0xLjczLDMuNDgtNS43NywxLjA2LTguMTlsLTQwLjM5LTQwLjM5YzIuNzktMS4xMyw1LjE1LTMuMDMsNi44My01LjQ5LDEuNjgtMi40MywyLjY1LTUuNCwyLjY1LTguNTlDMTM5Ljk0LDYuNjgsMTMyLjktLjIyLDEyNC4zMSwwYy03LjgzLjIxLTE0LjQsNi42My0xNC43OSwxNC40NS0uMzIsNi43LDMuNzEsMTIuNTEsOS40OSwxNC44NGwtNTYuMzYsNTYuMzctNDAuOTMtMjMuOGMtLjU2LS4zNS0uNi0xLjE2LS4wMi0xLjU1LDMuNTEtMi4yOSw1LjY4LTYuNDgsNS4wNS0xMS4xMi0uMDQtLjI2LS4xMS0uNDktLjE4LS43NC0uMTEtLjYtLjI4LTEuMTUtLjQ5LTEuNzEtLjA0LS4wNy0uMDctLjE2LS4xMS0uMjUtMS41Mi0zLjcyLTQuOTItNi40Ni05LjAzLTctLjA3LS4wMi0uMTQtLjA0LS4xOS0uMDRoLS4wOWMtLjcyLS4wOS0xLjQ4LS4wOS0yLjI2LS4wMmgtLjA3cy0uMDksMC0uMTIuMDJoLS4xNGMtLjA1LjAyLS4xMS4wMi0uMTguMDQtLjI1LjA0LS41MS4wNy0uNzYuMTRoLS4wNGMtLjA5LjAyLS4xOC4wNS0uMjYuMDctLjE4LjA1LS4zNy4wOS0uNTUuMTYtMy42MywxLjA0LTYuNTEsMy44MS03LjY4LDcuMzl2LjAyYy0uMjMuNjItLjM5LDEuMjUtLjQ4LDEuODktLjAyLjA0LS4wMi4wOS0uMDIuMTQtLjA1LjQ5LS4wOS45Ny0uMDksMS40NSwwLC4xNiwwLC4zMi4wMi40OS4wMi4zNS4wNC43MS4wOSwxLjA2LjAyLjE5LjA1LjM3LjA5LjU1LjA1LjMyLjEyLjYyLjIxLjkyLjA1LjIxLjExLjQxLjE2LjYuMDkuMjUuMTkuNDkuMy43Mi4yMS41NS40OCwxLjA2Ljc2LDEuNTQuMDQuMDUuMDUuMTEuMDkuMTYuMjEuMzIuNDIuNjQuNjcuOTQuMDQuMDQuMDUuMDkuMDkuMTIuNzkuOTksMS43MywxLjg3LDIuODIsMi41Ni4wOS4wNS4xNi4xMi4yMy4xOS4zNy4zNC42Mi43OC42MiwxLjI3djc3LjY5YzAsNS43Nyw0LjY4LDEwLjQ1LDEwLjQ1LDEwLjQ1aDIwOC43N2M1Ljc3LDAsMTAuNDMtNC42OCwxMC40My0xMC40NVY2MS44N2MwLS42LjM1LTEuMTMuODUtMS40NiwxLjc4LTEuMTMsMy4yMS0yLjcyLDQuMTMtNC42MS4wNS0uMDkuMDktLjE2LjEyLS4yMy4xMi0uMjguMjUtLjU2LjM1LS44NS4wNS0uMTguMTItLjM1LjE4LS41My4wNy0uMjMuMTQtLjQ2LjE5LS43MS4wNy0uMjUuMTEtLjQ5LjE2LS43Ni4wNC0uMTkuMDctLjM5LjA5LS42LjA0LS4zLjA1LS42Mi4wNy0uOTIsMC0uMTQuMDItLjI4LjAyLS40MnYtLjEyYzAtLjE2LS4wMi0uMzItLjA0LS40OVpNMTE3LjYyLDE4LjAyYy0yLjE1LTUuOTEsMi44OC0xMS40NSw4LjctMTAuMjUsMi45My42LDUuMjksMi45Niw1Ljg2LDUuOTEuOTUsNC44OS0yLjczLDkuMTItNy40NSw5LjE0LTEuNTcsMC0zLjA3LS40OC00LjMyLTEuMzEtMS4yNS0uODMtMi4yNi0yLjAzLTIuNzktMy40OVpNMjAuNiw1My4yYy0uNjUsMS4zOC0xLjg0LDIuNDUtMy4yNiwyLjk2LS4wOS4wNC0uMTguMDctLjI2LjA5LS4xOC4wNS0uMzcuMDktLjU2LjEyLS4xNi4wNC0uMy4wNy0uNDYuMDktLjA5LDAtLjE4LDAtLjI2LjAyaC0uNmMtLjM0LS4wMi0uNjctLjA1LS45OS0uMTQtLjExLS4wMi0uMTktLjA0LS4yOC0uMDctLjE2LS4wNC0uMzItLjA5LS40Ni0uMTQtLjU4LS4yMS0xLjExLS41MS0xLjU3LS45Mi0uMDIsMC0uMDQtLjAyLS4wNS0uMDItMS41OS0xLjMyLTIuNDUtMy40Mi0xLjkxLTUuNzUuNDEtMS44MywxLjc4LTMuMzcsMy41NS00LjAxdC4wNC0uMDJjLjIzLS4wOS40Ni0uMTQuNjktLjE5LjA5LS4wMi4xNi0uMDQuMjUtLjA0LjE0LS4wNC4zLS4wNS40NC0uMDcuMTQtLjAyLjI2LS4wMi40MS0uMDIuMDksMCwuMTktLjAyLjMtLjAyLjM5LjAyLjc4LjA3LDEuMTUuMTYuMDUuMDIuMTIuMDQuMTguMDUuMTYuMDQuMy4wOS40NC4xNC4wNy4wMi4xNC4wNC4xOS4wNy4xNC4wNS4yOC4xMi40Mi4xOS4wNS4wMi4xMi4wNS4xOS4wOS4xMi4wNy4yNS4xNi4zNy4yMy4wNy4wNC4xMi4wOS4xOC4xMi4xMi4wOS4yNS4xOC4zNy4yOC4wNS4wNC4wOS4wOS4xNC4xMi4xMi4xMS4yMy4yMS4zNC4zNC4wNC4wMi4wNS4wNC4wNy4wNS4zNy40Mi42OS45Ljk0LDEuNDEuMDQuMDQuMDUuMDkuMDcuMTIuMDcuMTYuMTIuMy4xOC40Ni4wMi4wNS4wNC4xMS4wNS4xOC4wNS4xNi4wOS4zMi4xMi40OC4wMi4wNS4wNC4xMS4wNC4xNi4wNC4xOC4wNS4zNS4wNy41NSwwLC4wNC4wMi4wNy4wMi4xMSwwLC4yMS4wMi40MSwwLC42di4wMmMtLjAyLjQ2LS4wOS45Mi0uMjEsMS4zOS0uMDcuMjgtLjE4LjU1LS4zLjc5Wk0yMjkuMzEsMTM2LjUyYzAsMS42OC0xLjM2LDMuMDMtMy4wNSwzLjAzaC0xMTEuNjlsMTE0Ljc0LTY2LjA4djYzLjA0Wk0yMzguMTUsNTUuMnMtLjAyLjAyLS4wNC4wMmMtLjQ4LjQxLS45OS43MS0xLjU3LjkyLS4xOC4wNy0uMzQuMTEtLjUxLjE2LS4wNy4wMi0uMTQuMDQtLjIxLjA1LS4zNS4wOS0uNjkuMTItMS4wNi4xNGgtLjQ5Yy0uMDcsMC0uMTItLjAyLS4xOS0uMDJoLS4xNmMtLjExLS4wMi0uMTktLjA0LS4yOC0uMDUtLjI2LS4wNS0uNTEtLjA5LS43Ni0uMThoLS4wNWMtLjEyLS4wNS0uMjUtLjEyLS4zNy0uMTgtLjIzLS4wOS0uNDYtLjE4LS42Ny0uMy0uMTQtLjA5LS4yNi0uMTgtLjQxLS4yNi0uMTQtLjExLS4yOC0uMTktLjQxLS4zLS4xNi0uMTQtLjMyLS4yNi0uNDYtLjQyLS4wNy0uMDctLjE2LS4xOC0uMjMtLjI2LS4xNi0uMTgtLjMyLS4zNS0uNDQtLjU2LS4wNS0uMDUtLjA3LS4xMi0uMTItLjE4LS4yOC0uNDgtLjUxLTEuMDEtLjY3LTEuNTUtLjAyLS4xMS0uMDQtLjIxLS4wNy0uMy0uMDItLjE2LS4wNS0uMzItLjA3LS40OS0uMzctMy4zOSwyLjIyLTYuMjMsNS41MS02LjMzLjA5LDAsLjE5LjAyLjMuMDIuMTIsMCwuMjUsMCwuMzkuMDIuMTYuMDIuMzIuMDQuNDkuMDcuMDUsMCwuMTIuMDIuMTguMDQuMjUuMDUuNDkuMTEuNzIuMTloLjAyYzEuNzYuNjUsMy4xNiwyLjE5LDMuNTYsNC4wMi41MywyLjMzLS4zNCw0LjQzLTEuOTIsNS43NVoiLz4KPC9zdmc+" alt="Corona" class="church-logo">
                <p class="church-name">Iglesia de Dios Pentecostés del Rey de Reyes</p>
            </div>

            <!-- Body -->
            <div class="body">
                <p class="label">Plan de Lectura Bíblica</p>
                <h1 class="main-title">Reconocimiento</h1>
                <p class="subtitle">Por esfuerzo en la lectura de la Palabra de Dios</p>

                <div class="divider">
                    <div class="divider-line"></div>
                    <div class="divider-diamond"></div>
                    <div class="divider-line"></div>
                </div>

                <p class="presents-to">Se otorga a:</p>
                <p class="reader-name">{{ $award->user->name }}</p>

                <p class="reason">
                    Por su destacada participación en el plan de lectura bíblica durante el mes de
                    <strong>{{ \Carbon\Carbon::now()->locale('es')->monthName }}</strong>,
                    alcanzando la categoría:
                </p>

                <div class="ribbon-wrapper">
                    <span class="achievement {{ strtolower($award->category) }}">
                        @php
                            $translations = ['gold' => 'Oro', 'silver' => 'Plata', 'bronze' => 'Bronce'];
                            $category = strtolower($award->category);
                            echo $translations[$category] ?? ucfirst($category);
                        @endphp
                    </span>
                    <p class="days-count">{{ $award->days_count }} días de lectura completados</p>
                </div>

                <div class="verse">
                    "El cielo y la tierra pasarán, pero mis palabras jamás pasarán."
                    <span class="verse-ref">— Mateo 24:35</span>
                </div>

                <div class="cert-footer">
                    <div class="date-section">
                        <p class="date-label">Fecha de emisión</p>
                        <p class="date-value">
                            Totonicapán,
                            {{ \Carbon\Carbon::now()->locale('es')->day }} de
                            {{ \Carbon\Carbon::now()->locale('es')->monthName }} de
                            {{ \Carbon\Carbon::now()->year }}
                        </p>
                    </div>
                    <div class="signature-section">
                        <div class="signature-dots"></div>
                        <p class="signature-title">Ministerio de Lectura</p>
                        <p class="signature-subtitle">Iglesia de Dios Pentecostés del Rey de Reyes</p>
                    </div>
                </div>
            </div>

        </div>
    </div>

    <p class="page-footer">Totonicapán, Guatemala &mdash; {{ \Carbon\Carbon::now()->year }}</p>
</div>
</body>
</html>
