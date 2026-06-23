<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    /**
     * Store a new title order submitted from the frontend form.
     * Public endpoint — no auth required.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'first_name'       => 'required|string|max:100',
            'last_name'        => 'required|string|max:100',
            'email'            => 'required|email|max:255',
            'phone'            => 'required|string|max:20',
            'street_address'   => 'required|string|max:255',
            'street_address2'  => 'nullable|string|max:255',
            'city'             => 'required|string|max:100',
            'state'            => 'required|string|max:100',
            'zip'              => 'required|string|max:20',
            'co_agent'         => 'required|in:Yes,No',
            'party'            => 'required|string|max:100',
            'other_first_name' => 'nullable|string|max:100',
            'other_last_name'  => 'nullable|string|max:100',
            'other_email'      => 'nullable|email|max:255',
            'other_phone'      => 'nullable|string|max:20',
            'vacant_land'      => 'required|in:Yes,No',
            'financing'        => 'nullable|string|max:100',
            'hoa'              => 'required|in:Yes,No',
            'referral'         => 'required|in:Yes,No',
            'notes'            => 'nullable|string',
            'files'            => 'nullable|array',
            'files.*'          => 'file|max:20480', // limit 20MB per file
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();

        // 1. Process files if uploaded
        $uploadedFiles = [];
        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                if ($file->isValid()) {
                    $originalName = $file->getClientOriginalName();
                    // Clean up special characters from file name
                    $cleanName = preg_replace('/[^A-Za-z0-9\._-]/', '', $originalName);
                    $filename = time() . '_' . $cleanName;
                    
                    // Create directory if not exists
                    if (!file_exists(public_path('uploads'))) {
                        mkdir(public_path('uploads'), 0777, true);
                    }
                    
                    $file->move(public_path('uploads'), $filename);
                    $uploadedFiles[] = [
                        'name' => $originalName,
                        'path' => '/uploads/' . $filename,
                    ];
                }
            }
        }
        $data['files'] = $uploadedFiles;

        // 2. Create the order
        $order = Order::create($data);

        // 3. Register user if they do not exist
        $user = \App\Models\User::where('email', $data['email'])->first();
        $isNewUser = false;
        if (!$user) {
            $user = \App\Models\User::create([
                'name' => trim($data['first_name'] . ' ' . $data['last_name']),
                'email' => $data['email'],
                'password' => \Illuminate\Support\Facades\Hash::make(\Illuminate\Support\Str::random(16)),
            ]);
            $isNewUser = true;
        }

        return response()->json([
            'success' => true,
            'message' => 'Order submitted successfully.',
            'order'   => $order,
            'user'    => [
                'name' => $user->name,
                'email' => $user->email,
                'is_new' => $isNewUser,
            ]
        ], 201);
    }

    /**
     * Get all orders for the admin dashboard.
     * Protected by admin token via middleware.
     */
    public function index(Request $request)
    {
        $query = Order::query();

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Search by name or email
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('city', 'like', "%{$search}%");
            });
        }

        $orders = $query->latest()->get();

        return response()->json([
            'success' => true,
            'orders'  => $orders,
            'total'   => $orders->count(),
        ]);
    }

    /**
     * Get a single order.
     */
    public function show(Order $order)
    {
        return response()->json([
            'success' => true,
            'order'   => $order,
        ]);
    }

    /**
     * Update order status (admin action).
     */
    public function updateStatus(Request $request, Order $order)
    {
        $request->validate([
            'status' => 'required|in:new,in_progress,closed',
        ]);

        $order->update(['status' => $request->status]);

        return response()->json([
            'success' => true,
            'order'   => $order->fresh(),
        ]);
    }

    /**
     * Delete an order (admin action).
     */
    public function destroy(Order $order)
    {
        $order->delete();

        return response()->json([
            'success' => true,
            'message' => 'Order deleted.',
        ]);
    }
}
