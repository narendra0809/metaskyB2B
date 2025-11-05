<?php

namespace App\Http\Controllers;
use Maatwebsite\Excel\Facades\Excel;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class TicketController extends Controller
{    
    public function import(Request $request)
{
    $validatedData = $request->validate([
        'file' => 'required|file|mimes:xls,xlsx,csv',
    ]);

    if ($request->hasFile('file')) {
        try {
            $file = $request->file('file');
            $rows = Excel::toArray(null, $file)[0];

            if (count($rows) < 2) {
                return response()->json([
                    'success' => false,
                    'message' => 'Excel file contains no data',
                ], 422);
            }

            $headers = array_map('strtolower', $rows[0]);
            unset($rows[0]);

            foreach ($rows as $index => $row) {
                $rowData = array_combine($headers, $row);

                if (!$rowData) {
                    Log::warning("Row #$index could not be combined with headers, skipping.");
                    continue;
                }

                // category becomes array splitting by commas (if any)
                $category = isset($rowData['category']) && !empty($rowData['category'])
                    ? array_map('trim', explode(',', $rowData['category']))
                    : [];

                // Parse time_slots by splitting slots and prices
                $slots = isset($rowData['time_slots_slot']) ? array_map('trim', explode(',', $rowData['time_slots_slot'])) : [];
                $adultPrices = isset($rowData['time_slots_adult_price']) ? array_map('trim', explode('_', $rowData['time_slots_adult_price'])) : [];
                $childPrices = isset($rowData['time_slots_child_price']) ? array_map('trim', explode('_', $rowData['time_slots_child_price'])) : [];

                $time_slots = [];
                $countSlots = max(count($slots), count($adultPrices), count($childPrices));
                for ($i = 0; $i < $countSlots; $i++) {
                    $time_slots[] = [
                        'slot' => $slots[$i] ?? null,
                        'adult_price' => $adultPrices[$i] ?? null,
                        'child_price' => $childPrices[$i] ?? null,
                    ];
                }

                // Terms and conditions mapping similar to previous example with nested structure
                $termsAndConditions = [
                    'mobileVoucher' => $rowData['terms_mobile_voucher'] ?? '',
                    'instantConfirmation' => $rowData['terms_instant_confirmation'] ?? '',
                    'tourTransfers' => [],
                    'bookingPolicy' => [
                        'cancellationPolicy' => isset($rowData['terms_cancellation_policy']) ? array_map('trim', explode(',', $rowData['terms_cancellation_policy'])) : [],
                        'childPolicy' => isset($rowData['terms_child_policy']) ? array_map('trim', explode(',', $rowData['terms_child_policy'])) : [],
                    ],
                    'inclusions' => isset($rowData['terms_inclusions']) ? array_map('trim', explode(',', $rowData['terms_inclusions'])) : [],
                    'exclusions' => isset($rowData['terms_exclusions']) ? array_map('trim', explode(',', $rowData['terms_exclusions'])) : [],
                ];

                // Create or update your Ticket model (replace Ticket with your model name)
                Ticket::create([
                    'name' => $rowData['name'],
                    'category' => $category,
                    'status' => $rowData['status'],
                    'time_slots' => $time_slots,
                    'terms_and_conditions' => $termsAndConditions,
                ]);

                Log::info("Imported row #$index, ticket: {$rowData['name']}");
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

 
    public function store(Request $request)
    {
        Log::info('Incoming Request: ' . json_encode($request->all()));

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'status' => 'required|in:Active,Inactive',
            // 'transfer_options' => 'nullable|array',
            // 'transfer_options.*.option' => 'nullable|string|max:100',
            // 'transfer_options.*.price' => 'nullable|numeric',
            'category' => 'nullable|array',
            'category.*' => 'string|max:100',
            'time_slots' => 'nullable|array',
            'time_slots.*.slot' => 'nullable|string|max:100',
            'time_slots.*.adult_price' => 'required|numeric',
            'time_slots.*.child_price' => 'required|numeric',
            'terms_and_conditions' => 'nullable|json',
        ]);

         $terms = $request->has('terms_and_conditions') ? json_decode($request->terms_and_conditions, true) : null;

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $ticket = Ticket::create([
            'name' => $request->name,
            'category' => $request->category,
            'status' => $request->status,
            // 'transfer_options' => $request->transfer_options,
            'time_slots' => $request->time_slots,
            'terms_and_conditions' => $terms,
        ]);

        return response()->json(['success' => true, 'message' => 'Ticket created successfully', 'data' => $ticket], 201);
    }

    /**
     * Display a listing of tickets with filtering.
     */
    public function index(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'nullable|in:Active,Inactive',
            'category' => 'nullable|array',
            'category.*' => 'string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $query = Ticket::query();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('category')) {
            $query->whereJsonContains('category', $request->category);
        }

        $tickets = $query->get();

        return response()->json(['success' => true, 'data' => $tickets]);
    }

    /**
     * Display the specified ticket.
     */
    public function show($id)
    {
        $ticket = Ticket::find($id);

        if (!$ticket) {
            return response()->json(['success' => false, 'message' => 'Ticket not found'], 404);
        }

        return response()->json(['success' => true, 'data' => $ticket]);
    }

    /**
     * Update the specified ticket in storage.
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'status' => 'required|in:Active,Inactive',
            // 'transfer_options' => 'nullable|array',
            // 'transfer_options.*.option' => 'string|max:100',
            // 'transfer_options.*.price' => 'numeric',
            'category' => 'nullable|array',
            'category.*' => 'string|max:100',
            'time_slots' => 'nullable|array',
            'time_slots.*.slot' => 'nullable|max:100',
            'time_slots.*.adult_price' => 'numeric',
            'time_slots.*.child_price' => 'numeric',
            'terms_and_conditions' => 'nullable|json',
        ]);


        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }
        $terms = $request->has('terms_and_conditions') ? json_decode($request->terms_and_conditions, true) : null;

        $ticket = Ticket::find($id);

        if (!$ticket) {
            return response()->json(['success' => false, 'message' => 'Ticket not found'], 404);
        }

        $ticket->update([
            'name' => $request->name,
            'category' => $request->category,
            'status' => $request->status,
            // 'transfer_options' => $request->transfer_options,
            'time_slots' => $request->time_slots,
            'terms_and_conditions' => $terms,
        ]);

        return response()->json(['success' => true, 'message' => 'Ticket updated successfully', 'data' => $ticket]);
    }

    /**
     * Remove the specified ticket from storage.
     */
    public function destroy($id)
    {
        $ticket = Ticket::find($id);

        if (!$ticket) {
            return response()->json(['success' => false, 'message' => 'Ticket not found'], 404);
        }

        $ticket->delete();

        return response()->json(['success' => true, 'message' => 'Ticket deleted successfully']);
    }
}
