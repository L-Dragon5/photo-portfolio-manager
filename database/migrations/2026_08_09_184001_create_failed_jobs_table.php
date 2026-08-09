<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Where the `database-uuids` failed driver records jobs that exhaust retries.
 *
 * Guarded with hasTable because the table may already exist in production,
 * created out of band before this migration was written.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('failed_jobs')) {
            return;
        }

        Schema::create('failed_jobs', function (Blueprint $table): void {
            $table->id();
            $table->string('uuid')->unique();
            $table->text('connection');
            $table->text('queue');
            $table->longText('payload');
            $table->longText('exception');
            $table->timestamp('failed_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('failed_jobs');
    }
};
