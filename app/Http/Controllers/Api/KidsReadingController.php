<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WeeklyKidsReading;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class KidsReadingController extends Controller
{
    /**
     * Return a paginated list of published weekly kids readings.
     *
     * Validates: Requirements 6.1, 6.5, 6.6, 4.3
     */
    public function index(): JsonResponse
    {
        $readings = WeeklyKidsReading::published()
            ->ordered()
            ->paginate(20);

        $currentWeek = now()->isoWeek();
        $currentYear = now()->year;

        return response()->json([
            'data' => $readings->map(fn ($reading) => [
                'id' => $reading->id,
                'week_number' => $reading->week_number,
                'year' => $reading->year,
                'week_label' => $reading->week_label,
                'title' => $reading->title,
                'passage' => $reading->passage,
                'description' => $reading->description,
                'has_pdf' => ! empty($reading->pdf_path),
                'is_current' => $reading->week_number === $currentWeek
                    && $reading->year === $currentYear,
            ]),
            'meta' => [
                'current_page' => $readings->currentPage(),
                'last_page' => $readings->lastPage(),
                'per_page' => $readings->perPage(),
                'total' => $readings->total(),
            ],
        ]);
    }

    /**
     * Return details for a single published weekly kids reading.
     *
     * Validates: Requirements 6.3, 6.5
     */
    public function show(WeeklyKidsReading $reading): JsonResponse
    {
        if (! $reading->is_published) {
            return response()->json(['message' => 'Reading not found'], 404);
        }

        $currentWeek = now()->isoWeek();
        $currentYear = now()->year;

        return response()->json([
            'data' => [
                'id' => $reading->id,
                'week_number' => $reading->week_number,
                'year' => $reading->year,
                'week_label' => $reading->week_label,
                'title' => $reading->title,
                'passage' => $reading->passage,
                'description' => $reading->description,
                'has_pdf' => ! empty($reading->pdf_path),
                'is_current' => $reading->week_number === $currentWeek
                    && $reading->year === $currentYear,
            ],
        ]);
    }

    /**
     * Return a signed URL for downloading the PDF.
     *
     * Validates: Requirements 5.2, 5.4, 5.5
     */
    public function download(WeeklyKidsReading $reading): JsonResponse
    {
        if (! $reading->is_published) {
            return response()->json(['message' => 'Reading not found'], 404);
        }

        if (empty($reading->pdf_path)) {
            return response()->json(['message' => 'No PDF available'], 404);
        }

        $url = Storage::disk('s3')->temporaryUrl(
            $reading->pdf_path,
            now()->addMinutes(30)
        );

        return response()->json(['url' => $url]);
    }

    /**
     * Return the current week's reading or the most recent published reading as fallback.
     *
     * Validates: Requirements 6.2, 8.1, 8.2, 8.3
     */
    public function current(): JsonResponse
    {
        // Try to find reading for current ISO week and year
        $reading = WeeklyKidsReading::published()
            ->currentWeek()
            ->first();

        // Fallback: get most recent published reading
        if (! $reading) {
            $reading = WeeklyKidsReading::published()
                ->ordered()
                ->first();
        }

        // Return 404 only if no published readings exist at all
        if (! $reading) {
            return response()->json(['message' => 'Reading not found'], 404);
        }

        $currentWeek = now()->isoWeek();
        $currentYear = now()->year;

        return response()->json([
            'data' => [
                'id' => $reading->id,
                'week_number' => $reading->week_number,
                'year' => $reading->year,
                'week_label' => $reading->week_label,
                'title' => $reading->title,
                'passage' => $reading->passage,
                'description' => $reading->description,
                'has_pdf' => ! empty($reading->pdf_path),
                'is_current' => $reading->week_number === $currentWeek
                    && $reading->year === $currentYear,
            ],
        ]);
    }
}
