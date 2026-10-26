

<?php $__env->startSection('content'); ?>

<link href="<?php echo e(asset('landing/landing/assets/css/dashboard.css')); ?>" rel="stylesheet">

<div class="d-flex justify-content-between align-items-center mb-3">
    <h1 class="h4 mb-0 text-gray-800">
        <i class="fas fa-tachometer-alt mr-2"></i>
        <?php echo e($title); ?>

    </h1>
    <div class="d-flex align-items-center">
        <div class="dropdown mr-2">
            <button type="button" class="btn btn-sm btn-outline dropdown-toggle" id="monthPickerBtn" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style="min-width: 150px;">
                <i class="fas fa-calendar-alt mr-1"></i> <?php echo e($bulan_nama); ?>

            </button>
            <div class="dropdown-menu p-3 shadow" aria-labelledby="monthPickerBtn" style="min-width: 300px;">
                <div class="d-flex align-items-center justify-content-between mb-3">
                    <button type="button" id="prevYear" class="btn btn-sm btn-outline-secondary">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <span id="selectedYear" class="font-weight-bold"></span>
                    <button type="button" id="nextYear" class="btn btn-sm btn-outline-secondary">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
                <div class="row no-gutters">
                    <?php $__currentLoopData = ['1'=>'Jan','2'=>'Feb','3'=>'Mar','4'=>'Apr','5'=>'Mei','6'=>'Jun','7'=>'Jul','8'=>'Agu','9'=>'Sep','10'=>'Okt','11'=>'Nov','12'=>'Des']; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $num => $nama): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <div class="col-3 p-1">
                            <button class="btn btn-sm btn-outline-primary w-100 month-btn" data-month="<?php echo e($num); ?>" style="font-size: 12px; padding: 8px 4px;">
                                <?php echo e($nama); ?>

                            </button>
                        </div>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                </div>
            </div>
        </div>
        <?php if(auth()->user()->isSuperAdmin()): ?>
        <form action="<?php echo e(route('dashboard')); ?>" method="GET" class="d-inline">
            <input type="hidden" name="bulan" value="<?php echo e($bulan_selected); ?>">
            <input type="hidden" name="tahun_chart_masuk" value="<?php echo e($tahun_chart_masuk); ?>">
            <input type="hidden" name="tahun_chart_habis" value="<?php echo e($tahun_chart_habis); ?>">
            <select class="form-control form-control-sm filterKategori" name="filter_kategori" onchange="this.form.submit()">
                <option value="">Semua Kategori</option>
                <?php $__currentLoopData = $daftar_kategori; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $kat): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                    <option value="<?php echo e($kat); ?>" <?php echo e($filter_kategori == $kat ? 'selected' : ''); ?>><?php echo e($kat); ?></option>
                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
            </select>
        </form>
        <?php endif; ?>
    </div>
</div>

<div class="row">
    <div class="col-12 mb-3">
        <div class="card custom-shadow dashboard-card">
            <div class="card-body py-3 content-layer">
                <div class="d-flex align-items-center">
                    <div class="mr-3 icon-wrap">
                        <i class="fas fa-users"></i>
                    </div>
                    <div>
                        <h4 class="mb-1 font-weight-bold text-dark">Welcome!</h4>
                        <p class="mb-0 text-dark-50">Selamat datang kembali di dashboard Manajemen Karyawan</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-xl-3 col-md-6 mb-3">
        <div class="card card-custom icon-bg custom-shadow h-100 py-2 stat-card accent-darkpurple">
            <div class="card-body">
                <div class="row no-gutters align-items-center">
                    <div class="col mr-2">
                        <div class="mb-2">Total Karyawan Aktif</div>
                        <div class="h5 mb-0 font-weight-bold text-gray-800"><?php echo e(number_format($total_karyawan_aktif)); ?></div>
                    </div>
                    <div class="col-auto">
                        <i class="fas fa-user fa-2x" style="color: white;"></i>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="col-xl-3 col-md-6 mb-3">
        <div class="card card-custom icon-bg custom-shadow h-100 py-2 stat-card accent-semidark">
            <div class="card-body">
                <div class="row no-gutters align-items-center">
                    <div class="col mr-2">
                        <div class="mb-2">Total Karyawan Masuk</div>
                        <div class="h5 mb-0 font-weight-bold text-gray-800"><?php echo e(number_format($karyawan_masuk)); ?></div>
                    </div>
                    <div class="col-auto">
                        <i class="fas fa-user fa-2x" style="color: white;"></i>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="col-xl-3 col-md-6 mb-3">
        <div class="card card-custom icon-bg custom-shadow h-100 py-2 stat-card accent-semilight">
            <div class="card-body">
                <div class="row no-gutters align-items-center">
                    <div class="col mr-2">
                        <div class="mb-2">Total Karyawan Habis Kontrak</div>
                        <div class="h5 mb-0 font-weight-bold text-gray-800"><?php echo e(number_format($karyawan_habis)); ?></div>
                    </div>
                    <div class="col-auto">
                        <i class="fas fa-user-slash fa-2x" style="color: white;"></i>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="col-xl-3 col-md-6 mb-3">
        <div class="card card-custom icon-bg custom-shadow h-100 py-2 stat-card accent-lightpurple">
            <div class="card-body">
                <div class="row no-gutters align-items-center">
                    <div class="col mr-2">
                        <div class="mb-2">Berkas Belum Lengkap</div>
                        <div class="h5 mb-0 font-weight-bold text-gray-800"><?php echo e(number_format($berkas_belum_lengkap)); ?></div>
                    </div>
                    <div class="col-auto">
                        <i class="fas fa-file fa-2x" style="color: white;"></i>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<?php if(auth()->user()->isSuperAdmin() && !$filter_kategori): ?>
