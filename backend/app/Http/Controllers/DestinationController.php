<?php

namespace App\Http\Controllers;

use App\Models\City;
use App\Models\Country;
use App\Models\Destination;
use App\Models\State;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;


class DestinationController extends Controller
{
    public function setDestination(Request $request)
    {
        // Use a custom validation function
        $validationResponse = $this->validateDestination($request);
    
        // If validation fails, return the validation errors
        if ($validationResponse['success'] === false) {
            return response()->json($validationResponse, 422); // 422 Unprocessable Entity
        }
    
        try {
            // If validation passes, proceed with destination creation/updating
            $destination = Destination::updateOrCreate(
                [
                    'country_id' => $request->country_id,
                    'state_id' => $request->state_id,
                    'city_id' => $request->city_id,
                ],
                [
                    'status' => $request->status, // 0 or 1 for status
                ]
            );
    
            // Return success message and destination data
            return response()->json([
                'success' => true,
                'message' => 'Destination set successfully',
                'destination' => $destination,
            ], 200);
    
        } catch (\Exception $e) {
            // Log the error for debugging
            Log::error('Error setting destination: ' . $e->getMessage());
    
            // Return failure response with message
            return response()->json([
                'success' => false,
                'message' => 'Failed to set destination. Please try again.',
            ], 500);
        }
    }
    
    public function validateDestination(Request $request)
    {
        $errors = [];
    
        // Validate country_id
        if (!$request->has('country_id') || !Country::find($request->country_id)) {
            $errors['country_id'] = 'The selected country is invalid or does not exist.';
        }
    
        // Validate state_id
        if (!$request->has('state_id') || !State::find($request->state_id)) {
            $errors['state_id'] = 'The selected state is invalid or does not exist.';
        }
    
        // Validate city_id
        if (!$request->has('city_id') || !City::find($request->city_id)) {
            $errors['city_id'] = 'The selected city is invalid or does not exist.';
        }
    
        // Validate status (must be 0 or 1)
        if (!$request->has('status') || !in_array($request->status, [0, 1])) {
            $errors['status'] = 'The status must be 0 (offline) or 1 (online).';
        }
    
        // If there are errors, return them
        if (count($errors) > 0) {
            return [
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $errors
            ];
        }
    
        // If no errors, return success
        return [
            'success' => true,
        ];
    }
    



    // Get the current destination
    public function getDestination()
    {
        $destinations = Destination::with(['country', 'state', 'city'])->get();
    
        if ($destinations->isEmpty()) {
            return response()->json([
                'message' => 'No destination set',
            ], 404);
        }
    
        // Transform the response to include specific data
        $data = $destinations->map(function ($destination) {
            return [
                'id' => $destination->id,
                'country_id' => $destination->country->id ?? null,
                'state_id' => $destination->state->id ?? null,
                'city_id' => $destination->city->id ?? null, // Map true/false to 'online'/'offline'
                'status' => $destination->status ? true : false, // Boolean representation of status
                'created_at' => $destination->created_at,
            ];
        });
        
        return response()->json([
            'destinations' => $data,
        ], 200);
    }
    

    public function editDestination(Request $request, $id)
    {
        // Validate the request
        $validationResponse = $this->validateDestination($request);
    
        // If validation fails, return the validation errors
        if ($validationResponse['success'] === false) {
            return response()->json($validationResponse, 422); // 422 Unprocessable Entity
        }
    
        try {
            // Find the destination by ID
            $destination = Destination::find($id);
    
            if (!$destination) {
                return response()->json([
                    'success' => false,
                    'message' => 'Destination not found',
                ], 404);
            }
    
            // Update the destination
            $destination->update([
                'country_id' => $request->country_id,
                'state_id' => $request->state_id,
                'city_id' => $request->city_id,
                'status' => $request->status, // 0 or 1
            ]);
    
            // Return success message and updated destination
            return response()->json([
                'success' => true,
                'message' => 'Destination updated successfully',
                'destination' => $destination,
            ], 200);
    
        } catch (\Exception $e) {
            // Log the error for debugging
            Log::error('Error updating destination: ' . $e->getMessage());
    
            // Return failure response with message
            return response()->json([
                'success' => false,
                'message' => 'Failed to update destination. Please try again.',
            ], 500);
        }
    }
    




    public function deleteDestination($id)
{
    try {
        // Find the destination by ID
        $destination = Destination::find($id);

        if (!$destination) {
            return response()->json([
                'success' => false,
                'message' => 'Destination not found',
            ], 404);
        }

        // Delete the destination
        $destination->delete();

        // Return success message
        return response()->json([
            'success' => true,
            'message' => 'Destination deleted successfully',
        ], 200);

    } catch (\Exception $e) {
        // Log the error for debugging
        Log::error('Error deleting destination: ' . $e->getMessage());

        // Return failure response with message
        return response()->json([
            'success' => false,
            'message' => 'Failed to delete destination. Please try again.',
        ], 500);
    }
}

    // Fetch all countries
 public function getCountries()
{
    try {
        $countries = Country::all();
        $states = State::all();
        $cities = City::all();

        if ($countries->isEmpty()) {
            return response()->json([
                'error' => 'No countries found',
            ], 404); // 404 for not found
        }

        return response()->json([
            'countries' => $countries,
            'states' => $states,
            'cities'=> $cities,
        ], 200);

    } catch (\Exception $e) {
        // Log the exception for debugging purposes
        Log::error('Error fetching countries: ' . $e->getMessage());

        return response()->json([
            'error' => 'An error occurred while fetching countries',
            'message' => $e->getMessage(),
        ], 500); // 500 for internal server error
    }
}
    

    // Fetch states based on country_id
    public function getStates($country_id)
    {
        $states = State::where('country_id', $country_id)->get();

        return response()->json([
            'states' => $states,
        ], 200);
    }

    // Fetch cities based on state_id
    public function getCities($state_id)
    {
        $cities = City::where('state_id', $state_id)->get();

        return response()->json([
            'cities' => $cities,
        ], 200);
    }
}
