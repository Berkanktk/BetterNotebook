# BetterNotebook
Whether you're writing down quick notes, drafting extensive documents, or performing text analysis, BetterNotebook provides the necessary tools to make your writing and editing workflow as seamless as possible. 

> Made by an extensive NotePad user who wanted to create a better experience for himself and others who share the same sentiment through fulfilling some of the limitations of Notepad.

## Introduction

BetterNotebook is an [Electron](https://www.electronjs.org/) application crafted with [Svelte](https://svelte.dev/) and [TypeScript](https://www.typescriptlang.org/), offering a modern and enhanced notebook experience that bridges the gap left by traditional text editors like Windows NotePad. Designed for efficiency and ease of use, it combines the quick and minimalistic appeal of NotePad with a suite of powerful features, thus solving many of its limitations. BetterNotebook integrates these capabilities into a sleek user interface, catering to a wide range of text editing and note-taking needs without sacrificing speed or simplicity.

## Features

BetterNotebook comes packed with a variety of features designed to enhance your writing and note-taking experience:

- **Writing Text:** A straightforward and responsive text input interface.
- **Text Customization:** Easily select text size and line height to match your reading and writing preferences.
- **Change Text Case:** Transform your text with options to capitalize, lowercase/uppercase, sentence case, inverse, alternating and reverse text.
- **Math Operations:** Perform quick calculations thanks to the [MathJS](https://mathjs.org/) library and embed math operations directly within your notes. Simply type `$<expression>=` and BetterNotebook will automatically compute the result after the "=" sign, indicating the end of the expression.
- **Dark/Light Mode:** Switch between dark and light modes to reduce eye strain and improve visibility regardless of the lighting conditions.
- **Quick Timestamps:** Use special commands (`$now`, `$time`, `$date`, `$day`) to instantly insert accurate timestamps, dates, and weekday-names into your notes.
- **Search and Replace:** A powerful search and replace feature helps you quickly find text and make batch edits across your document.
- **Frequency Analysis:** Analyze the frequency of words in your text to identify common words and phrases, aiding in the improvement of your writing.
- **File Management:** Save your work and open existing files with ease, ensuring that your notes and documents are always accessible.
- **Markdown-like List Creations:** Simplify list creation with markdown-like syntax:
    - `1.` starts a numbered list.
    - `*` starts a bullet list.
- **Text Analysis:** View comprehensive statistics including the number of paragraphs, sentences, total words, and characters to gain insights into your writing.
- **Read and Speak Times:** Estimate the total read and speak times for your text, aiding in the preparation of speeches and presentations.

## Getting Started

To get started with BetterNotebook, clone the repository to your local machine and install the necessary dependencies.

### Install
```bash
$ git clone https://github.com/YourUsername/BetterNotebook.git
$ cd BetterNotebook
$ npm install
```

### Development
Once the dependencies are installed, you can run BetterNotebook in a development environment leveraging the fast build tool [Vite](https://vitejs.dev/) for an optimized development experience with:

```bash
$ npm run dev
```

### Build
To build and package the application for production using the [Electron Builder](https://www.electron.build/) tool, run the following commands based on your operating system:

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```

## Contributing

Contributions to BetterNotebook are always welcome, whether it be improvements to the documentation, bug reports, or new features. Please feel free to fork the repository and submit pull requests to help make BetterNotebook even better.

## License

BetterNotebook is released under the [MIT License](LICENSE). Feel free to use it in your projects and contribute back to the community.

