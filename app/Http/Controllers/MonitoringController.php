<?php

namespace App\Http\Controllers;

use App\Models\Karyawan;
use App\Models\Monitoring;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MonitoringController extends Controller
{
    public function index(Request $request)
    {
        $admin = Auth::user();

        $query = Karyawan::with('monitoring')
        ->when(!$admin->isSuperAdmin(), fn($q) => $q->where('kategori', $admin->kategori->nama))
        ->where('status', 'aktif');

        if ($request->filled('bulan')) {
            $query->whereMonth('akhir_kontrak', $request->bulan);
        }

        if ($request->filled('status')) {
            $query->whereHas('monitoring', function($q) use ($request) {
                $q->where('status', $request->status);
            });
        }

        $karyawan = $query->get();
        
        foreach ($karyawan as $k) {
            if (!$k->monitoring) {
                $monitoring = Monitoring::create([
                    'karyawan_id' => $k->id,
                    'status' => Monitoring::STATUS_BELUM_LENGKAP
                ]);
                $monitoring->updateStatus();
            }
        }

        $karyawan->load('monitoring');

        return view('admin.karyawan.monitoring', [
            'karyawan' => $karyawan,
            'title' => 'Monitoring Berkas Karyawan',
            'menuAdminMonitoring' => 'active'
        ]);
    }

    public function updateCheckbox(Request $request, $id)
    {
        try {
            $monitoring = Monitoring::findOrFail($id);
            $field = $request->field;
            
            if (!in_array($field, $monitoring->getFillable())) {
                return response()->json(['success' => false], 422);
            }

            $monitoring->$field = filter_var($request->checked, FILTER_VALIDATE_BOOLEAN);
            $monitoring->save();
            $monitoring->updateStatus();
            
            return response()->json([
                'success' => true,
                'status' => $monitoring->status,
                'catatan' => $monitoring->catatan,
                'progress' => $monitoring->progress ?? 0,
                'statusBadge' => $this->getStatusBadgeHtml($monitoring),
                'catatanHtml' => $this->getCatatanHtml($monitoring)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function updateTextField(Request $request, $id)
{
    try {
        $monitoring = Monitoring::findOrFail($id);
        $field = $request->field;

        if (!in_array($field, $monitoring->getFillable())) {
            return response()->json(['success' => false], 422);
        }
        
        $monitoring->$field = trim($request->value ?: '');
        $monitoring->save();
        $monitoring->updateStatus();

        return response()->json([
            'success' => true,
            'status' => $monitoring->status,
            'catatan' => $monitoring->catatan,
            'progress' => $monitoring->progress ?? 0,
            'statusBadge' => $this->getStatusBadgeHtml($monitoring),
            'catatanHtml' => $this->getCatatanHtml($monitoring)
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => $e->getMessage()
        ], 500);
    }
}

    private function getStatusBadgeHtml($monitoring)
    {
        $isSelesai = ($monitoring->status === Monitoring::STATUS_SELESAI);
        $badgeClass = $isSelesai ? 'success' : 'warning';
        $icon = $isSelesai ? 'check-circle' : 'clock';
        
        return '<span class="badge badge-' . $badgeClass . ' status-badge">
                    <i class="fas fa-' . $icon . '"></i>
                    ' . e($monitoring->status) . '
                </span>';
    }

    private function getCatatanHtml($monitoring)
    {
        if ($monitoring->status === Monitoring::STATUS_SELESAI) {
            return '<span class="text-success">
                        <i class="fas fa-check-circle"></i> Selesai
                    </span>';
        }

        if (empty($monitoring->catatan)) {
            return '<span class="text-muted">-</span>';
        }

        $items = array_filter(array_map('trim', explode(',', $monitoring->catatan)));
        
        if (empty($items)) {
            return '<span class="text-muted">-</span>';
        }

        $html = '<div id="catatan-short-' . $monitoring->id . '" style="font-size: 11px; line-height: 1.6;">';
        foreach (array_slice($items, 0, 1) as $cat) {
            $html .= '<div class="text-danger" style="margin-bottom: 3px;">• ' . e($cat) . '</div>';
        }
        $html .= '</div>';

        $html .= '<div id="catatan-full-' . $monitoring->id . '" style="display:none; font-size: 11px; line-height: 1.6;">';
        foreach ($items as $cat) {
            $html .= '<div class="text-danger" style="margin-bottom: 3px;">• ' . e($cat) . '</div>';
        }
        $html .= '</div>';

        if (count($items) > 1) {
            $html .= '<button type="button" class="btn btn-link p-0 mt-1 toggle-catatan"
                             style="font-size: 11px; text-decoration: none;"
                             data-id="' . $monitoring->id . '">
                        Selengkapnya
                      </button>';
        }

        return $html;
    }
}