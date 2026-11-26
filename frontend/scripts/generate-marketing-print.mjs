import { execFileSync } from "node:child_process";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import QRCode from "qrcode";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.resolve(scriptDir, "../public/marketing-print");
const site = "https://shop-link.onrender.com";
const colors = {
  forest: "#123d31",
  green: "#17684f",
  mint: "#dcefe4",
  cream: "#faf6ed",
  coral: "#f3a277",
  yellow: "#f4bf3f",
  ink: "#17382e",
  white: "#ffffff",
  muted: "#587066",
};

const escapeXml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const rect = (x, y, width, height, fill, radius = 0, extra = "") => (
  `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}" fill="${fill}" ${extra}/>`
);

const text = (value, x, y, size, fill, weight = 500, extra = "") => (
  `<text x="${x}" y="${y}" font-family="Arial, Helvetica, sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}" ${extra}>${escapeXml(value)}</text>`
);

const qrGroup = (x, y, dimension, fill = colors.ink) => {
  const { modules } = QRCode.create(site, { errorCorrectionLevel: "H" });
  const cell = dimension / modules.size;
  const squares = [];
  for (let row = 0; row < modules.size; row += 1) {
    for (let col = 0; col < modules.size; col += 1) {
      if (modules.get(row, col)) {
        squares.push(`<rect x="${(col * cell).toFixed(2)}" y="${(row * cell).toFixed(2)}" width="${cell.toFixed(2)}" height="${cell.toFixed(2)}"/>`);
      }
    }
  }
  const quiet = dimension * 0.09;
  const total = dimension + quiet * 2;
  return `<g transform="translate(${x} ${y})">${rect(0, 0, total, total, colors.white, total * 0.06)}<g transform="translate(${quiet} ${quiet})" fill="${fill}">${squares.join("")}</g></g>`;
};

const svg = (width, height, viewBox, body) => (
  `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${viewBox}" role="img" aria-labelledby="title description">\n<title id="title">ShopLink marketing artwork</title><desc id="description">Print-ready ShopLink artwork with a scannable QR code to ${site}.</desc>\n${body}\n</svg>\n`
);

const cardFront = () => {
  const body = [
    `<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${colors.forest}"/><stop offset="1" stop-color="#23785c"/></linearGradient></defs>`,
    rect(0, 0, 1125, 675, "url(#bg)"),
    `<circle cx="1020" cy="90" r="220" fill="#ffffff" opacity=".07"/>`,
    `<circle cx="40" cy="650" r="170" fill="${colors.coral}" opacity=".16"/>`,
    rect(68, 96, 116, 116, colors.mint, 34),
    text("S", 108, 181, 80, colors.forest, 800),
    text("ShopLink", 218, 172, 82, colors.white, 800, `letter-spacing="-3"`),
    text("A Thousand Shops. One Checkout.", 72, 335, 43, colors.white, 700),
    rect(72, 383, 420, 4, colors.yellow, 2),
    text("Discover local finds. Shop in one place.", 72, 448, 28, "#e5f4eb", 500),
    text("shop-link.onrender.com", 72, 582, 27, colors.white, 700),
    text("SHOP LOCAL. CHECK OUT SIMPLE.", 72, 625, 15, "#c8e8d6", 700, `letter-spacing="3"`),
    qrGroup(858, 435, 166, colors.forest),
    text("SCAN TO SHOP", 886, 657, 16, colors.white, 700, `letter-spacing="2"`),
  ].join("");
  return svg("3.75in", "2.25in", "0 0 1125 675", body);
};

const cardBack = () => {
  const body = [
    rect(0, 0, 1125, 675, colors.cream),
    `<circle cx="1090" cy="70" r="210" fill="${colors.mint}"/>`,
    `<circle cx="30" cy="650" r="160" fill="${colors.coral}" opacity=".22"/>`,
    text("LET’S GET YOU SHOPPING", 72, 105, 18, colors.green, 800, `letter-spacing="3"`),
    text("ShopLink", 72, 195, 59, colors.ink, 800),
    text("Local shops. Good finds. One checkout.", 72, 244, 24, colors.muted, 500),
    rect(72, 298, 4, 192, colors.coral, 2),
    text("+254 741 316 544", 102, 355, 29, colors.ink, 700),
    text("aobizness@gmail.com", 102, 408, 25, colors.ink, 600),
    text("shop-link.onrender.com", 102, 461, 24, colors.green, 700),
    text("ShopLink · +254 741 316 544 · aobizness@gmail.com", 72, 588, 16, colors.muted, 600),
    qrGroup(814, 241, 220, colors.ink),
    text("SCAN TO OPEN SHOPLINK", 828, 545, 15, colors.green, 800, `letter-spacing="1.5"`),
    text("Built for the shops around you.", 72, 630, 20, colors.ink, 600),
  ].join("");
  return svg("3.75in", "2.25in", "0 0 1125 675", body);
};

