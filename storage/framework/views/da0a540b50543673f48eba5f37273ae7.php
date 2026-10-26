

<?php $__env->startSection('content'); ?>

<link href="<?php echo e(asset('landing/landing/assets/css/karyawan.css')); ?>" rel="stylesheet">

<div class="container-fluid">
    <div class="card shadow">
        <div class="card-header">
            <h6 class="m-0 font-weight-bold text-warning">Edit Data Terminate Karyawan</h6>
        </div>
        <div class="card-body">
            
            <form action="<?php echo e(route('terminate.update', $karyawan->id)); ?>" method="POST">
                <?php echo csrf_field(); ?>
                <?php echo method_field('PUT'); ?>

                <h6 class="text-primary font-weight-bold mb-3">Informasi Karyawan</h6>
                
                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="np" class="form-label-custom">NP</label>
                            <input type="text" class="form-control form-control-custom readonly-field" value="<?php echo e($karyawan->np); ?>" readonly>
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="nama" class="form-label-custom">Nama</label>
                            <input type="text" class="form-control form-control-custom readonly-field" value="<?php echo e($karyawan->nama); ?>" readonly>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="kategori" class="form-label-custom">Kategori</label>
                            <input type="text" class="form-control form-control-custom readonly-field" value="<?php echo e($karyawan->kategori); ?>" readonly>
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="unit_kerja" class="form-label-custom">Unit Kerja</label>
                            <input type="text" class="form-control form-control-custom readonly-field" value="<?php echo e($karyawan->unit_kerja); ?>" readonly>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="jabatan" class="form-label-custom">Jabatan</label>
                            <input type="text" class="form-control form-control-custom readonly-field" value="<?php echo e($karyawan->jabatan); ?>" readonly>
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="akhir_kontrak" class="form-label-custom">Akhir Kontrak</label>
                            <input type="date" 
                                class="form-control form-control-custom <?php $__errorArgs = ['akhir_kontrak'];
$__bag = $errors->getBag($__errorArgs[1] ?? 'default');
if ($__bag->has($__errorArgs[0])) :
if (isset($message)) { $__messageOriginal = $message; }
$message = $__bag->first($__errorArgs[0]); ?> is-invalid <?php unset($message);
if (isset($__messageOriginal)) { $message = $__messageOriginal; }
endif;
unset($__errorArgs, $__bag); ?>" 
                                id="akhir_kontrak" 
                                name="akhir_kontrak"
                                value="<?php echo e(old('akhir_kontrak', $karyawan->akhir_kontrak?->format('Y-m-d'))); ?>">
                            <?php $__errorArgs = ['akhir_kontrak'];
$__bag = $errors->getBag($__errorArgs[1] ?? 'default');
if ($__bag->has($__errorArgs[0])) :
if (isset($message)) { $__messageOriginal = $message; }
$message = $__bag->first($__errorArgs[0]); ?>
                                <div class="invalid-feedback"><?php echo e($message); ?></div>
                            <?php unset($message);
if (isset($__messageOriginal)) { $message = $__messageOriginal; }
endif;
unset($__errorArgs, $__bag); ?>
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
                   class="form-control form-control-custom <?php $__errorArgs = ['tanggal_keluar'];
$__bag = $errors->getBag($__errorArgs[1] ?? 'default');
if ($__bag->has($__errorArgs[0])) :
if (isset($message)) { $__messageOriginal = $message; }
$message = $__bag->first($__errorArgs[0]); ?> is-invalid <?php unset($message);
if (isset($__messageOriginal)) { $message = $__messageOriginal; }
endif;
unset($__errorArgs, $__bag); ?>" 
                   id="tanggal_keluar" 
                   name="tanggal_keluar" 
                   value="<?php echo e(old('tanggal_keluar', $karyawan->tanggal_keluar ? $karyawan->tanggal_keluar->format('Y-m-d') : '')); ?>" 
                   required>
            <?php $__errorArgs = ['tanggal_keluar'];
$__bag = $errors->getBag($__errorArgs[1] ?? 'default');
if ($__bag->has($__errorArgs[0])) :
if (isset($message)) { $__messageOriginal = $message; }
$message = $__bag->first($__errorArgs[0]); ?>
                <div class="invalid-feedback"><?php echo e($message); ?></div>
            <?php unset($message);
if (isset($__messageOriginal)) { $message = $__messageOriginal; }
endif;
unset($__errorArgs, $__bag); ?>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-md-12">
        <div class="form-group">
            <label for="alasan_keluar" class="form-label-custom">Alasan Keluar <span class="text-danger">*</span></label>
            <textarea class="form-control form-control-custom <?php $__errorArgs = ['alasan_keluar'];
$__bag = $errors->getBag($__errorArgs[1] ?? 'default');
if ($__bag->has($__errorArgs[0])) :
if (isset($message)) { $__messageOriginal = $message; }
$message = $__bag->first($__errorArgs[0]); ?> is-invalid <?php unset($message);
if (isset($__messageOriginal)) { $message = $__messageOriginal; }
endif;
unset($__errorArgs, $__bag); ?>" 
                      id="alasan_keluar" 
                      name="alasan_keluar" 
                      rows="4"
                      placeholder="Masukkan alasan keluar..."
                      required><?php echo e(old('alasan_keluar', $karyawan->alasan_keluar)); ?></textarea>
            <?php $__errorArgs = ['alasan_keluar'];
$__bag = $errors->getBag($__errorArgs[1] ?? 'default');
if ($__bag->has($__errorArgs[0])) :
if (isset($message)) { $__messageOriginal = $message; }
$message = $__bag->first($__errorArgs[0]); ?>
                <div class="invalid-feedback"><?php echo e($message); ?></div>
            <?php unset($message);
if (isset($__messageOriginal)) { $message = $__messageOriginal; }
endif;
unset($__errorArgs, $__bag); ?>
        </div>
    </div>
</div>
<hr>

    <div class="form-group">
            <button type="submit" class="btn btn-warning">
                <i class="fas fa-save mr-2"></i>Update Data Terminate
            </button>
            <a href="<?php echo e(route('terminate')); ?>" class="btn btn-secondary">
                <i class="fas fa-arrow-left mr-2"></i>Batal
            </a>
    </div>

            </form>
        </div>
    </div>
</div>

<?php $__env->stopSection(); ?>
<?php echo $__env->make('layouts/app', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\laragon\www\sdmsproject\resources\views/admin/terminate/edit.blade.php ENDPATH**/ ?>