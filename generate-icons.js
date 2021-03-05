const sharp = require("sharp")
const path = require("path")
const fs = require("fs")

const assetsDir = path.join(__dirname, "src/assets");
const iconsDir = path.join(__dirname, "src/assets/icons");

if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir);
}
const sizes = [
    {
        'name': 'favicon.ico',
        'width': 32,
        'height': 32
    },
    {
        'name': 'favicon.png',
        'width': 256,
        'height': 256
    },
    {
        'name': 'favicon.256x256.png',
        'width': 256,
        'height': 256
    },
    {
        'name': 'favicon.512x512.png',
        'width': 512,
        'height': 512
    },
];

for (const size of sizes) {

    sharp(path.join(assetsDir, "logo.svg"))
        .png()
        .resize(size.width, size.width)
        .toFile(path.join(iconsDir, size.name))
        .then(function (info) {
            console.log('Generated icon ' + size.name)
        })
        .catch(function (err) {
            console.error(err)
        });
}