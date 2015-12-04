var scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x8060F0, 4.5, 9);
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

var light1 = new THREE.AmbientLight( 0x303030 );
var light2 = new THREE.DirectionalLight( 0x303025, 4.5 );
var light3 = new THREE.PointLight( 0x4540A0, 2, 120 );
light2.position.set( 10, 50, 50 );
light3.position.set( -20, -50, -20 );
scene.add( light1, light2, light3 );

camera.position.z = 5;

var renderer = new THREE.WebGLRenderer();
renderer.setClearColor( 0x000000 );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

//Post-processing
composer = new THREE.EffectComposer( renderer );
composer.addPass( new THREE.RenderPass( scene, camera ) );

var bloomPass = new THREE.BloomPass(1.8, 10, 0.5, 1024);
//var edgeShader = new THREE.ShaderPass(THREE.EdgeShader);
var effectCopy = new THREE.ShaderPass(THREE.CopyShader);
effectCopy.renderToScreen = true;

composer.addPass( new THREE.RenderPass( scene, camera ) );
//composer.addPass(edgeShader);
composer.addPass(bloomPass);
composer.addPass(effectCopy);


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

function initGame() {
	bgm.currentTime = 0;
	bgm.play();
	players = [];
	bullets = [];
	enemies = [];
	gamepads = [];
	explosions = [];
	spawnCount = 600;
	score = 0;
	difficulty = 0;
	UI.innerText = "Score: " + score;
	switchCooldown = 0;
	for (var i=0;i<2;i++) {
		var ship = new Ship(i);
		players.push(ship);
	}
	setupKeyboard();
	setupGamePad();
	animate();
}

function spawnEnemy() {
	var enemy = new Enemy();
	scene.add(enemy.mesh);
	enemies.push(enemy);
}

function setupGamePad() {
	var gamepadCheck = navigator.getGamepads();
	if(gamepadCheck){
		for (var i in gamepadCheck)	{
			if (gamepadCheck[i].mapping) {
				console.log("unsupported controller");
				return false;
			}
			gamepads.push(gamepadCheck[i]);
		}
		return true;
	}	else
		return false;
}

function setupKeyboard() {
	window.addEventListener('keydown', function(event) {
		event.preventDefault();
		checkKeys(event.which, true);
	});
	window.addEventListener('keyup', function(event) {
		event.preventDefault();
		checkKeys(event.which, false);
	});
}

function move(player, gamepad){
	if (player.cooldown > 0)
		player.cooldown--;
	if (switchCooldown > 0)
		switchCooldown--;

if (gamepad)
		checkGamePad(player, gamepad);
else
		checkKeys();

if (player.up || player.down)
	player.velocity.x += (player.up > 0 ? player.up : player.down);
else
	player.velocity.x = 0;

if (player.left || player.right)
	player.velocity.y -= (player.left > 0 ? player.left : player.right);
else
	player.velocity.y = 0;

if (player.shoot1 && !player.cooldown) {
	laser2.play();
	player.special();
	player.cooldown = 70;
} else if (player.trigger && !player.cooldown) {
	if (switchCooldown === 0){
		woosh.play();
		for (var i in players)
			players[i].switchTrack();
		switchCooldown = 120;
	}
}	else if (player.shoot2 && !player.cooldown){
	var bullet = new Bullet(player);
	scene.add(bullet.mesh);
	laser1.play();
	bullets.push(bullet);
	player.cooldown = 20;
}

	var bounds = worldBounds.geometry.boundingBox;
	for (var axis in player.mesh.position)
		if (player.mesh.position[axis] <= bounds.min[axis] && player.velocity[axis] < 0 || player.mesh.position[axis] >= bounds.max[axis] && player.velocity[axis] > 0)
			player.velocity[axis] = 0;

	player.mesh.rotation.x = -player.velocity.y*1.5;

	player.mesh.translateX(player.velocity.x);
	player.mesh.translateY(player.velocity.y);
	player.mesh.position.setZ(-player.track);

	for (var j in bullets){
		bullets[j].mesh.translateX(bullets[j].speed);
		if (bullets[j].mesh.position.x > 10) {
			bullets[j].destroy();
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
			if (ship.type > 0 && threat[i].special !== ship.type){
				shieldHit.play();
				return;
			} else
				if (ship.alive) {
					ship.alive = false;
					threat[i].destroy();
					explode.play();
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
		if (players[i].alive)
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

	for (var explosion in explosions)
	explosions[explosion].update();

	render();
	requestId = requestAnimationFrame( animate );
}

function render() {
	//renderer.render( scene, camera );
	composer.render();
}
