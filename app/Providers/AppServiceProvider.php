<?php

namespace App\Providers;

use App\Models\DayChapter;
use App\Observers\DayChapterObserver;
use Illuminate\Auth\Middleware\Authenticate;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Model::preventLazyLoading();

        // Register observers
        DayChapter::observe(DayChapterObserver::class);

        // Register route model binding for chapter parameter to DayChapter model
        Route::model('chapter', DayChapter::class);

        Authenticate::redirectUsing(function (Request $request) {
            if ($request->is('api/*')) {
                return null;
            }

            return route('filament.admin.auth.login');
        });
    }
}