<div class="row">
    <div class="col-xl-4 col-md-6 mb-2">
        <div class="card custom-shadow" style="height: 250px;">
            <div class="card-header py-1">
                <div class="mb-0 small font-weight-bold">Jenjang Pendidikan</div>
            </div>
            <div class="card-body p-2 d-flex flex-column align-items-center justify-content-center">
                <div style="width: 140px; height: 140px; position: relative;">
                    <canvas id="chartPendidikan"></canvas>
                </div>
                <div class="d-flex mt-2 flex-wrap justify-content-center">
                    <div class="mr-3 d-flex align-items-center">
                        <span class="legend-dot legend-dot-s2"></span>
                        <small class="legend-label">S2</small>
                    </div>
                    <div class="mr-3 d-flex align-items-center">
                        <span class="legend-dot legend-dot-s1"></span>
                        <small class="legend-label">S1</small>
                    </div>
                    <div class="d-flex align-items-center">
                        <span class="legend-dot legend-dot-lainnya"></span>
                        <small class="legend-label">Lainnya</small>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="col-xl-4 col-md-6 mb-2">
        <div class="card custom-shadow" style="height: 250px;">
            <div class="card-header py-1">
                <div class="mb-0 small font-weight-bold">Karyawan Aktif per Kategori</div>
            </div>
            <div class="card-body p-2 d-flex align-items-center justify-content-center">
                <div style="position: relative; height: 150px; width: 100%;">
                    <canvas id="chartKategori"></canvas>
                </div>
            </div>
        </div>
    </div>

    <div class="col-xl-4 col-md-6 mb-2">
        <div class="card custom-shadow" style="height: 250px;">
            <div class="card-header py-1 d-flex justify-content-between align-items-center">
                <div class="mb-0 small font-weight-bold">Kontrak akan berakhir</div>
                <a href="<?php echo e(route('monitoring')); ?>" class="text-primary" style="font-size: 10px;">Lihat Semua</a>
            </div>
            <div class="card-body p-2">
                <p class="text-muted mb-1" style="font-size: 9px;">Terakhir di update pada <?php echo e(now()->format('d F Y')); ?></p>
                <?php if($kontrak_habis->count() > 0): ?>
                    <div class="table-responsive" style="max-height: 170px; overflow-y: auto;">
                        <table class="table table-custom table-sm table-hover mb-0" style="font-size: 10px;">
                            <thead>
                                <tr>
                                    <th>Nama</th>
                                    <th>Jabatan</th>
                                    <th>Waktu</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php $__currentLoopData = $kontrak_habis; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $k): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                    <?php $sisaHari = (int) \Carbon\Carbon::now()->diffInDays(\Carbon\Carbon::parse($k->akhir_kontrak), false); ?>
                                    <tr>
                                        <td><?php echo e($k->nama); ?></td>
                                        <td><?php echo e($k->jabatan); ?></td>
                                        <td>
                                            <span class="badge <?php echo e($sisaHari <= 15 ? 'bg-danger text-white' : 'bg-warning text-dark'); ?>" style="font-size: 9px;">
                                                <?php echo e($sisaHari); ?> hari
                                            </span>
                                        </td>
                                    </tr>
                                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                            </tbody>
                        </table>
                    </div>
                <?php else: ?>
                    <div class="text-center py-2 text-muted">
                        <p class="mb-0 small">Tidak ada kontrak yang berakhir dalam 2 bulan</p>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-xl-6 col-md-6 mb-2">
        <div class="card custom-shadow" style="height: 250px;">
            <div class="card-header py-1">
                <div class="mb-0 small font-weight-bold">Top 10 Kampus</div>
            </div>
            <div class="card-body p-2">
                <div style="position: relative; height: 170px;">
                    <canvas id="ChartTop10Kampus"></canvas>
                </div>
            </div>
        </div>
    </div>

    <div class="col-xl-6 col-md-6 mb-4">
        <div class="card custom-shadow" style="height: 250px;">
            <div class="card-header py-1 d-flex justify-content-between align-items-center">
                <div class="mb-0 small font-weight-bold">Karyawan Habis Kontrak</div>
                <form action="<?php echo e(route('dashboard')); ?>" method="GET" class="d-inline">
                    <input type="hidden" name="bulan" value="<?php echo e($bulan_selected); ?>">
                    <input type="hidden" name="tahun_chart_masuk" value="<?php echo e($tahun_chart_masuk); ?>">
                    <select class="form-control form-control-sm" style="width: 80px; font-size: 10px;" name="tahun_chart_habis" onchange="this.form.submit()">
                        <?php for($y = 2028; $y >= 2024; $y--): ?>
                            <option value="<?php echo e($y); ?>" <?php echo e($tahun_chart_habis == $y ? 'selected' : ''); ?>><?php echo e($y); ?></option>
                        <?php endfor; ?>
                    </select>
                </form>
            </div>
            <div class="card-body p-2">
                <div style="position: relative; height: 150px;">
                    <canvas id="ChartKaryawanHabis"></canvas>
                </div>
                <div class="text-center" style="margin-top: 6px;">
                    <div class="text-muted" style="font-size: 9px; line-height: 1.2;">Total karyawan habis kontrak (<?php echo e($tahun_chart_habis); ?>)</div>
                    <div style="font-size: 10px; font-weight: 600; color: #408fdf; line-height: 1.3;"><?php echo e(number_format($total_karyawan_habis_chart)); ?> Orang</div>
                </div>
            </div>
        </div>
    </div>
