

<?php $__env->startSection('content'); ?>

<link href="<?php echo e(asset('landing/landing/assets/css/karyawan.css')); ?>" rel="stylesheet">

<div class="container-fluid">
    <div class="card shadow">
        <div class="card-header">
            <h6 class="m-0 font-weight-bold text-warning">Form Edit Karyawan</h6>
        </div>
        <div class="card-body">
            
            <form action="<?php echo e(route('karyawan.update', $karyawan->id)); ?>" method="POST" enctype="multipart/form-data">
                <?php echo csrf_field(); ?>
                <?php echo method_field('PUT'); ?>
                
                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="np">NP <span class="text-danger">*</span></label>
                            <input type="text" class="form-control <?php $__errorArgs = ['np'];
$__bag = $errors->getBag($__errorArgs[1] ?? 'default');
if ($__bag->has($__errorArgs[0])) :
if (isset($message)) { $__messageOriginal = $message; }
$message = $__bag->first($__errorArgs[0]); ?> is-invalid <?php unset($message);
if (isset($__messageOriginal)) { $message = $__messageOriginal; }
endif;
unset($__errorArgs, $__bag); ?>" 
                                   id="np" name="np" value="<?php echo e(old('np', $karyawan->np)); ?>" 
                                   placeholder="Masukkan NP" required>
                            <?php $__errorArgs = ['np'];
$__bag = $errors->getBag($__errorArgs[1] ?? 'default');
if ($__bag->has($__errorArgs[0])) :
if (isset($message)) { $__messageOriginal = $message; }
$message = $__bag->first($__errorArgs[0]); ?><div class="invalid-feedback"><?php echo e($message); ?></div><?php unset($message);
if (isset($__messageOriginal)) { $message = $__messageOriginal; }
endif;
unset($__errorArgs, $__bag); ?>
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="nama">Nama <span class="text-danger">*</span></label>
                            <input type="text" class="form-control <?php $__errorArgs = ['nama'];
$__bag = $errors->getBag($__errorArgs[1] ?? 'default');
if ($__bag->has($__errorArgs[0])) :
if (isset($message)) { $__messageOriginal = $message; }
$message = $__bag->first($__errorArgs[0]); ?> is-invalid <?php unset($message);
if (isset($__messageOriginal)) { $message = $__messageOriginal; }
endif;
unset($__errorArgs, $__bag); ?>" 
                                   id="nama" name="nama" value="<?php echo e(old('nama', $karyawan->nama)); ?>" 
                                   placeholder="Masukkan Nama" required>
                            <?php $__errorArgs = ['nama'];
$__bag = $errors->getBag($__errorArgs[1] ?? 'default');
if ($__bag->has($__errorArgs[0])) :
if (isset($message)) { $__messageOriginal = $message; }
$message = $__bag->first($__errorArgs[0]); ?><div class="invalid-feedback"><?php echo e($message); ?></div><?php unset($message);
if (isset($__messageOriginal)) { $message = $__messageOriginal; }
endif;
unset($__errorArgs, $__bag); ?>
                        </div>
                    </div>
                </div>

                <div class="form-group">
                    <label for="kategori">Kategori</label>
                    <input type="text" class="form-control" id="kategori" 
                           value="<?php echo e($kategori_admin ?? 'Tidak ada kategori'); ?>" 
                           readonly style="background-color:#e9ecef;cursor:not-allowed;">
                    <input type="hidden" name="kategori" value="<?php echo e($kategori_admin); ?>">
                </div>

                <div class="form-group">
                    <label for="awal_masuk">Awal Masuk</label>
                    <input type="date" 
                           name="awal_masuk" 
                           id="awal_masuk" 
                           class="form-control bg-light"
                           value="<?php echo e(old('awal_masuk', $karyawan->awal_masuk)); ?>"
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
                                   value="<?php echo e($karyawan->masa_kerja_format); ?>" 
                                   readonly>
                            <small class="form-text text-muted">Dihitung otomatis dari Awal Masuk</small>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-group">
                            <label>Masa Kontrak Aktif</label>
                            <input type="text" 
                                   class="form-control bg-light" 
                                   value="<?php echo e($karyawan->masa_kontrak_format); ?>" 
                                   readonly>
                            <small class="form-text text-muted">Dihitung otomatis dari kontrak aktif</small>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="kode_bagan">Kode Bagan</label>
                            <input type="text" class="form-control <?php $__errorArgs = ['kode_bagan'];
