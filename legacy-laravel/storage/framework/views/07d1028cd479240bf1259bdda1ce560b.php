

<?php $__env->startSection('content'); ?>
<link href="<?php echo e(asset('landing/landing/assets/css/karyawan.css')); ?>" rel="stylesheet">

<h1 class="h5 mb-4 text-gray-800">
    <i class="fas fa-file-contract mr-2"></i>
    <?php echo e($title); ?>

</h1>

<div class="d-flex justify-content-between align-items-start mb-3 flex-wrap">
    <div></div>
    <div style="position: relative; width: 250px;">
        <input type="text" id="customSearch" class="form-control search-custom form-control-sm" placeholder="Cari..." style="width: 250px; padding-right: 28px;">
        <span id="clearSearch" style="display: none; position: absolute; right: 12px; top: 50%; transform: translateY(-50%); cursor: pointer; color: #aaa; font-size: 18px; line-height: 1;">
            &times;
         </span>
    </div>
</div>

<div class="card shadow">
    <div class="card-header d-flex justify-content-between align-items-center">
        <h6 class="m-0 text-grey">Daftar Riwayat Kontrak Karyawan</h6>
    </div>

    <div class="card-body">
        <div class="table-responsive">
            <table class="table table-bordered" id="dataTable">
                <thead class="table-primary">
                    <tr class="text-center">
                        <th>No</th>
                        <th>NP</th>
                        <th>Nama</th>
                        <th>Awal Kontrak Aktif</th>
                        <th>Akhir Kontrak</th>
                        <th>Masa Kontrak</th>
                        <th><i class="fas fa-cog"></i></th>
                    </tr>
                </thead>
                <tbody>
                    <?php $__currentLoopData = $karyawan; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $item): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                    <tr>
                        <td class="text-center"><?php echo e($loop->iteration); ?></td>
                        <td class="text-left"><?php echo e($item->np ?? '-'); ?></td>
                        <td class="text-left"><?php echo e($item->nama ?? '-'); ?></td>
                        <td class="text-center">
                            <?php echo e($item->awal_kontrak_aktif ? $item->awal_kontrak_aktif->format('d-m-Y') : '-'); ?>

                        </td>
                        <td class="text-center">
                            <?php echo e($item->akhir_kontrak ? $item->akhir_kontrak->format('d-m-Y') : '-'); ?>

                        </td>
                        <td class="text-center"><?php echo e($item->masa_kontrak_format ?? '-'); ?></td>
                        <td class="text-center">
                            <a href="<?php echo e(route('karyawan.kontrak', $item->id)); ?>" class="btn btn-sm btn-info">
                                <i class="fas fa-file-contract"></i>
                            </a>
                        </td>
                    </tr>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                </tbody>
            </table>
        </div>
        <div class="d-flex justify-content-start mt-2" id="paginationFixed"></div>
    </div>
</div>

<?php $__env->startPush('scripts'); ?>
<script>
$(document).ready(function () {
    if ($.fn.DataTable.isDataTable('#dataTable')) {
        $('#dataTable').DataTable().destroy();
    }
    var table = $('#dataTable').DataTable({
        paging: true,
        pageLength: 10,
        ordering: true,
        searching: true,
        lengthChange: false,
        info: false,
        dom: 'tp',
        initComplete: function () {
            $('#dataTable_paginate').appendTo('#paginationFixed');
            $('#dataTable_paginate').addClass('pagination');
            $('#dataTable').addClass('ready');
        }
    });

    $('#customSearch').on('keyup', function() {
        const val = $(this).val();
        table.search(val).draw();
        $('#clearSearch').toggle(val.length > 0);
    });

    $('#clearSearch').on('click', function() {
        $('#customSearch').val('');
        table.search('').draw();
        $(this).hide();
    });
});
</script>
<?php $__env->stopPush(); ?>
<?php $__env->stopSection(); ?>
<?php echo $__env->make('layouts/app', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\laragon\www\sdmsproject\resources\views/admin/kontrak/riwayat.blade.php ENDPATH**/ ?>