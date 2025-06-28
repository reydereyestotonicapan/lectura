<!DOCTYPE html>
    <html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Lectura</title>
        @if (file_exists(public_path('build/manifest.json')) || file_exists(public_path('hot')))
            @vite(['resources/css/app.css', 'resources/js/app.js'])
        @endif
        <link href="https://fonts.googleapis.com/css2?family=Material+Icons+Outlined" rel="stylesheet"/>
    </head>
    <body class="flex justify-center items-start min-h-screen py-8">
        <div class="bg-white shadow-lg rounded-xl p-6 w-full max-w-md mx-4">
            <div class="text-center mb-8">
                <span class="material-icons-outlined icon-crown mb-4">
                    menu_book
                </span>
                <h1 class="text-1xl font-semibold text-gray-800">Lectura del día</h1>
            </div>
            @if($data['readingChapters'])
            <div>
                <div class="text-center text-gray-700 space-y-2 mb-8">
                    <p class="text-4xl font-bold text-gray-900 mt-1 mb-2">{{$data['readingChapters']}}</p>
                    <p class="text-gray-400 text-lg">{{$data['currentReadableDate']}}</p>
                </div>
                <div class="text-center text-gray-700 space-y-2 mb-8">
                    @foreach($data['questions'] as $question)
                    <p>{{ $question }}</p>
                    @endforeach
                </div>
                <div class="text-center mb-10">
                    <p class="text-gray-400 mb-2 text-sm">¿Te gustaría responder?</p>
                    <a href="{{ \App\Filament\Pages\DailyResponse::getUrl(['day_id' => $data['dayId']]) }}"
                       class="bg-[rgb(var(--color-primary))] text-white font-bold py-4 px-8 rounded-lg text-2xl w-full hover:opacity-90 transition-opacity block text-center">
                        Responder
                    </a>
                </div>
            </div>
            @else
                <div class="text-center">
                    <p class="text-gray-400 text-lg">Lectura del día pendiente de asignar</p>
                </div>
            @endif
            <div class="mt-8 pt-6 border-t border-gray-200">
                <h2 class="text-xl font-semibold text-gray-800 text-center mb-6">Lecturas anteriores</h2>
                <div class="space-y-4">
                    <div class="flex justify-between items-center text-gray-700">
                        <span class="font-medium">Día</span>
                        <span class="font-medium">Lectura</span>
                    </div>
                    <div class="flex justify-between items-center text-gray-600">
                        <span>Ayer</span>
                        <span> {{$data['chaptersYesterday'] }} </span>
                    </div>
                    <div class="flex justify-between items-center text-gray-600">
                        <span>Anteayer</span>
                        <span>{{$data['chaptersDayBeforeYesterday']}}</span>
                    </div>
                </div>
            </div>
        </div>
    </body>
</html>
