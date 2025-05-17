import { formatDistanceToNow, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { goToPage, posts } from '../index.js'
import { POSTS_PAGE, USER_POSTS_PAGE } from '../routes.js'
import { renderHeaderComponent } from './header-component.js'

export function renderUserPostsPageComponent({ appEl, userId }) {
	const filteredPosts = posts.filter(post => post.user.id === userId)

	if (!userId) {
		goToPage(POSTS_PAGE)
		return
	}

	const appHtml = filteredPosts
		.map(post => {
			const createdAt = parseISO(post.createdAt)
			const timeAgo = formatDistanceToNow(createdAt, {
				addSuffix: true,
				locale: ru,
			})
			const formatLikesText = likes => {
				if (likes.length === 0) return 'Нравится: 0'
				if (likes.length === 1) return `Нравится: ${likes[0].name}`
				if (likes.length === 2)
					return `Нравится: ${likes[0].name}, ${likes[1].name}`
				return `Нравится: ${likes[0].name}, ${likes[1].name} и ещё ${
					likes.length - 2
				}`
			}

			return `
        <div class="post">
          <div class="post-header" data-user-id="${post.user.id}">
            <img src="${post.user.imageUrl}" class="post-header__user-image">
            <p class="post-header__user-name">${post.user.name}</p>
          </div>
          <div class="post-image-wrapper">
            <div class="post-image-blur" style="background-image: url(${
							post.imageUrl
						})"></div>
            <div class="post-image-container">
              <img src="${post.imageUrl}" class="post-image" alt="post">
            </div>
          </div>
          <div class="post-likes">
            <button data-post-id="${post.id}" class="like-button">
              <img src="./assets/images/${
								post.isLiked ? 'like-active.svg' : 'like-not-active.svg'
							}">
            </button>
            <p class="post-likes-text">${formatLikesText(post.likes)}</p>
          </div>
          <p class="post-text">
            <span class="user-name">${post.user.name}</span>
            ${post.description}
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

	for (let likeEl of document.querySelectorAll('.like-button')) {
		likeEl.addEventListener('click', () => {
			console.log(`Лайк для поста ${likeEl.dataset.postId}`)
		})
	}
}
