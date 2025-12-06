<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

use App\Models\Payment;
Use App\Models\Trasaction;
Use App\Models\Wallet;
Use App\Models\User;

use App\Models\Booking;


class BookingController extends Controller
{


    public function addBooking(Request $request)
    {
        // Log::info('Incoming Request Data:', $request->all());

        try {
            $validatedData = $request->validate([
            'user_id' => 'required|exists:users,id',
            'customer_name' => 'required|string',
            'phone_no' => 'required|string',
            'travel_date_from' => 'required|date',
            'travel_date_to' => 'required|date',
            'no_adults' => 'required|integer',
            'no_children' => 'required|integer',
            'ticket_info' => 'nullable|array',
            'ticket_info.*.id' => 'required|string',
            'ticket_info.*.name' => 'required|string',
            'ticket_info.*.date' => 'required|date',
            'ticket_info.*.start_time' => 'nullable|string',
            'ticket_info.*.has_time_slots' => 'required|numeric',
            'ticket_info.*.adult_price' => 'required|numeric',
            'ticket_info.*.child_price' => 'required|numeric',
            'ticket_info.*.adults' => 'required|numeric',
            'ticket_info.*.children' => 'required|numeric',
            'ticket_info.*.terms_and_conditions' => 'nullable|json',
            'transport_info' => 'nullable|array',
            'transport_info.*.destination_id' => 'nullable|exists:destinations,id',
            'transport_info.*.transport_id' => 'nullable|exists:transportations,id',
            'transport_info.*.v_type' => 'nullable|string',
            'transport_info.*.option_index' => 'nullable|string',
            'transport_info.*.date' => 'nullable|date',
            'transport_info.*.transport_cost' => 'nullable|numeric',
            'transport_info.*.terms_and_conditions' => 'nullable|json',
            'sightseeing_info' => 'nullable|array',
            'sightseeing_info.*.destination_id' => 'nullable|exists:destinations,id',
            'sightseeing_info.*.sightseeing_id' => 'nullable|exists:sightseeings,id',
            'sightseeing_info.*.adults' => 'nullable|integer',
            'sightseeing_info.*.children' => 'nullable|integer',
            'sightseeing_info.*.date' => 'nullable|date',
            'sightseeing_info.*.rate_adult' => 'nullable|numeric',
            'sightseeing_info.*.rate_child' => 'nullable|numeric',
            'sightseeing_info.*.terms_and_conditions' => 'nullable|json',
            'remarks' => 'nullable|string',
            'taxes' => 'nullable|array',
            'taxes.*.tax_name' => 'nullable|string',
            'taxes.*.tax_value' => 'nullable|numeric',
            'final_payment' => 'required|numeric',
            'total_per_adult' => 'required|numeric',
            'total_per_child' => 'required|numeric',
            'customer_status' => 'required|in:pending,confirmed,cancelled',
            'payment_status' => 'required|in:unpaid,paid',
        ]);

    // Encode nested arrays as JSON
    $ticketInfo = $validatedData['ticket_info'] ? json_encode($validatedData['ticket_info']) : null;
    $transportInfo = $validatedData['transport_info'] ? json_encode($validatedData    ['transport_info']) : null;
    $sightseeingInfo = $validatedData['sightseeing_info'] ? json_encode($validatedData    ['sightseeing_info']) : null;
    $taxes = $validatedData['taxes'] ? json_encode($validatedData['taxes']) : null;

             // Create the booking
             $booking = Booking::create([
             'user_id' => $validatedData['user_id'],
             'customer_name' => $validatedData['customer_name'],
             'phone_no' => $validatedData['phone_no'],
             'travel_date_from' => $validatedData['travel_date_from'],
             'travel_date_to' => $validatedData['travel_date_to'],
             'no_adults' => $validatedData['no_adults'],
             'no_children' => $validatedData['no_children'],
             'ticket_info' => $ticketInfo,
             'transport_info' => $transportInfo,
             'sightseeing_info' => $sightseeingInfo,
             'remarks' => $validatedData['remarks'] ?? null,
             'taxes' => $taxes,
             'final_payment' => $validatedData['final_payment'],
             'total_per_adult' => $validatedData['total_per_adult'],
             'total_per_child' => $validatedData['total_per_child'],
             'customer_status' => 'pending',
             'payment_status' => $validatedData['payment_status'],
             'created_date' => now(),
             'converted_date' => null,
             ]);

            // Create related records (Payment and Transaction)
            // $payment = Payment::create([
            //     'user_id' => $validatedData['user_id'],
            //     'booking_id' => $booking->id,
            //     'amount' => $validatedData['final_payment'],
            //     'payment_date' => now(),
            //     'description' => 'package',
            //     'mode' => 'manual',
            //     'status' => 'pending',
            // ]);

            // $transaction = Trasaction::create([
            //     'user_id' => $validatedData['user_id'],
            //     'booking_id' => $booking->id,
            //     'amount' => $validatedData['final_payment'],
            //     'payment_date' => now(),
            //     'payment_status' => 'Debit',
            //     'mode' => 'manual',
            //     'status' => 'pending',
            // ]);

            return response()->json([
                'success' => true,
                'message' => 'Booking added successfully. Waiting for admin approval.',
                'booking' => $booking,
                // 'payment' => $payment,
                // 'transaction' => $transaction,
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error adding booking: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to add booking. Please try again.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
public function editBooking(Request $request, $bookingId)
{
    try {
        // Find the booking
        $booking = Booking::findOrFail($bookingId);

        // Check if the booking status is 'approved'
        if ($booking->customer_status === 'approved') {
            return response()->json([
                'success' => false,
                'message' => 'Booking cannot be edited. Contact admin for further assistance.',
            ], 403);
        }

        // Get the authenticated user
        $user = Auth::user();

        // Check if the user is an admin or the agent who created the booking
        if ($user->role === 'admin' || ($user->role === 'agent' && $booking->user_id === $user->id)) {
            // Validate the incoming request
            $validatedData = $request->validate([
                'customer_name' => 'sometimes|required|string',
                'phone_no' => 'sometimes|required|string',
                'travel_date_from' => 'sometimes|required|date',
                'travel_date_to' => 'sometimes|required|date',
                'no_adults' => 'sometimes|required|integer',
                'no_children' => 'sometimes|required|integer',
                'ticket_info' => 'nullable|array',
                'ticket_info.*.id' => 'nullable|string',
                'ticket_info.*.name' => 'nullable|string',
                'ticket_info.*.date' => 'nullable|date',
                'ticket_info.*.start_time' => 'nullable|string',
                'ticket_info.*.adult_price' => 'nullable|numeric',
                'ticket_info.*.child_price' => 'nullable|numeric',
                'ticket_info.*.adults' => 'nullable|numeric',
                'ticket_info.*.children' => 'nullable|numeric',
                'ticket_info.*.terms_and_conditions' => 'nullable|json',
                'transport_info' => 'nullable|array',
                'transport_info.*.destination_id' => 'nullable|exists:destinations,id',
                'transport_info.*.transport_id' => 'nullable|exists:transportations,id',
                'transport_info.*.v_type' => 'nullable|string',
                'transport_info.*.option_index' => 'nullable|string',
                'transport_info.*.date' => 'nullable|date',
                'transport_info.*.transport_cost' => 'nullable|numeric',
                'transport_info.*.terms_and_conditions' => 'nullable|json',
                'sightseeing_info' => 'nullable|array',
                'sightseeing_info.*.destination_id' => 'nullable|exists:destinations,id',
                'sightseeing_info.*.sightseeing_id' => 'nullable|exists:sightseeings,id',
                'sightseeing_info.*.adults' => 'nullable|integer',
                'sightseeing_info.*.children' => 'nullable|integer',
                'sightseeing_info.*.date' => 'nullable|date',
                'sightseeing_info.*.rate_adult' => 'nullable|numeric',
                'sightseeing_info.*.rate_child' => 'nullable|numeric',
                'sightseeing_info.*.terms_and_conditions' => 'nullable|json',
                'remarks' => 'nullable|string',
                'taxes' => 'nullable|array',
                'taxes.*.tax_name' => 'nullable|string',
                'taxes.*.tax_value' => 'nullable|numeric',
                'final_payment' => 'sometimes|required|numeric',
                'total_per_adult' => 'sometimes|required|numeric',
                'total_per_child' => 'sometimes|required|numeric',
                'customer_status' => 'sometimes|required|in:pending,confirmed,cancelled',
                'payment_status' => 'sometimes|required|in:unpaid,paid',
            ]);

            // Encode nested arrays as JSON
            $ticketInfo = isset($validatedData['ticket_info']) ? json_encode($validatedData['ticket_info']) : $booking->ticket_info;
            $transportInfo = isset($validatedData['transport_info']) ? json_encode($validatedData['transport_info']) : $booking->transport_info;
            $sightseeingInfo = isset($validatedData['sightseeing_info']) ? json_encode($validatedData['sightseeing_info']) : $booking->sightseeing_info;
            $taxes = isset($validatedData['taxes']) ? json_encode($validatedData['taxes']) : $booking->taxes;

            // Update the booking
            $booking->update([
                'customer_name' => $validatedData['customer_name'] ?? $booking->customer_name,
                'phone_no' => $validatedData['phone_no'] ?? $booking->phone_no,
                'travel_date_from' => $validatedData['travel_date_from'] ?? $booking->travel_date_from,
                'travel_date_to' => $validatedData['travel_date_to'] ?? $booking->travel_date_to,
                'no_adults' => $validatedData['no_adults'] ?? $booking->no_adults,
                'no_children' => $validatedData['no_children'] ?? $booking->no_children,
                'ticket_info' => $ticketInfo,
                'transport_info' => $transportInfo,
                'sightseeing_info' => $sightseeingInfo,
                'remarks' => $validatedData['remarks'] ?? $booking->remarks,
                'taxes' => $taxes,
                'final_payment' => $validatedData['final_payment'] ?? $booking->final_payment,
                'total_per_adult' => $validatedData['total_per_adult'] ?? $booking->total_per_adult,
                'total_per_child' => $validatedData['total_per_child'] ?? $booking->total_per_child,
                'customer_status' => $validatedData['customer_status'] ?? $booking->customer_status,
                'payment_status' => $validatedData['payment_status'] ?? $booking->payment_status,
            ]);

            // Update related Payment record
            // $payment = Payment::where('booking_id', $booking->id)->first();
            // if ($payment) {
            //     $payment->update([
            //         'amount' => $validatedData['final_payment'] ?? $payment->amount,
            //         // 'status' => $validatedData['payment_status'] ?? $payment->status,
            //     ]);
            // }

            // // Update related Transaction record
            // $transaction = Trasaction::where('booking_id', $booking->id)->first();
            // if ($transaction) {
            //     $transaction->update([
            //         'amount' => $validatedData['final_payment'] ?? $transaction->amount,
            //         // 'payment_status' => $validatedData['payment_status'] === 'paid' ? 'Credit' : 'Debit',
            //         // 'status' => $validatedData['payment_status'] ?? $transaction->status,
            //     ]);
            // }

            return response()->json([
                'success' => true,
                'message' => 'Booking updated successfully.',
                'booking' => $booking,
                // 'payment' => $payment,
                // 'transaction' => $transaction,
            ], 200);
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to edit this booking.',
            ], 403);
        }
    } catch (\Exception $e) {
        Log::error('Error updating booking: ' . $e->getMessage());

        return response()->json([
            'success' => false,
            'message' => 'Failed to update booking. Please try again.',
            'error' => $e->getMessage(),
        ], 500);
    }
}



    public function showBookingsByUser($user_id)
{
    try {
        // Get the authenticated user
        $user = Auth::user();

        // Check if the authenticated user is an admin or the user requesting their own bookings
        if ($user->role !== 'admin' && $user->id !== (int) $user_id) {
            // Unauthorized response for non-admins or non-matching users
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to view these bookings.',
            ], 403); // 403 Forbidden
        }

        // Get all bookings related to the user_id
        $bookings = Booking::where('user_id', $user_id)->get();

        // Check if bookings exist for the user
        if ($bookings->isEmpty()) {
            return response()->json([
                'success' => true,
                'message' => 'No bookings found for this user.',
            ], 200); // 404 Not Found
        }

        // Fetch the transactions and payments for each booking
        $bookingsWithDetails = $bookings->map(function ($booking) {
            $transaction = Trasaction::where('booking_id', $booking->id)->first();
            $payment = Payment::where('booking_id', $booking->id)->first();

            return [
                'booking' => $booking,
                'transaction' => $transaction,
                'payment' => $payment,
            ];
        });

        // Return the bookings with transaction and payment details
        return response()->json([
            'success' => true,
            'message' => 'Bookings retrieved successfully.',
            'data' => $bookingsWithDetails,
        ], 200); // 200 OK
    } catch (\Exception $e) {
        // Log the error for debugging
        Log::error('Error retrieving bookings: ' . $e->getMessage());

        // Return a general error response
        return response()->json([
            'success' => false,
            'message' => 'Failed to retrieve bookings. Please try again.',
            'error' => $e->getMessage(),
        ], 500); // 500 Internal Server Error
    }
}


public function getAllBookings()
{
    try {
        // Get the authenticated user
        $user = Auth::user();

        // Check if the user is an admin
        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to view all bookings.',
            ], 403); // 403 Forbidden
        }

        // Fetch all bookings
        $bookings = Booking::all();
        $transaction = Trasaction::all();
        $payment = Payment::all();


        // Return a success response with the bookings
        return response()->json([
            'success' => true,
            'message' => 'Bookings retrieved successfully.',
            'data' => $bookings,$transaction,$payment,
        ], 200); // 200 OK
    } catch (\Exception $e) {
        // Log the error for debugging
        Log::error('Error retrieving all bookings: ' . $e->getMessage());

        // Return a general error response
        return response()->json([
            'success' => false,
            'message' => 'Failed to retrieve bookings. Please try again.',
            'error' => $e->getMessage(),
        ], 500); // 500 Internal Server Error
    }
}


