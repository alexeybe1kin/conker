import { readFile, writeFile } from "node:fs/promises"
import { spawn } from "node:child_process"

const mutants = [
  {
    name: "non-inline token mapping",
    file: "src/styles.css",
    from: "@theme inline {",
    to: "@theme {",
    test: "nested theme changes",
  },
  {
    name: "unverified live assertion",
    file: "src/status.tsx",
    from: "const resolved = resolveStatus(evidence, now)",
    to: "const resolved = evidence",
    test: "configuration cannot claim live",
  },
  {
    name: "live never expires",
    file: "src/status.tsx",
    from: "if (now - checked >= evidence.staleAfterMs)",
    to: "if (false)",
    test: "configuration cannot claim live",
  },
]

function run(pattern) {
  return new Promise((resolve, reject) => {
    const args = ["node_modules/@playwright/test/cli.js", "test", "--reporter=json"]
    if (pattern) args.push("--grep", pattern)
    const child = spawn(process.execPath, args, {
      stdio: ["ignore", "pipe", "inherit"],
      windowsHide: true,
    })
    let output = ""
    child.stdout.on("data", (data) => {
      output += data
    })
    child.on("error", reject)
    child.on("exit", (code) => {
      try {
        resolve({ code, report: JSON.parse(output) })
      } catch {
        reject(
          new Error(
            "Test runner did not produce a report; fix the environment before judging a mutant.",
          ),
        )
      }
    })
  })
}

const baseline = await run()
if (baseline.code !== 0 || baseline.report.stats.unexpected !== 0)
  throw new Error("Baseline failed. Run npm test and fix it before running the drill.")
for (const mutant of mutants) {
  const original = await readFile(mutant.file, "utf8")
  if (original.split(mutant.from).length !== 2)
    throw new Error(`Mutation anchor changed: ${mutant.name}. Update the drill.`)
  try {
    await writeFile(mutant.file, original.replace(mutant.from, mutant.to))
    const result = await run(mutant.test)
    const errors = JSON.stringify(result.report)
    if (result.code === 0 || result.report.stats.unexpected !== 1 || !errors.includes("expect(")) {
      throw new Error(
        `${mutant.name}: not caught by its behavioral assertion. Inspect the test report.`,
      )
    }
    console.log(`CAUGHT: ${mutant.name}`)
  } finally {
    await writeFile(mutant.file, original)
  }
}
console.log("All three mutants were caught; original sources restored.")
