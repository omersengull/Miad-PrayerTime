// components/GununIcerigi.js
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "../constants/prayers";
import IcerikData from "../constants/icerikler.json";

const ESMAUL_HUSNA = [
  {
    ad: "Allah (C.C.)",
    anlam: "Eşi benzeri olmayan, bütün noksan sıfatlardan münezzeh tek ilah.",
  },
  {
    ad: "Er-Rahmân",
    anlam:
      "Dünyada bütün mahlukata merhamet eden, şefkat gösteren, ihsan eden.",
  },
  {
    ad: "Er-Rahîm",
    anlam: "Ahirette, müminlere sonsuz ikram, lütuf ve ihsanda bulunan.",
  },
  { ad: "El-Melik", anlam: "Mülkün, kainatın mutlak sahibi." },
  {
    ad: "El-Kuddûs",
    anlam: "Her türlü eksiklikten uzak, bütün kemal sıfatlarla muttasıf olan.",
  },
  { ad: "Es-Selâm", anlam: "Her türlü tehlikelerden selamete çıkaran." },
  { ad: "El-Mü'min", anlam: "Güven veren, emin kılan, koruyan." },
  { ad: "El-Müheymin", anlam: "Her şeyi görüp gözeten, koruyan." },
  { ad: "El-Azîz", anlam: "İzzet sahibi, her şeye galip olan." },
  {
    ad: "El-Cebbâr",
    anlam:
      "Dilediğini zorla yaptırmaya muktedir olan, azamet ve kudret sahibi.",
  },
  { ad: "El-Mütekebbir", anlam: "Büyüklükte eşi ve benzeri olmayan." },
  { ad: "El-Hâlık", anlam: "Yaratan, yoktan var eden." },
  { ad: "El-Bâri'", anlam: "Her şeyi kusursuz ve uyumlu yaratan." },
  { ad: "El-Musavvir", anlam: "Varlıklara şekil ve özellik veren." },
  { ad: "El-Gaffâr", anlam: "Günahları çok örten ve bağışlayan." },
  { ad: "El-Kahhâr", anlam: "Her şeye galip gelen, hakim olan." },
  { ad: "El-Vehhâb", anlam: "Karşılıksız bol ihsanlarda bulunan." },
  { ad: "Er-Rezzâk", anlam: "Bütün mahlukata rızık veren." },
  { ad: "El-Fettâh", anlam: "Her türlü zorlukları açan ve kolaylaştıran." },
  { ad: "El-Alîm", anlam: "Her şeyi en ince detayına kadar bilen." },
  { ad: "El-Kâbıd", anlam: "Dilediğine darlık veren, sıkan." },
  { ad: "El-Bâsıt", anlam: "Dilediğine bolluk veren, genişleten." },
  { ad: "El-Hâfıd", anlam: "Dereceleri alçaltan." },
  { ad: "Er-Râfi'", anlam: "Dereceleri yükselten, şeref veren." },
  { ad: "El-Mu'izz", anlam: "İzzet veren, aziz kılan." },
  { ad: "El-Müzill", anlam: "Zelil eden, hor ve hakir kılan." },
  { ad: "Es-Semî'", anlam: "Her şeyi en iyi işiten." },
  { ad: "El-Basîr", anlam: "Her şeyi en iyi gören." },
  { ad: "El-Hakem", anlam: "Hükmeden, hak ile batılı ayıran, mutlak hakim." },
  { ad: "El-Adl", anlam: "Mutlak adalet sahibi." },
  { ad: "El-Latîf", anlam: "Lütuf ve ihsan sahibi, en ince işleri bilen." },
  { ad: "El-Habîr", anlam: "Her şeyin gizli iç yüzünden haberdar olan." },
  { ad: "El-Halîm", anlam: "Yumuşak davranan, cezada acele etmeyen." },
  { ad: "El-Azîm", anlam: "Pek yüce, azamet sahibi." },
  { ad: "El-Gafûr", anlam: "Affı ve mağfireti bol olan." },
  { ad: "Eş-Şekûr", anlam: "Az amele çok sevap veren." },
  { ad: "El-Aliyy", anlam: "Çok yüce, ulüv sahibi." },
  { ad: "El-Kebîr", anlam: "Pek büyük." },
  { ad: "El-Hafîz", anlam: "Her şeyi koruyup gözeten." },
  { ad: "El-Mukît", anlam: "Rızıkları yaratan ve tayin eden." },
  { ad: "El-Hasîb", anlam: "Kulların hesabını en iyi gören." },
  { ad: "El-Celîl", anlam: "Celal ve azamet sahibi." },
  { ad: "El-Kerîm", anlam: "Cömert, ikramı bol olan." },
  { ad: "Er-Rakîb", anlam: "Bütün varlıkları her an gözeten." },
  { ad: "El-Mucîb", anlam: "Duaları kabul eden." },
  { ad: "El-Vâsî'", anlam: "Rahmeti ve ilmi her şeyi kuşatan." },
  { ad: "El-Hakîm", anlam: "Her işi hikmetli olan." },
  { ad: "El-Vedûd", anlam: "Kullarını çok seven ve sevilmeye layık olan." },
  { ad: "El-Mecîd", anlam: "Şanı ve şerefi çok yüce olan." },
  { ad: "El-Bâis", anlam: "Ölüleri dirilten." },
  { ad: "Eş-Şehîd", anlam: "Her yerde ve her zaman hazır ve nazır olan." },
  { ad: "El-Hakk", anlam: "Varlığı hiç değişmeyen, gerçeğin ta kendisi." },
  {
    ad: "El-Vekîl",
    anlam: "Kendisine tevekkül edilenlerin işini en iyi yoluna koyan.",
  },
  { ad: "El-Kaviyy", anlam: "Pek kuvvetli, mutlak güç sahibi." },
  { ad: "El-Metîn", anlam: "Çok sağlam, sarsılmaz güç sahibi." },
  { ad: "El-Veliyy", anlam: "İnananların dostu, yardımcısı." },
  { ad: "El-Hamîd", anlam: "Her türlü hamd ve övgüye layık olan." },
  { ad: "El-Muhsî", anlam: "Varlıkların sayılarını tek tek bilen." },
  { ad: "El-Mübdi'", anlam: "Mahlukatı örneksiz ve maddesiz yaratan." },
  {
    ad: "El-Muîd",
    anlam: "Yaratılmışları yok ettikten sonra tekrar dirilten.",
  },
  { ad: "El-Muhyî", anlam: "Hayat veren, dirilten." },
  { ad: "El-Mümît", anlam: "Ölümü yaratan, öldüren." },
  { ad: "El-Hayy", anlam: "Ebedi hayata sahip, diri olan." },
  { ad: "El-Kayyûm", anlam: "Varlıkları ayakta tutan, kâinatı idare eden." },
  { ad: "El-Vâcid", anlam: "İstediğini, istediği an bulan." },
  { ad: "El-Macîd", anlam: "Kadri ve şanı büyük, keremi bol." },
  { ad: "El-Vâhid", anlam: "Zatında, sıfatlarında ve fiillerinde tek olan." },
  {
    ad: "Es-Samed",
    anlam: "Her şeyin kendisine muhtaç olduğu, hiçbir şeye muhtaç olmayan.",
  },
  { ad: "El-Kâdir", anlam: "Dilediğini her şeye gücü yeten." },
  { ad: "El-Muktedir", anlam: "Kudreti sonsuz, her şeye tasarruf eden." },
  { ad: "El-Mukaddim", anlam: "Dilediğini öne geçiren, yükselten." },
  { ad: "El-Muahhir", anlam: "Dilediğini arkaya bırakan, erteleyen." },
  { ad: "El-Evvel", anlam: "İlk, başlangıcı olmayan." },
  { ad: "El-Âhir", anlam: "Son, sonu olmayan." },
  { ad: "Ez-Zâhir", anlam: "Varlığı açık ve aşikar olan." },
  { ad: "El-Bâtın", anlam: "Akılların idrak edemeyeceği kadar gizli olan." },
  { ad: "El-Vâlî", anlam: "Kâinatı ve bütün olayları idare eden." },
  { ad: "El-Müteâlî", anlam: "Yücelerin yücesi, akalın üstünde olan." },
  { ad: "El-Berr", anlam: "İyilik ve ihsanı bol olan." },
  { ad: "Et-Tevvâb", anlam: "Tevbeleri kabul eden ve günahları bağışlayan." },
  { ad: "El-Müntekim", anlam: "Suçluların cezasını veren, intikam alan." },
  { ad: "El-Afüvv", anlam: "Affeden, günahları bağışlayan." },
  { ad: "Er-Raûf", anlam: "Çok şefkatli, merhametli." },
  { ad: "Mâlikü'l-Mülk", anlam: "Mülkün ve kainatın ebedi sahibi." },
  {
    ad: "Zü'l-Celâli ve'l-İkrâm",
    anlam: "Hem celal ve azamet, hem de ikram sahibi.",
  },
  { ad: "El-Muksit", anlam: "Bütün işleri birbirine denk, adaletli yapan." },
  { ad: "El-Câmi'", anlam: "İstediğini istediği gün ve yerde toplayan." },
  { ad: "El-Ganiyy", anlam: "Hiçbir şeye muhtaç olmayan, zengin." },
  { ad: "El-Mugnî", anlam: "Dilediğini zengin eden, ihtiyaç gideren." },
  { ad: "El-Mâni'", anlam: "Dilemediği şeyin gerçekleşmesine engel olan." },
  { ad: "Ed-Dârr", anlam: "Zararlı şeyler yaratan (imtihan için)." },
  { ad: "En-Nâfi'", anlam: "Faydalı şeyler yaratan, menfaat veren." },
  { ad: "En-Nûr", anlam: "Alemleri nurlandıran, aydınlatan." },
  { ad: "El-Hâdî", anlam: "Hidayet veren, doğru yola ileten." },
  { ad: "El-Bedî'", anlam: "Örneksiz, eşsiz, harikulade yaratan." },
  { ad: "El-Bâkî", anlam: "Varlığının sonu olmayan, ebedi." },
  { ad: "El-Varis", anlam: "Her şeyin asıl sahibi, geriye kalan." },
  { ad: "Er-Reşîd", anlam: "Doğru yolu gösteren, irşat eden." },
  { ad: "Es-Sabûr", anlam: "Çok sabırlı olan, cezada acele etmeyen." },
];
export default function GununIcerigi() {
  const [expanded, setExpanded] = useState(false);
  // React Native'in 100% güvenilir Animasyon Motoru
  const animation = useRef(new Animated.Value(0)).current;

  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

  const ayetListesi = IcerikData.ayetler || [];
  const hadisListesi = IcerikData.hadisler || [];

  const ayetIndex =
    ayetListesi.length > 0 ? (dayOfYear - 1) % ayetListesi.length : 0;
  const hadisIndex =
    hadisListesi.length > 0 ? (dayOfYear - 1) % hadisListesi.length : 0;

  const gununAyeti =
    ayetListesi.length > 0
      ? ayetListesi[ayetIndex]
      : { metin: "Ayet bulunamadı", kaynak: "" };
  const gununHadisi =
    hadisListesi.length > 0
      ? hadisListesi[hadisIndex]
      : { metin: "Hadis bulunamadı", kaynak: "" };

  const esmaIndex = (dayOfYear - 1) % ESMAUL_HUSNA.length;
  const gununEsmasi = ESMAUL_HUSNA[esmaIndex];

  const toggleExpand = () => {
    const toValue = expanded ? 0 : 1;
    setExpanded(!expanded);
    Animated.timing(animation, {
      toValue,
      duration: 350,
      useNativeDriver: false, // height animasyonu için false olmalı
    }).start();
  };

  // 0'dan 500 yüksekliğine ve 0'dan 1 opaklığa animasyonla geçiş
  const maxHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 700], // 500 yerine 700
  });
  const opacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <View style={styles.iconBox}>
            <MaterialCommunityIcons
              name="book-open-variant"
              size={20}
              color={COLORS.text}
            />
          </View>
          <Text style={styles.headerTitle}>Ayet, Hadis, Esmâü'l-Hüsnâ</Text>
        </View>
        <MaterialCommunityIcons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={24}
          color={COLORS.textMuted}
        />
      </TouchableOpacity>

      {/* ANİMASYONLU İÇERİK KUTUSU */}
      <Animated.View style={{ maxHeight, opacity, overflow: "hidden" }}>
        <View style={styles.contentArea}>
          <View style={styles.section}>
            <Text style={styles.sectionBadge}>AYET-İ KERİME</Text>
            <Text style={styles.contentText}>"{gununAyeti.metin}"</Text>
            {gununAyeti.kaynak ? (
              <Text style={styles.sourceText}>- {gununAyeti.kaynak}</Text>
            ) : null}
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionBadge}>HADİS-İ ŞERİF</Text>
            <Text style={styles.contentText}>"{gununHadisi.metin}"</Text>
            {gununHadisi.kaynak ? (
              <Text style={styles.sourceText}>- {gununHadisi.kaynak}</Text>
            ) : null}
          </View>
          <View style={styles.divider} />
          <View style={styles.section}>
            <Text style={styles.sectionBadge}>ESMÂÜ'L-HÜSNÂ</Text>
            <Text style={styles.esmaName}>{gununEsmasi.ad}</Text>
  <Text style={styles.esmaMeaning}>{gununEsmasi.anlam}</Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

// ---- TASARIM KODLARI ----
const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 5,
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  contentArea: { paddingHorizontal: 20, paddingBottom: 20 },
  section: { marginTop: 10 },
  sectionBadge: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 1,
    marginBottom: 8,
  },
  contentText: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 22,
    fontStyle: "italic",
    textAlign: "justify",
    opacity: 0.9,
  },
  sourceText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "right",
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginVertical: 12,
    marginHorizontal: 10,
  },
  esmaContainer: {
    marginTop: 5,
  },
  esmaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
esmaName: {
    color: "#f3b448", // Canlı altın/amber rengi (veya alternatif: '#FFD700')
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
    letterSpacing: 0.5,
    textAlign: "center",
  },
  esmaMeaning: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    opacity: 0.9,
  },
});
