<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('videos', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('album_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('youtube_id', 20);
            $table->string('title', 255);
            $table->text('description')->nullable();
            $table->string('url_alias', 255)->nullable();
            $table->date('date_taken')->nullable();
            $table->boolean('is_public')->default(false);
            $table->integer('order_column')->nullable();
            $table->timestamps();

            $table->index('album_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('videos');
    }
};
