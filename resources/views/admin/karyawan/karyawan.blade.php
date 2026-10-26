@extends('layouts/app')

@section('content')

<link href="{{ asset('landing/landing/assets/css/karyawan.css') }}" rel="stylesheet">

<div class="data-karyawan-page">
<h1 class="h5 mb-4 text-gray-800">
    <i class="fas fa-user-alt mr-2"></i>
    {{ $title }}
</h1>

<div class="d-flex justify-content-between align-items-start mb-3 flex-wrap">
    <form method="GET" action="{{ route('karyawan') }}" id="filterForm">
        <div class="d-flex gap-2 flex-wrap">
            <select name="bulan" class="form-control form-control-sm" style="width: 145px; margin-right:5px;">
                <option value="">-- Pilih Bulan --</option>
                @foreach ([
                    '01'=>'Januari','02'=>'Februari','03'=>'Maret','04'=>'April','05'=>'Mei','06'=>'Juni',
                    '07'=>'Juli','08'=>'Agustus','09'=>'September','10'=>'Oktober','11'=>'November','12'=>'Desember'
                ] as $key => $bulan)
                    <option value="{{ $key }}" {{ request('bulan') == $key ? 'selected' : '' }}>
                        {{ $bulan }}
                    </option>
                @endforeach
            </select>

            <select name="tahun" class="form-control form-control-sm" style="width: 150px; margin-right:5px">
                <option value="">-- Pilih Tahun --</option>
                @for ($i = date('Y') - 3; $i <= date('Y') + 3; $i++)
                    <option value="{{ $i }}" {{ request('tahun') == $i ? 'selected' : '' }}>
                        {{ $i }}
                    </option>
                @endfor
            </select>

            <select name="kategori" class="form-control form-control-sm" style="width: 180px; margin-right:5px">
                <option value="">-- Semua Kategori --</option>
                <option value="masuk" {{ request('kategori') == 'masuk' ? 'selected' : '' }}>
                    Karyawan Masuk
                </option>
                <option value="habis" {{ request('kategori') == 'habis' ? 'selected' : '' }}>
                    Karyawan Habis Kontrak
                </option>
            </select>

            <button type="submit" class="btn btn-sm btn-secondary mr-1">Filter</button>
            <a href="{{ route('karyawan') }}" class="btn btn-sm btn-secondary">Reset</a>
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
    <div class="card-header d-flex justify-content-xl-between align-items-center flex-wrap justify-content-center">
        <div class="mb-1 mr-2">
            <a href="{{ route('karyawan.create') }}" class="btn create-custom btn-sm btn-primary">
                <i class="fas fa-plus mr-2"></i> Tambah Data
            </a>

            <form action="{{ route('karyawan.import') }}" method="POST" enctype="multipart/form-data" id="importForm" style="display: inline;">
                @csrf
                <input type="file" name="file" id="fileImport" accept=".xlsx,.xls,.csv" style="display: none;" required>
                <button type="button" class="btn create btn-sm btn-primary" onclick="document.getElementById('fileImport').click();">
                    <i class="fas fa-file-import mr-2"></i> Import
                </button>
            </form>
        </div>

        <div>
            <a href="{{ route('karyawan.excel') }}" class="btn btn-sm btn-success">
                <i class="fas fa-file-excel mr-2"></i> Excel
            </a>
            <a href="{{ route('karyawan.pdf') }}" class="btn btn-sm btn-danger" target="__blank">
                <i class="fas fa-file-pdf mr-2"></i> PDF
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
                        <th style="width: 60px;">No</th>
                        <th style="width: 100px;">NP</th>
                        <th style="min-width: 150px;">Nama</th>
                        <th>Kategori</th>
                        <th style="width: 130px;">Awal Kontrak Masuk</th>
                        <th style="width: 120px;">Masa Kerja</th>
                        <th>Kode Bagan</th>
                        <th>Unit Kerja</th>
                        <th>Jabatan</th>
                        <th>Level</th>
                        <th>Role</th>
                        <th>Benefit Kesehatan</th>
                        <th>Gross per Month</th>
                        <th>KPI</th>
                        <th style="width: 200px;"><i class="fas fa-cog"></i></th>
                    </tr>
                </thead>

                <tbody>
                    @foreach ($karyawan as $item)
                    <tr class="{{ $item->akhir_kontrak && $item->akhir_kontrak->isPast() ? 'row-habis-kontrak' : '' }}">
                        <td class="text-center">
                            <input type="checkbox" class="row-checkbox" value="{{ $item->id }}" style="width: 18px; height: 18px;">
                        </td>
                        <td class="text-center">{{ $loop->iteration }}</td>
                        <td class="text-center">{{ $item->np ?? '-' }}</td>
                        <td class="text-left">
                            <span class="nama-clickable" data-toggle="modal" data-target="#detailModal{{ $item->id }}">
                                {{ $item->nama ?? '-' }}
                            </span>
                        </td>
                        <td style="width: 100px; min-width: 100px;">{{ $item->kategori ?? '-' }}</td>
                        <td>{{ $item->awal_kontrak ? $item->awal_kontrak->format('d-m-Y') : '-' }}</td>
                        <td>{{ $item->masa_kerja_format ?? '-' }}</td>
                        <td>{{ $item->kode_bagan ?? '-' }}</td>
                        <td>{{ $item->unit_kerja ?? '-' }}</td>
                        <td>{{ $item->jabatan ?? '-' }}</td>
                        <td>{{ $item->level ?? '-' }}</td>
                        <td class="text-left">{{ $item->role ?? '-' }}</td>
                        <td class="text-center">{{ $item->benefit_kesehatan ?? '-' }}</td>
                        <td>{{ $item->gross_per_month ? 'Rp ' . number_format($item->gross_per_month, 0, ',', '.') : '-' }}</td>
                        <td class="text-center">
                            @if($item->kpi)
                                <a href="{{ $item->kpi }}" target="_blank" class="btn-kpi">{{ $item->nama }}</a>
                            @else
                                <span class="text-muted">-</span>
                            @endif
                        </td>
                        <td class="text-center">
                            <a href="{{ route('karyawan.edit', $item->id) }}" class="btn btn-sm btn-warning">
                                <i class="fas fa-edit"></i>
                            </a>
                            <a href="{{ route('karyawan.terminate.form', $item->id) }}" class="btn btn-sm btn-secondary">
                                <i class="fas fa-user-slash"></i>
                            </a>
                            <button type="button" class="btn btn-sm btn-danger" onclick="confirmDelete({{ $item->id }})">
                                <i class="fas fa-trash"></i>
                            </button>
                            <form id="delete-form-{{ $item->id }}" action="{{ route('karyawan.destroy', $item->id) }}" method="POST" style="display: none;">
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