$__bag = $errors->getBag($__errorArgs[1] ?? 'default');
if ($__bag->has($__errorArgs[0])) :
if (isset($message)) { $__messageOriginal = $message; }
$message = $__bag->first($__errorArgs[0]); ?> is-invalid <?php unset($message);
if (isset($__messageOriginal)) { $message = $__messageOriginal; }
endif;
unset($__errorArgs, $__bag); ?>" 
                                   id="kode_bagan" name="kode_bagan" value="<?php echo e(old('kode_bagan', $karyawan->kode_bagan)); ?>" 
                                   placeholder="Masukkan Kode Bagan">
                            <?php $__errorArgs = ['kode_bagan'];
$__bag = $errors->getBag($__errorArgs[1] ?? 'default');
if ($__bag->has($__errorArgs[0])) :
if (isset($message)) { $__messageOriginal = $message; }
$message = $__bag->first($__errorArgs[0]); ?><div class="invalid-feedback"><?php echo e($message); ?></div><?php unset($message);
if (isset($__messageOriginal)) { $message = $__messageOriginal; }
endif;
unset($__errorArgs, $__bag); ?>
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="unit_kerja">Unit Kerja</label>
                            <input type="text" class="form-control <?php $__errorArgs = ['unit_kerja'];
$__bag = $errors->getBag($__errorArgs[1] ?? 'default');
if ($__bag->has($__errorArgs[0])) :
if (isset($message)) { $__messageOriginal = $message; }
$message = $__bag->first($__errorArgs[0]); ?> is-invalid <?php unset($message);
if (isset($__messageOriginal)) { $message = $__messageOriginal; }
endif;
unset($__errorArgs, $__bag); ?>" 
                                   id="unit_kerja" name="unit_kerja" value="<?php echo e(old('unit_kerja', $karyawan->unit_kerja)); ?>" 
                                   placeholder="Masukkan Unit Kerja">
                            <?php $__errorArgs = ['unit_kerja'];
$__bag = $errors->getBag($__errorArgs[1] ?? 'default');
if ($__bag->has($__errorArgs[0])) :
if (isset($message)) { $__messageOriginal = $message; }
$message = $__bag->first($__errorArgs[0]); ?><div class="invalid-feedback"><?php echo e($message); ?></div><?php unset($message);
if (isset($__messageOriginal)) { $message = $__messageOriginal; }
endif;
unset($__errorArgs, $__bag); ?>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="jabatan">Jabatan</label>
                            <input type="text" class="form-control <?php $__errorArgs = ['jabatan'];
$__bag = $errors->getBag($__errorArgs[1] ?? 'default');
if ($__bag->has($__errorArgs[0])) :
if (isset($message)) { $__messageOriginal = $message; }
$message = $__bag->first($__errorArgs[0]); ?> is-invalid <?php unset($message);
if (isset($__messageOriginal)) { $message = $__messageOriginal; }
endif;
unset($__errorArgs, $__bag); ?>" 
                                   id="jabatan" name="jabatan" value="<?php echo e(old('jabatan', $karyawan->jabatan)); ?>" 
                                   placeholder="Masukkan Jabatan">
                            <?php $__errorArgs = ['jabatan'];
$__bag = $errors->getBag($__errorArgs[1] ?? 'default');
if ($__bag->has($__errorArgs[0])) :
if (isset($message)) { $__messageOriginal = $message; }
$message = $__bag->first($__errorArgs[0]); ?><div class="invalid-feedback"><?php echo e($message); ?></div><?php unset($message);
if (isset($__messageOriginal)) { $message = $__messageOriginal; }
endif;
unset($__errorArgs, $__bag); ?>
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="level">Level</label>
                            <input type="text" class="form-control <?php $__errorArgs = ['level'];
$__bag = $errors->getBag($__errorArgs[1] ?? 'default');
if ($__bag->has($__errorArgs[0])) :
if (isset($message)) { $__messageOriginal = $message; }
$message = $__bag->first($__errorArgs[0]); ?> is-invalid <?php unset($message);
if (isset($__messageOriginal)) { $message = $__messageOriginal; }
endif;
unset($__errorArgs, $__bag); ?>" 
                                   id="level" name="level" value="<?php echo e(old('level', $karyawan->level)); ?>" 
                                   placeholder="Masukkan Level">
                            <?php $__errorArgs = ['level'];
$__bag = $errors->getBag($__errorArgs[1] ?? 'default');
if ($__bag->has($__errorArgs[0])) :
if (isset($message)) { $__messageOriginal = $message; }
$message = $__bag->first($__errorArgs[0]); ?><div class="invalid-feedback"><?php echo e($message); ?></div><?php unset($message);
if (isset($__messageOriginal)) { $message = $__messageOriginal; }
endif;
unset($__errorArgs, $__bag); ?>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="role">Role</label>
                            <input type="text" class="form-control <?php $__errorArgs = ['role'];
