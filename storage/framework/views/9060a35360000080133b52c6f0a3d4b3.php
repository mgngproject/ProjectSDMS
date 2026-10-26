

<?php $__env->startSection('content'); ?>

<link href="<?php echo e(asset('landing/landing/assets/css/monitoring.css')); ?>" rel="stylesheet">

<h1 class="h5 mb-4 text-gray-800">
    <i class="fas fa-chart-line mr-2"></i>
    <?php echo e($title); ?>

</h1>

<div class="d-flex justify-content-between align-items-start mb-3 flex-wrap">
    <form method="GET" action="<?php echo e(route('monitoring')); ?>" id="filterForm">
        <div class="d-flex gap-2 flex-wrap">
            <select name="bulan" id="bulan" class="form-control form-control-sm" style="width: 145px; margin-right: 5px;">
                <option value="">-- Pilih Bulan --</option>
                <?php $__currentLoopData = [
                    '01'=>'Januari','02'=>'Februari','03'=>'Maret','04'=>'April','05'=>'Mei','06'=>'Juni',
                    '07'=>'Juli','08'=>'Agustus','09'=>'September','10'=>'Oktober','11'=>'November','12'=>'Desember'
                ]; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $key => $bulan): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                    <option value="<?php echo e($key); ?>" <?php echo e(request('bulan') == $key ? 'selected' : ''); ?>><?php echo e($bulan); ?></option>
                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
            </select>
            <button type="submit" class="btn btn-sm btn-secondary mr-1">Filter</button>
            <a href="<?php echo e(route('monitoring')); ?>" class="btn btn-sm btn-secondary">Reset</a>
        </div>
    </form>

    <div style="position: relative; width: 250px;">
        <input type="text" id="customSearch" class="form-control search-custom form-control-sm" placeholder="Cari..." style="width: 250px; padding-right: 28px;">
        <span id="clearSearch" style="display: none; position: absolute; right: 12px; top: 50%; transform: translateY(-50%); cursor: pointer; color: #aaa; font-size: 18px; line-height: 1;">
            &times;
        </span>
    </div>
</div>

