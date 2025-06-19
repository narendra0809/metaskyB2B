<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Wallet;
use App\Models\Wallet as ModelsWallet;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;




class UserController extends Controller
{
    public function register(Request $request)
    {
        Log::info('Incoming Request Data:', $request->all());
    
        try {
            // Base validation rules for both agent and staff
            $rules = [
                'username' => 'required|string|max:25',
                'phoneno' => 'required|string|max:15',
                'address' => 'required|string|max:250',
                'reffered_by' => 'nullable|string|max:25',
                'role' => 'required|string|in:agent,staff|max:25',
                'email' => 'required|string|email|max:255|unique:users,email',
                'password' => 'required|string|min:8|confirmed',
            ];
    
            // Add additional validation rules for agents only
            if ($request->role === 'agent') {
                $rules['company_name'] = 'required|string|max:50';
                $rules['company_documents'] = 'required|file|mimes:jpeg,jpg,png,doc,docx,pdf';
                $rules['company_logo'] = 'required|file|mimes:jpeg,jpg,png';
            }
    
            // Validate incoming request data
            $validatedData = $request->validate($rules);
    
            // Handle file uploads for agents
            $companyDocumentsPath = '';
            $companyLogoPath = '';
    
            if ($request->role === 'agent') {
                // Check and move company documents
                if ($request->file('company_documents')) {
                    $companyDocumentsPath = 'company_documents/' . time() . '_' . $request->file('company_documents')->getClientOriginalName();
                    $request->file('company_documents')->move(public_path('company_documents'), $companyDocumentsPath);
                }
    
                // Check and move company logo
                if ($request->file('company_logo')) {
                    $companyLogoPath = 'company_logos/' . time() . '_' . $request->file('company_logo')->getClientOriginalName();
                    $request->file('company_logo')->move(public_path('company_logos'), $companyLogoPath);
                }
            }
    
            // Create a new user
            $user = User::create([
                'username' => $request->username,
                'company_name' => $request->role === 'agent' ? $request->company_name : null,
                'phoneno' => $request->phoneno,
                'address' => $request->address,
                'company_documents' => $request->role === 'agent' ? $companyDocumentsPath : null,
                'company_logo' => $request->role === 'agent' ? $companyLogoPath : null,
                'reffered_by' => $request->reffered_by,
                'role' => $request->role,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'is_approved' => false, // Set default value as false, waiting for admin approval
            ]);
    
            // Create a wallet for agents only
            if ($request->role === 'agent') {
                Wallet::create([
                    'user_id' => $user->id,
                    'balance' => 0.00, // initial balance set to zero
                ]);
            }
    
            // Create a token for the user
            $token = $user->createToken('auth_token')->plainTextToken;
    
            // Return a success response
            return response()->json([
                'success' => true,
                'message' => 'Registration successful. Awaiting admin approval.',
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Log validation errors
            Log::error('Validation Error:', ['errors' => $e->errors()]);
    
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            // Log the exception for debugging
            Log::error('Registration Error:', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
    
            return response()->json([
                'success' => false,
                'message' => 'Registration unsuccessful',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    
    

    public function login(Request $request)
{
    Log::info('Incoming Request Data:', $request->all());

    try {
        // Validate the login request
        $validatedData = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        // Check if the user exists by email
        $user = User::where('email', $validatedData['email'])->first();

        // Check if the email is incorrect
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Email not found',
            ], 401);
        }

        // Check if the password is correct
        if (!Hash::check($validatedData['password'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Incorrect password',
            ], 401);
        }

        // Check if the user is approved
        if (!$user->is_approved) {
            return response()->json([
                'success' => false,
                'message' => 'Your account is not approved by the admin yet',
            ], 403); // Forbidden
        }

        // Delete any existing tokens for this user
        $user->tokens()->delete();

        // Generate a new token for the user
        $token = $user->createToken('auth_token')->plainTextToken;

        // Return the success response with token and user data
        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role,
                'balance'=> $user->balance,
            ],
            'access_token' => $token,
            'token_type' => 'Bearer',
        ], 200);

    } catch (\Illuminate\Validation\ValidationException $e) {
        // Handle validation errors
        return response()->json([
            'success' => false,
            'message' => $e->errors(),
        ], 422);
    } catch (\Exception $e) {
        // Handle general errors
        return response()->json([
            'success' => false,
            'message' => 'Login failed due to an unexpected error',
        ], 500);
    }
}

    
    
    public function showdetailsuser ($id){
        $show = User::with('wallet')->findOrFail($id);
        return response()->json($show);
    }


    public function logout(Request $request)
{
    // Ensure the user is authenticated
    $user = $request->user();

    if ($user) {
        // Revoke all tokens issued to the user
        $user->tokens()->delete();

        return response()->json([
            'message' => 'Logout successful'
        ], 200);
    }

    return response()->json([
        'message' => 'No authenticated user found'
    ], 400);
}

public function changePassword(Request $request)
{
    // Log incoming request to debug issues
    Log::info('Incoming Request Data:', $request->all());

    try {
        // Validate incoming data with custom error messages
        $validatedData = $request->validate([
            'current_password' => 'required|string|min:8',
            'new_password' => 'required|string|min:8|confirmed',  // Ensures confirmation field is checked
        ]);

        $user = $request->user(); // Get the authenticated user

        // Log authenticated user to ensure it's being fetched
        Log::info('Authenticated User:', ['user_id' => $user->id]);

        // Check if the current password is correct
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Password change unsuccessful',
                'error' => 'Current password is incorrect'
            ], 400);
        }

