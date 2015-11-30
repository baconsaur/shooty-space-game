var scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x8060F0, 4.5, 7);
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

var light1 = new THREE.AmbientLight( 0x303030 );
var light2 = new THREE.DirectionalLight( 0x303025, 4 );
var light3 = new THREE.PointLight( 0x4540A0, 3, 120 );
light2.position.set( 10, 50, 50 );
light3.position.set( -10, -50, -50 );
scene.add( light1, light2, light3 );

camera.position.z = 5;

var renderer = new THREE.WebGLRenderer();
renderer.setClearColor( 0x000040 );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var UI = document.createElement('div');
document.body.appendChild(UI);

var requestId = 0;
var difficulty = 0;

var worldBounds = new THREE.Mesh( 
	new THREE.BoxGeometry( window.innerWidth*0.007, window.innerHeight*0.007, 2 ),
	new THREE.MeshBasicMaterial( {color: 0x00ff00, wireframe: true} )
);

worldBounds.geometry.computeBoundingBox();
worldBounds.visible = false;
scene.add( worldBounds );

var meshLoader = new THREE.JSONLoader();
var textureLoader = new THREE.TextureLoader();

var loadModels = assetLoader(meshLoader, ['models/ship.js', 'models/asteroid.js']);

var background = [];
var playerMesh;
var enemyMesh;
var allTextures;
var height = window.innerHeight*0.02;

Promise.all(loadModels).then(function(meshes){
	playerMesh = meshes[0];
	enemyMesh = meshes[1];
	var loadTextures = assetLoader(textureLoader, ['textures/p1_diff.png', 'textures/p2_diff.png', 'textures/asteroid_diff.png', 'textures/background.png']);
	Promise.all(loadTextures).then(function(textures){
		allTextures = textures;
			var plane = new THREE.PlaneGeometry(height * 2, height);
			var planeMaterial = new THREE.MeshBasicMaterial({fog: false, map:allTextures[3]});
			background.push(new THREE.Mesh(plane, planeMaterial));
			background.push(background[0].clone());
			background[0].position.set(0,0,-5);
			background[1].position.set(height * 2,0,-5);
			scene.add(background[0], background[1]);
	}).then(initGame);
});

function assetLoader(loader, assetPaths){
	var assets = [];
	for (var i in assetPaths)
		assets.push(getPromise(assetPaths[i]));

	function getPromise(assetPath){
		return new Promise(function(resolve, reject){
				loader.load(assetPath, function(asset){
				resolve(asset);
				});
		});
	}
	return assets;
}

function initGame() {
	players = [];
	bullets = [];
	enemies = [];
	spawnCount = 600;
	score = 0;
	difficulty = 0;
	UI.innerText = "Score: " + score;
	switchCooldown = 0;
	for (var i=0;i<2;i++) {
		var ship = new Ship(i);
		players.push(ship);
	}
	animate();
}

function Ship(playerId) {
	this.playerId = playerId;
	this.alive = true;
	this.speed = 0.005;
	this.velocity = new THREE.Vector3(0,0,0);
	this.texture = allTextures[playerId];
	this.material = new THREE.MeshPhongMaterial({map:this.texture});
	this.mesh = new THREE.Mesh(playerMesh, this.material);
	this.mesh.position.set(worldBounds.geometry.boundingBox.min.x/3 *2, playerId*2-1, -playerId);
	scene.add(this.mesh);

	this.bbox = new THREE.BoundingBoxHelper(this.mesh);
	this.bbox.visible = false;
	scene.add(this.bbox);
	this.bbox.update();

	this.track = playerId;
	this.cooldown = 0;

	this.switchTrack = function () {
		var position = this.mesh.position;
		if (this.track === 0)
			this.track = 1;
		else
			this.track = 0;
	};

	this.special = function(){
		var color;
		if (this.playerId === 0) {
			color = 0xFF0000;
		} else {
			color = 0x0000FF;
		}
		var special = new Bullet(this, color, this.playerId);
		scene.add(special.mesh);
		bullets.push(special);
	};

	this.destroy = function() {
		scene.remove(this.mesh);
		scene.remove(this.bbox);
	};
}