<div class="card shadow-sm">
    <div class="card-header bg-white d-flex justify-content-between align-items-center py-3">
        <h6>Daftar Monitoring Berkas Karyawan</h6>
    </div>

    <div class="card-body">
        <div class="table-responsive">
            <table class="table table-bordered" id="dataTable">
                <thead class="table-primary">
                    <tr class="text-center">
                        <th>No</th>
                        <th>NP</th>
                        <th>Nama</th>
                        <th>Unit Kerja</th>
                        <th>Jabatan</th>
                        <th>Akhir Kontrak</th>
                        <th class="folder-link-cell">Link Folder</th>
                        <th>Link Google Drive</th>
                        <th>NDE Konfirmasi</th>
                        <th>NDE Jawaban</th>
                        <th>NDE Laporan</th>
                        <th style="min-width: 130px;">Usulan Remunerasi</th>
                        <th>Offering Letter</th>
                        <th>Izin Prinsip (NDE)</th>
                        <th>Izin Prinsip (Manual)</th>
                        <th style="min-width: 100px;">SP</th>
                        <th style="min-width: 100px;">SKEP</th>
                        <th>NDE Penyampaian Unit Kerja</th>
                        <th>NDE Penyampaian SDMO</th>
                        <th>Upload ESS</th>
                        <th>Data Diri</th>
                        <th>Status</th>
                        <th>Catatan</th>
                        <th style="min-width: 150px;">Keterangan</th>
                    </tr>
                </thead>

                <tbody>
                    <?php $__currentLoopData = $karyawan; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $k): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                    <tr>
                        <td class="text-center"><?php echo e($loop->iteration); ?></td>
                        <td class="text-left"><?php echo e($k->np); ?></td>
                        <td class="text-left"><?php echo e($k->nama); ?></td>
                        <td><?php echo e($k->unit_kerja); ?></td>
                        <td><?php echo e($k->jabatan); ?></td>
                        <td class="text-center"><?php echo e($k->akhir_kontrak ? $k->akhir_kontrak->format('d-m-Y') : '-'); ?></td>

                        <td class="text-center">
                            <?php if(!empty($k->folder_link)): ?>
                                <a href="<?php echo e($k->folder_link); ?>" target="_blank" class="folder-link-display">
                                    <i class="fas fa-folder-open"></i>
                                    <span><?php echo e(Str::limit($k->nama, 15)); ?></span>
                                </a>
                            <?php else: ?>
                                <span class="folder-link-empty">
                                    <i class="fas fa-folder text-muted"></i> Belum ada link
                                </span>
                            <?php endif; ?>
                        </td>

                        <td class="text-center">
                            <?php if(empty($k->folder_link)): ?>
                                <button class="btn btn-sm btn-paste-link" data-toggle="modal" data-target="#pasteModal<?php echo e($k->id); ?>">
                                    <i class="fas fa-link"></i> Paste Link
                                </button>
                            <?php else: ?>
                                <button class="btn btn-sm btn-edit-link" data-toggle="modal" data-target="#pasteModal<?php echo e($k->id); ?>">
                                    <i class="fas fa-edit"></i> Edit
                                </button>
                            <?php endif; ?>
                        </td>

                        <?php $__currentLoopData = [
                            'nde_konfirmasi', 'nde_jawaban', 'nde_laporan'
                        ]; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $field): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class="text-center">
                            <input type="checkbox"
                                   id="<?php echo e($field); ?>_<?php echo e($k->monitoring->id); ?>"
                                   name="<?php echo e($field); ?>"
                                   class="berkas-checkbox"
                                   style="width: 20px; height: 20px;"
                                   data-id="<?php echo e($k->monitoring->id); ?>"
                                   data-field="<?php echo e($field); ?>"
                                   <?php echo e($k->monitoring->$field ? 'checked' : ''); ?>>
                        </td>
                        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>

                        <td>
                            <input type="text"
                                   id="usulan_remunerasi_<?php echo e($k->monitoring->id); ?>"
                                   name="usulan_remunerasi"
                                   class="form-control form-control-sm berkas-text"
                                   data-id="<?php echo e($k->monitoring->id); ?>"
                                   data-field="usulan_remunerasi"
                                   value="<?php echo e($k->monitoring->usulan_remunerasi); ?>"
                                   placeholder="Isi nilai...">
                        </td>

                        <?php $__currentLoopData = [
                            'offering_letter', 'izin_prinsip_nde', 'izin_prinsip_manual'
                        ]; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $field): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class="text-center">
                            <input type="checkbox"
                                   id="<?php echo e($field); ?>_<?php echo e($k->monitoring->id); ?>"
                                   name="<?php echo e($field); ?>"
                                   class="berkas-checkbox"
                                   style="width: 20px; height: 20px;"
                                   data-id="<?php echo e($k->monitoring->id); ?>"
                                   data-field="<?php echo e($field); ?>"
                                   <?php echo e($k->monitoring->$field ? 'checked' : ''); ?>>
                        </td>
                        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>

                        <?php $__currentLoopData = ['sp', 'skep']; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $field): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td>
                            <input type="text"
                                   id="<?php echo e($field); ?>_<?php echo e($k->monitoring->id); ?>"
                                   name="<?php echo e($field); ?>"
                                   class="form-control form-control-sm berkas-text"
                                   data-id="<?php echo e($k->monitoring->id); ?>"
                                   data-field="<?php echo e($field); ?>"
                                   value="<?php echo e($k->monitoring->$field); ?>"
                                   placeholder="No. <?php echo e(strtoupper($field)); ?>...">
                        </td>
                        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>

                        <?php $__currentLoopData = [
                            'nde_penyampaian_unit_kerja', 'nde_penyampaian_sdmo', 'upload_ess', 'data_diri'
                        ]; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $field): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <td class="text-center">
                            <input type="checkbox"
                                   id="<?php echo e($field); ?>_<?php echo e($k->monitoring->id); ?>"
                                   name="<?php echo e($field); ?>"
                                   class="berkas-checkbox"
                                   style="width: 20px; height: 20px;"
                                   data-id="<?php echo e($k->monitoring->id); ?>"
                                   data-field="<?php echo e($field); ?>"
                                   <?php echo e($k->monitoring->$field ? 'checked' : ''); ?>>
                        </td>
                        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>

                        <td class="text-center" id="status-<?php echo e($k->monitoring->id); ?>">
                            <span class="badge badge-<?php echo e($k->monitoring->status == 'Selesai' ? 'success' : 'warning'); ?> status-badge">
                                <i class="fas fa-<?php echo e($k->monitoring->status == 'Selesai' ? 'check-circle' : 'clock'); ?>"></i>
                                <?php echo e($k->monitoring->status); ?>

                            </span>
                        </td>

                        <td class="text-left" style="font-size: 12px; line-height: 1.6;" id="catatan-<?php echo e($k->monitoring->id); ?>">
                            <?php if($k->monitoring->status == 'Selesai'): ?>
                                <span class="text-success">
                                    <i class="fas fa-check-circle"></i> Selesai
                                </span>
                            <?php else: ?>
                                <?php if($k->monitoring->catatan): ?>
                                    <?php $items = explode(', ', $k->monitoring->catatan); ?>
                                    <div id="catatan-short-<?php echo e($k->monitoring->id); ?>">
                                        <?php $__currentLoopData = array_slice($items, 0, 1); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $cat): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                            <div class="text-danger">• <?php echo e($cat); ?></div>
                                        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                                    </div>
                                    <div id="catatan-full-<?php echo e($k->monitoring->id); ?>" style="display: none;">
                                        <?php $__currentLoopData = $items; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $cat): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                            <div class="text-danger">• <?php echo e($cat); ?></div>
                                        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                                    </div>
                                    <?php if(count($items) > 1): ?>
                                        <button class="btn btn-link p-0 mt-1 toggle-catatan" style="font-size: 11px;" data-id="<?php echo e($k->monitoring->id); ?>">
                                            Selengkapnya
                                        </button>
                                    <?php endif; ?>
                                <?php endif; ?>
                            <?php endif; ?>
                        </td>

                        <td>
                            <textarea
                            class="form-control form-control-sm berkas-text"
                            data-id="<?php echo e($k->monitoring->id); ?>"
                            data-field="keterangan"
                            placeholder="Tambah keterangan..."
                            rows="2"
                            style="resize: vertical; text-align: left;"><?php echo e($k->monitoring->keterangan); ?></textarea>
                       </td> 
                    </tr>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                </tbody>
            </table>
        </div>
        <div class="d-flex justify-content-start mt-3" id="paginationFixed"></div>
    </div>
