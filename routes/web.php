<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\ByDepartment\BSAController as Bsa;
use App\Http\Controllers\ByDepartment\BSBAController as Bsba;
use App\Http\Controllers\ByDepartment\BSCSController as Bscs;
use App\Http\Controllers\ByDepartment\BSCTEController as Bscte;
use App\Http\Controllers\ByDepartment\BSHMController as Bshm;
use App\Http\Controllers\CandidateController;
use App\Http\Controllers\ElectionController;
use App\Http\Controllers\GoogleController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\VoteController;
use App\Models\Candidate;
use App\Models\Election;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
})->name('welcome');

Route::get('/dashboard', function () {
    $candidates = Candidate::all()->groupBy('position');
    $election = Election::latest()->first();

    return Inertia::render('Dashboard', [
        'candidates' => $candidates,
        'initialElection' => $election,
        'auth' => [
            'user' => Auth::user(),
        ],
        'election' => $election ?: null,
    ]);
})->middleware('auth')->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::post('/Vote', [VoteController::class, 'store'])->name('vote.store');
    Route::put('/profile/basic', [ProfileController::class, 'updateBasic'])->name('profile.basic.update');
    Route::patch('/profile/school', [ProfileController::class, 'updateSchool'])->name('profile.school.update');
    // In web.php

    // By Department

    Route::get('Voter/ByDepartment/BSCS', [Bscs::class, 'voterView'])->name('getbscsview');
    Route::post('Vote/ByDepartment/BSCS', [Bscs::class, 'store'])->name('bscs.vote');

    Route::get('Voter/ByDepartment/BSA', [Bsa::class, 'voterView'])->name('getbsaview');
    Route::post('Voter/ByDepartment/BSA', [Bsa::class, 'store'])->name('bsa.vote');

    Route::get('Voter/ByDepartment/BSBA', [Bsba::class, 'voterView'])->name('getbsbaview');
    Route::post('Vote/ByDepartment/BSBA', [Bsba::class, 'store'])->name('bsba.vote');

    Route::get('Voter/ByDepartment/BSHM', [Bshm::class, 'voterView'])->name('getbshmview');
    Route::post('Vote/ByDepartment/BSHM', [Bshm::class, 'store'])->name('bshm.vote');

    Route::get('Voter/ByDepartment/BSCTE', [Bscte::class, 'voterView'])->name('getbscteview');
    Route::post('Vote/ByDepartment/bscte', [Bscte::class, 'store'])->name('bscte.vote');

});

Route::get('/admin/login', [AdminController::class, 'create'])->name('admin.login');
Route::post('/admin/login', [AdminController::class, 'store'])->name('admin.login.store');
Route::post('/admin/logout', [AdminController::class, 'destroy'])->name('admin.logout');

Route::get('auth/google', [GoogleController::class, 'redirectToGoogle'])->name('google.redirect');
Route::get('auth/google/callback', [GoogleController::class, 'handleGoogleCallback'])->name('callback');

Route::post('/complete-registration', [RegisteredUserController::class, 'completeProfile'])->name('complete.registration');
Route::get('/terms', function () {
    return Inertia::render('Terms');
})->name('terms');

