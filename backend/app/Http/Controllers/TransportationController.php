<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Transportation;
use Illuminate\Support\Facades\Log;
use Illuminate\support\Facades\Auth;
use Illuminate\Support\Facades\db;


// use Exception;
// use Symfony\Component\Mailer\Transport;

class TransportationController extends Controller
{
    public function transportation(Request $request)
    {
        try {
            // Validate the incoming data
            $validatedData = $request->validate([
                'destination_id' => 'required|exists:destinations,id',
                'company_name' => 'required|string|max:255',
                'company_document' => 'nullable|file|mimes:jpeg,jpg,png,doc,docx,pdf', // Valid file types for the document
                'email' => 'required|email|unique:transportations,email',
                'contact_no' => 'required|string|max:15',
                'address' => 'required|string|max:255',
                'transport' => 'required|string|max:255',
                'vehicle_type' => 'required|string|max:100',
                'options' => 'required|array', // Ensure options is an array
                'options.*.type' => 'required|string|max:255', // Validate each option type
                'options.*.rate' => 'required|numeric|min:0', // Validate rate for each option
            ]);
    
            // Handle document upload if provided
            $documentPath = null;
            if ($request->hasFile('company_document')) {
                try {
                    // Generate a unique name for the uploaded document
                    $documentPath = 'tcompany_document/' . time() . '_' . $request->file('company_document')->getClientOriginalName();
                    $request->file('company_document')->move(public_path('tcompany_document'), $documentPath);
                } catch (\Exception $e) {
                    // Log the error and return a failure response
                    Log::error('File upload error: ' . $e->getMessage(), [
                        'file_name' => $request->file('company_document')->getClientOriginalName(),
                    ]);
                    return response()->json([
                        'success' => false,
                        'message' => 'Failed to upload company document.',
                        'error' => $e->getMessage(),
                    ], 500);
                }
            }
    
            // Process 'options' field to match the desired format
            $processedOptions = array_map(function ($option) {
                return [
                    'type' => $option['type'],
                    'rate' => $option['rate'],
                ];
            }, $validatedData['options']);
    
            Log::info('Processed Options:', [
                'processed_options' => $processedOptions,
            ]);
    
            // Create the transportation entry
            $transportation = Transportation::create([
                'destination_id' => $validatedData['destination_id'],
                'company_name' => $validatedData['company_name'],
                'company_document' => $documentPath,
                'email' => $validatedData['email'],
                'contact_no' => $validatedData['contact_no'],
                'address' => $validatedData['address'],
                'transport' => $validatedData['transport'],
                'vehicle_type' => $validatedData['vehicle_type'],
                'options' => $processedOptions, // Store options as JSON
            ]);
    
            // Return success response
            return response()->json([
                'success' => true,
                'message' => 'Transportation created successfully',
                'transportation' => $transportation,
            ], 201);
    
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Log validation errors
            Log::error('Validation error:', [
                'errors' => $e->errors(),
            ]);
    
            // Return validation error response
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            // Log unexpected errors
            Log::error('Transportation creation failed: ' . $e->getMessage(), [
                'request_data' => $request->all(),
            ]);
    
            // Return failure response
            return response()->json([
                'success' => false,
                'message' => 'Failed to create transportation. Please try again.',
            ], 500);
        }
    }
    

    public function showtransportation($id)
    {
        try {
            // Fetch the transportation entry with related destination
            $transportation = Transportation::with('destination')->findOrFail($id);
    
            // Return success response
            return response()->json([
                'success' => true,
                'message' => 'Transportation retrieved successfully',
                'transportation' => $transportation,
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            // Log not found error
            Log::error('Transportation not found: ' . $e->getMessage(), [
                'id' => $id,
            ]);
    
            // Return not found error response
            return response()->json([
                'success' => false,
                'message' => 'Transportation not found',
            ], 404);
        } catch (\Exception $e) {
            // Log unexpected errors
            Log::error('Failed to retrieve transportation: ' . $e->getMessage(), [
                'id' => $id,
                'error' => $e->getMessage(),
            ]);
    
            // Return failure response
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve transportation. Please try again.',
            ], 500);
        }
    }
    
    

    public function destroy($id)
    {
        $transportation = Transportation::findOrFail($id);

        // Delete associated files if needed
        if ($transportation->company_document && file_exists(public_path($transportation->company_document))) {
            unlink(public_path($transportation->company_document));
        }
        
        // Delete the record
        $transportation->delete();

        return response()->json(['success' => true, 'message' => 'Transportation deleted successfully'], 200);
    }
    public function index()
{
    try {
        // Fetch all transportation options
        $transportations = Transportation::with('destination:id')->get();

        // Modify each transportation to include only destination_id
        $transportations = $transportations->map(function ($transportation) {
            return [
                'id' => $transportation->id,
                'destination_id' => $transportation->destination_id,
                'company_name' => $transportation->company_name,
                'company_document' => $transportation->company_document,
                'contact_no' => $transportation->contact_no,
                'address' => $transportation->address,
                'email' => $transportation->email,
                'transport' => $transportation->transport,
                'vehicle_type' => $transportation->vehicle_type,
                // 'created_at' => $transportation->created_at,
                // 'updated_at' => $transportation->updated_at,
                'options' => $transportation->options,
            ];
        });

        // Check if there are no transportation options
        if ($transportations->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No transportation options found',
            ], 402);
        }

