<?php

namespace App\Http\Controllers;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Http\Request;
use App\Models\Transportation;
use Illuminate\Support\Facades\Log;

class TransportationController extends Controller
{   
    public function import(Request $request){
         $validatedData = $request->validate([
        'file' => 'required|file|mimes:xls,xlsx,csv',
    ]);

    if ($request->hasFile('file')) {
        try {
            $file = $request->file('file');

          
            $rows = Excel::toCollection(null, $file)->first();

            foreach ($rows as $row) {
               Transportation::updateOrCreate(
                    ['company_name' => $row['company_name']], 
                    [
                        'destination_id' => $row['destination_id'],
                        'address' => $row['address'],
                        'transport' => $row['transport'],
                        'vehicle_type' => $row['vehicle_type'],
                    ]
                );
            }

            return response()->json([
                'success' => true,
                'message' => 'Import successful',
            ]);
        } catch (\Exception $e) {
            // \Log::error('Import error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Import failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    }
    public function transportation(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'destination_id' => 'required|exists:destinations,id',
                'company_name' => 'required|string|max:255',
                'company_document' => 'nullable|file|mimes:jpeg,jpg,png,doc,docx,pdf',
                'address' => 'required|string|max:255',
                'transport' => 'required|string|max:255',
                'vehicle_type' => 'required|string|max:100',
                'options' => 'required|array',
                'options.*.from' => 'required|string|max:255',
                'options.*.to' => 'required|string|max:255',
                'options.*.transfer_type' => 'required|string|max:255',
                'options.*.rate' => 'required|numeric|min:0',
                'terms_and_conditions' => 'nullable|json',
            ]);

             $terms = $request->has('terms_and_conditions') ? json_decode($request->terms_and_conditions, true) : null;

            $documentPath = null;
            if ($request->hasFile('company_document')) {
                try {
                    $documentPath = 'tcompany_document/' . time() . '_' . $request->file('company_document')->getClientOriginalName();
                    $request->file('company_document')->move(public_path('tcompany_document'), $documentPath);
                } catch (\Exception $e) {
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

            $processedOptions = array_map(function ($option) {
                return [
                    'from' => $option['from'],
                    'to' => $option['to'],
                    'rate' => $option['rate'],
                    'transfer_type' => $option['transfer_type'],
                ];
            }, $validatedData['options']);

            $transportation = Transportation::create([
                'destination_id' => $validatedData['destination_id'],
                'company_name' => $validatedData['company_name'],
                'company_document' => $documentPath,
                'address' => $validatedData['address'],
                'transport' => $validatedData['transport'],
                'vehicle_type' => $validatedData['vehicle_type'],
                'options' => $processedOptions,
                'terms_and_conditions' => $terms,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Transportation created successfully',
                'transportation' => $transportation,
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation error:', ['errors' => $e->errors()]);
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Transportation creation failed: ' . $e->getMessage(), ['request_data' => $request->all()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to create transportation. Please try again.',
            ], 500);
        }
    }

    public function showtransportation($id)
    {
        try {
            $transportation = Transportation::with('destination')->findOrFail($id);

            return response()->json([
                'success' => true,
                'message' => 'Transportation retrieved successfully',
                'transportation' => $transportation,
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::error('Transportation not found: ' . $e->getMessage(), ['id' => $id]);

            return response()->json([
                'success' => false,
                'message' => 'Transportation not found',
            ], 404);
        } catch (\Exception $e) {
            Log::error('Failed to retrieve transportation: ' . $e->getMessage(), ['id' => $id, 'error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve transportation. Please try again.',
            ], 500);
        }
    }

    public function destroy($id)
    {
        $transportation = Transportation::findOrFail($id);

        if ($transportation->company_document && file_exists(public_path($transportation->company_document))) {
            unlink(public_path($transportation->company_document));
        }

        $transportation->delete();

        return response()->json(['success' => true, 'message' => 'Transportation deleted successfully'], 200);
    }

    public function index()
    {
        try {
            $transportations = Transportation::with('destination:id')->get();

            $transportations = $transportations->map(function ($transportation) {
                return [
                    'id' => $transportation->id,
                    'destination_id' => $transportation->destination_id,
                    'company_name' => $transportation->company_name,
                    'company_document' => $transportation->company_document,
                    'address' => $transportation->address,
                    'transport' => $transportation->transport,
                    'vehicle_type' => $transportation->vehicle_type,
                    'options' => $transportation->options,
                    'terms_and_conditions' => $transportation->terms_and_conditions, // Added here
                ];
            });

            if ($transportations->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No transportation options found',
                ], 402);
            }

            return response()->json([
                'success' => true,
                'data' => $transportations,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error fetching transportation options: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch transportation options. Please try again.',
            ], 500);
        }
    }

    public function updatetransportation(Request $request, $id)
    {
        try {
            $validatedData = $request->validate([
                'destination_id' => 'required|exists:destinations,id',
                'company_name' => 'required|string|max:255',
                'company_document' => 'nullable|file|mimes:jpeg,jpg,png,doc,docx,pdf',
                'address' => 'required|string|max:255',
                'transport' => 'required|string|max:255',
                'vehicle_type' => 'required|string|max:100',
                'options' => 'required|array',
                'options.*.from' => 'required|string|max:255',
                'options.*.to' => 'required|string|max:255',
                'options.*.transfer_type' => 'required|string|max:255',
                'options.*.rate' => 'required|numeric|min:0',
                'terms_and_conditions' => 'nullable|json',
            ]);

            $terms = $request->has('terms_and_conditions') ? json_decode($request->terms_and_conditions, true) : null;


            $transportation = Transportation::find($id);
            $documentPath = $transportation->company_document;

            if ($request->hasFile('company_document')) {
                try {
                    $documentPath = 'tcompany_document/' . time() . '_' . $request->file('company_document')->getClientOriginalName();
                    $request->file('company_document')->move(public_path('tcompany_document'), $documentPath);
                } catch (\Exception $e) {
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

            $processedOptions = array_map(function ($option) {
                return [
                    'from' => $option['from'],
                    'to' => $option['to'],
                    'rate' => $option['rate'],
                    'transfer_type' => $option['transfer_type'],
                ];
            }, $validatedData['options']);

            $transportation->update([
                'destination_id' => $validatedData['destination_id'],
                'company_name' => $validatedData['company_name'],
                'company_document' => $documentPath,
                'address' => $validatedData['address'],
                'transport' => $validatedData['transport'],
                'vehicle_type' => $validatedData['vehicle_type'],
                'options' => $processedOptions,
                'terms_and_conditions' =>  $terms,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Transportation updated successfully',
                'transportation' => $transportation,
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation error:', ['errors' => $e->errors()]);
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Transportation update failed: ' . $e->getMessage(), ['request_data' => $request->all()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to update transportation. Please try again.',
            ], 500);
        }
    }

    public function getTransportWithCity()
    {
        try {
            $transports = Transportation::with([
                'destination.city:id,name'
            ])
                ->select('id', 'company_name', 'destination_id', 'options', 'terms_and_conditions')
                ->get()
                ->map(function ($transport) {
                    return [
                        'company_name' => $transport->company_name,
                        'city' => optional($transport->destination->city)->name ?? 'Unknown',
                        'options' => collect($transport->options ?? [])->map(function ($option) {
                            return [
                                'from' => $option['from'] ?? 'Unknown',
                                'to' => $option['to'] ?? 'Unknown',
                                'transfer_type' => $option['transfer_type'] ?? 'Unknown',
                                'rate' => $option['rate'] ?? 0,
                            ];
                        })->toArray(),
                        'terms_and_conditions' => $transport->terms_and_conditions ?? null,
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
