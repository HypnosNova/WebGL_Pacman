function Dot(x, y, level){
	this.pos = new THREE.Vector2(x, y);
	this.posRel = new THREE.Vector2(x / level.fieldsX, y / level.fieldsY);
	this.mesh;
	this.light;

	this.offsetZ = level.offsetZ;
	this.waveOffset = (4 * this.posRel.x) * (4 * this.posRel.y);

	this.createDot(x, y, level)
};

Dot.prototype.createDot = function (x, y, level){
	var geometry = new THREE.SphereGeometry(level.fieldX * 0.16, 12, 8);
	var material = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
	this.mesh = new THREE.Mesh( geometry, material );
	level.positionMeshAndAdd(this.mesh, x, y);
	this.mesh.position.z = 0;
};

Dot.prototype.update = function(time){
	this.mesh.position.z = this.offsetZ + Math.sin(this.waveOffset + time * 10) * 1.5;
}

Dot.prototype.checkForHit = function (enemy){
	return (enemy.distanceTo(this.pos) < 0.05);
}

Dot.prototype.eaten = function(scene, renderer){
	this.mesh.visible = false;
	scene.remove(this.mesh);
	this.mesh.geometry.dispose();
	this.mesh.material.dispose();
}
