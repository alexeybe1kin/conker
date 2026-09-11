import { readdir, readFile } from "node:fs/promises"

async function inspect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = `${directory}/${entry.name}`
    if (entry.isDirectory()) {
      await inspect(path)
      continue
    }
    if (!/\.(tsx?|css)$/.test(entry.name) || path === "src/styles.css") continue
    const source = await readFile(path, "utf8")
    const forbidden =
      /#[\da-fA-F]{3,8}\b|\b(?:oklch|rgba?|hsla?)\(|font-family\s*:|fontFamily\s*:|(?:bg|text|border|ring|fill|stroke)-(?:white|black|(?:red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone)-\d+)/g
    if (forbidden.test(source))
      throw new Error(
        `${path}: use a semantic token from src/styles.css instead of a literal color or font.`,
      )
  }
}

await inspect("src")
await inspect("fixtures")
console.log("Components and fixtures use semantic colors and typography.")
