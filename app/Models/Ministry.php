<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Ministry extends Model
{
    protected $fillable = ['ministry_name', 'led_by'];

    public function lead(): BelongsTo
    {
        return $this->belongsTo(User::class,'led_by');
    }
}
