const TABLE_SCROLL_CLASS = "content-table-scroll";

export function prepareDetailHtml(html?: string | null) {
  if (!html) return "";

  return html.replace(/<table\b([^>]*)>([\s\S]*?)<\/table>/gi, (match, attrs: string, inner: string, offset: number, source: string) => {
    if (isAlreadyWrappedByTableScroll(source, offset)) return match;

    return `<div class="${TABLE_SCROLL_CLASS}" role="region" aria-label="Bảng nội dung" tabindex="0"><table${attrs}>${inner}</table></div>`;
  });
}

function isAlreadyWrappedByTableScroll(source: string, tableOffset: number) {
  const beforeTable = source.slice(Math.max(0, tableOffset - 180), tableOffset);
  return new RegExp(`<div\\b[^>]*class=["'][^"']*\\b${TABLE_SCROLL_CLASS}\\b`, "i").test(beforeTable);
}
