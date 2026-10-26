@extends('layouts/app')

@section('content')

<link href="{{ asset('landing/landing/assets/css/karyawan.css') }}" rel="stylesheet">

<div class="container-fluid">
    <div class="card shadow">
        <div class="card-header">
            <h6 class="m-0 font-weight-bold text-warning">Form Edit Karyawan</h6>
        </div>
        <div class="card-body">
            
            <form action="{{ route('karyawan.update', $karyawan->id) }}" method="POST" enctype="multipart/form-data">
                @csrf
                @method('PUT')
                
                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="np">NP <span class="text-danger">*</span></label>
                            <input type="text" class="form-control @error('np') is-invalid @enderror" 
                                   id="np" name="np" value="{{ old('np', $karyawan->np) }}" 
                                   placeholder="Masukkan NP" required>
                            @error('np')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="nama">Nama <span class="text-danger">*</span></label>
                            <input type="text" class="form-control @error('nama') is-invalid @enderror" 
                                   id="nama" name="nama" value="{{ old('nama', $karyawan->nama) }}" 
                                   placeholder="Masukkan Nama" required>
                            @error('nama')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                    </div>
                </div>

                <div class="form-group">
                    <label for="kategori">Kategori</label>
                    <input type="text" class="form-control" id="kategori" 
                           value="{{ $kategori_admin ?? 'Tidak ada kategori' }}" 
                           readonly style="background-color:#e9ecef;cursor:not-allowed;">
                    <input type="hidden" name="kategori" value="{{ $kategori_admin }}">
                </div>

                <div class="form-group">
                    <label for="awal_masuk">Awal Masuk</label>
                    <input type="date" 
                           name="awal_masuk" 
                           id="awal_masuk" 
                           class="form-control bg-light"
                           value="{{ old('awal_masuk', $karyawan->awal_masuk) }}"
                           readonly
                           style="background-color:#e9ecef;cursor:not-allowed;">
                    <small class="form-text text-muted">
                        Mengikuti kontrak pertama kali. Ubah di halaman Riwayat Kontrak.
                    </small>
                </div>

                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label>Masa Kerja Total</label>
                            <input type="text" 
                                   class="form-control bg-light" 
                                   value="{{ $karyawan->masa_kerja_format }}" 
                                   readonly>
                            <small class="form-text text-muted">Dihitung otomatis dari Awal Masuk</small>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-group">
                            <label>Masa Kontrak Aktif</label>
                            <input type="text" 
                                   class="form-control bg-light" 
                                   value="{{ $karyawan->masa_kontrak_format }}" 
                                   readonly>
                            <small class="form-text text-muted">Dihitung otomatis dari kontrak aktif</small>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="kode_bagan">Kode Bagan</label>
                            <input type="text" class="form-control @error('kode_bagan') is-invalid @enderror" 
                                   id="kode_bagan" name="kode_bagan" value="{{ old('kode_bagan', $karyawan->kode_bagan) }}" 
                                   placeholder="Masukkan Kode Bagan">
                            @error('kode_bagan')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="unit_kerja">Unit Kerja</label>
                            <input type="text" class="form-control @error('unit_kerja') is-invalid @enderror" 
                                   id="unit_kerja" name="unit_kerja" value="{{ old('unit_kerja', $karyawan->unit_kerja) }}" 
                                   placeholder="Masukkan Unit Kerja">
                            @error('unit_kerja')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="jabatan">Jabatan</label>
                            <input type="text" class="form-control @error('jabatan') is-invalid @enderror" 
                                   id="jabatan" name="jabatan" value="{{ old('jabatan', $karyawan->jabatan) }}" 
                                   placeholder="Masukkan Jabatan">
                            @error('jabatan')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="level">Level</label>
                            <input type="text" class="form-control @error('level') is-invalid @enderror" 
                                   id="level" name="level" value="{{ old('level', $karyawan->level) }}" 
                                   placeholder="Masukkan Level">
                            @error('level')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="role">Role</label>
                            <input type="text" class="form-control @error('role') is-invalid @enderror" 
                                   id="role" name="role" value="{{ old('role', $karyawan->role) }}" 
                                   placeholder="Masukkan Role">
                            @error('role')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="kpi">KPI (Link Drive)</label>
                            <input type="text" class="form-control @error('kpi') is-invalid @enderror" 
                                id="kpi" name="kpi" value="{{ old('kpi', $karyawan->kpi) }}" 
                                placeholder="Masukkan Link Drive KPI">
                            @error('kpi')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="benefit_kesehatan">Benefit Kesehatan</label>
                            <input type="text" class="form-control @error('benefit_kesehatan') is-invalid @enderror" 
                                   id="benefit_kesehatan" name="benefit_kesehatan" value="{{ old('benefit_kesehatan', $karyawan->benefit_kesehatan) }}" 
                                   placeholder="Masukkan Benefit Kesehatan">
                            @error('benefit_kesehatan')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="faskes">Fasilitas Kesehatan</label>
                            <input type="text" class="form-control @error('faskes') is-invalid @enderror" 
                                   id="faskes" name="faskes" value="{{ old('faskes', $karyawan->faskes) }}" 
                                   placeholder="Masukkan Fasilitas Kesehatan">
                            @error('faskes')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="gross_per_month">Gross Per Month</label>
                            <input type="text" class="form-control rupiah-input @error('gross_per_month') is-invalid @enderror" 
                                   id="gross_per_month_display" 
                                   value="{{ old('gross_per_month', $karyawan->gross_per_month ? number_format($karyawan->gross_per_month, 0, ',', '.') : '') }}" 
                                   placeholder="Rp 0">
                            <input type="hidden" name="gross_per_month" id="gross_per_month" value="{{ old('gross_per_month', $karyawan->gross_per_month) }}">
                            @error('gross_per_month')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="foto">Foto Karyawan</label>
                            @if($karyawan->foto)
                                <div class="mb-2">
                                    <img src="{{ url('foto_karyawan/'.$karyawan->foto) }}" alt="Foto Lama" class="img-thumbnail" style="max-width: 150px;">
                                    <p class="text-muted small mb-0">Foto saat ini</p>
                                </div>
                            @endif
                            <div class="custom-file">
                                <input type="file" class="custom-file-input @error('foto') is-invalid @enderror" 
                                       id="foto" name="foto" accept="image/jpeg,image/png,image/jpg" 
                                       onchange="previewImage(event)">
                                <label class="custom-file-label" for="foto">{{ $karyawan->foto ? 'Ganti foto...' : 'Pilih file...' }}</label>
                                @error('foto')<div class="invalid-feedback">{{ $message }}</div>@enderror
                            </div>
                            <small class="text-muted d-block mt-1">Format: JPG, JPEG, PNG. Max: 2MB</small>
                            
                            <div id="imagePreview" class="mt-3" style="display: none;">
                                <img id="previewImg" src="" alt="Preview" class="img-thumbnail" 
                                     style="max-width: 200px; max-height: 200px; object-fit: cover;">
                                <button type="button" class="btn btn-sm btn-danger mt-2" onclick="removeImage()">
                                    <i class="fas fa-trash"></i> Hapus
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <hr>

                <div class="form-group mb-0">
                    <button type="submit" class="btn btn-warning">
                        <i class="fas fa-save mr-2"></i>Update Data
                    </button>
                    <a href="{{ route('karyawan') }}" class="btn btn-secondary">
                        <i class="fas fa-arrow-left mr-2"></i>Batal
                    </a>
                </div>

            </form>

        </div>
    </div>