@foreach ($karyawan as $item)
<div class="modal fade" id="detailModal{{ $item->id }}" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header modal-header-custom">
                <h6 class="modal-title mb-0">Detail Karyawan</h6>
                <button type="button" class="close text-white" data-dismiss="modal">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>

            <div class="modal-body">
                <div class="row g-3">
                    <div class="col-12 text-center">
                        <div class="bg-light p-3 rounded">
                            <small class="text-muted d-block mb-2">Foto Karyawan</small>
                            @if ($item->foto)
                            <img src="{{ url('foto_karyawan/'.$item->foto) }}" alt="Foto {{ $item->nama }}" class="img-thumbnail" style="max-width: 200px; max-height: 200px; object-fit: cover;">
                            @else
                            <div class="text-muted">
                                <i class="fas fa-user-circle fa-5x"></i>
                                <p class="mt-2 mb-0">Tidak ada foto</p>
                            </div>
                            @endif
                        </div>
                    </div>

                    <div class="col-6">
                        <div class="bg-light p-3 rounded">
                            <small class="text-muted d-block mb-1">Nama</small>
                            <strong class="fs-5">{{ $item->nama }}</strong>
                        </div>
                    </div>

                    <div class="col-6">
                        <div class="bg-light p-3 rounded">
                            <small class="text-muted d-block">NP</small>
                            <strong class="fs-5">{{ $item->np }}</strong>
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="bg-light p-3 rounded">
                            <small class="text-muted d-block">Jabatan</small>
                            <strong class="fs-5">{{ $item->jabatan }}</strong>
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="bg-light p-3 rounded">
                            <small class="text-muted d-block">Unit Kerja</small>
                            <strong class="fs-5">{{ $item->unit_kerja }}</strong>
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="bg-light p-3 rounded">
                            <small class="text-muted d-block">Masa Kerja</small>
                            <strong class="fs-5">{{ $item->masa_kerja_format }}</strong>
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="p-3 rounded bg-light">
                            <div class="d-flex align-items-center">
                                <i class="{{ $item->faskes ? 'text-gray' : 'text-muted' }} fs-4 me-3"></i>
                                <div class="flex-grow-1">
                                    <small class="{{ $item->faskes ? 'text-gray fw-bold' : 'text-muted' }} d-block mb-1">Fasilitas Kesehatan</small>
                                    <strong>{{ $item->faskes ?? 'Tidak ada fasilitas kesehatan' }}</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Tutup</button>
            </div>
        </div>
    </div>