function Bullet(player, color, playerId){
	if (typeof playerId === 'number')
		this.special = playerId + 1;
	else
		this.special = 0;
	this.material = new THREE.SpriteMaterial( {
		map: new THREE.CanvasTexture( generateSprite(this.special, color) ),
		blending: THREE.AdditiveBlending
	} );
	this.mesh = new THREE.Sprite(this.material);
	if (this.special === 0){
		this.mesh.scale.x = 0.5;
		this.mesh.scale.y = 0.5;
	}
	this.mesh.position.copy(player.mesh.position);
	this.mesh.position.z -= 0.1;
	this.speed = 0.1;
	this.destroy = function() {
		scene.remove(this.mesh);
		bullets.splice(bullets.indexOf(this),1);
	};
}

function generateSprite(special) {
	var canvas = document.createElement( 'canvas' );
	canvas.width = 16;
	canvas.height = 16;

	var context = canvas.getContext( '2d' );
	var gradient = context.createRadialGradient( canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2 );
	if (special === 0) {
		gradient.addColorStop( 0, 'rgba(255,255,255,1)' );
		gradient.addColorStop( 0.2, 'rgba(255,255,100,1)' );
		gradient.addColorStop( 0.4, 'rgba(32,32,10,1)' );
		gradient.addColorStop( 1, 'rgba(0,0,0,1)' );
	} else if (special === 1) {
		gradient.addColorStop( 0, 'rgba(255,255,150,1)' );
		gradient.addColorStop( 0.2, 'rgba(255,100,0,1)' );
		gradient.addColorStop( 0.4, 'rgba(64,0,0,1)' );
		gradient.addColorStop( 1, 'rgba(0,0,0,1)' );
	} else {
		gradient.addColorStop( 0, 'rgba(255,255,255,1)' );
		gradient.addColorStop( 0.2, 'rgba(0,255,255,1)' );
		gradient.addColorStop( 0.4, 'rgba(0,10,64,1)' );
		gradient.addColorStop( 1, 'rgba(0,0,0,1)' );
	}
	context.fillStyle = gradient;
	context.fillRect( 0, 0, canvas.width, canvas.height );

	return canvas;

}

function Enemy() {
	this.material = new THREE.MeshLambertMaterial({map:allTextures[2]});	
	this.mesh = new THREE.Mesh(enemyMesh, this.material);
	this.mesh.position.set(worldBounds.geometry.boundingBox.max.x+3, Math.random()* 6 - 3, Math.floor(Math.random() * 2 - 1));
	var typeCheck = Math.floor(Math.random()*5);
	if (typeCheck === 1) {
		this.type = 1;
		shieldBubble(this, 0xFF0000);
	} else if (typeCheck === 2) {
		this.type = 2;
		shieldBubble(this, 0x0000FF);
	} else {
		this.type = 0;
	}

	this.bbox = new THREE.BoundingBoxHelper(this.mesh);
	this.bbox.visible = false;
	scene.add(this.bbox);
	this.bbox.update();
	
	this.alive = true;
	this.speed = 0.02;
	
	this.destroy = function(kill) {
		scene.remove(this.mesh);
		scene.remove(this.bbox);
		scene.remove(this.shield);
		enemies.splice(enemies.indexOf(this),1);
		if (kill)
			updateScore(10);
		else
			updateScore(-10);
	};
	this.movement = function() {
		this.mesh.translateX(-this.speed - (difficulty * 0.005));
		if (this.type > 0)
			this.shield.translateX(-this.speed - (difficulty * 0.005));
		if (this.mesh.position.x <= worldBounds.geometry.boundingBox.min.x - 3)
			this.destroy();
		collide(this, bullets);
	};
}

function shieldBubble(enemy, color){
	var material = new THREE.MeshPhongMaterial({blending: THREE.AdditiveBlending, color:0x575757, emissive:color, specular:0xFFFFFF, shininess:100, transparent: true, opacity:0.3});
	var geometry = new THREE.SphereGeometry(0.5, 32, 32);
	enemy.shield = new THREE.Mesh(geometry, material);
	enemy.shield.position.copy(enemy.mesh.position);
	scene.add(enemy.shield);
}

