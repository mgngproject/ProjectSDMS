

<?php $__env->startSection('content'); ?>

<link href="<?php echo e(asset('landing/landing/assets/css/karyawan.css')); ?>" rel="stylesheet">

<h1 class="h5 mb-4 text-gray-800">
    <i class="fas fa-user-alt mr-2"></i>
    <?php echo e($title); ?>

</h1>

<div class="d-flex justify-content-between align-items-start mb-3 flex-wrap">
    <form method="GET" action="<?php echo e(route('datadiri')); ?>" id="filterForm">
        <div class="d-flex gap-2 flex-wrap">
            <select name="jenjang" id="jenjang" class="form-control form-control-sm" style="width: 160px; margin-right: 5px;">
                <option value="">-- Pilih Jenjang --</option>
                <?php $__currentLoopData = ['S1' => 'S1', 'S2' => 'S2']; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $key => $jenjang): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                    <option value="<?php echo e($key); ?>" <?php echo e(request('jenjang') == $key ? 'selected' : ''); ?>>
                        <?php echo e($jenjang); ?>

                    </option>
                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
            </select>
            <button type="submit" class="btn btn-sm btn-secondary mr-1">Filter</button>
            <a href="<?php echo e(route('datadiri')); ?>" class="btn btn-sm btn-secondary">Reset</a>
        </div>
    </form>

    <div style="position: relative; width: 250px;">
        <input type="text" id="customSearch" class="form-control search-custom form-control-sm" placeholder="Cari..." style="width: 250px; padding-right: 28px;">
        <span id="clearSearch" style="display: none; position: absolute; right: 12px; top: 50%; transform: translateY(-50%); cursor: pointer; color: #aaa; font-size: 18px; line-height: 1;">
            &times;
        </span>
    </div>
</div>

<div class="card shadow">
    <div class="card-header d-flex justify-content-xl-between align-items-center flex-wrap justify-content-center">
        <div class="mb-1 mr-2">
            <a href="<?php echo e(route('datadiri.create')); ?>" class="btn create-custom btn-sm btn-primary">
                <i class="fas fa-plus mr-2"></i> Tambah Data
            </a>
        </div>
        <div>
            <a href="<?php echo e(route('datadiri.excel')); ?>" class="btn btn-sm btn-success">
                <i class="fas fa-file-excel mr-2"></i> Excel
            </a>
            <a href="<?php echo e(route('datadiri.pdf')); ?>" class="btn btn-sm btn-danger" target="__blank">
                <i class="fas fa-file-pdf mr-2"></i> PDF
            </a>
        </div>
    </div>

    <div class="card-body">
        <div class="table-responsive">
            <table class="table table-bordered" id="dataTable">
                <thead class="table-primary">
                    <tr class="text-center">
                        <th>No</th>
                        <th>NP</th>
                        <th>Nama</th>
                        <th>No KTP</th>
                        <th>Tempat Tanggal Lahir</th>
                        <th>Alamat</th>
                        <th>Jenjang</th>
                        <th>Jurusan</th>
                        <th>Nama Perguruan Tinggi</th>
                        <th><i class="fas fa-cog"></i></th>
                    </tr>
                </thead>
                <tbody>
                    <?php $__empty_1 = true; $__currentLoopData = $datadiri; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $item): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                        <?php $pt = $item->pendidikan_terakhir; ?>
                        <tr>
                            <td><?php echo e($loop->iteration); ?></td>
                            <td class="text-left"><?php echo e($item->karyawan->np ?? '-'); ?></td>
                            <td class="text-left"><?php echo e($item->karyawan->nama ?? '-'); ?></td>
                            <td><?php echo e($item->ktp ?? '-'); ?></td>
                            <td class="text-left">
                                <?php if($item->tempat_lahir && $item->tanggal_lahir): ?>
                                    <?php echo e($item->ttl); ?>

                                <?php else: ?>
                                    -
                                <?php endif; ?>
                            </td>
                            <td class="text-left"><?php echo e($item->alamat_lengkap); ?></td>
                            <td><?php echo e($pt['jenjang']); ?></td>
                            <td class="text-left"><?php echo e($pt['jurusan']); ?></td>
                            <td class="text-left"><?php echo e($pt['kampus']); ?></td>
                            <td class="text-center">
                                <button class="btn btn-sm btn-info"
                                        data-toggle="modal"
                                        data-target="#detailModal<?php echo e($item->id); ?>"
                                        title="Detail">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <a href="<?php echo e(route('datadiri.edit', $item->id)); ?>"
                                   class="btn btn-sm btn-warning"
                                   title="Edit">
                                    <i class="fas fa-edit"></i>
                                </a>
                            </td>
                        </tr>

                        <div class="modal fade" id="detailModal<?php echo e($item->id); ?>" tabindex="-1" role="dialog">
                            <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
                                <div class="modal-content">
                                    <div class="modal-header">
                                        <h5 class="modal-title">
                                            Detail Pendidikan - <?php echo e($item->karyawan->nama); ?>

                                        </h5>
                                        <button type="button" class="close text-white" data-dismiss="modal">
                                            <span>&times;</span>
                                        </button>
                                    </div>

                                    <div class="modal-body">
                                        <h6 class="text-primary">Riwayat Pendidikan</h6>

                                        <?php $__empty_2 = true; $__currentLoopData = $item->riwayat_pendidikan; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $pendidikan): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_2 = false; ?>
                                            <div class="riwayat-custom border rounded p-2 mb-2">
                                                <strong><?php echo e($pendidikan['jenjang']); ?></strong><br>
                                                <div class="d-flex">
                                                    <div style="width: 180px">Jurusan</div>
                                                    <div class="mx-2">:</div>
                                                    <div><?php echo e($pendidikan['jurusan'] ?? '-'); ?></div>
                                                </div>
                                                <div class="d-flex">
                                                    <div style="width: 180px">Nama Perguruan Tinggi</div>
                                                    <div class="mx-2">:</div>
                                                    <div><?php echo e($pendidikan['kampus'] ?? '-'); ?></div>
                                                </div>
                                            </div>
                                        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_2): ?>
                                            <p class="text-muted">Tidak ada data pendidikan</p>
                                        <?php endif; ?>
                                    </div>

                                    <div class="modal-footer">
                                        <button class="btn btn-secondary" data-dismiss="modal">Tutup</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
        <div class="d-flex justify-content-start mt-2" id="paginationFixed"></div>
    </div>
</div>

<?php $__env->startPush('scripts'); ?>
<script>
function confirmDelete(id) {
    Swal.fire({
        title: 'Yakin ingin menghapus?',
        text: "Data yang dihapus tidak bisa dikembalikan!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal',
        customClass: {
            title: 'swal-title-kecil',
            htmlContainer: 'swal-text-kecil',
            confirmButton: 'swal-confirm-kecil',
            cancelButton: 'swal-cancel-kecil',
        }
    }).then((result) => {
        if (result.isConfirmed) {
            document.getElementById('delete-form-' + id).submit();
        }
    });
}

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
<?php echo $__env->make('layouts/app', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\laragon\www\sdmsproject\resources\views/admin/datadiri/datadiri.blade.php ENDPATH**/ ?>