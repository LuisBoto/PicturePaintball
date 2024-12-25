const canvas = document.getElementById('paintball-canvas');
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let canvasWidth = window.innerWidth;
let canvasHeight = window.innerHeight;

const imageInput = document.getElementById('image-upload');
let base64Image;

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

const paintImageOnCanvas = () => {
    const image = new Image();
    image.onload = () => {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        ctx.drawImage(image, 0, 0);
    };
    image.src = base64Image;
}