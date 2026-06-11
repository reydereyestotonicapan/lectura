<?php

namespace App\Filament\Resources\DayResource\RelationManagers;

use Filament\Forms;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class QuestionsRelationManager extends RelationManager
{
    protected static string $relationship = 'questions';

    protected static ?string $recordTitleAttribute = 'question';

    protected static ?string $modelLabel = 'Pregunta';

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('question')
                    ->label('Pregunta')
                    ->required()
                    ->maxLength(255),
                Repeater::make('answers')
                    ->label('Respuestas')
                    ->relationship()
                    ->helperText('Deja la lista vacía para una pregunta abierta. Si agregas respuestas, marca solo una como correcta.')
                    ->rule(static function () {
                        return static function (string $attribute, $value, \Closure $fail): void {
                            $answers = collect($value);

                            // Sin respuestas = pregunta abierta, no requiere correcta.
                            if ($answers->isEmpty()) {
                                return;
                            }

                            $correct = $answers
                                ->filter(fn ($answer) => filter_var($answer['is_correct'] ?? false, FILTER_VALIDATE_BOOLEAN))
                                ->count();

                            if ($correct !== 1) {
                                $fail('Debes marcar exactamente una respuesta como correcta.');
                            }
                        };
                    })
                    ->schema([
                        Forms\Components\TextInput::make('description')
                            ->label('Respuesta')
                            ->required()
                            ->maxLength(255),
                        Forms\Components\Toggle::make('is_correct')
                            ->label('Es correcta')
                            ->inline(false)
                            ->live()
                            ->afterStateUpdated(static function ($state, Forms\Components\Toggle $component, $livewire): void {
                                if (! $state) {
                                    return;
                                }

                                // Comportamiento tipo radio: al marcar una como correcta,
                                // se desmarcan automáticamente las demás respuestas.
                                // Usamos la ruta absoluta del componente porque el formulario
                                // vive dentro de un modal de acción del RelationManager y las
                                // rutas relativas no resuelven de forma confiable.
                                $segments = explode('.', $component->getStatePath());
                                array_pop($segments); // is_correct
                                $currentKey = array_pop($segments); // clave del item actual
                                $repeaterPath = implode('.', $segments);

                                $answers = data_get($livewire, $repeaterPath, []);

                                foreach (array_keys($answers) as $key) {
                                    if ((string) $key !== (string) $currentKey) {
                                        data_set($livewire, "{$repeaterPath}.{$key}.is_correct", false);
                                    }
                                }
                            }),
                    ]),
            ])->columns(1);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('question')
            ->columns([
                Tables\Columns\TextColumn::make('question')
                    ->label('Pregunta')
                    ->wrap(),
                Tables\Columns\TextColumn::make('answers_count')
                    ->label('Respuestas')
                    ->counts('answers')
                    ->badge()
                    ->formatStateUsing(fn (int $state): string => $state === 0 ? 'Abierta' : (string) $state)
                    ->color(fn (int $state): string => $state === 0 ? 'gray' : 'primary'),
                Tables\Columns\TextColumn::make('correctAnswer.description')
                    ->label('Respuesta correcta')
                    ->placeholder('—')
                    ->wrap()
                    ->color('success'),
            ])
            ->filters([
                //
            ])
            ->headerActions([
                Tables\Actions\CreateAction::make(),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }
}
