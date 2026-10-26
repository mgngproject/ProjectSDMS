@extends('layouts/app')

@section('content')

<link href="{{ asset('landing/landing/assets/css/karyawan.css') }}" rel="stylesheet">

<div class="data-terminate-page">
    <h1 class="h5 mb-4 text-gray-800">
        <i class="fas fa-user-slash mr-2"></i>
        {{ $title }}
    </h1>

    <div class="d-flex justify-content-between align-items-start mb-3 flex-wrap">
        <form method="GET" action="{{ route('terminate') }}" id="filterForm">
            <div class="d-flex gap-2 flex-wrap">
                <select name="bulan" class="form-control form-control-sm" style="width: 145px; margin-right:5px;">
                    <option value="">-- Pilih Bulan --</option>
                    @foreach (['01'=>'Januari','02'=>'Februari','03'=>'Maret','04'=>'April','05'=>'Mei','06'=>'Juni','07'=>'Juli','08'=>'Agustus','09'=>'September','10'=>'Oktober','11'=>'November','12'=>'Desember'] as $key => $bulan)
                        <option value="{{ $key }}" {{ request('bulan') == $key ? 'selected' : '' }}>{{ $bulan }}</option>
                    @endforeach
                </select>

                <select name="tahun" class="form-control form-control-sm" style="width: 150px; margin-right:5px">
                    <option value="">-- Pilih Tahun --</option>
                    @for($i=date('Y')-3; $i<=date('Y')+3; $i++)
                        <option value="{{ $i }}" {{ request('tahun') == $i ? 'selected' : '' }}>{{ $i }}</option>
                    @endfor
                </select>

                <select name="kategori" class="form-control form-control-sm" style="width: 180px; margin-right:5px">
                    <option value="">-- Semua Kategori --</option>
                    <option value="masuk" {{ request('kategori') == 'masuk' ? 'selected' : '' }}>Karyawan Masuk</option>
                </select>

                <button type="submit" class="btn btn-sm btn-secondary mr-1">Filter</button>
                <a href="{{ route('terminate') }}" class="btn btn-sm btn-secondary">Reset</a>
            </div>
        </form>

        <div style="position: relative; width: 250px;">
            <input type="text" id="customSearch" class="form-control search-custom form-control-sm" placeholder="Cari..." style="width: 250px; padding-right: 28px;">
            <span id="clearSearch" style="display: none; position: absolute; right: 12px; top: 50%; transform: translateY(-50%); cursor: pointer; color: #aaa; font-size: 18px; line-height: 1;">
                &times;
            </span>
        </div>
    </div>

    <div class="mb-3">
        <button type="button" id="deleteSelectedBtn" class="btn btn-sm btn-danger" style="display: none;">
            <i class="fas fa-trash"></i> Hapus Data Terpilih (<span id="selectedCount">0</span>)
        </button>
    </div>

    <div class="card shadow">
        <div class="card-header d-flex justify-content-between align-items-center">
            <div class="mb-1 mr-2">
                <a href="{{ route('terminate.create') }}" class="btn create-custom btn-sm btn-primary">
                    <i class="fas fa-plus mr-2"></i> Tambah Data
                </a>
            </div>
            <div>
                <a href="{{ route('terminate.excel') }}" class="btn btn-sm btn-success">
                    <i class="fas fa-file-excel mr-2"></i>Excel
                </a>
                <a href="{{ route('terminate.pdf') }}" class="btn btn-sm btn-danger" target='__blank'>
                    <i class="fas fa-file-pdf mr-2"></i>PDF
                </a>
            </div>
        </div>

        <div class="card-body">
            <div class="table-responsive">
                <table class="table table-bordered" id="dataTable">
                    <thead class="table-primary">
                        <tr class="text-center">
                            <th style="width: 40px;">
                                <input type="checkbox" id="selectAll" style="width: 18px; height: 18px;" title="Pilih Semua">
                            </th>
                            <th>No</th>
                            <th>NP</th>
                            <th style="min-width: 220px;">Nama</th>
                            <th>Masa Kerja</th>
                            <th>Awal Kontrak Masuk</th>
                            <th>Akhir Kontrak</th>
                            <th>Kode Bagan</th>
                            <th>Unit Kerja</th>
                            <th>Jabatan</th>
                            <th>Level</th>
                            <th>Role</th>
                            <th>Tanggal Keluar</th>
                            <th>Alasan Keluar</th>
                            <th><i class="fas fa-cog"></i></th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($karyawan as $item)
                        <tr>
                            <td class="text-center">
                                <input type="checkbox" class="row-checkbox" value="{{ $item->id }}" style="width: 18px; height: 18px;">
                            </td>
                            <td class="text-center">{{ $loop->iteration }}</td>
                            <td class="text-center"><span>{{ $item->np }}</span></td>
                            <td class="text-left"><span>{{ $item->nama }}</span></td>
                            <td>{{ $item->masa_kerja_format }}</td>
                            <td>{{ $item->awal_kontrak ? $item->awal_kontrak->format('d-m-Y') : '-' }}</td>
                            <td>{{ $item->akhir_kontrak ? $item->akhir_kontrak->format('d-m-Y') : '-' }}</td>
                            <td>{{ $item->kode_bagan }}</td>
                            <td class="text-left">{{ $item->unit_kerja }}</td>
                            <td class="text-left"><span>{{ $item->jabatan }}</span></td>
                            <td>{{ $item->level }}</td>
                            <td class="text-left"><span>{{ $item->role }}</span></td>
                            <td>{{ $item->tanggal_keluar ? $item->tanggal_keluar->format('d-m-Y') : '-' }}</td>
                            <td class="text-left">{{ $item->alasan_keluar }}</td>
                            <td class="text-center">
                                <a href="{{ route('terminate.edit', $item->id) }}" class="btn btn-sm btn-warning" style="margin-right: 5px;">
                                    <i class="fas fa-edit"></i>
                                </a>
                                <button type="button" class="btn btn-sm btn-danger" onclick="confirmDelete({{ $item->id }})">
                                    <i class="fas fa-trash"></i>
                                </button>
                                <form id="delete-form-{{ $item->id }}" action="{{ route('terminate.destroy', $item->id) }}" method="POST" style="display: none;">
                                    @csrf
                                    @method('DELETE')
                                </form>
                            </td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
            <div class="d-flex justify-content-start mt-2" id="paginationFixed"></div>
        </div>
    </div>
