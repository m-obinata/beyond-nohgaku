import type { SourceLayerId } from '@/lib/types'
import { SOURCE_LAYERS } from '@/content/source-layers'

/**
 * SOURCE LAYER の表示（指示書 13・14）。
 * 色だけに頼らず、必ず英語ラベルと根拠の文言を文字で出す。
 * 罫線の種類（実線/破線/点線/二重線）も色とは独立した手がかりとして使う。
 */

const MARK: Record<SourceLayerId, string> = {
  history: 'border-l-2 border-solid border-accent',
  chronicle: 'border-l-2 border-solid border-rule-strong',
  story: 'border-l-2 border-dashed border-rule-strong',
  stage: 'border-l-2 border-double border-accent',
  legend: 'border-l-2 border-dotted border-rule-strong',
}

const TONE: Record<SourceLayerId, string> = {
  history: 'text-accent',
  chronicle: 'text-ink',
  story: 'text-ink',
  stage: 'text-accent',
  legend: 'text-muted',
}

export function SourceLabel({
  layer,
  showEvidence = true,
  className = '',
}: {
  layer: SourceLayerId
  showEvidence?: boolean
  className?: string
}) {
  const l = SOURCE_LAYERS[layer]
  return (
    <span className={`inline-flex items-baseline gap-2 ${className}`}>
      <span className={`label ${TONE[layer]} font-semibold`}>{l.label}</span>
      {showEvidence && (
        <span className="font-sans text-micro text-muted">{l.evidence}</span>
      )}
    </span>
  )
}

/** 段落や図版の左に付ける、レイヤーの帯 */
export function SourceRail({
  layer,
  children,
  className = '',
}: {
  layer: SourceLayerId
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`${MARK[layer]} pl-4 ${className}`}>
      <SourceLabel layer={layer} />
      <div className="mt-2">{children}</div>
    </div>
  )
}

export function sourceRailClass(layer: SourceLayerId) {
  return MARK[layer]
}
