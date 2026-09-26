import type {
  PublicPlay, FourState, PublicTag,
} from '@/lib/noh-data'

/**
 * 演目の構造情報パネル（DB由来）。
 *
 * 記事本文とは別の層。史料・物語・舞台の区別、4状態（未確認/確認中/該当なし）、
 * タグの basis（客観/編集判断）を、断定せずに見せる。数値スコアは出さない。
 */

const STATE_LABEL: Record<FourState, string> = {
  known: '',
  needs_review: '確認中',
  unknown: '未確認',
  not_applicable: '該当なし',
}

/** known は値を、それ以外は状態語を薄く出す */
function Stated({ label, state }: { label: string | null; state: FourState }) {
  if (state === 'known' && label) return <>{label}</>
  if (label && label !== '要確認' && label !== '不詳')
    return (
      <span>
        {label} <span className="text-muted text-micro">— {STATE_LABEL[state] || '確認中'}</span>
      </span>
    )
  return <span className="text-muted">{STATE_LABEL[state] || '未確認'}</span>
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-rule grid grid-cols-[6.5rem_1fr] gap-x-4 border-t py-2.5 last:border-b">
      <dt className="label pt-0.5">{label}</dt>
      <dd className="font-serif text-small">{children}</dd>
    </div>
  )
}

function BasisTag({ basis }: { basis: 'objective' | 'editorial' }) {
  return (
    <span
      className={
        'label ml-1.5 border px-1 py-px align-middle text-[0.6rem] ' +
        (basis === 'objective' ? 'border-rule text-muted' : 'border-accent/40 text-accent')
      }
      title={basis === 'objective' ? '客観情報' : '本サイトの編集判断'}
    >
      {basis === 'objective' ? '客観' : '編集'}
    </span>
  )
}

const TAG_CATEGORY_LABEL: Record<string, string> = {
  Situation: '状況', Emotion: '感情', Theme: '主題', Motif: 'モチーフ',
  Experience: '経験', Season: '季節', Form: '形式', Ending: '結末',
}

const SEASON_LABEL: Record<string, string> = {
  spring: '春', summer: '夏', autumn: '秋', winter: '冬', 'new-year': '新春',
}
const seasonJa = (codes: string[]) => codes.map((c) => SEASON_LABEL[c] ?? c).join('・')

