/// <reference types="node" />
import { PNG } from "pngjs";
import { Stream } from "stream";
interface Color {
    r: number;
    g: number;
    b: number;
    a?: number;
}
export declare type ImageSource = string | Stream | Buffer;
declare class Canvas {
    private pngInstance;
    private readonly width;
    private readonly height;
    constructor(width: number, height: number);
    /**
     * Change the background of the image.
     * @param color
     * */
    background(color: Color): this;
    /**
     * Loads and returns an image from ImageSource.
     * @param source The source of the image. Either a path to the file, a http url, a buffer or a stream.
     * @param inputType Optional parameter for overriding the type of the input. If undefined, the type is inferred from the source.
     * */
    static loadImage(source: ImageSource, inputType?: "buffer" | "stream" | "filepath" | "url"): Stream | undefined;
    /**
     * Loads an image from a specified URL and returns a promise that resolves to the image. Unlike loadImage, this method is asynchronous and has to be awaited!
     * @param url The url of the image.
     * */
    static loadImageFromUrl(url: string): Promise<Stream>;
    _resizeImage(imagePng: PNG, targetWidth: number, targetHeight: number): PNG;
    drawImage(stream: Stream, x?: number, y?: number, width?: number, height?: number): Promise<unknown>;
    /**
     * Returns a string like "Canvas(w, h)"
     * @return String
     * */
    toString(): string;
    /**
     * Converts image instance to a writable stream.
     * @return Stream
     * */
    toStream(): PNG;
    /**
     * Converts image instance to a buffer and writes it to a file at path.
     * @param path Path to write the image to. Directly passed into fs.createWriteStream()
     * @return undefined
     * */
    toFile(path: any): void;
    /**
     * Converts image instance to a Base64 string.
     * @return Promise<String>
     * */
    toBase64(): Promise<String>;
}
export default Canvas;
