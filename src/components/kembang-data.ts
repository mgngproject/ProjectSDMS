// Bentuk kembang logo Peruri sebagai poligon (sembilan sinar), diambil dari public/logo-peruri-ikon.png.
// Koordinat dalam kotak 431 x 218; hub adalah titik temu sinar.
export const KEMBANG = {
  lebar: 431,
  tinggi: 218,
  hub: [256, 133] as const,
  /** tua: sinar biru tua (jadi terang di tema gelap); selain itu ungu. */
  sinar: [
  { p: "85,56 101,56 230,120 226,122 85,72", tua: true },
  { p: "157,4 173,4 241,108 234,108 157,20", tua: false },
  { p: "249,11 264,12 258,104 253,100 248,34", tua: true },
  { p: "274,102 311,41 327,41 327,56 274,111", tua: false },
  { p: "285,116 386,66 403,66 402,82 282,123", tua: true },
  { p: "287,133 427,144 427,160 381,155 283,137", tua: true },
  { p: "277,149 286,150 361,198 361,214 345,214 282,156", tua: false },
  { p: "185,170 233,146 232,154 200,187 184,187", tua: true },
  { p: "4,128 229,134 225,139 4,144", tua: false },
  ],
};
