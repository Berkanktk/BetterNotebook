<script lang="ts">
  const wordsPerMinute = 200
  const speechPerMinute = 125
  import moonLogo from './assets/moon.svg'
  import sunLogo from './assets/sun.svg'
  import searchIcon from './assets/search.svg'

  let text: string = ''
  let searchQuery: string = ''
  let replaceQuery: string = ''
  let searchResult: string = ''
  let showSearchAndReplace: boolean = false

  let theme: string = 'dark'

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
    const mathPattern = /\$(.+)=/;
    const match = text.match(mathPattern);
    
    if (match) {
      let expression = match[1].trim(); 
      try {
        let result = eval(expression); 
        text = text.replace(mathPattern, `${result.toFixed(2)} `);
      } catch (error) {
        console.error('Error evaluating expression:', error);
      }
    }
  }
  
  // Function to perform a search and replace operation
  function performSearchAndReplace() {
    if (text && searchQuery && replaceQuery) {
      text = text.replace(new RegExp(searchQuery, 'g'), replaceQuery);
    } else if (text && searchQuery) {
      searchResult = text.match(new RegExp(searchQuery, 'g'))?.join(', ') || '';
      highlight(searchQuery);
      console.log(searchResult);
    }
  }

  function highlight(text) {
    var inputText = document.getElementById("inputText");
    var innerHTML = inputText.innerHTML;
    var index = innerHTML.indexOf(text);
    if (index >= 0) { 
    innerHTML = innerHTML.substring(0,index) + "<span class='highlight'>" + innerHTML.substring(index,index+text.length) + "</span>" + innerHTML.substring(index + text.length);
    inputText.innerHTML = innerHTML;
    }
  }

</script>

<div class="notebook" id="theme" class:dark={theme === 'dark'} class:light={theme === 'light'}>
  <div class="features">
    <div class="feature-list">
      <select>
        <option value="none" selected disabled hidden>Text Size</option>
        <option value="extra-small">Extra Small</option>
        <option value="small">Small</option>
        <option value="medium">Medium (default)</option>
        <option value="large">Large</option>
        <option value="extra-large">Extra Large</option>
      </select>

      <select>
        <option value="none" selected disabled hidden>Line Height</option>
        <option value="extra-small">1.0</option>
        <option value="small">1.25</option>
        <option value="medium">1.35 (default)</option>
        <option value="large">1.5</option>
        <option value="extra large">1.75</option>
      </select>

      <select>
        <option value="none" selected disabled hidden>Text Case</option>
        <option value="uppercase">UPPERCASE</option>
        <option value="lowercase">lowercase</option>
        <option value="capitalize">Capitalize</option>
        <option value="sentencecase">Sentence</option>
        <option value="inversecase">iNVERSE</option>
        <option value="alternatingcase">AlTeRnAtInG</option>
        <option value="reverse">esreveR</option>
      </select>

      <div class="vertical">|</div>

      {#if !showSearchAndReplace}
        <input type="text" placeholder="Search" bind:value={searchQuery}/>
        <input type="text" placeholder="Replace" bind:value={replaceQuery} />
      {/if}

      <button class="btn" on:click={performSearchAndReplace}>
        <img src={searchIcon} alt="search"/>
        {replaceQuery == "" ? "Search" : "Replace"}
      </button>

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

  <textarea bind:value={text} spellcheck="false" on:input={handleInput} id="inputText"/>

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
  }

  :global(::-webkit-scrollbar-thumb) {
    background-color: #474747;
    border-radius: 4px;
  }
</style>