        // If validation passes, update the password
        $user->update([
            'password' => Hash::make($request->new_password),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully',
            'error' => null  // No error on success
        ], 200);
        
    } catch (\Illuminate\Validation\ValidationException $e) {
        // Log validation errors
        Log::error('Validation failed:', $e->errors());

        // Handle specific validation failure for new password confirmation mismatch
        if (isset($e->errors()['new_password'])) {
            if (in_array('The new password confirmation does not match.', $e->errors()['new_password'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Password change unsuccessful',
                    'error' => 'The new password and confirmation password do not match'
                ], 422);
            }

            // Check if the password is too short (min: 8 characters)
            if (in_array('The new password must be at least 8 characters.', $e->errors()['new_password'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Password change unsuccessful',
                    'error' => 'The minimum required length for the new password is 8 characters.'
                ], 422);
            }
        }

        // Catch any other validation error
        return response()->json([
            'success' => false,
            'message' => 'Password change unsuccessful',
            'error' => $e->errors()  // Include detailed validation error messages
        ], 422);
        
    } catch (\Exception $e) {
        // Catch any other exceptions and log them
        Log::error('Error during password change:', ['error' => $e->getMessage()]);
        
        return response()->json([
            'success' => false,
            'message' => 'Password change unsuccessful',
            'error' => 'An error occurred while changing the password.'
        ], 500);
    }
}
public function getStaff(){
    $data = User::where('role',"staff")->get();
    return response()->json($data);
}

public function getAgent(){
    $data = User::where('role',"agent")->get();
    return response()->json($data);
}


public function showUser($id)
{
   
    if (Auth::id() !== (int)$id) {
        return response()->json(['success' => false, 'message' => 'Unauthorized access'], 403);
    }


    $user = User::find($id);


    if (!$user) {
        return response()->json(['success' => false, 'message' => 'User not found'], 404);
    }

    // Return the user's details if found
    return response()->json($user, 200);
}



public function destroy($id)
{
    try {
        // Check if the provided user ID matches the authenticated user's ID
        if (Auth::id() !== (int)$id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized access'], 403);
        }

        // Find the user by ID
        $user = User::find($id);

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User not found'], 404);
        }

        // If the user is an agent, delete the associated company documents and logo
        if ($user->role === 'agent') {
            if ($user->company_documents && file_exists(public_path($user->company_documents))) {
                unlink(public_path($user->company_documents));
            }

            if ($user->company_logo && file_exists(public_path($user->company_logo))) {
                unlink(public_path($user->company_logo));
            }
        }

        // Delete the user record from the database
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User and associated data deleted successfully.',
        ], 200);
    } catch (\Exception $e) {
        // Log the exception for debugging
        Log::error('Deletion Error:', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);

        return response()->json([
            'success' => false,
            'message' => 'An error occurred while deleting the user.',
            'error' => $e->getMessage(),
        ], 500);
    }
}

