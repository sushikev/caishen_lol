import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

export async function GET() {
  const filePath = join(process.cwd(), "skills.md");
  const content = await readFile(filePath, "utf-8");

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
}