export function StructuredContext({ play }: { play: PublicPlay }) {
  const tagsByCategory = new Map<string, PublicTag[]>()
  for (const t of play.tags) {
    const k = t.category ?? 'その他'
    if (!tagsByCategory.has(k)) tagsByCategory.set(k, [])
    tagsByCategory.get(k)!.push(t)
  }
  const editorialTagCount = play.tags.filter((t) => t.basis === 'editorial').length

  return (
    <div className="grid gap-x-10 gap-y-12 lg:grid-cols-2">
      {/* 基本情報 */}
      <section>
        <h3 className="label label-ink border-rule-strong border-t pt-3 font-semibold">
          BASICS — 基本情報
        </h3>
        <dl className="mt-2">
          <Row label="作者">
            {play.author.label ? (
              <span>
                {play.author.label}
                {play.author.uncertain && <span className="text-muted text-micro">（異説あり）</span>}
                {play.author.status && play.author.status !== '確認済' && (
                  <span className="text-muted ml-2 text-micro">{play.author.status}</span>
                )}
                {play.author.sourceUrl && (
                  <a
                    href={play.author.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted hover:text-accent ml-2 align-middle text-micro underline"
                  >
                    出典
                  </a>
                )}
              </span>
            ) : (
              <Stated label={play.author.label} state={play.author.state} />
            )}
          </Row>
          <Row label="成立時代">
            <Stated label={play.period.label} state={play.period.state} />
          </Row>
          <Row label="形式">{play.nohStructure.label ?? '—'}</Row>
          <Row label="季節">
            {play.seasonGeneral.length ? seasonJa(play.seasonGeneral) : <span className="text-muted">無季・不定</span>}
          </Row>
          <Row label="成熟度">{play.maturityLevel ?? '—'}</Row>
        </dl>
      </section>

      {/* 流儀 */}
      <section>
        <h3 className="label label-ink border-rule-strong border-t pt-3 font-semibold">
          SCHOOLS — 流儀別
        </h3>
        <dl className="mt-2">
          {play.schools.map((s) => (
            <Row key={s.school} label={s.school ?? '—'}>
              {[s.classification, s.season].filter(Boolean).join('／') || '—'}
            </Row>
          ))}
        </dl>
      </section>

      {/* 登場人物 */}
      <section className="lg:col-span-2">
        <h3 className="label label-ink border-rule-strong border-t pt-3 font-semibold">
          CHARACTERS — 登場人物
        </h3>
        <ul className="mt-2">
          {play.characters.map((c, i) => (
            <li key={i} className="border-rule grid grid-cols-[5.5rem_1fr] gap-x-4 border-t py-2.5 last:border-b">
              <span className="label pt-0.5">{c.role ?? '—'}</span>
              <span className="font-serif text-small">
                {c.name}
                {c.typeRaw && (
                  <span className="text-muted ml-2 text-micro">
                    {c.typeRaw}
                    {c.stateRaw && c.stateRaw !== '生者' && `・${c.stateRaw}`}
                  </span>
                )}
                {c.dramaticFunction && (
                  <span className="text-muted ml-2 text-micro">／{c.dramaticFunction}</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* 人物関係 */}
      {play.relationships.length > 0 && (
        <section>
          <h3 className="label label-ink border-rule-strong border-t pt-3 font-semibold">
            RELATIONSHIPS — 人物関係
          </h3>
          <ul className="mt-2">
            {play.relationships.map((r, i) => (
              <li key={i} className="border-rule border-t py-2.5 font-serif text-small last:border-b">
                {r.a} — {r.b}
                <span className="text-muted ml-2 text-micro">{r.typeRaw}</span>
                <BasisTag basis={r.basis} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 場所・典拠 */}
      <section>
        <h3 className="label label-ink border-rule-strong border-t pt-3 font-semibold">
          PLACE & SOURCE — 土地と典拠
        </h3>
        <dl className="mt-2">
          {play.locations.map((l, i) => (
            <Row key={'loc' + i} label="場所">
              {[l.historicalName, l.modernName].filter(Boolean).join(' → ')}
              {l.prefecture && (
                <span className="text-muted ml-2 text-micro">
                  {l.prefectureState === 'known' ? l.prefecture : STATE_LABEL[l.prefectureState] || l.prefecture}
                </span>
              )}
            </Row>
          ))}
          {play.sources.map((s, i) => (
            <Row key={'src' + i} label="典拠">
              {s.name}
              {s.relationRaw && <span className="text-muted ml-2 text-micro">{s.relationRaw}</span>}
            </Row>
          ))}
        </dl>
      </section>

      {/* 主題タグ */}
      <section className="lg:col-span-2">
        <h3 className="label label-ink border-rule-strong flex items-baseline justify-between border-t pt-3 font-semibold">
          <span>TAGS — 意味タグ</span>
          {editorialTagCount > 0 && (
            <span className="label text-muted">
              {editorialTagCount}／{play.tags.length} は編集判断
            </span>
          )}
        </h3>
        <div className="mt-3 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...tagsByCategory.entries()].map(([cat, tags]) => (
            <div key={cat}>
              <span className="label text-muted">{TAG_CATEGORY_LABEL[cat] ?? cat}</span>
              <ul className="mt-1.5">
                {tags.map((t, i) => (
                  <li key={i} className="font-serif text-small">
                    {t.value}
                    <BasisTag basis={t.basis} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* 物語構造 */}
      {play.storyPattern && play.storyPattern.steps.length > 0 && (
        <section className="lg:col-span-2">
          <h3 className="label label-ink border-rule-strong border-t pt-3 font-semibold">
            STORY — 物語構造
          </h3>
          <ol className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-2">
            {play.storyPattern.steps.map((s, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="border-rule bg-paper border px-2.5 py-1 font-serif text-small">{s}</span>
                {i < play.storyPattern!.steps.length - 1 && (
                  <span aria-hidden className="text-muted">→</span>
                )}
              </li>
            ))}
          </ol>
          {play.storyPattern.endingRaw && (
            <p className="mt-3 font-serif text-small">
              <span className="label mr-2">結末</span>
              {play.storyPattern.endingRaw}
            </p>
          )}
        </section>
      )}

      {/* 舞台要素 */}
      {play.performance && (
        <section className="lg:col-span-2">
          <h3 className="label label-ink border-rule-strong border-t pt-3 font-semibold">
            STAGE — 舞台要素
          </h3>
          <dl className="mt-2 grid grid-cols-1 gap-x-8 sm:grid-cols-3">
            {(
              [
                ['作リ物', play.performance.tsukurimono],
                ['間狂言', play.performance.ai],
                ['太鼓', play.performance.taiko],
              ] as [string, FourState][]
            ).map(([label, st]) => (
              <div key={label} className="border-rule grid grid-cols-[5rem_1fr] gap-x-4 border-t py-2.5">
                <dt className="label pt-0.5">{label}</dt>
                <dd className="font-serif text-small">
                  {st === 'known' ? '有' : <span className="text-muted">{STATE_LABEL[st] || '未確認'}</span>}
                </dd>
              </div>
            ))}
          </dl>
          <p className="text-muted mt-3 font-sans text-micro">
            舞台要素は流儀・小書・演者によって変わります。ここは編集用データで、特定の公演の記録ではありません。
          </p>
        </section>
      )}
    </div>
  )
}
