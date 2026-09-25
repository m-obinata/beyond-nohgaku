import type { SourceLayer, SourceLayerId } from '@/lib/types'

/**
 * サイト全体で統一する情報の分類（指示書 13・14）。
 * 「史実度 ★★★」のような数値化はしません。
 * 目的は正誤判定ではなく、その情報がどのレイヤーに属するかを示すこと。
 */
export const SOURCE_LAYERS: Record<SourceLayerId, SourceLayer> = {
  history: {
    id: 'history',
    label: 'HISTORY',
    definition: '史料から確認できること',
    evidence: '同時代史料で確認',
  },
  chronicle: {
    id: 'chronicle',
    label: 'CHRONICLE',
    definition: '後世の歴史記録',
    evidence: '後世史料に記載',
  },
  story: {
    id: 'story',
    label: 'STORY',
    definition: '軍記物語・文学',
    evidence: '軍記物語に登場',
  },
  stage: {
    id: 'stage',
    label: 'STAGE',
    definition: '能楽・芸能による表現',
    evidence: '能楽上の設定',
  },
  legend: {
    id: 'legend',
    label: 'LEGEND',
    definition: '地域伝承・後世の伝説',
    evidence: '地域伝承',
  },
}

export const SOURCE_LAYER_ORDER: SourceLayerId[] = [
  'history',
  'chronicle',
  'story',
  'stage',
  'legend',
]
