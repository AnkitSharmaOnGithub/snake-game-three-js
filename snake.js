const SIZE = 5;
var Block = function(x,y,palette) {
    var geometry = new THREE.BoxGeometry(SIZE,SIZE,SIZE);
    for ( var i = 0; i < geometry.faces.length; i ++ ) {
        geometry.faces[ i ].color.setHex( palette[i/2 | 0] );
    }
    var block = new THREE.Mesh(
        geometry,
        new THREE.MeshBasicMaterial({ vertexColors: THREE.FaceColors }));
    
    block.position.set(x,y,SIZE);
    return block;
}
class Snake
{
    constructor(pos, palette)
    {
        this.palette = palette;
        this.size = 2;
        this.dir = [1,0,0];
        this.body = [];
        for(var i = 0; i < this.size; i++) {
            this.body.push(Block(i * SIZE, pos, palette));
        }
        this.lose = false;
        this.wait = false;
        this.timeout = 20;
        this.score = 0;
    }

    move(opponent)
    {
        var next = this.body.pop();
        var head = this.body[0];

        next.position.x = head.position.x + this.dir[0]*SIZE;
        next.position.y = head.position.y + this.dir[1]*SIZE;
        next.position.z = head.position.z + this.dir[2]*SIZE;

        if( this.checkCollision(next, opponent) ) {
            this.lose = true;
            this.wait = true;
        }
    
        this.body.unshift(next);
    }

    checkCollision(e, opponent)
    {
        var snakeCollide = this.body.some(function(el) {
            return (e.position.x == el.position.x && 
                    e.position.y == el.position.y && 
                    e.position.z == el.position.z);
        });
        snakeCollide |= opponent.body.some(function(el) {
            return (e.position.x == el.position.x && 
                    e.position.y == el.position.y && 
                    e.position.z == el.position.z);
        });
        if( e.position.x <= -PLANE_DIM[0] / 2 + SIZE ) {
            border[2].material.color.setHex(0xff0000);
        } else if( e.position.x >= PLANE_DIM[0] / 2 - SIZE ) {
            border[3].material.color.setHex(0xff0000);
        } else if( e.position.y <= -PLANE_DIM[1] / 2 + SIZE ) {
            border[1].material.color.setHex(0xff0000);
        } else if( e.position.y >= PLANE_DIM[1] / 2 - SIZE * 4 ) {
            border[0].material.color.setHex(0xff0000);
        } else if( snakeCollide) {
            
        } else {
            return false;
        }
        return true;
    }
}

const PLANE_DIM = [200, 200];
const FPS = 20;
const FOOD_COLOR = [0xd7871f,0xc8b57a,0xd59a07,0xd7871f,0xc8b57a,0xd59a07];
const SNAKE_COLOR = [0xa81760,0x68961c,0xdc9960,0xc892f8,0xb02e7c,0xef4f1a];
const SNAKE_COLOR_ALT = [0x57E89F,0x9769E3,0x23669F,0x376D07,0x4FD183,0x10B0E5];
const P1_CTRL = [37, 38, 39, 40];

const dialog = document.querySelector('.dialog');
const menu = dialog.querySelector('.menu');


var now;
var then = Date.now();
var interval = 1000 / FPS;
var delta;
var animate;
var start = false;
var paused = false;

scene = new THREE.Scene();
scene.background = new THREE.Color( 0xf5f2d0 );

var camera = new THREE.PerspectiveCamera(
    45, window.innerWidth / window.innerHeight, 1, 10000);
camera.rotation.y = 0;
camera.rotation.x = Math.PI / 4;
camera.rotation.z = 0;

renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var plane = new THREE.Mesh(
    new THREE.PlaneGeometry(PLANE_DIM[0], PLANE_DIM[1], 0),
    new THREE.MeshBasicMaterial( {color: 0xFFFFFF, side: THREE.DoubleSide})
);
plane.position.z = -20;

var border = [
        new THREE.Mesh(
            new THREE.PlaneGeometry(PLANE_DIM[0], 40, 40),
            new THREE.MeshBasicMaterial( {color: 0x000000, transparent:true, opacity: 0.5})
        ),
        new THREE.Mesh(
            new THREE.PlaneGeometry(PLANE_DIM[0], 40, 40),
            new THREE.MeshBasicMaterial( {color: 0x000000, transparent:true, opacity: 0.5})
        ),
        new THREE.Mesh(
            new THREE.PlaneGeometry(40, PLANE_DIM[0], 40),
            new THREE.MeshBasicMaterial( {color: 0xd3d3d3, transparent:true, opacity: 0.5})
        ),
        new THREE.Mesh(
            new THREE.PlaneGeometry(40, PLANE_DIM[0], 40),
            new THREE.MeshBasicMaterial( {color: 0xd3d3d3, transparent:true, opacity: 0.5})
        )
    ];
border[0].rotation.x = Math.PI /2;
border[0].position.y = PLANE_DIM[1] / 2;

border[1].rotation.x = Math.PI /2;
border[1].position.y = -PLANE_DIM[1] / 2;