public function approveBooking($bookingId)
{
    try {
        $user = Auth::user();
        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Only admins can approve payments.',
            ], 403);
        }
        $booking = Booking::findOrFail($bookingId);
        Log::info('Error processing booking approval: ' .$booking);
        if($booking->customer_status=="pending"){
            $status = 'confirmed';
        $booking->customer_status = $status;
        $booking->converted_date = now();
        $booking->save();
        }else{
            return response()->json([
                'success' => false,
                'message' => 'Already booking approval. '
            ], 500);
        }



        return response()->json([
            'success' => true,
            'message' => 'Booking approval processed successfully.',
            'booking' => $booking,
        ], 200);
    } catch (\Exception $e) {
        Log::error('Error processing booking approval: ' . $e->getMessage());

        return response()->json([
            'success' => false,
            'message' => 'Failed to process booking approval. Please try again.',
            'error' => $e->getMessage(),
        ], 500);
    }
}
public function bookingPayment($bookingId)
{
    try {
        $user = Auth::user();
        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Only admins can approve payments.',
            ], 403);
        }

        // Retrieve payment and transaction records
        $payment = Payment::where('booking_id', $bookingId)->first();
        $transaction = Trasaction::where('booking_id', $bookingId)->first();

        if (!$payment) {
            return response()->json([
                'success' => false,
                'message' => 'Payment record not found for the given booking ID.',
            ], 404);
        }

        if (!$transaction) {
            return response()->json([
                'success' => false,
                'message' => 'Transaction record not found for the given booking ID.',
            ], 404);
        }

        // Wallet balance check
        $wallet = Wallet::where('user_id', $payment->user_id)->first();
        if (!$wallet) {
            return response()->json([
                'success' => false,
                'message' => 'Wallet not found for the user.',
            ], 404);
        }

        if ($wallet->balance < $payment->amount) {
            return response()->json([
                'success' => false,
                'message' => "Insufficient balance in your wallet. Available balance: {$wallet->balance}",
            ], 400);
        }

        // Use a database transaction to ensure atomicity
        DB::beginTransaction();

        try {
            // Deduct wallet balance
            $wallet->balance -= $payment->amount;
            $wallet->save();

            // Update payment status
            if ($payment->status === 'pending') {
                $payment->status = 'approved';
                $payment->save();
            } else {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Payment has already been approved.',
                    'payment' => $payment,
                ], 400);
            }
            $booking = Booking::findOrFail($bookingId);
            if($booking->payment_status=="unpaid"){
                $status = 'paid';
            $booking->payment_status = $status;
            $booking->save();
            }else{
                return response()->json([
                    'success' => false,
                    'message' => 'Already Paid Amount. '
                ], 500);
            }
            // Update transaction status
            if ($transaction->status === 'pending') {
                $transaction->status = 'approved';
                $transaction->save();
            } else {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Transaction has already been approved.',
                    'transaction' => $transaction,
                ], 400);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Payment and transaction approved successfully.',
                'wallet' => $wallet,
                'payment' => $payment,
                'transaction' => $transaction,
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error processing booking payment: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to process booking payment. Please try again.',
                'error' => $e->getMessage(),
            ], 500);
        }

    } catch (\Exception $e) {
        Log::error('Unexpected error processing booking payment: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to process booking payment. Please try again.',
            'error' => $e->getMessage(),
        ], 500);
    }
}



