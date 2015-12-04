function Explosion(x, y, z) {
  var speed = 0.8;
  var particleCount = 100;
  var sprite = new THREE.CanvasTexture(explosionSprite());
  var direction = [];
  var particles = [];

  var material = new THREE.SpriteMaterial( {
    fog: false,
    blending: THREE.AdditiveBlending,
    map: sprite
  } );

  for (i = 0; i < particleCount; i ++)
  {
    var point = new THREE.Sprite(material);

    point.position.set(x,y,z);

    //point.scale.set(0.3,0.3,0.3);
    //point.position.set(new THREE.Vector3(x,y,z));

    particles.push(point);

    direction.push({x:(Math.random() * speed)-(speed/2),y:(Math.random() * speed)-(speed/2),z:(Math.random() * speed)-(speed/2)});

    scene.add( point );
  }

  this.object = particles;
  this.status = true;

  this.xDir = (Math.random() * speed)-(speed/2);
  this.yDir = (Math.random() * speed)-(speed/2);
  this.zDir = (Math.random() * speed)-(speed/2);

  this.update = function(){
    if (this.status){
      var pCount = particleCount;
      while(pCount--) {
        var particle = this.object[pCount];
        particle.position.y += direction[pCount].y;
        particle.position.x += direction[pCount].x;
        particle.position.z += direction[pCount].z;
        particle.scale.x = particle.scale.y *= 0.6;
        if (particle.position.y > worldBounds.geometry.boundingBox.max.y * 2) {
           scene.remove(this.object);
           explosions.splice(explosions.indexOf(this), 1);
        }
      }
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
