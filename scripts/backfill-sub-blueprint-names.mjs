/**
 * Backfill sub_blueprint_names for existing blueprint_book rows.
 *
 * Usage:
 *   node --env-file=.env.local scripts/backfill-sub-blueprint-names.mjs [--dry-run]
 *
 * --dry-run   Print what would be updated without writing to DB.
 */

import { createClient } from '@supabase/supabase-js'
import { inflateSync } from 'zlib'

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY ?? process.env.VITE_SUPABASE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY in environment.')
  process.exit(1)
}

const DRY_RUN = process.argv.includes('--dry-run')
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

function extractSubNames(str) {
  try {
    const buf = Buffer.from(str.slice(1), 'base64')
    let json
    try { json = JSON.parse(inflateSync(buf).toString('utf8')) }
    catch { json = JSON.parse(inflateSync(buf, { windowBits: -15 }).toString('utf8')) }

    const names = []
    function walk(obj) {
      for (const b of obj?.blueprint_book?.blueprints ?? []) {
        const label = b.blueprint?.label ?? b.blueprint_book?.label
        if (label) names.push(label)
        walk(b)
      }
    }
    walk(json)
    return names
  } catch { return null }
}

// Fetch in pages to avoid loading everything at once
const PAGE = 200
let offset = 0
let totalUpdated = 0
let totalSkipped = 0
let totalFailed = 0

console.log(`Backfilling sub_blueprint_names${DRY_RUN ? ' (DRY RUN)' : ''}\n`)

while (true) {
  const { data, error } = await supabase
    .from('blueprints')
    .select('id, name, blueprint_string, string_url')
    .eq('type', 'blueprint_book')
    .eq('sub_blueprint_names', '{}')
    .range(offset, offset + PAGE - 1)

  if (error) { console.error('Fetch error:', error.message); break }
  if (!data || data.length === 0) break

  console.log(`Processing ${data.length} rows (offset ${offset})…`)

  for (const row of data) {
    process.stdout.write(`  ${row.name.slice(0, 52).padEnd(52)} … `)

    let str = row.blueprint_string
    if (!str && row.string_url) {
      try {
        const res = await fetch(row.string_url)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        str = (await res.text()).trim()
      } catch (e) {
        console.log(`✗ fetch: ${e.message}`)
        totalFailed++
        continue
      }
    }

    if (!str) {
      console.log('skip (no string)')
      totalSkipped++
      continue
    }

    const names = extractSubNames(str)
    if (names === null) {
      console.log('✗ parse failed')
      totalFailed++
      continue
    }
    if (names.length === 0) {
      console.log('skip (0 named sub-blueprints)')
      totalSkipped++
      continue
    }

    if (DRY_RUN) {
      console.log(`would set [${names.slice(0, 3).join(', ')}${names.length > 3 ? '…' : ''}] (${names.length})`)
      totalUpdated++
      continue
    }

    const { error: upErr } = await supabase
      .from('blueprints')
      .update({ sub_blueprint_names: names })
      .eq('id', row.id)

    if (upErr) {
      console.log(`✗ update: ${upErr.message}`)
      totalFailed++
    } else {
      console.log(`✓ ${names.length} names`)
      totalUpdated++
    }

    await sleep(60)
  }

  if (data.length < PAGE) break
  offset += PAGE
  console.log()
}

console.log(`\nDone. ${totalUpdated} updated, ${totalSkipped} skipped, ${totalFailed} failed.`)
