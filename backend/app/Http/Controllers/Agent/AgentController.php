<?php

namespace App\Http\Controllers\Agent;
use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Trasaction;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Models\Wallet;

class AgentController extends Controller
{
    public function addPayment(Request $request)
    {
        try {
            // Validate the incoming data
            $validatedData = $request->validate([
                'screenshot' => 'required|file|mimes:jpeg,jpg,png,doc,docx,pdf',
                'amount' => 'required|numeric',
                'payment_date' => 'required|date',
                'description' => 'required|string',
                'mode' => 'required|string',
            ]);
    
            // Handle document upload
            $documentPath = null;
            if ($request->hasFile('screenshot')) {
                try {
                    $documentPath = 'payment/' . time() . '_' . $request->file('screenshot')->getClientOriginalName();
                    $request->file('screenshot')->move(public_path('payment'), $documentPath);
                } catch (\Exception $e) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Failed to upload screenshot.',
                        'error' => $e->getMessage(),
                    ], 500);
                }
            }
    
            // Create payment record
            $payment = Payment::create([
                'user_id' => Auth::id(),
                'screenshot' => $documentPath,
                'amount' => $validatedData['amount'],
                'payment_date' => $validatedData['payment_date'],
                'description' => $validatedData['description'],
                'mode' => $validatedData['mode'],
                'status' => 'pending',  // Initially set status as pending
            ]);
    
            // Create transaction record (associated with the payment)
            $transaction = Trasaction::create([
                'user_id' => Auth::id(),
                'amount' => $validatedData['amount'],
                'payment_date' => $validatedData['payment_date'],
                'payment_status' => 'Credit',  // Set the payment status to Credit initially
                'mode' => $validatedData['mode'],
                'status' => 'pending',  // Initially set transaction status as pending
            ]);
    
            // Return success response
            return response()->json([
                'success' => true,
                'message' => 'Payment added successfully. Waiting for Admin Approval.',
                'payment' => $payment,
                'transaction' => $transaction,  // Return the transaction associated with the payment
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Return validation error response
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'error' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            // Return generic error response
            return response()->json([
                'success' => false,
                'message' => 'Failed to add payment. Please try again.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    


    public function showPayment()
{
    try {
        // Check if the authenticated user is an admin
        $user = Auth::user();
        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Only admins can view this data.',
            ], 403);
        }

        // Fetch all payment records
        $payments = Payment::all();

        return response()->json([
            'success' => true,
            'payments' => $payments,
        ], 200);
    } catch (\Exception $e) {
        // Handle unexpected errors
        return response()->json([
            'success' => false,
            'message' => 'Failed to fetch payment records.',
            'error' => $e->getMessage(),
        ], 500);
    }
}

public function showTransaction()
{
    try {
        // Check if the authenticated user is an admin
        $user = Auth::user();
        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Only admins can view this data.',
            ], 403);
        }

        // Fetch all transaction records
        $transactions = Trasaction::all();

        return response()->json([
            'success' => true,
            'transactions' => $transactions,
        ], 200);
    } catch (\Exception $e) {
        // Handle unexpected errors
        return response()->json([
            'success' => false,
            'message' => 'Failed to fetch transaction records.',
            'error' => $e->getMessage(),
        ], 500);
    }
}

public function showuserTransaction()
{
    try {
        // Get the authenticated user's ID
        $userId = Auth::id();

        // Fetch transactions belonging to the authenticated user
        $transactions = Trasaction::where('user_id', $userId)->get();

        return response()->json([
            'success' => true,
            'transactions' => $transactions,
        ], 200);
    } catch (\Exception $e) {
        // Handle unexpected errors
        return response()->json([
            'success' => false,
            'message' => 'Failed to fetch transaction records.',
            'error' => $e->getMessage(),
        ], 500);
    }
}

public function showUserPayment()
{
    try {
        // Get the authenticated user's ID
        $userId = Auth::id();

        // Fetch payments belonging to the authenticated user
        $payments = Payment::where('user_id', $userId)->get();

        return response()->json([
            'success' => true,
            'payments' => $payments,
        ], 200);
    } catch (\Exception $e) {
        // Handle unexpected errors
        return response()->json([
            'success' => false,
            'message' => 'Failed to fetch payment records.',
            'error' => $e->getMessage(),
        ], 500);
    }
}

