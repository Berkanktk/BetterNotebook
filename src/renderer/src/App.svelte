<script lang="ts">
  import {
    capitalizeText,
    sentenceCase,
    invertCase,
    randomCase,
    reverseText,
    calculateWordFrequency
  } from './components/Helpers'
  import Frequency from './components/Frequency.svelte'
  import Select from './components/Select.svelte'
  import ButtonImage from './components/ButtonImage.svelte'

  const wordsPerMinute = 200
  const speechPerMinute = 125
  import moonLogo from './assets/moon.svg'
  import sunLogo from './assets/sun.svg'
  import searchIcon from './assets/search.svg'
  import trashIcon from './assets/trash.svg'
  import frequencyIcon from './assets/frequency.svg'

  const ipcFind = (): void => window.electron.ipcRenderer.send('find', searchQuery)
  const ipcClear = (): void => window.electron.ipcRenderer.send('clear-find')

  let text: string = ''
  let searchQuery: string = ''
  let replaceQuery: string = ''
  let showSearchAndReplace: boolean = false
  let selectedSize: string = 'medium'
  let textSize: string = '16px'
  let selectedLineHeight: string = 'medium'
  let lineHeight: string = '1.35'
  let selectedCase: string = 'none'
  let searchActive: boolean = false
  let frequencyData = {}
  let frequencyActive: boolean = false
  let theme: string = 'dark'

  let sizeOptions = [
    { value: 'extra-small', label: '12px' },
    { value: 'small', label: '14px' },
    { value: 'medium', label: '16px' },
    { value: 'large', label: '18px' },
    { value: 'extra-large', label: '20px' }
  ]

  let selectedLineHeightOptions = [
    { value: 'extra-small', label: '1.0' },
    { value: 'small', label: '1.25' },
    { value: 'medium', label: '1.35' },
    { value: 'large', label: '1.5' },
    { value: 'extra-large', label: '1.75' }
  ]

  let selectedCaseOptions = [
    { value: 'uppercase', label: 'UPPERCASE' },
    { value: 'lowercase', label: 'lowercase' },
    { value: 'capitalize', label: 'Capitalize' },
    { value: 'sentencecase', label: 'Sentence' },
    { value: 'inversecase', label: 'iNVERSE' },
    { value: 'alternatingcase', label: 'AlTeRnAtInG' },
    { value: 'reverse', label: 'esreveR' }
  ]

  window.electron.ipcRenderer.on('save-file', () => {
    const contentToSave = text
    window.electron.ipcRenderer.send('save-dialog', contentToSave)
  })

  window.electron.ipcRenderer.on('open-file', () => {
    window.electron.ipcRenderer.send('open-dialog')
  })

  window.electron.ipcRenderer.on('file-opened', (event, content) => {
    text = content
  })

  $: frequencyData = calculateWordFrequency(text, frequencyData)
  $: readingTime = text ? Math.ceil(text.split(' ').length / wordsPerMinute) : 0
  $: speechTime = text ? Math.ceil(text.split(' ').length / speechPerMinute) : 0
  $: averageWordLength = text
    ? (text.replace(/ /g, '').length / text.split(' ').length).toFixed(2)
    : (0.0).toFixed(2)
  $: paragraphs = text.split('\n\n').filter((para) => para.trim() !== '').length
  $: sentences = text.split(/\.|\!|\?/).filter((sentence) => sentence.trim() !== '').length

  function toggleTheme() {
    theme = theme === 'light' ? 'dark' : 'light'
  }

  function handleInput() {
    const math = /\$(.+)=/
    const matchMath = text.match(math)
    selectedCase = 'none'

    // Handle bullet points and numbered lists
    const lines = text.split('\n')
    const newTextLines = lines.map((line, index, arr) => {
      // Handle bullet points triggered by "* "
      if (line.endsWith('* ')) {
        if (line.trim().length > 1) {
          return line.replace(/\* $/, '') + '\n• '
        } else {
          return line.replace(/\* $/, '• ')
        }
      }

      // Handle numbered lists triggered by "1. "
      else if (/^\d+\. $/.test(line)) {
        if (index > 0 && /^\d+\./.test(arr[index - 1].trim())) {
          const prevNum = parseInt(arr[index - 1].match(/^(\d+)\./)[1])
          return line.replace(/^\d+\. $/, `${prevNum + 1}. `)
        } else {
          return '1. '
        }
      }
      return line
    })
    text = newTextLines.join('\n')

    if (text.includes('$now')) {
      text = text.replace(
        '$now',
        new Date()
          .toLocaleString('en-GB', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          })
          .replace(/(\d{2})\.(\d{2})\.(\d{4})/, '$3/$1/$2')
      )
    } else if (text.includes('$date')) {
      text = text.replace(
        '$date',
        new Date()
          .toLocaleDateString('en-GB', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          })
          .replace(/(\d{2})\.(\d{2})\.(\d{4})/, '$3/$1/$2')
      )
    } else if (text.includes('$time')) {
      text = text.replace(
        '$time',
        new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        })
      )
    } else if (text.includes('$day')) {
      text = text.replace('$day', new Date().toLocaleDateString('en-GB', { weekday: 'long' }))
    }

    if (matchMath) {
      let expression = matchMath[1].trim()
      try {
        let result = eval(expression)
        text = text.replace(math, `${result.toFixed(2)} `)
      } catch (error) {
        console.error('Error evaluating expression:', error)
      }
    }
  }

  function performSearchAndReplace() {
    if (text && searchQuery && replaceQuery) {
      text = text.replace(new RegExp(searchQuery, 'gi'), replaceQuery)
      searchQuery = ''
      replaceQuery = ''
    } else if (text && searchQuery) {
      ipcFind()
      searchActive = true
    }
  }

  function handleTextSize() {
    if (selectedSize === 'extra-small') {
      textSize = '12px'
    } else if (selectedSize === 'small') {
      textSize = '14px'
    } else if (selectedSize === 'medium') {
      textSize = '16px'
    } else if (selectedSize === 'large') {
      textSize = '18px'
    } else if (selectedSize === 'extra-large') {
      textSize = '20px'
    }
  }

  function handleLineHeight() {
    if (selectedLineHeight === 'extra-small') {
      lineHeight = '1.0'
    } else if (selectedLineHeight === 'small') {
      lineHeight = '1.25'
    } else if (selectedLineHeight === 'medium') {
      lineHeight = '1.35'
    } else if (selectedLineHeight === 'large') {
      lineHeight = '1.5'
    } else if (selectedLineHeight === 'extra-large') {
      lineHeight = '1.75'
    }
  }

  function handleCase() {
    if (selectedCase === 'uppercase') {
      text = text.toUpperCase()
    } else if (selectedCase === 'lowercase') {
      text = text.toLowerCase()
    } else if (selectedCase === 'capitalize') {
      text = capitalizeText(text)
    } else if (selectedCase === 'sentencecase') {
      text = sentenceCase(text)
    } else if (selectedCase === 'inversecase') {
      text = invertCase(text)
    } else if (selectedCase === 'alternatingcase') {
      text = randomCase(text)
    } else if (selectedCase === 'reverse') {
      text = reverseText(text)
    }
  }

  function clearSearch() {
    searchQuery = ''
    replaceQuery = ''
    ipcClear()
    searchActive = false
  }

  function handleFrequency() {
    frequencyActive = !frequencyActive
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      const textarea = event.target as HTMLTextAreaElement
      let text = textarea.value
      const cursorPosition = textarea.selectionStart
      const lineStart = text.lastIndexOf('\n', cursorPosition - 1) + 1
      const lineText = text.substring(lineStart, cursorPosition)

      const insertText = (before, insert, after, offset = 0) => {
        const newText = `${before}${insert}${after}`
        textarea.value = newText
        const newPosition = before.length + insert.length + offset
        textarea.setSelectionRange(newPosition, newPosition)
        return newText
      }

      const beforeCursor = text.substring(0, cursorPosition)
      const afterCursor = text.substring(cursorPosition)

      // Handle empty bullet points
      if (lineText.trim() === '•') {
        event.preventDefault()
        text = insertText(text.substring(0, lineStart), '', afterCursor)
      }
      // Handle bullet points continuation
      else if (lineText.trim().startsWith('•')) {
        event.preventDefault()
        text = insertText(beforeCursor, '\n• ', afterCursor, 1)
      }

      // Handling for numbered lists
      const numberMatch = lineText.match(/^(\d+)\.\s*(.*)$/)
      if (numberMatch) {
        event.preventDefault()
        const currentNumber = parseInt(numberMatch[1])
        const restOfLineText = numberMatch[2]

        if (restOfLineText === '') {
          text = insertText(text.substring(0, lineStart), '', afterCursor)
        } else {
          text = insertText(beforeCursor, `\n${currentNumber + 1}. `, afterCursor, 1)
        }
      }
    }
  }

  $: if (searchQuery === '') {
    searchQuery = ''
    ipcClear()
  }
