<script lang="ts">
  import { calcWordFreq, replaceDate, evalMath, handleLists, setTextSize, setLineHeight, applyCase } from './components/lib/Helpers'
  import { sizeOptions, lineHeightOptions, caseOptions, wordsPerMinute, speechPerMinute, textFormatting } from './components/lib/Constants'
  
  import type { Theme } from './Types'
  import Frequency from './components/Frequency.svelte'
  import Select from './components/Select.svelte'
  import ButtonImage from './components/ButtonImage.svelte'
  import { logos } from './components/lib/Icons'

  const ipcFind = (): void => window.electron.ipcRenderer.send('find', searchQuery)
  const ipcClear = (): void => window.electron.ipcRenderer.send('clear-find')

  let text: string = ''
  let searchQuery: string = ''
  let replaceQuery: string = ''
  let showSearchAndReplace: boolean = false
  let searchActive: boolean = false
  let frequencyData = {}
  let frequencyActive: boolean = false
  let theme: Theme = 'dark'

  function toggleTheme() {
    theme = theme === 'light' ? 'dark' : 'light'
  }

  function handleInput() {
    text = handleLists(text)
    text = replaceDate(text)
    text = evalMath(text)
  }

  function handleSettings() {
    textFormatting.textSize = setTextSize(textFormatting.selectedSize, textFormatting.textSize)
    textFormatting.lineHeight = setLineHeight(textFormatting.selectedLineHeight, textFormatting.lineHeight)
    text = applyCase(textFormatting.selectedCase, text)
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

  window.electron.ipcRenderer.on('save-file', () => {
    const contentToSave = text
    window.electron.ipcRenderer.send('save-dialog', contentToSave)
  })

  window.electron.ipcRenderer.on('open-file', () => {
    window.electron.ipcRenderer.send('open-dialog')
  })

  window.electron.ipcRenderer.on('file-opened', (_event, content) => {
    text = content
  })

  // https://github.com/Berkanktk/CharacterAnalyzer/
  $: frequencyData = calcWordFreq(text, frequencyData)
  $: readingTime = text ? Math.ceil(text.split(' ').length / wordsPerMinute) : 0
  $: speechTime = text ? Math.ceil(text.split(' ').length / speechPerMinute) : 0
  $: averageWordLength = text
    ? (text.replace(/ /g, '').length / text.split(' ').length).toFixed(2)
    : (0.0).toFixed(2)
  $: paragraphs = text.split('\n\n').filter((para) => para.trim() !== '').length
  $: sentences = text.split(/\.|\!|\?/).filter((sentence) => sentence.trim() !== '').length
  $: if (searchQuery === '') {
    searchQuery = ''
    ipcClear()
  }
</script>

<div class="notebook" id="theme" class:dark={theme === 'dark'} class:light={theme === 'light'}>
  <div class="features">
    <div class="feature-list">
      <Select bind:value={textFormatting.selectedSize} onChange={handleSettings} options={sizeOptions}/>
      <Select bind:value={textFormatting.selectedLineHeight} onChange={handleSettings} options={lineHeightOptions}/>
      <Select bind:value={textFormatting.selectedCase} onChange={handleSettings} options={caseOptions}/>

      <div class="vertical-sm">|</div>

      {#if !showSearchAndReplace}
        <input type="text" placeholder="Search" bind:value={searchQuery} />
        <input type="text" placeholder="Replace" bind:value={replaceQuery} />
      {/if}

      {#if !searchActive}
        {#if replaceQuery != ''}
          <ButtonImage src={logos.search} alt="replace" text="Replace" onClick={performSearchAndReplace} />
        {:else}
          <ButtonImage src={logos.search} alt="search" text="Search" onClick={performSearchAndReplace} />
        {/if}
      {:else}
        <ButtonImage src={logos.trash} alt="trash" text="Clear" onClick={clearSearch} />
      {/if}

      <div class="vertical-sm">|</div>

      <ButtonImage src={logos.frequency} alt="frequency" text="Frequency" onClick={handleFrequency} />
    </div>

    <div class="feature-list">
      <button class="btn" on:click={toggleTheme}>
        <img
          src={theme === 'light' ? logos.moon : logos.sun}
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
      style={`font-size: ${textFormatting.textSize}; line-height: ${textFormatting.lineHeight};`}
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
