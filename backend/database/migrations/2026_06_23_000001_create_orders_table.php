<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();

            // Agent info
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email');
            $table->string('phone');

            // Property address
            $table->string('street_address');
            $table->string('street_address2')->nullable();
            $table->string('city');
            $table->string('state');
            $table->string('zip');

            // Transaction details
            $table->string('co_agent');          // Yes / No
            $table->string('party');             // Buyer's Agent, Seller's Agent, etc.

            // Other agent contact
            $table->string('other_first_name')->nullable();
            $table->string('other_last_name')->nullable();
            $table->string('other_email')->nullable();
            $table->string('other_phone')->nullable();

            // Property flags
            $table->string('vacant_land');       // Yes / No
            $table->string('financing')->nullable();
            $table->string('hoa');               // Yes / No
            $table->string('referral');          // Yes / No

            // Notes
            $table->text('notes')->nullable();

            // Files JSON list
            $table->text('files')->nullable();

            // Status for admin tracking
            $table->string('status')->default('new'); // new | in_progress | closed

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
