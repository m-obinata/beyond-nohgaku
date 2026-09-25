import type { EntitySection } from '@/content/entity-notes'
import { SectionHead } from '@/components/ui/SectionHead'
import { SourceLabel, sourceRailClass } from '@/components/ui/SourceLabel'
import { SOURCE_LAYERS } from '@/content/source-layers'

/** 人物・土地ページの本文。演目記事と同じ章立ての作法を反復する */
export function EntitySections({ sections }: { sections: EntitySection[] }) {
  return (
    <>
      {sections.map((s) => (
        <section key={s.label} className="mt-14 first:mt-0">
          <SectionHead label={s.label} caption={s.caption} />
          {s.layer ? (
            <div className={sourceRailClass(s.layer) + ' pl-4'}>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <SourceLabel layer={s.layer} />
                {s.source && (
                  <span className="font-sans text-micro text-muted">出典 — {s.source}</span>
                )}
              </div>
              <p className="text-muted mt-1 font-sans text-micro">{SOURCE_LAYERS[s.layer].definition}</p>
              <div className="prose-nohgaku mt-3">
                {s.body.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
          ) : (
            <div className="prose-nohgaku">
              {s.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          )}
        </section>
      ))}
    </>
  )
}
