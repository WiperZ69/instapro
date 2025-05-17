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
	const jsonBody = JSON.stringify(requestBody, null, 2)
	return fetch(postsHost, {
		method: 'POST',
		headers: {
			Authorization: token,
		},
		body: jsonBody,
	})
		.then(response => {
			if (!response.ok) {
				return response.json().then(errorData => {
					console.error('Ответ сервера:', errorData)
					throw new Error(errorData.message || `Ошибка ${response.status}`)
				})
			}
			return response.json()
		})
		.catch(error => {
			console.error('Ошибка запроса:', error)
			throw error
		})
}
