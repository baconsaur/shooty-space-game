function Explosion(x, y, z) {
  var speed = 1;
  var particleCount = 100;
  var sprite = new THREE.CanvasTexture(explosionSprite());
  var direction = [];

  var geometry = new THREE.Geometry();

  for (i = 0; i < particleCount; i ++)
  {
    var vertex = new THREE.Vector3();
    vertex.x = x;
    vertex.y = y;
    vertex.z = z;

    geometry.vertices.push( vertex );
    direction.push({x:(Math.random() * speed)-(speed/2),y:(Math.random() * speed)-(speed/2),z:(Math.random() * speed)-(speed/2)});
  }
  var material = new THREE.PointsMaterial( {
    fog: false,
    size: 0.3,
    blending: THREE.AdditiveBlending,
		map: sprite
	} );
  var particles = new THREE.Points( geometry, material );

  this.object = particles;
  this.status = true;

  this.xDir = (Math.random() * speed)-(speed/2);
  this.yDir = (Math.random() * speed)-(speed/2);
  this.zDir = (Math.random() * speed)-(speed/2);

  scene.add( this.object );

  this.update = function(){
    if (this.status){
      var pCount = particleCount;
      while(pCount--) {
        var particle =  this.object.geometry.vertices[pCount];
        particle.y += direction[pCount].y;
        particle.x += direction[pCount].x;
        this.object.material.size -= 0.0001;
        if (this.object.material.size <= 0) {
          scene.remove(this.object);
          explosions.splice(explosions.indexOf(this), 1);
        }
        //particle.z += direction[pCount].z;
      }
      this.object.geometry.verticesNeedUpdate = true;
    }
  };
}

function explosionSprite() {
  var canvas = document.createElement( 'canvas' );
  canvas.width = 16;
  canvas.height = 16;

  var context = canvas.getContext( '2d' );
  var gradient = context.createRadialGradient( canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2 );
  gradient.addColorStop( 0, 'rgba(255,255,150,1)' );
  gradient.addColorStop( 0.2, 'rgba(255,100,0,1)' );
  gradient.addColorStop( 0.4, 'rgba(64,0,0,1)' );
  gradient.addColorStop( 1, 'rgba(0,0,0,1)' );
  context.fillStyle = gradient;
  context.fillRect( 0, 0, canvas.width, canvas.height );

  return canvas;
}
