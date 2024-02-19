export function capitalizeText(text: string): string {
    return text.replace(/\b\w/g, (char) => char.toUpperCase());
}

// Helper function to convert text to sentence case
export function sentenceCase(text: string): string {
    return text
        .split(". ")
        .map(
            (sentence) =>
                sentence.charAt(0).toUpperCase() +
                sentence.slice(1).toLowerCase()
        )
        .join(". ");
}

// Helper function to invert the case of each character
export function invertCase(text: string): string {
    return text
        .split("")
        .map((char) =>
            char === char.toUpperCase()
                ? char.toLowerCase()
                : char.toUpperCase()
        )
        .join("");
}

// Helper function to randomize the case of each character
export function randomCase(text: string): string {
    return text
        .split("")
        .map((char) =>
            Math.random() < 0.5 ? char.toUpperCase() : char.toLowerCase()
        )
        .join("");
}

// Helper function to reverse the text
export function reverseText(text: string): string {
    return text.split("").reverse().join("");
}

export function calcWordFreq(inputText: string, frequencyData: Record<string, number>) {
    const words = inputText.toLowerCase().match(/\b\w+\b/g);
    const frequency: Record<string, number> = {};

    if (words) {
        words.forEach((word) => {
            frequency[word] = (frequency[word] || 0) + 1;
        });
    }

    // Sort the frequency data by occurrence (descending)
    frequencyData = Object.entries(frequency)
        .sort((a, b) => b[1] - a[1])
        .reduce((obj, [word, count]) => ({ ...obj, [word]: count }), {});

    return frequencyData;
}

export function evalMath(text: string): string {
    const mathRegex = /\$(.+)=/;
    const match = text.match(mathRegex);
    if (match) {
        const expression = match[1].trim();
        try {
            const result = eval(expression);
            return text.replace(mathRegex, `${result.toFixed(2)} `);
        } catch (error) {
            console.error('Error evaluating expression:', error);
            return text;
        }
    }
    return text;
}

export function replaceDate(text: string): string {
    // Handle $now placeholder
    if (text.includes('$now')) {
        text = text.replace(
            '$now',
            new Date().toLocaleString('en-GB', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            }).replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1')
        );
    }
    // Handle $date placeholder
    if (text.includes('$date')) {
        text = text.replace(
            '$date',
            new Date().toLocaleDateString('en-GB', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }).replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1')
        );
    }
    // Handle $time placeholder
    if (text.includes('$time')) {
        text = text.replace(
            '$time',
            new Date().toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            })
        );
    }
    // Handle $day placeholder
    if (text.includes('$day')) {
        text = text.replace(
            '$day',
            new Date().toLocaleDateString('en-GB', {
                weekday: 'long'
            })
        );
    }
    return text;
}

export function handleLists(text: string): string {
    const lines = text.split('\n');
    const newTextLines = lines.map((line, index, arr) => {
        if (line.endsWith('* ')) {
            return line.trim().length > 1 ? line.replace(/\* $/, '') + '\n• ' : line.replace(/\* $/, '• ');
        } else if (/^\d+\. $/.test(line)) {
            const prevNum = index > 0 && /^\d+\./.test(arr[index - 1].trim()) ? parseInt(arr[index - 1].match(/^(\d+)\./)[1]) : 0;
            return prevNum > 0 ? line.replace(/^\d+\. $/, `${prevNum + 1}. `) : '1. ';
        }
        return line;
    });
    return newTextLines.join('\n');
}

export function setTextSize(selectedSize, textSize) {
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

    return textSize;
}

export function setLineHeight(selectedLineHeight, lineHeight) {
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

    return lineHeight;
}

export function applyCase(selectedCase, text) {
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

    return text;
}