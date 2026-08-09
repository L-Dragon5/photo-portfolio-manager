<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Backing table for the database queue driver used in production.
 *
 * Guarded with hasTable because the table may already exist there, created
 * out of band before this migration was written.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('jobs')) {
            return;
        }

        Schema::create('jobs', function (Blueprint $table): void {
            $table->id();
            $table->string('queue')->index();
            $table->longText('payload');
            $table->unsignedTinyInteger('attempts');
            $table->unsignedInteger('reserved_at')->nullable();
            $table->unsignedInteger('available_at');
            $table->unsignedInteger('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jobs');
    }
};
