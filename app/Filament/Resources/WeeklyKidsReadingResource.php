<?php

namespace App\Filament\Resources;

use App\Filament\Resources\WeeklyKidsReadingResource\Pages;
use App\Models\WeeklyKidsReading;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class WeeklyKidsReadingResource extends Resource
{
    protected static ?string $model = WeeklyKidsReading::class;

    protected static ?string $modelLabel = 'Lectura Niños';

    protected static ?string $pluralModelLabel = 'Lecturas Niños';

    protected static ?string $navigationIcon = 'heroicon-o-academic-cap';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make()
                    ->schema([
                        Forms\Components\Select::make('week_number')
                            ->label('Número de Semana')
                            ->options(array_combine(range(1, 53), range(1, 53)))
                            ->required()
                            ->searchable()
                            ->rules(['integer', 'min:1', 'max:53'])
                            ->unique(
                                table: 'weekly_kids_readings',
                                column: 'week_number',
                                ignoreRecord: true,
                                modifyRuleUsing: fn ($rule, $get) => $rule->where('year', $get('year'))
                            )
                            ->validationMessages([
                                'unique' => 'Ya existe una lectura para esta semana y año',
                            ]),

                        Forms\Components\TextInput::make('year')
                            ->label('Año')
                            ->numeric()
                            ->default(date('Y'))
                            ->required()
                            ->minValue(2020)
                            ->rules(['integer', 'min:2020'])
                            ->validationMessages([
                                'min' => 'El año debe ser 2020 o posterior',
                            ]),

                        Forms\Components\TextInput::make('title')
                            ->label('Título')
                            ->placeholder('La Creación')
                            ->required()
                            ->maxLength(255)
                            ->validationMessages([
                                'required' => 'El título es obligatorio',
                            ]),

                        Forms\Components\TextInput::make('passage')
                            ->label('Pasaje Bíblico')
                            ->placeholder('Génesis 1:1-30')
                            ->required()
                            ->maxLength(255)
                            ->validationMessages([
                                'required' => 'El pasaje bíblico es obligatorio',
                            ]),

                        Forms\Components\Textarea::make('description')
                            ->label('Descripción')
                            ->placeholder('Descripción opcional de la lectura')
                            ->maxLength(1000)
                            ->rows(3),

                        Forms\Components\FileUpload::make('pdf_path')
                            ->label('PDF de Actividades')
                            ->acceptedFileTypes(['application/pdf'])
                            ->disk('s3')
                            ->directory('kids-readings')
                            ->visibility('private')
                            ->maxSize(10240) // 10MB
                            ->downloadable()
                            ->openable()
                            ->helperText('Archivo PDF, máximo 10MB'),

                        Forms\Components\Toggle::make('is_published')
                            ->label('Publicado')
                            ->default(false)
                            ->helperText('Solo las lecturas publicadas serán visibles en la app móvil'),
                    ])
                    ->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('week_label')
                    ->label('Semana')
                    ->sortable(['year', 'week_number']),
                Tables\Columns\TextColumn::make('title')
                    ->label('Título')
                    ->searchable()
                    ->limit(50),
                Tables\Columns\TextColumn::make('passage')
                    ->label('Pasaje')
                    ->searchable()
                    ->limit(30),
                Tables\Columns\IconColumn::make('is_published')
                    ->label('Publicado')
                    ->boolean()
                    ->trueIcon('heroicon-o-check-circle')
                    ->falseIcon('heroicon-o-x-circle')
                    ->trueColor('success')
                    ->falseColor('danger'),
                Tables\Columns\IconColumn::make('pdf_path')
                    ->label('PDF')
                    ->icon(fn ($state): string => $state ? 'heroicon-o-document-arrow-down' : 'heroicon-o-document')
                    ->color(fn ($state): string => $state ? 'success' : 'gray')
                    ->tooltip(fn ($state): string => $state ? 'PDF disponible' : 'Sin PDF'),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('is_published')
                    ->label('Publicado')
                    ->placeholder('Todos')
                    ->trueLabel('Publicados')
                    ->falseLabel('No publicados'),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ])
            ->modifyQueryUsing(fn ($query) => $query->orderBy('year', 'desc')->orderBy('week_number', 'desc'));
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
            'index' => Pages\ListWeeklyKidsReadings::route('/'),
            'create' => Pages\CreateWeeklyKidsReading::route('/create'),
            'edit' => Pages\EditWeeklyKidsReading::route('/{record}/edit'),
        ];
    }
}
