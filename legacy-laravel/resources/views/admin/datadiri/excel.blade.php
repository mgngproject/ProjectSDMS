<table>
    <thead>
    <tr class="text-center">
        <th>No</th>
        <th>NP</th>
        <th>Nama</th>
        <th>No KTP</th>
        <th>Tempat Tanggal Lahir</th>
        <th>Alamat</th>
        <th>Jenjang</th>
        <th>Jurusan</th>
        <th>Nama PT</th>
    </tr>
    </thead>
    <tbody>
        @foreach ($datadiri as $item)
        @php
        $pt = $item->pendidikan_terakhir;
    @endphp
        <tr>
            <td>{{ $loop->iteration}}</td>
            <td>{{ $item->karyawan->np ?? '-' }}</td>
            <td>{{ $item->karyawan->nama ?? '-' }}</td>
            <td>{{ $item->ktp }}</td>
            <td>{{ $item->ttl }}</td> 
            <td>{{ $item->alamat ?? '-' }}</td>  
            <td>{{ $pt['jenjang'] }}</td>
            <td>{{ $pt['jurusan'] }}</td>
            <td>{{ $pt['kampus'] }}</td>
        </tr>
        @endforeach
    </tbody>
</table>