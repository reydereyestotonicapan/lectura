<?php

namespace App\Support;

use Carbon\Carbon;

/**
 * Single source of truth for the monthly recognition categories, shared by the
 * award generation (ResponseUsers widget) and the mobile progress endpoint so a
 * user always sees the same category they will receive.
 *
 * A category is derived from the number of distinct days answered in the month.
 */
class AwardCategory
{
    public const MIN_SILVER = 10;

    public const MIN_GOLD = 20;

    // June 2026: the plan started on the 15th, so only 16 reading days exist.
    // Thresholds are scaled down just for that month: <=5 bronze, 6-10 silver, 11-16 gold.
    public const JUNE_MIN_SILVER = 6;

    public const JUNE_MIN_GOLD = 11;

    /**
     * Silver/gold day thresholds for the given month.
     *
     * @return array{silver: int, gold: int}
     */
    public static function thresholds(Carbon $month): array
    {
        $isJune2026 = $month->year === 2026 && $month->month === 6;

        return [
            'silver' => $isJune2026 ? self::JUNE_MIN_SILVER : self::MIN_SILVER,
            'gold' => $isJune2026 ? self::JUNE_MIN_GOLD : self::MIN_GOLD,
        ];
    }

    /**
     * Resolve the category ('bronze' | 'silver' | 'gold') for a day count.
     */
    public static function for(int $daysCount, Carbon $month): string
    {
        $t = self::thresholds($month);

        return match (true) {
            $daysCount >= $t['gold'] => 'gold',
            $daysCount >= $t['silver'] => 'silver',
            default => 'bronze',
        };
    }
}
