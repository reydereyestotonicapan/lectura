<?php

namespace App\Models;

use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements FilamentUser
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'firebase_uid',
        'settings',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    protected static function booted(): void
    {
        static::created(function ($user) {
            $defaultRoleName = config('app.default_user_role');
            if ($defaultRoleName) {
                $user->assignRole($defaultRoleName);
            }
        });
    }

    #[\Override] public function canAccessPanel(Panel $panel): bool
    {
        // TODO: Implement canAccessPanel() method.
        return true;
    }

    public function responses(): HasMany
    {
        return $this->hasMany(Response::class);
    }

    /**
     * Get the user's awards.
     */
    public function awards(): HasMany
    {
        return $this->hasMany(Award::class);
    }

    /**
     * Get the user's chapter progress records.
     */
    public function chapterProgress(): HasMany
    {
        return $this->hasMany(UserChapterProgress::class);
    }

    /**
     * Get the user's settings.
     *
     * @return Attribute<array<string, mixed>, array<string, mixed>>
     */
    protected function settings(): Attribute
    {
        return Attribute::make(
            get: fn (?string $value) => $value ? json_decode($value, true) : [],
            set: fn (array $value) => json_encode($value),
        );
    }

    /**
     * Get the user's preferred Bible source.
     *
     * @return Attribute<string, never>
     */
    protected function bibleSource(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->settings['bible_source'] ?? 'youversion',
        );
    }
}
