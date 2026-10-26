<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\KontrakController;
use App\Http\Controllers\DatadiriController;
use App\Http\Controllers\KaryawanController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MonitoringController;


Route::get('/', function () {
    return view('welcome');
})-> name('welcome');

Route::get('login',[AuthController::class,'login'])->name('login');
Route::post('login',[AuthController::class,'loginProses'])
        ->middleware('throttle:5,1')
        ->name('loginProses');
Route::post('logout',[AuthController::class,'logout'])->name('logout');

Route::middleware('checkLogin')->group(function(){
    
    Route::get('dashboard',[DashboardController::class,'index'])->name('dashboard');

    Route::get('/karyawan', [KaryawanController::class, 'index'])->name('karyawan');
    Route::get('/karyawan/create', [KaryawanController::class, 'create'])->name('karyawan.create');
    Route::post('/karyawan', [KaryawanController::class, 'store'])->name('karyawan.store'); 
    Route::get('/karyawan/{id}/edit', [KaryawanController::class, 'edit'])->name('karyawan.edit'); 
    Route::put('/karyawan/{id}', [KaryawanController::class, 'update'])->name('karyawan.update');
    Route::delete('/karyawan/{id}', [KaryawanController::class, 'destroy'])->name('karyawan.destroy');
    Route::get('/karyawan/excel', [KaryawanController::class, 'excel'])->name('karyawan.excel');
    Route::get('/karyawan/pdf', [KaryawanController::class, 'pdf'])->name('karyawan.pdf');
    Route::post('/karyawan/import', [KaryawanController::class, 'karyawanImport'])->name('karyawan.import');
    Route::post('/karyawan/{id}/save-link', [KaryawanController::class, 'saveLink'])
    ->name('karyawan.save-link');
    Route::post('/karyawan/bulk-delete', [KaryawanController::class, 'bulkDelete'])->name('karyawan.bulkDelete');
    
    Route::get('/terminate', [KaryawanController::class, 'terminateList'])->name('terminate');
    Route::get('/terminate/create', [KaryawanController::class, 'createTerminate'])->name('terminate.create');
    Route::post('/terminate/store', [KaryawanController::class, 'storeTerminate'])->name('terminate.store');
    Route::get('/karyawan/{id}/terminate-form', [KaryawanController::class, 'showTerminateForm'])->name('karyawan.terminate.form');
    Route::post('/karyawan/{id}/terminate', [KaryawanController::class, 'terminate'])->name('karyawan.terminate');
    Route::get('/terminate/{id}/edit', [KaryawanController::class, 'editTerminate'])->name('terminate.edit');
    Route::put('/terminate/{id}', [KaryawanController::class, 'updateTerminate'])->name('terminate.update');
    Route::delete('/terminate/{id}', [KaryawanController::class, 'destroyTerminate'])->name('terminate.destroy');
    Route::get('/terminate/excel', [KaryawanController::class, 'excelTerminate'])->name('terminate.excel');
    Route::get('/terminate/pdf', [KaryawanController::class, 'pdfTerminate'])->name('terminate.pdf');
    Route::post('/terminate/bulk-delete', [KaryawanController::class, 'bulkDeleteTerminate'])->name('terminate.bulkDelete');

    Route::get('/monitoring', [MonitoringController::class, 'index'])->name('monitoring');
    Route::post('/monitoring/{id}/checkbox', [MonitoringController::class, 'updateCheckbox'])->name('monitoring.checkbox');
    Route::post('/monitoring/{id}/textfield', [MonitoringController::class, 'updateTextField'])->name('monitoring.textfield');

    Route::get('/kontrak', [KontrakController::class, 'riwayat'])->name('kontrak');
    Route::get('karyawan/{karyawan_id}/kontrak', [KontrakController::class, 'karyawan'])->name('karyawan.kontrak');
    Route::get('karyawan/{karyawan_id}/kontrak/create', [KontrakController::class, 'create'])->name('karyawan.kontrak.create');
    Route::post('kontrak', [KontrakController::class, 'store'])->name('kontrak.store');
    Route::get('kontrak/{id}/edit', [KontrakController::class, 'edit'])->name('kontrak.edit');
    Route::put('kontrak/{id}', [KontrakController::class, 'update'])->name('kontrak.update');

    Route::get('/datadiri', [DatadiriController::class, 'index'])->name('datadiri');
    Route::get('/datadirikaryawan/create', [DatadiriController::class, 'create'])->name('datadiri.create');
    Route::post('/datadiri', [DatadiriController::class, 'store'])->name('datadiri.store');
    Route::get('/datadiri/excel', [DatadiriController::class, 'excelDatadiri'])->name('datadiri.excel');
    Route::get('/datadiri/pdf', [DatadiriController::class, 'pdfDatadiri'])->name('datadiri.pdf');
    Route::post('/datadiri/import', [DatadiriController::class, 'DatadiriImport'])->name('datadiri.import');
    Route::get('/datadiri/{id}/edit', [DatadiriController::class, 'edit'])->name('datadiri.edit');
    Route::put('/datadiri/{id}', [DatadiriController::class, 'update'])->name('datadiri.update');
});