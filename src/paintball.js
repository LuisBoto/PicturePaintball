const canvas = document.getElementById('paintball-canvas');
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let canvasWidth = window.innerWidth;
let canvasHeight = window.innerHeight;
const screenRatio = canvasWidth/canvasHeight;

const imageInput = document.getElementById('image-upload');
let imageUrl;
let imageWidth;
let imageHeight;
let imageRatio;

let proportionalCanvasWidth;
let proportionalCanvasHeight;

const loadUploadedFile = (e) => {
    const file = e.target.files[0];
    imageUrl = URL.createObjectURL(file);
    canvas.style.display = 'block';
    imageInput.style.display = 'none';
    paintImageOnCanvas();
};
imageInput.onchange = loadUploadedFile;

const getPaintSplashImage = async () => {
    return new Promise(resolve => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.src = './paint.svg';
    });
};
let paintSplashImage;
let paintSplashCanvas;
let paintSplashContext;
const drawPaintSplash = (hexColor, x, y, width, height) => {
    if (paintSplashCanvas == null) {
        paintSplashCanvas = new OffscreenCanvas(width, height);
        paintSplashContext = paintSplashCanvas.getContext('2d');
        paintSplashContext.drawImage(paintSplashImage, 0, 0, width, height);
    }
    paintSplashContext.globalCompositeOperation = "source-in";
    paintSplashContext.fillStyle = hexColor;
    paintSplashContext.fillRect(0, 0, paintSplashCanvas.width, paintSplashCanvas.height);
    ctx.drawImage(paintSplashCanvas, x, y, width, height);
}

const paintImageOnCanvas = async () => {
    const getImageData = async () => {
        return new Promise(resolve => {
            const image = new Image();
            image.onload = () => {
                const auxCanvas = new OffscreenCanvas(image.width, image.height);
                imageWidth = image.width;
                imageHeight = image.height;
                imageRatio = image.width / image.height;
                proportionalCanvasWidth = canvasWidth*(imageRatio/screenRatio);
                proportionalCanvasHeight = canvasHeight*(screenRatio/imageRatio);

                const auxCtx = auxCanvas.getContext('2d');                
                auxCtx.fillStyle = "white";
                auxCtx.fillRect(0, 0, image.width, image.height);
                auxCtx.drawImage(image, 0, 0);
                resolve(auxCtx.getImageData(0, 0, image.width, image.height));
            };
            image.src = imageUrl;
        });
    };
    paintSplashImage = await getPaintSplashImage();
    const imageData = await getImageData();

    const traslateImageCoordinateToCanvas = (imageX, imageY) => {
        if (imageRatio > screenRatio)  // Image is wider
            return { 
                x: canvasWidth * imageX/imageWidth, 
                y: proportionalCanvasHeight * imageY/imageHeight + Math.abs(canvasHeight - proportionalCanvasHeight)/2, 
            };
        else // Image is taller
            return { 
                x: proportionalCanvasWidth * imageX/imageWidth + Math.abs(canvasWidth - proportionalCanvasWidth)/2, 
                y: canvasHeight * imageY/imageHeight
            };
    };
      
    const rgbToHex = (r, g, b, a) => {
        const componentToHex = (c) => {
            var hex = c.toString(16);
            return hex.length == 1 ? "0" + hex : hex;
        }
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b) + componentToHex(a);
    }

    const getHexadecimalForImageDataIndex = (index) => {
        const red = imageData.data[index*4];
        const green = imageData.data[index*4+1];
        const blue = imageData.data[index*4+2];
        const alpha = imageData.data[index*4+3];
        return rgbToHex(red, green, blue, alpha);
    };

    const drawRandomPixel = (iteration = 0) => {
        const index = getRandomIndex();
        const x = index%imageData.width;
        const y = parseInt(index/imageData.width);
        const finalCoordinate = traslateImageCoordinateToCanvas(x, y);
        const hexColor = getHexadecimalForImageDataIndex(index);
        const pixelWidth = proportionalCanvasWidth/imageData.width;
        const pixelHeight = proportionalCanvasHeight/imageData.height;
        const pixelSize = Math.max(pixelHeight, pixelWidth, Math.random()*5);
        drawPaintSplash(hexColor, finalCoordinate.x, finalCoordinate.y, pixelSize, pixelSize);
    };

    const availableIndexes = new Array(imageData.data.length/4).fill(null);
    const getRandomIndex = () => {
        const selectedIndex = Math.floor(Math.random() * (availableIndexes.length-1));
        const result = availableIndexes[selectedIndex];
        availableIndexes[selectedIndex] = availableIndexes.pop();
        if (availableIndexes[selectedIndex] == null)
            availableIndexes[selectedIndex] = availableIndexes.length;
        return result == null ? selectedIndex : result;
    }

    const mainLoop = (iterations = 0) => {
        while (Math.random() > 0.01 && iterations < imageData.data.length/4) {
            drawRandomPixel();
            iterations++;
        }
        if (iterations < imageData.data.length/4)
            requestAnimationFrame(() => mainLoop(iterations));
    }

    mainLoop();
}