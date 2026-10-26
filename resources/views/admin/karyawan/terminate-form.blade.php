@extends('layouts/app')

@section('content')

<link href="{{ asset('landing/landing/assets/css/karyawan.css') }}" rel="stylesheet">

<div class="container-fluid">
    <div class="card shadow">
        <div class="card-header">
            <h6 class="m-0 font-weight-bold text-danger">Terminate Karyawan</h6>
        </div>
        <div class="card-body">
            
            <div class="alert alert-info">
                <h5 class="mb-3"><i class="fas fa-info-circle mr-2"></i>Data Karyawan</h5>
                <div class="row">
                    <div class="col-md-6 info-custom">
                        <table>
                            <tr><td><strong>NP</strong></td><td class="px-2">:</td><td>{{ $karyawan->np }}</td></tr>
                            <tr><td><strong>Nama</strong></td><td class="px-2">:</td><td>{{ $karyawan->nama }}</td></tr>
                            <tr><td><strong>Unit Kerja</strong></td><td class="px-2">:</td><td>{{ $karyawan->unit_kerja }}</td></tr>
                            <tr><td><strong>Jabatan</strong></td><td class="px-2">:</td><td>{{ $karyawan->jabatan }}</td></tr>
                        </table>
                    </div>
                    <div class="col-md-6 info-custom">
                        <table>
                            <tr><td><strong>Level</strong></td><td class="px-2">:</td><td>{{ $karyawan->level }}</td></tr>
                            <tr><td><strong>Role</strong></td><td class="px-2">:</td><td>{{ $karyawan->role }}</td></tr>
                            <tr><td><strong>Masa Kerja</strong></td><td class="px-2">:</td><td>{{ $karyawan->masa_kerja }} bulan</td></tr>
                        </table>
                    </div>
                </div>
            </div>

            <form action="{{ route('karyawan.terminate', $karyawan->id) }}" method="POST">
                @csrf
                
                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="tanggal_keluar">Tanggal Keluar <span class="text-danger">*</span></label>
                            <input type="date" 
                                   class="form-control form-control-custom @error('tanggal_keluar') is-invalid @enderror" 
                                   id="tanggal_keluar" 
                                   name="tanggal_keluar" 
                                   value="{{ old('tanggal_keluar') }}" 
                                   style="font-size: 12px;"
                                   required>
                            @error('tanggal_keluar')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>
                </div>

                <div class="form-group">
                    <label for="alasan_keluar">Alasan Keluar <span class="text-danger">*</span></label>
                    <textarea class="form-control form-control-custom @error('alasan_keluar') is-invalid @enderror" 
                              id="alasan_keluar" 
                              name="alasan_keluar" 
                              rows="5" 
                              placeholder="Masukkan alasan terminate..." 
                              style="font-size: 12px;"
                              required>{{ old('alasan_keluar') }}</textarea>
                    @error('alasan_keluar')
                        <div class="invalid-feedback">{{ $message }}</div>
                    @enderror
                </div>

                <hr>

                <div class="form-group">
                    <button type="submit" class="btn btn-danger">
                        <i class="fas fa-user-slash mr-2"></i>Terminate Karyawan
                    </button>
                    <a href="{{ route('karyawan') }}" class="btn btn-secondary">
                        <i class="fas fa-arrow-left mr-2"></i>Batal
                    </a>
                </div>
            </form>

        </div>
    </div>
</div>

@endsection