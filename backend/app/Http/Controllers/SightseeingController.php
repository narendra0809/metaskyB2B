<?php

namespace App\Http\Controllers;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Http\Request;
use App\Models\Sightseeing;
use Illuminate\Support\Facades\Log;

class SightseeingController extends Controller
{ 
    public function import(Request $request)
{
    $validatedData = $request->validate([
        'file' => 'required|file|mimes:xls,xlsx,csv',
    ]);

    if ($request->hasFile('file')) {
        try {
            $file = $request->file('file');
            $rows = Excel::toArray(null, $file)[0]; // Get first sheet as plain array

            if (count($rows) < 2) {
                return response()->json([
                    'success' => false,
                    'message' => 'Excel file contains no data',
                ], 422);
            }

            $headers = array_map('strtolower', $rows[0]); // headers in lowercase
            unset($rows[0]); // remove header row

            foreach ($rows as $index => $row) {
                $rowData = array_combine($headers, $row);

                if (!$rowData) {
                    Log::warning("Row #$index could not be combined with headers, skipping.");
                    continue;
                }

                $termsAndConditions = [
                    'mobileVoucher' => $rowData['terms_mobile_voucher'] ?? '',
                    'instantConfirmation' => $rowData['terms_instant_confirmation'] ?? '',
                    'tourTransfers' => [], // kept empty as example
                    'bookingPolicy' => [
                        'cancellationPolicy' => isset($rowData['terms_cancellation_policy']) ? array_map('trim', explode(',', $rowData['terms_cancellation_policy'])) : [],
                        'childPolicy' => isset($rowData['terms_child_policy']) ? array_map('trim', explode(',', $rowData['terms_child_policy'])) : [],
                    ],
                    'inclusions' => isset($rowData['terms_inclusions']) ? array_map('trim', explode(',', $rowData['terms_inclusions'])) : [],
                    'exclusions' => isset($rowData['terms_exclusions']) ? array_map('trim', explode(',', $rowData['terms_exclusions'])) : [],
                ];

                Sightseeing::create([
                    'destination_id' => $rowData['destination_id'],
                    'company_name' => $rowData['company_name'],
                    'address' => $rowData['address'],
                    'description' => $rowData['description'] ?? '',
                    'rate_adult' => $rowData['rate_adult'] ?? 0,
                    'rate_child' => $rowData['rate_child'] ?? 0,
                    'sharing_transfer_adult' => $rowData['sharing_transfer_adult'] ?? 0,
                    'sharing_transfer_child' => $rowData['sharing_transfer_child'] ?? 0,
                    'terms_and_conditions' => $termsAndConditions,
                ]);

                Log::info("Imported row #$index, company: {$rowData['company_name']}");
            }

            return response()->json([
                'success' => true,
                'message' => 'Import successful',
            ]);
        } catch (\Exception $e) {
            Log::error('Import failed: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);

            return response()->json([
                'success' => false,
                'message' => 'Import failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    return response()->json([
        'success' => false,
        'message' => 'No file uploaded',
    ], 400);
}

    public function postSightseeing(Request $request)
    {
        try {
            // Validate the incoming data with terms_and_conditions as nullable array
            $validatedData = $request->validate([
                'destination_id' => 'required|exists:destinations,id',
                'company_name' => 'required|string|max:255',
                'address' => 'required|string|max:255',
                'description' => 'nullable|string',
                'rate_adult' => 'required|numeric|min:0',
                'rate_child' => 'required|numeric|min:0',
                'sharing_transfer_adult' => 'required|numeric|min:0',
                'sharing_transfer_child' => 'required|numeric|min:0',
                'terms_and_conditions' => 'nullable|json',
            ]);
            $terms = $request->has('terms_and_conditions') ? json_decode($request->terms_and_conditions, true) : null;

            // Create the sightseeing entry with terms_and_conditions
            $sightseeing = Sightseeing::create([
                'destination_id' => $validatedData['destination_id'],
                'company_name' => $validatedData['company_name'],
                'address' => $validatedData['address'],
                'description' => $validatedData['description'],
                'rate_adult' => $validatedData['rate_adult'],
                'rate_child' => $validatedData['rate_child'],
                'sharing_transfer_adult' => $validatedData['sharing_transfer_adult'],
                'sharing_transfer_child' => $validatedData['sharing_transfer_child'],
                'terms_and_conditions' => $terms,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Sightseeing created successfully',
                'sightseeing' => $sightseeing,
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error creating sightseeing: ' . $e->getMessage());

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
            $sightseeings = Sightseeing::with('destination')->get();

            if ($sightseeings->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No sightseeing options found',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $sightseeings,
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error fetching sightseeing options: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch sightseeing options. Please try again.',
            ], 500);
        }
    }

    public function updatesightseeing(Request $request, $id)
    {
        try {
            $validatedData = $request->validate([
                'destination_id' => 'required|exists:destinations,id',
                'company_name' => 'required|string|max:255',
                'address' => 'required|string|max:255',
                'description' => 'nullable|string',
                'rate_adult' => 'required|numeric|min:0',
                'rate_child' => 'required|numeric|min:0',
                'sharing_transfer_adult' => 'required|numeric|min:0',
                'sharing_transfer_child' => 'required|numeric|min:0',
                'terms_and_conditions' => 'nullable|json',
            ]);

              $terms = $request->has('terms_and_conditions') ? json_decode($request->terms_and_conditions, true) : null;

            $sightseeing = Sightseeing::findOrFail($id);

            $sightseeing->destination_id = $validatedData['destination_id'];
            $sightseeing->company_name = $validatedData['company_name'];
            $sightseeing->address = $validatedData['address'];
            $sightseeing->description = $validatedData['description'];
            $sightseeing->rate_adult = $validatedData['rate_adult'];
            $sightseeing->rate_child = $validatedData['rate_child'];
            $sightseeing->sharing_transfer_adult = $validatedData['sharing_transfer_adult'];
            $sightseeing->sharing_transfer_child = $validatedData['sharing_transfer_child'];
            $sightseeing->terms_and_conditions =  $terms;

            $sightseeing->save();

            return response()->json([
                'success' => true,
                'message' => 'Sightseeing updated successfully',
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error updating sightseeing: ' . $e->getMessage());

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

            $sightseeing->delete();

            return response()->json([
                'success' => true,
                'message' => 'Sightseeing deleted successfully'
            ], 200);

        } catch (\Exception $e) {
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
                'destination.city:id,name'
            ])
            ->select('id', 'company_name', 'destination_id', 'description', 'rate_adult', 'rate_child')
            ->get()
            ->map(function ($sightseeing) {
                return [
                    'company_name' => $sightseeing->company_name,
                    'city' => optional($sightseeing->destination->city)->name,
                    'description' => $sightseeing->description,
                    'rate_adult' => $sightseeing->rate_adult,
                    'rate_child' => $sightseeing->rate_child,
                    'sharing_transfer_adult' => $sightseeing->sharing_transfer_adult,
                    'sharing_transfer_child' => $sightseeing->sharing_transfer_child,
                ];
            });

            return response()->json([
                'success' => true,
                'sightseeing' => $sightseeing
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error fetching sightseeing: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch sightseeing. Please try again.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
