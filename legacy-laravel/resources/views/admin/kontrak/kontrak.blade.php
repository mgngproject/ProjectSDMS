@extends('layouts.app')

@section('content')

<link href="{{ asset('landing/landing/assets/css/kontrak.css') }}" rel="stylesheet">

<div class="container-fluid">
    <div class="page-header-simple">
        <div class="d-flex justify-content-between align-items-center">
            <h1 class="h4 mb-4 text-gray-800">
                <i class="fas fa-user-plus mr-2"></i>
                {{ $title }}
            </h1>
            <a href="{{ route('karyawan') }}" class="btn-back">
                <i class="fas fa-arrow-left"></i> Kembali
            </a>
        </div>
    </div>

    <div class="karyawan-info">
        <div class="row">
            <div class="col-md-3">
                <h6 class="mb-1">Nama Karyawan</h6>
                <h4 class="mb-0"><strong>{{ $karyawan->nama }}</strong></h4>
            </div>
            <div class="col-md-3">
                <h6 class="mb-1">Kontrak Aktif</h6>
                <h5 class="mb-0"><strong>
                    @if($karyawan->kontrakAktif)
                        {{ $karyawan->kontrakAktif->awal_kontrak?->format('d/m/Y') }} -
                        {{ $karyawan->kontrakAktif->akhir_kontrak?->format('d/m/Y') }}
                    @else
                        <span class="text-muted">Tidak ada kontrak aktif</span>
                    @endif
                </strong></h5>
            </div>
            <div class="col-md-3">
                <h6 class="mb-1">Total Kontrak</h6>
                <h4 class="mb-0"><strong>{{ $kontrak->count() }} Kontrak</strong></h4>
            </div>
            <div class="col-md-3">
                <h6 class="mb-1">Status</h6>
                <h5 class="mb-0">
                    @if($kontrak->where('status', 'aktif')->count() > 0)
                        <span class="badge badge-success">Ada Kontrak Aktif</span>
                    @else
                        <span class="badge badge-secondary">Tidak Ada Kontrak Aktif</span>
                    @endif
                </h5>
            </div>
        </div>
    </div>

    @if(session('success'))
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            <i class="fas fa-check-circle"></i> {{ session('success') }}
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
    @endif

    
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
                    @forelse($kontrak as $item)
                    <tr>
                        <td><strong>{{ $item->kontrak_ke }}</strong></td>
                        <td>{{ $item->np ?? '-' }}</td>
                        <td>
                            {{ $item->awal_kontrak?->format('d/m/Y') }} &ndash;
                            {{ $item->akhir_kontrak?->format('d/m/Y') }}
                        </td>
                        <td>{{ $item->penilaian ?? '-' }}</td>
                        <td>
                            @if($item->folder_link)
                                <a href="{{ $item->folder_link }}" target="_blank" class="btn-drive">
                                    <i class="fab fa-google-drive"></i> Buka Folder
                                </a>
                            @else
                                <span class="text-muted">-</span>
                            @endif
                        </td>
                        <td>
                            @if($item->status == 'aktif')
                                <span class="badge badge-success">Aktif</span>
                            @else
                                <span class="badge badge-secondary">Selesai</span>
                            @endif
                        </td>
                        <td>
                            <a href="{{ route('kontrak.edit', $item->id) }}" class="btn-edit-custom">
                                <i class="fas fa-edit"></i> Edit
                            </a>
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="7" class="text-center py-4 text-muted">
                            <i class="fas fa-inbox fa-2x mb-2 d-block"></i>
                            Karyawan <strong>{{ $karyawan->nama }}</strong> belum memiliki riwayat kontrak
                        </td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</div>
</div>

<a href="{{ route('karyawan.kontrak.create', $karyawan->id) }}" class="add-button" title="Tambah Kontrak Baru">
    <i class="fas fa-plus"></i>
</a>

@endsection