from typing import Dict, List

# ─── Data ide upcycling per kategori sampah ───────────────────
# Sesuai class_names.json: ["B3", "Kaca", "Kardus", "Kertas", "Logam", "Medis", "Plastik", "nonsampah", "organik"]

_UPCYCLE_IDEAS: Dict[str, List[Dict]] = {
    "Plastik": [
        {"id": 1,  "title": "Ecobrick",                        "description": "Botol diisi padat dengan plastik kemasan untuk bahan bangunan."},
        {"id": 2,  "title": "Pot Tanaman Vertikal/Gantung",    "description": "Dari botol minuman."},
        {"id": 3,  "title": "Tempat Pensil Meja",              "description": "Gelas plastik atau bagian bawah botol yang dihias."},
        {"id": 4,  "title": "Kap Lampu Gantung",               "description": "Dari susunan sendok plastik atau botol."},
        {"id": 5,  "title": "Celengan Bentuk Hewan",           "description": "Dari botol besar."},
        {"id": 6,  "title": "Tas Belanja / Dompet",            "description": "Dari anyaman bungkus kopi instan."},
        {"id": 7,  "title": "Bunga Hias Imitasi",              "description": "Dari sedotan atau botol plastik warna-warni."},
        {"id": 8,  "title": "Tempat Perhiasan Multi-tingkat",  "description": "Dari potongan pantat botol yang disatukan."},
        {"id": 9,  "title": "Wadah Pakan Burung Gantung",      "description": "Botol dilubangi dan digantung di pohon."},
        {"id": 10, "title": "Sapu Halaman",                    "description": "Dari irisan memanjang botol plastik bekas."},
        {"id": 11, "title": "Dompet Koin",                     "description": "Dari dua pantat botol yang disatukan dengan ritsleting."},
        {"id": 12, "title": "Tirai Pintu / Jendela",           "description": "Dari rangkaian tutup botol plastik."},
        {"id": 13, "title": "Wadah Sikat Gigi dan Pasta Gigi", "description": "Botol dipotong dan ditempel di dinding kamar mandi."},
        {"id": 14, "title": "Keranjang Baju Kotor",            "description": "Anyaman dari tali rafia atau kemasan tebal."},
        {"id": 15, "title": "Perahu Mainan Anak",              "description": "Botol sabun/sampo kosong."},
        {"id": 16, "title": "Sprinkler Air Taman",             "description": "Botol dilubangi kecil-kecil lalu disambung ke selang."},
        {"id": 17, "title": "Tempat Pengering Sendok Garpu",   "description": "Wadah plastik dilubangi bagian bawahnya."},
        {"id": 18, "title": "Pelindung Lensa Kamera",          "description": "Dari tutup botol besar."},
        {"id": 19, "title": "Penyekat Laci / Organizer",       "description": "Dari potongan kotak makanan plastik."},
        {"id": 20, "title": "Gantungan Kunci Shrink Art",      "description": "Plastik mika bungkus makanan yang digambar lalu dipanaskan hingga menyusut dan mengeras."},
    ],
    "Kertas": [
        {"id": 1,  "title": "Kertas Daur Ulang Estetik",       "description": "Bubur kertas dicetak ulang dengan kelopak bunga."},
        {"id": 2,  "title": "Patung / Pajangan Paper Mache",   "description": "Bubur kertas dibentuk dengan rangka kawat."},
        {"id": 3,  "title": "Keranjang Anyaman",               "description": "Dari lintingan kertas koran yang dikeraskan."},
        {"id": 4,  "title": "Tatakan Gelas (Coaster)",         "description": "Lintingan majalah bekas digulung melingkar padat."},
        {"id": 5,  "title": "Pembatas Buku (Bookmark)",        "description": "Kertas digambar/dilaminasi."},
        {"id": 6,  "title": "Amplop Kustom",                   "description": "Dari halaman majalah atau kalender yang berpola bagus."},
        {"id": 7,  "title": "Bunga Origami / Paper Quilling",  "description": "Seni menggulung kertas untuk hiasan 3D."},
        {"id": 8,  "title": "Hiasan Dinding Tiga Dimensi",     "description": "Lipatan kertas warna-warni."},
        {"id": 9,  "title": "Topeng Pesta/Karnaval",           "description": "Koran yang dilem berlapis-lapis pada cetakan wajah."},
        {"id": 10, "title": "Tas Kado (Paper Bag)",            "description": "Dilipat dari koran tebal dengan tali rami."},
        {"id": 11, "title": "Pita Hias Kado",                  "description": "Dari potongan memanjang majalah mengkilap."},
        {"id": 12, "title": "Kotak Tisu",                      "description": "Dari anyaman lintingan koran."},
        {"id": 13, "title": "Mangkuk Serbaguna",               "description": "Cetakan balon dilapisi paper mache."},
        {"id": 14, "title": "Hiasan Gantung Tsuru (Bangau)",   "description": "Rangkaian origami bangau pakai benang."},
        {"id": 15, "title": "Bingkai Foto",                    "description": "Berlapis lintingan kertas warna."},
        {"id": 16, "title": "Kalender Meja Kustom",            "description": "Kertas tebal bekas buku gambar dipotong segi empat."},
        {"id": 17, "title": "Sampul Buku Catatan (Notebook)",  "description": "Dari kertas daur ulang buatan sendiri."},
        {"id": 18, "title": "Mainan Parasut Kecil",            "description": "Kertas tipis ditali ke pemberat."},
        {"id": 19, "title": "Pinata Pesta",                    "description": "Kertas dilapisi lem dan diisi permen."},
        {"id": 20, "title": "Pesawat / Kapal Mainan Anak",     "description": "Origami standar."},
    ],
    "Kardus": [
        {"id": 1,  "title": "Laci Penyimpanan Mini",           "description": "Kardus sepatu dilapisi kertas kado."},
        {"id": 2,  "title": "Papan Cakaran Kucing",            "description": "Potongan pinggiran kardus disusun rapat."},
        {"id": 3,  "title": "Kostum Anak",                     "description": "Kardus besar dibentuk jadi mobil, robot, atau dinosaurus."},
        {"id": 4,  "title": "Dudukan Laptop (Laptop Stand)",   "description": "Potongan kardus tebal bersilangan."},
        {"id": 5,  "title": "Rak Buku Tempel Dinding Mini",    "description": "Kardus tebal berlapis, direkatkan kuat."},
        {"id": 6,  "title": "Rumah-rumahan Boneka",            "description": "Dari kardus paket besar."},
        {"id": 7,  "title": "Bingkai Cermin atau Foto Estetik","description": "Dilapisi tali goni."},
        {"id": 8,  "title": "Organizer Kabel di Meja",         "description": "Kardus dilubangi untuk jalur kabel charger."},
        {"id": 9,  "title": "Puzzle Balita",                   "description": "Gambar di kardus yang dipotong kotak-kotak."},
        {"id": 10, "title": "Dudukan HP (Phone Holder)",       "description": "Kardus dilipat segitiga sederhana."},
        {"id": 11, "title": "Kotak Kado / Kotak Perhiasan",    "description": "Kardus bekas HP."},
        {"id": 12, "title": "Labirin Kelereng (Marble Maze)",  "description": "Mainan ketangkasan dengan sekat kardus."},
        {"id": 13, "title": "Papan Nama Pintu Kamar",          "description": "Tulisan timbul dari kardus."},
        {"id": 14, "title": "Kotak Surat Mainan",              "description": "Kardus dilubangi atasnya."},
        {"id": 15, "title": "Brankas Mainan",                  "description": "Kardus dengan kombinasi putar sederhana."},
        {"id": 16, "title": "Palet Warna untuk Melukis",       "description": "Potongan kardus berlapis lakban bening."},
        {"id": 17, "title": "Tempat Penyimpanan Sepatu Lipat", "description": "Sekat kardus di kolong tempat tidur."},
        {"id": 18, "title": "Hiasan Kepala Rusa 3D di Dinding","description": "Puzzle kardus potong pipih."},
        {"id": 19, "title": "Dapur Mini Mainan Anak",          "description": "Kardus ditumpuk dan digambar kompor."},
        {"id": 20, "title": "Papan Target Panahan",            "description": "Kardus digambar lingkaran poin."},
    ],
    "Kaca": [
        {"id": 1,  "title": "Terarium Mini",                   "description": "Botol/toples selai diisi batu, tanah, dan tanaman sukulen."},
        {"id": 2,  "title": "Wadah Lilin Aromaterapi",         "description": "Sisa lilin dicairkan ulang ke dalam toples kaca."},
        {"id": 3,  "title": "Vas Bunga Lukis",                 "description": "Botol kaca dilukis luar dengan cat akrilik."},
        {"id": 4,  "title": "Wadah Bumbu Dapur Estetik",       "description": "Botol kecil dibersihkan, diberi stiker label seragam."},
        {"id": 5,  "title": "Tempat Kuas Makeup / Alat Tulis", "description": "Toples pendek tanpa tutup."},
        {"id": 6,  "title": "Lampu Tidur / Lampu Hias",        "description": "Botol diisi lampu string lights / lampu peri."},
        {"id": 7,  "title": "Hiasan Snow Globe",               "description": "Toples diisi air, gliserin, glitter, dan miniatur mainan."},
        {"id": 8,  "title": "Wadah Cotton Bud atau Kapas",     "description": "Botol kaca pendek bekas skincare."},
        {"id": 9,  "title": "Gelas Minum Kustom",              "description": "Botol kaca dipotong alat khusus lalu diamplas halus ujungnya."},
        {"id": 10, "title": "Penahan Pintu (Door Stopper)",    "description": "Botol tebal diisi penuh dengan pasir pantai/batu kecil hias."},
    ],
    "Logam": [
        {"id": 1,  "title": "Celengan Kustom",                 "description": "Kaleng susu/biskuit dilubangi atasnya."},
        {"id": 2,  "title": "Lentera Taman / Camping",         "description": "Sisi kaleng dilubangi dengan paku membentuk pola, diisi lilin."},
        {"id": 3,  "title": "Pot Tanaman Gantung Anti Pecah",  "description": "Kaleng cat dicat ulang dan dilubangi bawahnya."},
        {"id": 4,  "title": "Organizer Alat Pertukangan",      "description": "Kaleng kecil untuk memisah baut, paku, dan mur."},
        {"id": 5,  "title": "Tempat Sendok Garpu",             "description": "Kaleng dilapis stiker vintage."},
        {"id": 6,  "title": "Pemanggang Mini (Mini Grill)",    "description": "Kaleng besar dibelah atau diisi arang."},
        {"id": 7,  "title": "Lonceng Angin (Wind Chime)",      "description": "Tutup botol logam/soda digantung dengan senar."},
        {"id": 8,  "title": "Asbak Estetik",                   "description": "Kaleng pendek bekas makanan kaleng."},
        {"id": 9,  "title": "Miniatur Kendaraan",              "description": "Dari onderdil rusak, mur, atau kaleng minuman."},
        {"id": 10, "title": "Hiasan Dinding Vintage",          "description": "Plat nomor bekas atau tutup kaleng biskuit ceper."},
        {"id": 11, "title": "Wadah Obat Nyamuk Bakar",         "description": "Kaleng ceper agar abunya tidak berserakan."},
        {"id": 12, "title": "Mainan Egrang Tradisional",       "description": "Dua kaleng susu besar dilubangi dan dipasang tali."},
        {"id": 13, "title": "Kotak Jahit / Kotak P3K Mini",   "description": "Kaleng biskuit persegi panjang."},
        {"id": 14, "title": "Wadah Pembakar Kertas/Dupa",      "description": "Kaleng logam tebal berventilasi."},
        {"id": 15, "title": "Tempat Sabun Batang",             "description": "Tutup botol kaleng dipipihkan."},
    ],
    "organik": [
        {"id": 1,  "title": "Pupuk Kompos Padat",              "description": "Diolah di keranjang Takakura / kompos pot."},
        {"id": 2,  "title": "Pupuk Cair / POC",                "description": "Fermentasi air cucian beras dan sisa sayur."},
        {"id": 3,  "title": "Eco-enzyme",                      "description": "Fermentasi kulit buah, gula, dan air untuk cairan pembersih serbaguna."},
        {"id": 4,  "title": "Pot Semai Benih",                 "description": "Dari cangkang telur utuh yang dilubangi bawahnya."},
        {"id": 5,  "title": "Suplemen Kalsium Tanaman",        "description": "Cangkang telur dijemur dan dihaluskan jadi bubuk."},
        {"id": 6,  "title": "Pewarna Kain / Kertas Alami",     "description": "Rebusan kulit bawang merah, kunyit, atau daun pandan."},
        {"id": 7,  "title": "Pewangi Ruangan Natural",         "description": "Kulit jeruk segar/kering diletakkan di sudut ruangan."},
        {"id": 8,  "title": "Media Tanam Cocopeat",            "description": "Sabut kelapa dihancurkan dan direndam air."},
        {"id": 9,  "title": "Pakan Ternak / Maggot BSF",       "description": "Sisa makanan diberikan ke lalat tentara hitam."},
        {"id": 10, "title": "Scrub Badan Alami",               "description": "Dari ampas kopi seduh yang dikeringkan."},
        {"id": 11, "title": "Masker Wajah",                    "description": "Ampas teh hijau atau kopi dicampur madu."},
        {"id": 12, "title": "Repelan / Pengusir Nyamuk Bakar", "description": "Ampas kopi kering dibakar di piring kecil."},
        {"id": 13, "title": "Hiasan / Kolase Daun Kering",     "description": "Kerajinan tugas sekolah anak dari dedaunan."},
        {"id": 14, "title": "Pembatas Buku Transparan",        "description": "Daun kering dipres dan dilaminating."},
        {"id": 15, "title": "Sabun Mandi Organik",             "description": "Minyak kelapa / minyak sisa bersih dicampur ekstrak bunga/kopi."},
    ],
    # B3, Medis, nonsampah tidak punya ide upcycling — penanganan khusus
    "B3":        [],
    "Medis":     [],
    "nonsampah": [],
}


def get_upcycle_ideas(label: str) -> List[Dict]:
    """
    Kembalikan daftar ide upcycling untuk label klasifikasi.
    Contoh: "Plastik" → list 20 ide

    Returns list kosong jika label tidak punya ide (B3, Medis, nonsampah).
    """
    return _UPCYCLE_IDEAS.get(label, [])


def get_upcycle_idea_by_id(label: str, idea_id: int) -> Dict | None:
    """Kembalikan satu ide berdasarkan label dan id."""
    ideas = get_upcycle_ideas(label)
    return next((i for i in ideas if i["id"] == idea_id), None)


def get_upcycle_count(label: str) -> int:
    """Kembalikan jumlah ide upcycling untuk label tertentu."""
    return len(get_upcycle_ideas(label))