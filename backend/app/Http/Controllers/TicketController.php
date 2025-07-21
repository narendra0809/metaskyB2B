<?php
namespace App\Http\Controllers;

use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TicketController extends Controller
{
    /**
     * Store a newly created ticket in storage.
     */
    public function store(Request $request)
    {
        // Validate the request data
        \Log::info('Incoming Request: ' . json_encode($request->all()));

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'status' => 'required|in:Active,Inactive',
            'transfer_options' => 'required|array',
            'category' => 'required|array',
            'category.*' => 'string|max:100',
            'transfer_options.*.option' => 'required|string|max:100',
            'transfer_options.*.adult_price' => 'required|numeric',
            'transfer_options.*.child_price' => 'required|numeric',
            'time_slots' => 'required|array',
            'time_slots.*.slot' => 'required|string|max:100',
            'time_slots.*.adult_price' => 'required|numeric',
            'time_slots.*.child_price' => 'required|numeric',
        ]);

        // If validation fails, return error response
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Create the ticket
        $ticket = Ticket::create([
            'name' => $request->name,
            'category' => $request->category,
            'status' => $request->status,
            'transfer_options' => $request->transfer_options,
            'time_slots' => $request->time_slots,
        ]);

        return response()->json(['message' => 'Ticket created successfully', 'data' => $ticket], 201);
    }

    /**
     * Display a listing of tickets with filtering.
     */
    public function index(Request $request)
    {
        // Validate filter parameters
        $validator = Validator::make($request->all(), [
            'status' => 'nullable|in:Active,Inactive',
            'category' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Query tickets with optional filtering
        $query = Ticket::query();

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('category')) {
            $query->where('category', 'like', '%' . $request->category . '%');
        }

        $tickets = $query->get();

        return response()->json(['data' => $tickets]);
    }

    /**
     * Display the specified ticket.
     */
    public function show($id)
    {
        $ticket = Ticket::find($id);

        if (!$ticket) {
            return response()->json(['message' => 'Ticket not found'], 404);
        }

        return response()->json(['data' => $ticket]);
    }

    /**
     * Update the specified ticket in storage.
     */
    public function update(Request $request, $id)
    {
        // Validate the request data
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'category' => 'required|array',
            'category.*' => 'string|max:100',
            'status' => 'required|in:Active,Inactive',
            'transfer_options' => 'required|array',
            'transfer_options.*.option' => 'required|string|max:100',
            'transfer_options.*.adult_price' => 'required|numeric',
            'transfer_options.*.child_price' => 'required|numeric',
            'time_slots' => 'required|array',
            'time_slots.*.slot' => 'required|string|max:100',
            'time_slots.*.adult_price' => 'required|numeric',
            'time_slots.*.child_price' => 'required|numeric',
        ]);

        // If validation fails, return error response
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $ticket = Ticket::find($id);

        if (!$ticket) {
            return response()->json(['message' => 'Ticket not found'], 404);
        }

        // Update the ticket
        $ticket->update([
            'name' => $request->name,
            'category' => $request->category,
            'status' => $request->status,
            'transfer_options' => $request->transfer_options,
            'time_slots' => $request->time_slots,
        ]);

        return response()->json(['message' => 'Ticket updated successfully', 'data' => $ticket]);
    }

    /**
     * Remove the specified ticket from storage.
     */
    public function destroy($id)
    {
        $ticket = Ticket::find($id);

        if (!$ticket) {
            return response()->json(['message' => 'Ticket not found'], 404);
        }

        // Delete the ticket
        $ticket->delete();

        return response()->json(['message' => 'Ticket deleted successfully']);
    }
}
