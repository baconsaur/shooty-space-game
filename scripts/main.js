var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var UI = document.createElement('div');
document.body.appendChild(UI);

function initGame() {
	players = [];
	bullets = [];
	enemies = [];
	enemyBoxes = [];
	playerBoxes = [];
	spawnCount = 600;
	score = 0;
	UI.innerText = "Score: " + score;
	switchCooldown = 0;
	for (var i=0;i<2;i++) {
		var ship = new Ship(i);
		players.push(ship);
		scene.add(players[i].mesh);
	}
	animate();
}

function Ship(playerId) {
	this.playerId = playerId;
	this.speed = 0.005;
	this.velocity = new THREE.Vector3(0,0,0);
	this.geometry = new THREE.CubeGeometry( 0.5,0.5,0.5 ); 
	if (playerId === 0)
		this.material = new THREE.MeshPhongMaterial( { color: 0x5050B0 } );
	else
		this.material = new THREE.MeshPhongMaterial( { color: 0x50B050 } );
	this.mesh = new THREE.Mesh( this.geometry, this.material );
	this.track = playerId;
	this.mesh.position.set(0, playerId, -playerId);
	this.cooldown = 0;
	this.switchTrack = function () {
		var position = this.mesh.position;
		if (this.track === 0)
			this.track = 1;
		else
			this.track = 0;
	};
	this.special = function(){
		var geometry;
		var material;
		if (this.playerId === 0) {
			geometry = new THREE.SphereGeometry(0.15, 32, 32);
			material = new THREE.MeshPhongMaterial({color:0xFF0000});
		} else {
			geometry = new THREE.SphereGeometry(0.15, 32, 32);
			material = new THREE.MeshPhongMaterial({color:0xFFFF00});
		}
		var special = new Bullet(this, geometry, material);
		scene.add(special.mesh);
		bullets.push(special);
		score += 10;
		updateScore();
	};
	this.bbox = new THREE.BoundingBoxHelper(this.mesh);
	scene.add(this.bbox);
	this.bbox.update();
	playerBoxes.push(this.bbox);
}

function Bullet(player, geometry, material){
	this.geometry = geometry || new THREE.CubeGeometry(0.1,0.1,0.1);
	this.material = material || new THREE.MeshPhongMaterial({color:0xFFFFFF});
	this.mesh = new THREE.Mesh(this.geometry, this.material);
	this.mesh.position.copy(player.mesh.position);
	this.speed = 0.1;
}

function Enemy() {
	this.speed = 0.02;
	this.geometry = new THREE.IcosahedronGeometry(0.5, 0);
	this.material = new THREE.MeshPhongMaterial({color:0x404040});
	this.mesh = new THREE.Mesh(this.geometry, this.material);
	this.mesh.position.set(10, Math.random()* 6 - 3, Math.floor(Math.random() * 2 - 1));	
	this.bbox = new THREE.BoundingBoxHelper(this.mesh);
	scene.add(this.bbox);
	this.bbox.update();
	enemyBoxes.push(this.bbox);
	this.movement = function() {
		this.mesh.translateX(-this.speed);
		if (this.mesh.position.x <= -10)
			scene.remove(this.mesh);
		collide(this.mesh);
	};
}

function spawnEnemy() {
	var enemy = new Enemy();
	scene.add(enemy.mesh);
	enemies.push(enemy);
}

function collide(box1, box2){
	for (var i in box1)
		for (var j in box2)
			if (box1[i].box.isIntersectionBox(box2[j].box))
				console.log("hit!");
		/*	for (var i in object.geometry.vertices)
	{       
		var meshVertex = object.geometry.vertices[i].clone();
		var worldVertex = meshVertex.applyMatrix4(object.matrix);
		var direction = worldVertex.sub( object.position );

		var ray = new THREE.Raycaster( object.position, direction.clone().normalize() );
		var collisions = ray.intersectObjects( bullets );
		if ( collisions.length > 0 && collisions[0].distance < direction.length() ) 
			console.log("hit!");
	}*/
}

var light1 = new THREE.AmbientLight( 0x404040 );
var light2 = new THREE.PointLight( 0x404020, 7, 120 );
var light3 = new THREE.PointLight( 0x4540A0, 3, 120 );
light2.position.set( 50, 50, 50 );
light3.position.set( -50, -50, -50 );
scene.add( light1, light2, light3 );

camera.position.z = 5;

function checkGamePad(player, gamepad) {
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
		player.cooldown = 60;
	} else if (gamepad.axes[5] === 1 && !player.cooldown) {
		var bullet = new Bullet(player);
		scene.add(bullet.mesh);
		bullets.push(bullet);
		player.cooldown = 20;
  }	else if (gamepad.buttons[0].pressed)
		if (switchCooldown === 0){
			for (var i in players)
				players[i].switchTrack();
			switchCooldown = 120;
		}
}

function move(player, gamepad){
	if (player.cooldown > 0)
		player.cooldown--;
	if (switchCooldown > 0)
		switchCooldown--;

	checkGamePad(player, gamepad);
	for (var axis in player.mesh.position)
		if (player.mesh.position[axis] <= -2.5 && player.velocity[axis] < 0 || player.mesh.position[axis] >= 3.3 && player.velocity[axis] > 0)
			player.velocity[axis] = 0;

	player.mesh.translateX(player.velocity.x);
	player.mesh.translateY(player.velocity.y);
	player.mesh.position.setZ(-player.track);

	for (var i in bullets){
		bullets[i].mesh.translateX(bullets[i].speed);	
		if (bullets[i].mesh.position.x > 10) {
			scene.remove(bullets[i].mesh);
			delete bullets[i];
		}
	}

	if (!spawnCount) {
		spawnEnemy();
		spawnCount = Math.floor(Math.random() * 481 + 120);
	} else
		spawnCount--;
	
	for (var enemy in enemies)	
		enemies[enemy].movement();
	for (var i in enemyBoxes)
		enemyBoxes[i].update();
	for (var i in playerBoxes)
		playerBoxes[i].update();
	collide(playerBoxes, enemyBoxes);
}

function updateScore(){
	UI.innerText = "Score: " + score;
}

function animate() {
	for (var i in players) {
		var gamepad = navigator.getGamepads()[i];
		move(players[i], gamepad);
	}	
	render();
	requestAnimationFrame( animate );
}

function render() {
	renderer.render( scene, camera );
}


initGame();
