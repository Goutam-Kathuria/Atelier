import { NextResponse } from "next/server"
import { appendFile, mkdir } from "node:fs/promises"
import path from "node:path"

export const dynamic = "force-dynamic"

const DATA_DIR = path.join(process.cwd(), "data", "contact")
const FILE = path.join(DATA_DIR, "inquiries.ndjson")

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const name = typeof body.name === "string" ? body.name.trim().slice(0, 120) : ""
    const email = typeof body.email === "string" ? body.email.trim().slice(0, 180) : ""
    const enquiry = typeof body.enquiry === "string" ? body.enquiry.trim().slice(0, 80) : "general"
    const message = typeof body.message === "string" ? body.message.trim().slice(0, 4000) : ""
    if (!name || !email || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please provide a valid name, email and message." }, { status: 400 })
    }
    await mkdir(DATA_DIR, { recursive: true })
    await appendFile(FILE, JSON.stringify({ id: crypto.randomUUID(), name, email, enquiry, message, createdAt: new Date().toISOString() }) + "\n", "utf8")
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Unable to save the enquiry." }, { status: 500 })
  }
}
