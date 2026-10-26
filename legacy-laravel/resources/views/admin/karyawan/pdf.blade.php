<h1 align = "center"> Data Karyawan </h1>
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
        <th>Benefit Kesehatan</th>
        <th>Gross per Month</th>
        <th>KPI</th>
    </tr>
    </thead>
    <tbody>
        @foreach ($karyawan as $item)
        <tr>
            <td>{{ $loop->iteration}}</td>
            <td class="text-left">
                <span> {{ $item->np }} </span></td>
            <td class="text-left">
                <span> {{ $item->nama }} </span></td>
            <td class="text-center">
                <span class="badge badge-info">{{ $item->kategori }}</span></td>  
            <td>{{ $item->masa_kerja_format }}</td>
            <td>{{ $item->awal_kontrak ? $item->awal_kontrak->format('d-m-Y') : '-' }}</td> 
            <td>{{ $item->akhir_kontrak ? $item->akhir_kontrak->format('d-m-Y') : '-' }}</td>
            <td>{{ $item->kode_bagan }}</td>  
            <td>{{ $item->unit_kerja }}</td> 
            <td class="text-left">
                <span>{{ $item->jabatan }}</span></td> 
            <td>{{ $item->level }}</td> 
            <td>{{ $item->role }}</td> 
            <td class="text-center">
                <span>{{ $item->benefit_kesehatan }} </span></td> 
            <td>{{ 'Rp ' . number_format($item->gross_per_month, 0, ',', '.') }}</td> 
            <td>{{ $item->kpi }}</td>
        </tr>
        @endforeach
    </tbody>
</table>

<style>
    * { font-size: 10px; }
    h1 { font-size: 11px; text-align: center; }
    
    table {
        border-collapse: collapse;
        width: 100%;
        table-layout: fixed;
    }
    
    table, th, td {
        border: 1px solid black;
    }
    
    th, td {
        padding: 2px 3px;
        text-align: center;
        word-wrap: break-word;
        overflow-wrap: break-word;
    }
    
    th {
        background-color: #f2f2f2;
        font-weight: bold;
    }
    
    .text-left { text-align: left; }
    .text-center { text-align: center; }
</style>