</div>
@endforeach

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
        customClass:{
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
        lengthChange: true,
        info: false,
        dom: '1tp',
        columnDefs: [
            { orderable: false, targets: 0 }
        ],
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

    $('#selectAll').on('change', function() {
        const isChecked = $(this).is(':checked');
        $('.row-checkbox:visible').prop('checked', isChecked);
        updateDeleteButton();
    });

    $(document).on('change', '.row-checkbox', function() {
        updateDeleteButton();
        const totalVisible = $('.row-checkbox:visible').length;
        const totalChecked = $('.row-checkbox:visible:checked').length;
        $('#selectAll').prop('checked', totalVisible === totalChecked && totalVisible > 0);
    });

    function updateDeleteButton() {
        const selectedCount = $('.row-checkbox:checked').length;
        $('#selectedCount').text(selectedCount);
        if (selectedCount > 0) {
            $('#deleteSelectedBtn').show();
        } else {
            $('#deleteSelectedBtn').hide();
        }
    }

    $('#deleteSelectedBtn').on('click', function() {
        const selectedIds = [];
        $('.row-checkbox:checked').each(function() {
            selectedIds.push($(this).val());
        });

        if (selectedIds.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Tidak ada data yang dipilih!',
                customClass: {
                    title: 'swal-title-kecil',
                    htmlContainer: 'swal-text-kecil',
                    confirmButton: 'swal-confirm-kecil'
                }
            });
            return;
        }

        Swal.fire({
            title: 'Yakin ingin menghapus?',
            text: `${selectedIds.length} Data karyawan beserta semua data terkait (kontrak, data diri, monitoring) akan dihapus permanen!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, Hapus Semua!',
            cancelButtonText: 'Batal',
            customClass: {
                title: 'swal-title-kecil',
                htmlContainer: 'swal-text-kecil',
                confirmButton: 'swal-confirm-kecil',
                cancelButton: 'swal-cancel-kecil'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const btn = $('#deleteSelectedBtn');
                const originalHtml = btn.html();
                btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Menghapus...');

                $.ajax({
                    url: '{{ route("karyawan.bulkDelete") }}',
                    method: 'POST',
                    data: {
                        _token: '{{ csrf_token() }}',
                        ids: selectedIds
                    },
                    success: function(response) {
                        if (response.success) {
                            Swal.fire({
                                icon: 'success',
                                title: 'Berhasil!',
                                text: `${response.deleted} data berhasil dihapus!`,
                                customClass: {
                                    title: 'swal-title-kecil',
                                    htmlContainer: 'swal-text-kecil',
                                    confirmButton: 'swal-confirm-kecil'
                                }
                            }).then(() => {
                                location.reload();
                            });
                        } else {
                            Swal.fire({
                                icon: 'error',
                                title: 'Gagal!',
                                text: response.message || 'Terjadi kesalahan',
                                customClass: {
                                    title: 'swal-title-kecil',
                                    htmlContainer: 'swal-text-kecil',
                                    confirmButton: 'swal-confirm-kecil'
                                }
                            });
                            btn.prop('disabled', false).html(originalHtml);
                        }
                    },
                    error: function(xhr) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error!',
                            text: 'Terjadi kesalahan saat menghapus data.',
                            customClass: {
                                title: 'swal-title-kecil',
                                htmlContainer: 'swal-text-kecil',
                                confirmButton: 'swal-confirm-kecil'
                            }
                        });
                        btn.prop('disabled', false).html(originalHtml);
                    }
                });
            }
        });
    });

    document.getElementById('fileImport').addEventListener('change', function(e) {
        const file = e.target.files[0];
        
        if (file) {
            const maxSize = 2 * 1024 * 1024;
            
            if (file.size > maxSize) {
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
                e.target.value = '';
                return;
            }
            
            const allowedTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
                                  'application/vnd.ms-excel', 
                                  'text/csv'];
            
            if (!allowedTypes.includes(file.type)) {
                Swal.fire({
                    icon: 'error',
                    title: 'Format File Salah',
                    text: 'Hanya file Excel (.xlsx, .xls) atau CSV yang diperbolehkan',
                    customClass: {
                        title: 'swal-title-kecil',
                        htmlContainer: 'swal-text-kecil',
                        confirmButton: 'swal-confirm-kecil'
                    }
                });
                e.target.value = '';
                return;
            }
            
            Swal.fire({
                title: 'Import File?',
                text: `File: ${file.name}`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Ya, Import!',
                cancelButtonText: 'Batal',
                customClass: {
                    title: 'swal-title-kecil',
                    htmlContainer: 'swal-text-kecil',
                    confirmButton: 'swal-confirm-kecil',
                    cancelButton: 'swal-cancel-kecil'
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    Swal.fire({
                        title: 'Mengimport...',
                        text: 'Mohon tunggu sebentar',
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        didOpen: () => {
                            Swal.showLoading();
                        }
                    });
                    document.getElementById('importForm').submit();
                } else {
                    e.target.value = '';
                }
            });
        }
    });
});
</script>
@endpush
@endsection