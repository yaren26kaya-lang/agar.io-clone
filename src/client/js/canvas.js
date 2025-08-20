// --- Oyun Değişkenleri ---
let gold = 0;
let score = 0;
let zoom = 1;
const zoomStep = 0.1;
const minZoom = 0.5;
const maxZoom = 2;

// Canvas ve Context
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

// --- Zoom Kontrolü ---
canvas.addEventListener('wheel', function(e){
    e.preventDefault();
    zoom += (e.deltaY < 0) ? zoomStep : -zoomStep;
    zoom = Math.min(Math.max(zoom, minZoom), maxZoom);
});

// --- Yem atma (E tuşu) ---
document.addEventListener('keydown', function(e){
    if(e.key.toLowerCase() === 'e'){
        spawnFood();
    }
});

// Yem spawn fonksiyonu (simülasyon)
function spawnFood() {
    console.log("Yem atıldı!");
    // Burada client-server entegrasyonu varsa servera yollayabilirsin
}

// --- Gold ve Skor Güncelleme ---
function addGold(amount){
    gold += amount;
    console.log("Gold: " + gold);
}

function addScore(amount){
    score += amount;
    console.log("Skor: " + score);
}

// --- Admin Paneli ---
if(!document.getElementById('adminPanel')){
    const panel = document.createElement('div');
    panel.id = 'adminPanel';
    panel.style.position = 'fixed';
    panel.style.top = '10px';
    panel.style.right = '10px';
    panel.style.width = '300px';
    panel.style.background = '#111';
    panel.style.color = '#fff';
    panel.style.padding = '15px';
    panel.style.border = '2px solid red';
    panel.style.borderRadius = '10px';
    panel.style.zIndex = 9999;

    panel.innerHTML = `
        <h3 style="color:red;">Admin Panel</h3>
        <button id="goldBtn">Gold Ekle +10</button>
        <button id="scoreBtn">Skor Ekle +10</button>
        <button id="foodBtn">Yem At (E)</button>
        <button id="hidePanelBtn">Kapat</button>
    `;
    document.body.appendChild(panel);
    panel.style.display = 'none';
}

// --- Panel Fonksiyonları ---
document.getElementById('goldBtn').onclick = () => addGold(10);
document.getElementById('scoreBtn').onclick = () => addScore(10);
document.getElementById('foodBtn').onclick = spawnFood;
document.getElementById('hidePanelBtn').onclick = () => {
    document.getElementById('adminPanel').style.display = 'none';
};

// --- Paneli Aç/Kapat (7 tuşu) ---
document.addEventListener('keydown', function(e){
    if(e.key === '7'){
        const panel = document.getElementById('adminPanel');
        panel.style.display = (panel.style.display==='none')?'block':'none';
    }
});

// --- Canvas Çiziminde Zoom ---
function draw(){
    ctx.save();
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.scale(zoom, zoom);

    // Oyuncu ve yemleri çiz
    drawPlayer();
    drawFoodCanvas();

    ctx.restore();
    requestAnimationFrame(draw);
}

function drawPlayer(){ /* Oyuncuyu çiz */ }
function drawFoodCanvas(){ /* Yemleri çiz */ }

draw();


var global = require('./global');

class Canvas {
    constructor(params) {
        this.directionLock = false;
        this.target = global.target;
        this.reenviar = true;
        this.socket = global.socket;
        this.directions = [];
        var self = this;

        this.cv = document.getElementById('cvs');
        this.cv.width = global.screen.width;
        this.cv.height = global.screen.height;
        this.cv.addEventListener('mousemove', this.gameInput, false);
        this.cv.addEventListener('mouseout', this.outOfBounds, false);
        this.cv.addEventListener('keypress', this.keyInput, false);
        this.cv.addEventListener('keyup', function(event) {
            self.reenviar = true;
            self.directionUp(event);
        }, false);
        this.cv.addEventListener('keydown', this.directionDown, false);
        this.cv.addEventListener('touchstart', this.touchInput, false);
        this.cv.addEventListener('touchmove', this.touchInput, false);
        this.cv.parent = self;
        global.canvas = this;
    }

