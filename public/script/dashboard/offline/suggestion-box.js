/* eslint-disable */
class SuggestionBox {
  constructor({ inputElement, element, apiGet }) {
    this.inputElementRaw = inputElement
    this.elementRaw = element

    this.inputElement = document.querySelector(inputElement) // Refers to the input element
    this.element = document.querySelector(element) // Refers to suggestions box (consist of list of suggestion)
    this.apiGet = apiGet
    this.selectedIndex = -1
    this.showSuggestionBox = false
    this.data = []

    this.keyDownEvent = this.keyDownEvent.bind(this)
    this.clickSuggestion = this.clickSuggestion.bind(this)
    this.suggestionBoxToggleVisibility = this.suggestionBoxToggleVisibility.bind(this)
    this.init = this.init.bind(this)
    this.getData = this.getData.bind(this)
    this.createSuggestionBoxChildren = this.createSuggestionBoxChildren.bind(this)
    this.resetDataAndEl = this.resetDataAndEl.bind(this)

    this.init()

    document.addEventListener('click', (e) => {
      const targetElement = e.target
      if (!targetElement.closest(this.inputElementRaw) && this.data.length > 0) {
        this.suggestionBoxToggleVisibility()
      }
    })
  }

  //   Initialize all functions/datas at the first render
  init() {
    this.inputElement.addEventListener('keydown', this.keyDownEvent)
    this.inputElement.addEventListener('focus', this.suggestionBoxToggleVisibility)
    this.inputElement.addEventListener('input', this.getData)

    this.element.addEventListener('click', this.clickSuggestion)
  }

  //   Handle click event on suggestion item
  clickSuggestion(e) {
    if (e.target && e.target.classList.contains('suggestion-item')) {
      const index = Array.from(this.element.children).indexOf(e.target)
      this.selectedIndex = index
      this.selectSuggestion(this.selectedIndex)

      this.resetDataAndEl()
    }
    this.suggestionBoxToggleVisibility()
  }

  /**
   * Handle select condition, when we change focus in suggestion item, it will highlight the item
   * and will set the inputValue with selected element dataset.id value.
   */
  selectSuggestion(index) {
    this.selectedIndex = index
    const items = this.element.querySelectorAll('li')
    items.forEach((item, i) => {
      const eventId = item.dataset.id ?? ''
      if (i === this.selectedIndex) {
        item.classList.add('highlight')
        this.inputElement.value = eventId
      } else {
        item.classList.remove('highlight')
      }
    })
  }

  //   Handle keydown
  keyDownEvent(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      this.selectedIndex = Math.min(this.selectedIndex + 1, this.element.children.length - 1)
      this.selectSuggestion(this.selectedIndex)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      this.selectedIndex = Math.max(this.selectedIndex - 1, -1)
      this.selectSuggestion(this.selectedIndex)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      this.inputElement.blur()
      this.suggestionBoxToggleVisibility()
      this.resetDataAndEl()
    }
  }

  // Handle suggestion box visibility, by toggling its classes.
  suggestionBoxToggleVisibility() {
    if (!this.showSuggestionBox) {
      this.element.classList.add('block')
      this.element.classList.remove('hidden')
    } else {
      this.element.classList.remove('block')
      this.element.classList.add('hidden')
    }

    this.showSuggestionBox = !this.showSuggestionBox
    this.resetDataAndEl()
  }

  // Will make a fetch to apiGet URL and create children element in suggestion box
  async getData(e) {
    if (!this.apiGet) {
      throw new Error('NO_APIGET_URL')
    }

    const searchQ = e.target.value || ''
    const response = await fetch(`${this.apiGet}?search=${searchQ}`, {
      method: 'GET'
    })
    const responseJson = await response.json()
    this.data = responseJson.data

    this.createSuggestionBoxChildren()
  }

  // Create suggestion box children
  createSuggestionBoxChildren() {
    let element = ''
    if (this.data.length > 0) {
      this.data.forEach((data) => {
        element += `
              <li class="suggestion-item" data-id="${data.id}">${data.name}</li>
              `
      })
    }
    this.element.innerHTML = element
  }

  //   Reset data and reset children element
  resetDataAndEl() {
    this.data = []
    this.createSuggestionBoxChildren()
  }
}
