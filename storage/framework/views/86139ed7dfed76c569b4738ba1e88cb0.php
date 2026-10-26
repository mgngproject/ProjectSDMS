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
    <?php $__currentLoopData = $datadiri; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $item): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
    <?php
        $pt = $item->pendidikan_terakhir;
    ?>
    <tr>
        <td><?php echo e($loop->iteration); ?></td>
        <td><?php echo e($item->karyawan->np ?? '-'); ?></td>
        <td class="text-left"><span><?php echo e($item->karyawan->nama ?? '-'); ?></span></td>
        <td><?php echo e($item->ktp); ?></td>
        <td><?php echo e($item->ttl); ?></td> 
        <td><?php echo e($item->alamat ?? '-'); ?></td>  
        <td><?php echo e($pt['jenjang']); ?></td>
        <td><?php echo e($pt['jurusan']); ?></td>
        <td><?php echo e($pt['kampus']); ?></td>
    </tr>
    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
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
</style><?php /**PATH C:\laragon\www\sdmsproject\resources\views/admin/datadiri/pdf.blade.php ENDPATH**/ ?>