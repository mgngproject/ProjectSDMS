@extends('layouts.app')

@section('content')

<link href="{{ asset('landing/landing/assets/css/terminateform.css') }}" rel="stylesheet">

<div class="container-fluid">
    <div class="card shadow">
        <div class="card-header">
            <h6 class="m-0 font-weight-bold text-primary">Form Tambah Terminate</h6>
        </div>
        <div class="card-body">

                <div class="form-body">
                    <form action="{{ route('terminate.store') }}" method="POST">
                        @csrf

                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="np">NP<span class="text-danger">*</span></label>
                                    <input type="text"
                                           class="form-control @error('np') is-invalid @enderror"
                                           id="np"
                                           name="np"
                                           value="{{ old('np') }}"
                                           placeholder="Contoh: AB000001"
                                           required>
                                    @error('np')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>

                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="nama">Nama <span class="text-danger">*</span></label>
                                    <input type="text"
                                           class="form-control @error('nama') is-invalid @enderror"
                                           id="nama"
                                           name="nama"
                                           value="{{ old('nama') }}"
                                           placeholder="Masukkan nama lengkap"
                                           required>
                                    @error('nama')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="kode_bagan">Kode Bagan</label>
                                    <input type="text"
                                           class="form-control @error('kode_bagan') is-invalid @enderror"
                                           id="kode_bagan"
                                           name="kode_bagan"
                                           value="{{ old('kode_bagan') }}"
                                           placeholder="Masukkan kode bagan">
                                    @error('kode_bagan')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>

                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="unit_kerja">Unit Kerja</label>
                                    <input type="text"
                                           class="form-control @error('unit_kerja') is-invalid @enderror"
                                           id="unit_kerja"
                                           name="unit_kerja"
                                           value="{{ old('unit_kerja') }}"
                                           placeholder="Masukkan unit kerja">
                                    @error('unit_kerja')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="jabatan">Jabatan</label>
                                    <input type="text"
                                           class="form-control @error('jabatan') is-invalid @enderror"
                                           id="jabatan"
                                           name="jabatan"
                                           value="{{ old('jabatan') }}"
                                           placeholder="Masukkan jabatan">
                                    @error('jabatan')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>

                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="level">Level</label>
                                    <input type="text"
                                           class="form-control @error('level') is-invalid @enderror"
                                           id="level"
                                           name="level"
                                           value="{{ old('level') }}"
                                           placeholder="Masukkan level">
                                    @error('level')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="role">Role</label>
                                    <input type="text"
                                           class="form-control @error('role') is-invalid @enderror"
                                           id="role"
                                           name="role"
                                           value="{{ old('role') }}"
                                           placeholder="Masukkan role">
                                    @error('role')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="form-divider"></div>

                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="awal_kontrak">Awal Kontrak</label>
                                    <input type="date"
                                           class="form-control @error('awal_kontrak') is-invalid @enderror"
                                           id="awal_kontrak"
                                           name="awal_kontrak"
                                           value="{{ old('awal_kontrak') }}">
                                    @error('awal_kontrak')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>

                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="akhir_kontrak">Akhir Kontrak</label>
                                    <input type="date"
                                           class="form-control @error('akhir_kontrak') is-invalid @enderror"
                                           id="akhir_kontrak"
                                           name="akhir_kontrak"
                                           value="{{ old('akhir_kontrak') }}">
                                    @error('akhir_kontrak')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="form-divider"></div>

                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="tanggal_keluar">Tanggal Keluar <span class="text-danger">*</span></label>
                                    <input type="date"
                                           class="form-control @error('tanggal_keluar') is-invalid @enderror"
                                           id="tanggal_keluar"
                                           name="tanggal_keluar"
                                           value="{{ old('tanggal_keluar') }}"
                                           required>
                                    @error('tanggal_keluar')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>

                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="alasan_keluar">Alasan Keluar <span class="text-danger">*</span></label>
                                    <input type="text"
                                           class="form-control @error('alasan_keluar') is-invalid @enderror"
                                           id="alasan_keluar"
                                           name="alasan_keluar"
                                           value="{{ old('alasan_keluar') }}"
                                           placeholder="Contoh: Resign, Kontrak Habis, dll"
                                           required>
                                    @error('alasan_keluar')
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
                            <a href="{{ route('karyawan') }}" class="btn btn-secondary">
                                <i class="fas fa-arrow-left mr-2"></i>Batal
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>

@endsection