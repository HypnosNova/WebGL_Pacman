function Ghost(level, scene, paccer, num){
	this.level = level;
	this.scene = scene;
	this.paccer = paccer;
	this.num = num;

	this.pos = level.ghostStartPos.clone();
	this.dir = new THREE.Vector2(0, 0);

	this.speed = 1.0 / 18;

	this.mesh;

	this.createAvatar();
}

Ghost.prototype.toPaccerDist = function(x, y){
	return Math.abs(x - this.paccer.pos.x) + Math.abs((y) - this.paccer.pos.y);
}

Ghost.prototype.toPaccer = function(pos){
	var x = pos.x;
	var y = pos.y;

	var px = Math.round(this.paccer.pos.x);
	var py = Math.round(this.paccer.pos.y);

	var start = this.level.graph.nodes[y][x];
    var end = this.level.graph.nodes[py][px];
	var result = astar.search(this.level.graph.nodes, start, end);
	if (result)
		if (result.length > 0){
			var t = result[0];
			if (Math.abs(t.x - y) + Math.abs(t.y - x) == 1)
				return new THREE.Vector2((t.y - x),(t.x - y));
		}

	var dist = this.level.fieldsX * this.level.fieldsY;
	var newDir = this.dir.clone();
	var xL = this.level.getBlock(x-1, y);
	if (xL > 0){
		var tmp = this.toPaccerDist(x-1, y);
		if (tmp < dist){
			newDir = new THREE.Vector2(-1, 0);
			dist = tmp;
		}
	}
	var xH = this.level.getBlock(x+1, y);
	if (xH > 0){
		var tmp = this.toPaccerDist(x+1, y);
		if (tmp < dist){
			newDir = new THREE.Vector2(1, 0);
			dist = tmp;
		}
	}
	var yL = this.level.getBlock(x, y-1);
	if (yL > 0){
		var tmp = this.toPaccerDist(x, y-1);
		if (tmp < dist){
			newDir = new THREE.Vector2(0, -1);
			dist = tmp;
		}
	}
	var yH = this.level.getBlock(x, y+1);
	if (yH > 0){
		var tmp = this.toPaccerDist(x, y+1);
		if (tmp < dist){
			newDir = new THREE.Vector2(0, 1);
			dist = tmp;
		}
	}

	return  newDir;
}

Ghost.prototype.move = function(){
	distance = 0;
	reposition = false;

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

	if (distance < this.speed){

		if (Math.abs(this.pos.x - Math.round(this.pos.x)) + Math.abs(this.pos.y - Math.round(this.pos.y)) < this.speed){
			this.pos.x = Math.round(this.pos.x);
			this.pos.y = Math.round(this.pos.y);
		}


		var newDir = this.toPaccer(this.pos);
		//if (this.dir.distanceTo(newDir) != 2.0)
		this.dir = newDir;
	
		if (this.level.canGo(this.pos, this.dir)){
			distance = this.speed - distance;
			this.pos.x += distance * this.dir.x;
			this.pos.y += distance * this.dir.y;
			reposition = true;
		}else{
			reposition = true;
			this.dir = this.toPaccer(this.pos);
		}
	}

	if (reposition)
		this.positionGhost();
}
Ghost.prototype.update = function(time){
	move();
}

Ghost.prototype.positionGhost = function(){
	this.mesh.position.x = this.pos.x * this.level.fieldX + this.level.offsetX;
	this.mesh.position.y = this.pos.y * this.level.fieldY + this.level.offsetY;
};

Ghost.prototype.checkForHit = function(){
	var a = (Math.abs(Math.round(this.pos.x) - Math.round(this.paccer.pos.x)) < this.speed);
	var b = (Math.abs(Math.round(this.pos.y) - Math.round(this.paccer.pos.y)) < this.speed);
	return a && b;
}

Ghost.prototype.reset = function(){
	this.pos = this.level.ghostStartPos.clone();
	this.dir = new THREE.Vector2(0, 0);

	var paths = [new THREE.Vector2(-1, 0), new THREE.Vector2(1, 0), new THREE.Vector2(0, -1), new THREE.Vector2(0, 1)];
	for (var i=3; i >= 0; --i){
		var next = this.pos.clone();
		next.add(paths[i]);
		var num = this.level.getBlock(next.x, next.y);
		if (num > 0){
			this.dir = paths[i].clone();
		}
	}

	this.positionGhost();
	this.mesh.position.z = this.level.offsetZ;
}

Ghost.prototype.createAvatar = function(){
	var geometry = new THREE.SphereGeometry(4, 32, 32);
	var material = new THREE.MeshLambertMaterial({ color: 0xDDAAAA });
	this.mesh = new THREE.Mesh( geometry, material );
	this.scene.add(this.mesh);

	this.reset();
	
};