public function admindelete($id)
{
    try {
        // Find the user by ID
        $user = User::find($id);

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User not found'], 404);
        }

        // If the user is an agent, delete the associated company documents and logo
        if ($user->role === 'agent') {
            if ($user->company_documents && file_exists(public_path($user->company_documents))) {
                unlink(public_path($user->company_documents));
            }

            if ($user->company_logo && file_exists(public_path($user->company_logo))) {
                unlink(public_path($user->company_logo));
            }
        }

        // Delete the user record from the database
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User and associated data deleted successfully.',
        ], 200);
    } catch (\Exception $e) {
        // Log the exception for debugging
        Log::error('Deletion Error:', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);

        return response()->json([
            'success' => false,
            'message' => 'An error occurred while deleting the user.',
            'error' => $e->getMessage(),
        ], 500);
    }
}

  public function update(Request $request, $id)
    {
        Log::info('Incoming Request Data:', $request->all());
    
        // Find the user by ID
        $user = User::find($id);
    
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User not found'], 404);
        }
    
        // Validation rules
        $rules = [
            'username' => 'nullable|string|max:25',
            'phoneno' => 'nullable|string|max:15',
            'address' => 'nullable|string|max:250',
            'email' => 'nullable|string|email|max:255|unique:users,email,' . $id,
            'password' => 'nullable|string|min:8|confirmed',
        ];
    
        if ($user->role === 'agent') {
            $rules['company_name'] = 'nullable|string|max:50';
            $rules['company_documents'] = 'nullable|file|mimes:jpeg,jpg,png,doc,docx,pdf';
            $rules['company_logo'] = 'nullable|file|mimes:jpeg,jpg,png';
        }
    
        // Validate request data
        $validatedData = $request->validate($rules);
    
        // Handle file uploads for agents
        if ($user->role === 'agent') {
            // Handle company documents
            if ($request->hasFile('company_documents')) {
                $companyDocumentsPath = 'company_documents/' . time() . '_' . $request->file('company_documents')->getClientOriginalName();
                $request->file('company_documents')->move(public_path('company_documents'), $companyDocumentsPath);
                $validatedData['company_documents'] = $companyDocumentsPath;
            } else {
                $validatedData['company_documents'] = $user->company_documents; // Keep the old value
            }
    
            // Handle company logo
            if ($request->hasFile('company_logo')) {
                $companyLogoPath = 'company_logos/' . time() . '_' . $request->file('company_logo')->getClientOriginalName();
                $request->file('company_logo')->move(public_path('company_logos'), $companyLogoPath);
                $validatedData['company_logo'] = $companyLogoPath;
            } else {
                $validatedData['company_logo'] = $user->company_logo; // Keep the old value
            }
        }
    
        // Hash the password if provided
        if (isset($validatedData['password'])) {
            $validatedData['password'] = Hash::make($validatedData['password']);
        }
    
        // Update the user
        $user->update($validatedData);
    
        return response()->json([
            'success' => true,
            'message' => 'User updated successfully',
            'data' => $user
        ], 200);
    }
    
 public function approve(Request $request, $id)
    {
        try {
            // Find the user by ID
            $user = User::find($id);
    
            if (!$user) {
                return response()->json(['success' => false, 'message' => 'User not found'], 404);
            }
    
            // Validate that is_approved is provided
            $validatedData = $request->validate([
                'is_approved' => 'required|boolean',
            ]);
    
            // Update the user's approval status
            $user->is_approved = $validatedData['is_approved'];
            $user->save();
    
            return response()->json([
                'success' => true,
                'message' => $validatedData['is_approved'] ? 'User approved successfully' : 'User disapproved successfully',
                'data' => $user
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred',
                'error' => $e->getMessage(),
            ], 500);
        }
    }



}
 