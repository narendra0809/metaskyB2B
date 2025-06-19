<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
Use App\Models\BankDetail;
use Illuminate\Support\Facades\Auth;

class BankdetailController extends Controller
{
    public function bankdetail(Request $request)
    {
        try {
            // Validate the incoming request
            $validatedData = $request->validate([
                'user_id' => 'required|exists:users,id',
                'account_details' => 'required|string|max:255',
                'upi_id' => 'nullable|string|max:255',
                'bank_name' => 'required|string|max:255',
                'account_holder_name' => 'required|string|max:255',
                'ifsc_code' => 'required|string|max:11',
                'account_type' => 'required|in:savings,current,salary',
                'branch' => 'required|string|max:255',
                'status' => 'required|in:online,offline',
            ]);
    
            // Create a new BankDetail record
            $bankDetail = BankDetail::create([
                'user_id' => $validatedData['user_id'],
                'account_details' => $validatedData['account_details'],
                'upi_id' => $validatedData['upi_id'],
                'bank_name' => $validatedData['bank_name'],
                'account_holder_name' => $validatedData['account_holder_name'],
                'ifsc_code' => $validatedData['ifsc_code'],
                'account_type' => $validatedData['account_type'],
                'branch' => $validatedData['branch'],
                'status' => $validatedData['status'],
            ]);
    
            // Return a success response
            return response()->json([
                'success' => true,
                'message' => 'Bank details saved successfully.',
                'data' => $bankDetail,
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Handle validation errors
            return response()->json([
                'success' => false,
                'message' => 'Validation errors occurred.',
                'error' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            // Handle unexpected errors
            return response()->json([
                'success' => false,
                'message' => 'An unexpected error occurred while saving bank details.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    
    public function showbankdetail($user_id)
    {
        $bankDetails = BankDetail::where('user_id', $user_id)->get();
    
        if ($bankDetails->isEmpty()) {
            return response()->json(['message' => 'No bank details found for this user'], 404);
        }
    
        return response()->json([
            'success' => true,
            'message' => 'Bank details fetched successfully',
            'data' => $bankDetails
        ], 200);
    }
    
    

public function updatebankdetail(Request $request, $id)
{
    try {
        // Validate incoming data
        $validatedData = $request->validate([
            'account_details' => 'nullable|string|max:255',
            'upi_id' => 'nullable|string|max:255',
            'bank_name' => 'nullable|string|max:255',
            'account_holder_name' => 'nullable|string|max:255',
            'ifsc_code' => 'nullable|string|max:11',
            'account_type' => 'nullable|in:savings,current,salary',
            'branch' => 'nullable|string|max:255',
            'status' => 'nullable|in:online,offline',
        ]);

        // Find the bank detail entry by id
        $bankDetail = BankDetail::find($id);

        // If not found, return an error
        if (!$bankDetail) {
            return response()->json([
                'success' => false,
                'message' => 'Bank detail not found',
            ], 404);
        }

        // Update fields only if provided in the request
        $bankDetail->update($validatedData);

        // Return a success response
        return response()->json([
            'success' => true,
            'message' => 'Bank detail updated successfully',
            'data' => $bankDetail,
        ], 200);

    } catch (\Illuminate\Validation\ValidationException $e) {
        // Handle validation errors
        return response()->json([
            'success' => false,
            'message' => 'Validation errors occurred.',
            'error' => $e->errors(),
        ], 422);
    } catch (\Exception $e) {
        // Handle unexpected errors
        return response()->json([
            'success' => false,
            'message' => 'An unexpected error occurred while updating bank details.',
            'error' => $e->getMessage(),
        ], 500);
    }
}

public function delete($id)
{
    try {
        // Find the bank detail entry by ID
        $bankDetail = BankDetail::findOrFail($id);

        // Delete the bank detail
        $bankDetail->delete();

        // Return a success response
        return response()->json([
            'success' => true,
            'message' => 'Bank detail deleted successfully',
        ], 200);

    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
        // Handle the case where the ID is not found
        return response()->json([
            'success' => false,
            'message' => 'Bank detail not found',
        ], 404);

    } catch (\Exception $e) {
        // Handle unexpected errors
        return response()->json([
            'success' => false,
            'message' => 'An unexpected error occurred while deleting bank details.',
            'error' => $e->getMessage(),
        ], 500);
    }
}


public function showAll()
{
    try {
        // Retrieve all bank details
        $bankDetails = BankDetail::all();

        // Check if there are any records
        if ($bankDetails->isEmpty()) {
            return response()->json([
                'success' => true,
                'message' => 'No bank details found.',
                'data' => [],
            ], 200);
        }

        // Return the list of bank details
        return response()->json([
            'success' => true,
            'message' => 'Bank details retrieved successfully.',
            'data' => $bankDetails,
        ], 200);

    } catch (\Exception $e) {
        // Handle unexpected errors
        return response()->json([
            'success' => false,
            'message' => 'An unexpected error occurred while retrieving bank details.',
            'error' => $e->getMessage(),
        ], 500);
    }
}


}
   
