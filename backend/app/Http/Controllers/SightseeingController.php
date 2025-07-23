<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
Use App\Models\Sightseeing;
use Illuminate\Support\Facades\Log;


class SightseeingController extends Controller
{
    public function postSightseeing(Request $request)
    {
        try {
            // Validate the incoming data
            $validatedData = $request->validate([
                'destination_id' => 'required|exists:destinations,id', // Ensure destination_id exists in destinations table
                'company_name' => 'required|string|max:255', //? Sightseeing Name
                'address' => 'required|string|max:255',
                'description' => 'nullable|string',
                'rate_adult' => 'required|numeric|min:0',
                'rate_child' => 'required|numeric|min:0',
            ]);

            // Handle document upload
            // if ($request->file('scompany_document')) {
            //     try {
            //         $sDocumentsPath = 'scompany_document/' . time() . '_' . $request->file('scompany_document')->getClientOriginalName();
            //         $request->file('scompany_document')->move(public_path('scompany_document'), $sDocumentsPath);
            //     } catch (\Exception $e) {
            //         return response()->json([
            //             'success' => false,
            //             'message' => 'File upload error: ' . $e->getMessage(),
            //         ], 500);
            //     }
            // }

            // Create the sightseeing entry
            $sightseeing = Sightseeing::create([
                'destination_id' => $validatedData['destination_id'],
                'company_name' => $validatedData['company_name'],
                'address' => $validatedData['address'],
                'description' => $validatedData['description'],
                'rate_adult' => $validatedData['rate_adult'],
                'rate_child' => $validatedData['rate_child'],
            ]);

            // Return success response
            return response()->json([
                'success' => true,
                'message' => 'Sightseeing created successfully',
                'sightseeing' => $sightseeing,
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            // Return validation errors
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            // Log the error for debugging
            Log::error('Error creating sightseeing: ' . $e->getMessage());

            // Return failure response with message
            return response()->json([
                'success' => false,
                'message' => 'Failed to create sightseeing. Please try again.',
            ], 500);
        }
    }


    public function showsightseeing($id)
    {
        $sightseeing = Sightseeing::with('destination')->findOrFail($id);
        return response()->json($sightseeing);
    }

    public function index()
{
    try {
        // Fetch all sightseeing options with their associated destination
        $sightseeings = Sightseeing::with('destination')->get();

        // Check if there are no sightseeing records
        if ($sightseeings->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No sightseeing options found',
            ], 404);
        }

        // Return the list of sightseeing options
        return response()->json([
            'success' => true,
            'data' => $sightseeings,
        ], 200);
    } catch (\Exception $e) {
        // Log any unexpected errors
        // Log::error('Error fetching sightseeing options: ' . $e->getMessage());

        // Return a failure response
        return response()->json([
            'success' => false,
            'message' => 'Failed to fetch sightseeing options. Please try again.',
        ], 500);
    }
}

public function updatesightseeing(Request $request, $id)
{
    try {
        // Validate the incoming data
        $validatedData = $request->validate([
            'destination_id' => 'required|exists:destinations,id',
            'company_name' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'description' => 'nullable|string',
            'rate_adult' => 'required|numeric|min:0',
            'rate_child' => 'required|numeric|min:0',
        ]);

        // Find the sightseeing record
        $sightseeing = Sightseeing::findOrFail($id);

        // Handle document upload if provided
        // if ($request->hasFile('scompany_document')) {
        //     // Delete the old document file if it exists
        //     if ($sightseeing->scompany_document && file_exists(public_path($sightseeing->scompany_document))) {
        //         unlink(public_path($sightseeing->scompany_document));
        //     }

        //     $sDocumentsPath = 'scompany_document/' . time() . '_' . $request->file('scompany_document')->getClientOriginalName();
        //     $request->file('scompany_document')->move(public_path('scompany_document'), $sDocumentsPath);
        //     $sightseeing->scompany_document = $sDocumentsPath;
        // }

        // Update the remaining attributes
        $sightseeing->destination_id = $validatedData['destination_id'];
        $sightseeing->company_name = $validatedData['company_name'];
        $sightseeing->address = $validatedData['address'];
        $sightseeing->description = $validatedData['description'];
        $sightseeing->rate_adult = $validatedData['rate_adult'];
        $sightseeing->rate_child = $validatedData['rate_child'];

        // Save the changes
        $sightseeing->save();

        // Return success response
        return response()->json([
            'success' => true,
            'message' => 'Sightseeing updated successfully',
        ], 200);

    } catch (\Illuminate\Validation\ValidationException $e) {
        // Return validation errors
        return response()->json([
            'success' => false,
            'message' => 'Validation failed',
            'errors' => $e->errors(),
        ], 422);
    } catch (\Exception $e) {
        // Log the error for debugging
        Log::error('Error updating sightseeing: ' . $e->getMessage());

        // Return failure response
        return response()->json([
            'success' => false,
            'message' => 'Failed to update sightseeing. Please try again.',
        ], 500);
    }
}



public function destroy($id)
{
    try {
        $sightseeing = Sightseeing::findOrFail($id);

        // // Optionally delete associated files if needed
        // if (!empty($sightseeing->scompany_document) && file_exists(public_path($sightseeing->scompany_document))) {
        //     @unlink(public_path($sightseeing->scompany_document));
        // }

        // Delete the record
        $sightseeing->delete();

        return response()->json([
            'success' => true,
            'message' => 'Sightseeing deleted successfully'
        ], 200);

    } catch (\Exception $e) {
        // Log the error for debugging
        Log::error('Error deleting sightseeing: ' . $e->getMessage());

        return response()->json([
            'success' => false,
            'message' => 'Failed to delete sightseeing. Please try again.',
        ], 500);
    }
}

public function getsswithcity()
{
    try {

        $sightseeing = Sightseeing::with([
            'destination.city:id,name' // Fetch city name from cities table
        ])
            ->select('id', 'company_name', 'destination_id', 'description','rate_adult','rate_child') // Select required hotel fields
            ->get()
            ->map(function ($sightseeing) {
                return [
                    'company_name' => $sightseeing->company_name,
                    'city' => optional($sightseeing->destination->city)->name, // Get city name safely
                    'description' => $sightseeing->description,
                    'rate_adult' => $sightseeing->rate_adult,
                    'rate_child' => $sightseeing->rate_child,

                        ];

            });

        return response()->json([
            'success' => true,
            'sightseeing' => $sightseeing
        ], 200);
    } catch (\Exception $e) {
        Log::error('Error fetching hotels: ' . $e->getMessage());

        return response()->json([
            'success' => false,
            'message' => 'Failed to fetch sightseeing. Please try again.',
            'error' => $e->getMessage()
        ], 500);
    }
}


}
