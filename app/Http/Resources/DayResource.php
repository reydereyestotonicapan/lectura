<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DayResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'date_assigned' => $this->date_assigned->toDateString(),
            'chapters'      => $this->chapters,
            'day_month'     => $this->day_month,
            'questions'     => QuestionResource::collection($this->whenLoaded('questions')),
            'answered_count' => $this->when(isset($this->answered_count), $this->answered_count),
        ];
    }
}
