<?php

namespace App\Http\Controllers;

use App\Models\Wallet;
use App\Models\User;
use App\Models\Payment;
use App\models\Trasaction;

use Illuminate\support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;




use Illuminate\Http\Request;

class WalletController extends Controller
{
    public function showBalance(Request $request)
    {
        try {
            // Ensure the authenticated user is an admin
            $user = Auth::user();
            if (!$user || $user->role !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Only admins can view wallet balances.',
                ], 403); // 403 Forbidden
            }
    
            $userId = $request->query('user_id'); // Retrieve the 'user_id' from query parameters
    
            if ($userId) {
                // Validate the user ID (ensure it exists in the database)
                $validatedData = Validator::make(['user_id' => $userId], [
                    'user_id' => 'required|exists:users,id',
                ]);
    
                if ($validatedData->fails()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Validation failed',
                        'error' => $validatedData->errors(),
                    ], 422); // 422 Unprocessable Entity
                }
    
                // Retrieve the wallet along with the user
                $wallet = Wallet::where('user_id', $userId)->with('user')->first();
    
                if (!$wallet) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Wallet not found for the specified user',
                    ], 404); // 404 Not Found
                }
    
                // Return the wallet details
                return response()->json([
                    'success' => true,
                    'message' => 'Wallet retrieved successfully',
                    'wallet' => [
                        'id' => $wallet->id,
                        'user_id' => $wallet->user->id,
                        'username' => $wallet->user->username,
                        'balance' => $wallet->balance,
                    ],
                ], 200); // 200 OK
            } else {
                // Retrieve all wallets with their user details
                $wallets = Wallet::with('user')->get();
    
                return response()->json([
                    'success' => true,
                    'message' => 'All wallets retrieved successfully',
                    'wallets' => $wallets->map(function ($wallet) {
                        return [
                            'id' => $wallet->id,
                            'user_id' => $wallet->user->id,
                            'username' => $wallet->user->username,
                            'balance' => $wallet->balance,
                        ];
                    }),
                ], 200); // 200 OK
            }
        } catch (\Exception $e) {
            // Log the error for debugging
            Log::error('Error retrieving wallet balance: ' . $e->getMessage());
    
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve wallet balance. Please try again.',
                'error' => $e->getMessage(),
            ], 500); // 500 Internal Server Error
        }
    }
    

    
    public function userBalance($userId)
    {
        try {
            // Ensure the authenticated user is accessing their own wallet
            if (Auth::id() !== (int) $userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access. You can only access your own wallet balance.',
                ], 403); // 403 Forbidden
            }
    
            // Retrieve the wallet for the authenticated user
            $wallet = Wallet::where('user_id', $userId)->with('user')->first();
    
            // Check if a wallet exists for the user
            if (!$wallet) {
                return response()->json([
                    'success' => false,
                    'message' => 'Wallet not found for the specified user.',
                ], 404); // 404 Not Found
            }
    
            // Return the wallet details
            return response()->json([
                'success' => true,
                'message' => 'Wallet balance retrieved successfully.',
                'wallet' => [
                    'id' => $wallet->id,
                    'user_id' => $wallet->user->id,
                    'username' => $wallet->user->username,
                    'balance' => $wallet->balance,
                ],
            ], 200); // 200 OK
        } catch (\Exception $e) {
            // Log the error for debugging
            Log::error('Error retrieving wallet balance: ' . $e->getMessage());
    
            // Return failure response
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve wallet balance. Please try again.',
            ], 500); // 500 Internal Server Error
        }
    }


    // public function updateWalletBalance(Request $request, $agentId)
    // {
    //     try {
    //         // Validate the input
    //         $validatedData = $request->validate([
    //             'amount' => 'required|numeric|min:0.01',
    //             'action' => 'required|in:add,subtract',
    //             'screenshot' => 'required|file|mimes:jpeg,jpg,png,doc,docx,pdf|max:2048',
    //             'details' => 'required|string',
    //         ]);
    
    //         // Check admin privileges
    //         $admin = Auth::user();
    //         if (!$admin || $admin->role !== 'admin') {
    //             return response()->json([
    //                 'success' => false,
    //                 'message' => 'Unauthorized: Only admins can update wallet balances',
    //             ], 403);
    //         }
    
    //         // Ensure the user is an agent
    //         $agent = User::where('id', $agentId)->where('role', 'agent')->first();
    //         if (!$agent) {
    //             return response()->json([
    //                 'success' => false,
    //                 'message' => 'Agent not found or user is not an agent',
    //             ], 404);
    //         }
    
    //         // Retrieve the agent's wallet
    //         $wallet = Wallet::where('user_id', $agentId)->first();
    //         if (!$wallet) {
    //             return response()->json([
    //                 'success' => false,
    //                 'message' => 'Wallet not found for the specified agent',
    //             ], 404);
    //         }
    
    //         DB::beginTransaction(); // Start transaction
    
    //         // Perform balance update
    //         if ($validatedData['action'] === 'add') {
    //             $wallet->balance += $validatedData['amount'];
    //         } elseif ($validatedData['action'] === 'subtract') {
    //             if ($wallet->balance < $validatedData['amount']) {
    //                 return response()->json([
    //                     'success' => false,
    //                     'message' => 'Insufficient balance in wallet',
    //                 ], 400);
    //             }
    //             $wallet->balance -= $validatedData['amount'];
    //         }
    //          // Handle screenshot file upload
    //          if ($request->hasFile('screenshot')) {
    //             $screenshotPath = $request->file('screenshot')->store('screenshots', 'public'); 
    //         } else {
    //             $screenshotPath = null;
    //         }

    //         $wallet->details=$validatedData['details'];
    //         $wallet->screenshot=$screenshotPath;
    
    //         // Save updated wallet balance
    //         $wallet->save();
    
    //         // Handle screenshot file upload
    //         if ($request->hasFile('screenshot')) {
    //             $screenshotPath = $request->file('screenshot')->store('screenshots', 'public'); 
    //         } else {
    //             $screenshotPath = null;
    //         }
    
    //         // Log transaction in the payments table
    //         $payment = Payment::create([
    //             'user_id' => $agentId,
    //             'booking_id' => null,
    //             'amount' => $validatedData['amount'],
    //             'payment_date' => now(),
    //             'description' => 'Admin updated wallet balance',
    //             'mode' => 'manual',
    //             'status' => 'approved',
    //             'details' => $validatedData['details'],
    //             'screenshot' => $screenshotPath, // Save the screenshot path
    //         ]);

    //         $transaction = Trasaction::create([
    //             'user_id' => $agentId,
    //             'booking_id' => null,
    //             'amount' => $validatedData['amount'],
    //             'payment_date' => now(),
    //             'payment_status' => $validatedData['details'],
    //             'mode' => 'manual',
    //             'status' => 'approved',]);
    
    //         DB::commit(); // Commit transaction
    
    //         return response()->json([
    //             'success' => true,
    //             'message' => 'Agent wallet balance updated successfully',
    //             'wallet' => $wallet,
    //             'payment' => $payment,
    //             'transaction'=>$transaction,
    //         ], 200);
    //     } catch (\Illuminate\Validation\ValidationException $e) {
    //         DB::rollBack(); // Rollback on validation error
    //         return response()->json([
    //             'success' => false,
    //             'message' => 'Validation error',
    //             'error' => $e->errors(),
    //         ], 422);
    //     } catch (\Exception $e) {
    //         DB::rollBack(); // Rollback transaction
    //         Log::error('Error updating wallet balance: ' . $e->getMessage());
    
    //         return response()->json([
    //             'success' => false,
    //             'message' => 'Failed to update wallet balance. Please try again.',
    //             'error' => $e->getMessage(),
    //         ], 500);
    //     }
    // }
    
    public function updateWalletBalance(Request $request, $agentId)
{
            // Log::info('Incoming Request Data:', $request->all());

    try {
        // Validate the input
        $validatedData = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'action' => 'required|in:add,subtract',
            'screenshot' => 'required|file|mimes:jpeg,jpg,png,doc,docx,pdf|max:2048',
            'details' => 'required|string',
        ]);

        // Check admin privileges
        $admin = Auth::user();
        if (!$admin || $admin->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized: Only admins can update wallet balances',
            ], 403);
        }

        // Ensure the user is an agent
        $agent = User::where('id', $agentId)->where('role', 'agent')->first();
        if (!$agent) {
            return response()->json([
                'success' => false,
                'message' => 'Agent not found or user is not an agent',
            ], 404);
        }

        // Retrieve the agent's wallet
        $wallet = Wallet::where('user_id', $agentId)->first();
        if (!$wallet) {
            return response()->json([
                'success' => false,
                'message' => 'Wallet not found for the specified agent',
            ], 404);
        }

        DB::beginTransaction(); // Start transaction

        // Handle screenshot file upload
        $screenshotPath = $request->file('screenshot')->store('screenshots', 'public');

        // Perform balance update
        $transactionType = ''; // Define the type of transaction

        if ($validatedData['action'] === 'add') {
            $wallet->balance += $validatedData['amount'];
            $transactionType = 'credit';
        } elseif ($validatedData['action'] === 'subtract') {
            if ($wallet->balance < $validatedData['amount']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Insufficient balance in wallet',
                ], 400);
            }
            $wallet->balance -= $validatedData['amount'];
            $transactionType = 'debit';
        }

        // Update wallet with details and screenshot
        $wallet->details = $validatedData['details'];
        $wallet->screenshot = $screenshotPath;
        $wallet->save();

        // Log transaction in the payments table
        $payment = Payment::create([
            'user_id' => $agentId,
            'booking_id' => null,
            'amount' => $validatedData['amount'],
            'payment_date' => now(),
            'description' => 'Admin updated wallet balance',
            'mode' => 'manual',
            'status' => 'approved',
            'details' => $validatedData['details'],
            'screenshot' => $screenshotPath,
        ]);

        $transaction = Trasaction::create([
                        'user_id' => $agentId,
                        'booking_id' => null,
                        'amount' => $validatedData['amount'],
                        'payment_date' => now(),
                        'payment_status' => $transactionType,
                        'mode' => 'manual',
                        'status' => 'approved',]);

        DB::commit(); // Commit transaction

        return response()->json([
            'success' => true,
            'message' => 'Agent wallet balance updated successfully',
            'wallet' => $wallet,
            'payment' => $payment,
            'transaction' => $transaction,
        ], 200);
    } catch (\Illuminate\Validation\ValidationException $e) {
        DB::rollBack(); // Rollback on validation error
        return response()->json([
            'success' => false,
            'message' => 'Validation error',
            'error' => $e->errors(),
        ], 422);
    } catch (\Exception $e) {
        DB::rollBack(); // Rollback transaction
        Log::error('Error updating wallet balance: ' . $e->getMessage());

        return response()->json([
            'success' => false,
            'message' => 'Failed to update wallet balance. Please try again.',
            'error' => $e->getMessage(),
        ], 500);
    }
}

}