function spawnEnemy() {
	var enemy = new Enemy();
	scene.add(enemy.mesh);
	enemies.push(enemy);
}

function checkGamePad(player, gamepad) {
	if (player.alive) {
		if (gamepad.axes[0] > 0.5 || gamepad.axes[0] < -0.5)
			player.velocity.x += gamepad.axes[0] * player.speed;
		else if (gamepad.axes[0] <= 0.5 || gamepad.axes[0] >= -0.5)
			player.velocity.x = 0;

		if (gamepad.axes[1] > 0.5 || gamepad.axes[1] < -0.5)
			player.velocity.y -= gamepad.axes[1] * player.speed;
		else if (gamepad.axes[1] <= 0.5 || gamepad.axes[1] >= -0.5)
			player.velocity.y = 0;

		if (gamepad.buttons[1].pressed && !player.cooldown) {
			player.special();
			player.cooldown = 70;
		} else if (gamepad.axes[5] === 1 && !player.cooldown) {
			if (switchCooldown === 0){
				for (var i in players)
					players[i].switchTrack();
				switchCooldown = 120;
			}
		}	else if (gamepad.buttons[0].pressed && !player.cooldown){
			var bullet = new Bullet(player);
			scene.add(bullet.mesh);
			bullets.push(bullet);
			player.cooldown = 20;
		}
	}
}

function move(player, gamepad){
	if (player.cooldown > 0)
		player.cooldown--;
	if (switchCooldown > 0)
		switchCooldown--;

	checkGamePad(player, gamepad);

	var bounds = worldBounds.geometry.boundingBox;
	for (var axis in player.mesh.position)
		if (player.mesh.position[axis] <= bounds.min[axis] && player.velocity[axis] < 0 || player.mesh.position[axis] >= bounds.max[axis] && player.velocity[axis] > 0)
			player.velocity[axis] = 0;

	player.mesh.rotation.x = -player.velocity.y*1.5;

	player.mesh.translateX(player.velocity.x);
	player.mesh.translateY(player.velocity.y);
	player.mesh.position.setZ(-player.track);

	for (var i in bullets){
		bullets[i].mesh.translateX(bullets[i].speed);	
		if (bullets[i].mesh.position.x > 10) {
			bullets[i].destroy();
		}
	}

	if (!spawnCount) {
		spawnEnemy();
		spawnCount = Math.floor(Math.random() * 481 + 120 - (50 * difficulty));
	} else
		spawnCount--;
	
	for (var enemy in enemies){	
		enemies[enemy].movement();
		if (enemies[enemy])
			enemies[enemy].bbox.update();
	}
	
	player.bbox.update();
	
	if (player.alive)
		collide(player, enemies);
}

function collide(ship, threat){
	var hit = false;
	for (var i in threat){
		if (ship.bbox.box.containsPoint(threat[i].mesh.position))
			hit = true;
		else if (threat[i].bbox && ship.bbox.box.isIntersectionBox(threat[i].bbox.box))
			hit = true;

		if (hit)
			if (ship.type > 0 && threat[i].special !== ship.type)
					return;
			else 
				if (ship.alive) {
					ship.alive = false;
					threat[i].destroy();
					ship.destroy(true);
				}
		}
}

function reset(){
	for (var i=0;i<enemies.length;i++)
		enemies[i].destroy();
	for (var j=0;j<bullets.lenght;j++)
		bullets[j].destroy();
	for (var k in players)
		delete players[k];
	initGame();
}

function updateScore(points){
	if (points)
		score += points;
	
	if (score < 0)
		score = 0;
	else if (score % 100 === 0)
		difficulty++;

	UI.innerText = "Score: " + score;
}

function animate() {
	for (var i in players) {
		var gamepad = navigator.getGamepads()[i];
		move(players[i], gamepad);
	}	
	for (var j in background){
		background[j].translateX(-0.05);
		if (background[j].position.x <= -height*2)
			background[j].position.x = height*2;
	}
	if (!players[0].alive && !players[1].alive){
		cancelAnimationFrame(requestId);
		reset();
		return;
	}

	render();
	requestId = requestAnimationFrame( animate );
}

function render() {
	renderer.render( scene, camera );
}
