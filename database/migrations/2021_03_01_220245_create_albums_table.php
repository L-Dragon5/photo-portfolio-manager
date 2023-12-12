<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAlbumsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('albums', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->nullable();
            $table->string('name', 255);
            $table->text('notes')->nullable();
            $table->foreignId('cover_image_id')->nullable();
            $table->string('url_alias', 255);
            $table->string('password', 16)->nullable();
            $table->date('date_taken')->nullable();
            $table->boolean('is_press')->default(false);
            $table->boolean('is_public')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('albums');
    }
}