    // Function called when a key is pressed, will change direction if arrow key.
    directionDown(event) {
    	var key = event.which || event.keyCode;
        var self = this.parent; // have to do this so we are not using the cv object
    	if (self.directional(key)) {
    		self.directionLock = true;
    		if (self.newDirection(key, self.directions, true)) {
    			self.updateTarget(self.directions);
    			self.socket.emit('0', self.target);
    		}
    	}
    }

    // Function called when a key is lifted, will change direction if arrow key.
    directionUp(event) {
    	var key = event.which || event.keyCode;
    	if (this.directional(key)) { // this == the actual class
    		if (this.newDirection(key, this.directions, false)) {
    			this.updateTarget(this.directions);
    			if (this.directions.length === 0) this.directionLock = false;
    			this.socket.emit('0', this.target);
    		}
    	}
    }

    // Updates the direction array including information about the new direction.
    newDirection(direction, list, isAddition) {
    	var result = false;
    	var found = false;
    	for (var i = 0, len = list.length; i < len; i++) {
    		if (list[i] == direction) {
    			found = true;
    			if (!isAddition) {
    				result = true;
    				// Removes the direction.
    				list.splice(i, 1);
    			}
    			break;
    		}
    	}
    	// Adds the direction.
    	if (isAddition && found === false) {
    		result = true;
    		list.push(direction);
    	}

    	return result;
    }

    // Updates the target according to the directions in the directions array.
    updateTarget(list) {
    	this.target = { x : 0, y: 0 };
    	var directionHorizontal = 0;
    	var directionVertical = 0;
    	for (var i = 0, len = list.length; i < len; i++) {
    		if (directionHorizontal === 0) {
    			if (list[i] == global.KEY_LEFT) directionHorizontal -= Number.MAX_VALUE;
    			else if (list[i] == global.KEY_RIGHT) directionHorizontal += Number.MAX_VALUE;
    		}
    		if (directionVertical === 0) {
    			if (list[i] == global.KEY_UP) directionVertical -= Number.MAX_VALUE;
    			else if (list[i] == global.KEY_DOWN) directionVertical += Number.MAX_VALUE;
    		}
    	}
    	this.target.x += directionHorizontal;
    	this.target.y += directionVertical;
        global.target = this.target;
    }

    directional(key) {
    	return this.horizontal(key) || this.vertical(key);
    }

    horizontal(key) {
    	return key == global.KEY_LEFT || key == global.KEY_RIGHT;
    }

    vertical(key) {
    	return key == global.KEY_DOWN || key == global.KEY_UP;
    }

    // Register when the mouse goes off the canvas.
    outOfBounds() {
        if (!global.continuity) {
            this.parent.target = { x : 0, y: 0 };
            global.target = this.parent.target;
        }
    }

    gameInput(mouse) {
    	if (!this.directionLock) {
    		this.parent.target.x = mouse.clientX - this.width / 2;
    		this.parent.target.y = mouse.clientY - this.height / 2;
            global.target = this.parent.target;
    	}
    }

    touchInput(touch) {
        touch.preventDefault();
        touch.stopPropagation();
    	if (!this.directionLock) {
    		this.parent.target.x = touch.touches[0].clientX - this.width / 2;
    		this.parent.target.y = touch.touches[0].clientY - this.height / 2;
            global.target = this.parent.target;
    	}
    }

    // Chat command callback functions.
    keyInput(event) {
    	var key = event.which || event.keyCode;
    	if (key === global.KEY_FIREFOOD && this.parent.reenviar) {
            this.parent.socket.emit('1');
            this.parent.reenviar = false;
        }
        else if (key === global.KEY_SPLIT && this.parent.reenviar) {
            document.getElementById('split_cell').play();
            this.parent.socket.emit('2');
            this.parent.reenviar = false;
        }
        else if (key === global.KEY_CHAT) {
            document.getElementById('chatInput').focus();
        }
    }
}

module.exports = Canvas;
