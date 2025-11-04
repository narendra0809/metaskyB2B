<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class TicketController extends Controller
{
    /**
     * Store a newly created ticket in storage.
     */
    public function import(Request $request)
{
    $validatedData = $request->validate([
        'file' => 'required|file|mimes:xls,xlsx,csv',
    ]);

    if ($request->hasFile('file')) {
        try {
            $file = $request->file('file');
            $rows = Excel::toArray(null,$file)[0]; // Get first sheet as plain array

            if (count($rows) < 2) {
                return response()->json([
                    'success' => false,
                    'message' => 'Excel file contains no data',
                ], 422);
            }

            $headers = array_map('strtolower', $rows[0]); // Get headers row in lowercase
            unset($rows[0]); // Remove header row from data

            foreach ($rows as $index => $row) {
                // Combine header keys with each row values
                $rowData = array_combine($headers, $row);

                if (!$rowData) {
                    Log::warning("Row #$index could not be combined with headers, skipping.");
                    continue;
                }

                // Decode JSON columns
                $options = isset($rowData['options']) && $rowData['options'] !== 'NULL'
                    ? json_decode($rowData['options'], true)
                    : [];

                $terms = isset($rowData['terms_and_conditions']) && $rowData['terms_and_conditions'] !== 'NULL'
                    ? json_decode($rowData['terms_and_conditions'], true)
                    : null;

                Transportation::create(
                    [   'company_name' => $rowData['company_name'],
                        'destination_id' => $rowData['destination_id'],
                        'company_document' => $rowData['company_document'],
                        'address' => $rowData['address'],
                        'transport' => $rowData['transport'],
                        'vehicle_type' => $rowData['vehicle_type'],
                        'options' => $options,
                        'terms_and_conditions' => $terms,
                    ]
                );

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
