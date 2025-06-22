<?php

namespace App\Filament\Resources;

use App\Enums\AssetCondition;
use App\Enums\AssetStatus;
use App\Filament\Resources\AssetResource\Pages;
use App\Models\Asset;
use Filament\Forms;
use Filament\Forms\Components\Fieldset;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;


class AssetResource extends Resource
{
    protected static ?string $model = Asset::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';
    protected static ?string $modelLabel = 'Recurso';
    protected static ?string $navigationGroup = 'Inventario';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Grid::make(2)
                    ->schema([
                        // First column - All form fields
                        Forms\Components\Section::make()
                            ->schema([
                                Fieldset::make('Datos generales')
                                    ->schema([
                                        Forms\Components\TextInput::make('asset_name')
                                            ->label('Nombre del bien')
                                            ->required()
                                            ->maxLength(255),
                                        Forms\Components\Textarea::make('description')
                                            ->label('Descripción')
                                            ->maxLength(255),
                                    ])
                                    ->columns(1),
                                Fieldset::make('Características físicas')
                                    ->schema([
                                        Forms\Components\TextInput::make('brand')
                                            ->label('Marca')
                                            ->maxLength(255),
                                        Forms\Components\TextInput::make('model')
                                            ->label('Modelo')
                                            ->maxLength(255),
                                        Forms\Components\TextInput::make('color')
                                            ->label('Color')
                                            ->maxLength(255),
                                        Forms\Components\TextInput::make('serial_number')
                                            ->label('Número de serie')
                                            ->maxLength(255),
                                        Forms\Components\TextInput::make('barcode')
                                            ->label('Código de barras')
                                            ->maxLength(255),
                                    ])
                                    ->columns(1),
                                Fieldset::make('Cantidad y estado')
                                    ->schema([
                                        Forms\Components\TextInput::make('quantity')
                                            ->label('Cantidad')
                                            ->required()
                                            ->numeric(),
                                        Forms\Components\Select::make('status')
                                            ->label('Estado')
                                            ->options(AssetStatus::options())
                                            ->default(AssetStatus::IN_USE->value)
                                            ->required(),
                                        Forms\Components\Select::make('condition')
                                            ->label('Condición')
                                            ->options(AssetCondition::options())
                                            ->default(AssetCondition::EXCELLENT->value)
                                            ->required(),
                                        Forms\Components\TextInput::make('location')
                                            ->label('Ubicación')
                                            ->maxLength(255),
                                    ])
                                    ->columns(1),
                                Fieldset::make('Información financiera')
                                    ->schema([
                                        Forms\Components\TextInput::make('price')
                                            ->label('Precio')
                                            ->numeric()
                                            ->prefix('Q'),
                                        Forms\Components\TextInput::make('funding_source')
                                            ->label('Fuente de financiamiento')
                                    ])
                                    ->columns(1),
                                Fieldset::make('Control de fechas')
                                    ->schema([
                                        Forms\Components\DatePicker::make('purchase_date')
                                            ->label('Fecha de compra')
                                            ->native(false)
                                            ->displayFormat('d/m/Y')
                                            ->closeOnDateSelection(),
                                        Forms\Components\DatePicker::make('expiry_date')
                                            ->label('Fecha de expiración del bien o garantía')
                                            ->native(false)
                                            ->displayFormat('d/m/Y')
                                            ->closeOnDateSelection(),
                                        Forms\Components\DatePicker::make('last_maintenance')
                                            ->label('Último mantenimiento')
                                            ->native(false)
                                            ->displayFormat('d/m/Y')
                                            ->closeOnDateSelection(),
                                        Forms\Components\DatePicker::make('next_maintenance')
                                            ->label('Próximo mantenimiento')
                                            ->native(false)
                                            ->displayFormat('d/m/Y')
                                            ->closeOnDateSelection(),
                                    ])
                                    ->columns(1),
                                Fieldset::make('Asociaciones')
                                    ->schema([
                                        Forms\Components\Select::make('category_id')
                                            ->label('Categoría')
                                            ->relationship('category', 'category_name')
                                            ->required(),
                                        Forms\Components\Select::make('ministry_id')
                                            ->label('Ministerio')
                                            ->relationship('ministry', 'ministry_name')
                                            ->required(),
                                    ])
                                    ->columns(1),
                                Fieldset::make('Comentarios')
                                    ->schema([
                                        Forms\Components\Textarea::make('maintenance_notes')
                                            ->label('Notas adicionales'),
                                    ])
                                    ->columns(1),
                            ])
                            ->columnSpan(1),

                        // Second column - Image only
                        Forms\Components\Section::make('Fotografía')
                            ->schema([
                                Forms\Components\FileUpload::make('image')
                                    ->label('Fotografía del bien')
                                    ->image()
                                    ->disk('s3')
                                    ->directory('assets')
                                    ->visibility('private')
                                    ->imagePreviewHeight('300')
                                    ->panelLayout('integrated')
                                    ->uploadingMessage('Subiendo imagen...')
                                    ->removeUploadedFileButtonPosition('top-right'),
                            ])
                            ->columnSpan(1),
                    ])
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('quantity')
                    ->label('Cantidad')
                    ->numeric()
                    ->sortable(),
                Tables\Columns\TextColumn::make('asset_name')
                    ->label('Nombre del bien')
                    ->searchable(),
                Tables\Columns\TextColumn::make('status')
                ->label('Estado')
                    ->formatStateUsing(fn (AssetStatus $state): string => $state->label()),
                Tables\Columns\TextColumn::make('ministry.ministry_name')
                    ->label('Ministerio')
                    ->sortable(),
                Tables\Columns\ImageColumn::make('image')
                    ->label('Fotografía')
                    ->disk('s3'),
            ])
            ->filters([
                //
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
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
            'index' => Pages\ListAssets::route('/'),
            'create' => Pages\CreateAsset::route('/create'),
            'edit' => Pages\EditAsset::route('/{record}/edit'),
        ];
    }
}
