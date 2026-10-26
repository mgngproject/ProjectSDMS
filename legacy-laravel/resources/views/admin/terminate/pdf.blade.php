<h1 align = "center"> Data Terminate Karyawan </h1>
<table width="100%">
    <thead>
    <tr class="text-center">
                        <th>No</th>
                        <th>NP</th>
                        <th>Nama</th>
                        <th>Kategori</th>
                        <th>Masa Kerja</th>
                        <th>Awal Kontrak</th>
                        <th>Akhir Kontrak</th>
                        <th>Kode Bagan</th>
                        <th>Unit Kerja</th>
                        <th>Jabatan</th>
                        <th>Level</th>
                        <th>Role</th>
                        <th>Tanggal Keluar</th>
                        <th>Alasan Keluar</th>
                    </tr>
    </thead>
    <tbody>
        @foreach ($karyawan as $item)
                    <tr>
                        <td class="text-center">{{ $loop->iteration }}</td>
                       <td class="text-left">
                            <span> {{ $item->np }} </span></td>
                         <td class="text-left">
                            <span> {{ $item->nama }} </span></td>
                       <td class="text-center">
                            <span class="badge badge-info">{{ $item->kategori }}</span></td>
                        <td>{{ $item->masa_kerja }}</td>
                        <td>{{ $item->awal_kontrak ? $item->awal_kontrak->format('d-m-Y') : '-' }}</td> 
                        <td>{{ $item->akhir_kontrak ? $item->akhir_kontrak->format('d-m-Y') : '-' }}</td>
                        <td>{{ $item->kode_bagan }}</td>
                        <td>{{ $item->unit_kerja }}</td>
                        <td class="text-left">
                            <span>{{ $item->jabatan }}</span></td> 
                        <td>{{ $item->level }}</td>
                        <td>{{ $item->role }}</td>
                        <td>{{ $item->tanggal_keluar ? $item->tanggal_keluar->format('d-m-Y') : '-' }}</td>
                        <td>{{ $item->alasan_keluar }}</td>
        </tr>
        @endforeach
    </tbody>
</table>

<style>
    table {
        border-collapse: collapse;
        width: 100%;
    }
    
    table, th, td {
        border: 1px solid black;
    }
    
    th, td {
        padding: 8px;
        text-align: center;
    }
    
    th {
        background-color: #f2f2f2;
        font-weight: bold;
    }
    
    .text-left {
        text-align: left;
    }
    
    .text-center {
        text-align: center;
    }
</style>