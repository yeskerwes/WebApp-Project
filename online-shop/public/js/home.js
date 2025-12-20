// PRODUCT MODAL LOGIC

const modal = document.getElementById('productModal')
const modalImage = document.getElementById('modalImage')
const modalName = document.getElementById('modalName')
const modalPrice = document.getElementById('modalPrice')
const modalDescription = document.getElementById('modalDescription')
const reviewUser = document.getElementById('reviewUser')
const reviewText = document.getElementById('reviewText')
const closeModal = document.querySelector('.close')

document.querySelectorAll('.card').forEach(card => {
  card.onclick = () => {
    modal.style.display = 'block'

    modalImage.src = card.dataset.image
    modalName.textContent = card.dataset.name
    modalPrice.textContent = '$' + card.dataset.price
    modalDescription.textContent = card.dataset.description

    reviewUser.textContent = card.dataset.user
    reviewText.textContent = card.dataset.review
  }
})

closeModal.onclick = () => {
  modal.style.display = 'none'
}

window.onclick = e => {
  if (e.target === modal) {
    modal.style.display = 'none'
  }
}

const feedbackBtn = document.getElementById('feedbackBtn')
const feedbackModal = document.getElementById('feedbackModal')
const feedbackClose = document.querySelector('.feedback-close')

feedbackBtn.onclick = () => {
  feedbackModal.style.display = 'block'
}

feedbackClose.onclick = () => {
  feedbackModal.style.display = 'none'
}

window.onclick = e => {
  if (e.target === feedbackModal) {
    feedbackModal.style.display = 'none'
  }
}

// XSS-VULNERABLE FEEDBACK LOGIC

const fbSend = document.getElementById('fbSend')
const fbMessages = document.getElementById('fbMessages')

fbSend.onclick = () => {
  const name = document.getElementById('fbName').value
  const text = document.getElementById('fbText').value
// Уязвимый ❌
//  fbMessages.innerHTML += `
//    <div class="fb-message">
//      <strong>${name}</strong>
//      <p>${text}</p>
//    </div>
//  `
    
// Защищенный ✅
    const msg = document.createElement('div')
    msg.className = 'fb-message'

    const strong = document.createElement('strong')
    strong.textContent = name

    const p = document.createElement('p')
    p.textContent = text

    msg.appendChild(strong)
    msg.appendChild(p)
    fbMessages.appendChild(msg)

  document.getElementById('fbName').value = ''
  document.getElementById('fbText').value = ''
}