</div>

@push('scripts')
<script>
$('#gross_per_month_display').on('input', function() {
    let value = $(this).val().replace(/\D/g, '');
    $(this).val(value.replace(/\B(?=(\d{3})+(?!\d))/g, '.'));
    $('#gross_per_month').val(value);
}).on('keypress', function(e) { 
    if (e.which < 48 || e.which > 57) e.preventDefault();
});

function previewImage(event) {
    const file = event.target.files[0];
    const label = event.target.nextElementSibling;
    
    if (!file) return;
    
    label.textContent = file.name;
    
    if (file.size > 2 * 1024 * 1024) {
        Swal.fire({
            icon: 'error',
            title: 'File Terlalu Besar',
            text: 'Ukuran file maksimal 2MB',
            customClass: {
                title: 'swal-title-kecil',
                htmlContainer: 'swal-text-kecil',
                confirmButton: 'swal-confirm-kecil'
            }
        });
        event.target.value = '';
        label.textContent = '{{ $karyawan->foto ? "Ganti foto..." : "Pilih file..." }}';
        return;
    }
    
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        Swal.fire({
            icon: 'error',
            title: 'Format File Salah',
            text: 'Hanya JPG, JPEG, PNG yang diperbolehkan',
            customClass: {
                title: 'swal-title-kecil',
                htmlContainer: 'swal-text-kecil',
                confirmButton: 'swal-confirm-kecil'
            }
        });
        event.target.value = '';
        label.textContent = '{{ $karyawan->foto ? "Ganti foto..." : "Pilih file..." }}';
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        $('#previewImg').attr('src', e.target.result);
        $('#imagePreview').show();
    };
    reader.readAsDataURL(file);
}

function removeImage() {
    $('#foto').val('');
    $('.custom-file-label').text('{{ $karyawan->foto ? "Ganti foto..." : "Pilih file..." }}');
    $('#imagePreview').hide();
}
</script>
@endpush

@endsection