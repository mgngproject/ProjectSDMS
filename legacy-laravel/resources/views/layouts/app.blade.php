<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="description" content="">
    <meta name="author" content="">

    <title>SDMS | {{$title}}</title>

    <link href="{{ asset('sbadmin2/startbootstrap-sb-admin-2-gh-pages/vendor/fontawesome-free/css/all.min.css') }}" rel="stylesheet" type="text/css">
    <link href="https://fonts.googleapis.com/css?family=Poppins:200,300,400,600,700,900" rel="stylesheet">
    <link href="{{ asset('sbadmin2/startbootstrap-sb-admin-2-gh-pages/vendor/bootstrap/css/bootstrap.min.css') }}" rel="stylesheet">
    <link href="{{ asset('sbadmin2/startbootstrap-sb-admin-2-gh-pages/vendor/datatables/dataTables.bootstrap4.min.css') }}" rel="stylesheet">
    <link href="{{ asset('sbadmin2/startbootstrap-sb-admin-2-gh-pages/css/sb-admin-2.min.css') }}" rel="stylesheet">
    <link href="{{ asset('landing/landing/assets/css/app.css') }}" rel="stylesheet">
    <link rel="icon" href="{{ asset('logoperuri2.png') }}" type="image/png">
</head>

<body id="page-top">

    <div id="wrapper">

        <ul class="navbar-nav sidebar sidebar-dark accordion custom-sidebar" id="accordionSidebar">

            <a class="sidebar-brand d-flex align-items-center justify-content-center mb-3" href="index.html">
                <img src="{{ asset('sbadmin2/startbootstrap-sb-admin-2-gh-pages/img/Logoperurii.png') }}"
                    alt="peruri logo" class="sidebar-logo-img" style="object-fit:contain;">
            </a>

            <hr class="sidebar-divider my-0">

            <li class="nav-item {{ $menuDashboard ?? ''}}">
                <a class="nav-link" href="{{ route('dashboard') }}">
                    <i class="fas fa-fw fa-tachometer-alt"></i>
                    <span>Dashboard</span>
                </a>
            </li>

            <hr class="sidebar-divider">

            <div class="sidebar-heading">MENU ADMIN</div>

            <li class="nav-item {{ $menuAdminKaryawan ?? ''}}">
                <a class="nav-link" href="{{ route('karyawan') }}">
                    <i class="fas fa-fw fa-user"></i>
                    <span>Data Karyawan</span>
                </a>
            </li>

            <li class="nav-item {{ $menuAdminKontrak ?? ''}}">
                <a class="nav-link" href="{{ route('kontrak') }}">
                    <i class="fas fa-fw fa-file-contract"></i>
                    <span>Kontrak</span>
                </a>
            </li>

            <li class="nav-item {{ $menuAdminDataDiri ?? ''}}">
                <a class="nav-link" href="{{ route('datadiri') }}">
                    <i class="fas fa-fw fa-id-card"></i>
                    <span>Data Diri Karyawan</span>
                </a>
            </li>

            <hr class="sidebar-divider">

            <div class="sidebar-heading">MONITORING</div>

            <li class="nav-item {{ $menuAdminMonitoring ?? ''}}">
                <a class="nav-link" href="{{ route('monitoring') }}">
                    <i class="fas fa-fw fa-chart-line"></i>
                    <span>Monitoring</span>
                </a>
            </li>

            <li class="nav-item {{ $menuAdminTerminate ?? ''}}">
                <a class="nav-link" href="{{ route('terminate') }}">
                    <i class="fas fa-fw fa-user-slash"></i>
                    <span>Terminate</span>
                </a>
            </li>

            <hr class="sidebar-divider d-none d-md-block">

            <div class="text-center d-none d-md-inline">
                <button class="rounded-circle border-0" id="sidebarToggle"></button>
            </div>

        </ul>

        <div id="content-wrapper" class="d-flex flex-column">
            <div id="content">

                <nav class="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">
                    <div class="d-none d-sm-inline-block ml-3">
                        <span class="badge-shadow badge-info badge-kategori">
                            {{ auth()->user()->kategori ? auth()->user()->kategori->nama : 'Super Admin' }}
                        </span>
                    </div>

                    <button id="sidebarToggleTop" class="btn btn-link d-md-none rounded-circle mr-3">
                        <i class="fa fa-bars"></i>
                    </button>

                    <ul class="navbar-nav ml-auto">
                        <li class="nav-item dropdown no-arrow">
                            <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button"
                                data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <span class="mr-2 d-none d-lg-inline text-gray-600 small">Admin</span>
                                <img class="img-profile rounded-circle"
                                    src="{{ asset('sbadmin2/startbootstrap-sb-admin-2-gh-pages/img/undraw_profile.svg') }}">
                            </a>
                            <div class="dropdown-menu dropdown-menu-right shadow animated--grow-in"
                                aria-labelledby="userDropdown">
                                <form action="{{ route('logout') }}" method="POST">
                                    @csrf
                                    <button type="submit" class="dropdown-item">
                                        <i class="fas fa-sign-out-alt fa-sm fa-fw mr-2 text-gray-400"></i>
                                        Logout
                                    </button>
                                </form>
                            </div>
                        </li>
                    </ul>
                </nav>

                <div class="container-fluid">
                    @yield('content')
                </div>
            </div>
        </div>
    </div>

    <a class="scroll-to-top rounded" href="#page-top">
        <i class="fas fa-angle-up"></i>
    </a>

    <script src="{{ asset('sbadmin2/startbootstrap-sb-admin-2-gh-pages/vendor/jquery/jquery.min.js') }}"></script>
    <script src="{{ asset('sbadmin2/startbootstrap-sb-admin-2-gh-pages/vendor/bootstrap/js/bootstrap.bundle.min.js') }}"></script>
    <script src="{{ asset('sbadmin2/startbootstrap-sb-admin-2-gh-pages/vendor/jquery-easing/jquery.easing.min.js') }}"></script>
    <script src="{{ asset('sbadmin2/startbootstrap-sb-admin-2-gh-pages/js/sb-admin-2.min.js') }}"></script>
    <script src="{{ asset('sbadmin2/startbootstrap-sb-admin-2-gh-pages/vendor/datatables/jquery.dataTables.min.js') }}"></script>
    <script src="{{ asset('sbadmin2/startbootstrap-sb-admin-2-gh-pages/vendor/datatables/dataTables.bootstrap4.min.js') }}"></script>
    <script src="{{ asset('sbadmin2/startbootstrap-sb-admin-2-gh-pages/js/demo/datatables-demo.js') }}"></script>
    <script src="{{ asset('sweetalert2/dist/sweetalert2.all.min.js') }}"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.9.4/Chart.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@0.7.0"></script>

    @if(session('success'))
    <script>
        Swal.fire({
            title: "Sukses",
            html: `<span class="swal-text-kecil">{{ session('success') }}</span>`,
            icon: "success"
        });
    </script>
    @endif

    @if(session('error'))
    <script>
        Swal.fire({
            title: "Gagal",
            html: `<span class="swal-text-kecil">{{ session('error') }}</span>`,
            icon: "error"
        });
    </script>
    @endif

    @yield('scripts')
    @stack('scripts')

</body>

</html>