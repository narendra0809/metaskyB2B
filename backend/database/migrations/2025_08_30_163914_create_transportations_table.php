<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTransportationsTable extends Migration
{

    public function up()
    {
        Schema::create('transportations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('destination_id')->constrained('destinations');
            $table->string('company_name', 255);
            $table->string('company_document')->nullable();
            $table->string('address', 255);
            $table->string('transport');
            $table->string('vehicle_type');
            $table->json('options')->nullable();
            $table->json('terms_and_conditions')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('transportations');
    }
}