</script>

<div class="notebook" id="theme" class:dark={theme === 'dark'} class:light={theme === 'light'}>
  <div class="features">
    <div class="feature-list">
      <Select bind:value={selectedSize} onChange={handleTextSize} options={sizeOptions}/>
      <Select bind:value={selectedLineHeight} onChange={handleLineHeight} options={selectedLineHeightOptions}/>
      <Select bind:value={selectedCase} onChange={handleCase} options={selectedCaseOptions}/>

      <div class="vertical-sm">|</div>

      {#if !showSearchAndReplace}
        <input type="text" placeholder="Search" bind:value={searchQuery} />
        <input type="text" placeholder="Replace" bind:value={replaceQuery} />
      {/if}

      {#if !searchActive}
        {#if replaceQuery != ''}
          <ButtonImage src={searchIcon} alt="replace" text="Replace" onClick={performSearchAndReplace} />
        {:else}
          <ButtonImage src={searchIcon} alt="search" text="Search" onClick={performSearchAndReplace} />
        {/if}
      {:else}
        <ButtonImage src={trashIcon} alt="trash" text="Clear" onClick={clearSearch} />
      {/if}

      <div class="vertical-sm">|</div>

      <ButtonImage src={frequencyIcon} alt="frequency" text="Frequency" onClick={handleFrequency} />
    </div>

    <div class="feature-list">
      <button class="btn" on:click={toggleTheme}>
        <img
          src={theme === 'light' ? moonLogo : sunLogo}
          alt={theme === 'light' ? 'sun' : 'moon'}
        />
      </button>
    </div>
  </div>

  <div class="frequency-area">
    <textarea
      bind:value={text}
      spellcheck="false"
      on:input={handleInput}
      on:keydown={handleKeyDown}
      id="inputText"
      style={`font-size: ${textSize}; line-height: ${lineHeight};`}
    />

    {#if frequencyActive}
      <div class="vertical"></div>
      <Frequency {frequencyData} />
    {/if}
  </div>

  <div class="info-view">
    <span>C: {text.length}</span>
    <span>W: {text.split(' ').filter((word) => word !== '').length}</span>
    <span>P: {paragraphs}</span>
    <span>S: {sentences}</span>
    <span>Avg: {averageWordLength}</span>
    <span>RT: {readingTime} min</span>
    <span>ST: {speechTime} min</span>
  </div>
</div>

<style>
  :global(::-webkit-scrollbar) {
    background-color: #2c2c2c;
    width: 8px;
    height: 8px;
    border-radius: 4px;
  }

  :global(::-webkit-scrollbar-thumb) {
    background-color: #474747;
    border-radius: 4px;
  }

  :global(::selection) {
    background-color: yellow;
    color: black;
  }

  :global(::-moz-selection) {
    background-color: yellow;
    color: black;
  }
</style>
