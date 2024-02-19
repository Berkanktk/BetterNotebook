export type Theme = 'dark' | 'light';

export interface Logo {
    [key: string]: string
}

export interface Options {
    value: string,
    label: string
}

export interface TextFormatting {
    selectedSize: string,
    textSize: string,
    selectedLineHeight: string,
    lineHeight: string,
    selectedCase: string
}