Route::middleware(['auth:admin'])->group(function () {

    Route::get('/candidate', [CandidateController::class, 'index'])->name('candidate.dashboard');
    Route::post('/admin/candidates', [CandidateController::class, 'store'])->name('candidate.store');
    Route::put('/candidates/{candidate}', [CandidateController::class, 'update'])->name('candidate.update');
    Route::get('/admin/dashboard', [AdminController::class, 'index'])->name('admin.dashboard');
    Route::post('/import-students', [AdminController::class, 'importStudents'])->name('import.validate');

    Route::post('/candidates/bulk-destroy', [CandidateController::class, 'bulkDestroy'])->name('candidate.bulk-destroy');
    Route::post('/candidates/import', [CandidateController::class, 'importExcel'])->name('candidates.import');
    Route::post('/admin/validate/store', [AdminController::class, 'advalidStudent'])->name('admin.validate.store');

    Route::post('/elections/store', [ElectionController::class, 'store'])->name('election.store');
    Route::put('/elections/{election}/status', [ElectionController::class, 'updateStatus'])
        ->name('election.updateStatus');
    Route::delete('/elections/{election}', [ElectionController::class, 'destroy'])->name('election.destroy');

    Route::get('/admin/view-students', [AdminController::class, 'viewStudents'])->name('admin.view.students');
    Route::get('/admin/view-verified-students', [AdminController::class, 'viewVerifiedStudents'])->name('admin.view.verified.students');

    Route::post('/admin/verified/students/bulk-delete', [AdminController::class, 'bulkDeleteVerifiedStudents'])->name('admin.verified.students.bulkDelete');
    Route::post('/admin/students/bulk-delete', [AdminController::class, 'bulkDelete'])->name('admin.students.bulkDelete');

    Route::get('/USG/results/Download', [AdminController::class, 'downloadResults']);

    // by department routes
    Route::get('ByDepartment/BSCS', [Bscs::class, 'view'])->name('getbscs');
    Route::post('ByDepartment/Store/BSCS', [Bscs::class, 'storebscs'])->name('storebscs');
    Route::put('ByDepartment/Update/BSCS/{id}', [Bscs::class, 'updatebscs'])->name('updatebscs');
    Route::delete('ByDepartment/admin/bscs/{id}', [Bscs::class, 'destroybscs'])->name('destroybscs');

    Route::get('ByDepartment/BSA', [Bsa::class, 'view'])->name('getbsa');
    Route::post('ByDepartment/BSA', [Bsa::class, 'storebsa'])->name('storebsa');
    Route::put('ByDepartment/Update/BSA/{id}', [Bsa::class, 'updatebsa'])->name('updatebsa');
    Route::delete('ByDepartment/admin/Bsa/{id}', [Bsa::class, 'destroybsa'])->name('destroybsa');

    Route::get('ByDepartment/BSBA', [Bsba::class, 'view'])->name('getbsba');
    Route::post('ByDepartment/BSBA', [Bsba::class, 'storebsba'])->name('storebsba');
    Route::put('ByDepartment/Update/BSBA/{id}', [Bsba::class, 'updatebsba'])->name('updatebsba');
    Route::delete('ByDepartment/admin/Bsba/{id}', [Bsba::class, 'destroybsba'])->name('destroybsba');

    Route::get('ByDepartment/BSHM', [Bshm::class, 'view'])->name('getbshm');
    Route::post('ByDepartment/BSHm', [Bshm::class, 'storebshm'])->name('storebshm');
    Route::put('ByDepartment/Update/BSHM/{id}', [Bshm::class, 'updatebshm'])->name('updatebshm');
    Route::delete('ByDepartment/admin/Bsa/{id}', [Bshm::class, 'destroybshm'])->name('destroybshm');

    Route::get('ByDepartment/BSCTE', [Bscte::class, 'view'])->name('getbscte');
    Route::post('ByDepartment/BSCTE', [Bscte::class, 'storebscte'])->name('storebscte');
    Route::put('ByDepartment/Update/BSCTE/{id}', [Bscte::class, 'updatebscte'])->name('updatebscte');
    Route::delete('ByDepartment/admin/Bcte/{id}', [Bscte::class, 'destroybscte'])->name('destroybscte');
});

Route::get('/Election/Results', [ElectionController::class, 'results'])->name('election.results');
Route::post('/election/close', [ElectionController::class, 'close'])->name('election.close');
Route::get('/liveTally', [ElectionController::class, 'liveTally'])->name('liveTally');

Route::middleware('throttle:10,1')->post('/vote', [VoteController::class, 'store']);
require __DIR__.'/auth.php';
