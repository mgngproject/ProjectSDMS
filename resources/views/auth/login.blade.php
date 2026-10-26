<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="description" content="">
    <meta name="author" content="">

    <title>SDMS | Login</title>

    <link href="{{ asset('sbadmin2/startbootstrap-sb-admin-2-gh-pages/vendor/fontawesome-free/css/all.min.css') }}" rel="stylesheet" type="text/css">
    <link href="https://fonts.googleapis.com/css?family=Poppins:200,200i,300,300i,400,400i,600,600i,700,700i,800,800i,900,900i" rel="stylesheet">
    <link href="{{ asset('sbadmin2/startbootstrap-sb-admin-2-gh-pages/css/sb-admin-2.min.css') }}" rel="stylesheet">
    <link href="{{ asset('landing/landing/assets/css/login.css') }}" rel="stylesheet">
    <link rel="icon" href="{{ asset('logoperuri2.png') }}" type="image/png">
</head>

<body>

    <div class="login-wrapper">

        <!-- LEFT: company visual -->
        <div class="login-visual" style="background-image: url('{{ asset('landing/landing/assets/img/gedungperuri.jpeg') }}');">
            <div class="visual-content">
                <div class="logo-box">
                    <img src="{{ asset('logoperuri2.png') }}" alt="PERURI">
                </div>
                <h2>SDMS &mdash; PERURI</h2>
                <p>Sistem Manajemen Karyawan SDM Strategis.</p>
            </div>
        </div>

        <!-- RIGHT: login form -->
        <div class="login-form-panel">
            <div class="login-form-inner">
                <h1>Selamat Datang</h1>
                <p class="subtitle">Masuk ke akun SDMS Anda untuk melanjutkan</p>

                <form class="user" method="POST" action="{{ route('loginProses') }}">
                    @csrf
                    <div class="form-group">
                        <label for="email" class="form-label">Email</label>
                        <input type="email" id="email"
                            class="form-control form-control-user @error('email') is-invalid @enderror"
                            name="email"
                            placeholder="Masukkan Email"
                            value="{{ old('email') }}"
                            autocomplete="email">

                        @error('email')
                            <small class="text-danger">{{ $message }}</small>
                        @enderror
                    </div>

                    <div class="form-group">
                        <label for="password" class="form-label">Password</label>
                        <div style="position: relative;">
                            <input type="password" id="password"
                                class="form-control form-control-user @error('password') is-invalid @enderror"
                                name="password"
                                placeholder="Masukkan Password"
                                autocomplete="current-password"
                                style="padding-right: 40px;">

                            <button type="button" id="togglePassword" tabindex="-1"
                                style="position: absolute; right: 16px; top: 50%; transform: translateY(-50%);
                                    background: none; border: none; cursor: pointer; padding: 0;">
                                <i class="fas fa-eye-slash" id="eyeIcon" style="font-size: 15px;"></i>
                            </button>
                        </div>

                        @error('password')
                            <small class="text-danger">{{ $message }}</small>
                        @enderror
                    </div>

                    <button type="submit" class="btn btn-primary btn-user btn-block">Login</button>
                </form>

                <hr>

                <div class="text-center">
                    <small>
                        Kembali Ke Beranda?
                        <a href="{{ route('welcome') }}">Klik Disini</a>
                    </small>
                </div>
            </div>
        </div>

    </div>

    <script src="{{ asset('sbadmin2/startbootstrap-sb-admin-2-gh-pages/vendor/jquery/jquery.min.js') }}"></script>
    <script src="{{ asset('sbadmin2/startbootstrap-sb-admin-2-gh-pages/vendor/bootstrap/js/bootstrap.bundle.min.js') }}"></script>
    <script src="{{ asset('sbadmin2/startbootstrap-sb-admin-2-gh-pages/vendor/jquery-easing/jquery.easing.min.js') }}"></script>
    <script src="{{ asset('sbadmin2/startbootstrap-sb-admin-2-gh-pages/js/sb-admin-2.min.js') }}"></script>
    <script src="{{ asset('sweetalert2/dist/sweetalert2.all.min.js') }}"></script>

    @session('success')
    <script>
        Swal.fire({ title: "Sukses", text: "{{ session('success') }}", icon: "success" });
    </script>
    @endsession

    @session('error')
    <script>
        Swal.fire({ title: "Gagal", text: "{{ session('error') }}", icon: "error" });
    </script>
    @endsession

    <script>
    document.getElementById('togglePassword').addEventListener('click', function () {
        const passwordInput = document.getElementById('password');
        const eyeIcon = document.getElementById('eyeIcon');

        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            eyeIcon.classList.remove('fa-eye-slash');
            eyeIcon.classList.add('fa-eye');
        } else {
            passwordInput.type = 'password';
            eyeIcon.classList.remove('fa-eye');
            eyeIcon.classList.add('fa-eye-slash');
        }
    });
    </script>
</body>

</html>