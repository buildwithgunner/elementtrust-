<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AdminAuthController extends Controller
{
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();
        $admin = Admin::where('email', strtolower($data['email']))->first();

        if (!$admin || !Hash::check($data['password'], $admin->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid admin credentials.',
            ], 401);
        }

        $admin->tokens()->delete();

        return response()->json([
            'success' => true,
            'admin' => [
                'id' => $admin->id,
                'name' => $admin->name,
                'email' => $admin->email,
            ],
            'token' => $admin->createToken('admin-dashboard')->plainTextToken,
        ]);
    }

    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'                  => 'required|string|max:100',
            'email'                 => 'required|email|unique:admins,email',
            'password'              => 'required|string|min:8|confirmed',
            'password_confirmation' => 'required|string',
        ], [
            'email.unique'          => 'An admin with that email already exists.',
            'password.confirmed'    => 'Passwords do not match.',
            'password.min'          => 'Password must be at least 8 characters.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors(),
            ], 422);
        }

        $newAdmin = Admin::create([
            'name'     => trim($request->name),
            'email'    => strtolower(trim($request->email)),
            'password' => Hash::make($request->password),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Admin account created successfully.',
            'admin'   => [
                'id'    => $newAdmin->id,
                'name'  => $newAdmin->name,
                'email' => $newAdmin->email,
            ],
        ], 201);
    }

    public function me(Request $request)
    {
        $admin = $request->attributes->get('admin');

        return response()->json([
            'success' => true,
            'admin'   => [
                'id'    => $admin->id,
                'name'  => $admin->name,
                'email' => $admin->email,
            ],
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out.',
        ]);
    }
}
