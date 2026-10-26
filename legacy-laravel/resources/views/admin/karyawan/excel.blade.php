<table>
    <thead>
    <tr class="text-center">
        <th>No</th>
        <th>NP</th>
        <th>Nama</th>
        <th>Kategori</th>
        <th>Masa Kerja</th>
        <th>Awal Kontrak Masuk</th>
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
                <span> {{ $item->benefit_kesehatan }} </span></td> 
            <td>{{ 'Rp ' . number_format($item->gross_per_month, 0, ',', '.') }}</td> 
            <td>{{ $item->kpi }}</td>
        </tr>
        @endforeach
    </tbody>
</table>