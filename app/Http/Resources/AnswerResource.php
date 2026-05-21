<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AnswerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        // is_correct is intentionally excluded — it is stripped at query level
        // by selecting only ['id', 'description', 'question_id']
        return [
            'id'          => $this->id,
            'description' => $this->description,
        ];
    }
}
