const personalKey = 'wiperz'
const baseHost = 'https://webdev-hw-api.vercel.app'
const postsHost = `${baseHost}/api/v1/${personalKey}/instapro`

export function getPosts({ token }) {
	return fetch(postsHost, {
		method: 'GET',
		headers: {
			Authorization: token,
		},
	})
		.then(response => {
			if (response.status === 401) {
				throw new Error('Нет авторизации')
			}
			return response.json()
		})
		.then(data => {
			return data.posts
		})
}

export function getUserPosts({ userId, token }) {
	return fetch(`${postsHost}?userId=${userId}`, {
		method: 'GET',
		headers: {
			Authorization: token,
		},
	})
		.then(response => {
			if (response.status === 401) {
				throw new Error('Нет авторизации')
			}
			if (response.status === 400 || response.status === 404) {
				throw new Error('Не удалось загрузить посты пользователя')
			}
			return response.json()
		})
		.then(data => {
			return data.posts
		})
}

export function registerUser({ login, password, name, imageUrl }) {
	return fetch(baseHost + '/api/user', {
		method: 'POST',
		body: JSON.stringify({
			login,
			password,
			name,
			imageUrl,
		}),
	}).then(response => {
		if (response.status === 400) {
			throw new Error('Такой пользователь уже существует')
		}
		return response.json()
	})
}

export function loginUser({ login, password }) {
	return fetch(baseHost + '/api/user/login', {
		method: 'POST',
		body: JSON.stringify({
			login,
			password,
		}),
	}).then(response => {
		if (response.status === 400) {
			throw new Error('Неверный логин или пароль')
		}
		return response.json()
	})
}

export function uploadImage({ file }) {
	const data = new FormData()
	data.append('file', file)

	return fetch(baseHost + '/api/upload/image', {
		method: 'POST',
		body: data,
	}).then(response => {
		return response.json()
	})
}

export function addPost({ description, imageUrl, userId, token }) {
	const requestBody = {
		description,
		imageUrl,
		userId,
	}
	return fetch(postsHost, {
		method: 'POST',
		headers: {
			Authorization: token,
		},
		body: JSON.stringify(requestBody),
	}).then(response => {
		if (!response.ok) {
			return response.text().then(text => {
				let errorData
				try {
					errorData = JSON.parse(text)
				} catch {
					errorData = { message: text || `Ошибка ${response.status}` }
				}
				throw new Error(errorData.message || `Ошибка ${response.status}`)
			})
		}
		return response.json()
	})
}

export function likePost({ postId, token }) {
	return fetch(`${postsHost}/${postId}/like`, {
		method: 'POST',
		headers: {
			Authorization: token,
		},
	}).then(response => {
		if (response.status === 401) {
			throw new Error('Нет авторизации')
		}
		if (!response.ok) {
			return response.text().then(text => {
				let errorData
				try {
					errorData = JSON.parse(text)
				} catch {
					errorData = { message: text || `Ошибка ${response.status}` }
				}
				throw new Error(errorData.message || `Ошибка ${response.status}`)
			})
		}
		return response.json().then(data => {
			if (!data || !data.post || !data.post.id) {
				throw new Error(
					'Недействительный ответ сервера: отсутствует поле post.id'
				)
			}
			return data.post
		})
	})
}

export function unlikePost({ postId, token }) {
	return fetch(`${postsHost}/${postId}/dislike`, {
		method: 'POST',
		headers: {
			Authorization: token,
		},
	}).then(response => {
		if (response.status === 401) {
			throw new Error('Нет авторизации')
		}
		if (!response.ok) {
			return response.text().then(text => {
				let errorData
				try {
					errorData = JSON.parse(text)
				} catch {
					errorData = { message: text || `Ошибка ${response.status}` }
				}
				throw new Error(errorData.message || `Ошибка ${response.status}`)
			})
		}
		return response.json().then(data => {
			if (!data || !data.post || !data.post.id) {
				throw new Error(
					'Недействительный ответ сервера: отсутствует поле post.id'
				)
			}
			return data.post
		})
	})
}
