export const ssr = false

// export async function load({ cookies }) {
// 	const userId = cookies.get('userId') ?? '1'

// 	cookies.set('userId', userId, {
// 		path: '/',
// 		httpOnly: true,
// 		secure: process.env.NODE_ENV === 'production',
// 		sameSite: 'strict',
// 		maxAge: 60 * 60 * 24 * 30, // 30 days
// 	})

// 	console.log('userId from server', userId)
// 	return {
// 		userId,
// 	}
// }
