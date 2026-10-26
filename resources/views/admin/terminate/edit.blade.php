@extends('layouts/app')

@section('content')

<link href="{{ asset('landing/landing/assets/css/karyawan.css') }}" rel="stylesheet">

<div class="container-fluid">
    <div class="card shadow">
        <div class="card-header">
            <h6 class="m-0 font-weight-bold text-warning">Edit Data Terminate Karyawan</h6>
        </div>
        <div class="card-body">
            
            <form action="{{ route('terminate.update', $karyawan->id) }}" method="POST">
                @csrf
                @method('PUT')

                <h6 class="text-primary font-weight-bold mb-3">Informasi Karyawan</h6>
                
                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="np" class="form-label-custom">NP</label>
                            <input type="text" class="form-control form-control-custom readonly-field" value="{{ $karyawan->np }}" readonly>
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="nama" class="form-label-custom">Nama</label>
                            <input type="text" class="form-control form-control-custom readonly-field" value="{{ $karyawan->nama }}" readonly>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="kategori" class="form-label-custom">Kategori</label>
                            <input type="text" class="form-control form-control-custom readonly-field" value="{{ $karyawan->kategori }}" readonly>
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="unit_kerja" class="form-label-custom">Unit Kerja</label>
                            <input type="text" class="form-control form-control-custom readonly-field" value="{{ $karyawan->unit_kerja }}" readonly>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="jabatan" class="form-label-custom">Jabatan</label>
                            <input type="text" class="form-control form-control-custom readonly-field" value="{{ $karyawan->jabatan }}" readonly>
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="akhir_kontrak" class="form-label-custom">Akhir Kontrak</label>
                            <input type="date" 
                                class="form-control form-control-custom @error('akhir_kontrak') is-invalid @enderror" 
                                id="akhir_kontrak" 
                                name="akhir_kontrak"
                                value="{{ old('akhir_kontrak', $karyawan->akhir_kontrak?->format('Y-m-d')) }}">
                            @error('akhir_kontrak')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>
                </div>

                <hr>

                <h6 class="text-danger font-weight-bold mb-3">Data Terminate (Edit)</h6>
                
                <div class="row">
    <div class="col-md-6">
        <div class="form-group">
            <label for="tanggal_keluar" class="form-label-custom">Tanggal Keluar <span class="text-danger">*</span></label>
            <input type="date" 
                   class="form-control form-control-custom @error('tanggal_keluar') is-invalid @enderror" 
                   id="tanggal_keluar" 
                   name="tanggal_keluar" 
                   value="{{ old('tanggal_keluar', $karyawan->tanggal_keluar ? $karyawan->tanggal_keluar->format('Y-m-d') : '') }}" 
                   required>
            @error('tanggal_keluar')
                <div class="invalid-feedback">{{ $message }}</div>
            @enderror
        </div>
    </div>
</div>

<div class="row">
    <div class="col-md-12">
        <div class="form-group">
            <label for="alasan_keluar" class="form-label-custom">Alasan Keluar <span class="text-danger">*</span></label>
            <textarea class="form-control form-control-custom @error('alasan_keluar') is-invalid @enderror" 
                      id="alasan_keluar" 
                      name="alasan_keluar" 
                      rows="4"
                      placeholder="Masukkan alasan keluar..."
                      required>{{ old('alasan_keluar', $karyawan->alasan_keluar) }}</textarea>
            @error('alasan_keluar')
                <div class="invalid-feedback">{{ $message }}</div>
            @enderror
        </div>
    </div>
</div>
<hr>

    <div class="form-group">
            <button type="submit" class="btn btn-warning">
                <i class="fas fa-save mr-2"></i>Update Data Terminate
            </button>
            <a href="{{ route('terminate') }}" class="btn btn-secondary">
                <i class="fas fa-arrow-left mr-2"></i>Batal
            </a>
    </div>

            </form>
        </div>
    </div>
</div>

@endsection