</div>

<?php else: ?>

<div class="row">
    <div class="col-xl-3 col-md-6 mb-4">
        <div class="card custom-shadow" style="height: 330px;">
            <div class="card-header py-1 d-flex justify-content-between align-items-center">
                <div class="mb-0 small font-weight-bold">Karyawan Habis Kontrak</div>
                <form action="<?php echo e(route('dashboard')); ?>" method="GET" class="d-inline">
                    <input type="hidden" name="bulan" value="<?php echo e($bulan_selected); ?>">
                    <input type="hidden" name="tahun_chart_masuk" value="<?php echo e($tahun_chart_masuk); ?>">
                    <select class="form-control form-control-sm" style="width: 80px; font-size: 10px;" name="tahun_chart_habis" onchange="this.form.submit()">
                        <?php for($y = 2028; $y >= 2024; $y--): ?>
                            <option value="<?php echo e($y); ?>" <?php echo e($tahun_chart_habis == $y ? 'selected' : ''); ?>><?php echo e($y); ?></option>
                        <?php endfor; ?>
                    </select>
                </form>
            </div>
            <div class="card-body p-2">
                <div style="position: relative; height: 220px;">
                    <canvas id="ChartKaryawanHabis"></canvas>
                </div>
                <div class="text-center" style="margin-top: 6px;">
                    <div class="text-muted" style="font-size: 9px; line-height: 1.2;">Total karyawan habis kontrak (<?php echo e($tahun_chart_habis); ?>)</div>
                    <div style="font-size: 10px; font-weight: 600; color: #408fdf; line-height: 1.3;"><?php echo e(number_format($total_karyawan_habis_chart)); ?> Orang</div>
                </div>
            </div>
        </div>
    </div>

    <div class="col-xl-3 col-md-6 mb-2">
        <div class="card custom-shadow" style="height: 330px;">
            <div class="card-header py-1">
                <div class="mb-0 small font-weight-bold">Jenjang Pendidikan</div>
            </div>
            <div class="card-body p-2 d-flex flex-column align-items-center justify-content-center">
                <div style="width: 140px; height: 140px; position: relative;">
                    <canvas id="chartPendidikan"></canvas>
                </div>
                <div class="d-flex mt-2 flex-wrap justify-content-center">
                    <div class="mr-3 d-flex align-items-center">
                        <span class="legend-dot legend-dot-s2"></span>
                        <small style="font-size: 10px;">S2</small>
                    </div>
                    <div class="mr-3 d-flex align-items-center">
                        <span class="legend-dot legend-dot-s1"></span>
                        <small style="font-size: 10px;">S1</small>
                    </div>
                    <div class="d-flex align-items-center">
                        <span class="legend-dot legend-dot-lainnya"></span>
                        <small class="legend-label">Lainnya</small>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="col-xl-3 col-md-6 mb-2">
        <div class="card custom-shadow" style="height: 330px;">
            <div class="card-header py-1 d-flex justify-content-between align-items-center">
                <div class="mb-0 small font-weight-bold">Kontrak akan berakhir</div>
                <a href="<?php echo e(route('monitoring')); ?>" class="text-primary" style="font-size: 10px;">Lihat Semua</a>
            </div>
            <div class="card-body p-2">
                <p class="text-muted mb-1" style="font-size: 9px;">Terakhir di update pada <?php echo e(now()->format('d F Y')); ?></p>
                <?php if($kontrak_habis->count() > 0): ?>
                    <div class="table-responsive" style="max-height: 225px; overflow-y: auto;">
                        <table class="table table-custom table-sm table-hover mb-0" style="font-size: 10px;">
                            <thead>
                                <tr>
                                    <th>Nama</th>
                                    <th>Jabatan</th>
                                    <th>Waktu</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php $__currentLoopData = $kontrak_habis; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $k): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                    <?php $sisaHari = (int) \Carbon\Carbon::now()->diffInDays(\Carbon\Carbon::parse($k->akhir_kontrak), false); ?>
                                    <tr>
                                        <td><?php echo e($k->nama); ?></td>
                                        <td><?php echo e($k->jabatan); ?></td>
                                        <td>
                                            <span class="badge <?php echo e($sisaHari <= 15 ? 'bg-danger text-white' : 'bg-warning text-dark'); ?>" style="font-size: 9px;">
                                                <?php echo e($sisaHari); ?> hari
                                            </span>
                                        </td>
                                    </tr>
                                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                            </tbody>
                        </table>
                    </div>
                <?php else: ?>
                    <div class="text-center py-2 text-muted">
                        <p class="mb-0 small">Tidak ada kontrak yang berakhir dalam 2 bulan</p>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>

    <div class="col-xl-3 col-md-6 mb-2">
        <div class="card custom-shadow" style="height: 330px;">
            <div class="card-header py-1">
                <div class="mb-0 small font-weight-bold">Top 10 Kampus PTN</div>
            </div>
            <div class="card-body p-2">
                <div style="position: relative; height: 240px;">
                    <canvas id="ChartTop10Kampus"></canvas>
                </div>
            </div>
        </div>
    </div>