const poster = (variant) => {
  const width = 3579;
  const height = 5024;
  const body = [rect(0, 0, width, height, variant.background)];
  body.push(`<circle cx="3300" cy="430" r="660" fill="${variant.accent}" opacity=".23"/>`);
  body.push(`<circle cx="120" cy="4780" r="550" fill="${variant.secondary}" opacity=".7"/>`);
  body.push(rect(175, 160, 180, 180, variant.foreground, 50));
  body.push(text("S", 238, 292, 120, variant.background, 800));
  body.push(text("ShopLink", 410, 292, 112, variant.foreground, 800));
  body.push(text(variant.kicker, 180, 520, 40, variant.accent, 800, `letter-spacing="8"`));
  variant.headline.forEach((line, index) => {
    body.push(text(line, 175, 860 + index * 190, 155, variant.foreground, 800, `letter-spacing="-4"`));
  });
  body.push(text(variant.subtitle, 185, 860 + variant.headline.length * 190 + 80, 57, variant.foreground, 500));

  const photoY = 1710;
  const photoGap = 40;
  const photoWidth = (width - 2 * 180 - photoGap * (variant.photoSlots - 1)) / variant.photoSlots;
  for (let i = 0; i < variant.photoSlots; i += 1) {
    const x = 180 + i * (photoWidth + photoGap);
    const y = photoY + (variant.photoSlots === 1 ? 0 : (i % 2) * 110);
    const slotHeight = variant.photoSlots === 1 ? 1660 : 1500;
    body.push(rect(x, y, photoWidth, slotHeight, colors.white, 48, `stroke="${variant.foreground}" stroke-width="8" stroke-dasharray="24 20"`));
    body.push(`<circle cx="${x + photoWidth / 2}" cy="${y + slotHeight * 0.43}" r="120" fill="${variant.accent}" opacity=".34"/>`);
    body.push(`<path d="M${x + 90} ${y + slotHeight - 130} Q${x + photoWidth / 2} ${y + slotHeight * 0.42} ${x + photoWidth - 90} ${y + slotHeight - 130}" fill="none" stroke="${variant.foreground}" stroke-width="14" opacity=".34"/>`);
    body.push(text("ADD YOUR PRODUCT PHOTO", x + photoWidth / 2, y + slotHeight - 65, 36, variant.foreground, 800, `text-anchor="middle" letter-spacing="3"`));
  }

  const calloutY = variant.photoSlots === 1 ? 3610 : 3540;
  body.push(rect(180, calloutY, width - 360, 660, variant.foreground, 56));
  body.push(text(variant.callout, 250, calloutY + 120, 48, variant.secondary, 750));
  variant.bullets.forEach((line, index) => {
    body.push(`<circle cx="280" cy="${calloutY + 230 + index * 92}" r="12" fill="${variant.accent}"/>`);
    body.push(text(line, 330, calloutY + 249 + index * 92, 48, colors.white, 550));
  });
  const qrSize = 420;
  const footerY = 4290;
  body.push(qrGroup(205, footerY, qrSize, variant.foreground));
  body.push(text("SCAN TO OPEN SHOPLINK", 805, footerY + 102, 42, variant.foreground, 800, `letter-spacing="3"`));
  body.push(text("shop-link.onrender.com", 805, footerY + 190, 54, variant.foreground, 800));
  body.push(text(variant.footer, 805, footerY + 290, 40, variant.muted, 550));
  body.push(text("ShopLink · A Thousand Shops. One Checkout.", 180, 4935, 30, variant.foreground, 700));
  return svg("303mm", "426mm", `0 0 ${width} ${height}`, body.join(""));
};

const posters = [
  {
    key: "a-awareness",
    title: "Discover Shops Near You",
    background: "#f4f0e5",
    foreground: colors.forest,
    accent: colors.coral,
    secondary: colors.mint,
    muted: colors.muted,
    kicker: "ONE MARKETPLACE. MANY LOCAL SHOPS.",
    headline: ["YOUR CAMPUS", "IS FULL OF", "GREAT FINDS."],
    subtitle: "Discover shops near you—all in one marketplace.",
    photoSlots: 2,
    callout: "Meet your next favourite local shop.",
    bullets: ["Fashion, tech, beauty and everyday essentials", "Browse products from many sellers in one app"],
    footer: "Find local sellers. Compare. Checkout once.",
  },
  {
    key: "b-action",
    title: "Order in 2 Minutes",
    background: "#e5f2eb",
    foreground: "#123d31",
    accent: "#f4bf3f",
    secondary: "#ffffff",
    muted: "#587066",
    kicker: "LESS SCROLLING. MORE GETTING IT.",
    headline: ["TWO MINUTES", "TO YOUR NEXT", "GREAT FIND."],
    subtitle: "Choose your products. Checkout with confidence.",
    photoSlots: 1,
    callout: "Pay your way, all from one app.",
    bullets: ["Choose M-Pesa, PayPal, or cash at checkout", "Get a receipt and follow your order status"],
    footer: "ShopLink · Your next order starts here.",
  },
  {
    key: "c-trust",
    title: "Support Student Sellers",
    background: "#fff0e8",
    foreground: "#3d302a",
    accent: "#2b8062",
    secondary: "#f6d5bd",
    muted: "#6d5b50",
    kicker: "LOCAL SELLERS. REAL ORDER CONFIDENCE.",
    headline: ["SHOP LOCAL.", "TRACK EVERY", "ORDER."],
    subtitle: "Your next great find can support a student seller.",
    photoSlots: 2,
    callout: "Every order stays easy to follow.",
    bullets: ["Support local and student-run businesses", "Keep receipts, payment details, and order updates together"],
    footer: "A more connected way to shop on campus.",
  },
];

