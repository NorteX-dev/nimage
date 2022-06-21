"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var pngjs_1 = require("pngjs");
var fs = require("fs");
var stream_1 = require("stream");
var Image = /** @class */ (function () {
    function Image(width, height) {
        if (typeof width !== "number") {
            throw new Error("Image(): width must be a number");
        }
        if (typeof height !== "number") {
            throw new Error("Image(): height must be a number");
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
    Image.prototype.background = function (color) {
        for (var x = 0; x < this.pngInstance.width; x++) {
            for (var y = 0; y < this.pngInstance.height; y++) {
                var idx = (this.pngInstance.width * y + x) << 2;
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
    Image.loadImage = function (source, inputType) {
        var stream;
        if (typeof source === "string") {
            stream = fs.createReadStream(source);
        }
        if (source instanceof Buffer) {
            stream = stream_1.Readable.from(source);
        }
        if (source instanceof stream_1.Stream) {
            stream = source;
        }
        return stream;
    };
    /**
     * Returns a string like "Image(w, h)"
     * @return String
     * */
    Image.prototype.toString = function () {
        return "Image(" + this.width + ", " + this.height + ")";
    };
    /**
     * Converts image instance to a writable stream.
     * @return Stream
     * */
    Image.prototype.toStream = function () {
        return this.pngInstance.pack();
    };
    /**
     * Converts image instance to a buffer and writes it to a file at path.
     * @param path Path to write the image to. Directly passed into fs.createWriteStream()
     * @return undefined
     * */
    Image.prototype.toFile = function (path) {
        this.toStream().pipe(fs.createWriteStream(path));
        return;
    };
    /**
     * Converts image instance to a Base64 string.
     * @return Promise<String>
     * */
    Image.prototype.toBase64 = function () {
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
    return Image;
}());
exports.default = Image;
