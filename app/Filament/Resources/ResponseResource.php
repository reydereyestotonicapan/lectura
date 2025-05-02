<?php

namespace App\Filament\Resources;

use App\Constants\StatusResponse;
use App\Filament\Resources\ResponseResource\Pages;
use App\Models\Response;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class ResponseResource extends Resource
{
    protected static ?string $model = Response::class;
    protected static ?string $modelLabel = 'Respuestas';

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('user_id')
                    ->relationship('user', 'name')
                    ->required(),
                Forms\Components\Select::make('day_id')
                    ->relationship('day', 'id')
                    ->required(),
                Forms\Components\Select::make('question_id')
                    ->relationship('question', 'id')
                    ->required(),
                Forms\Components\Select::make('answer_id')
                    ->relationship('answer', 'id'),
                Forms\Components\Textarea::make('comment_user')
                    ->columnSpanFull(),
                Forms\Components\Textarea::make('comment_team')
                    ->columnSpanFull(),
                Forms\Components\TextInput::make('status')
                    ->required(),
            ]);
    }
    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\SelectColumn::make('status')
                    ->label('Resultado')
                    ->options(StatusResponse::class)
                    ->visible(fn() => static::canViewColumnByAdminRole())
                    ->placeholder(null),
                Tables\Columns\TextColumn::make('status_value')
                    ->label('Resultado')
                    ->badge()
                    ->state(fn ($record) => $record->status)
                    ->visible(fn() => !static::canViewColumnByAdminRole()),
                Tables\Columns\TextColumn::make('question.question')
                    ->label('Pregunta')
                    ->wrap(),
                Tables\Columns\TextColumn::make('answer.description')
                    ->label('Respuesta recibida')
                    ->getStateUsing(fn ($record) => $record->question->answers->count() > 0 ? $record->question->correctAnswer->description : $record->comment_user)
                    ->wrap(),
                Tables\Columns\TextColumn::make('question.correctAnswer.description')
                    ->label('Respuesta correcta')
                    ->placeholder('Pregunta abierta')
                    ->wrap()
                    ->visible(fn() => !static::canViewColumnByAdminRole()),
                Tables\Columns\TextInputColumn::make('comment_team')
                    ->label('Comentario equipo')
                    ->visible(fn() => static::canViewColumnByAdminRole()),
                Tables\Columns\TextColumn::make('comment_team_view')
                    ->label('Comentario equipo')
                    ->state(fn ($record) => $record->comment_team)
                    ->visible(fn() => !static::canViewColumnByAdminRole())
                    ->wrap(),
                Tables\Columns\TextColumn::make('day.day_month')
                    ->label('Día'),
                Tables\Columns\TextColumn::make('user.name')
                    ->numeric()
                    ->sortable()
                    ->visible(fn() => static::canViewColumnByAdminRole()),
            ])
            ->defaultSort('id', 'desc')
            ->filters([
                SelectFilter::make('status')
                    ->options(StatusResponse::class)
                    ->default(StatusResponse::PENDING->value)
                    ->label('Resultado')
                    ->visible(fn() => static::canViewColumnByAdminRole()),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListResponses::route('/'),
        ];
    }
    protected static function canViewColumnByAdminRole(): bool
    {
        return auth()->user()->hasRole(['admin', 'super_admin']);
    }
    public static function getEloquentQuery(): Builder
    {
        $query = parent::getEloquentQuery()->with(['question.correctAnswer', 'question.answers']);
        if (!auth()->user()->hasRole(['admin', 'super_admin'])) {
            $query->where('user_id', auth()->id());
        }
        return $query;
    }
    public static function canCreate(): bool
    {
        return false;
    }
}
