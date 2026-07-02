/**
 * Import blueprints from factoriobin.com into Supabase by post ID.
 *
 * Usage:
 *   node --env-file=.env.local scripts/import-blueprints.mjs <id1> <id2> ...
 *
 * .env.local must contain:
 *   VITE_SUPABASE_URL=https://xxxx.supabase.co
 *   VITE_SUPABASE_KEY=your-anon-or-service-role-key
 *
 * Factoriobin IDs come from post URLs: factoriobin.com/post/<id>
 * Collect IDs manually from Reddit, Discord, or community wikis.
 */

import { createClient } from '@supabase/supabase-js'
import { inflateSync, createInflate } from 'zlib'

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY ?? process.env.VITE_SUPABASE_KEY
const FACTORIOBIN = 'https://factoriobin.com'
const DELAY_MS = 600
const UA = 'factorio-crafting-tree/1.0 blueprint-importer (personal tool)'

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY in environment.')
  console.error('Create a .env file or set them as shell variables.')
  process.exit(1)
}

const ids = process.argv.slice(2)
if (ids.length === 0) {
  console.error('Usage: node --env-file=.env.local scripts/import-blueprints.mjs <id1> <id2> ...')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

function trunc(str, max) {
  if (!str) return null
  return str.length <= max ? str : str.slice(0, max - 1) + '…'
}

async function fetchJSON(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.text()
}

function parseBlueprint(str) {
  try {
    const buf = Buffer.from(str.slice(1), 'base64')
    let json
    try { json = JSON.parse(inflateSync(buf).toString('utf8')) }
    catch { json = JSON.parse(inflateSync(buf, { windowBits: -15 }).toString('utf8')) }

    const itemIds = new Set()
    function walk(obj) {
      for (const e of obj?.blueprint?.entities ?? []) {
        if (e.recipe) itemIds.add(e.recipe)
      }
      for (const b of obj?.blueprint_book?.blueprints ?? []) walk(b)
    }
    walk(json)

    if (json.blueprint_book) {
      return {
        type: 'blueprint_book',
        blueprint_count: json.blueprint_book.blueprints?.length ?? null,
        item_ids: [...itemIds],
      }
    }
    return { type: 'blueprint', blueprint_count: null, item_ids: [...itemIds] }
  } catch {
    return null
  }
}

async function importOne(id) {
  const info = await fetchJSON(`${FACTORIOBIN}/post/${id}/info.json`)
  await sleep(300)

  const bpUrl = info.node?.blueprintStringUrl
  const bpStr = bpUrl
    ? (await fetchText(bpUrl)).trim()
    : (await fetchText(`${FACTORIOBIN}/post/${id}/blueprint.txt`)).trim()

  const parsed = parseBlueprint(bpStr)
  if (!parsed) throw new Error('Could not parse blueprint string')

  const name = trunc(info.post.title, 80) ?? 'Untitled'
  if (name.length < 3) throw new Error(`Title too short: "${info.post.title}"`)

  const row = {
    name,
    description: trunc(info.node?.description, 300),
    author: trunc(info.post.postedBy?.username ?? 'factoriobin', 40),
    item_ids: parsed.item_ids,
    type: parsed.type,
    blueprint_count: parsed.blueprint_count,
    source_url: `${FACTORIOBIN}/post/${id}`,
    image_url: info.node?.imageUrl ?? info.post?.imageUrl ?? null,
    upvotes: info.post?.totalVotes ?? info.post?.votes ?? 0,
    downloads: info.post?.views ?? 0,
    tags: info.node?.tags ?? [],
  }

  const { error } = await supabase.from('blueprints').insert(row)
  if (error) throw new Error(error.message)
  return info.post.title
}

let ok = 0
let fail = 0

for (const id of ids) {
  process.stdout.write(`  ${id} … `)
  try {
    const title = await importOne(id)
    console.log(`✓  ${title}`)
    ok++
  } catch (e) {
    console.log(`✗  ${e.message}`)
    fail++
  }
  await sleep(DELAY_MS)
}

console.log(`\nDone. ${ok} imported, ${fail} failed.`)
