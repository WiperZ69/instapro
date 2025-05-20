export const sanitizeInput = value => {
	if (typeof value !== 'string') return value
	return value
		.replace(/&/g, '&amp;') // Экранируем &
		.replace(/</g, '&lt;') // Экранируем <
		.replace(/>/g, '&gt;') // Экранируем >
		.replace(/"/g, '&quot;') // Экранируем "
		.replace(/'/g, '&#39;') // Экранируем '
}
