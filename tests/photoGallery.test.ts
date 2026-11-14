import { expect, test } from '@playwright/test'

test('photo gallery opens from a past watering thumbnail and navigates', async ({ page }) => {
	await page.goto('/24')

	const trigger = page
		.getByRole('table')
		.getByRole('button', { name: /^View photo from / })
		.first()
	await expect(trigger).toBeVisible()
	await trigger.click()

	const gallery = page.getByTestId('photo-gallery')
	const counter = page.getByTestId('photo-gallery-counter')
	const newer = page.getByRole('button', { name: 'Newer photo' })
	const older = page.getByRole('button', { name: 'Older photo' })
	const date = gallery.locator('time')

	await expect(gallery).toBeVisible()
	await expect(counter).toHaveText(/^1 of \d+$/)

	const total = Number((await counter.textContent())?.match(/of (\d+)/)?.[1])
	expect(total).toBeGreaterThan(1)

	await expect(newer).toBeDisabled()
	const firstDate = await date.textContent()

	// Older photo moves forward in the newest -> oldest list.
	await older.click()
	await expect(counter).toHaveText(`2 of ${total}`)
	await expect(date).not.toHaveText(firstDate ?? '')
	await expect(gallery.getByText(/Two days overdue/)).toBeVisible()

	await newer.click()
	await expect(counter).toHaveText(`1 of ${total}`)
	await expect(date).toHaveText(firstDate ?? '')

	for (let index = 2; index <= total; index++) {
		await older.click()
		await expect(counter).toHaveText(`${index} of ${total}`)
	}

	await expect(older).toBeDisabled()
	await expect(newer).toBeEnabled()

	await page.keyboard.press('Escape')
	await expect(gallery).toBeHidden()

	await trigger.click()
	await expect(gallery).toBeVisible()

	// Click the dialog layer outside the centered panel.
	await page.locator('dialog[open]').click({ position: { x: 5, y: 5 } })
	await expect(gallery).toBeHidden()
})

test('large plant photo opens the gallery at its matching event', async ({ page }) => {
	await page.goto('/24')

	const trigger = page.getByRole('button', { name: /^View photo from / }).first()
	const label = await trigger.getAttribute('aria-label')
	await trigger.click()

	const gallery = page.getByTestId('photo-gallery')
	await expect(gallery).toBeVisible()
	await expect(gallery.locator('time')).toHaveText(label?.replace('View photo from ', '') ?? '')
})
