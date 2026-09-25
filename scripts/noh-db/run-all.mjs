// run-all — Phase 1 のパイプラインを順に実行する。
// 各工程は単独でも実行できる。ここは通しの入口にすぎない。
// import だけ Python（Excel読取）。以降は Node。
//
//   実行: node scripts/noh-db/run-all.mjs

import { spawnSync } from 'node:child_process'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const python = process.env.PYTHON || 'python'

const steps = [
  { name: 'import (Excel→raw)', cmd: python, args: [join(here, 'import_workbook.py')] },
  { name: 'validate', cmd: process.execPath, args: [join(here, 'validate-workbook.mjs')] },
  { name: 'normalize', cmd: process.execPath, args: [join(here, 'normalize-data.mjs')] },
  { name: 'build-public', cmd: process.execPath, args: [join(here, 'build-public-data.mjs')] },
  { name: 'check-rights-risk', cmd: process.execPath, args: [join(here, 'check-rights-risk.mjs')] },
]

for (const s of steps) {
  const r = spawnSync(s.cmd, s.args, { stdio: 'inherit' })
  if (r.status !== 0) {
    console.error(`\n✗ 工程で停止: ${s.name}`)
    process.exit(r.status ?? 1)
  }
}
console.log('\n✓ Phase 1 パイプライン完了。')
