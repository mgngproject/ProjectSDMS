<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="utf-8">
  <meta content="width=device-width, initial-scale=1.0" name="viewport">
  <title>SDMS | Beranda</title>
  <meta name="description" content="">
  <meta name="keywords" content="">

  <link rel="icon" href="{{ asset('logoperuri2.png') }}" type="image/png">

  <link href="https://fonts.googleapis.com" rel="preconnect">
  <link href="https://fonts.gstatic.com" rel="preconnect" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&family=Inter:wght@100;200;300;400;500;600;700;800;900&family=Poppins:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">

  <link href="{{ asset('landing/landing/assets/vendor/bootstrap/css/bootstrap.min.css') }}" rel="stylesheet">
  <link href="{{ asset('landing/landing/assets/vendor/bootstrap-icons/bootstrap-icons.css') }}" rel="stylesheet">
  <link href="{{ asset('landing/landing/assets/vendor/aos/aos.css') }}" rel="stylesheet">
  <link href="{{ asset('landing/landing/assets/vendor/glightbox/css/glightbox.min.css') }}" rel="stylesheet">
  <link href="{{ asset('landing/landing/assets/vendor/swiper/swiper-bundle.min.css') }}" rel="stylesheet">
  <link href="{{ asset('landing/landing/assets/css/main.css') }}" rel="stylesheet">
  <link href="{{ asset('landing/landing/assets/css/landing.css') }}" rel="stylesheet">
</head>

<body class="index-page">

  <header id="header" class="header d-flex align-items-center fixed-top">
    <div class="header-container container-fluid container-xl position-relative d-flex align-items-center justify-content-between">
      <div class="logo d-flex align-items-center me-auto me-xl-0">
        <img src="{{ asset('sbadmin2/startbootstrap-sb-admin-2-gh-pages/img/logoperuri.png') }}" alt="peruri logo">
      </div>
      <a class="btn-getstarted" href="{{ route('login') }}">LOGIN</a>
    </div>
  </header>

  <main class="main">
    <section id="hero" class="hero section">
      <div class="container" data-aos="fade-up" data-aos-delay="100">
        <div class="row align-items-center">
          <div class="col-lg-6">
            <div class="hero-content" data-aos="fade-up" data-aos-delay="200">
              <h1 class="mb-4">SISTEM MANAJEMEN KARYAWAN</h1>
              <p class="mb-4 mb-md-5">Sistem Manajemen Karyawan Perum Peruri.</p>
            </div>
          </div>
          <div class="col-lg-6">
            <div class="hero-image" data-aos="zoom-out" data-aos-delay="300">
              <img src="{{ asset('landing/landing/assets/img/illustration-1.webp') }}" alt="Hero Image">
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>

<footer id="footer" class="footer">
  <div class="container footer-top">
    <div class="row gy-4">
      <div class="col-lg-4 col-md-6 footer-about">
        <div class="logo d-flex align-items-center">
          <span class="sitename">Perum PERURI</span>
        </div>
        <div class="footer-contact pt-3">
          <p>Desa Parung Mulya, Ciampel</p>
          <p>Karawang, Jawa Barat, 41361</p>
          <p class="mt-3"><strong>Phone:</strong> <span>(021) 7395000</span></p>
          <p><strong>Email:</strong> <span>contact@peruri.co.id</span></p>
        </div>
      </div>
    </div>
  </div>
</footer>

  <a href="#" id="scroll-top" class="scroll-top d-flex align-items-center justify-content-center">
    <i class="bi bi-arrow-up-short"></i>
  </a>

  <script src="{{ asset('landing/landing/assets/vendor/bootstrap/js/bootstrap.bundle.min.js') }}"></script>
  <script src="{{ asset('landing/landing/assets/vendor/php-email-form/validate.js') }}"></script>
  <script src="{{ asset('landing/landing/assets/vendor/aos/aos.js') }}"></script>
  <script src="{{ asset('landing/landing/assets/vendor/glightbox/js/glightbox.min.js') }}"></script>
  <script src="{{ asset('landing/landing/assets/vendor/swiper/swiper-bundle.min.js') }}"></script>
  <script src="{{ asset('landing/landing/assets/vendor/purecounter/purecounter_vanilla.js') }}"></script>
  <script src="{{ asset('landing/landing/assets/js/main.js') }}"></script>

</body>

</html>