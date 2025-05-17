import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
import { likePost, unlikePost } from '../api.js'
import { getToken, goToPage, posts, user } from '../index.js'
import { AUTH_PAGE, USER_POSTS_PAGE } from '../routes.js'
import { renderHeaderComponent } from './header-component.js'

// Форматирование текста лайков
function formatLikesText(likes) {
	if (!likes || likes.length === 0) {
		return 'Нравится: 0'
	}
	if (likes.length === 1) {
		return `Нравится: ${likes[0].name}`
	}
	if (likes.length === 2) {
		return `Нравится: ${likes[0].name}, ${likes[1].name}`
	}
	return `Нравится: ${likes[0].name}, ${likes[1].name} и ещё ${
		likes.length - 2
	}`
}

export function renderPostsPageComponent({ appEl }) {
	const postsHtml = posts
		.map(post => {
			return `
        <li class="post">
          <div class="post-header" data-user-id="${post.user.id}">
            <img src="${post.user.imageUrl}" class="post-header__user-image">
            <p class="post-header__user-name">${post.user.name}</p>
          </div>
          <div class="post-image-container">
            <img class="post-image" src="${post.imageUrl}">
          </div>
          <div class="post-likes">
            <button data-post-id="${post.id}" class="like-button">
              <img src="${
								post.isLiked
									? './assets/images/like-active.svg'
									: './assets/images/like-not-active.svg'
							}">
            </button>
            <p class="post-likes-text">
              ${formatLikesText(post.likes)}
            </p>
          </div>
          <p class="post-text">
            <span class="user-name">${post.user.name}</span>
            ${post.description}
          </p>
          <p class="post-date">
            ${formatDistanceToNow(new Date(post.createdAt), {
							addSuffix: true,
							locale: ru,
						})}
          </p>
        </li>
      `
		})
		.join('')

	const appHtml = `
    <div class="page-container">
      <div class="header-container"></div>
      <ul class="posts">
        ${postsHtml}
      </ul>
    </div>`

	appEl.innerHTML = appHtml

	renderHeaderComponent({
		element: document.querySelector('.header-container'),
	})

	for (let userEl of document.querySelectorAll('.post-header')) {
		userEl.addEventListener('click', () => {
			goToPage(USER_POSTS_PAGE, {
				userId: userEl.dataset.userId,
			})
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