</div>

<?php $__currentLoopData = $karyawan; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $k): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
<div class="modal fade" id="pasteModal<?php echo e($k->id); ?>" tabindex="-1" role="dialog" aria-labelledby="pasteModalLabel<?php echo e($k->id); ?>" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
            <div class="modal-header modal-header-custom">
                <h6 class="modal-title mb-0">
                    <i class="fas fa-link mr-2"></i>Link Folder Google Drive
                </h6>
                <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
                <div class="row g-3">
                    <div class="col-6">
                        <div class="bg-light p-3 rounded">
                            <small class="text-muted d-block mb-1">Nama Karyawan</small>
                            <strong style="font-size: 12px;"><?php echo e($k->nama); ?></strong>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="bg-light p-3 rounded">
                            <small class="text-muted d-block mb-1">NP</small>
                            <strong style="font-size: 12px;"><?php echo e($k->np); ?></strong>
                        </div>
                    </div>
                    <div class="col-12">
                        <div class="bg-light p-3 rounded">
                            <small class="text-muted d-block mb-2">Link Google Drive</small>
                            <input type="url"
                                   class="form-control"
                                   id="folderLink<?php echo e($k->id); ?>"
                                   name="folder_link"
                                   value="<?php echo e($k->folder_link); ?>"
                                   placeholder="https://drive.google.com/...">
                            <small class="text-muted mt-1 d-block">
                                <i class="fas fa-info-circle"></i> Paste link folder Google Drive di sini
                            </small>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Tutup</button>
                <button type="button" class="btn btn-primary" onclick="saveLink(<?php echo e($k->id); ?>)">
                    <i class="fas fa-save mr-1"></i> Simpan
                </button>
            </div>
        </div>
    </div>
