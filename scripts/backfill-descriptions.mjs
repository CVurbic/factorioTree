/**
 * Backfill full descriptions for factorioprints blueprints that were truncated at 300 chars.
 *
 * Usage:
 *   node --env-file=.env.local scripts/backfill-descriptions.mjs [--dry-run]
 *
 * Only updates rows where description ends with '…' (our truncation marker).
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY ?? process.env.VITE_SUPABASE_KEY
const FIREBASE = 'https://facorio-blueprints.firebaseio.com'

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY in environment.')
  process.exit(1)
}

const DRY_RUN = process.argv.includes('--dry-run')
const idIdx = process.argv.indexOf('--id')
const SINGLE_ID = idIdx !== -1 ? process.argv[idIdx + 1] : null
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

function trunc(val, max) {
  if (!val) return null
  const s = String(val).trim()
  if (!s) return null
  return s.length <= max ? s : s.slice(0, max - 1) + '…'
}

function firebaseKeyFromUrl(sourceUrl) {
  // https://www.factorioprints.com/view/{key}
  return sourceUrl.split('/view/')[1] ?? null
}

const PAGE = 200
let offset = 0
let totalUpdated = 0
let totalSkipped = 0
let totalFailed = 0

console.log(`Backfilling descriptions${DRY_RUN ? ' (DRY RUN)' : ''}\n`)

while (true) {
  let q = supabase
    .from('blueprints')
    .select('id, name, source_url, description')
  if (SINGLE_ID) {
    q = q.eq('id', SINGLE_ID)
  } else {
    q = q.eq('author', 'factorioprints').like('description', '%…').range(offset, offset + PAGE - 1)
  }
  const { data, error } = await q

  if (error) { console.error('Fetch error:', error.message); break }
  if (!data || data.length === 0) break

  console.log(`Processing ${data.length} rows (offset ${offset})…`)

  for (const row of data) {
    process.stdout.write(`  ${row.name.slice(0, 52).padEnd(52)} … `)

    const key = firebaseKeyFromUrl(row.source_url ?? '')
    if (!key) {
      console.log('skip (no firebase key)')
      totalSkipped++
      continue
    }

    let descriptionMarkdown = null
    try {
      const res = await fetch(`${FIREBASE}/blueprints/${key}.json?shallow=false&print=pretty`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const bp = await res.json()
      descriptionMarkdown = bp?.descriptionMarkdown ?? null
    } catch (e) {
      console.log(`✗ fetch: ${e.message}`)
      totalFailed++
      continue
    }

    const newDesc = trunc(descriptionMarkdown, 5000)
    if (!newDesc || newDesc === row.description) {
      console.log('skip (no change)')
      totalSkipped++
      continue
    }

    if (DRY_RUN) {
      console.log(`would update (${newDesc.length} chars)`)
      totalUpdated++
      continue
    }

    const { error: upErr } = await supabase
      .from('blueprints')
      .update({ description: newDesc })
      .eq('id', row.id)

    if (upErr) {
      console.log(`✗ update: ${upErr.message}`)
      totalFailed++
    } else {
      console.log(`✓ ${newDesc.length} chars`)
      totalUpdated++
    }

    await sleep(120)
  }

  if (data.length < PAGE) break
  offset += PAGE
  console.log()
}

console.log(`\nDone. ${totalUpdated} updated, ${totalSkipped} skipped, ${totalFailed} failed.`)
