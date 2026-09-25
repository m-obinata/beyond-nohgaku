'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'

/**
 * ファセット検索。
 *
 * 一覧を「分類して並べる」方式は、件数が増えた瞬間に破綻する。
 * 分類の中を目で走査させるのではなく、読者がすでに持っている軸
 * （時代・地域・主題・誰が出るか）で絞り込ませる。
 *
 * 同じ軸のなかは OR、異なる軸のあいだは AND。
 * 件数は「その軸以外の絞り込みを適用した状態」で数えるので、
 * 選んでも 0 件になる選択肢は最初から 0 と表示される。
 */

export interface FacetDef {
  key: string
  label: string
  labelEn: string
  /** 値の並び順。指定がなければ五十音順 */
  order?: readonly string[]
  /** 最初に見せる値の数。これを超える分は「もっと見る」で開く */
  limit?: number
  /** 値を全体の出現頻度の多い順に並べる（order より優先。主題タグなど多値の軸向け） */
  sortByCount?: boolean
}

export interface BrowseItem {
  id: string
  href: string
  title: string
  romaji?: string
  reading?: string
  /** 一覧で最初に読まれる一文。あらすじの要約ではなく「何が起きるか」 */
  hook: string
  meta?: string
  badge?: string
  facets: Record<string, string[]>
  /** 自由語検索の対象 */
  text: string
}

interface Props {
  facets: FacetDef[]
  items: BrowseItem[]
  /** 検索窓のプレースホルダ */
  placeholder?: string
  /** 結果0件のときの案内 */
  emptyNote?: string
}

type Selected = Record<string, string[]>

const matchesFacets = (item: BrowseItem, selected: Selected, skip?: string) =>
  Object.entries(selected).every(([key, values]) => {
    if (key === skip || values.length === 0) return true
    const own = item.facets[key] ?? []
    return values.some((v) => own.includes(v))
  })