public function cancelBooking($bookingId)
{
    try {
        $user = Auth::user();

        // Only admin can cancel bookings
        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Only admins can cancel bookings.',
            ], 403);
        }

        // Retrieve the booking
        $booking = Booking::findOrFail($bookingId);

        // Check if the booking is already cancelled
        if ($booking->customer_status === 'cancelled') {
            return response()->json([
                'success' => false,
                'message' => 'Booking is already cancelled.',
            ], 400);
        }

        // Check if the booking is approved (both payment and customer status)
        if ($booking->payment_status !== 'paid' || $booking->customer_status !== 'confirmed') {
            return response()->json([
                'success' => false,
                'message' => 'Booking cannot be cancelled. It must be approved (paid and confirmed) first.',
            ], 400);
        }

        // Retrieve payment and transaction records
        $payment = Payment::where('booking_id', $bookingId)->first();
        $transaction = Trasaction::where('booking_id', $bookingId)->first();

        if (!$payment || !$transaction) {
            return response()->json([
                'success' => false,
                'message' => 'Payment or transaction record not found for the given booking ID.',
            ], 404);
        }

        // Retrieve the agent's wallet
        $wallet = Wallet::where('user_id', $payment->user_id)->first();
        if (!$wallet) {
            return response()->json([
                'success' => false,
                'message' => 'Wallet not found for the agent.',
            ], 404);
        }

        // Use a database transaction to ensure atomicity
        DB::beginTransaction();

        try {
            // Revert the payment amount back to the agent's wallet
            $wallet->balance += $payment->amount;
            $wallet->save();

            // Update booking status to cancelled
            $booking->customer_status = 'cancelled';
            $booking->payment_status = 'failed'; // Optional: Add a new status for refunded payments
            $booking->save();

            // Update payment status to refunded
            $payment->status = 'denied';
            $payment->save();

            // Update transaction status to refunded
            $transaction->status = 'denied';
            $transaction->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Booking cancelled successfully. Payment reverted to the agent\'s wallet.',
                'booking' => $booking,
                'wallet' => $wallet,
                'payment' => $payment,
                'transaction' => $transaction,
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error cancelling booking: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel booking. Please try again.',
                'error' => $e->getMessage(),
            ], 500);
        }

    } catch (\Exception $e) {
        Log::error('Unexpected error cancelling booking: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to cancel booking. Please try again.',
            'error' => $e->getMessage(),
        ], 500);
    }
}


}


















