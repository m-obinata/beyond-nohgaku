import type { Metadata } from 'next'
import { IndexShell } from '@/components/IndexShell'
import { GLOSSARY, GLOSSARY_GROUPS } from '@/content/glossary'

export const metadata: Metadata = {
  title: '用語集',
  description: '能や中世社会の言葉を、記事を読みながら参照できるようにまとめています。',
}

export default function GlossaryPage() {
  return (
    <IndexShell
      label="GLOSSARY"
      title="このサイトで使う言葉"
      lede="専門用語を避けるのではなく、使うたびに説明する。それでも足りないときのために、ここにまとめておきます。"
      aside={
        <div className="border-rule bg-paper border px-5 py-5">
          <p className="font-serif text-small">
            記事の右側には、その記事に出てくる言葉だけを抜き出した欄があります。
            読みながら目を上げれば済むようにするためで、この一覧はその全体版です。
          </p>
        </div>
      }
    >
      {GLOSSARY_GROUPS.map((group) => {
        const items = GLOSSARY.filter((t) => t.group === group)
        if (items.length === 0) return null
        return (
          <section key={group} className="mb-12">
            <div className="rule-top-strong flex items-baseline justify-between pt-3 pb-4">
              <h2 className="font-serif text-h3">{group}</h2>
              <span className="label">{items.length}</span>
            </div>
            <dl>
              {items.map((t) => (
                <div
                  key={t.slug}
                  className="border-rule grid grid-cols-1 gap-x-8 gap-y-2 border-t py-4 last:border-b lg:grid-cols-[10rem_1fr]"
                >
                  <dt>
                    <span className="block font-serif text-[1.0625rem]">{t.term}</span>
                    <span className="label mt-0.5 block">{t.reading}</span>
                  </dt>
                  <dd>
                    <p className="font-serif text-small">{t.short}</p>
                    {t.long && (
                      <p className="mt-2 font-serif text-small text-muted">{t.long}</p>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )
      })}
    </IndexShell>
  )
}
