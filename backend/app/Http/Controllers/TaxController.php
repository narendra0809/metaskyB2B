<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Log;
use App\Models\Tax;
use Illuminate\Http\Request;

class TaxController extends Controller
{
    // Create a new tax
    public function createTax(Request $request)
    {
        try {
            // Validate the request data
            $validatedData = $request->validate([
                'name' => 'required|string|unique:taxes,name|max:255',
                'percentage' => 'required|numeric|min:0|max:100',
            ]);

            // Create the tax record
            $tax = Tax::create($validatedData);

            return response()->json([
                'success' => true,
                'message' => 'Tax created successfully',
                'data' => $tax,
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Log validation errors
            Log::error('Validation error:', ['errors' => $e->errors()]);

            return response()->json([
                'success' => false,
                // 'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            // Log unexpected errors
            Log::error('Tax creation failed: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                // 'message' => 'Failed to create tax. Please try again.',
            ], 500);
        }
    }

    // Retrieve all taxes
    public function getTaxes()
    {
        try {
            $taxes = Tax::all();

            return response()->json([
                'success' => true,
                // 'message' => 'Taxes retrieved successfully',
                'data' => $taxes,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Failed to retrieve taxes: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                // 'message' => 'Failed to retrieve taxes. Please try again.',
            ], 500);
        }
    }

    // Update an existing tax
    public function updateTax(Request $request, $id)
    {
        try {
            // Validate the request data
            $validatedData = $request->validate([
                'name' => 'nullable|string|unique:taxes,name,' . $id . '|max:255',
                'percentage' => 'nullable|numeric|min:0|max:100',
            ]);

            // Find the tax record
            $tax = Tax::find($id);
            if (!$tax) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tax not found',
                ], 404);
            }

            // Update the tax record
            $tax->update($validatedData);

            return response()->json([
                'success' => true,
                'message' => 'Tax updated successfully',
                'tax' => $tax,
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation error:', ['errors' => $e->errors()]);

            return response()->json([
                // 'success' => false,
                // 'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Tax update failed: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to update tax. Please try again.',
            ], 500);
        }
    }

    // Delete a tax
    public function deleteTax($id)
    {
        try {
            // Find the tax record
            $tax = Tax::find($id);
            if (!$tax) {
                return response()->json([
                    'success' => false,
                    // 'message' => 'Tax not found',
                ], 404);
            }

            // Delete the tax record
            $tax->delete();

            return response()->json([
                'success' => true,
                // 'message' => 'Tax deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            Log::error('Tax deletion failed: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                // 'message' => 'Failed to delete tax. Please try again.',
            ], 500);
        }
    }
}
