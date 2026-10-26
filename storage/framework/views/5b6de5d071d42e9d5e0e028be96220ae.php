<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="description" content="">
    <meta name="author" content="">

    <title>SDMS | Login</title>

    <link href="<?php echo e(asset('sbadmin2/startbootstrap-sb-admin-2-gh-pages/vendor/fontawesome-free/css/all.min.css')); ?>" rel="stylesheet" type="text/css">
    <link href="https://fonts.googleapis.com/css?family=Poppins:200,200i,300,300i,400,400i,600,600i,700,700i,800,800i,900,900i" rel="stylesheet">
    <link href="<?php echo e(asset('sbadmin2/startbootstrap-sb-admin-2-gh-pages/css/sb-admin-2.min.css')); ?>" rel="stylesheet">
    <link href="<?php echo e(asset('landing/landing/assets/css/login.css')); ?>" rel="stylesheet">
    <link rel="icon" href="<?php echo e(asset('logoperuri2.png')); ?>" type="image/png">
</head>

<body>

    <div class="login-wrapper">

        <!-- LEFT: company visual -->
        <div class="login-visual" style="background-image: url('<?php echo e(asset('landing/landing/assets/img/gedungperuri.jpeg')); ?>');">
            <div class="visual-content">
                <div class="logo-box">
                    <img src="<?php echo e(asset('logoperuri2.png')); ?>" alt="PERURI">
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

                <form class="user" method="POST" action="<?php echo e(route('loginProses')); ?>">
                    <?php echo csrf_field(); ?>
                    <div class="form-group">
                        <label for="email" class="form-label">Email</label>
                        <input type="email" id="email"
                            class="form-control form-control-user <?php $__errorArgs = ['email'];
$__bag = $errors->getBag($__errorArgs[1] ?? 'default');
if ($__bag->has($__errorArgs[0])) :
if (isset($message)) { $__messageOriginal = $message; }
$message = $__bag->first($__errorArgs[0]); ?> is-invalid <?php unset($message);
if (isset($__messageOriginal)) { $message = $__messageOriginal; }
endif;
unset($__errorArgs, $__bag); ?>"
                            name="email"
                            placeholder="Masukkan Email"
                            value="<?php echo e(old('email')); ?>"
                            autocomplete="email">

                        <?php $__errorArgs = ['email'];
$__bag = $errors->getBag($__errorArgs[1] ?? 'default');
if ($__bag->has($__errorArgs[0])) :
if (isset($message)) { $__messageOriginal = $message; }
$message = $__bag->first($__errorArgs[0]); ?>
                            <small class="text-danger"><?php echo e($message); ?></small>
                        <?php unset($message);
if (isset($__messageOriginal)) { $message = $__messageOriginal; }
endif;
unset($__errorArgs, $__bag); ?>
                    </div>

                    <div class="form-group">
                        <label for="password" class="form-label">Password</label>
                        <div style="position: relative;">
                            <input type="password" id="password"
                                class="form-control form-control-user <?php $__errorArgs = ['password'];
$__bag = $errors->getBag($__errorArgs[1] ?? 'default');
if ($__bag->has($__errorArgs[0])) :
if (isset($message)) { $__messageOriginal = $message; }
$message = $__bag->first($__errorArgs[0]); ?> is-invalid <?php unset($message);
if (isset($__messageOriginal)) { $message = $__messageOriginal; }
endif;
unset($__errorArgs, $__bag); ?>"
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

                        <?php $__errorArgs = ['password'];
$__bag = $errors->getBag($__errorArgs[1] ?? 'default');
if ($__bag->has($__errorArgs[0])) :
if (isset($message)) { $__messageOriginal = $message; }
$message = $__bag->first($__errorArgs[0]); ?>
                            <small class="text-danger"><?php echo e($message); ?></small>
                        <?php unset($message);
if (isset($__messageOriginal)) { $message = $__messageOriginal; }
endif;
unset($__errorArgs, $__bag); ?>
                    </div>

                    <button type="submit" class="btn btn-primary btn-user btn-block">Login</button>
                </form>

                <hr>

                <div class="text-center">
                    <small>
                        Kembali Ke Beranda?
                        <a href="<?php echo e(route('welcome')); ?>">Klik Disini</a>
                    </small>
                </div>
            </div>
        </div>

    </div>

    <script src="<?php echo e(asset('sbadmin2/startbootstrap-sb-admin-2-gh-pages/vendor/jquery/jquery.min.js')); ?>"></script>
    <script src="<?php echo e(asset('sbadmin2/startbootstrap-sb-admin-2-gh-pages/vendor/bootstrap/js/bootstrap.bundle.min.js')); ?>"></script>
    <script src="<?php echo e(asset('sbadmin2/startbootstrap-sb-admin-2-gh-pages/vendor/jquery-easing/jquery.easing.min.js')); ?>"></script>
    <script src="<?php echo e(asset('sbadmin2/startbootstrap-sb-admin-2-gh-pages/js/sb-admin-2.min.js')); ?>"></script>
    <script src="<?php echo e(asset('sweetalert2/dist/sweetalert2.all.min.js')); ?>"></script>

    <?php $__sessionArgs = ['success'];
if (session()->has($__sessionArgs[0])) :
if (isset($value)) { $__sessionPrevious[] = $value; }
$value = session()->get($__sessionArgs[0]); ?>
    <script>
        Swal.fire({ title: "Sukses", text: "<?php echo e(session('success')); ?>", icon: "success" });
    </script>
    <?php unset($value);
if (isset($__sessionPrevious) && !empty($__sessionPrevious)) { $value = array_pop($__sessionPrevious); }
if (isset($__sessionPrevious) && empty($__sessionPrevious)) { unset($__sessionPrevious); }
endif;
unset($__sessionArgs); ?>

    <?php $__sessionArgs = ['error'];
if (session()->has($__sessionArgs[0])) :
if (isset($value)) { $__sessionPrevious[] = $value; }
$value = session()->get($__sessionArgs[0]); ?>
    <script>
        Swal.fire({ title: "Gagal", text: "<?php echo e(session('error')); ?>", icon: "error" });
    </script>
    <?php unset($value);
if (isset($__sessionPrevious) && !empty($__sessionPrevious)) { $value = array_pop($__sessionPrevious); }
if (isset($__sessionPrevious) && empty($__sessionPrevious)) { unset($__sessionPrevious); }
endif;
unset($__sessionArgs); ?>

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

</html><?php /**PATH C:\laragon\www\sdmsproject\resources\views/auth/login.blade.php ENDPATH**/ ?>