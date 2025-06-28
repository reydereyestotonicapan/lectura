<?php

namespace App\Http\Controllers;

use App\Models\Day;

class WelcomeController extends Controller
{
    public function index()
    {
        $today = now();
        $dates = [
            $today->format('Y-m-d'),
            $today->subDay()->format('Y-m-d'),
            $today->subDays(2)->format('Y-m-d')
        ];

        $days = Day::with('questions')
            ->whereIn('date_assigned', $dates)
            ->get()
            ->keyBy(fn($day) => $day->date_assigned->format('Y-m-d'));

        $currentDay = $days[now()->format('Y-m-d')] ?? null;
        $yesterday = $days[now()->subDay()->format('Y-m-d')] ?? null;
        $dayBeforeYesterday = $days[now()->subDays(2)->format('Y-m-d')] ?? null;

        $data = [
            'readingChapters' => $currentDay?->chapters,
            'currentReadableDate' => $currentDay?->date_assigned?->locale('es')->isoFormat('D [de] MMMM [de] YYYY'),
            'questions' => $currentDay?->questions->pluck('question')->toArray() ?? [],
            'chaptersYesterday' => $yesterday?->chapters ?? 'No disponible',
            'chaptersDayBeforeYesterday' => $dayBeforeYesterday?->chapters ?? 'No disponible',
            'dayId' => $currentDay?->id,
        ];

        return view('welcome', compact('data'));
    }
}
