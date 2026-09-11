import { test, expect, type Locator } from "@playwright/test"

const colors = (locator: Locator) =>
  locator.evaluate((element) => {
    const style = getComputedStyle(element)
    return { background: style.backgroundColor, foreground: style.color }
  })

test.beforeEach(async ({ page }) => {
  await page.goto("/")
})

test("the root toggle changes rendered colors and reverses them", async ({ page }) => {
  const card = page.locator('[data-slot="card"]').first()
  const light = await colors(card)
  await page.getByRole("button", { name: "Use dark theme" }).click()
  expect(await colors(card)).not.toEqual(light)
  await page.getByRole("button", { name: "Use light theme" }).click()
  expect(await colors(card)).toEqual(light)
})

test("nested theme changes both built-in and status pairs without changing root", async ({
  page,
}) => {
  const surface = page.getByTestId("nested-surface")
  const status = surface.locator('[data-slot="badge"]')
  const lightSurface = await colors(surface)
  const lightStatus = await colors(status)
  const root = await colors(page.locator("body"))
  await page.getByRole("button", { name: "Toggle nested theme" }).click()
  const darkSurface = await colors(surface)
  const darkStatus = await colors(status)
  expect(darkSurface.background).not.toBe(lightSurface.background)
  expect(darkSurface.foreground).not.toBe(lightSurface.foreground)
  expect(darkStatus.background).not.toBe(lightStatus.background)
  expect(darkStatus.foreground).not.toBe(lightStatus.foreground)
  expect(await colors(page.locator("body"))).toEqual(root)
})

test("all eight labels render; empty and failure differ beyond color", async ({ page }) => {
  for (const state of [
    "live",
    "degraded",
    "offline",
    "stale",
    "blocked",
    "empty",
    "planned",
    "unknown",
  ]) {
    await expect(page.locator(`[data-example="${state}"] [data-slot="status"]`)).toHaveAttribute(
      "data-state",
      state,
    )
    await expect(page.locator(`[data-example="${state}"] [data-slot="badge"]`)).toContainText(
      state[0].toUpperCase() + state.slice(1),
    )
  }
  const empty = page.locator('[data-example="empty"] [data-slot="badge"]')
  const failed = page.locator('[data-example="degraded"] [data-slot="badge"]')
  expect(await colors(empty)).not.toEqual(await colors(failed))
  expect(await empty.locator("svg").innerHTML()).not.toBe(await failed.locator("svg").innerHTML())
  await expect(page.locator('[data-example="stale"] time')).toContainText("5m ago")
})

test("configuration cannot claim live and a checked value ages into stale", async ({ page }) => {
  await expect(
    page.getByRole("region", { name: "Evidence validation" }).locator('[data-slot="status"]'),
  ).toHaveAttribute("data-state", "unknown")
  await page.clock.install()
  await page.clock.fastForward(65_000)
  await expect(page.locator('[data-example="live"] [data-slot="status"]')).toHaveAttribute(
    "data-state",
    "stale",
  )
  await expect(page.locator('[data-example="live"] time')).toContainText("1m ago")
})

test("dialog traps focus, inherits dark theme, and returns focus on Escape", async ({ page }) => {
  await page.getByRole("button", { name: "Use dark theme" }).click()
  const trigger = page.getByRole("button", { name: "Open dialog", exact: true })
  await trigger.click()
  const dialog = page.getByRole("dialog", { name: "Example dialog" })
  await expect(dialog).toBeVisible()
  expect((await colors(dialog)).background).toBe((await colors(page.locator("body"))).background)
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press("Tab")
    expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true)
  }
  await page.keyboard.press("Escape")
  await expect(dialog).not.toBeVisible()
  await expect(trigger).toBeFocused()
})

test("sheet closes by keyboard, tabs navigate, field error is associated", async ({ page }) => {
  await page.getByRole("button", { name: "Open sheet" }).click()
  await expect(page.getByRole("dialog", { name: "Example sheet" })).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(page.getByRole("button", { name: "Open sheet" })).toBeFocused()
  await page.getByRole("tab", { name: "Table", exact: true }).focus()
  await page.keyboard.press("ArrowRight")
  await expect(page.getByRole("tab", { name: "Loading", exact: true })).toHaveAttribute(
    "aria-selected",
    "true",
  )
  await expect(page.getByRole("status", { name: "Loading fixture" })).toBeVisible()
  await expect(page.getByRole("textbox", { name: "Required name" })).toHaveAccessibleDescription(
    "Enter a name.",
  )
})

test("fixtures make no backend or external requests", async ({ page }) => {
  const requests: string[] = []
  page.on("request", (request) => {
    if (
      ["fetch", "xhr"].includes(request.resourceType()) ||
      !request.url().startsWith("http://127.0.0.1:4178/")
    )
      requests.push(request.url())
  })
  await page.reload()
  await page.getByRole("button", { name: "Use dark theme" }).click()
  await page.getByRole("button", { name: "Open dialog", exact: true }).click()
  expect(requests).toEqual([])
})

test("status pairs remain readable in both themes and fit a narrow viewport", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  for (const theme of ["light", "dark"]) {
    if (theme === "dark") await page.getByRole("button", { name: "Use dark theme" }).click()
    await expect
      .poll(async () =>
        page.locator('[data-example] [data-slot="badge"]').evaluateAll((elements) => {
          const canvas = document.createElement("canvas")
          canvas.width = canvas.height = 1
          const context = canvas.getContext("2d")!
          function luminance(color: string) {
            context.clearRect(0, 0, 1, 1)
            context.fillStyle = color
            context.fillRect(0, 0, 1, 1)
            const values = Array.from(context.getImageData(0, 0, 1, 1).data)
              .slice(0, 3)
              .map((channel) => {
                const value = channel / 255
                return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
              })
            return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722
          }
          return Math.min(
            ...elements.map((element) => {
              const style = getComputedStyle(element)
              const a = luminance(style.color)
              const b = luminance(style.backgroundColor)
              return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
            }),
          )
        }),
      )
      .toBeGreaterThanOrEqual(4.5)
  }
  await page.setViewportSize({ width: 375, height: 812 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})
