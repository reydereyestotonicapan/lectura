<?php

use App\Models\Category;
use App\Models\Ministry;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('assets', function (Blueprint $table) {
            // Primary identification
            $table->id();
            $table->string('asset_code')->unique()->nullable();
            $table->string('asset_name');
            $table->text('description')->nullable();

            // Physical characteristics
            $table->string('brand')->nullable();
            $table->string('model')->nullable();
            $table->string('color')->nullable();
            $table->string('serial_number')->nullable();
            $table->string('barcode')->unique()->nullable();
            $table->string('image')->nullable();

            // Quantity and status
            $table->unsignedInteger('quantity');
            $table->enum('status', ['in_use', 'in_storage', 'under_repair', 'donated', 'disposed'])->default('in_storage');
            $table->enum('condition', ['excellent', 'good', 'fair', 'poor'])->default('good');
            $table->string('location')->nullable();

            // Financial information
            $table->decimal('price', 12, 2)->nullable();
            $table->string('funding_source')->nullable();

            // Date tracking
            $table->date('purchase_date')->nullable();
            $table->date('expiry_date')->nullable();
            $table->date('last_maintenance')->nullable();
            $table->date('next_maintenance')->nullable();

            // Maintenance and notes
            $table->text('maintenance_notes')->nullable();

            // Foreign keys
            $table->foreignIdFor(Category::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(Ministry::class)->constrained()->cascadeOnDelete();

            // Timestamps
            $table->timestamps();

            // Indexes
            $table->index(['status', 'category_id']);
            $table->index('asset_code');
            $table->index('purchase_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assets');
    }
};
