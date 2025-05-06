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
                    ->schema([
                        Forms\Components\TextInput::make('description')
                        ->label('Respuesta')
                            ->required()
                            ->maxLength(255),
                        Forms\Components\Toggle::make('is_correct')
                        ->label('Es correcta'),
                    ]),
            ])->columns(1);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('question')
            ->columns([
                Tables\Columns\TextColumn::make('question')
                    ->label('Pregunta'),
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
