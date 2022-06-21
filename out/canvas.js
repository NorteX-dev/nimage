"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var pngjs_1 = require("pngjs");
var fs = require("fs");
var axios_1 = require("axios");
var stream_1 = require("stream");
var Canvas = /** @class */ (function () {
    function Canvas(width, height) {
        if (typeof width !== "number") {
            throw new Error("Canvas(): width must be a number");
        }
        if (typeof height !== "number") {
            throw new Error("Canvas(): height must be a number");
        }
        this.width = width;
        this.height = height;
        this.pngInstance = new pngjs_1.PNG({
            width: width,
            height: height,
        });
    }
    /**
     * Change the background of the image.
     * @param color
     * */
    Canvas.prototype.background = function (color) {
        for (var x = 0; x < this.pngInstance.width; x++) {
            for (var y = 0; y < this.pngInstance.height; y++) {
                var idx = (this.pngInstance.width * y + x) * 4;
                this.pngInstance.data[idx] = color.r;
                this.pngInstance.data[idx + 1] = color.g;
                this.pngInstance.data[idx + 2] = color.b;
                this.pngInstance.data[idx + 3] = color.a || 255;
            }
        }
        return this;
    };
    /**
     * Loads and returns an image from ImageSource.
     * @param source The source of the image. Either a path to the file, a http url, a buffer or a stream.
     * @param inputType Optional parameter for overriding the type of the input. If undefined, the type is inferred from the source.
     * */
    Canvas.loadImage = function (source, inputType) {
        var stream;
        if (typeof source === "string") {
            stream = fs.createReadStream(source);
        }
        else if (source instanceof Buffer) {
            stream = stream_1.Readable.from(source);
        }
        else if (source instanceof stream_1.Stream) {
            stream = source;
        }
        return stream;
    };
    /**
     * Loads an image from a specified URL and returns a promise that resolves to the image. Unlike loadImage, this method is asynchronous and has to be awaited!
     * @param url The url of the image.
     * */
    Canvas.loadImageFromUrl = function (url) {
        return new Promise(function (resolve, reject) {
            axios_1.default
                .get(url, { responseType: "stream" })
                .then(function (response) {
                resolve(response.data);
            })
                .catch(function (error) {
                reject(error);
            });
        });
    };
    Canvas.prototype._resizeImage = function (imagePng, targetWidth, targetHeight) {
        var image = new pngjs_1.PNG({
            width: imagePng.width,
            height: imagePng.height,
        });
        var scaleX = targetWidth / imagePng.width;
        var scaleY = targetHeight / imagePng.height;
        for (var x = 0; x < imagePng.width; x++) {
            for (var y = 0; y < imagePng.height; y++) {
                var idx = (imagePng.width * y + x) * 4;
                var idx2 = (image.width * (y * scaleY) + x * scaleX) * 4;
                image.data[idx2] = imagePng.data[idx];
                image.data[idx2 + 1] = imagePng.data[idx + 1];
                image.data[idx2 + 2] = imagePng.data[idx + 2];
                image.data[idx2 + 3] = imagePng.data[idx + 3];
            }
        }
        return image;
    };
    Canvas.prototype.drawImage = function (stream, x, y, width, height) {
        var _this = this;
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        return new Promise(function (res) {
            var imagePng = new pngjs_1.PNG({
                filterType: 4,
            });
            stream.pipe(imagePng);
            imagePng.on("parsed", function () {
                if (!width)
                    width = 1;
                if (!height)
                    height = 1;
                // Loop over canvas pixels and replace with image pixels, based on the x and y coordinates and the width and height
                imagePng = _this._resizeImage(imagePng, width, height);
                for (var i = 0; i < width; i++) {
                    for (var j = 0; j < height; j++) {
                        // Copy pixel data of image to the canvas pixel data stretching the target image to width and height
                        var xCoord = x + i;
                        var yCoord = y + j;
                        var canvasPixelIndex = (_this.pngInstance.width * yCoord + xCoord) * 4;
                        var imageIdx = (imagePng.width * j + i) * 4;
                        _this.pngInstance.data[canvasPixelIndex] = imagePng.data[imageIdx]; // R
                        _this.pngInstance.data[canvasPixelIndex + 1] = imagePng.data[imageIdx + 1]; // G
                        _this.pngInstance.data[canvasPixelIndex + 2] = imagePng.data[imageIdx + 2]; // B
                        _this.pngInstance.data[canvasPixelIndex + 3] = imagePng.data[imageIdx + 3]; // A
                    }
                }
                res(_this);
            });
        });
    };
    /**
     * Returns a string like "Canvas(w, h)"
     * @return String
     * */
    Canvas.prototype.toString = function () {
        return "Image(" + this.width + ", " + this.height + ")";
    };
    /**
     * Converts image instance to a writable stream.
     * @return Stream
     * */
    Canvas.prototype.toStream = function () {
        return this.pngInstance.pack();
    };
    /**
     * Converts image instance to a buffer and writes it to a file at path.
     * @param path Path to write the image to. Directly passed into fs.createWriteStream()
     * @return undefined
     * */
    Canvas.prototype.toFile = function (path) {
        this.toStream().pipe(fs.createWriteStream(path));
        return;
    };
    /**
     * Converts image instance to a Base64 string.
     * @return Promise<String>
     * */
    Canvas.prototype.toBase64 = function () {
        var _this = this;
        return new Promise(function (res) {
            _this.pngInstance.pack();
            var chunks = [];
            _this.pngInstance.on("data", function (chunk) {
                chunks.push(chunk);
            });
            _this.pngInstance.on("end", function () {
                var result = Buffer.concat(chunks);
                res(result.toString("base64"));
            });
        });
    };
    return Canvas;
}());
exports.default = Canvas;
