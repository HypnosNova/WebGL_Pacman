function Paccer(level, scene){
	this.pos = level.paccerStartPos.clone();
	this.scene = scene;
	this.level = level;
	this.mesh;
	this.speed = 1.0 / 16;

	this.dir = new THREE.Vector2(0, 0);
	this.dir2 = new THREE.Vector2(0, 0);

	this.points = 0;

	this.createAvatar();
}

Paccer.prototype.getLookAt = function(){
	return new THREE.Vector3(this.pos.x + this.dir.x, this.pos.y + this.dir.y, 0.0);
}

Paccer.prototype.setDir = function(x, y){
	this.dir2.x = x;
	this.dir2.y = y;
}

Paccer.prototype.setKey = function(code){
	//UP 	38 || 87
	if ((code == 38) || (code == 87))
		this.setDir(0, 1);

	//DOWN	40 || 83
	if ((code == 40) || (code == 83))
		this.setDir(0, -1);

	//LEFT 	37 || 65
	if ((code == 37) || (code == 65))
		this.setDir(-1, 0);

	//RIGHT	39 || 68
	if ((code == 39) || (code == 68))
		this.setDir(1, 0);
}

Paccer.prototype.update = function(){
	var score = false;
	if ((this.dir2.length() < 1) && (this.dir.length() < 1))
		return;

	distance = 0;
	reposition = false;

	dirDelta = this.dir.distanceTo(this.dir2);

	//first head towards next center...
	dxC = Math.ceil(this.pos.x) - this.pos.x; 
	dxC = (this.dir.x > 0)?dxC:0;
	dxF = this.pos.x - Math.floor(this.pos.x); 
	dx = (this.dir.x < 0)?dxF:dxC;
	if (dx > 0){
		//if dirDelta == 2 -> reverse direction!
		distance = Math.min(dx, this.speed);
		this.pos.x += this.dir.x * distance;
		reposition = true;
	}

	dyC = Math.ceil(this.pos.y) - this.pos.y; 
	dxC = (this.dir.y > 0)?dyC:0;
	dyF = this.pos.y - Math.floor(this.pos.y); 
	dy = (this.dir.y < 0)?dyF:dyC;
	if (dy > 0){
		distance = Math.min(dy, this.speed);
		this.pos.y += this.dir.y * distance;
		reposition = true;
	}

	if (reposition){
		var score = this.level.setPacPos(this.pos);
		if (score > 0){
			this.points += score;
			score = true;
		}
	}

	if (distance < this.speed){
		if ((dirDelta  > 1) || (this.dir.length() < 1)){
			if (this.level.canGo(this.pos, this.dir2))
				this.dir = this.dir2.clone();
		}

		//check for next field
		if (this.level.canGo(this.pos, this.dir)){
			distance = this.speed - distance;
			this.pos.x += distance * this.dir.x;
			this.pos.y += distance * this.dir.y;
			reposition = true;
		}else{
			reposition = true;
			this.dir.set(0,0);
			this.dir2.set(0,0);
		}
	}
	if (reposition)
		this.positionPaccer();

	return score;
}

Paccer.prototype.positionPaccer = function(){
	this.mesh.position.x = this.pos.x * this.level.fieldX + this.level.offsetX;
	this.mesh.position.y = this.pos.y * this.level.fieldY + this.level.offsetY;
};

Paccer.prototype.createAvatar = function(){
	var geometry = new THREE.SphereGeometry(4, 64, 64);
	var material = new THREE.MeshLambertMaterial({ color: 0xDDAA00, ambient: 0xDDAA00 });
	this.mesh = new THREE.Mesh( geometry, material );
	this.scene.add(this.mesh);

	this.reset();
}

Paccer.prototype.reset = function(){
	this.pos = this.level.paccerStartPos.clone();
	this.dir = new THREE.Vector2(0, 0);
	this.dir2 = new THREE.Vector2(0, 0);

	this.points = 0;

	this.positionPaccer();
	this.mesh.position.z = this.level.offsetZ;
}
