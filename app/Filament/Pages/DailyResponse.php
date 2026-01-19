<?php

namespace App\Filament\Pages;

use App\Constants\StatusResponse;
use App\Filament\Resources\ResponseResource;
use App\Models\Answer;
use App\Models\Day;
use App\Models\Question;
use App\Models\Response;
use BezhanSalleh\FilamentShield\Traits\HasPageShield;
use Carbon\Carbon;
use Filament\Actions\Contracts\HasActions;
use Filament\Forms\Components\Placeholder;
use Filament\Forms\Components\Radio;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Forms\Form;
use Filament\Forms\Get;
use Filament\Forms\Set;
use Filament\Notifications\Actions\Action;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Illuminate\Support\HtmlString;


class DailyResponse extends Page implements HasForms, HasActions
{
    use HasPageShield;
    use InteractsWithForms;
    public ?array $data = [];
    public Response $response;
    protected static ?string $navigationIcon = 'heroicon-o-document-text';

    protected static string $view = 'filament.pages.daily-response';
    protected static ?string $title = 'Responder';

    public function mount(): void
    {
        $day_id = request()->query('day_id');
        $userId = auth()->user()->id;
        $daysAsIdAndMonth = self::getDaysAsIdAndDayMonth();

        $questions = $day_id
            ? self::addQuestionIdAndUserIdToQuestionsByDay(
                self::getQuestionsByDayNotPresentInResponsesForTheUser((int)$day_id, $userId),
                $userId
            )->toArray()
            : self::getQuestionsForUser($userId);

        $this->form->fill([
            'day_id' => $day_id,
            'questions' => $questions,
            'daysAsIdAndMonth' => $daysAsIdAndMonth,
            'user_id' => $userId,
        ]);
    }
    private static function getQuestionsForDayAndUser(int $dayId, $userId): array
    {
        $questionsByDay = self::getQuestionsByDayNotPresentInResponsesForTheUser($dayId, $userId);
        return self::addQuestionIdAndUserIdToQuestionsByDay($questionsByDay, $userId)->toArray();
    }
    private static function getQuestionsForUser($userId): array
    {
        $questionsByDay = self::getQuestionsNotPresentInResponsesForTheUser($userId);
        return self::addQuestionIdAndUserIdToQuestionsByDay($questionsByDay, $userId)->toArray();
    }
    private static function addQuestionIdAndUserIdToQuestionsByDay(Collection $questionsByDay, int $userId): Collection
    {
        return $questionsByDay->map(function ($question) use($userId) {
            $question->question_id = $question->id;
            $question->user_id = $userId;
            $question->comment_user = null;
            $question->answer_id = null;
            return $question;
        });
    }
    private static function getDaysAsIdAndDayMonth(): Collection
    {
        return Day::query()
            ->orderByDesc('id')
            ->pluck('day_month', 'id');
    }
    private static function getQuestionsByDayNotPresentInResponsesForTheUser(int $dayId, $userId): Collection
    {
        return Question::query()
            ->with(['answers', 'day'])
            ->where('day_id', $dayId)
            ->whereNotIn('id', function ($query) use ($dayId, $userId) {
                $query->select('question_id')
                    ->from('responses')
                    ->where('day_id', $dayId)
                    ->where('user_id', $userId);
            })
            ->select(['id', 'question', 'day_id'])
            ->get()
            ;
    }
    private static function getQuestionsNotPresentInResponsesForTheUser($userId): Collection
    {
        return Question::query()
            ->with(['answers', 'day'])
            ->whereNotIn('id', function ($query) use ($userId) {
                $query->select('question_id')
                    ->from('responses')
                    ->where('user_id', $userId);
            })
            ->whereHas('day', function ($query) {
                $query->whereMonth('date_assigned', now()->month)
                    ->whereYear('date_assigned', now()->year);
            })
            ->select(['id', 'question', 'day_id'])
            ->get()
            ;
    }

