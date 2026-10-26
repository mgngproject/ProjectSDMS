<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Karyawan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $bulan           = $request->get('bulan', Carbon::now()->format('Y-m'));
        $tahunChartMasuk = $request->get('tahun_chart_masuk', Carbon::now()->year);
        $tahunChartHabis = $request->get('tahun_chart_habis', Carbon::now()->year);

        $carbonBulan = Carbon::parse($bulan);
        $tahun       = $carbonBulan->format('Y');
        $bulanAngka  = $carbonBulan->format('m');
        $bulanNama   = $carbonBulan->locale('id')->isoFormat('MMMM YYYY');
        $bulanPrev   = $carbonBulan->copy()->subMonth()->format('Y-m');
        $bulanNext   = $carbonBulan->copy()->addMonth()->format('Y-m');

        $user           = auth()->user();
        $isSuperAdmin   = $user->isSuperAdmin();
        $namaKategori   = $isSuperAdmin ? null : $user->kategori->nama;
        $daftarKategori = DB::table('karyawans')->distinct()->pluck('kategori')->filter()->values();
        $filterKategori = $isSuperAdmin ? $request->get('filter_kategori', null) : null;

        // Filter Admin
        $baseKaryawan = fn($q) => $q
            ->when(!$isSuperAdmin, fn($q) => $q->where('kategori', $namaKategori))
            ->when($isSuperAdmin && $filterKategori, fn($q) => $q->where('kategori', $filterKategori));

        $pendidikanQuery = DB::table('data_diri_karyawans as d')
            ->join('karyawans as k', 'k.id', '=', 'd.karyawan_id')
            ->when(!$isSuperAdmin, fn($q) => $q->where('kategori', $namaKategori))
            ->when($isSuperAdmin && $filterKategori, fn($q) => $q->where('kategori', $filterKategori))
            ->whereNull('k.tanggal_keluar');

        $s2 = (clone $pendidikanQuery)->where(function ($q) {
            $q->where('d.jenjang_2', 'S2')
              ->orWhere(fn($q2) => $q2->whereNull('d.jenjang_2')->where('d.jenjang_1', 'S2'));
        })->count();

        $s1 = (clone $pendidikanQuery)->where(function ($q) {
            $q->where('d.jenjang_2', 'S1')
              ->orWhere(fn($q2) => $q2->whereNull('d.jenjang_2')->where('d.jenjang_1', 'S1'));
        })->count();

        $lainnya = (clone $pendidikanQuery)->where(function ($q) {
            $q->where(function($q2) {
                $q2->whereNotNull('d.jenjang_2')
                ->whereNotIn('d.jenjang_2', ['S1', 'S2']);
            })->orWhere(function($q2) {
                $q2->whereNull('d.jenjang_2')
                ->whereNotNull('d.jenjang_1')
                ->whereNotIn('d.jenjang_1', ['S1', 'S2']);
            });
        })->count();

        $aktifFilter = fn($q) => $q
            ->where('status', 'aktif')
            ->whereNull('tanggal_keluar')
            ->where(fn($q) => $q->whereDate('akhir_kontrak', '>=', Carbon::today())->orWhereNull('akhir_kontrak'));

        $totalKaryawanAktif = $aktifFilter($baseKaryawan(DB::table('karyawans')))->count();

        $karyawanPerKategori = $aktifFilter($baseKaryawan(DB::table('karyawans')))
            ->select('kategori', DB::raw('count(*) as total'))
            ->groupBy('kategori')
            ->get();

        $karyawanMasuk = $aktifFilter($baseKaryawan(DB::table('karyawans')))
            ->whereYear('awal_kontrak', $tahun)
            ->whereMonth('awal_kontrak', $bulanAngka)
            ->count();

        $chartKaryawanMasuk = [];
        for ($i = 1; $i <= 12; $i++) {
            $chartKaryawanMasuk[] = $aktifFilter($baseKaryawan(DB::table('karyawans')))
                ->whereYear('awal_kontrak', $tahunChartMasuk)
                ->whereMonth('awal_kontrak', $i)
                ->count();
        }

        $isRealTime    = $carbonBulan->lte(Carbon::now()->startOfMonth());
        $karyawanHabis = $isRealTime
            ? $baseKaryawan(DB::table('karyawans'))
                ->where('status', 'aktif')
                ->whereNotNull('akhir_kontrak')
                ->whereYear('akhir_kontrak', $tahun)
                ->whereMonth('akhir_kontrak', $bulanAngka)
                ->whereNull('tanggal_keluar')
                ->count()
            : 0;

        $chartKaryawanHabis = [];
        for ($i = 1; $i <= 12; $i++) {
            $chartKaryawanHabis[] = $baseKaryawan(DB::table('karyawans'))
                ->where('status','aktif')
                ->whereYear('akhir_kontrak', $tahunChartHabis)
                ->whereMonth('akhir_kontrak', $i)
                ->whereNull('tanggal_keluar')
                ->count();
        }

        $berkasBelumLengkap = $baseKaryawan(DB::table('karyawans'))
            ->where('karyawans.status', 'aktif')
            ->leftJoin('monitoring', 'monitoring.karyawan_id', '=', 'karyawans.id')
            ->whereNull('karyawans.tanggal_keluar')
            ->where(fn($q) => $q->whereDate('karyawans.akhir_kontrak', '>=', Carbon::today())->orWhereNull('karyawans.akhir_kontrak'))
            ->where(fn($q) => $q->whereRaw('LOWER(TRIM(monitoring.status)) != ?', ['selesai'])->orWhereNull('monitoring.status'))
            ->count();

        $kontrakHabis = $baseKaryawan(Karyawan::query())
            ->whereNotNull('akhir_kontrak')
            ->whereBetween('akhir_kontrak', [Carbon::today(), Carbon::today()->addDays(60)])
            ->orderBy('akhir_kontrak')
            ->get();

        $top10Alias = [
            'UGM'   => ['UGM', 'Universitas Gadjah Mada', 'Univ Gadjah Mada', 'Univ. Gadjah Mada'],
            'UI'    => ['UI', 'Universitas Indonesia'],
            'UNAIR' => ['UNAIR', 'Universitas Airlangga'],
            'ITB'   => ['ITB', 'Institut Teknologi Bandung'],
            'UNS'   => ['UNS', 'Universitas Sebelas Maret'],
            'IPB'   => ['IPB', 'Institut Pertanian Bogor', 'IPB University'],
            'ITS'   => ['ITS', 'Institut Teknologi Sepuluh Nopember'],
            'UNDIP' => ['UNDIP', 'Universitas Diponegoro'],
            'UNPAD' => ['UNPAD', 'Universitas Padjadjaran', 'Universitas Padjajaran'],
            'UPI'   => ['UPI', 'Universitas Pendidikan Indonesia'],
        ];

        $lookup = [];
        foreach ($top10Alias as $key => $aliases) {
            foreach ($aliases as $alias) {
                $lookup[mb_strtolower(trim($alias))] = $key;
            }
        }

        $rowsKampus = DB::table('data_diri_karyawans as d')
            ->join('karyawans as k', 'k.id', '=', 'd.karyawan_id')
            ->when(!$isSuperAdmin, fn($q) => $q->where('kategori', $namaKategori))
            ->when($isSuperAdmin && $filterKategori, fn($q) => $q->where('kategori', $filterKategori))
            ->whereNull('k.tanggal_keluar')
            ->select('d.kampus_1', 'd.kampus_2', 'd.jenjang_1', 'd.jenjang_2')
            ->get();

        $counts = array_fill_keys(array_keys($top10Alias), ['s1' => 0, 's2' => 0]);

        foreach ($rowsKampus as $row) {
            foreach ([['kampus_1', 'jenjang_1'], ['kampus_2', 'jenjang_2']] as [$kolKampus, $kolJenjang]) {
                if (empty($row->$kolKampus) || empty($row->$kolJenjang)) continue;
                $norm    = preg_replace('/\s+/', ' ', mb_strtolower(trim($row->$kolKampus)));
                $jenjang = strtoupper(trim($row->$kolJenjang));
                if (isset($lookup[$norm]) && in_array($jenjang, ['S1', 'S2'])) {
                    $counts[$lookup[$norm]][$jenjang === 'S1' ? 's1' : 's2']++;
                }
            }
        }

        return view('dashboard', [
            'title'                      => 'Dashboard',
            'menuDashboard'              => 'active',
            'total_karyawan_aktif'       => $totalKaryawanAktif,
            'karyawan_masuk'             => $karyawanMasuk,
            'karyawan_habis'             => $karyawanHabis,
            'bulan_selected'             => $bulan,
            'bulan_nama'                 => $bulanNama,
            'bulan_prev'                 => $bulanPrev,
            'bulan_next'                 => $bulanNext,
            'tahun_chart_masuk'          => $tahunChartMasuk,
            'tahun_chart_habis'          => $tahunChartHabis,
            'chart_karyawan_masuk'       => json_encode($chartKaryawanMasuk),
            'chart_karyawan_habis'       => json_encode($chartKaryawanHabis),
            'kontrak_habis'              => $kontrakHabis,
            'berkas_belum_lengkap'       => $berkasBelumLengkap,
            'total_karyawan_habis_chart' => array_sum($chartKaryawanHabis),
            'chart_pendidikan'           => json_encode(['labels' => ['S2', 'S1', 'Lainnya'],'data' => [$s2, $s1, $lainnya]]),
            'chart_top10_kampus'         => json_encode([
                'labels'  => array_keys($counts),
                'data_s1' => array_column(array_values($counts), 's1'),
                'data_s2' => array_column(array_values($counts), 's2'),
            ]),
            'chart_kategori' => json_encode([
                'labels' => $karyawanPerKategori->pluck('kategori')->toArray(),
                'data'   => $karyawanPerKategori->pluck('total')->toArray(),
            ]),
            'daftar_kategori' => $daftarKategori,
            'filter_kategori' => $filterKategori,
        ]);
    }
}