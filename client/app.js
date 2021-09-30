// I decided to work with the Vue CDN instead of the CLI 
// and work in one giant file because it is a small app.
const BASE_API_URL = '';

const app = new Vue({
    el: "#wrapper",
    data: {
        lineWidth: 10,
        brushColor: "#000000",
        fillStyle: "#ffffff",
        isPress: false,
        loading: true,
        ctx: null,
        mousePos: { x: 0, y: 0 },
        images: null,
    },
    mounted() {
        const ctx = this.$refs.paintCanvas.getContext("2d");
        this.ctx = ctx;
        this.ctx.lineCap = "round";
        this.updateBrush();
        fetch(`${BASE_API_URL}/images`)
            .then(resp => resp.json())
            .then(data => {
                this.images = data;
                this.loading = false;
            });
        fetch(`${BASE_API_URL}/v`)
            .then(resp => resp.json())
            .then(data => this.version = data);
    },
    methods: {
        updateBrush() {
            this.ctx.lineWidth = this.lineWidth;
            this.ctx.strokeStyle = this.brushColor;
        },
        updateMousePos(e) {
            this.mousePos.x = e.layerX;
            this.mousePos.y = e.layerY;
        },
        startDraw(e) {
            this.isPress = true;
            this.updateMousePos(e);
            this.ctx.beginPath();
            this.ctx.moveTo(e.layerX, e.layerY);
            this.draw(e);
        },
        draw(e) {
            this.updateMousePos(e);
            if (!this.isPress) return;
            this.ctx.lineTo(e.layerX, e.layerY);
            this.ctx.stroke();
        },
        stopDraw(e) {
            this.ctx.closePath();
            this.isPress = false;
        },
        clearCanvas() {
            const { width, height } = this.ctx.canvas;
            this.ctx.clearRect(0, 0, width, height);
        },
        changeBackround() {
            const { width, height } = this.ctx.canvas;
            this.ctx.fillStyle = this.fillStyle;
            this.ctx.fillRect(0, 0, width, height);
        },
        async saveImg() {
            this.loading = true;
            const resp = await fetch(`${BASE_API_URL}/images`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ src: this.ctx.canvas.toDataURL() })
            });
            const data = await resp.json();
            this.images.push(data);
            this.loading = false;
        },
        async clearAllImgs() {
            this.loading = true;
            const resp = await fetch(`${BASE_API_URL}/images`, { method: "DELETE" });
            const data = await resp.json();
            this.images = data;
            this.loading = false;
        },
        chooseImage(dataURL) {
            const { width, height } = this.ctx.canvas;
            this.ctx.clearRect(0, 0, width, height)
            const img = new Image();
            img.src = dataURL;
            this.ctx.drawImage(img, 0, 0);
        },
        uploadFile(e) {
            const imageFile = e.target.files[0];
            let fileReader = new FileReader();
            fileReader.readAsDataURL(imageFile);
            fileReader.addEventListener("loadend", ev => {
                const img = new Image();
                img.src = ev.target.result;
                // We need to wait for full load of the image
                // before we can draw it to the canvas.
                img.addEventListener("load", evt => {
                    this.ctx.drawImage(img, 0, 0);
                })
            })
        }
    }
});

let version = null;
// There is a better solution for CI/CD :D
// I didn't want to work with socket, so I did this small call.
setInterval(() => {
    fetch(BASE_API_URL + "/v")
        .then(resp => resp.json())
        .then(data => {
            if (!version) {
                version = data.version;
                return;
            }
            if (data.version === version) return;
            else {
                alert("There is new version of the app. Page will refresh!");
                location.reload();
            }
        })
}, 5000)