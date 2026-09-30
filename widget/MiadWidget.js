// widget/MiadWidget.js
import React from "react";
import {
  FlexWidget,
  TextWidget,
  SvgWidget,
  ImageWidget,
} from "react-native-android-widget";
import { VAKITLER } from "./vakitHelper";
import LogoImage from "../assets/icon.png";
// NOT: react-native-android-widget'ta rgba() DESTEKLENMEZ → sadece düz hex renkler.
const C = {
  bg: "#12233F",
  cell: "#0C1A31",
  gold: "#E6C77E",
  text: "#F3EEE0",
  muted: "#9FB0C8",
  pill: "#2B3B57",
};

const svg = (inner) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${inner}</svg>`;

const rays = (cx, cy, r1, r2, angles, color) =>
  angles
    .map((a) => {
      const t = (a * Math.PI) / 180;
      const f = (n) => n.toFixed(2);
      return `<line x1="${f(cx + r1 * Math.cos(t))}" y1="${f(cy - r1 * Math.sin(t))}" x2="${f(
        cx + r2 * Math.cos(t),
      )}" y2="${f(cy - r2 * Math.sin(t))}" stroke="${color}" stroke-width="1.8" stroke-linecap="round"/>`;
    })
    .join("");

const bar = (x, y, w, color) =>
  `<rect x="${x}" y="${y}" width="${w}" height="1.5" rx=".75" fill="${color}"/>`;

const halfSun = (color) =>
  `<path d="M6.5 15a5.5 5.5 0 0 1 11 0z" fill="${color}"/>` +
  rays(12, 15, 8, 10.5, [10, 50, 90, 130, 170], color) +
  bar(3, 17.4, 18, color) +
  bar(6, 20.4, 12, color);

const ICONS = {
  imsak: svg(
    `<path d="M4 14a8 8 0 0 1 16 0z" fill="#F7B48F"/>` +
      bar(4, 16.2, 16, "#F7B48F") +
      bar(6, 18.8, 12, "#F7B48F") +
      bar(8, 21.4, 8, "#F7B48F"),
  ),
  gunes: svg(halfSun(C.gold)),
  ogle: svg(
    `<circle cx="12" cy="12" r="4.6" fill="${C.gold}"/>` +
      rays(12, 12, 7.6, 10.4, [0, 45, 90, 135, 180, 225, 270, 315], C.gold),
  ),
  ikindi: svg(
    `<circle cx="12" cy="12" r="4.6" fill="${C.gold}"/>` +
      rays(12, 12, 7.6, 10.4, [0, 45, 90, 135, 180, 225, 270, 315], C.gold),
  ),
  aksam: svg(halfSun("#F08A4B")),
  yatsi: svg(
    `<path d="M20 13.2A8.4 8.4 0 1 1 10.8 3.9 6.6 6.6 0 0 0 20 13.2z" fill="${C.gold}"/>` +
      `<path d="M18.4 3.2l.9 1.9 2.1.3-1.5 1.5.4 2.1-1.9-1-1.9 1 .4-2.1-1.5-1.5 2.1-.3z" fill="${C.gold}"/>`,
  ),
};

const PIN_ICON = svg(
  `<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" fill="${C.muted}"/>`,
);

const CALENDAR_ICON = svg(
  `<path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" fill="${C.muted}"/>`,
);

const LOGO = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
  <rect width="40" height="40" rx="14" fill="#0A1628"/>
  <path d="M27 27.5c-5.2 1.3-10.2-1.7-11.5-6.9-1.1-4.5 1-9.1 4.9-11.3-3 4.8-1.8 11 2.9 14 2 1.3 4.3 1.7 6.5 1.4-.6 1.1-1.6 2-2.8 2.8z" fill="${C.gold}"/>
  <rect x="19.2" y="9" width="1.6" height="7" rx="0.8" fill="${C.gold}"/>
  <circle cx="20" cy="7.6" r="1.5" fill="${C.gold}"/>
