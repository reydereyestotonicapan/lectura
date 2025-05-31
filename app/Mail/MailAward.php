<?php

namespace App\Mail;

use App\Jobs\GenerateAward;
use App\Models\Award;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class MailAward extends Mailable
{
    protected $award;
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(private readonly Award $awardParam)
    {
        $this->award = $awardParam;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Reconocimiento '.Carbon::now()->locale('es')->monthName.' '.Carbon::now()->year,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.mail-award',
            with: [
                'award' => $this->award,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [
            Attachment::fromStorageDisk(GenerateAward::DISK, GenerateAward::DIRECTORY.'/' . $this->award->file_name)
            ->withMime(GenerateAward::MIME_TYPE),
        ];
    }
}