const writeSvgAndPng = async (name, artwork, widthPx, heightPx) => {
  const svgPath = path.join(outputDir, `${name}.svg`);
  const pngPath = path.join(outputDir, `${name}.png`);
  const rasterPath = path.join(outputDir, `${name}.raster.png`);
  const rasterHtmlPath = path.join(outputDir, `${name}.raster.html`);
  await writeFile(svgPath, artwork, "utf8");
  const rasterHtml = `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;width:${widthPx}px;height:${heightPx}px;overflow:hidden}svg{display:block;width:${widthPx}px;height:${heightPx}px}</style></head><body>${artwork}</body></html>`;
  await writeFile(rasterHtmlPath, rasterHtml, "utf8");
  execFileSync("google-chrome", [
    "--headless",
    "--disable-gpu",
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--hide-scrollbars",
    `--window-size=${widthPx},${heightPx}`,
    `--screenshot=${rasterPath}`,
    pathToFileURL(rasterHtmlPath).href,
  ], { stdio: "inherit" });
  execFileSync("convert", [
    rasterPath,
    "-units", "PixelsPerInch",
    "-density", "300",
    pngPath,
  ], { stdio: "inherit" });
  await Promise.all([unlink(rasterPath), unlink(rasterHtmlPath)]);
};

const pdfHtml = (items) => {
  const first = items[0];
  return `<!doctype html><html><head><meta charset="utf-8"><style>@page{size:${first.width} ${first.height};margin:0}html,body{margin:0;padding:0}.page{width:${first.width};height:${first.height};break-after:page;overflow:hidden}.page:last-child{break-after:auto}svg{display:block;width:100%;height:100%}</style></head><body>${items.map(({ content }) => `<section class="page">${content}</section>`).join("")}</body></html>`;
};

const writePdf = async (name, items) => {
  const htmlPath = path.join(outputDir, `${name}.html`);
  const pdfPath = path.join(outputDir, `${name}.pdf`);
  await writeFile(htmlPath, pdfHtml(items), "utf8");
  execFileSync("google-chrome", [
    "--headless",
    "--disable-gpu",
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--no-pdf-header-footer",
    `--print-to-pdf=${pdfPath}`,
    pathToFileURL(htmlPath).href,
  ], { stdio: "inherit" });
  await unlink(htmlPath);
};

await mkdir(outputDir, { recursive: true });

const front = cardFront();
const back = cardBack();
await writeSvgAndPng("shoplink-business-card-front", front, 1125, 675);
await writeSvgAndPng("shoplink-business-card-back", back, 1125, 675);
await writePdf("shoplink-business-card", [
  { width: "3.75in", height: "2.25in", content: front },
  { width: "3.75in", height: "2.25in", content: back },
]);

for (const design of posters) {
  const artwork = poster(design);
  const name = `shoplink-poster-${design.key}`;
  await writeSvgAndPng(name, artwork, 3579, 5024);
  await writePdf(name, [{ width: "303mm", height: "426mm", content: artwork }]);
}

await writeFile(
  path.join(outputDir, "PRINT-SPECS.txt"),
  [
    "ShopLink print artwork",
    "QR codes target https://shop-link.onrender.com",
    "",
    "Business card: 3.5 x 2 inch trim, 0.125 inch bleed on every side (3.75 x 2.25 inch / 1125 x 675 px at 300 DPI).",
    "Business card PDF: 2 pages; page 1 front, page 2 back.",
    "Posters: A3 portrait trim with 3 mm bleed on every side (303 x 426 mm full canvas, 3579 x 5024 px at 300 DPI).",
    "The dashed poster frames are reserved for your own product photography.",
    "SVG files are vector artwork. PNG files are 300 DPI raster exports.",
    "",
  ].join("\n"),
  "utf8"
);
console.log(`Generated print files in ${outputDir}`);
