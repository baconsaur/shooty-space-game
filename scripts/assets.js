var bgm = new Audio('sound/Camazotz.mp3');
var laser1 = new Audio('sound/laser1.wav');
var laser2 = new Audio('sound/laser2.wav');
var explode = new Audio('sound/explode.wav');
var woosh = new Audio('sound/woosh.wav');
var shieldHit = new Audio('sound/shield.wav');

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