</svg>`;

/* ---------- Tek vakit kutusu ---------- */
function VakitKutusu({ v, saat, k }) {
  const px = (n) => Math.round(n * k);
  return (
    <FlexWidget
      style={{
        flex: 1,
        height: px(34),
        margin: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: C.cell,
        borderRadius: px(9),
        borderWidth: 0,
      }}
    >
      <FlexWidget
        style={{
          flexDirection: "column",
          alignItems: "center",
          marginRight: px(3),
        }}
      >
        <SvgWidget
          svg={ICONS[v.id]}
          style={{ width: px(15), height: px(15) }}
        />
      </FlexWidget>

      <FlexWidget style={{ flexDirection: "column" }}>
        <FlexWidget style={{ flexDirection: "row", alignItems: "center" }}>
          <TextWidget
            text={v.buyuk}
            style={{ fontSize: px(8), fontWeight: "bold", color: C.text }}
          />
        </FlexWidget>
        <TextWidget
          text={saat || "--:--"}
          style={{ fontSize: px(12), fontWeight: "bold", color: "#FFFFFF" }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}

/* ---------- Ana widget ---------- */
export function MiadWidget({ vakitler, suAnId, sehir, tarih, width }) {
  const k = Math.max(0.7, Math.min(1.4, (width || 400) / 400));
  const px = (n) => Math.round(n * k);
  const satir1 = VAKITLER.slice(0, 3);
  const satir2 = VAKITLER.slice(3, 6);

  // 'Bugün:' kısmını temizle
  const temizTarih = tarih ? String(tarih).replace(/^Bugün:\s*/i, "") : "";

  const kutu = (v) => (
    <VakitKutusu
      key={v.id}
      v={v}
      k={k}
      saat={vakitler ? vakitler[v.id] : null}
    />
  );

  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        width: "match_parent",
        height: "match_parent",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: C.bg,
        borderRadius: px(20),
        padding: px(7),
      }}
    >
      {/* SOL: Logo + Başlık ve altında Konum + Tarih */}
      <FlexWidget
        style={{
          flex: 4,
          flexDirection: "column",
          justifyContent: "center",
          paddingRight: px(6),
        }}
      >
        <FlexWidget style={{ flexDirection: "row", alignItems: "center" }}>
          <ImageWidget
            image={LogoImage}
            imageWidth={px(28)}
            imageHeight={px(28)}
            radius={px(8)}
            style={{ marginRight: px(12) }}
          />
          <FlexWidget style={{ flexDirection: "column" }}>
            <TextWidget
              text="Miad"
              style={{ fontSize: px(12), fontWeight: "bold", color: C.gold }}
            />
            <TextWidget
              text="Namaz Vakitleri"
              style={{ fontSize: px(8), color: C.muted }}
            />
          </FlexWidget>
        </FlexWidget>

        <FlexWidget style={{ flexDirection: "column", marginTop: px(5) }}>
          {/* Konum Satırı */}
          <FlexWidget style={{ flexDirection: "row", alignItems: "center" }}>
            <SvgWidget
              svg={PIN_ICON}
              style={{ width: px(9), height: px(9), marginRight: px(3) }}
            />
            <TextWidget
              text={sehir || "Türkiye"}
              style={{ fontSize: px(9), color: C.muted, fontWeight: "bold" }}
            />
          </FlexWidget>

          {/* Tarih Satırı */}
          <FlexWidget
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: px(2),
            }}
          >
            <SvgWidget
              svg={CALENDAR_ICON}
              style={{ width: px(8.5), height: px(8.5), marginRight: px(3) }}
            />
            <TextWidget
              text={temizTarih}
              style={{ fontSize: px(8.5), color: C.muted }}
            />
          </FlexWidget>
        </FlexWidget>
      </FlexWidget>

      {/* SAĞ IZGARA: Vakit kutuları */}
      <FlexWidget style={{ flex: 5, flexDirection: "column" }}>
        <FlexWidget style={{ flexDirection: "row", width: "match_parent" }}>
          {satir1.map(kutu)}
        </FlexWidget>
        <FlexWidget style={{ flexDirection: "row", width: "match_parent" }}>
          {satir2.map(kutu)}
        </FlexWidget>
      </FlexWidget>
    </FlexWidget>
  );
}

/* ---------- Hata Durumu Bileşeni ---------- */
export function MiadWidgetHata({ mesaj }) {
  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        width: "match_parent",
        height: "match_parent",
        backgroundColor: "#12233F",
        borderRadius: 20,
        padding: 14,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <TextWidget
        text="Miad"
        style={{
          color: "#E6C77E",
          fontSize: 15,
          fontWeight: "bold",
          marginBottom: 5,
        }}
      />
      <TextWidget
        text={mesaj || "Vakitler yüklenemedi. Uygulamayı açıp tekrar deneyin."}
        style={{ color: "#F3EEE0", fontSize: 11, textAlign: "center" }}
      />
    </FlexWidget>
  );
}
