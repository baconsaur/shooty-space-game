var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

function Ship(playerId) {
	this.playerId = playerId;
	this.speed = 0.005;
	this.velocity = new THREE.Vector3(0,0,0);
	this.geometry = new THREE.CubeGeometry( 0.5,0.5,0.5 ); 
	this.material = new THREE.MeshPhongMaterial( { color: 0x909090 } );
	this.mesh = new THREE.Mesh( this.geometry, this.material );
	this.track = playerId;
	this.mesh.position.set(0, playerId, -playerId);
	this.switchTrack = function () {
		var position = this.mesh.position;
		if (this.track === 0)
			this.track = 1;
		else
			this.track = 0;
	};
}

var light1 = new THREE.AmbientLight( 0x404040 );
var light2 = new THREE.PointLight( 0x404020, 7, 120 );
var light3 = new THREE.PointLight( 0x4540A0, 3, 120 );
light2.position.set( 50, 50, 50 );
light3.position.set( -50, -50, -50 );
scene.add( light1, light2, light3 );

camera.position.z = 5;

function checkGamePad(player, gamepad) {
	if (gamepad){
	if (gamepad.axes[0] > 0.5 || gamepad.axes[0] < -0.5)
		player.velocity.x += gamepad.axes[0] * player.speed;
	else if (gamepad.axes[0] <= 0.5 || gamepad.axes[0] >= -0.5)
		player.velocity.x = 0;

	if (gamepad.axes[1] > 0.5 || gamepad.axes[1] < -0.5)
		player.velocity.y -= gamepad.axes[1] * player.speed;
	else if (gamepad.axes[1] <= 0.5 || gamepad.axes[1] >= -0.5)
		player.velocity.y = 0;

	if (gamepad.axes[5] === 1)
		console.log("weapon 1");
	else if (gamepad.buttons[1].pressed)
		console.log("weapon 2");
	else if (gamepad.buttons[0].pressed)
		if (switchCooldown === 0){
			for (var i in players)
				players[i].switchTrack();
			switchCooldown = 120;
		}
}
}

function moveShip(player, gamepad){
	checkGamePad(player, gamepad);
	for (var axis in player.mesh.position)
		if (player.mesh.position[axis] <= -2.5 && player.velocity[axis] < 0 || player.mesh.position[axis] >= 3.3 && player.velocity[axis] > 0)
			player.velocity[axis] = 0;

	player.mesh.translateX(player.velocity.x);
	player.mesh.translateY(player.velocity.y);
	player.mesh.position.setZ(-player.track);
}

function animate() {
	for (var i in players) {
		var gamepad = navigator.getGamepads()[i];
		moveShip(players[i], gamepad);
	}
	render();
	if (switchCooldown > 0)
		switchCooldown--;
	requestAnimationFrame( animate );
}

function render() {
	renderer.render( scene, camera );
}

var players = [];
for (var i=0;i<2;i++) {
	var ship = new Ship(i);
	players.push(ship);
	scene.add(players[i].mesh);
}
var switchCooldown = 0;
var player = players[0];
animate();
