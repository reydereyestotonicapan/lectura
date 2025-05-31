<?php

namespace App\Jobs;

use App\Mail\MailAward;
use App\Models\Award;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class GenerateAward implements ShouldQueue
{
    public const string FILE_EXTENSION = '.pdf';
    public const string MIME_TYPE = 'application/pdf';
    public const string DISK = 's3';
    public const string DIRECTORY = 'awards';
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(private readonly Award $award)
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $pdf = Pdf::loadView('emails.design-award', ['award' => $this->award]);
        $filename = Carbon::now()->locale('es')->monthName.'-'.$this->award->user->name.self::FILE_EXTENSION;
        $pdfContent = $pdf->output();
        Storage::disk(self::DISK)->put(self::DIRECTORY. '/' . $filename, $pdfContent);
        $this->award->update([
            'file_name' => $filename,
            'file_path' => Storage::disk(self::DISK)->url(self::DIRECTORY. '/' . $filename),
            'file_extension' => self::FILE_EXTENSION,
            'mime_type' => self::MIME_TYPE,
            'disk' => self::DISK,
            'directory' => self::DIRECTORY,
        ]);
        Mail::to($this->award->user->email)->queue(new MailAward($this->award));
    }
}
