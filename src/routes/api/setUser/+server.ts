import { fail, json } from '@sveltejs/kit'

export async function POST({ request, cookies }) {
	const data = await request.json()
	const userId = data.userId

	console.log('FROM SET USER ID ACTION', userId)

	cookies.set('userId', userId, {
		path: '/',
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'strict',
		maxAge: 60 * 60 * 24 * 30, // 30 days
	})

	return json({ success: true })
}
