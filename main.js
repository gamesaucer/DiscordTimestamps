(function () {
  /**
   * Relative Time Format for the current locale.
   */
  const rtf = new Intl.RelativeTimeFormat()

  /**
   * Units of time.
   */
  const rtfUnits = Object.entries({
    year: 24 * 60 * 60 * 1000 * 365,
    month: 24 * 60 * 60 * 1000 * 365 / 12,
    day: 24 * 60 * 60 * 1000,
    hour: 60 * 60 * 1000,
    minute: 60 * 1000,
    second: 1000
  })

  /**
   * Target formatting codes in Discord.
   */
  const formattingTypes = {
    D: date => date.toLocaleString(undefined, { dateStyle: 'long' }),
    d: date => date.toLocaleString(undefined, { dateStyle: 'short' }),
    F: date => `${date.toLocaleString(undefined, { dateStyle: 'full' })} ${date.toLocaleString(undefined, { timeStyle: 'short' })}`,
    f: date => `${date.toLocaleString(undefined, { dateStyle: 'long' })} ${date.toLocaleString(undefined, { timeStyle: 'short' })}`,
    R: date => getRelativeTime(date),
    T: date => date.toLocaleString(undefined, { timeStyle: 'medium' }),
    t: date => date.toLocaleString(undefined, { timeStyle: 'short' })
  }

  /**
   * Gets the text to paste in Discord to display the timestamp.
   */
  const getTimestampCode = (date, code) => `<t:${Number(date)}:${code}>`

  /**
   * Formats a relative timestamp.
   */
  const getRelativeTime = (d1, d2 = new Date()) => {
    const timeElapsed = d1 - d2
    const [name, unit] = rtfUnits.find(([_, value]) => Math.abs(timeElapsed) >= value) || rtfUnits.slice(-1)[0]
    return rtf.format(Math.round(timeElapsed / unit), name)
  }

  /**
   * Updates the output data.
   */
  const updateOutput = (listItems, input) => {
    const date = parseInput(input)
    if (isNaN(date)) return
    listItems.forEach(([key, el]) => {
      el.querySelector('input').value = getTimestampCode(date, key)
      el.querySelector('label').textContent = formattingTypes[key](date)
    })
  }

  /**
   * Resets the input & output data to match the current time.
   */
  const resetApp = (listItems, inputElement) => {
    const date = new Date()
    inputElement.value =
      `${date.toLocaleString(undefined, { dateStyle: 'long' })} ${date.toLocaleString(undefined, { timeStyle: 'medium' })}`
    updateOutput(listItems, inputElement.value)
  }

  /**
   * Creates a list item for each formatting code.
   */
  const createListItems = (inputElement, nowElement) => {
    const listItems = Object.entries(formattingTypes).map(([key, _]) => [key, createListItem(key)])
    inputElement.addEventListener('input', () => updateOutput(listItems, inputElement.value))
    nowElement.addEventListener('click', () => resetApp(listItems, inputElement))
    resetApp(listItems, inputElement)
  }

  /**
   * Creates a single list item.
   */
  const createListItem = id => {
    const list = document.querySelector('.output__list')

    const listItem = document.createElement('li')
    listItem.classList.add('output__listitem')

    const outputText = document.createElement('input')
    outputText.classList.add('output__text')
    outputText.id = `${id}-output`
    outputText.readOnly = true
    outputText.addEventListener('focus', () => outputText.select())
    listItem.append(outputText)

    const outputCopy = document.createElement('button')
    outputCopy.classList.add('output__copy')
    outputCopy.title = 'Copy'
    outputCopy.ariaLabel = outputCopy.title
    outputCopy.append('📋')
    let timeout
    const confirmState = 'output__listitem--confirm-copy'
    outputCopy.addEventListener('click', () => navigator.clipboard
      .writeText(outputText.value)
      .then(() => {
        clearTimeout(timeout)
        listItem.classList.add(confirmState)
        timeout = setTimeout(() => listItem.classList.remove(confirmState), 1000)
      }))
    listItem.append(outputCopy)
    listItem.append(' ')

    const outputLabel = document.createElement('label')
    outputLabel.classList.add('output__label')
    outputLabel.htmlFor = outputText.id
    listItem.append(outputLabel)

    list.append(listItem)
    return listItem
  }

  /**
   * Finds a matching date if possible
   */
  const parseInput = str => {
    return new Date(str) || new Date(`${new Date().toDateString()} ${str}`)
  }

  /**
   * Runs the app.
   */
  const run = () => createListItems(document.getElementById('input'), document.getElementById('now'))

  run()
})()