// public function approvePayment(Request $request, $paymentId)
// {
//     try {
//         // Ensure the authenticated user is an admin
//         $user = Auth::user();
//         if ($user->role !== 'admin') {
//             return response()->json([
//                 'success' => false,
//                 'message' => 'Access denied. Only admins can approve payments.',
//             ], 403);
//         }

//         // Validate the request
//         $validatedData = $request->validate([
//             'status' => 'required|in:approved,denied', // Only 'approved' or 'denied' are allowed
//         ]);

//         // Find the payment record by paymentId
//         $payment = Payment::findOrFail($paymentId);

//         // Ensure the payment is still in 'pending' status
//         if ($payment->status !== 'pending') {
//             return response()->json([
//                 'success' => false,
//                 'message' => 'Payment is already processed.',
//             ], 400);
//         }

//         // Update the payment status (approved or denied)
//         $payment->status = $validatedData['status']; // Set status to 'approved' or 'denied'
//         $payment->save();

//         // Find the transaction associated with the same user_id and update based on the approval status
//         $transaction = Trasaction::where('user_id', $payment->user_id)
//             ->where('status', 'pending')
//             ->firstOrFail();
//         $transaction->status = $validatedData['status']; // Set status to 'approved' or 'denied'
//         $transaction->payment_status = $validatedData['status'] === 'approved' ? 'Credit' : 'Failed';
//         $transaction->save();

//         // Update the wallet balance if the payment is approved
//         if ($validatedData['status'] === 'approved') {
//             $wallet = Wallet::where('user_id', $payment->user_id)->first();
//             if ($wallet) {
//                 $wallet->balance += $payment->amount; // Add the payment amount to the wallet balance
//                 $wallet->save();
//             } else {
//                 return response()->json([
//                     'success' => false,
//                     'message' => 'Wallet not found for the user.',
//                 ], 404);
//             }
//         }

//         return response()->json([
//             'success' => true,
//             'message' => 'Payment has been successfully ' . $validatedData['status'] . '.',
//             'payment' => $payment,
//             'transaction' => $transaction,
//         ], 200);
//     } catch (\Illuminate\Validation\ValidationException $e) {
//         // Handle validation errors
//         return response()->json([
//             'success' => false,
//             'message' => 'Validation failed.',
//             'error' => $e->errors(),
//         ], 422);
//     } catch (\Exception $e) {
//         // Handle unexpected errors
//         return response()->json([
//             'success' => false,
//             'message' => 'Failed to process payment approval.',
//             'error' => $e->getMessage(),
//         ], 500);
//     }
// }

public function approvePayment(Request $request, $paymentId)
{
    try {
        $user = Auth::user();
        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Only admins can approve payments.',
            ], 403);
        }

        $validatedData = $request->validate([
            'status' => 'required|in:approved,denied',
        ]);

        $payment = Payment::findOrFail($paymentId);

        if ($payment->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Payment is already processed.',
            ], 400);
        }

        $payment->status = $validatedData['status'];
        $payment->save();

        // Fetch the transaction based on user_id and amount
        $transaction = Trasaction::where('user_id', $payment->user_id)
            ->where('amount', $payment->amount)
            ->where('status', 'pending')
            ->firstOrFail();
        $transaction->status = $validatedData['status'];
        $transaction->payment_status = $validatedData['status'] === 'approved' ? 'Credit' : 'Failed';
        $transaction->save();

        if ($validatedData['status'] === 'approved') {
            $wallet = Wallet::where('user_id', $payment->user_id)->first();
            if ($wallet) {
                $wallet->balance += $payment->amount;
                $wallet->save();
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Wallet not found for the user.',
                ], 404);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Payment has been successfully ' . $validatedData['status'] . '.',
            'payment' => $payment,
            'transaction' => $transaction,
        ], 200);
    } catch (\Illuminate\Validation\ValidationException $e) {
        return response()->json([
            'success' => false,
            'message' => 'Validation failed.',
            'error' => $e->errors(),
        ], 422);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to process payment approval.',
            'error' => $e->getMessage(),
        ], 500);
    }
}





}

