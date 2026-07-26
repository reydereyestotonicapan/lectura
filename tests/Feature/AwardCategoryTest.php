<?php

use App\Support\AwardCategory;
use Carbon\Carbon;

it('maps day counts to categories with the default thresholds', function () {
    $month = Carbon::create(2026, 7, 1); // a normal month

    expect(AwardCategory::for(0, $month))->toBe('bronze');
    expect(AwardCategory::for(9, $month))->toBe('bronze');
    expect(AwardCategory::for(10, $month))->toBe('silver');
    expect(AwardCategory::for(19, $month))->toBe('silver');
    expect(AwardCategory::for(20, $month))->toBe('gold');
    expect(AwardCategory::thresholds($month))->toBe(['silver' => 10, 'gold' => 20]);
});

it('uses the scaled June 2026 thresholds', function () {
    $month = Carbon::create(2026, 6, 15);

    expect(AwardCategory::for(5, $month))->toBe('bronze');
    expect(AwardCategory::for(6, $month))->toBe('silver');
    expect(AwardCategory::for(10, $month))->toBe('silver');
    expect(AwardCategory::for(11, $month))->toBe('gold');
    expect(AwardCategory::thresholds($month))->toBe(['silver' => 6, 'gold' => 11]);
});
