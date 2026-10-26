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
            <td><?php echo e($item->karyawan->nama ?? '-'); ?></td>
            <td><?php echo e($item->ktp); ?></td>
            <td><?php echo e($item->ttl); ?></td> 
            <td><?php echo e($item->alamat ?? '-'); ?></td>  
            <td><?php echo e($pt['jenjang']); ?></td>
            <td><?php echo e($pt['jurusan']); ?></td>
            <td><?php echo e($pt['kampus']); ?></td>
        </tr>
        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
    </tbody>
</table><?php /**PATH C:\laragon\www\sdmsproject\resources\views/admin/datadiri/excel.blade.php ENDPATH**/ ?>