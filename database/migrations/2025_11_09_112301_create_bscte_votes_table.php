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
        Schema::create('bscte_votes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bscte_id')->constrained('bsctes')->onDelete('cascade');
            $table->string('position')->nullable();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->index(['bscte_id', 'user_id']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bscte_votes');
    }
};
