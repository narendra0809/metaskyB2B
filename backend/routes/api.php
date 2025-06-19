<?php

use App\Http\Controllers\Agent\AgentController;
use App\Http\Controllers\Agent\BookingController;
use App\Http\Controllers\BankdetailController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DestinationController; 
use App\Http\Controllers\HotelController;
use App\Http\Controllers\SightseeingController;
use App\Http\Controllers\TransportationController;
use App\Http\Controllers\WalletController;
use App\Http\Controllers\TaxController;
use App\Http\Controllers\TicketController;

// Authenticated route to get the current user
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Public routes for user registration and login
Route::post('/register', [UserController::class,'register']);
Route::get('/register/{id}', [UserController::class,'showdetailsuser']);
Route::post('/login', [UserController::class,'login']);
Route::get('/test', function () {
    return 'This is a test route!';
});
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/setdestination', [DestinationController::class, 'setDestination']);
    Route::get('/getdestinations', [DestinationController::class, 'getDestination']);
    Route::post('/deletedestination/{id}', [DestinationController::class, 'deleteDestination']);
    Route::post('/editdestination/{id}', [DestinationController::class, 'editDestination']);
    Route::get('/countries', [DestinationController::class, 'getCountries']);
    Route::get('/states/{country_id}', [DestinationController::class, 'getStates']);
    Route::get('/cities/{state_id}', [DestinationController::class, 'getCities']);


    Route::post('/logout', [UserController::class, 'logout']);
    Route::post('/changePassword',[UserController::class,'changePassword']);

    Route::get('/staff', [UserController::class, 'getStaff']);
    Route::get('/agent', [UserController::class, 'getAgent']);
    Route::get('/showuser/{id}', [UserController::class, 'showUser']);
    Route::delete('/deleteuser/{id}', [UserController::class, 'destroy']);
    Route::delete('/admindelete/{id}', [UserController::class, 'admindelete']);
    Route::post('/updateuser/{id}', [UserController::class, 'update']);
    Route::post('/approval/{id}', [UserController::class, 'approve']);
    // Route::post('/adminchangepassword/{userId}', [UserController::class, 'adminChangePassword']);


// Protected routes for hotel management, requiring user authentication
    Route::post('/hotel',[HotelController::class,'hotel']);
    Route::get('/hotel/{id}',[HotelController::class,'show']);
    Route::get('/hotels',[HotelController::class,'index']);
    Route::post('/updatehotel/{id}',[HotelController::class,'updatehotel']);
    Route::delete('/deletehotel/{id}',[HotelController::class,'destroy']);
    Route::get('/getHotelsWithCity', [HotelController::class, 'getHotelsWithCity']);
    
// Protected routes for tickets management, requiring user authentication
Route::post('/tickets', [TicketController::class, 'store']); // Create
Route::get('/tickets', [TicketController::class, 'index']); // Read (List)
Route::get('/tickets/{id}', [TicketController::class, 'show']); // Read (Single)
Route::post('/tickets/{id}', [TicketController::class, 'update']); // Update
Route::delete('/tickets/{id}', [TicketController::class, 'destroy']); // Delete




// Protected routes for sightseeing management, requiring user authentication
    Route::post('/sightseeing',[SightseeingController::class,'postSightseeing']);
    Route::get('/sightseeing/{id}',[SightseeingController::class,'showsightseeing']);
    Route::get('/sightseeings',[SightseeingController::class,'index']);
    Route::get('/getsswithcity',[SightseeingController::class,'getsswithcity']);
    Route::post('/updatesightseeing/{id}',[SightseeingController::class,'updatesightseeing']);
    Route::delete('/deletesightseeing/{id}',[SightseeingController::class,'destroy']);

// Protected routes for transportation management, requiring user authentication
    Route::post('/transportation',[TransportationController::class,'transportation']);
    Route::get('/showtransportation/{id}',[TransportationController::class,'showtransportation']);
    Route::post('/updatetransportation/{id}',[TransportationController::class,'updatetransportation']);
    Route::delete('/deletetransportation/{id}',[TransportationController::class,'destroy']);
    Route::get('/transportations',[TransportationController::class,'index']);
    Route::get('/getTransportWithCity',[TransportationController::class,'getTransportWithCity']);


// Protected routes for User banking info management, requiring user authentication
    Route::post('/bankdetail',[BankdetailController::class,'bankdetail']);
    Route::get('/bankdetail/{user_id}',[BankdetailController::class,'showbankdetail']);
    Route::get('/allbankdetail',[BankdetailController::class,'showAll']);
    Route::post('/updatebankdetail/{id}',[BankdetailController::class,'updatebankdetail']);
    Route::post('/deletebankdetail/{id}',[BankdetailController::class,'delete']);

    Route::get('/showbalance', [WalletController::class, 'showBalance']);
    Route::get('/userbalance/{userId}', [WalletController::class, 'userBalance']);
    Route::post('/wallet/update/{agentId}', [WalletController::class, 'updateWalletBalance']);


    
    Route::get('/taxes', [TaxController::class, 'getTaxes']);            
    Route::post('/tax', [TaxController::class, 'createTax']);        
    Route::post('/updatetaxes/{id}', [TaxController::class, 'updateTax']);    
    Route::delete('/deletetaxes/{id}', [TaxController::class, 'deleteTax']); 



    //agent Routes
    Route::post('/add-payment',[AgentController::class,'addPayment']);
    Route::get('/getpayment',[AgentController::class,'showpayment']);
    Route::get('/gettransaction',[AgentController::class,'showtransaction']);
    Route::get('/getuserpayment',[AgentController::class,'showUserPayment']);
    Route::get('/getusertransaction',[AgentController::class,'showuserTransaction']);
    Route::post('/approvepayment/{paymentId}', [AgentController::class, 'approvePayment']);

    Route::post('/addbooking',[BookingController::class,'addBooking']);
    Route::get('/showbooking/{id}',[BookingController::class,'showBookingsByUser']);
    Route::get('/showbookings',[BookingController::class,'getAllBookings']);
    // Route::post('/approvepayment/{id}',[BookingController::class,'approvePaymentStatus']);
    Route::post('/approvebooking/{id}',[BookingController::class,'approveBooking']);
    Route::post('/agent-payment/{id}',[BookingController::class,'bookingPayment']);

    Route::post('/editbooking/{id}',[BookingController::class,'editBooking']);
    Route::post('/cancelbooking/{id}',[BookingController::class,'cancelBooking']);

   
});
