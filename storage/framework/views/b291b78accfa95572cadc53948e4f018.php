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
                        <th>Tanggal Keluar</th>
                        <th>Alasan Keluar</th>
                    </tr>
    </thead>
    <tbody>
        <?php $__currentLoopData = $karyawan; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $item): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                    <tr>
                        <td class="text-center"><?php echo e($loop->iteration); ?></td>
                       <td class="text-left">
                            <span> <?php echo e($item->np); ?> </span></td>
                         <td class="text-left">
                            <span> <?php echo e($item->nama); ?> </span></td>
                       <td class="text-center">
                            <span class="badge badge-info"><?php echo e($item->kategori); ?></span></td>
                        <td><?php echo e($item->masa_kerja); ?></td>
                        <td><?php echo e($item->awal_kontrak ? $item->awal_kontrak->format('d-m-Y') : '-'); ?></td> 
                        <td><?php echo e($item->akhir_kontrak ? $item->akhir_kontrak->format('d-m-Y') : '-'); ?></td>
                        <td><?php echo e($item->kode_bagan); ?></td>
                        <td><?php echo e($item->unit_kerja); ?></td>
                        <td class="text-left">
                            <span><?php echo e($item->jabatan); ?></span></td> 
                        <td><?php echo e($item->level); ?></td>
                        <td><?php echo e($item->role); ?></td>
                        <td><?php echo e($item->tanggal_keluar ? $item->tanggal_keluar->format('d-m-Y') : '-'); ?></td>
                        <td><?php echo e($item->alasan_keluar); ?></td>
        </tr>
        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
    </tbody>
</table><?php /**PATH C:\laragon\www\sdmsproject\resources\views/admin/terminate/excel.blade.php ENDPATH**/ ?>