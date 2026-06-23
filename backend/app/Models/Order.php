<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone',
        'street_address',
        'street_address2',
        'city',
        'state',
        'zip',
        'co_agent',
        'party',
        'other_first_name',
        'other_last_name',
        'other_email',
        'other_phone',
        'vacant_land',
        'financing',
        'hoa',
        'referral',
        'notes',
        'files',
        'status',
    ];

    protected $casts = [
        'files' => 'array',
    ];
}
