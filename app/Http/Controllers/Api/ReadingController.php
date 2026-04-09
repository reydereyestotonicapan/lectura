<?php

namespace App\Http\Controllers\Api;

use App\Constants\StatusResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\DayResource;
use App\Models\Answer;
use App\Models\Day;
use App\Models\Response;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ReadingController extends Controller
{
    public function today(Request $request): JsonResponse|DayResource
    {
        $day = Day::whereDate('date_assigned', today())
            ->with(['questions.answers' => fn ($q) => $q->select(['id', 'description', 'question_id'])])
            ->first();

        if (! $day) {
            return response()->json(['message' => 'No reading assigned for today.'], 404);
        }

        return new DayResource($day);
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $userId = $request->user()->id;

        $days = Day::withCount(['questions as answered_count' => function ($query) use ($userId) {
            $query->whereExists(function ($sub) use ($userId) {
                $sub->from('responses')
                    ->whereColumn('responses.question_id', 'questions.id')
                    ->where('responses.user_id', $userId);
            });
        }])
            ->orderByDesc('date_assigned')
            ->paginate(20);

        return DayResource::collection($days);
    }

    public function show(Day $day): DayResource
    {
        $day->load(['questions.answers' => fn ($q) => $q->select(['id', 'description', 'question_id'])]);

        return new DayResource($day);
    }

    public function questions(Day $day): JsonResponse
    {
        $day->load(['questions.answers' => fn ($q) => $q->select(['id', 'description', 'question_id'])]);

        return response()->json([
            'data' => $day->questions->map(fn ($question) => [
                'id'          => $question->id,
                'description' => $question->question,
                'answers'     => $question->answers->map(fn ($answer) => [
                    'id'          => $answer->id,
                    'description' => $answer->description,
                ]),
            ]),
        ]);
    }

    public function submitAnswers(Request $request, Day $day): JsonResponse
    {
        $request->validate([
            'answers'                => 'required|array|min:1',
            'answers.*.question_id'  => 'required|integer|exists:questions,id',
            'answers.*.answer_id'    => 'required|integer|exists:answers,id',
        ]);

        $user    = $request->user();
        $correct = 0;
        $total   = count($request->answers);
        $results = [];

        $questionIds = collect($request->answers)->pluck('question_id');

        // Pre-fetch existing responses for this user
        $existingResponses = Response::where('user_id', $user->id)
            ->whereIn('question_id', $questionIds)
            ->get()
            ->keyBy('question_id');

        // Pre-fetch correct answers
        $correctAnswerMap = Answer::where('is_correct', true)
            ->whereIn('question_id', $questionIds)
            ->pluck('id', 'question_id');

        foreach ($request->answers as $submission) {
            $questionId = $submission['question_id'];
            $answerId   = $submission['answer_id'];

            // Skip if already answered
            $existing = $existingResponses->get($questionId);

            if ($existing) {
                $results[] = [
                    'question_id'       => $questionId,
                    'answer_id'         => $answerId,
                    'is_correct'        => $existing->status === StatusResponse::EXPECTED,
                    'correct_answer_id' => $correctAnswerMap[$questionId] ?? null,
                    'skipped'           => true,
                ];
                continue;
            }

            $isCorrect = isset($correctAnswerMap[$questionId])
                && $correctAnswerMap[$questionId] === $answerId;

            Response::create([
                'user_id'     => $user->id,
                'day_id'      => $day->id,
                'question_id' => $questionId,
                'answer_id'   => $answerId,
                'status'      => $isCorrect ? StatusResponse::EXPECTED : StatusResponse::WRONG,
            ]);

            if ($isCorrect) {
                $correct++;
            }

            $results[] = [
                'question_id'       => $questionId,
                'answer_id'         => $answerId,
                'is_correct'        => $isCorrect,
                'correct_answer_id' => $correctAnswerMap[$questionId] ?? null,
                'skipped'           => false,
            ];
        }

        return response()->json([
            'score'   => $correct,
            'total'   => $total,
            'results' => $results,
        ]);
    }

    public function profile(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'id'    => $user->id,
            'name'  => $user->name,
            'email' => $user->email,
        ]);
    }
}
