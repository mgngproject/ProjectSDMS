<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function login(){
            return view ('auth/login');
    }

    public function loginProses(Request $request){
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|min:6',
        ],[
            'email.required' => 'Email Tidak Boleh Kosong',
            'password.required' => 'Password Tidak Boleh Kosong',
            'password.min'      => 'Password Minimal 6 Karakter',
        
        ]);
        $data = array(
            'email' => $request->email,
            'password' => $request->password,
         );

        if (Auth::attempt($data)) {
            return redirect()->route('dashboard');
        } else {
            return redirect()->back()->with('error', 'Email atau Password Salah');
        }
    }

    public function logout(){
        Auth::logout();

        return redirect('/');
    }
}
