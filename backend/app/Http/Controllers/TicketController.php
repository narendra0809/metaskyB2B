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

    if (!$request->hasFile('file')) {
        return response()->json([
            'success' => false,
            'message' => 'No file uploaded',
        ], 400);
    }

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

            $startTimes = isset($rowData['time_slots_start_time'])
                ? array_map('trim', explode(',', $rowData['time_slots_start_time']))
                : [];

            // $endTimes = isset($rowData['time_slots_end_time'])
            //     ? array_map('trim', explode(',', $rowData['time_slots_end_time']))
            //     : [];

            $adultPricesRaw = isset($rowData['time_slots_adult_price'])
                ? array_map('trim', explode('_', $rowData['time_slots_adult_price']))
                : [];

            $childPricesRaw = isset($rowData['time_slots_child_price'])
                ? array_map('trim', explode('_', $rowData['time_slots_child_price']))
                : [];

            $slotsCount = max(count($startTimes),count($adultPricesRaw),count($childPricesRaw));

            if (count($adultPricesRaw) === 1) {
                $adultPrices = array_fill(0, $slotsCount, $adultPricesRaw[0]);
            } else {
                $adultPrices = $adultPricesRaw;
            }

            if (count($childPricesRaw) === 1) {
                $childPrices = array_fill(0, $slotsCount, $childPricesRaw[0]);
            } else {
                $childPrices = $childPricesRaw;
            }

            $time_slots = [];
            for ($i = 0; $i < $slotsCount; $i++) {
                $time_slots[] = [
                    'start_time'   => $startTimes[$i]  ?? null,
                    // 'end_time'     => $endTimes[$i]    ?? null,
                    'adult_price'  => $adultPrices[$i] ?? null,
                    'child_price'  => $childPrices[$i] ?? null,
                ];
            }

          
            $hasTimeSlots = $slotsCount > 0;

         
            $termsAndConditions = [
                'mobileVoucher' => $rowData['terms_mobile_voucher'] ?? '',
                'instantConfirmation' => $rowData['terms_instant_confirmation'] ?? '',
                'tourTransfers' => [],
                'bookingPolicy' => [
                    'cancellationPolicy' => isset($rowData['terms_cancellation_policy'])
                        ? array_map('trim', explode(',', $rowData['terms_cancellation_policy']))
                        : [],
                    'childPolicy' => isset($rowData['terms_child_policy'])
                        ? array_map('trim', explode(',', $rowData['terms_child_policy']))
                        : [],
                ],
                'inclusions' => isset($rowData['terms_inclusions'])
                    ? array_map('trim', explode(',', $rowData['terms_inclusions']))
                    : [],
                'exclusions' => isset($rowData['terms_exclusions'])
                    ? array_map('trim', explode(',', $rowData['terms_exclusions']))
                    : [],
            ];

            Ticket::create([
                'name' => $rowData['name'],
                'status' => $rowData['status'],
                'has_time_slots' => $hasTimeSlots,
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


    public function store(Request $request)
{
    Log::info('Incoming Request: ' . json_encode($request->all()));

    $validator = Validator::make($request->all(), [
        'name' => 'required|string|max:255',
        'status' => 'required|in:Active,Inactive',
        'has_time_slots' => 'required|boolean',
        'time_slots' => 'nullable|array',
        'time_slots.*.start_time' => 'required_with:time_slots.*.end_time,time_slots.*.adult_price,time_slots.*.child_price|string|max:20',
        // 'time_slots.*.end_time'   => 'required_with:time_slots.*.start_time,time_slots.*.adult_price,time_slots.*.child_price|string|max:20',
        'time_slots.*.adult_price' => 'required_with:time_slots.*.start_time,time_slots.*.end_time|numeric',
        'time_slots.*.child_price' => 'required_with:time_slots.*.start_time,time_slots.*.end_time|numeric',
        'terms_and_conditions' => 'nullable|json',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'errors'  => $validator->errors(),
        ], 422);
    }

    $terms = $request->has('terms_and_conditions')
        ? json_decode($request->terms_and_conditions, true)
        : null;

    $ticket = Ticket::create([
        'name' => $request->name,
        'status' => $request->status,
        'has_time_slots' => $request->boolean('has_time_slots'),
        'time_slots' => $request->time_slots,
        'terms_and_conditions' => $terms,
    ]);

    return response()->json([
        'success' => true,
        'message' => 'Ticket created successfully',
        'data'    => $ticket,
    ], 201);
}

    

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


    public function show($id)
    {
        $ticket = Ticket::find($id);

        if (!$ticket) {
            return response()->json(['success' => false, 'message' => 'Ticket not found'], 404);
        }

        return response()->json(['success' => true, 'data' => $ticket]);
    }


    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'status' => 'required|in:Active,Inactive',
            'time_slots' => 'nullable|array',
            'time_slots.*.start_time' => 'required_with:time_slots.*.end_time,time_slots.*.adult_price,time_slots.*.child_price|string|max:20',
            // 'time_slots.*.end_time'   => 'required_with:time_slots.*.start_time,time_slots.*.adult_price,time_slots.*.child_price|string|max:20',
            'time_slots.*.adult_price' => 'required_with:time_slots.*.start_time,time_slots.*.end_time|numeric',
            'time_slots.*.child_price' => 'required_with:time_slots.*.start_time,time_slots.*.end_time|numeric',
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
            'status' => $request->status,
            'time_slots' => $request->time_slots,
            'terms_and_conditions' => $terms,
        ]);

        return response()->json(['success' => true, 'message' => 'Ticket updated successfully', 'data' => $ticket]);
    }

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
