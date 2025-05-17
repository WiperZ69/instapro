import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
import { goToPage, user } from '../index.js'
import { POSTS_PAGE } from '../routes.js'
import { renderHeaderComponent } from './header-component.js'

export function renderUserPostsPageComponent({ appEl, posts, userId }) {
	// Попробуем найти имя пользователя из постов или использовать login из user
	const userName =
		posts.length > 0
			? posts[0].user.name
			: user && user.login === userId
			? user.name
			: 'Пользователь'

	const appHtml = `
      <div class="page-container">
        <div class="header-container"></div>
        <div class="user-posts">
          <h2 class="user-posts-title">${userName}</h2>
          <ul class="posts">
            ${
							posts.length === 0
								? '<p>У этого пользователя пока нет постов.</p>'
								: posts
										.map(
											post => `
                            <li class="post">
                              <div class="post-header" data-user-id="${
																post.user.id
															}">
                                <img src="${
																	post.user.imageUrl
																}" class="post-header__user-image" alt="Аватар пользователя">
                                <p class="post-header__user-name">${
																	post.user.name
																}</p>
                              </div>
                              <div class="post-image-container">
                                <img class="post-image" src="${
																	post.imageUrl
																}" alt="Пост">
                              </div>
                              <p class="post-text">${post.description}</p>
                              <p class="post-date">
																${formatDistanceToNow(new Date(post.createdAt), {
																	addSuffix: true,
																	locale: ru,
																})}
															</p>
                            </li>
                          `
										)
										.join('')
						}
          </ul>
          <div class="c-b">
					<button class="button" id="back-to-posts">Вернуться к ленте</button>
					</div>
        </div>
      </div>
    `

	appEl.innerHTML = appHtml

	renderHeaderComponent({
		element: document.querySelector('.header-container'),
	})

	// Обработчик клика для возврата к общей ленте
	document.getElementById('back-to-posts').addEventListener('click', () => {
		goToPage(POSTS_PAGE)
	})

	// Обработчик клика по имени пользователя
	document.querySelectorAll('.post-header').forEach(element => {
		element.addEventListener('click', () => {
			const clickedUserId = element.dataset.userId
			goToPage(USER_POSTS_PAGE, { userId: clickedUserId })
		})
	})
}
