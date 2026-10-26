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
        <?php $__currentLoopData = $karyawan; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $item): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
        <tr>
            <td><?php echo e($loop->iteration); ?></td>
            <td class="text-left">
                <span> <?php echo e($item->np); ?> </span></td>
            <td class="text-left">
                <span> <?php echo e($item->nama); ?> </span></td>
            <td class="text-center">
                <span class="badge badge-info"><?php echo e($item->kategori); ?></span></td>  
            <td><?php echo e($item->masa_kerja_format); ?></td>
            <td><?php echo e($item->awal_kontrak ? $item->awal_kontrak->format('d-m-Y') : '-'); ?></td> 
            <td><?php echo e($item->akhir_kontrak ? $item->akhir_kontrak->format('d-m-Y') : '-'); ?></td>
            <td><?php echo e($item->kode_bagan); ?></td>  
            <td><?php echo e($item->unit_kerja); ?></td> 
            <td class="text-left">
                <span><?php echo e($item->jabatan); ?></span></td> 
            <td><?php echo e($item->level); ?></td> 
            <td><?php echo e($item->role); ?></td> 
            <td class="text-center">
                <span><?php echo e($item->benefit_kesehatan); ?> </span></td> 
            <td><?php echo e('Rp ' . number_format($item->gross_per_month, 0, ',', '.')); ?></td> 
            <td><?php echo e($item->kpi); ?></td>
        </tr>
        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
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
</style><?php /**PATH C:\laragon\www\sdmsproject\resources\views/admin/karyawan/pdf.blade.php ENDPATH**/ ?>