    public function form(Form $form): Form
    {
        return $form->schema([
            Select::make('day_id')
                ->label('Día')
                ->options(function (): array{
                    return $this->data['daysAsIdAndMonth']->toArray();
                })
                ->searchable()
                ->live()
                ->afterStateUpdated(function ($state, Set $set) {
                    if (is_null($state)) {
                        $this->mount();
                        return;
                    }
                    $userId = $this->data['user_id'];
                    $questionsByDay = self::getQuestionsByDayNotPresentInResponsesForTheUser($state, $userId);
                    $questions = self::addQuestionIdAndUserIdToQuestionsByDay($questionsByDay, $userId)->toArray();
                    $set('questions', $questions);
                    $set('day_id', $state);
                }),
            Placeholder::make('no_questions')
                ->label('')
                ->content('No hay preguntas disponibles.')
                ->visible(fn (Get $get): bool => empty($get('questions'))),
            Repeater::make('questions')
                ->label('Preguntas')
                ->schema([
                    Placeholder::make('question')
                        ->label('')
                        ->content(fn (Get $get) => new HtmlString('<span class="font-bold">' . $get('day.chapters') . " - " .$get('question') . '</span>')),
                    Radio::make('answer_id')
                        ->label('Respuestas')
                        ->options(function ($state, Get $get): array {
                            return Arr::pluck($get('answers'), 'description', 'id');
                        })
                        ->required()
                        ->visible(fn (Get $get): bool => !empty($get('answers'))),
                    Textarea::make('comment_user')
                        ->label('Comentario')
                        ->visible(fn (Get $get): bool => empty($get('answers')))
                        ->required("Agrega un comentario")
                ])
                ->addable(false)
                ->deletable(false)
                ->reorderable(false)
                ->columns(1)
                ->visible(fn (Get $get): bool => !empty($get('questions'))),
        ])->statePath('data');
    }
    public static function getResultAnswerByQuestionId(int $questionId, int $answerIdSelected): string
    {
        $isCorrect = Answer::isCorrect($questionId, $answerIdSelected);
        return $isCorrect ? StatusResponse::EXPECTED->getLabel() : StatusResponse::WRONG->getLabel();
    }
    private static function removeIdAndAnswersAndAddCreateUpdateAtFromResponsesToInsert($responsesToInsert): array
    {
        $now = Carbon::now();
        return Arr::map($responsesToInsert, function ($responseToInsert) use ($now) {
            unset($responseToInsert['id'], $responseToInsert['answers'], $responseToInsert['day']);
            $responseToInsert['created_at'] = $now;
            $responseToInsert['updated_at'] = $now;
            $responseToInsert['answer_id'] = $responseToInsert['answer_id'] ?? null;
            $responseToInsert['comment_user'] = $responseToInsert['comment_user'] ?? null;
            $responseToInsert['status'] = $responseToInsert['answer_id']
                ? self::getResultAnswerByQuestionId($responseToInsert['question_id'], $responseToInsert['answer_id'])
                : StatusResponse::PENDING->getLabel();
            return $responseToInsert;
        });
    }
    private static function responsesSaved($bodyMessage): void
    {
        Notification::make()
            ->title('¡Respuestas enviadas!')
            ->success()
            ->body($bodyMessage)
            ->color('success')
            ->duration(8000)
            ->actions([
                Action::make('view')
                    ->label('Ver resultados')
                    ->button()
                    ->url(ResponseResource::getUrl('index'))
            ])
            ->send();
    }
    static function getCountResult($responsesToInsert): array
    {
        $countResult = [
            'expected' => 0,
            'wrong' => 0,
            'pending' => 0,
        ];
        Arr::map($responsesToInsert, function ($responseToInsert) use (&$countResult) {
            switch ($responseToInsert['status']) {
                case StatusResponse::EXPECTED->getLabel():
                    $countResult['expected']++;
                    break;
                case StatusResponse::WRONG->getLabel():
                    $countResult['wrong']++;
                    break;
                default:
                    $countResult['pending']++;
            }
        });
        return $countResult;
    }
    public function create(): void
    {
        $responseToInsert = self::removeIdAndAnswersAndAddCreateUpdateAtFromResponsesToInsert($this->form->getState()['questions']);
        Response::insert($responseToInsert);
        $bodyMessage = '';
        $countResult = self::getCountResult($responseToInsert);
        $bodyMessage .= $countResult['expected'] . ' Correctas ';
        $bodyMessage .= $countResult['wrong'] . ' Inorrectas ';
        $bodyMessage .= $countResult['pending'] . ' Pendientes ';
        self::responsesSaved($bodyMessage);
        $this->form->fill([
            'day_id' => $this->form->getState()['day_id'],
            'questions' => is_null($this->form->getState()['day_id']) ? $this->getQuestionsForUser($this->data['user_id']) : $this->getQuestionsForDayAndUser($this->form->getState()['day_id'], $this->data['user_id']),
            'daysAsIdAndMonth' => self::getDaysAsIdAndDayMonth(),
            'user_id' => $this->data['user_id'],
        ]);
    }
}
