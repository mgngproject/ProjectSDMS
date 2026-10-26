

<?php $__env->startSection('content'); ?>

<link href="<?php echo e(asset('landing/landing/assets/css/karyawan.css')); ?>" rel="stylesheet">

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
                            <tr><td><strong>NP</strong></td><td class="px-2">:</td><td><?php echo e($karyawan->np); ?></td></tr>
                            <tr><td><strong>Nama</strong></td><td class="px-2">:</td><td><?php echo e($karyawan->nama); ?></td></tr>
                            <tr><td><strong>Unit Kerja</strong></td><td class="px-2">:</td><td><?php echo e($karyawan->unit_kerja); ?></td></tr>
                            <tr><td><strong>Jabatan</strong></td><td class="px-2">:</td><td><?php echo e($karyawan->jabatan); ?></td></tr>
                        </table>
                    </div>
                    <div class="col-md-6 info-custom">
                        <table>
                            <tr><td><strong>Level</strong></td><td class="px-2">:</td><td><?php echo e($karyawan->level); ?></td></tr>
                            <tr><td><strong>Role</strong></td><td class="px-2">:</td><td><?php echo e($karyawan->role); ?></td></tr>
                            <tr><td><strong>Masa Kerja</strong></td><td class="px-2">:</td><td><?php echo e($karyawan->masa_kerja); ?> bulan</td></tr>
                        </table>
                    </div>
                </div>
            </div>

            <form action="<?php echo e(route('karyawan.terminate', $karyawan->id)); ?>" method="POST">
                <?php echo csrf_field(); ?>
                
                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="tanggal_keluar">Tanggal Keluar <span class="text-danger">*</span></label>
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
                                   value="<?php echo e(old('tanggal_keluar')); ?>" 
                                   style="font-size: 12px;"
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

                <div class="form-group">
                    <label for="alasan_keluar">Alasan Keluar <span class="text-danger">*</span></label>
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
                              rows="5" 
                              placeholder="Masukkan alasan terminate..." 
                              style="font-size: 12px;"
                              required><?php echo e(old('alasan_keluar')); ?></textarea>
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

                <hr>

                <div class="form-group">
                    <button type="submit" class="btn btn-danger">
                        <i class="fas fa-user-slash mr-2"></i>Terminate Karyawan
                    </button>
                    <a href="<?php echo e(route('karyawan')); ?>" class="btn btn-secondary">
                        <i class="fas fa-arrow-left mr-2"></i>Batal
                    </a>
                </div>
            </form>

        </div>
    </div>
</div>

<?php $__env->stopSection(); ?>
<?php echo $__env->make('layouts/app', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\laragon\www\sdmsproject\resources\views/admin/karyawan/terminate-form.blade.php ENDPATH**/ ?>