</div>
<?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>

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

    $(document).on('change', '.berkas-checkbox', function () {
        const checkbox = $(this);
        const id = checkbox.data('id');
        const field = checkbox.data('field');
        const checked = checkbox.is(':checked') ? 1 : 0;

        checkbox.prop('disabled', true);

        $.ajax({
            url: `/monitoring/${id}/checkbox`,
            method: 'POST',
            data: { _token: '<?php echo e(csrf_token()); ?>', field: field, checked: checked },
            success: function (response) {
                if (response.success) {
                    $(`#status-${id}`).html(response.statusBadge);
                    $(`#catatan-${id}`).html(response.catatanHtml);
                    checkbox.parent().append('<i class="fas fa-check text-success ml-1 save-indicator" style="font-size: 12px;"></i>');
                    setTimeout(() => $('.save-indicator').fadeOut(300, function () { $(this).remove(); }), 1000);
                } else {
                    checkbox.prop('checked', !checked);
                    alert('Gagal menyimpan data');
                }
            },
            error: function () {
                checkbox.prop('checked', !checked);
                alert('Gagal menyimpan data. Silakan coba lagi.');
            },
            complete: function () {
                checkbox.prop('disabled', false);
            }
        });
    });

    let textTimeout = {};
    $(document).on('input', '.berkas-text', function () {
        const input = $(this);
        const id = input.data('id');
        const field = input.data('field');
        const uniqueKey = `${id}-${field}`;

        if (textTimeout[uniqueKey]) clearTimeout(textTimeout[uniqueKey]);

        input.css('border-color', '#ffc107');

        textTimeout[uniqueKey] = setTimeout(function () {
            const value = input.val().trim();

            $.ajax({
                url: `/monitoring/${id}/textfield`,
                method: 'POST',
                data: { _token: '<?php echo e(csrf_token()); ?>', field: field, value: value },
                success: function (response) {
                    if (response.success) {
                        $(`#status-${id}`).html(response.statusBadge);
                        $(`#catatan-${id}`).html(response.catatanHtml);
                        input.css('border-color', '#28a745');
                        setTimeout(() => input.css('border-color', ''), 1000);
                    } else {
                        input.css('border-color', '#dc3545');
                        alert('Gagal menyimpan data');
                    }
                },
                error: function () {
                    input.css('border-color', '#dc3545');
                    alert('Gagal menyimpan data. Silakan coba lagi.');
                    setTimeout(() => input.css('border-color', ''), 2000);
                }
            });
        }, 800);
    });

    $(document).on('click', '.toggle-catatan', function (e) {
        e.preventDefault();
        const button = $(this);
        const id = button.data('id');

        $(`#catatan-short-${id}`).toggle();
        $(`#catatan-full-${id}`).toggle();

        button.text(button.text().trim() === 'Selengkapnya' ? 'Sembunyikan' : 'Selengkapnya');
    });
});

function saveLink(id) {
    const link = $('#folderLink' + id).val();

    if (!link.trim()) {
        alert('Link tidak boleh kosong!');
        return;
    }

    const btn = event.target;
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';

    $.ajax({
        url: `/karyawan/${id}/save-link`,
        type: 'POST',
        data: { _token: '<?php echo e(csrf_token()); ?>', folder_link: link },
        success: function (res) {
            if (res.success) {
                $(`#pasteModal${id}`).modal('hide');
                $(`#pasteModal${id}`).on('hidden.bs.modal', function () { location.reload(); });
            } else {
                alert(res.message);
                btn.disabled = false;
                btn.innerHTML = originalText;
            }
        },
        error: function (xhr) {
            if (xhr.status === 422) {
                alert(xhr.responseJSON.errors.folder_link[0]);
            } else if (xhr.status === 403) {
                alert(xhr.responseJSON.message);
            } else {
                alert('Terjadi kesalahan');
            }
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    });
}
</script>
<?php $__env->stopPush(); ?>

<?php $__env->stopSection(); ?>
<?php echo $__env->make('layouts/app', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\laragon\www\sdmsproject\resources\views/admin/karyawan/monitoring.blade.php ENDPATH**/ ?>