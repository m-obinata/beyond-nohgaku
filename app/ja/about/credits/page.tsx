import type { Metadata } from 'next'
import { IndexShell } from '@/components/IndexShell'
import { PHOTOS } from '@/content/photos'

export const metadata: Metadata = {
  title: '写真・図版の出所',
  description: '本サイトで使用している写真と図版の出所、撮影者、利用条件の一覧。',
}

export default function CreditsPage() {
  return (
    <IndexShell
      label="CREDITS"
      title="写真・図版の出所"
      lede="使用している画像の出所と利用条件をここにまとめます。素材サイトの写真は商用利用が可能でも条件が付くため、一件ずつ登録して管理しています。"
      aside={
        <div className="border-rule bg-paper border px-5 py-5">
          <span className="label label-ink font-semibold">管理の方法</span>
          <p className="mt-2 font-serif text-small text-muted">
            画像は <code className="font-sans text-micro">content/photos.ts</code> に登録してから使います。
            記事側はその id を参照するだけなので、出所の記録が漏れない仕組みです。
          </p>
        </div>
      }
    >
      {PHOTOS.length === 0 ? (
        <p className="border-rule border-t py-10 font-serif text-small text-muted">
          写真はまだ収録していません。現在、記事中の図版は「そこに何が入るべきか」を示すプレースホルダです。
        </p>
      ) : (
        <ul>
          {PHOTOS.map((p) => (
            <li key={p.id} className="border-rule border-t py-4 last:border-b">
              <div className="grid grid-cols-1 gap-x-8 gap-y-1 lg:grid-cols-[16rem_1fr_10rem]">
                <span className="font-serif text-[1.0625rem]">{p.id}</span>
                <span>
                  <span className="block font-serif text-small text-ink/85">{p.alt}</span>
                  <span className="label mt-1 block tracking-normal normal-case">{p.license}</span>
                </span>
                <span className="label lg:text-right">
                  {p.source}
                  {p.author && <span className="block">{p.author}</span>}
                  <span className="num block">{p.retrievedAt}</span>
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </IndexShell>
  )
}
