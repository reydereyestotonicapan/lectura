<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ActivityResource\Pages;
use App\Models\Activity;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class ActivityResource extends Resource
{
    protected static ?string $model = Activity::class;

    protected static ?string $navigationIcon = 'heroicon-o-calendar-days';

    protected static ?string $modelLabel = 'Actividad';

    protected static ?string $pluralModelLabel = 'Actividades';

    protected static ?string $navigationLabel = 'Actividades';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Grid::make(2)
                    ->schema([
                        Forms\Components\Section::make()
                            ->schema([
                                Forms\Components\TextInput::make('name')
                                    ->label('Nombre')
                                    ->required()
                                    ->maxLength(255),
                                Forms\Components\TextInput::make('place')
                                    ->label('Lugar')
                                    ->required()
                                    ->maxLength(255),
                                Forms\Components\DateTimePicker::make('scheduled_at')
                                    ->label('Fecha y hora')
                                    ->required()
                                    ->native(false)
                                    ->displayFormat('d/m/Y H:i')
                                    ->seconds(false),
                                Forms\Components\Select::make('ministry_id')
                                    ->label('Ministerio que invita')
                                    ->relationship('ministry', 'ministry_name')
                                    ->searchable()
                                    ->required(),
                            ])
                            ->columnSpan(1),

                        Forms\Components\Section::make('Imagen')
                            ->schema([
                                Forms\Components\FileUpload::make('image')
                                    ->label('Imagen de la actividad')
                                    ->image()
                                    ->disk('s3')
                                    ->directory('activities')
                                    ->visibility('private')
                                    ->imagePreviewHeight('300')
                                    ->panelLayout('integrated')
                                    ->uploadingMessage('Subiendo imagen...')
                                    ->removeUploadedFileButtonPosition('top-right'),
                            ])
                            ->columnSpan(1),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->label('Nombre')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('place')
                    ->label('Lugar')
                    ->searchable(),
                Tables\Columns\TextColumn::make('scheduled_at')
                    ->label('Fecha y hora')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
                Tables\Columns\TextColumn::make('ministry.ministry_name')
                    ->label('Ministerio')
                    ->sortable(),
                Tables\Columns\ImageColumn::make('image')
                    ->label('Imagen')
                    ->disk('s3'),
            ])
            ->filters([
                SelectFilter::make('ministry')
                    ->label('Ministerio')
                    ->relationship('ministry', 'ministry_name')
                    ->searchable(),
            ])
            ->defaultSort('scheduled_at', 'desc')
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
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
            'index' => Pages\ListActivities::route('/'),
            'create' => Pages\CreateActivity::route('/create'),
            'edit' => Pages\EditActivity::route('/{record}/edit'),
        ];
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()->with('ministry');
    }

    protected static function isLeader(): bool
    {
        return auth()->user()?->hasRole('leader') ?? false;
    }

    public static function shouldRegisterNavigation(): bool
    {
        return static::isLeader();
    }

    public static function canViewAny(): bool
    {
        return static::isLeader();
    }

    public static function canCreate(): bool
    {
        return static::isLeader();
    }

    public static function canView($record): bool
    {
        return static::isLeader();
    }

    public static function canEdit($record): bool
    {
        return static::isLeader();
    }

    public static function canDelete($record): bool
    {
        return static::isLeader();
    }
}
