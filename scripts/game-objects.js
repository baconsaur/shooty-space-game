function Ship(playerId) {
	this.playerId = playerId;
	this.alive = true;
	this.speed = 0.005;
	this.velocity = new THREE.Vector3(0,0,0);
	this.texture = allTextures[playerId];
	this.material = new THREE.MeshPhongMaterial({map:this.texture, shininess:100});
	this.mesh = new THREE.Mesh(playerMesh, this.material);
	this.mesh.position.set(worldBounds.geometry.boundingBox.min.x/3 *2, playerId*2-1, -playerId);
	scene.add(this.mesh);

	this.bbox = new THREE.BoundingBoxHelper(this.mesh);
	this.bbox.visible = false;
	scene.add(this.bbox);
	this.bbox.update();

	this.track = playerId;
	this.cooldown = 0;

	this.up = 0;
	this.down = 0;
	this.left = 0;
	this.right = 0;

	this.shoot1 = false;
	this.shoot2 = false;
	this.trigger = false;

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
