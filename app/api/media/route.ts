import { NextResponse } from 'next/server'
import { mkdir, readdir, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { randomUUID } from 'node:crypto'

export const dynamic = 'force-dynamic'

const root = path.join(process.cwd(), 'public', 'uploads')
const safeName = (name: string) => name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 100) || 'asset'
const safeToken = (value: string) => value.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 120)
const mediaKind = (name: string, mime = ''): 'image' | 'video' | 'model' | 'unknown' => {
  const ext = path.extname(name).toLowerCase()
  if (['.glb', '.gltf', '.fbx'].includes(ext)) return 'model'
  if (/\.(mp4|mov|webm|m4v|ogg)$/i.test(name) || mime.startsWith('video/')) return 'video'
  if (mime.startsWith('image/') || /\.(avif|webp|png|jpe?g|gif|svg)$/i.test(name)) return 'image'
  return 'unknown'
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token')
  if (!token) return NextResponse.json({ assets: [] })
  const dir = path.join(root, safeToken(token))
  try {
    const names = await readdir(dir)
    const assets = await Promise.all(names.map(async (name) => {
      const details = await stat(path.join(dir, name))
      return {
        name,
        url: `/uploads/${safeToken(token)}/${encodeURIComponent(name)}`,
        size: details.size,
        modifiedAt: details.mtime.toISOString(),
        type: mediaKind(name),
      }
    }))
    return NextResponse.json({ assets: assets.sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt)) })
  } catch {
    return NextResponse.json({ assets: [] })
  }
}

export async function POST(request: Request) {
  try {
    const form = await request.formData()
    const token = form.get('token')
    const file = form.get('file')
    if (typeof token !== 'string' || !(file instanceof File)) return NextResponse.json({ error: 'token and file required' }, { status: 400 })
    const kind = mediaKind(file.name, file.type)
    if (kind === 'unknown') return NextResponse.json({ error: 'Supported uploads: images, videos, and 3D models (.glb, .gltf, .fbx).' }, { status: 400 })
    const maxBytes = kind === 'model' || kind === 'video' ? 80 * 1024 * 1024 : 15 * 1024 * 1024
    if (file.size > maxBytes) return NextResponse.json({ error: `File is too large. Max ${kind === 'image' ? '15MB' : '80MB'}.` }, { status: 413 })
    const folder = path.join(root, safeToken(token))
    await mkdir(folder, { recursive: true })
    const filename = `${randomUUID()}-${safeName(file.name)}`
    await writeFile(path.join(folder, filename), Buffer.from(await file.arrayBuffer()))
    return NextResponse.json({ url: `/uploads/${safeToken(token)}/${encodeURIComponent(filename)}`, name: file.name, type: kind, size: file.size })
  } catch {
    return NextResponse.json({ error: 'upload failed' }, { status: 500 })
  }
}