</div>

<?php endif; ?>

<?php $__env->stopSection(); ?>

<?php $__env->startPush('scripts'); ?>
<script>
Chart.defaults.global.defaultFontFamily = "'Arial', sans-serif";
Chart.defaults.global.defaultFontStyle = 'normal';
Chart.defaults.global.defaultFontSize = 10;

document.addEventListener('DOMContentLoaded', function () {
    let currentYear = <?php echo e(Carbon\Carbon::parse($bulan_selected)->year); ?>;
    const selectedYearEl = document.getElementById('selectedYear');
    const monthButtons = document.querySelectorAll('.month-btn');

    function updateYear() {
        if (selectedYearEl) selectedYearEl.textContent = currentYear;
    }

    updateYear();

    $('#monthPickerBtn').on('click', function () {
        updateYear();
    });

    const prevYearBtn = document.getElementById('prevYear');
    const nextYearBtn = document.getElementById('nextYear');

    if (prevYearBtn) prevYearBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        currentYear--;
        updateYear();
    });

    if (nextYearBtn) nextYearBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        currentYear++;
        updateYear();
    });

    monthButtons.forEach(button => {
        button.addEventListener('click', function () {
            const month = this.dataset.month.padStart(2, '0');
            window.location.href = "<?php echo e(route('dashboard')); ?>?bulan=" + currentYear + '-' + month + '&filter_kategori=<?php echo e($filter_kategori); ?>';
        });
    });

    const currentMonth = "<?php echo e(Carbon\Carbon::parse($bulan_selected)->format('n')); ?>";
    const currentYearSelected = "<?php echo e(Carbon\Carbon::parse($bulan_selected)->year); ?>";

    if (currentYear == currentYearSelected) {
        monthButtons.forEach(button => {
            if (button.dataset.month == currentMonth) {
                button.classList.remove('btn-outline-primary');
                button.classList.add('btn-primary');
            }
        });
    }
});

