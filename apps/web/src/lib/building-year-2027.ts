/**
 * The 35 "Năm XXXX tuổi … xây nhà hợp hướng nào" posts were written before 2027 and say nothing about it,
 * while searches like "sinh năm 1985 làm nhà năm 2027" are starting. This adds, at render time (no CMS edit),
 * a short 2027 (Đinh Mùi) verdict to each year post and links it to the 2027 lookup post published 2026-11-09.
 *
 * The verdict uses the same folk method as that post: tuổi mụ = 2027 − năm sinh + 1, then Kim Lâu, Hoang Ốc
 * and Tam Tai. Keep the two in step if either changes.
 */
export const BUILDING_YEAR_2027_PATH = "/tin-tuc/xem-tuoi-xay-nha-nam-2027-dinh-mui";

const BUILD_YEAR = 2027;
const BIRTH_YEAR_POST = /^nam-((?:19|20)\d{2})-tuoi-[a-z-]+-xay-nha-hop-huong-nao-giup-sinh-tai-loc$/;
const HUB_SLUG = "xem-tuoi-xay-nha-theo-nam-sinh";
const EXISTING_2027_LINK = /\/tin-tuc\/xem-tuoi-xay-nha-nam-2027-dinh-mui\/?["'?#]/i;

const CAN = ["Canh", "Tân", "Nhâm", "Quý", "Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ"]; // year % 10
const CHI = ["Thân", "Dậu", "Tuất", "Hợi", "Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi"]; // year % 12
const KIM_LAU: Record<number, string> = { 1: "Kim Lâu Thân", 3: "Kim Lâu Thê", 6: "Kim Lâu Tử", 8: "Kim Lâu Lục Súc" };
const HOANG_OC = ["Nhất Cát", "Nhì Nghi", "Tam Địa Sát", "Tứ Tấn Tài", "Ngũ Thọ Tử", "Lục Hoang Ốc"];
const HOANG_OC_BAD = new Set(["Tam Địa Sát", "Ngũ Thọ Tử", "Lục Hoang Ốc"]);
/** Each triad of birth branches and the three consecutive years that are its Tam Tai. */
const TAM_TAI: Array<[string[], string[]]> = [
  [["Thân", "Tý", "Thìn"], ["Dần", "Mão", "Thìn"]],
  [["Dần", "Ngọ", "Tuất"], ["Thân", "Dậu", "Tuất"]],
  [["Hợi", "Mão", "Mùi"], ["Tỵ", "Ngọ", "Mùi"]],
  [["Tỵ", "Dậu", "Sửu"], ["Hợi", "Tý", "Sửu"]],
];

export type BuildingYearVerdict = {
  birthYear: number;
  canChi: string;
  lunarAge: number;
  kimLau: string | null;
  hoangOc: string;
  tamTai: boolean;
  canBuild: boolean;
};

export function canChiOf(year: number): string {
  return `${CAN[year % 10]} ${CHI[year % 12]}`;
}

export function verdictFor2027(birthYear: number): BuildingYearVerdict {
  const lunarAge = BUILD_YEAR - birthYear + 1;
  const kimLau = KIM_LAU[lunarAge % 9] ?? null;
  const hoangOc = HOANG_OC[(Math.floor(lunarAge / 10) - 1 + (lunarAge % 10)) % 6];
  const birthChi = CHI[birthYear % 12];
  const yearChi = CHI[BUILD_YEAR % 12];
  const tamTai = TAM_TAI.some(([births, years]) => births.includes(birthChi) && years.includes(yearChi));
  return {
    birthYear,
    canChi: canChiOf(birthYear),
    lunarAge,
    kimLau,
    hoangOc,
    tamTai,
    canBuild: !kimLau && !tamTai && !HOANG_OC_BAD.has(hoangOc),
  };
}

export function birthYearFromSlug(slug: string): number | null {
  const match = BIRTH_YEAR_POST.exec(slug);
  return match ? Number(match[1]) : null;
}

function yearBox(v: BuildingYearVerdict): string {
  const problems = [v.kimLau, v.tamTai ? "Tam Tai" : null, HOANG_OC_BAD.has(v.hoangOc) ? v.hoangOc : null].filter(Boolean);
  const conclusion = v.canBuild
    ? `Không phạm Kim Lâu, Hoang Ốc, Tam Tai: <strong>năm 2027 gia chủ tuổi ${v.canChi} có thể tự đứng tên làm nhà.</strong>`
    : `Phạm ${problems.join(", ")}: <strong>năm 2027 nên mượn tuổi người khác đứng tên làm nhà</strong>, hoặc khởi công trước Tết Đinh Mùi (6/2/2027).`;
  return (
    `<div class="year-2027-box"><h3>Sinh năm ${v.birthYear} làm nhà năm 2027 (Đinh Mùi) được không?</h3>` +
    `<ul><li>Tuổi mụ năm 2027: ${v.lunarAge}</li>` +
    `<li>Kim Lâu: ${v.kimLau ? `phạm ${v.kimLau}` : "không phạm"}</li>` +
    `<li>Hoang Ốc: ${v.hoangOc}${HOANG_OC_BAD.has(v.hoangOc) ? " (xấu)" : " (tốt)"}</li>` +
    `<li>Tam Tai: ${v.tamTai ? "phạm (năm cuối Tam Tai)" : "không phạm"}</li></ul>` +
    `<p>${conclusion} Xem bảng đầy đủ các tuổi và cách tính trong bài <a href="${BUILDING_YEAR_2027_PATH}">xem tuổi xây nhà năm 2027 Đinh Mùi</a>.</p></div>`
  );
}

const HUB_SENTENCE = `<p class="service-context-link">Chuẩn bị làm nhà sau Tết? Xem <a href="${BUILDING_YEAR_2027_PATH}">bảng tra tuổi xây nhà năm 2027 Đinh Mùi</a> (Kim Lâu, Hoang Ốc, Tam Tai cho người sinh 1958 – 2001).</p>`;

function insertBeforeSecondH2(html: string, block: string): string {
  const headings = [...html.matchAll(/<h2\b/gi)];
  if (headings.length >= 2) {
    const index = headings[1].index!;
    return `${html.slice(0, index)}${block}${html.slice(index)}`;
  }
  return `${html}${block}`;
}

/** Year posts get the 2027 verdict box; the birth-year lookup post gets one sentence; others are unchanged. */
export function withBuildingYear2027(slug: string, html: string): string {
  if (!html || EXISTING_2027_LINK.test(html)) return html;
  const birthYear = birthYearFromSlug(slug);
  if (birthYear) return insertBeforeSecondH2(html, yearBox(verdictFor2027(birthYear)));
  if (slug === HUB_SLUG) return insertBeforeSecondH2(html, HUB_SENTENCE);
  return html;
}
