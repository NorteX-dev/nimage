const { Canvas } = require("./out");

(async () => {
	const canvas = new Canvas(760, 1334);
	const img = Canvas.loadImage("testsource.png");
	canvas.background({ r: 255, g: 100, b: 100 });
	await canvas.drawImage(img, 100, 50, 500, 500);
	console.log("done drawing image, to file");
	canvas.toFile("test.png");
})();
