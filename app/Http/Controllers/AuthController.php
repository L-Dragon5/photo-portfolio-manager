<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function showLogin() {
        if (Auth::check()) {
            return redirect()->route('admin-base');
        }

        return Inertia::render('Public/Login')->withViewData(['title' => 'Login']);
    }

    /**
     * Attempt to login user.
     * 
     * @return \Illuminate\Http\Response
     */
    public function login(Request $request) {
        if (Auth::attempt(['email' => $request->email, 'password' => $request->password], TRUE)) {
            return Inertia::location(route('admin-base'));
        } else {
            return back()->withErrors(['Incorrect login credentials provided']);
        }
    }
}
