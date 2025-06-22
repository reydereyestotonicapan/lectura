<?php

namespace App\Models;

use App\Enums\AssetStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Asset extends Model
{
    use HasFactory;

    protected $fillable = [
        // Primary identification
        'asset_code',
        'asset_name',
        'description',

        // Physical characteristics
        'brand',
        'model',
        'color',
        'serial_number',
        'barcode',
        'image',

        // Quantity and status
        'quantity',
        'status',
        'condition',
        'location',

        // Financial information
        'price',
        'funding_source',

        // Date tracking
        'purchase_date',
        'expiry_date',
        'last_maintenance',
        'next_maintenance',

        // Maintenance and notes
        'maintenance_notes',

        // Foreign keys
        'category_id',
        'ministry_id',
    ];

    protected $casts = [
        'purchase_date' => 'date',
        'expiry_date' => 'date',
        'last_maintenance' => 'date',
        'next_maintenance' => 'date',
        'price' => 'decimal:2',
        'quantity' => 'integer',
        'status' => AssetStatus::class,
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function ministry(): BelongsTo
    {
        return $this->belongsTo(Ministry::class);
    }
}
