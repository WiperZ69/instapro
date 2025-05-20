import { formatDistanceToNow, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { likePost, unlikePost } from '../api.js'
import { getToken, goToPage, posts, user } from '../index.js'
import { AUTH_PAGE, USER_POSTS_PAGE } from '../routes.js'
import { renderHeaderComponent } from './header-component.js'
import { sanitizeInput } from './replace.js'

export function formatLikesText(likes) {
	if (likes.length === 0) return 'Нравится: 0'
	if (likes.length === 1) return `Нравится: ${sanitizeInput(likes[0].name)}` // Экранируем имя
	if (likes.length === 2)
		return `Нравится: ${sanitizeInput(likes[0].name)}, ${sanitizeInput(
			likes[1].name
		)}`
	return `Нравится: ${sanitizeInput(likes[0].name)}, ${sanitizeInput(
		likes[1].name
	)} и ещё ${likes.length - 2}`
}
export function renderPostsPageComponent({ appEl }) {
	const appHtml = posts
		.map(post => {
			const createdAt = parseISO(post.createdAt)
			const timeAgo = formatDistanceToNow(createdAt, {
				addSuffix: true,
				locale: ru,
			})

			return `
        <div class="post">
          <div class="post-header" data-user-id="${sanitizeInput(
						post.user.id
					)}">
            <img src="${sanitizeInput(
							post.user.imageUrl
						)}" class="post-header__user-image">
            <p class="post-header__user-name">${sanitizeInput(
							post.user.name
						)}</p>
          </div>
          <div class="post-image-wrapper">
            
            <div class="post-image-container">
            <div class="post-image-blur" style="background-image: url(${sanitizeInput(
							post.imageUrl
						)})"></div>
              <img src="${sanitizeInput(
								post.imageUrl
							)}" class="post-image" alt="post">
               
            </div>
          </div>
          <div class="post-likes">
            <button data-post-id="${sanitizeInput(
							post.id
						)}" class="like-button">
              <img src="./assets/images/${
								post.isLiked ? 'like-active.svg' : 'like-not-active.svg'
							}">
            </button>
            <p class="post-likes-text">${formatLikesText(post.likes)}</p>
          </div>
          <p class="post-text">
            <span class="user-name">${sanitizeInput(post.user.name)}</span>
            ${sanitizeInput(post.description)}
          </p>
          <p class="post-date">${timeAgo}</p>
        </div>`
		})
		.join('')

	appEl.innerHTML = `
    <div class="page-container">
      <div class="header-container"></div>
      <ul class="posts">
        ${appHtml}
      </ul>
    </div>`

	renderHeaderComponent({
		element: document.querySelector('.header-container'),
	})

	for (let userEl of document.querySelectorAll('.post-header')) {
		userEl.addEventListener('click', () => {
			goToPage(USER_POSTS_PAGE, { userId: userEl.dataset.userId })
		})
	}

	for (let likeButton of document.querySelectorAll('.like-button')) {
		likeButton.addEventListener('click', () => {
			const postId = likeButton.dataset.postId
			const post = posts.find(p => p.id === postId)
			if (!user) {
				alert('Войдите в аккаунт, чтобы лайкать посты')
				goToPage(AUTH_PAGE)
				return
			}

			const action = post.isLiked ? unlikePost : likePost
			action({ postId, token: getToken() })
				.then(updatedPost => {
					if (!updatedPost || !updatedPost.id) {
						throw new Error('Недействительный пост: отсутствует id')
					}
					const index = posts.findIndex(p => p.id === postId)
					if (index === -1) {
						throw new Error('Пост не найден в массиве posts')
					}
					posts[index] = updatedPost
					// Обновляем только иконку и текст лайков
					const button = document.querySelector(
						`.like-button[data-post-id="${postId}"]`
					)
					const likesText = button.nextElementSibling
					button.querySelector('img').src = updatedPost.isLiked
						? './assets/images/like-active.svg'
						: './assets/images/like-not-active.svg'
					likesText.textContent = formatLikesText(updatedPost.likes)
				})
				.catch(error => {
					alert(`Не удалось изменить лайк: ${error.message}`)
				})
		})
	}
}
