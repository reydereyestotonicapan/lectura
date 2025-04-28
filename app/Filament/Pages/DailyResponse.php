<?php

namespace App\Filament\Pages;

use App\Models\Day;
use App\Models\Question;
use App\Models\Response;
use BezhanSalleh\FilamentShield\Traits\HasPageShield;
use Carbon\Carbon;
use Filament\Actions\Concerns\InteractsWithActions;
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
    use InteractsWithActions;
    public ?array $data = [];
    public Response $response;

    protected static ?string $navigationIcon = 'heroicon-o-document-text';

    protected static string $view = 'filament.pages.daily-response';

    public function mount(): void
    {
        $userId = auth()->user()->id;
        $daysAsIdAndMonth = self::getDaysAsIdAndDayMonth();
        $dayDefault = $daysAsIdAndMonth->keys()->first();
        $this->form->fill([
            'day_id' => $dayDefault,
            'questions' => self::getQuestionsForDayAndUser($dayDefault, $userId),
            'daysAsIdAndMonth' => $daysAsIdAndMonth,
            'user_id' => $userId,
        ]);
    }
    private static function getQuestionsForDayAndUser(int $dayId, $userId): array
    {
        $questionsByDay = self::getQuestionsByDayNotPresentInResponsesForTheUser($dayId, $userId);
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
            ->with('answers')
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

    public function form(Form $form): Form
    {
        return $form->schema([
            Select::make('day_id')
                ->label('Día')
                ->options(function (): array{
                    return $this->data['daysAsIdAndMonth']->toArray();
                })
                ->searchable()
                ->required()
                ->live()
                ->afterStateUpdated(function ($state, Set $set) {
                    $questionsByDay = self::getQuestionsByDayNotPresentInResponsesForTheUser($state, $this->data['user_id']);
                    $set('questions', self::addQuestionIdAndUserIdToQuestionsByDay($questionsByDay, $this->data['user_id'])->toArray());
                    $set('day_id', $state);
                }),
            Placeholder::make('no_questions')
                ->label('')
                ->content('No hay preguntas disponibles para este día.')
                ->visible(fn (Get $get): bool => empty($get('questions'))),
            Repeater::make('questions')
                ->label('Preguntas')
                ->schema([
                    Placeholder::make('question')
                        ->label('')
                        ->content(fn (Get $get) => new HtmlString('<span class="font-bold">' . $get('question') . '</span>')),
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
                ->columns(2)
                ->visible(fn (Get $get): bool => !empty($get('questions')))
        ])->statePath('data');
    }
    private static function removeIdAndAnswersAndAddCreateUpdateAtFromResponsesToInsert($responsesToInsert): array
    {
        $now = Carbon::now();
        return Arr::map($responsesToInsert, function ($responseToInsert) use ($now) {
            unset($responseToInsert['id'], $responseToInsert['answers']);
            $responseToInsert['created_at'] = $now;
            $responseToInsert['updated_at'] = $now;
            return $responseToInsert;
        });
    }
    private static function responsesSaved(): void
    {
        Notification::make()
            ->title('¡Excelente!')
            ->success()
            ->body('Respuestas enviadas')
            ->actions([
                Action::make('Ver resultados')
                    ->button(),
            ])
            ->send();
    }
    public function create(): void
    {
        Response::insert(self::removeIdAndAnswersAndAddCreateUpdateAtFromResponsesToInsert($this->form->getState()['questions']));
        $this->form->fill([
            'day_id' => $this->form->getState()['day_id'],
            'questions' => $this->getQuestionsForDayAndUser($this->form->getState()['day_id'], $this->data['user_id']),
            'daysAsIdAndMonth' => self::getDaysAsIdAndDayMonth(),
            'user_id' => $this->data['user_id'],
        ]);
        self::responsesSaved();
    }
}
