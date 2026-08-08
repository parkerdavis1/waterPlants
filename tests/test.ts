import { expect, test } from '@playwright/test'

test('home page has expected h1', async ({ page }) => {
	await page.goto('/')
	await expect(page.locator('h1')).toBeVisible()
})

test('retries on water work', async ({ page }) => {
	let calls = 0
	await page.route('/24', async (route) => {
		calls++
		if (calls < 3) return route.fulfill({ status: 500, body: 'boom' })
		await route.continue()
	})
	await page.getByRole('button', { name: '💧Record Event' }).click()
	await page.getByRole('button', { name: /Submit/ }).click()
	await expect(page.getByText('Successfully watered')).toBeVisible()
	expect(calls).toBe(3)
})
