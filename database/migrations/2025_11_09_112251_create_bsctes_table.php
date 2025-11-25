<?php

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
        Schema::create('bsctes', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('position')->index();
            $table->string('course_program')->index();
            $table->string('party_list')->nullable()->index();
            $table->date('date_of_filling')->nullable()->index();
            $table->string('year_level')->nullable()->index();
            $table->integer('age')->nullable()->index();
            $table->integer('bscte_votes')->default(0);
            $table->string('image')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bsctes');
    }
};
