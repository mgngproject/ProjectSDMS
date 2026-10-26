@extends('layouts/app')

@section('content')

<link href="{{ asset('landing/landing/assets/css/karyawan.css') }}" rel="stylesheet">

<div class="container-fluid">
    <div class="card shadow">
        <div class="card-header">
            <h6 class="m-0 font-weight-bold text-primary">Form Tambah Data Diri Karyawan</h6>
        </div>
        <div class="card-body">
            
            <form method="POST" action="{{ route('datadiri.store') }}" enctype="multipart/form-data">
                @csrf
                
                <div class="row">
                    <div class="col-md-12">
                        <div class="form-group">
                            <label for="karyawan_id">
                                Pilih Karyawan <span class="text-danger">*</span>
                            </label>
                            <select name="karyawan_id"
                                    id="karyawan_id"
                                    class="form-control @error('karyawan_id') is-invalid @enderror">
                                <option value="">-- Pilih Karyawan --</option>
                                @foreach ($karyawans as $karyawan)
                                    <option value="{{ $karyawan->id }}"
                                        {{ old('karyawan_id') == $karyawan->id ? 'selected' : '' }}>
                                        {{ $karyawan->np }} - {{ $karyawan->nama }}
                                    </option>
                                @endforeach
                            </select>
                            @error('karyawan_id')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="ktp">No KTP</label>
                            <input type="number" 
                                   class="form-control @error('ktp') is-invalid @enderror" 
                                   id="ktp" 
                                   name="ktp" 
                                   value="{{ old('ktp') }}" 
                                   placeholder="Masukkan No KTP">
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="tempat_lahir">Tempat Lahir</label>
                            <input type="text"
                                class="form-control @error('tempat_lahir') is-invalid @enderror"
                                id="tempat_lahir"
                                name="tempat_lahir"
                                value="{{ old('tempat_lahir') }}"
                                placeholder="Contoh: Jakarta">
                            @error('tempat_lahir')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="tanggal_lahir">Tanggal Lahir</label>
                            <input type="date" 
                                   class="form-control @error('tanggal_lahir') is-invalid @enderror" 
                                   id="tanggal_lahir" 
                                   name="tanggal_lahir" 
                                   value="{{ old('tanggal_lahir') }}">
                            @error('tanggal_lahir')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="alamat">Alamat</label>
                            <input type="text" 
                                   class="form-control @error('alamat') is-invalid @enderror" 
                                   id="alamat" 
                                   name="alamat" 
                                   value="{{ old('alamat') }}"
                                   placeholder="Masukkan Alamat">
                        </div>
                    </div>
                </div>

                <h7 class="text-primary mt-2 mb-3">
                    <i class="fas fa-graduation-cap mr-2"></i>Pendidikan Pertama
                </h7>

                <div class="row">
                    <div class="col-md-4">
                        <div class="form-group">
                            <label for="jenjang_1">Jenjang</label>
                            <select name="jenjang_1" 
                                    id="jenjang_1"
                                    class="form-control @error('jenjang_1') is-invalid @enderror">
                                <option value="">-- Pilih Jenjang --</option>
                                @foreach (['SMA/SMK', 'D3', 'D4', 'S1', 'S2'] as $jenjang)
                                    <option value="{{ $jenjang }}" {{ old('jenjang_1') == $jenjang ? 'selected' : '' }}>
                                        {{ $jenjang }}
                                    </option>
                                @endforeach
                            </select>
                            @error('jenjang_1')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>

                    <div class="col-md-4">
                        <div class="form-group">
                            <label for="jurusan_1">Jurusan</label>
                            <input type="text" 
                                   class="form-control @error('jurusan_1') is-invalid @enderror" 
                                   id="jurusan_1" 
                                   name="jurusan_1" 
                                   value="{{ old('jurusan_1') }}" 
                                   placeholder="Masukkan Jurusan">
                            @error('jurusan_1')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>

                    <div class="col-md-4">
                        <div class="form-group">
                            <label for="kampus_1">Nama Perguruan Tinggi / Sekolah</label>
                            <input type="text" 
                                   class="form-control @error('kampus_1') is-invalid @enderror" 
                                   id="kampus_1" 
                                   name="kampus_1" 
                                   value="{{ old('kampus_1') }}" 
                                   placeholder="Masukkan Nama Institusi">
                            @error('kampus_1')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>
                </div>

                <h7 class="text-primary mt-2 mb-3">
                    <i class="fas fa-graduation-cap mr-2"></i>Pendidikan Kedua (Opsional)
                </h7>

                <div class="row">
                    <div class="col-md-4">
                        <div class="form-group">
                            <label for="jenjang_2">Jenjang</label>
                            <select name="jenjang_2" 
                                    id="jenjang_2"
                                    class="form-control @error('jenjang_2') is-invalid @enderror">
                                <option value="">-- Pilih Jenjang --</option>
                                @foreach (['SMA/SMK', 'D3', 'D4', 'S1', 'S2'] as $jenjang)
                                    <option value="{{ $jenjang }}" {{ old('jenjang_2') == $jenjang ? 'selected' : '' }}>
                                        {{ $jenjang }}
                                    </option>
                                @endforeach
                            </select>
                            @error('jenjang_2')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>

                    <div class="col-md-4">
                        <div class="form-group">
                            <label for="jurusan_2">Jurusan</label>
                            <input type="text" 
                                   class="form-control @error('jurusan_2') is-invalid @enderror" 
                                   id="jurusan_2" 
                                   name="jurusan_2" 
                                   value="{{ old('jurusan_2') }}" 
                                   placeholder="Masukkan Jurusan">
                            @error('jurusan_2')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>

                    <div class="col-md-4">
                        <div class="form-group">
                            <label for="kampus_2">Nama Perguruan Tinggi / Sekolah</label>
                            <input type="text" 
                                   class="form-control @error('kampus_2') is-invalid @enderror" 
                                   id="kampus_2" 
                                   name="kampus_2" 
                                   value="{{ old('kampus_2') }}" 
                                   placeholder="Masukkan Nama Institusi">
                            @error('kampus_2')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>
                </div>
            
                <hr>
                <div class="form-group mb-0">
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save mr-2"></i>Simpan Data
                    </button>
                    <a href="{{ route('datadiri') }}" class="btn btn-secondary">
                        <i class="fas fa-arrow-left mr-2"></i>Batal
                    </a>
                </div>
            </form>

        </div>
    </div>
</div>
@endsection