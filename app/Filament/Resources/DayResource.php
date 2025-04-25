<?php

namespace App\Filament\Resources;

use App\Filament\Resources\DayResource\Pages;
use App\Filament\Resources\DayResource\RelationManagers\QuestionsRelationManager;
use App\Models\Day;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class DayResource extends Resource
{
    protected static ?string $model = Day::class;
    protected static ?string $modelLabel = 'Preguntas';
    protected static ?string $navigationIcon = 'heroicon-o-calendar';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\DatePicker::make('date_assigned')
                    ->label('Fecha de preguntas')
                    ->default(date('Y-m-d'))
                    ->native(false)
                    ->displayFormat('d/m/Y')
                    ->closeOnDateSelection()
                    ->required()
                    ->live(onBlur: true)
                    ->afterStateUpdated(function (Forms\Set $set, ?string $state) {
                        if ($state) {
                            $set('day_month', (new \DateTime($state))->format('d/m'));
                        }
                    }),
                Forms\Components\TextInput::make('chapters')
                    ->label('Lectura del día')
                    ->required()
                    ->maxLength(255),
                Forms\Components\TextInput::make('day_month')
                    ->label('Día')
                    ->required()
                    ->maxLength(6)
                    ->default(date('d').'/'.date('m'))
                    ->readOnly(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('day_month')
                    ->label('Día')
                    ->searchable(),
                Tables\Columns\TextColumn::make('chapters')
                    ->label('Lectura del día')
                    ->searchable(),
            ])
            ->filters([
                //
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('date_assigned', 'desc')
            ;
    }

    public static function getRelations(): array
    {
        return [
            QuestionsRelationManager::class
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListDays::route('/'),
            'create' => Pages\CreateDay::route('/create'),
            'edit' => Pages\EditDay::route('/{record}/edit'),
        ];
    }
}
