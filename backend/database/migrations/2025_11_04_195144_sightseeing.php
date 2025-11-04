<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
public function up(): void
    {
       Schema::create('sightseeings', function (Blueprint $table) {
        $table->id();
        $table->foreignId('destination_id')->constrained('destinations');
        $table->string('company_name', 255);
        $table->string('address', 255);
        $table->text('description')->nullable();
        $table->decimal('rate_adult', 8, 2)->default(0);
        $table->decimal('rate_child', 8, 2)->default(0);
        $table->decimal('sharing_transfer_adult', 8, 2)->default(0);
        $table->decimal('sharing_transfer_child', 8, 2)->default(0);
        $table->json('terms_and_conditions')->nullable();
        $table->timestamps();
    });
    }


    public function down(): void
    {
        Schema::dropIfExists('sightseeings');
    }
};
