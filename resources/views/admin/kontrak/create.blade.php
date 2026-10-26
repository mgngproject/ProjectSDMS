@extends('layouts.app')

@section('content')

<link href="{{ asset('landing/landing/assets/css/editkontrak.css') }}" rel="stylesheet">

<div class="container-fluid">
    <div class="row">
        <div class="col-xl-12 col-lg-12">
            <div class="form-card">
                <div class="form-header">
                    <h4><i class="fas fa-plus-circle"></i> Form Kontrak Baru</h4>
                </div>

                <div class="form-body">
                    <div class="karyawan-info">
                        <i class="fas fa-user"></i> {{ $karyawan->nama }}
                    </div>

                    <form action="{{ route('kontrak.store') }}" method="POST">
                        @csrf
                        <input type="hidden" name="karyawan_id" value="{{ $karyawan->id }}">
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="kontrak_ke">Kontrak Ke <span class="text-danger">*</span></label>
                                    <input type="text" 
                                           class="form-control @error('kontrak_ke') is-invalid @enderror" 
                                           id="kontrak_ke" 
                                           name="kontrak_ke" 
                                           value="{{ old('kontrak_ke') }}" 
                                           placeholder="Contoh: Kontrak 2"
                                           required>
                                    @error('kontrak_ke')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>

                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="np">Nomor Pegawai (NP) <span class="text-danger">*</span></label>
                                    <input type="text" 
                                           class="form-control @error('np') is-invalid @enderror" 
                                           id="np" 
                                           name="np" 
                                           value="{{ old('np', $karyawan->np) }}" 
                                           placeholder="Masukkan NP"
                                           required>
                                    <small class="form-text">
                                        NP terakhir: <strong>{{ $karyawan->np }}</strong>
                                    </small>
                                    @error('np')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="awal_kontrak">Awal Kontrak <span class="text-danger">*</span></label>
                                    <input type="date" 
                                           class="form-control @error('awal_kontrak') is-invalid @enderror" 
                                           id="awal_kontrak" 
                                           name="awal_kontrak" 
                                           value="{{ old('awal_kontrak') }}"
                                           required>
                                    @error('awal_kontrak')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>

                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="akhir_kontrak">Akhir Kontrak <span class="text-danger">*</span></label>
                                    <input type="date" 
                                           class="form-control @error('akhir_kontrak') is-invalid @enderror" 
                                           id="akhir_kontrak" 
                                           name="akhir_kontrak" 
                                           value="{{ old('akhir_kontrak') }}"
                                           required>
                                    @error('akhir_kontrak')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="status">Status Kontrak <span class="text-danger">*</span></label>
                            <select class="form-control @error('status') is-invalid @enderror" 
                                    id="status" 
                                    name="status"
                                    required>
                                <option value="">-- Pilih Status --</option>
                                <option value="aktif" {{ old('status') == 'aktif' ? 'selected' : '' }}>Aktif</option>
                                <option value="selesai" {{ old('status') == 'selesai' ? 'selected' : '' }}>Selesai</option>
                            </select>
                            @error('status')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="form-group">
                            <label for="penilaian">Penilaian</label>
                            <textarea class="form-control @error('penilaian') is-invalid @enderror" 
                                      id="penilaian" 
                                      name="penilaian" 
                                      placeholder="Masukkan catatan penilaian kontrak (opsional)">{{ old('penilaian') }}</textarea>
                            @error('penilaian')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                            <small class="form-text">Contoh: Performa baik, target tercapai 95%</small>
                        </div>

                        <div class="form-group">
                            <label for="folder_link">Link Folder Google Drive</label>
                            <input type="url" 
                                   class="form-control @error('folder_link') is-invalid @enderror" 
                                   id="folder_link" 
                                   name="folder_link" 
                                   value="{{ old('folder_link') }}" 
                                   placeholder="https://drive.google.com/drive/folders/...">
                            @error('folder_link')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                            <small class="form-text">Paste link folder Google Drive yang berisi dokumen kontrak</small>
                        </div>

                        <div class="form-divider"></div>

                        <div class="d-flex justify-content-end">
                            <a href="{{ route('karyawan.kontrak', $karyawan->id) }}" class="btn-cancel mr-2">
                                <i class="fas fa-times"></i> Batal
                            </a>
                            <button type="submit" class="btn-submit">
                                <i class="fas fa-save"></i> Simpan Kontrak
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection