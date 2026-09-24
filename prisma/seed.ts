import { PrismaClient, Role, StoryStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ============================================
// USERS
// ============================================
const users = [
  {
    username: "admin",
    email: "admin@example.com",
    name: "Admin Peta Cerita",
    password: "Admin123",
    role: "ADMIN" as Role,
    points: 500,
  },
  {
    username: "moderator",
    email: "moderator@example.com",
    name: "Moderator Peta Cerita",
    password: "Mod123",
    role: "MODERATOR" as Role,
    points: 300,
  },
  {
    username: "user",
    email: "user@example.com",
    name: "User Biasa",
    password: "User123",
    role: "USER" as Role,
    points: 100,
  },
  {
    username: "sheila",
    email: "sheila@example.com",
    name: "Sheila Contributor",
    password: "Sheila123",
    role: "USER" as Role,
    points: 250,
  },
];

// ============================================
// CATEGORIES
// ============================================
const categories = [
  { name: "Sejarah", slug: "sejarah", icon: "Landmark", color: "#b45309" },
  { name: "Legenda", slug: "legenda", icon: "Sparkles", color: "#7c3aed" },
  { name: "Budaya", slug: "budaya", icon: "Palette", color: "#0891b2" },
  { name: "Tokoh", slug: "tokoh", icon: "User", color: "#dc2626" },
  { name: "Kuliner", slug: "kuliner", icon: "UtensilsCrossed", color: "#ea580c" },
  { name: "Tradisi", slug: "tradisi", icon: "Drama", color: "#16a34a" },
  { name: "Tempat Bersejarah", slug: "tempat", icon: "Building2", color: "#2563eb" },
  { name: "Cerita Rakyat", slug: "cerita-rakyat", icon: "BookOpen", color: "#c026d3" },
  { name: "Edukasi", slug: "edukasi", icon: "GraduationCap", color: "#0d9488" },
  { name: "Misteri", slug: "misteri", icon: "Eye", color: "#4c1d95" },
];

// ============================================
// ACHIEVEMENTS
// ============================================
const achievements = [
  {
    name: "First Story",
    description: "Kontribusi cerita pertama kamu",
    icon: "Trophy",
    requirement: JSON.stringify({ type: "story_count", value: 1 }),
    points: 100,
  },
  {
    name: "Storyteller",
    description: "5 cerita disetujui",
    icon: "BookOpen",
    requirement: JSON.stringify({ type: "story_count", value: 5 }),
    points: 100,
  },
  {
    name: "Historian",
    description: "10 cerita disetujui",
    icon: "GraduationCap",
    requirement: JSON.stringify({ type: "story_count", value: 10 }),
    points: 100,
  },
  {
    name: "Local Explorer",
    description: "Membaca cerita dari 5 daerah berbeda",
    icon: "Compass",
    requirement: JSON.stringify({ type: "city_count", value: 5 }),
    points: 100,
  },
  {
    name: "Master Contributor",
    description: "25 cerita disetujui",
    icon: "Crown",
    requirement: JSON.stringify({ type: "story_count", value: 25 }),
    points: 100,
  },
];

// ============================================
// STORIES (15 cerita Indonesia)
// ============================================
type StorySeed = {
  title: string;
  synopsis: string;
  content: string;
  categorySlug: string;
  latitude: number;
  longitude: number;
  city: string;
  province: string;
  period: string;
  source: string;
  authorUsername: string;
  heroImage?: string;
};

const stories: StorySeed[] = [
  {
    title: "Legenda Situ Bagendit",
    synopsis:
      "Kisah seorang janda kaya yang pelit bernama Nyai Bagendit, dikutuk menjadi danau karena menolak membantu orang miskin.",
    content:
      "Pada zaman dahulu di daerah Garut, hiduplah seorang janda kaya bernama Nyai Bagendit. Ia sangat pelit dan tidak pernah mau membantu orang miskin yang datang meminta sedekah. Suatu hari, seorang kakek tua datang meminta air minum. Nyai Bagendit dengan kasar menolaknya. Kakek itu lalu menusukkan tongkatnya ke tanah, dan seketika air memancar deras dari bekas tusukan tongkat. Air terus mengalir hingga menenggelamkan seluruh desa dan rumah Nyai Bagendit. Tempat itu kini dikenal sebagai Situ Bagendit, sebuah danau yang menjadi pengingat akan pentingnya berbagi rezeki dengan sesama.",
    categorySlug: "legenda",
    latitude: -7.1924,
    longitude: 107.9036,
    city: "Garut",
    province: "Jawa Barat",
    period: "Cerita rakyat",
    source: "Tradisi lisan masyarakat Sunda, dikumpulkan dari berbagai versi cerita rakyat Nusantara.",
    authorUsername: "sheila",
  },
  {
    title: "Candi Borobudur",
    synopsis:
      "Candi Buddha terbesar di dunia yang dibangun pada abad ke-8 oleh dinasti Syailendra, dengan 2.672 panel relief dan 504 arca Buddha.",
    content:
      "Candi Borobudur adalah candi Buddha Mahayana terbesar di dunia yang terletak di Magelang, Jawa Tengah. Dibangun pada abad ke-8 dan ke-9 oleh dinasti Syailendra, candi ini memiliki struktur mandala yang melambangkan kosmologi Buddha. Terdiri dari 9 tingkat, dengan 6 tingkat berbentuk bujur sangkar dan 3 tingkat berbentuk lingkaran. Dinding-dindingnya dihiasi 2.672 panel relief yang menceritakan kisah kehidupan Buddha dan ajaran-ajaran moral. Di puncaknya terdapat stupa induk yang dikelilingi 72 stupa berlubang, masing-masing berisi arca Buddha yang sedang bermeditasi. Candi ini merupakan salah satu Situs Warisan Dunia UNESCO dan menjadi destinasi wisata spiritual terpenting di Indonesia.",
    categorySlug: "tempat",
    latitude: -7.6079,
    longitude: 110.2038,
    city: "Magelang",
    province: "Jawa Tengah",
    period: "Abad ke-8 Masehi",
    source: "Buku 'Borobudur: Golden Tales of the Buddhas' oleh John Miksic, dan arsip UNESCO.",
    authorUsername: "admin",
  },
  {
    title: "Rendang, Kuliner Terenak di Dunia",
    synopsis:
      "Rendang adalah masakan tradisional Minangkabau berbahan dasar daging sapi dengan bumbu rempah kaya yang dimasak berjam-jam.",
    content:
      "Rendang adalah masakan tradisional dari Minangkabau, Sumatera Barat, yang terbuat dari daging sapi yang dimasak dengan santan dan campuran rempah-rempah selama berjam-jam hingga kuahnya mengering dan berwarna coklat gelap. Bumbu utamanya meliputi cabai, lengkuas, serai, kunyit, jahe, bawang merah, bawang putih, dan berbagai rempah lainnya. Proses memasak yang lama membuat rendang memiliki cita rasa yang kompleks dan tahan lama. Rendang bukan hanya makanan, tetapi juga simbol kebesaran dalam acara-acara adat Minangkabau. Pada tahun 2011 dan 2017, rendang dinobatkan sebagai makanan terenak di dunia oleh CNN International dalam daftar 'World's 50 Best Foods'.",
    categorySlug: "kuliner",
    latitude: -0.9471,
    longitude: 100.4172,
    city: "Padang",
    province: "Sumatera Barat",
    period: "Tradisi kuliner Minangkabau",
    source: "Buku 'Rendang: Warisan Kuliner Minangkabau' dan liputan CNN International.",
    authorUsername: "sheila",
  },
  {
    title: "Pangeran Diponegoro dan Perang Jawa",
    synopsis:
      "Pahlawan nasional yang memimpin Perang Jawa (1825-1830) melawan penjajahan Belanda, salah satu perang terbesar dalam sejarah Indonesia.",
    content:
      "Pangeran Diponegoro (1785-1855) adalah salah satu pahlawan nasional Indonesia yang paling dihormati. Ia memimpin Perang Jawa (1825-1830) melawan pemerintahan kolonial Belanda, salah satu konflik terbesar yang pernah dihadapi Belanda di Hindia Belanda. Perang ini dipicu oleh ketidakpuasan Diponegoro terhadap kebijakan Belanda yang merampas tanah rakyat dan mengganggu makam leluhurnya di Tegalrejo. Selama lima tahun, pasukan Diponegoro berhasil membuat Belanda kewalahan dengan taktik perang gerilya. Pada akhirnya, Diponegoro ditangkap melalui tipu muslihat dalam perundingan di Magelang pada 28 Maret 1830. Ia diasingkan ke Makassar hingga wafat pada 8 Januari 1855. Perjuangannya menjadi inspirasi bagi pergerakan nasional Indonesia di kemudian hari.",
    categorySlug: "tokoh",
    latitude: -7.7956,
    longitude: 110.3695,
    city: "Yogyakarta",
    province: "DI Yogyakarta",
    period: "1825-1830",
    source: "Buku 'Diponegoro: A Political Biography' oleh Peter Carey dan arsip nasional.",
    authorUsername: "admin",
  },
  {
    title: "Tari Kecak Bali",
    synopsis:
      "Tarian dramatis Bali yang dimainkan oleh puluhan penari pria dengan suara 'cak cak cak' mengelilingi api, menceritakan kisah Ramayana.",
    content:
      "Tari Kecak adalah tarian tradisional Bali yang unik karena tidak diiringi alat musik, melainkan suara 'cak cak cak' dari puluhan penari pria yang duduk melingkar. Tarian ini menceritakan kisah Ramayana, khususnya bagian di mana pasukan kera membantu Rama menyelamatkan Sita dari Rahwana. Tari Kecak pertama kali dikembangkan pada tahun 1930-an oleh Wayan Limbak bersama seniman Jerman Walter Spies. Pertunjukan biasanya dilakukan saat senja di Pura Uluwatu dengan latar belakang laut dan matahari terbenam. Penonton duduk melingkari pertunjukan, dan suasana menjadi sangat dramatis ketika penari api menari di tengah lingkaran. Tari Kecak kini menjadi salah satu ikon budaya Bali yang paling dikenal di dunia.",
    categorySlug: "tradisi",
    latitude: -8.8291,
    longitude: 115.0849,
    city: "Badung",
    province: "Bali",
    period: "1930-an (modernisasi)",
    source: "Buku 'Dance and Drama in Bali' oleh Walter Spies dan Beryl de Zoete.",
    authorUsername: "sheila",
  },
  {
    title: "Gedung Sate, Ikon Bandung",
    synopsis:
      "Gedung bersejarah bergaya arsitektur Indo-Eropa dengan ornamen tusuk sate di puncaknya, dibangun pada 1920.",
    content:
      "Gedung Sate adalah gedung bersejarah di Bandung, Jawa Barat, yang dibangun pada tahun 1920 oleh arsitek Belanda J. Gerber. Nama 'Gedung Sate' berasal dari ornamen di puncak menara yang menyerupai tusuk sate dengan 6 sate yang melambangkan biaya pembangunan 6 juta gulden. Gedung ini awalnya digunakan sebagai kantor Departemen Lalu Lintas dan Pekerjaan Umum Hindia Belanda. Arsitekturnya memadukan gaya Indo-Eropa dengan sentuhan tradisional Indonesia. Kini Gedung Sate menjadi kantor Gubernur Jawa Barat dan salah satu ikon wisata heritage Bandung. Pengunjung dapat menikmati keindahan arsitektur, museum, dan pemandangan kota dari menara gedung.",
    categorySlug: "sejarah",
    latitude: -6.9024,
    longitude: 107.6187,
    city: "Bandung",
    province: "Jawa Barat",
    period: "1920",
    source: "Buku 'Bandung: The Architecture of a City' dan arsip Pemerintah Provinsi Jawa Barat.",
    authorUsername: "admin",
  },
  {
    title: "Danau Toba dan Legenda Toba",
    synopsis:
      "Danau vulkanik terbesar di dunia, terbentuk dari letusan supervolcano 74.000 tahun lalu, dengan legenda kuno tentang pemuda bernama Toba.",
    content:
      "Danau Toba adalah danau vulkanik terbesar di dunia yang terletak di Sumatera Utara, Indonesia. Danau ini terbentuk dari letusan supervolcano sekitar 74.000 tahun yang lalu, salah satu letusan terbesar dalam 25 juta tahun terakhir. Di tengah danau terdapat Pulau Samosir, pulau vulkanik yang hampir sebesar Singapura. Legenda setempat menceritakan tentang seorang pemuda bernama Toba yang menikahi seorang putri ikan dan melanggar janjinya, menyebabkan banjir besar yang membentuk danau. Masyarakat Batak yang tinggal di sekitar danau memiliki budaya yang kaya dengan rumah adat bolon, tarian tortor, dan musik gondang. Danau Toba ditetapkan sebagai Geopark Global UNESCO pada tahun 2020.",
    categorySlug: "legenda",
    latitude: 2.6845,
    longitude: 98.8756,
    city: "Samosir",
    province: "Sumatera Utara",
    period: "74.000 tahun lalu (geologi)",
    source: "UNESCO Global Geopark dan cerita rakyat Batak.",
    authorUsername: "sheila",
  },
  {
    title: "Kopi Luwak, Kopi Termahal di Dunia",
    synopsis:
      "Kopi yang difermentasi secara alami di dalam sistem pencernaan luwak, menghasilkan cita rasa unik dan harga fantastis.",
    content:
      "Kopi Luwak adalah kopi yang dihasilkan dari biji kopi yang telah dimakan dan difermentasi di dalam sistem pencernaan luwak (Paradoxurus hermaphroditus). Proses fermentasi alami ini menghasilkan biji kopi dengan cita rasa yang unik dan kompleks, dengan aroma yang harum dan rasa yang lembut. Kopi ini pertama kali populer pada era kolonial Belanda ketika petani dilarang memetik kopi untuk konsumsi pribadi, sehingga mereka mengumpulkan biji kopi dari kotoran luwak. Kini Kopi Luwak menjadi salah satu kopi termahal di dunia dengan harga mencapai ratusan ribu rupiah per cangkir. Namun, praktik peternakan luwak yang tidak etis telah menjadi kontroversi global.",
    categorySlug: "kuliner",
    latitude: -8.5069,
    longitude: 115.2625,
    city: "Gianyar",
    province: "Bali",
    period: "Era kolonial Belanda",
    source: "Buku 'The Coffee Trader' dan liputan industri kopi Indonesia.",
    authorUsername: "user",
  },
  {
    title: "Upacara Ngaben di Bali",
    synopsis:
      "Upacara kremasi Hindu Bali untuk melepaskan roh dari tubuh fisik menuju kehidupan selanjutnya.",
    content:
      "Ngaben adalah upacara kremasi dalam tradisi Hindu Bali yang bertujuan untuk melepaskan roh orang yang meninggal dari tubuh fisiknya agar dapat bersatu dengan Sang Pencipta. Upacara ini melibatkan prosesi panjang dengan bade (menara pembakaran) yang dihias indah dan diusung oleh puluhan orang. Keluarga yang berduka mengenakan pakaian putih dan mengiringi prosesi dengan gamelan tradisional. Setelah kremasi, abu dibuang ke laut atau sungai sebagai simbol pengembalian elemen ke alam. Ngaben adalah salah satu upacara paling penting dan paling meriah dalam budaya Bali, sering melibatkan seluruh desa dan memakan biaya besar. Filosofinya adalah bahwa kematian bukan akhir, melainkan awal dari perjalanan baru.",
    categorySlug: "tradisi",
    latitude: -8.4095,
    longitude: 115.1889,
    city: "Denpasar",
    province: "Bali",
    period: "Tradisi Hindu Bali",
    source: "Buku 'Bali: Sekala and Niskala' oleh Fred B. Eiseman Jr.",
    authorUsername: "sheila",
  },
  {
    title: "Rumah Gadang Minangkabau",
    synopsis:
      "Rumah adat Sumatera Barat dengan atap melengkung seperti tanduk kerbau, simbol kekuatan dan kearifan lokal Minangkabau.",
    content:
      "Rumah Gadang adalah rumah adat Minangkabau di Sumatera Barat dengan ciri khas atapnya yang melengkung runcing ke atas menyerupai tanduk kerbau. Atap ini disebut 'gonjong' dan melambangkan kekuatan serta kejayaan suku Minangkabau. Rumah ini dibangun dari kayu dengan tiang-tiang besar, dan biasanya dihuni oleh beberapa generasi keluarga besar. Dinding-dindingnya dihiasi ukiran motif flora dan fauna dengan makna filosofis. Rumah Gadang juga berfungsi sebagai tempat musyawarah adat dan penyimpanan pusaka keluarga. Sistem kekerabatan matrilineal Minangkabau terlihat dari kepemilikan rumah yang diwariskan kepada anak perempuan. Rumah Gadang kini menjadi salah satu warisan budaya Indonesia yang dilindungi.",
    categorySlug: "budaya",
    latitude: -0.3055,
    longitude: 100.3695,
    city: "Bukittinggi",
    province: "Sumatera Barat",
    period: "Tradisi Minangkabau",
    source: "Buku 'Minangkabau Social Formations' oleh Joel S. Kahn.",
    authorUsername: "admin",
  },
  {
    title: "Borobudur Sunrise di Punthuk Setumbu",
    synopsis:
      "Spot terbaik menikmati matahari terbit dengan siluet Candi Borobudur dan Gunung Merapi di latar belakang.",
    content:
      "Punthuk Setumbu adalah bukit kecil di Magelang, Jawa Tengah, yang menjadi salah satu spot terbaik untuk menikmati matahari terbit dengan latar Candi Borobudur. Dari puncak bukit pada ketinggian 400 meter di atas permukaan laut, pengunjung dapat melihat siluet Borobudur yang dikelilingi kabut pagi, dengan Gunung Merapi dan Merbabu di latar belakang. Waktu terbaik untuk berkunjung adalah pukul 5 pagi saat langit mulai berwarna jingga keemasan. Spot ini mulai populer sejak tahun 2010-an dan menjadi destinasi favorit fotografer dan wisatawan. Tiket masuk sekitar Rp 30.000 untuk wisatawan domestik. Dari sini, perjalanan bisa dilanjutkan ke Candi Borobudur yang berjarak sekitar 3 km.",
    categorySlug: "edukasi",
    latitude: -7.6359,
    longitude: 110.1888,
    city: "Magelang",
    province: "Jawa Tengah",
    period: "Wisata modern",
    source: "Panduan wisata resmi Borobudur dan liputan media wisata.",
    authorUsername: "user",
  },
  {
    title: "Misteri Segitiga Bermuda Jawa",
    synopsis:
      "Fenomena kehilangan kapal dan pesawat di selatan Jawa yang masih menjadi misteri hingga kini.",
    content:
      "Selatan Pulau Jawa dikenal memiliki fenomena misterius yang sering disebut 'Segitiga Bermuda-nya Indonesia'. Beberapa kejadian kehilangan kapal dan pesawat dilaporkan terjadi di area ini, termasuk hilangnya beberapa pesawat komersial dan kapal nelayan tanpa jejak. Beberapa teori mencoba menjelaskan fenomena ini, mulai dari kondisi cuaca ekstrem, gelombang tinggi yang tidak terduga, hingga teori medan magnet bumi yang tidak stabil. Kawasan ini juga dikenal memiliki palung laut yang sangat dalam dan aktivitas seismik tinggi. Meskipun banyak teori, hingga kini belum ada penjelasan pasti yang diterima secara ilmiah. Fenomena ini menjadi salah satu misteri laut Indonesia yang paling menarik perhatian.",
    categorySlug: "misteri",
    latitude: -8.5,
    longitude: 110,
    city: "Yogyakarta",
    province: "DI Yogyakarta",
    period: "Fenomena modern",
    source: "Artikel dan laporan media tentang fenomena laut selatan Jawa.",
    authorUsername: "sheila",
  },
  {
    title: "Batik: Warisan Budaya Dunia",
    synopsis:
      "Seni tekstil tradisional Indonesia yang diakui UNESCO sebagai Warisan Kemanusiaan untuk Budaya Lisan dan Nonbendawi.",
    content:
      "Batik adalah seni tekstil tradisional Indonesia yang telah diakui oleh UNESCO sebagai Warisan Kemanusiaan untuk Budaya Lisan dan Nonbendawi pada tahun 2009. Teknik batik melibatkan penggunaan lilin panas untuk menggambar motif pada kain, kemudian diwarnai dan direbus untuk menghilangkan lilinnya. Setiap daerah di Indonesia memiliki motif batik khas dengan makna filosofis tersendiri. Batik Yogyakarta dan Solo memiliki motif klasik seperti parang, kawung, dan sidomukti, sedangkan batik pesisir memiliki warna cerah dengan motif flora dan fauna. Batik bukan hanya kain, tetapi juga identitas budaya dan simbol status sosial. Setiap tanggal 2 Oktober diperingati sebagai Hari Batik Nasional.",
    categorySlug: "budaya",
    latitude: -7.7956,
    longitude: 110.3695,
    city: "Yogyakarta",
    province: "DI Yogyakarta",
    period: "Tradisi kuno, diakui 2009",
    source: "UNESCO Intangible Cultural Heritage dan buku 'Batik: The Art of Indonesian Textiles'.",
    authorUsername: "admin",
  },
  {
    title: "Komodo, Naga Purba Indonesia",
    synopsis:
      "Kadal terbesar di dunia yang hanya hidup di Kepulauan Komodo, Nusa Tenggara Timur, dengan panjang hingga 3 meter.",
    content:
      "Komodo (Varanus komodoensis) adalah spesies kadal terbesar di dunia yang hanya dapat ditemukan di beberapa pulau di Indonesia, terutama Pulau Komodo, Rinca, Flores, dan Gili Motang di Nusa Tenggara Timur. Komodo dapat tumbuh hingga 3 meter panjangnya dan berat mencapai 70 kg. Mereka adalah predator puncak di habitatnya, memangsa rusa, babi hutan, dan bahkan kerbau. Komodo memiliki air liur berbakteri mematikan dan bisa mendeteksi bangkai dari jarak 9 km. Spesies ini terancam punah dengan populasi sekitar 3.000-5.000 ekor. Pulau Komodo dan sekitarnya ditetapkan sebagai Situs Warisan Dunia UNESCO pada tahun 1991 dan menjadi salah satu dari New7Wonders of Nature.",
    categorySlug: "edukasi",
    latitude: -8.5575,
    longitude: 119.4861,
    city: "Labuan Bajo",
    province: "Nusa Tenggara Timur",
    period: "Spesies purba",
    source: "Komodo National Park dan UNESCO World Heritage Centre.",
    authorUsername: "sheila",
  },
];

// ============================================
// SEED FUNCTION
// ============================================
async function main() {
  console.log("🌱 Seeding database...\n");

  // 1. Users
  console.log("👤 Creating users...");
  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.password, 12);
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        username: u.username,
        email: u.email,
        name: u.name,
        passwordHash,
        role: u.role,
        points: u.points,
      },
    });
    console.log(`   ✓ ${u.username} (${u.email})`);
  }

  // 2. Categories
  console.log("\n📂 Creating categories...");
  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
    console.log(`   ✓ ${c.name}`);
  }

  // 3. Achievements
  console.log("\n🏆 Creating achievements...");
  for (const a of achievements) {
    await prisma.achievement.upsert({
      where: { name: a.name },
      update: {},
      create: a,
    });
    console.log(`   ✓ ${a.name}`);
  }

  // 4. Stories
  console.log("\n📖 Creating stories...");
  for (const s of stories) {
    // Ambil categoryId & authorId
    const category = await prisma.category.findUnique({
      where: { slug: s.categorySlug },
    });
    const author = await prisma.user.findUnique({
      where: { username: s.authorUsername },
    });

    if (!category || !author) {
      console.log(`   ✗ Skip: ${s.title} (category/author not found)`);
      continue;
    }

    // Generate slug
    const slug = s.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const existing = await prisma.story.findUnique({ where: { slug } });
    if (existing) {
      console.log(`   ⊘ Skip: ${s.title} (already exists)`);
      continue;
    }

    await prisma.story.create({
      data: {
        title: s.title,
        slug,
        synopsis: s.synopsis,
        content: s.content,
        categoryId: category.id,
        latitude: s.latitude,
        longitude: s.longitude,
        city: s.city,
        province: s.province,
        country: "Indonesia",
        period: s.period,
        source: s.source,
        heroImage: s.heroImage || null,
        status: "PUBLISHED" as StoryStatus,
        authorId: author.id,
        approvedBy: author.id,
        approvedAt: new Date(),
      },
    });
    console.log(`   ✓ ${s.title}`);
  }

  console.log("\n✅ Seed selesai!\n");
  console.log("📋 Default accounts:");
  console.log("   Admin    : admin@example.com / Admin123");
  console.log("   Moderator: moderator@example.com / Mod123");
  console.log("   User     : user@example.com / User123");
  console.log("   Sheila   : sheila@example.com / Sheila123\n");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });