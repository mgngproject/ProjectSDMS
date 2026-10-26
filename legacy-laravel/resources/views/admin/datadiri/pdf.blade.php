<h1 align = "center"> Data Diri Karyawan </h1>
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
        <td class="text-left"><span>{{ $item->karyawan->nama ?? '-' }}</span></td>
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