$__bag = $errors->getBag($__errorArgs[1] ?? 'default');
if ($__bag->has($__errorArgs[0])) :
if (isset($message)) { $__messageOriginal = $message; }
$message = $__bag->first($__errorArgs[0]); ?> is-invalid <?php unset($message);
if (isset($__messageOriginal)) { $message = $__messageOriginal; }
endif;
unset($__errorArgs, $__bag); ?>" 
                                   id="role" name="role" value="<?php echo e(old('role', $karyawan->role)); ?>" 
                                   placeholder="Masukkan Role">
                            <?php $__errorArgs = ['role'];
$__bag = $errors->getBag($__errorArgs[1] ?? 'default');
if ($__bag->has($__errorArgs[0])) :
if (isset($message)) { $__messageOriginal = $message; }
$message = $__bag->first($__errorArgs[0]); ?><div class="invalid-feedback"><?php echo e($message); ?></div><?php unset($message);
if (isset($__messageOriginal)) { $message = $__messageOriginal; }
endif;
unset($__errorArgs, $__bag); ?>
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="kpi">KPI (Link Drive)</label>
                            <input type="text" class="form-control <?php $__errorArgs = ['kpi'];
$__bag = $errors->getBag($__errorArgs[1] ?? 'default');
if ($__bag->has($__errorArgs[0])) :
if (isset($message)) { $__messageOriginal = $message; }
$message = $__bag->first($__errorArgs[0]); ?> is-invalid <?php unset($message);
if (isset($__messageOriginal)) { $message = $__messageOriginal; }
endif;
unset($__errorArgs, $__bag); ?>" 
                                id="kpi" name="kpi" value="<?php echo e(old('kpi', $karyawan->kpi)); ?>" 
                                placeholder="Masukkan Link Drive KPI">
                            <?php $__errorArgs = ['kpi'];
$__bag = $errors->getBag($__errorArgs[1] ?? 'default');
if ($__bag->has($__errorArgs[0])) :
if (isset($message)) { $__messageOriginal = $message; }
$message = $__bag->first($__errorArgs[0]); ?><div class="invalid-feedback"><?php echo e($message); ?></div><?php unset($message);
if (isset($__messageOriginal)) { $message = $__messageOriginal; }
endif;
unset($__errorArgs, $__bag); ?>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="benefit_kesehatan">Benefit Kesehatan</label>
                            <input type="text" class="form-control <?php $__errorArgs = ['benefit_kesehatan'];
$__bag = $errors->getBag($__errorArgs[1] ?? 'default');
if ($__bag->has($__errorArgs[0])) :
if (isset($message)) { $__messageOriginal = $message; }
$message = $__bag->first($__errorArgs[0]); ?> is-invalid <?php unset($message);
if (isset($__messageOriginal)) { $message = $__messageOriginal; }
endif;
unset($__errorArgs, $__bag); ?>" 
                                   id="benefit_kesehatan" name="benefit_kesehatan" value="<?php echo e(old('benefit_kesehatan', $karyawan->benefit_kesehatan)); ?>" 
                                   placeholder="Masukkan Benefit Kesehatan">
                            <?php $__errorArgs = ['benefit_kesehatan'];
$__bag = $errors->getBag($__errorArgs[1] ?? 'default');
if ($__bag->has($__errorArgs[0])) :
if (isset($message)) { $__messageOriginal = $message; }
$message = $__bag->first($__errorArgs[0]); ?><div class="invalid-feedback"><?php echo e($message); ?></div><?php unset($message);
if (isset($__messageOriginal)) { $message = $__messageOriginal; }
endif;
unset($__errorArgs, $__bag); ?>
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="faskes">Fasilitas Kesehatan</label>
                            <input type="text" class="form-control <?php $__errorArgs = ['faskes'];
$__bag = $errors->getBag($__errorArgs[1] ?? 'default');
if ($__bag->has($__errorArgs[0])) :
if (isset($message)) { $__messageOriginal = $message; }
$message = $__bag->first($__errorArgs[0]); ?> is-invalid <?php unset($message);
if (isset($__messageOriginal)) { $message = $__messageOriginal; }
endif;
unset($__errorArgs, $__bag); ?>" 
                                   id="faskes" name="faskes" value="<?php echo e(old('faskes', $karyawan->faskes)); ?>" 
                                   placeholder="Masukkan Fasilitas Kesehatan">
                            <?php $__errorArgs = ['faskes'];
