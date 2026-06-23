<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function index()
    {
        $settings = Setting::all()->pluck('value', 'key');
        
        return response()->json([
            'email' => $settings->get('email', 'orders@example.com'),
            'phone' => $settings->get('phone', '(352) 450-3211'),
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'phone' => 'required|string',
        ]);

        Setting::updateOrCreate(
            ['key' => 'email'],
            ['value' => $request->input('email')]
        );

        Setting::updateOrCreate(
            ['key' => 'phone'],
            ['value' => $request->input('phone')]
        );

        return response()->json([
            'message' => 'Settings updated successfully.',
            'settings' => [
                'email' => $request->input('email'),
                'phone' => $request->input('phone'),
            ]
        ]);
    }
}
