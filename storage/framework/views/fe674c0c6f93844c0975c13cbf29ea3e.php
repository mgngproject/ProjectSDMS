

<?php $__env->startSection('content'); ?>

<link href="<?php echo e(asset('landing/landing/assets/css/kontrak.css')); ?>" rel="stylesheet">

<div class="container-fluid">
    <div class="page-header-simple">
        <div class="d-flex justify-content-between align-items-center">
            <h1 class="h4 mb-4 text-gray-800">
                <i class="fas fa-user-plus mr-2"></i>
                <?php echo e($title); ?>

            </h1>
            <a href="<?php echo e(route('karyawan')); ?>" class="btn-back">
                <i class="fas fa-arrow-left"></i> Kembali
            </a>
        </div>
    </div>

    <div class="karyawan-info">
        <div class="row">
            <div class="col-md-3">
                <h6 class="mb-1">Nama Karyawan</h6>
                <h4 class="mb-0"><strong><?php echo e($karyawan->nama); ?></strong></h4>
            </div>
            <div class="col-md-3">
                <h6 class="mb-1">Kontrak Aktif</h6>
                <h5 class="mb-0"><strong>
                    <?php if($karyawan->kontrakAktif): ?>
                        <?php echo e($karyawan->kontrakAktif->awal_kontrak?->format('d/m/Y')); ?> -
                        <?php echo e($karyawan->kontrakAktif->akhir_kontrak?->format('d/m/Y')); ?>

                    <?php else: ?>
                        <span class="text-muted">Tidak ada kontrak aktif</span>
                    <?php endif; ?>
                </strong></h5>
            </div>
            <div class="col-md-3">
                <h6 class="mb-1">Total Kontrak</h6>
                <h4 class="mb-0"><strong><?php echo e($kontrak->count()); ?> Kontrak</strong></h4>
            </div>
            <div class="col-md-3">
                <h6 class="mb-1">Status</h6>
                <h5 class="mb-0">
                    <?php if($kontrak->where('status', 'aktif')->count() > 0): ?>
                        <span class="badge badge-success">Ada Kontrak Aktif</span>
                    <?php else: ?>
                        <span class="badge badge-secondary">Tidak Ada Kontrak Aktif</span>
                    <?php endif; ?>
                </h5>
            </div>
        </div>
    </div>

    <?php if(session('success')): ?>
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            <i class="fas fa-check-circle"></i> <?php echo e(session('success')); ?>

            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
    <?php endif; ?>

    
    <div class="card custom-shadow">
    <div class="card-body p-0">
        <div class="table-responsive">
            <table class="table mb-0">
                <thead class="thead-light">
                    <tr>
                        <th>Kontrak</th>
                        <th>NP</th>
                        <th>Periode Kontrak</th>
                        <th>Penilaian</th>
                        <th>Link Folder</th>
                        <th>Status</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    <?php $__empty_1 = true; $__currentLoopData = $kontrak; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $item): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                    <tr>
                        <td><strong><?php echo e($item->kontrak_ke); ?></strong></td>
                        <td><?php echo e($item->np ?? '-'); ?></td>
                        <td>
                            <?php echo e($item->awal_kontrak?->format('d/m/Y')); ?> &ndash;
                            <?php echo e($item->akhir_kontrak?->format('d/m/Y')); ?>

                        </td>
                        <td><?php echo e($item->penilaian ?? '-'); ?></td>
                        <td>
                            <?php if($item->folder_link): ?>
                                <a href="<?php echo e($item->folder_link); ?>" target="_blank" class="btn-drive">
                                    <i class="fab fa-google-drive"></i> Buka Folder
                                </a>
                            <?php else: ?>
                                <span class="text-muted">-</span>
                            <?php endif; ?>
                        </td>
                        <td>
                            <?php if($item->status == 'aktif'): ?>
                                <span class="badge badge-success">Aktif</span>
                            <?php else: ?>
                                <span class="badge badge-secondary">Selesai</span>
                            <?php endif; ?>
                        </td>
                        <td>
                            <a href="<?php echo e(route('kontrak.edit', $item->id)); ?>" class="btn-edit-custom">
                                <i class="fas fa-edit"></i> Edit
                            </a>
                        </td>
                    </tr>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                    <tr>
                        <td colspan="7" class="text-center py-4 text-muted">
                            <i class="fas fa-inbox fa-2x mb-2 d-block"></i>
                            Karyawan <strong><?php echo e($karyawan->nama); ?></strong> belum memiliki riwayat kontrak
                        </td>
                    </tr>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>
</div>

<a href="<?php echo e(route('karyawan.kontrak.create', $karyawan->id)); ?>" class="add-button" title="Tambah Kontrak Baru">
    <i class="fas fa-plus"></i>
</a>

<?php $__env->stopSection(); ?>
<?php echo $__env->make('layouts.app', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\laragon\www\sdmsproject\resources\views/admin/kontrak/kontrak.blade.php ENDPATH**/ ?>