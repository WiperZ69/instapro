import { uploadImage } from '../api.js'
import { renderHeaderComponent } from './header-component.js'
import { sanitizeInput } from './replace.js'

export function renderAddPostPageComponent({ appEl, onAddPostClick }) {
	let imageUrl = ''

	const render = () => {
		const appHtml = `
      <div class="page-container">
        <div class="header-container"></div>
        <div class="form">
          <h2 class="form-title">Добавить пост</h2>
          <div class="form-inputs">
            <div class="upload-image">
              ${
								imageUrl
									? `
                <div class="file-upload-image-container">
                  <img class="file-upload-image" src="${imageUrl}" alt="Загруженное изображение">
                  <button class="file-upload-remove-button button">Заменить фото</button>
                </div>
              `
									: `
                <label class="file-upload-label secondary-button">
                  <input
                    type="file"
                    class="file-upload-input"
                    style="display:none"
                  />
                  Выберите фото
                </label>
              `
							}
            </div>
            <input type="text" id="description-input" class="input" placeholder="Введите описание" />
          </div>
          <div class="form-buttons">
            <button class="button" id="add-button">Добавить</button>
          </div>
        </div>
      </div>
    `

		appEl.innerHTML = appHtml

		renderHeaderComponent({
			element: document.querySelector('.header-container'),
		})

		document.getElementById('add-button').addEventListener('click', () => {
			const description = sanitizeInput(
				document.getElementById('description-input').value.trim()
			)
			if (!description || !imageUrl) {
				alert('Заполните описание и выберите фото!')
				return
			}
			if (description.length < 3) {
				alert('Описание должно содержать минимум 3 символа')
				return
			}
			if (!imageUrl.startsWith('https://')) {
				alert('Неверный URL изображения')
				return
			}
			onAddPostClick({
				description,
				imageUrl,
			})
		})

		const fileInputEl = document.querySelector('.file-upload-input')
		if (fileInputEl) {
			fileInputEl.addEventListener('change', () => {
				const file = fileInputEl.files[0]
				if (!file) return

				const labelEl = document.querySelector('.file-upload-label')
				if (labelEl) {
					labelEl.setAttribute('disabled', true)
					labelEl.textContent = 'Загрузка...'
				}

				uploadImage({ file })
					.then(response => {
						imageUrl = response.fileUrl
						render()
					})
					.catch(error => {
						console.error('Ошибка загрузки изображения:', error)
						alert('Ошибка при загрузке изображения. Попробуйте снова.')
						if (labelEl) {
							labelEl.removeAttribute('disabled')
							labelEl.textContent = 'Выберите фото'
						}
					})
			})
		}

		const removeButtonEl = document.querySelector('.file-upload-remove-button')
		if (removeButtonEl) {
			removeButtonEl.addEventListener('click', () => {
				imageUrl = ''
				render()
			})
		}
	}

	render()
}
