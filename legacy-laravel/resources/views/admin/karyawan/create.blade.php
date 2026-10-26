@extends('layouts/app')

@section('content')

<link href="{{ asset('landing/landing/assets/css/karyawan.css') }}" rel="stylesheet">

<div class="container-fluid">
    <div class="card shadow">
        <div class="card-header">
            <h6 class="m-0 font-weight-bold text-primary">Form Tambah Karyawan</h6>
        </div>
        <div class="card-body">
            
            <form method="POST" action="{{ route('karyawan.store') }}" enctype="multipart/form-data">
                @csrf
                
                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="np">NP <span class="text-danger">*</span></label>
                            <input type="text" class="form-control @error('np') is-invalid @enderror" 
                                   id="np" name="np" value="{{ old('np') }}" 
                                   placeholder="Masukkan NP" required>
                            @error('np')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="nama">Nama <span class="text-danger">*</span></label>
                            <input type="text" class="form-control @error('nama') is-invalid @enderror" 
                                   id="nama" name="nama" value="{{ old('nama') }}" 
                                   placeholder="Masukkan Nama" required>
                            @error('nama')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                    </div>
                </div>

                <div class="form-group">
                    <label for="kategori">Kategori</label>
                    @if(auth()->user()->isSuperAdmin())
                        <select name="kategori" class="form-control" required>
                            <option value="">-- Pilih Kategori --</option>
                            <option value="IDE">IDE</option>
                            <option value="IDH">IDH</option>
                            <option value="BGN">BGN</option>
                            <option value="TPBW/TPP">TPBW/TPP</option>
                        </select>
                    @else
                        <input type="text" class="form-control" id="kategori" 
                            value="{{ $kategori_admin ?? 'Tidak ada kategori' }}" 
                            readonly style="background-color:#e9ecef;cursor:not-allowed;">
                        <input type="hidden" name="kategori" value="{{ $kategori_admin }}">
                    @endif
                </div>

                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="awal_kontrak">Awal Kontrak <span class="text-danger">*</span></label>
                            <input type="date" 
                                   name="awal_kontrak" 
                                   id="awal_kontrak" 
                                   class="form-control @error('awal_kontrak') is-invalid @enderror"
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
                                   name="akhir_kontrak" 
                                   id="akhir_kontrak" 
                                   class="form-control @error('akhir_kontrak') is-invalid @enderror"
                                   value="{{ old('akhir_kontrak') }}" 
                                   required>
                            @error('akhir_kontrak')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="kode_bagan">Kode Bagan</label>
                            <input type="text" class="form-control @error('kode_bagan') is-invalid @enderror" 
                                   id="kode_bagan" name="kode_bagan" value="{{ old('kode_bagan') }}" 
                                   placeholder="Masukkan Kode Bagan">
                            @error('kode_bagan')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="unit_kerja">Unit Kerja</label>
                            <input type="text" class="form-control @error('unit_kerja') is-invalid @enderror" 
                                   id="unit_kerja" name="unit_kerja" value="{{ old('unit_kerja') }}" 
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
                                   id="jabatan" name="jabatan" value="{{ old('jabatan') }}" 
                                   placeholder="Masukkan Jabatan">
                            @error('jabatan')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="level">Level</label>
                            <input type="text" class="form-control @error('level') is-invalid @enderror" 
                                   id="level" name="level" value="{{ old('level') }}" 
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
                                   id="role" name="role" value="{{ old('role') }}" 
                                   placeholder="Masukkan Role">
                            @error('role')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="kpi">KPI (Link Drive)</label>
                            <input type="text" class="form-control @error('kpi') is-invalid @enderror" 
                                id="kpi" name="kpi" value="{{ old('kpi') }}" 
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
                                   id="benefit_kesehatan" name="benefit_kesehatan" value="{{ old('benefit_kesehatan') }}" 
                                   placeholder="Masukkan Benefit Kesehatan">
                            @error('benefit_kesehatan')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="faskes">Fasilitas Kesehatan</label>
                            <input type="text" class="form-control @error('faskes') is-invalid @enderror" 
                                   id="faskes" name="faskes" value="{{ old('faskes') }}" 
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
                                   id="gross_per_month_display" placeholder="Rp 0">
                            <input type="hidden" name="gross_per_month" id="gross_per_month">
                            @error('gross_per_month')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="foto">Foto Karyawan</label>
                            <div class="custom-file">
                                <input type="file" class="custom-file-input @error('foto') is-invalid @enderror" 
                                       id="foto" name="foto" accept="image/jpeg,image/png,image/jpg" 
                                       onchange="previewImage(event)">
                                <label class="custom-file-label" for="foto">Pilih file...</label>
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
        label.textContent = 'Pilih file...';
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
        label.textContent = 'Pilih file...';
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
    $('.custom-file-label').text('Pilih file...');
    $('#imagePreview').hide();
}
</script>
@endpush

@endsection