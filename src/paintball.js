const canvas = document.getElementById('paintball-canvas');
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let canvasWidth = window.innerWidth;
let canvasHeight = window.innerHeight;
const screenRatio = canvasWidth/canvasHeight;

const imageInput = document.getElementById('image-upload');
let base64Image;
let imageWidth;
let imageHeight;
let imageRatio;

const loadUploadedFile = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
        base64Image = reader.result;
        canvas.style.display = 'block';
        imageInput.style.display = 'none';
        paintImageOnCanvas();
    };
    reader.readAsDataURL(file);
};
imageInput.onchange = loadUploadedFile;

const paintImageOnCanvas = async () => {
    const getImageData = async () => {
        return new Promise(resolve => {
            const image = new Image();
            image.onload = () => {
                const auxCanvas = document.createElement('canvas');
                auxCanvas.width = image.width;
                auxCanvas.height = image.height;
                imageWidth = image.width;
                imageHeight = image.height;
                imageRatio = image.width / image.height;
                const auxCtx = auxCanvas.getContext('2d');
                
                auxCtx.fillStyle = "white";
                auxCtx.fillRect(0, 0, image.width, image.height);
                auxCtx.drawImage(image, 0, 0);
                resolve(auxCtx.getImageData(0, 0, image.width, image.height));
            };
            image.src = base64Image;
        });
    };
    const imageData = await getImageData();

    const traslateImageCoordinateToCanvas = (imageX, imageY) => {
        if (imageRatio > screenRatio) { // Image is wider
            return { x: canvasWidth*0.01 * imageX/imageWidth, y: (canvasHeight*0.01 * imageY/imageHeight)*imageRatio };
        } else { // Image is taller
            return { x: (canvasWidth*0.01 * imageX/imageWidth)*imageRatio, y: (canvasHeight*0.01 * imageY/imageHeight) };
        }
    };
    new Array(imageData.data.length/4).fill(0).map((value, i) => {});
    console.log(imageData);
}