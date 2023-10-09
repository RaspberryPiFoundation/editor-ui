const allowedList = {
  'scratch.mit.edu': null,
  'trinket.io': null,
  'youtube.com': 'youtube-nocookie.com',
  'editor.raspberrypi.org': null,
}

const disableIframeContent = (content, t) => {
  if (window.Cookiebot?.consent?.marketing) {
    return content
  }

  const div = document.createElement('div')
  div.innerHTML = content

  const embeds = div.querySelectorAll('iframe')

  embeds.forEach((embed) => {
    let src = embed.getAttribute('src')

    for (const domain in allowedList) {
      if (src.includes(domain)) {
        const replace = allowedList[domain]
        if (replace) {
          embed.setAttribute('src', src.replace(domain, replace))
        }
        return
      }
    }

    embed.setAttribute('data-cookieblock-src', src)
    embed.setAttribute('data-cookieconsent', 'marketing')
    embed.removeAttribute('src')
    embed.classList.add('cookieconsent-optin-marketing')

    let parent = embed.parentNode
    let child = embed
    const messageDiv = document.createElement('div')
    messageDiv.classList.add('cookieconsent-optout-marketing')
    messageDiv.classList.add('c-cookieconsent-message')
    messageDiv.innerHTML = `
      <span class="c-cookieconsent-message__icon"></span>
      <span class="c-cookieconsent-message__text">
        ${t('project.cookies.disabled-content')}
      </span>
    `.trim()
    while (parent !== div) {
      parent.classList.add('cookieconsent-optin-marketing')
      parent.style.removeProperty('display')
      child = parent
      parent = parent.parentNode
    }
    parent.insertBefore(messageDiv, child)
  })

  return div.innerHTML
}

export { disableIframeContent }