new Chart(document.getElementById('ChartKaryawanHabis'), {
    type: 'line',
    data: {
        labels: ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'],
        datasets: [{
            label: 'Karyawan Habis Kontrak',
            data: <?php echo $chart_karyawan_habis; ?>,
            borderColor: 'rgb(123, 152, 255)',
            backgroundColor: 'rgb(255, 255, 255)',
            fill: true,
            borderWidth: 1.2,
            tension: 0,
            pointRadius: 2,
            pointHoverRadius: 3,
            pointBackgroundColor: '#fff',
            pointBorderWidth: 1
        }]
    },
    options: {
        maintainAspectRatio: false,
        responsive: true,
        legend: { display: false },
        plugins: { datalabels: { display: false } },
        scales: {
            yAxes: [{ ticks: { beginAtZero: true, precision: 0, callback: v => v === 0 ? '' : v } }]
        }
    }
});

new Chart(document.getElementById('chartPendidikan'), {
    type: 'pie',
    data: {
        labels: <?php echo $chart_pendidikan; ?>.labels,
        datasets: [{
            data: <?php echo $chart_pendidikan; ?>.data,
            backgroundColor: ['rgb(233, 122, 252)', 'rgb(97, 112, 253)', 'rgb(75, 192, 192)'],
            borderWidth: 0,
            borderColor: 'transparent'
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        legend: { display: false },
        plugins: {
            datalabels: {
                color: '#fff',
                font: { weight: 'bold', size: 9 },
                formatter: (value, ctx) => {
                    if (value === 0) return '';
                    let sum = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                    return (value * 100 / sum).toFixed(0) + '%';
                }
            }
        },
        rotation: -0.5 * Math.PI
    }
});

new Chart(document.getElementById('ChartTop10Kampus'), {
    type: 'bar',
    data: {
        labels: <?php echo $chart_top10_kampus; ?>.labels,
        datasets: [
            {
                label: 'S1',
                data: <?php echo $chart_top10_kampus; ?>.data_s1,
                backgroundColor: 'rgb(97, 112, 253)',
                borderColor: 'rgb(75, 90, 230)',
                borderWidth: 1,
                borderRadius: 4
            },
            {
                label: 'S2',
                data: <?php echo $chart_top10_kampus; ?>.data_s2,
                backgroundColor: 'rgb(233, 122, 252)',
                borderColor: 'rgb(210, 100, 230)',
                borderWidth: 1,
                borderRadius: 4
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
            display: true,
            position: 'bottom',
            labels: { fontSize: 9, boxWidth: 8, usePointStyle: true }
        },
        plugins: { datalabels: { display: false } },
        scales: {
            yAxes: [{ stacked: true, ticks: { beginAtZero: true, precision: 0, callback: v => v === 0 ? '' : v } }],
            xAxes: [{ stacked: true, ticks: { autoSkip: false, maxRotation: 45, minRotation: 45, fontSize: 9 } }]
        }
    }
});

<?php if(auth()->user()->isSuperAdmin() && !$filter_kategori): ?>
new Chart(document.getElementById('chartKategori'), {
    type: 'doughnut',
    data: {
        labels: <?php echo $chart_kategori; ?>.labels,
        datasets: [{
            data: <?php echo $chart_kategori; ?>.data,
            backgroundColor: [
                'rgb(75,192,192)', 'rgb(233,122,252)', 'rgb(255,159,64)',
                'rgb(97,112,253)', 'rgb(255,99,132)', 'rgb(54,162,235)'
            ].slice(0, <?php echo $chart_kategori; ?>.labels.length),
            borderWidth: 0
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
            display: true,
            position: 'right',
            labels: { fontSize: 9, boxWidth: 8, usePointStyle: true }
        },
        plugins: {
            datalabels: {
                color: '#fff',
                font: { weight: 'bold', size: 10 },
                formatter: (value, ctx) => {
                    let sum = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                    return value === 0 ? '' : (value * 100 / sum).toFixed(0) + '%';
                }
            }
        }
    }
});
<?php endif; ?>
</script>
<?php $__env->stopPush(); ?>
<?php echo $__env->make('layouts/app', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\laragon\www\sdmsproject\resources\views/dashboard.blade.php ENDPATH**/ ?>