$__bag = $errors->getBag($__errorArgs[1] ?? 'default');
if ($__bag->has($__errorArgs[0])) :
if (isset($message)) { $__messageOriginal = $message; }
$message = $__bag->first($__errorArgs[0]); ?><div class="invalid-feedback"><?php echo e($message); ?></div><?php unset($message);
if (isset($__messageOriginal)) { $message = $__messageOriginal; }
endif;
unset($__errorArgs, $__bag); ?>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="gross_per_month">Gross Per Month</label>
                            <input type="text" class="form-control rupiah-input <?php $__errorArgs = ['gross_per_month'];
$__bag = $errors->getBag($__errorArgs[1] ?? 'default');
if ($__bag->has($__errorArgs[0])) :
if (isset($message)) { $__messageOriginal = $message; }
$message = $__bag->first($__errorArgs[0]); ?> is-invalid <?php unset($message);
if (isset($__messageOriginal)) { $message = $__messageOriginal; }
endif;
unset($__errorArgs, $__bag); ?>" 
                                   id="gross_per_month_display" 
                                   value="<?php echo e(old('gross_per_month', $karyawan->gross_per_month ? number_format($karyawan->gross_per_month, 0, ',', '.') : '')); ?>" 
                                   placeholder="Rp 0">
                            <input type="hidden" name="gross_per_month" id="gross_per_month" value="<?php echo e(old('gross_per_month', $karyawan->gross_per_month)); ?>">
                            <?php $__errorArgs = ['gross_per_month'];
$__bag = $errors->getBag($__errorArgs[1] ?? 'default');
if ($__bag->has($__errorArgs[0])) :
if (isset($message)) { $__messageOriginal = $message; }
$message = $__bag->first($__errorArgs[0]); ?><div class="invalid-feedback"><?php echo e($message); ?></div><?php unset($message);
if (isset($__messageOriginal)) { $message = $__messageOriginal; }
endif;
unset($__errorArgs, $__bag); ?>
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="foto">Foto Karyawan</label>
                            <?php if($karyawan->foto): ?>
                                <div class="mb-2">
                                    <img src="<?php echo e(url('foto_karyawan/'.$karyawan->foto)); ?>" alt="Foto Lama" class="img-thumbnail" style="max-width: 150px;">
                                    <p class="text-muted small mb-0">Foto saat ini</p>
                                </div>
                            <?php endif; ?>
                            <div class="custom-file">
                                <input type="file" class="custom-file-input <?php $__errorArgs = ['foto'];
$__bag = $errors->getBag($__errorArgs[1] ?? 'default');
if ($__bag->has($__errorArgs[0])) :
if (isset($message)) { $__messageOriginal = $message; }
$message = $__bag->first($__errorArgs[0]); ?> is-invalid <?php unset($message);
if (isset($__messageOriginal)) { $message = $__messageOriginal; }
endif;
unset($__errorArgs, $__bag); ?>" 
                                       id="foto" name="foto" accept="image/jpeg,image/png,image/jpg" 
                                       onchange="previewImage(event)">
                                <label class="custom-file-label" for="foto"><?php echo e($karyawan->foto ? 'Ganti foto...' : 'Pilih file...'); ?></label>
                                <?php $__errorArgs = ['foto'];
$__bag = $errors->getBag($__errorArgs[1] ?? 'default');
if ($__bag->has($__errorArgs[0])) :
if (isset($message)) { $__messageOriginal = $message; }
$message = $__bag->first($__errorArgs[0]); ?><div class="invalid-feedback"><?php echo e($message); ?></div><?php unset($message);
if (isset($__messageOriginal)) { $message = $__messageOriginal; }
endif;
unset($__errorArgs, $__bag); ?>
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
                    <a href="<?php echo e(route('karyawan')); ?>" class="btn btn-secondary">
                        <i class="fas fa-arrow-left mr-2"></i>Batal
                    </a>
                </div>

            </form>

        </div>
    </div>
</div>

<?php $__env->startPush('scripts'); ?>
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
        label.textContent = '<?php echo e($karyawan->foto ? "Ganti foto..." : "Pilih file..."); ?>';
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
        label.textContent = '<?php echo e($karyawan->foto ? "Ganti foto..." : "Pilih file..."); ?>';
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
    $('.custom-file-label').text('<?php echo e($karyawan->foto ? "Ganti foto..." : "Pilih file..."); ?>');
    $('#imagePreview').hide();
}
</script>
<?php $__env->stopPush(); ?>

<?php $__env->stopSection(); ?>
<?php echo $__env->make('layouts/app', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\laragon\www\sdmsproject\resources\views/admin/karyawan/edit.blade.php ENDPATH**/ ?>