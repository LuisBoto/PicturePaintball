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
    const imageData = await getImageData();

    const traslateImageCoordinateToCanvas = (imageX, imageY) => {
        if (imageRatio > screenRatio) { // Image is wider
            return { 
                x: canvasWidth * imageX/imageWidth, 
                y: proportionalCanvasHeight * imageY/imageHeight + Math.abs(canvasHeight - proportionalCanvasHeight)/2, 
            };
        } else { // Image is taller
            return { 
                x: proportionalCanvasWidth * imageX/imageWidth + Math.abs(canvasWidth - proportionalCanvasWidth)/2, 
                y: canvasHeight * imageY/imageHeight
            };
        }
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

    const drawPixels = (iteration = 0) => {
        if (iteration >= imageData.data.length/4)
            return;
        const index = getRandomIndex(iteration);
        const x = index%imageData.width;
        const y = parseInt(index/imageData.width);
        const finalCoordinate = traslateImageCoordinateToCanvas(x, y);
        ctx.fillStyle = getHexadecimalForImageDataIndex(index);
        ctx.fillRect(finalCoordinate.x, finalCoordinate.y, proportionalCanvasWidth/imageData.width*1, proportionalCanvasHeight/imageData.height*1);
        if (Math.random() > 0.001)
            drawPixels(iteration+1);
        else
            requestAnimationFrame(() => drawPixels(iteration+1));
    };

    const availableIndexes = new Array(imageData.data.length/4).fill(null).map((_, index) => index);
    const getRandomIndex = (iterationCount) => {
        const selectedIndex = Math.floor(Math.random() * (availableIndexes.length-1));
        const result = availableIndexes[selectedIndex];
        availableIndexes[selectedIndex] = availableIndexes.pop();
        return result;
    }

    drawPixels();
}