export function FacetBrowser({ facets, items, placeholder, emptyNote }: Props) {
  const [selected, setSelected] = useState<Selected>({})
  const [query, setQuery] = useState('')
  const [openOnMobile, setOpenOnMobile] = useState(false)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const hydrated = useRef(false)

  /**
   * 絞り込みの状態を URL に持たせる。
   * 「主題 = 敗者 の演目」のような状態を人に渡せないと、検索の意味が半分になる。
   * useSearchParams は Suspense 境界を要求するので、location から直接読む。
   */
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search)
    const next: Selected = {}
    for (const f of facets) {
      const raw = sp.get(f.key)
      if (raw) next[f.key] = raw.split(',').filter(Boolean)
    }
    const q = sp.get('q')
    if (q) setQuery(q)
    if (Object.keys(next).length > 0) setSelected(next)
    hydrated.current = true
    // facets は定義なので、初回のみでよい
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!hydrated.current) return
    const sp = new URLSearchParams()
    for (const [k, v] of Object.entries(selected)) if (v.length > 0) sp.set(k, v.join(','))
    if (query.trim()) sp.set('q', query.trim())
    const qs = sp.toString()
    window.history.replaceState(null, '', qs ? '?' + qs : window.location.pathname)
  }, [selected, query])

  const needle = query.trim().toLowerCase()
  const byText = useMemo(
    () => (needle ? items.filter((i) => i.text.toLowerCase().includes(needle)) : items),
    [items, needle],
  )

  const results = useMemo(
    () => byText.filter((i) => matchesFacets(i, selected)),
    [byText, selected],
  )

  /** その軸を除いた絞り込みでの件数 */
  const countsFor = (key: string) => {
    const pool = byText.filter((i) => matchesFacets(i, selected, key))
    const map = new Map<string, number>()
    for (const item of pool) {
      for (const v of item.facets[key] ?? []) map.set(v, (map.get(v) ?? 0) + 1)
    }
    return map
  }

  /** 全体で存在する値（件数0でも選択肢としては出す） */
  const allValuesFor = (key: string, order?: readonly string[], sortByCount?: boolean) => {
    const total = new Map<string, number>()
    for (const item of items) for (const v of item.facets[key] ?? []) total.set(v, (total.get(v) ?? 0) + 1)
    const arr = [...total.keys()]
    if (sortByCount) {
      return arr.sort((a, b) => (total.get(b)! - total.get(a)!) || a.localeCompare(b, 'ja'))
    }
    if (order) {
      const idx = (v: string) => {
        const i = order.indexOf(v)
        return i === -1 ? 999 : i
      }
      return arr.sort((a, b) => idx(a) - idx(b) || a.localeCompare(b, 'ja'))
    }
    return arr.sort((a, b) => a.localeCompare(b, 'ja'))
  }

  const toggle = (key: string, value: string) =>
    setSelected((prev) => {
      const cur = prev[key] ?? []
      const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value]
      return { ...prev, [key]: next }
    })

  const activeCount =
    Object.values(selected).reduce((n, v) => n + v.length, 0) + (needle ? 1 : 0)

  const clearAll = () => {
    setSelected({})
    setQuery('')
  }

  return (
    <div className="grid gap-x-10 gap-y-8 lg:grid-cols-12">
      {/* ─── 絞り込み ─── */}
      <div className="lg:col-span-3">
        <div className="rule-top-strong pt-3">
          <label htmlFor="facet-q" className="label label-ink font-semibold">
            語で探す
          </label>
          <input
            id="facet-q"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder ?? '名前・土地・人物'}
            className="border-rule-strong bg-paper focus:border-accent mt-2.5 block w-full border px-3 py-2.5 font-serif text-small outline-none"
          />
        </div>

        <button
          type="button"
          onClick={() => setOpenOnMobile((v) => !v)}
          aria-expanded={openOnMobile}
          className="label border-rule-strong mt-4 flex w-full items-center justify-between border px-4 py-3 lg:hidden"
        >
          <span>絞り込む{activeCount > 0 ? `（${activeCount}）` : ''}</span>
          <span aria-hidden="true">{openOnMobile ? '閉じる −' : '開く ＋'}</span>
        </button>

        <div className={(openOnMobile ? 'block' : 'hidden') + ' mt-6 lg:mt-8 lg:block'}>
          {facets.map((f) => {
            const counts = countsFor(f.key)
            const all = allValuesFor(f.key, f.order, f.sortByCount)
            if (all.length === 0) return null
            const limit = f.limit ?? 10
            const isOpen = expanded[f.key] ?? false
            /** 選択中の値は、上限の外にあっても必ず見せる */
            const chosen = selected[f.key] ?? []
            const values = isOpen
              ? all
              : [...new Set([...all.slice(0, limit), ...chosen])]
            const hidden = all.length - values.length
            return (
              <fieldset key={f.key} className="mb-7">
                <legend className="border-rule-strong flex w-full items-baseline justify-between border-b pb-1.5">
                  <span className="label label-ink font-semibold">{f.labelEn}</span>
                  <span className="label">{f.label}</span>
                </legend>
                <ul className="mt-1">
                  {values.map((v) => {
                    const n = counts.get(v) ?? 0
                    const on = (selected[f.key] ?? []).includes(v)
                    return (
                      <li key={v}>
                        <button
                          type="button"
                          onClick={() => toggle(f.key, v)}
                          aria-pressed={on}
                          disabled={n === 0 && !on}
                          className={
                            'border-rule flex w-full items-baseline justify-between gap-3 border-t py-2 text-left transition-colors ' +
                            (on
                              ? 'text-accent'
                              : n === 0
                                ? 'text-muted/50 cursor-default'
                                : 'hover:text-accent')
                          }
                        >
                          <span className="flex items-baseline gap-2">
                            <span
                              aria-hidden="true"
                              className={
                                'inline-block h-[9px] w-[9px] shrink-0 border ' +
                                (on ? 'border-accent bg-accent' : 'border-rule-strong')
                              }
                            />
                            <span className={'font-serif text-small ' + (on ? 'font-semibold' : '')}>
                              {v}
                            </span>
                          </span>
                          <span className="num text-micro text-muted">{n}</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
                {(hidden > 0 || isOpen) && (
                  <button
                    type="button"
                    onClick={() => setExpanded((p) => ({ ...p, [f.key]: !isOpen }))}
                    className="label hover:text-accent border-rule mt-0 w-full border-t py-2 text-left"
                  >
                    {isOpen ? '閉じる −' : `ほか ${hidden} 件を見る ＋`}
                  </button>
                )}
              </fieldset>
            )
          })}
        </div>
      </div>

      {/* ─── 結果 ─── */}
      <div className="lg:col-span-9">
        <div className="rule-top-strong flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 pt-3 pb-4">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="num text-small">
              {results.length} <span className="text-muted">件</span>
            </span>
            {activeCount > 0 && (
              <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                {needle && <ActiveTag label={`「${query}」`} onClear={() => setQuery('')} />}
                {Object.entries(selected).flatMap(([key, values]) =>
                  values.map((v) => (
                    <ActiveTag key={key + v} label={v} onClear={() => toggle(key, v)} />
                  )),
                )}
              </span>
            )}
          </div>
          {activeCount > 0 && (
            <button type="button" onClick={clearAll} className="label hover:text-accent">
              すべて解除 ×
            </button>
          )}
        </div>

        {results.length === 0 ? (
          <p className="border-rule border-t py-10 font-serif text-small text-muted">
            {emptyNote ?? '条件に合うものがありません。絞り込みを減らしてみてください。'}
          </p>
        ) : (
          <ul>
            {results.map((item) => (
              <li key={item.id} className="border-rule border-t last:border-b">
                <Link
                  href={item.href}
                  className="group hover:bg-accent/[0.04] block py-4 transition-colors"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <span className="flex flex-wrap items-baseline gap-x-3">
                      <span className="font-serif text-[1.0625rem] group-hover:text-accent">
                        {item.title}
                      </span>
                      {item.romaji && <span className="label">{item.romaji}</span>}
                      {item.reading && <span className="label">{item.reading}</span>}
                    </span>
                    {item.badge && (
                      <span className="label text-accent font-semibold">{item.badge}</span>
                    )}
                  </div>
                  <p className="mt-1.5 max-w-[46rem] font-serif text-small text-ink/85">
                    {item.hook}
                  </p>
                  <p className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                    {item.meta && <span className="label">{item.meta}</span>}
                    {Object.entries(item.facets)
                      .flatMap(([, v]) => v)
                      .slice(0, 6)
                      .map((v) => (
                        <span key={v} className="label text-muted">
                          {v}
                        </span>
                      ))}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function ActiveTag({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <button
      type="button"
      onClick={onClear}
      className="label border-accent text-accent hover:bg-accent hover:text-canvas border px-2 py-1 transition-colors"
    >
      {label} ×
    </button>
  )
}
