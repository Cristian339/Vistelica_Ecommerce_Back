declare module 'colorthief' {
    export default class ColorThief {
        getColor(image: Buffer | string): Promise<[number, number, number]> | [number, number, number];
        getPalette(image: Buffer | string, colorCount?: number): Promise<[number, number, number][]> | [number, number, number][];
    }
}
