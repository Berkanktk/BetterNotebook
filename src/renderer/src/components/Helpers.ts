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

export function calculateWordFrequency(inputText: string, frequencyData: Record<string, number>) {
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