</div>

@push('scripts')
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
        columnDefs: [{ orderable: false, targets: 0 }],
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

    $('#selectAll').on('change', function () {
        const isChecked = $(this).is(':checked');
        $('.row-checkbox:visible').prop('checked', isChecked);
        updateDeleteButton();
    });

    $(document).on('change', '.row-checkbox', function () {
        updateDeleteButton();
        const totalVisible = $('.row-checkbox:visible').length;
        const totalChecked = $('.row-checkbox:visible:checked').length;
        $('#selectAll').prop('checked', totalVisible === totalChecked && totalVisible > 0);
    });

    function updateDeleteButton() {
        const selectedCount = $('.row-checkbox:checked').length;
        $('#selectedCount').text(selectedCount);
        selectedCount > 0 ? $('#deleteSelectedBtn').show() : $('#deleteSelectedBtn').hide();
    }

    $('#deleteSelectedBtn').on('click', function () {
        const selectedIds = [];
        $('.row-checkbox:checked').each(function () {
            selectedIds.push($(this).val());
        });

        if (selectedIds.length === 0) {
            Swal.fire({ icon: 'warning', title: 'Tidak ada data yang dipilih!', customClass: { title: 'swal-title-kecil', htmlContainer: 'swal-text-kecil', confirmButton: 'swal-confirm-kecil' } });
            return;
        }

        Swal.fire({
            title: 'Yakin ingin menghapus?',
            text: `${selectedIds.length} Data karyawan terminate akan dihapus permanen!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, Hapus Semua!',
            cancelButtonText: 'Batal',
            customClass: { title: 'swal-title-kecil', htmlContainer: 'swal-text-kecil', confirmButton: 'swal-confirm-kecil', cancelButton: 'swal-cancel-kecil' }
        }).then((result) => {
            if (result.isConfirmed) {
                const btn = $('#deleteSelectedBtn');
                const originalHtml = btn.html();
                btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Menghapus...');

                $.ajax({
                    url: '{{ route("terminate.bulkDelete") }}',
                    method: 'POST',
                    data: { _token: '{{ csrf_token() }}', ids: selectedIds },
                    success: function (response) {
                        if (response.success) {
                            Swal.fire({ icon: 'success', title: 'Berhasil!', text: `${response.deleted} data berhasil dihapus!`, customClass: { title: 'swal-title-kecil', htmlContainer: 'swal-text-kecil', confirmButton: 'swal-confirm-kecil' } })
                            .then(() => location.reload());
                        } else {
                            Swal.fire({ icon: 'error', title: 'Gagal!', text: response.message || 'Terjadi kesalahan', customClass: { title: 'swal-title-kecil', htmlContainer: 'swal-text-kecil', confirmButton: 'swal-confirm-kecil' } });
                            btn.prop('disabled', false).html(originalHtml);
                        }
                    },
                    error: function () {
                        Swal.fire({ icon: 'error', title: 'Error!', text: 'Terjadi kesalahan saat menghapus data.', customClass: { title: 'swal-title-kecil', htmlContainer: 'swal-text-kecil', confirmButton: 'swal-confirm-kecil' } });
                        btn.prop('disabled', false).html(originalHtml);
                    }
                });
            }
        });
    });
});
</script>
@endpush
@endsection