import { PNG } from "pngjs";
import * as fs from "fs";
import axios from "axios";
import { Readable, Stream } from "stream";

interface Color {
	r: number;
	g: number;
	b: number;
	a?: number;
}

export type ImageSource = string | Stream | Buffer;

class Canvas {
	private pngInstance: PNG;
	private readonly width: number;
	private readonly height: number;

	constructor(width: number, height: number) {
		if (typeof width !== "number") {
			throw new Error("Canvas(): width must be a number");
		}
		if (typeof height !== "number") {
			throw new Error("Canvas(): height must be a number");
		}
		this.width = width;
		this.height = height;
		this.pngInstance = new PNG({
			width,
			height,
		});
	}

	/**
	 * Change the background of the image.
	 * @param color
	 * */
	background(color: Color) {
		for (let x = 0; x < this.pngInstance.width; x++) {
			for (let y = 0; y < this.pngInstance.height; y++) {
				const idx = (this.pngInstance.width * y + x) * 4;
				this.pngInstance.data[idx] = color.r;
				this.pngInstance.data[idx + 1] = color.g;
				this.pngInstance.data[idx + 2] = color.b;
				this.pngInstance.data[idx + 3] = color.a || 255;
			}
		}
		return this;
	}

	/**
	 * Loads and returns an image from ImageSource.
	 * @param source The source of the image. Either a path to the file, a http url, a buffer or a stream.
	 * @param inputType Optional parameter for overriding the type of the input. If undefined, the type is inferred from the source.
	 * */
	static loadImage(source: ImageSource, inputType?: "buffer" | "stream" | "filepath" | "url") {
		let stream;
		if (typeof source === "string") {
			stream = fs.createReadStream(source);
		} else if (source instanceof Buffer) {
			stream = Readable.from(source);
		} else if (source instanceof Stream) {
			stream = source;
		}
		return stream;
	}

	/**
	 * Loads an image from a specified URL and returns a promise that resolves to the image. Unlike loadImage, this method is asynchronous and has to be awaited!
	 * @param url The url of the image.
	 * */
	static loadImageFromUrl(url: string): Promise<Stream> {
		return new Promise((resolve, reject) => {
			axios
				.get(url, { responseType: "stream" })
				.then((response) => {
					resolve(response.data);
				})
				.catch((error) => {
					reject(error);
				});
		});
	}

	_resizeImage(imagePng: PNG, targetWidth: number, targetHeight: number) {
		const image = new PNG({
			width: imagePng.width,
			height: imagePng.height,
		});
		const scaleX = targetWidth / imagePng.width;
		const scaleY = targetHeight / imagePng.height;
		for (let x = 0; x < imagePng.width; x++) {
			for (let y = 0; y < imagePng.height; y++) {
				const idx = (imagePng.width * y + x) * 4;
				const idx2 = (image.width * (y * scaleY) + x * scaleX) * 4;
				image.data[idx2] = imagePng.data[idx];
				image.data[idx2 + 1] = imagePng.data[idx + 1];
				image.data[idx2 + 2] = imagePng.data[idx + 2];
				image.data[idx2 + 3] = imagePng.data[idx + 3];
			}
		}
		return image;
	}

	drawImage(stream: Stream, x: number = 0, y: number = 0, width?: number, height?: number) {
		return new Promise((res) => {
			let imagePng = new PNG({
				filterType: 4,
			});
			stream.pipe(imagePng);
			imagePng.on("parsed", () => {
				if (!width) width = 1;
				if (!height) height = 1;
				// Loop over canvas pixels and replace with image pixels, based on the x and y coordinates and the width and height
				imagePng = this._resizeImage(imagePng, width, height);
				for (let i = 0; i < width; i++) {
					for (let j = 0; j < height; j++) {
						// Copy pixel data of image to the canvas pixel data stretching the target image to width and height
						const xCoord = x + i;
						const yCoord = y + j;
						const canvasPixelIndex = (this.pngInstance.width * yCoord + xCoord) * 4;
						const imageIdx = (imagePng.width * j + i) * 4;
						this.pngInstance.data[canvasPixelIndex] = imagePng.data[imageIdx]; // R
						this.pngInstance.data[canvasPixelIndex + 1] = imagePng.data[imageIdx + 1]; // G
						this.pngInstance.data[canvasPixelIndex + 2] = imagePng.data[imageIdx + 2]; // B
						this.pngInstance.data[canvasPixelIndex + 3] = imagePng.data[imageIdx + 3]; // A
					}
				}
				res(this);
			});
		});
	}

	/**
	 * Returns a string like "Canvas(w, h)"
	 * @return String
	 * */
	toString() {
		return `Image(${this.width}, ${this.height})`;
	}

	/**
	 * Converts image instance to a writable stream.
	 * @return Stream
	 * */
	toStream() {
		return this.pngInstance.pack();
	}

	/**
	 * Converts image instance to a buffer and writes it to a file at path.
	 * @param path Path to write the image to. Directly passed into fs.createWriteStream()
	 * @return undefined
	 * */
	toFile(path: any) {
		this.toStream().pipe(fs.createWriteStream(path));
		return;
	}

	/**
	 * Converts image instance to a Base64 string.
	 * @return Promise<String>
	 * */
	toBase64(): Promise<String> {
		return new Promise<String>((res) => {
			this.pngInstance.pack();
			let chunks: any[] = [];
			this.pngInstance.on("data", function (chunk) {
				chunks.push(chunk);
			});
			this.pngInstance.on("end", function () {
				const result = Buffer.concat(chunks);
				res(result.toString("base64"));
			});
		});
	}
}

export default Canvas;
