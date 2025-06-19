<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Hotel;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\db;
use Illuminate\support\Facades\Auth;



class HotelController extends Controller
{
    // Store a new hotel with destination_id
    public function hotel(Request $request)
    {
        try {
            // Validate the incoming data
            $validatedData = $request->validate([
                'name' => 'required|string|max:255',
                'hotel_type' => 'required|string|max:100',
                'address' => 'required|string|max:255',
                'contact_no' => 'required|string|max:20',
                'email' => 'required|email|max:255|unique:hotels,email', // Validate email
                'destination_id' => 'required|exists:destinations,id', // Ensure destination_id exists in destinations table
                'ex_adult_rate' => 'sometimes|numeric|min:0', // Validate as numeric and positive
                'ex_child_rate' => 'sometimes|numeric|min:0', // Validate as numeric and positive
                'room_types' => 'sometimes|array', // Validate as array
                'room_types.*.type' => 'required|string|max:100', // Each type must be a string
                'room_types.*.rate' => 'required|numeric', // Each rate must be numeric
                'meals' => 'sometimes|array', // Validate as array
                'meals.*.name' => 'required|string|max:255', // Each meal must have a name
                'meals.*.rate' => 'required|numeric', // Each meal must have a rate
            ]);
    
            // Create the hotel
            $hotel = Hotel::create([
                'name' => $validatedData['name'],
                'hotel_type' => $validatedData['hotel_type'],
                'address' => $validatedData['address'],
                'contact_no' => $validatedData['contact_no'],
                'email' => $validatedData['email'], // Save email
                'destination_id' => $validatedData['destination_id'],
                'ex_adult_rate' => $validatedData['ex_adult_rate'] ?? null, // Save ex_adult_rate
                'ex_child_rate' => $validatedData['ex_child_rate'] ?? null, // Save ex_child_rate
                'room_types' => $validatedData['room_types'] ?? [], // Add room_types JSON
                'meals' => $validatedData['meals'] ?? [], // Add meals JSON
            ]);
    
            // Return success response
            return response()->json([
                'success' => true,
                'message' => 'Hotel created successfully',
                'hotel' => $hotel,
            ], 201);
    
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Return validation errors
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422); // 422 Unprocessable Entity
        } catch (\Exception $e) {
            // Log the error for debugging
            Log::error('Error creating hotel: ' . $e->getMessage());
    
            // Return failure response with message
            return response()->json([
                'success' => false,
                'message' => 'Failed to create hotel. Please try again.',
            ], 500);
        }
    }
    
    

    // Show a specific hotel with its destination
    public function show($id)
    {
        try {
            // Find the hotel by ID and include its related destination data
            $hotel = Hotel::with('destination')->findOrFail($id);
    
            // Return success response with the hotel data
            return response()->json([
                'success' => true,
                'message' => 'Hotel retrieved successfully',
                'hotel' => $hotel,
            ], 200);
    
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            // Handle case where the hotel is not found
            return response()->json([
                'success' => false,
                'message' => 'Hotel not found',
            ], 404);
    
        } catch (\Exception $e) {
            // Log any unexpected error for debugging
            Log::error('Error retrieving hotel: ' . $e->getMessage());
    
            // Return failure response with message
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve hotel. Please try again.',
            ], 500);
        }
    }
    
    // Update an existing hotel
    public function updatehotel(Request $request, $id)
    {
        try {
            // Find the hotel by ID or throw a 404 error if not found
            $hotel = Hotel::find($id);
    
            // Validate the incoming data
            $validatedData = $request->validate([
                'name' => 'sometimes|string|max:255',
                'hotel_type' => 'sometimes|string|max:100',
                'address' => 'sometimes|string|max:255',
                'contact_no' => 'sometimes|string|max:20',
                'email' => 'email|max:255',
                'destination_id' => 'sometimes|exists:destinations,id',
                'ex_adult_rate' => 'sometimes|numeric|min:0',
                'ex_child_rate' => 'sometimes|numeric|min:0',
                'room_types' => 'sometimes|array', // Validate as array
                'room_types.*.type' => 'required|string|max:100', // Each type must be a string
                'room_types.*.rate' => 'required|numeric', // Each rate must be numeric
                'meals' => 'sometimes|array', // Validate as array
                'meals.*.name' => 'required|string|max:255', // Each meal must have a name
                'meals.*.rate' => 'required|numeric', // Each meal must have a rate
            ]);
    
            // Update only the provided fields
            $hotel->update($validatedData);
    
            // Return success response with the updated hotel data
            return response()->json([
                'success' => true,
                'message' => 'Hotel updated successfully',
                'hotel' => $hotel,
            ], 200);
    
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            // Handle case where hotel is not found
            return response()->json([
                'success' => false,
                'message' => 'Hotel not found',
            ], 404);
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Return validation errors
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422); // 422 Unprocessable Entity
        } catch (\Exception $e) {
            // Log the error for debugging
            Log::error('Error updating hotel: ' . $e->getMessage());
    
            // Return failure response with message
            return response()->json([
                'success' => false,
                'message' => 'Failed to update hotel. Please try again.',
            ], 500);
        }
    }
    

    // Delete a hotel
    public function destroy($id)
    {
        try {
            // Find the hotel by ID
            $hotel = Hotel::findOrFail($id);
    
            // Delete the hotel
            $hotel->delete();
    
            // Return a success response
            return response()->json([
                'success' => true,
                'message' => 'Hotel deleted successfully',
            ], 200);
    
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            // Handle case where the hotel is not found
            return response()->json([
                'success' => false,
                'message' => 'Hotel not found',
            ], 404);
    
        } catch (\Exception $e) {
            // Log unexpected errors for debugging
            Log::error('Error deleting hotel: ' . $e->getMessage());
    
            // Return a failure response
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete hotel. Please try again.',
            ], 500);
        }
    }
    
    public function index()
{
    try {
        // Fetch all hotels with their associated destination
        $hotels = Hotel::with('destination')->get();

        // Check if there are no hotels
        if ($hotels->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No hotels found',
            ], 404);
        }

        // Return the list of hotels
        return response()->json([
            'success' => true,
            'data' => $hotels,
        ], 200);
    } catch (\Exception $e) {
        // Log any unexpected errors
        Log::error('Error fetching hotels: ' . $e->getMessage());

        // Return a failure response
        return response()->json([
            'success' => false,
            'message' => 'Failed to fetch hotels. Please try again.',
        ], 500);
    }
}

   
public function getHotelsWithCity()
{
    try {
        
        $hotels = Hotel::with([
            'destination.city:id,name' // Fetch city name from cities table
        ])
            ->select('id', 'name', 'destination_id', 'room_types') // Select required hotel fields
            ->get()
            ->map(function ($hotel) {
                return [
                    'hotel_name' => $hotel->name,
                    'city' => optional($hotel->destination->city)->name, // Get city name safely
                    'room_types' => collect($hotel->room_types ?? [])->map(function ($room) {
                        return [
                            'type' => $room['type'] ?? 'Unknown',
                            'rate' => $room['rate'] ?? 0
                        ];
                    })->toArray() // Convert collection to array
                ];
            });

        return response()->json([
            'success' => true,
            'hotels' => $hotels
        ], 200);
    } catch (\Exception $e) {
        Log::error('Error fetching hotels: ' . $e->getMessage());

        return response()->json([
            'success' => false,
            'message' => 'Failed to fetch hotels. Please try again.',
            'error' => $e->getMessage()
        ], 500);
    }
}


}
