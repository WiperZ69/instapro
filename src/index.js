import '../public/styles.css'
import '../public/ui-kit.css'
import { addPost, getPosts, getUserPosts } from './api.js'
import { renderAddPostPageComponent } from './components/add-post-page-component.js'
import { renderAuthPageComponent } from './components/auth-page-component.js'
import { renderLoadingPageComponent } from './components/loading-page-component.js'
import { renderPostsPageComponent } from './components/posts-page-component.js'
import { renderUserPostsPageComponent } from './components/user-posts-page-component.js'
import {
	getUserFromLocalStorage,
	removeUserFromLocalStorage,
	saveUserToLocalStorage,
} from './helpers.js'
import {
	ADD_POSTS_PAGE,
	AUTH_PAGE,
	LOADING_PAGE,
	POSTS_PAGE,
	USER_POSTS_PAGE,
} from './routes.js'

export let user = getUserFromLocalStorage()
export let page = null
export let posts = []

const getToken = () => {
	const token = user ? `Bearer ${user.token}` : undefined
	return token
}

export const logout = () => {
	user = null
	removeUserFromLocalStorage()
	goToPage(POSTS_PAGE)
}

export const goToPage = (newPage, data) => {
	if (
		[
			POSTS_PAGE,
			AUTH_PAGE,
			ADD_POSTS_PAGE,
			USER_POSTS_PAGE,
			LOADING_PAGE,
		].includes(newPage)
	) {
		if (newPage === ADD_POSTS_PAGE) {
			page = user ? ADD_POSTS_PAGE : AUTH_PAGE
			return renderApp()
		}

		if (newPage === POSTS_PAGE) {
			page = LOADING_PAGE
			renderApp()

			return getPosts({ token: getToken() })
				.then(newPosts => {
					page = POSTS_PAGE
					posts = newPosts
					renderApp()
				})
				.catch(error => {
					console.error(error)
					goToPage(POSTS_PAGE)
				})
		}

		if (newPage === USER_POSTS_PAGE) {
			page = LOADING_PAGE
			renderApp()

			return getUserPosts({ userId: data.userId, token: getToken() })
				.then(userPosts => {
					page = USER_POSTS_PAGE
					posts = userPosts
					renderApp(data.userId)
				})
				.catch(error => {
					console.error('Ошибка загрузки постов пользователя:', error)
					alert('Не удалось загрузить посты пользователя. Попробуйте снова.')
					goToPage(POSTS_PAGE)
				})
		}

		page = newPage
		renderApp()

		return
	}

	throw new Error('страницы не существует')
}

const renderApp = userId => {
	const appEl = document.getElementById('app')
	if (page === LOADING_PAGE) {
		return renderLoadingPageComponent({
			appEl,
			user,
			goToPage,
		})
	}

	if (page === AUTH_PAGE) {
		return renderAuthPageComponent({
			appEl,
			setUser: newUser => {
				user = newUser
				saveUserToLocalStorage(user)
				goToPage(POSTS_PAGE)
			},
			user,
			goToPage,
		})
	}

	if (page === ADD_POSTS_PAGE) {
		return renderAddPostPageComponent({
			appEl,
			onAddPostClick({ description, imageUrl }) {
				addPost({
					description,
					imageUrl,
					userId: user?.login,
					token: getToken(),
				})
					.then(() => {
						goToPage(POSTS_PAGE)
					})
					.catch(error => {
						console.error('Ошибка при добавлении поста:', error.message)
						alert(`Не удалось добавить пост: ${error.message}`)
					})
			},
		})
	}

	if (page === POSTS_PAGE) {
		return renderPostsPageComponent({
			appEl,
		})
	}

	if (page === USER_POSTS_PAGE) {
		return renderUserPostsPageComponent({
			appEl,
			posts,
			userId,
		})
	}
}

goToPage(POSTS_PAGE)