border[2].rotation.y = Math.PI/2;
border[2].position.x = -PLANE_DIM[0] / 2;

border[3].rotation.y = -Math.PI/2;
border[3].position.x = PLANE_DIM[0] / 2;

var players = [new Snake(0, SNAKE_COLOR), new Snake(-40, SNAKE_COLOR_ALT)];

var food = Block(Math.floor(Math.random() * (PLANE_DIM[0]*.6)) - (PLANE_DIM[0]*.6)/2,
        Math.floor(Math.random() * (PLANE_DIM[1]*.6)) - (PLANE_DIM[1]*.6)/2 , FOOD_COLOR);

var light = new THREE.PointLight(0xffffff);
light.position.set(0, 250, 0);


border.forEach(function(e) {
    scene.add(e);
});
players.forEach(function(p) {
    p.body.forEach(function(b){
        scene.add(b);
    });
});
scene.add(food);
scene.add(plane);
scene.add(light);

var control = function(key, player, ctrl = P1_CTRL) {
    switch(key) {
        case ctrl[0]:
            if(player.dir[0] == 0)
                player.dir = [-1, 0, 0];
            break;
        case ctrl[1]:
            if(player.dir[1] == 0)
                player.dir = [0, 1, 0];
            break;
        case ctrl[2]:
            if(players[0].dir[0] == 0)
                player.dir = [1, 0, 0];
            break;
        case ctrl[3]:
            if(players[0].dir[1] == 0)
                player.dir = [0, -1, 0];
            break;
    }
}

var reset = function(pid) {
    border[0].material.color.setHex(0x000000);
    border[1].material.color.setHex(0x000000);
    border[2].material.color.setHex(0xd3d3d3);
    border[3].material.color.setHex(0xd3d3d3);
    players[pid].body.forEach(function(e) {
                scene.remove(e);
    });
    players[pid] = new Snake(pid * -40, players[pid].palette);
    players[pid].body.forEach(function(e) {
        scene.add(e);
    });
}

var sys_ctrl = function(key) {
    switch(key) {
        case 32:
            paused = !paused;
            break;
        case 27:
            paused = false;
            start = false;
            dialog.style.display = "block";
            dialog.querySelector('.menu').style.display = "block";
            dialog.querySelector('.instructions').style.display = "none";
            document.onkeydown = null;
            reset(0);
            reset(1);
            break;
    }
}

var move = function(e, opponent) {
    e.move(opponent);

    if(Math.abs(e.body[0].position.x - food.position.x) < SIZE &&
        Math.abs(e.body[0].position.y - food.position.y) < SIZE) {
        var tail = Block(e.body[e.body.length -1].position.x,
                e.body[e.body.length -1].position.y, e.palette);
        e.body.push(tail);
        scene.add(tail);
        e.score += 10;
        food.position.x = Math.floor(Math.random() * (PLANE_DIM[0] * .6)) - (PLANE_DIM[0] * .6)/2 ;
        food.position.y = Math.floor(Math.random() * (PLANE_DIM[1] * .6)) - (PLANE_DIM[1] * .6)/2 ;
    }   
}

var update = function() {
    for(var i = 0; i < players.length; i++) {
        if(!players[i].wait) {
            if(cpu && i == 1) {
                control(Math.floor(Math.random() * 4) + 36, players[i]);
            }
            move(players[i],players[Math.abs(i-1)]);
        } else if(players[i].timeout-- <= 0) {
            
            reset(i);
        }
    }
    var p1 = document.getElementById('score-0');
    p1.innerHTML = players[0].score;
    if(players[0].wait)
        p1.innerHTML += ' ('+players[0].timeout+')';

    var p2 = document.getElementById('score-1');
    p2.innerHTML = players[1].score;
    if(players[1].wait)
        p2.innerHTML += ' ('+players[1].timeout+')';
};

var render = function() {
    camera.position.set(0, -PLANE_DIM[0], PLANE_DIM[0]);
    renderer.render(scene, camera);
};

var GameLoop = function() {
    animate = requestAnimationFrame(GameLoop);

    now = Date.now();
    delta = now - then;
    if(delta > interval) {
        then = now - (delta % interval);
        if(start && !paused) 
            update();
        render();
    }
}
GameLoop();

var cpu_game = function(e) {
    if(!start) {
        start = true;
        dialog.style.display = "none";
        document.querySelector('.static').innerHTML = `
            <li>Your Score: <span id="score-0"></span></li>
            <li>Computer's Score: <span id="score-1"></span></li>
        `;
    } else {
        sys_ctrl(e.keyCode);
    }
    if(!players[0].wait)
        control(e.keyCode, players[0]);

}


document.getElementById('no').onclick = function () {
    return;
    
};

document.getElementById('yes').onclick = function () {
    if(!start) {
        dialog.querySelector('.menu').style.display = "none";
        dialog.querySelector('.instructions').style.display = "block";

        cpu = true;
        document.onkeydown = cpu_game;
    }
};
