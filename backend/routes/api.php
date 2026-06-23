<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\AdminAuthController;
use App\Http\Controllers\Api\SettingController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::post('/orders', [OrderController::class, 'store']);
Route::get('/settings', [SettingController::class, 'index']);

// Public admin auth
Route::post('/admin/login', [AdminAuthController::class, 'login']);

// Protected admin routes — require a valid admin token
Route::middleware('admin.token')->group(function () {
    Route::get('/admin/me', [AdminAuthController::class, 'me']);
    Route::post('/admin/logout', [AdminAuthController::class, 'logout']);

    // Only existing admins can register new admin accounts
    Route::post('/admin/register', [AdminAuthController::class, 'register']);

    Route::get('/admin/orders', [OrderController::class, 'index']);
    Route::get('/admin/orders/{order}', [OrderController::class, 'show']);
    Route::patch('/admin/orders/{order}/status', [OrderController::class, 'updateStatus']);
    Route::delete('/admin/orders/{order}', [OrderController::class, 'destroy']);
    Route::patch('/admin/settings', [SettingController::class, 'update']);
});

