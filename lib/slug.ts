/** 章見出しから、本文内リンク用の id を作る。目次と見出しで同じ関数を使う */
export const sectionId = (label: string) =>
  'sec-' +
  label
    .toLowerCase()
    .replace(/[^a-z0-9぀-ヿ一-鿿]+/g, '-')
    .replace(/^-+|-+$/g, '')