        // Return the list of transportation options
        return response()->json([
            'success' => true,
            'data' => $transportations,
        ], 200);
    } catch (\Exception $e) {
        // Log any unexpected errors
        Log::error('Error fetching transportation options: ' . $e->getMessage());

        // Return a failure response
        return response()->json([
            'success' => false,
            'message' => 'Failed to fetch transportation options. Please try again.',
        ], 500);
    }
}

    public function updatetransportation(Request $request, $id)
    {
        try {
            // Validate the incoming data
            $validatedData = $request->validate([
                'destination_id' => 'required|exists:destinations,id',
                'company_name' => 'required|string|max:255',
                'company_document' => 'nullable|file|mimes:jpeg,jpg,png,doc,docx,pdf', // Valid file types for the document
                'email' => 'email|max:255', // Ensure email is unique except for this record
                'contact_no' => 'required|string|max:15',
                'address' => 'required|string|max:255',
                'transport' => 'required|string|max:255',
                'vehicle_type' => 'required|string|max:100',
                'options' => 'required|array', // Ensure options is an array
                'options.*.type' => 'required|string|max:255', // Validate each option type
                'options.*.rate' => 'required|numeric|min:0', // Validate rate for each option
            ]);
    
            // Find the transportation entry to update
            $transportation = Transportation::find($id);
    
            // Handle document upload if provided
            $documentPath = $transportation->company_document; // Keep the existing document if no new one is uploaded
            if ($request->hasFile('company_document')) {
                try {
                    // Generate a unique name for the uploaded document
                    $documentPath = 'tcompany_document/' . time() . '_' . $request->file('company_document')->getClientOriginalName();
                    $request->file('company_document')->move(public_path('tcompany_document'), $documentPath);
                } catch (\Exception $e) {
                    // Log any file upload errors
                    Log::error('File upload error: ' . $e->getMessage(), [
                        'file_name' => $request->file('company_document')->getClientOriginalName(),
                        'error' => $e->getMessage(),
                    ]);
                    return response()->json([
                        'success' => false,
                        'message' => 'File upload error: ' . $e->getMessage(),
                        'error' => $e->getMessage(),
                    ], 500);
                }
            }
    
            // Process 'options' field to match the desired format
            $processedOptions = array_map(function ($option) {
                return [
                    'type' => $option['type'],
                    'rate' => $option['rate'],
                ];
            }, $validatedData['options']);
    
            Log::info('Processed Options:', [
                'processed_options' => $processedOptions,
            ]);
    
            // Update the transportation entry
            $transportation->update([
                'destination_id' => $validatedData['destination_id'],
                'company_name' => $validatedData['company_name'],
                'company_document' => $documentPath, // Store the file path (updated if a new document was uploaded)
                'email' => $validatedData['email'],
                'contact_no' => $validatedData['contact_no'],
                'address' => $validatedData['address'],
                'transport' => $validatedData['transport'],
                'vehicle_type' => $validatedData['vehicle_type'],
                'options' => $processedOptions, // Store options as a JSON string
            ]);
    
            // Return success response
            return response()->json([
                'success' => true,
                'message' => 'Transportation updated successfully',
                'transportation' => $transportation,
            ], 200);
    
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Log validation errors
            Log::error('Validation error:', [
                'errors' => $e->errors(),
            ]);
    
            // Return validation error response
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            // Log unexpected errors
            Log::error('Transportation update failed: ' . $e->getMessage(), [
                'request_data' => $request->all(),
            ]);
    
            // Return failure response
            return response()->json([
                'success' => false,
                'message' => 'Failed to update transportation. Please try again.',
            ], 500);
        }
    }
    
    public function getTransportWithCity()
    {
        try {
            // Fetch transport data with related destination and city
            $transports = Transportation::with([
                'destination.city:id,name' // Fetch city name from cities table
            ])
            ->select('id', 'company_name', 'destination_id', 'options')
            ->get()
            ->map(function ($transports) {
                return [
                    'company_name' => $transports->company_name,
                    'city' => optional($transports->destination->city)->name ?? 'Unknown', // Safe way to access city name
                       'options' => collect($transports->options ?? [])->map(function ($option) {
                        return [
                            'type' => $option['type'] ?? 'Unknown',
                            'rate' => $option['rate'] ?? 0
                        ];


                    })->toArray()
                ];
            });
    
            return response()->json([
                'success' => true,
                'transport' => $transports
            ], 200);
    
        } catch (\Exception $e) {
            Log::error('Error fetching transport data: ' . $e->getMessage());
    
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch transport data. Please try again.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    

}
