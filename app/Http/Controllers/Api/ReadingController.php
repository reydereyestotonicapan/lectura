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

        $days = Day::where('date_assigned', '<=', today())
            ->withCount('questions')
            ->withCount(['questions as answered_count' => function ($query) use ($userId) {
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

    public function questions(Request $request, Day $day): JsonResponse
    {
        $userId = $request->user()->id;

        // Get question IDs already answered by this user for this day
        $answeredQuestionIds = Response::where('user_id', $userId)
            ->where('day_id', $day->id)
            ->pluck('question_id');

        $day->load(['questions' => function ($query) use ($answeredQuestionIds) {
            $query->whereNotIn('id', $answeredQuestionIds);
        }, 'questions.answers' => fn ($q) => $q->select(['id', 'description', 'question_id'])]);

        return response()->json([
            'data' => $day->questions->map(fn ($question) => [
                'id'          => $question->id,
                'description' => $question->question,
                'answers'     => $question->answers->map(fn ($answer) => [
                    'id'          => $answer->id,
                    'description' => $answer->description,
                ]),
            ]),
            'all_answered' => $day->questions->isEmpty() && $answeredQuestionIds->isNotEmpty(),
        ]);
    }

    public function submitAnswers(Request $request, Day $day): JsonResponse
    {
        $request->validate([
            'answers'                => 'required|array|min:1',
            'answers.*.question_id'  => 'required|integer|exists:questions,id',
            'answers.*.answer_id'    => 'nullable|integer|exists:answers,id',
            'answers.*.comment_user' => 'nullable|string|max:1000',
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
            $questionId  = $submission['question_id'];
            $answerId    = $submission['answer_id'] ?? null;
            $commentUser = $submission['comment_user'] ?? null;

            // Skip if already answered
            $existing = $existingResponses->get($questionId);

            if ($existing) {
                $wasCorrect = $existing->status === StatusResponse::EXPECTED;
                if ($wasCorrect) {
                    $correct++;
                }
                $results[] = [
                    'question_id'       => $questionId,
                    'answer_id'         => $existing->answer_id,
                    'comment_user'      => $existing->comment_user,
                    'is_correct'        => $wasCorrect,
                    'is_open_question'  => $existing->answer_id === null,
                    'correct_answer_id' => $correctAnswerMap[$questionId] ?? null,
                    'skipped'           => true,
                ];
                continue;
            }

            // Open question (no answer_id, has comment)
            $isOpenQuestion = $answerId === null && $commentUser !== null;
            
            if ($isOpenQuestion) {
                Response::create([
                    'user_id'      => $user->id,
                    'day_id'       => $day->id,
                    'question_id'  => $questionId,
                    'answer_id'    => null,
                    'comment_user' => $commentUser,
                    'status'       => StatusResponse::PENDING,
                ]);

                $results[] = [
                    'question_id'       => $questionId,
                    'answer_id'         => null,
                    'comment_user'      => $commentUser,
                    'is_correct'        => null, // Pending review
                    'is_open_question'  => true,
                    'correct_answer_id' => null,
                    'skipped'           => false,
                ];
                continue;
            }

            // Multiple choice question
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
                'comment_user'      => null,
                'is_correct'        => $isCorrect,
                'is_open_question'  => false,
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

    public function responses(Request $request): JsonResponse
    {
        $user = $request->user();

        $responses = Response::where('user_id', $user->id)
            ->with(['day', 'question.correctAnswer', 'answer'])
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json([
            'data' => $responses->map(fn ($response) => [
                'id'              => $response->id,
                'status'          => $response->status->value,
                'question'        => $response->question->question,
                'your_answer'     => $response->answer?->description ?? $response->comment_user,
                'correct_answer'  => $response->question->correctAnswer?->description,
                'team_comment'    => $response->comment_team,
                'day_month'       => $response->day->day_month,
                'chapters'        => $response->day->chapters,
                'date'            => $response->day->date_assigned,
                'created_at'      => $response->created_at->toISOString(),
            ]),
            'meta' => [
                'current_page' => $responses->currentPage(),
                'last_page'    => $responses->lastPage(),
                'per_page'     => $responses->perPage(),
                'total'        => $responses->total(),
            ],
        ]);
    }
}
