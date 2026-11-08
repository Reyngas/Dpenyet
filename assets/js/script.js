$(document).ready(function() {

    // data keranjang (data lama tanpa qty dianggap 1)
    let daftar = JSON.parse(localStorage.getItem("keranjang-dpenyet")) || [];
    daftar.forEach(function(i) { if (!i.qty) i.qty = 1; });

    // kotak toast dan badge dibuat lewat JavaScript
    $("body").append('<div id="toast" class="toast-d" role="status" aria-live="polite"></div>');
    $('a.nav-link[href="keranjang.html"]').append(' <span id="badge" class="badge badge-warning">0</span>');

    function simpan() {
        localStorage.setItem("keranjang-dpenyet", JSON.stringify(daftar));
    }

    function toast(teks) {
        $("#toast").text(teks).stop(true, true).fadeIn(150).delay(2000).fadeOut(300);
    }

    // tambah menu ke keranjang (kalau sudah ada, jumlahnya naik)
    function tambahItem(nama, harga, banyak) {
        let ada = daftar.find(function(i) { return i.nama == nama; });
        if (ada) { ada.qty += banyak; }
        else { daftar.push({ nama: nama, harga: harga, qty: banyak }); }
        simpan();
        tampil();
        toast(nama + " masuk keranjang");
    }

    // tampilkan keranjang, total, dan badge
    function tampil() {
        let jumlah = 0, total = 0, html = "";

        daftar.forEach(function(item, i) {
            jumlah += item.qty;
            total += item.harga * item.qty;
            html += '<li class="baris-keranjang"><span>' + item.nama +
                '<br><small>Rp' + item.harga.toLocaleString("id-ID") + '</small></span>' +
                '<span class="qty">' +
                '<button type="button" class="kurang" data-i="' + i + '" aria-label="Kurangi ' + item.nama + '">-</button>' +
                '<b>' + item.qty + '</b>' +
                '<button type="button" class="lebih" data-i="' + i + '" aria-label="Tambah ' + item.nama + '">+</button>' +
                '</span></li>';
        });

        $("#jumlah").text(jumlah);
        $("#total").text(total.toLocaleString("id-ID"));
        $("#badge").text(jumlah);
        $("#daftar-pesanan").html(jumlah == 0 ? "<li>Belum ada pesanan</li>" : html);
    }

    // tombol + dan - di keranjang
    $(document).on("click", ".lebih", function() {
        daftar[$(this).data("i")].qty++;
        simpan();
        tampil();
    });
    $(document).on("click", ".kurang", function() {
        let i = $(this).data("i");
        daftar[i].qty--;
        if (daftar[i].qty < 1) daftar.splice(i, 1);
        simpan();
        tampil();
    });

    // tombol Tambah di katalog
    $(".tambah").click(function() {
        tambahItem($(this).data("nama"), Number($(this).data("harga")), 1);
    });

    // tombol Kosongkan Keranjang
    $("#hapus").click(function() {
        daftar = [];
        simpan();
        tampil();
        toast("Keranjang dikosongkan");
    });

    // tombol Pesan via WhatsApp
    $("#proses-checkout").click(function() {
        let namaPelanggan = $("#nama-pelanggan").val().trim();

        if (namaPelanggan == "") {
            toast("Masukkan nama pelanggan dulu");
            return;
        }
        if (daftar.length == 0) {
            toast("Keranjang masih kosong");
            return;
        }

        let jumlah = 0, total = 0;
        let pesan = "Halo Dpenyet, saya ingin memesan:";
        pesan += "\nNama: " + namaPelanggan;
        pesan += "\nMetode: Dibawa Pulang";

        daftar.forEach(function(item) {
            jumlah += item.qty;
            total += item.harga * item.qty;
            pesan += "\n- " + item.nama + " x" + item.qty +
                " - Rp" + (item.harga * item.qty).toLocaleString("id-ID");
        });

        pesan += "\nJumlah: " + jumlah;
        pesan += "\nTotal: Rp" + total.toLocaleString("id-ID");

        let nomorWA = "6281234567890";
        window.open("https://wa.me/" + nomorWA + "?text=" + encodeURIComponent(pesan), "_blank");
    });

    // data menu untuk halaman detail
    const menu = [
        { id: 1, nama: "Paket Ayam Goreng", harga: 21000, ikon: "🍗",
          desk: "Ayam goreng dengan sambal pilihan yang nikmat dan menggugah selera.", lauk: "Ayam goreng" },
        { id: 2, nama: "Paket Ayam Bakar", harga: 32000, ikon: "🍖",
          desk: "Ayam bakar dengan bumbu meresap dan sambal pilihan.", lauk: "Ayam bakar" },
        { id: 3, nama: "Paket Telur", harga: 18000, ikon: "🍳",
          desk: "Telur goreng dengan sambal pilihan, paket paling hemat.", lauk: "Telur goreng" },
        { id: 4, nama: "Paket Lele Goreng", harga: 20000, ikon: "🐟",
          desk: "Lele goreng renyah dengan sambal pilihan.", lauk: "Lele goreng" },
        { id: 5, nama: "Paket Nila Goreng", harga: 32000, ikon: "🐟",
          desk: "Nila goreng gurih dengan sambal pilihan.", lauk: "Nila goreng" }
    ];

    // halaman detail (hanya jalan di detail.html)
    if ($("#detail-isi").length) {
        let id = new URLSearchParams(location.search).get("id") || 1;
        let p = menu.find(function(m) { return m.id == id; }) || menu[0];
        let banyak = 1;

        document.title = p.nama + " - Dpenyet";

        $("#detail-isi").html(
            '<h1>' + p.ikon + '</h1>' +
            '<h3>' + p.nama + '</h3>' +
            '<p>' + p.desk + '</p>' +
            '<p>Fasilitas Paket</p>' +
            '<ul><li>' + p.lauk + '</li><li>Nasi sepuasnya</li>' +
            '<li>Minum sepuasnya</li><li>Lalapan sepuasnya</li></ul>' +
            '<p>Pilih sambal:</p>' +
            '<label class="mr-3"><input type="radio" name="sambal" value="Terasi" checked> Terasi</label>' +
            '<label class="mr-3"><input type="radio" name="sambal" value="Bawang"> Bawang</label>' +
            '<label class="mr-3"><input type="radio" name="sambal" value="Ijo"> Ijo</label>' +
            '<h4 class="mt-3">Harga: Rp' + p.harga.toLocaleString("id-ID") + '</h4>' +
            '<p>Jumlah: <span class="qty"><button type="button" id="d-kurang" aria-label="Kurangi jumlah">-</button>' +
            '<b id="d-qty">1</b><button type="button" id="d-lebih" aria-label="Tambah jumlah">+</button></span></p>' +
            '<button id="tambah-detail" class="btn btn-warning">Tambah ke Keranjang</button>'
        );

        $("#d-lebih").click(function() { banyak++; $("#d-qty").text(banyak); });
        $("#d-kurang").click(function() { if (banyak > 1) banyak--; $("#d-qty").text(banyak); });

        $("#tambah-detail").click(function() {
            let sambal = $("input[name=sambal]:checked").val();
            tambahItem(p.nama + " (Sambal " + sambal + ")", p.harga, banyak);
        });
    }

    // pencarian, filter, dan pengurutan (hanya jalan di katalog.html)
    if ($("#daftar-menu").length) {
        let kategori = new URLSearchParams(location.search).get("kat") || "";

        $("#daftar-menu .menu-item").each(function(i) {
            $(this).attr("data-urutan", i);
        });

        const terapkan = function() {
            let kata = $("#cari").val().toLowerCase().trim();
            let urut = $("#urut").val();
            let item = $("#daftar-menu .menu-item").get();

            item.sort(function(a, b) {
                let ha = Number($(a).find(".tambah").data("harga"));
                let hb = Number($(b).find(".tambah").data("harga"));
                let na = $(a).find("h4").text().trim();
                let nb = $(b).find("h4").text().trim();

                if (urut == "murah") return ha - hb;
                if (urut == "mahal") return hb - ha;
                if (urut == "abjad") return na.localeCompare(nb);
                return $(a).data("urutan") - $(b).data("urutan");
            });
            $("#daftar-menu").append(item);

            let ditampilkan = 0;
            $(item).each(function() {
                let nama = $(this).find("h4").text().toLowerCase();
                let cocok = nama.includes(kata) &&
                    (kategori == "" || $(this).data("kategori") == kategori);
                $(this).toggle(cocok);
                if (cocok) ditampilkan++;
            });

            $("#hitung").text(ditampilkan + " menu ditemukan");
            $("#kosong").toggle(ditampilkan == 0);
        };

        $(".chip").click(function() {
            kategori = $(this).data("kat");
            $(".chip").removeClass("aktif");
            $(this).addClass("aktif");
            terapkan();
        });

        $(".chip").each(function() {
            $(this).toggleClass("aktif", $(this).data("kat") == kategori);
        });

        $("#cari, #urut").on("input", terapkan);
        terapkan();
    }

    // tampilkan keranjang dan badge saat halaman dibuka
    tampil();

});