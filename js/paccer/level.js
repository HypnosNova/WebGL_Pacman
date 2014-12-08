function Level(level, scene, renderer){
	this.level = level;
	this.graph;
	this.scene = scene;
	this.renderer = renderer
	
	this.fieldsY = level.length;
	this.fieldsX = (this.fieldsY > 0)?level[0].length:0;

	this.fieldX = (this.fieldsX * this.fieldsY) > 0?9/Math.max(this.fieldsX, this.fieldsY)*23.0:0;
	this.fieldY = this.fieldX;
	this.fieldZ = 11.2358;

	this.fieldOffsetX = this.fieldX / 2.0;
	this.fieldOffsetY = this.fieldY / 2.0;
	this.fieldOffsetZ = this.fieldZ / 2.0;

	this.offsetX = -this.fieldX * this.fieldsX / 2.0 + this.fieldOffsetX;
	this.offsetY = -this.fieldY * this.fieldsY / 2.0 + this.fieldOffsetY;
	this.offsetZ =  this.fieldOffsetZ;

	this.dots = [];
	this.dotsCount = -1;
	this.dotsEaten = 0;

	this.levelTiles = [];
	this.floorMesh;

	this.materialBlock;
	this.materialFloor;
	this.createMaterials();

	this.paccerStartPos = new THREE.Vector2(Math.floor(this.fieldsX / 2.0), Math.floor(this.fieldsY / 2.0));
	this.ghostStartPos = new THREE.Vector2(1, 1);

	this.reset();
};

Level.prototype.createMaterials = function(){
	this.materialBlock = new THREE.MeshLambertMaterial({ color: 0x0000FF, ambient:0x0000FF});
	this.materialFloor = new THREE.MeshLambertMaterial({ color: 0xFF5511, ambient:0x040408});
}

Level.prototype.canGo = function(from, dir){
	to = from.clone();
	to.add(dir);
	if ((to.x < 0) || (to.y < 0) || (to.x >= this.fieldsX) || (to.y >= this.fieldsY))
		return false;
	
	if (this.level[to.y][to.x] <= 0){
		return false;
	}
	
	return true;
}

Level.prototype.getBlock = function(x, y){
	if ((x < 0) || (y < 0) || (x >= this.fieldsX) || (y >= this.fieldsY))
		return 1;
	return this.level[y][x];		
}

Level.prototype.reset = function(){
	for (i=this.dotsCount - 1; i >= 0; --i){
		this.dots[i].eaten(this.scene, this.renderer);
	}
	var arrLevel = [];
	for (i=0; i < this.fieldsY; i++){
		var arr = [];
		for (j=0; j < this.fieldsX; j++){
			arr.push(this.level[i][j]<=0?0:1);
		}
		arrLevel.push(arr);
	}
	this.graph=null;
	this.graph = new Graph(arrLevel);

	this.dots = [];
	this.dotsCount = -1;
	this.dotsEaten = 0;

	this.levelTiles = [];

	for (j=0; j < this.fieldsY; j++){
		//console.log(j + "/" + (this.fieldsY - 1));
		for (i=0; i < this.fieldsX; i++){
			switch(this.level[j][i]){
			case 0:
				this.createBlock(i, j);
				break;
			case 1:
				this.createDot(i, j);
				break;
			case 2:
				this.createDot(i, j);
				break;
			case 3:
				this.paccerStartPos = new THREE.Vector2(i,j);
				break
			case -1:
				this.ghostStartPos = new THREE.Vector2(i,j);
				break
			default:
				break;
			}
		}
	}
	this.dotsCount = this.dots.length;

	var geometry = new THREE.PlaneGeometry(this.fieldX * this.fieldsX, this.fieldY * this.fieldsY);
	var material = this.materialFloor;
	this.floorMesh = new THREE.Mesh( geometry, material );
	this.scene.add(this.floorMesh);
	this.floorMesh.position.z = 0;
}

Level.prototype.positionMeshAndAdd = function(mesh, x, y){
	mesh.position.set(x * this.fieldX + this.offsetX,y * this.fieldY + this.offsetY, this.offsetZ);
	this.scene.add(mesh);
};

Level.prototype.positionGeometryAndAdd = function(geometry, material, x, y, ox, oy, rz, rz2){
	var mesh = new THREE.Mesh( geometry, material );
	if (rz)
		mesh.rotateOnAxis(new THREE.Vector3(0, 0, 1), rz);
	mesh.position.set((x + ox) * this.fieldX + this.offsetX,(y + oy) * this.fieldY + this.offsetY, this.offsetZ);
	if (rz2)
		mesh.rotateOnAxis(new THREE.Vector3(0, 0, 1), rz2);
	
	this.levelTiles.push(mesh);
	this.scene.add(mesh);
};

Level.prototype.isIntersection = function(pos){
	var x = pos.x;
	var y = pos.y;
	console.log(x + "/" + y);
	var xL = this.getBlock(x-1, y);
	xL = xL <= 0?0:1;
	var xH = this.getBlock(x+1, y);
	xH = xH <= 0?0:1;
	var yL = this.getBlock(x, y-1);
	yL = yL <= 0?0:1;
	var yH = this.getBlock(x, y+1);
	yH = yH <= 0?0:1;
	return  (xL + xH + yL + yH) > 2;
}

Level.prototype.getPathsForTile = function(pos){
	var x = pos.x;
	var y = pos.y;
	var res = [];

	var xL = this.getBlock(x-1, y);
	if (xL > 0)
		res.push(new THREE.Vector2(-1, 0));
	var xH = this.getBlock(x+1, y);
	if (xH > 0)
		res.push(new THREE.Vector2(1, 0));
	var yL = this.getBlock(x, y-1);
	if (yL > 0)
		res.push(new THREE.Vector2(0, -1));
	var yH = this.getBlock(x, y+1);
	if (yH > 0)
		res.push(new THREE.Vector2(0, 1));
	return  res;
}

Level.prototype.createBlock = function(x, y){
	var rad = 0.25;
	var radIn = 0.1;
	var material = this.materialBlock;

	var xL = this.getBlock(x-1, y);
	xL = xL == 0?0:1;
	var xH = this.getBlock(x+1, y);
	xH = xH == 0?0:1;
	var yL = this.getBlock(x, y-1);
	yL = yL == 0?0:1;
	var yH = this.getBlock(x, y+1);
	yH = yH == 0?0:1;
	var sum = 4 - (xL + xH + yL + yH);
	if (sum == 0){
		var geometry = new THREE.TorusGeometry(this.fieldX * rad, this.fieldX * radIn, 8, 8);
		this.positionGeometryAndAdd(geometry, material, x, y, 0, 0);
	}
	if (sum == 1){
		rz = ((xL == 0)?1.5:(xH == 0)?0.5:(yL == 0)?2.0:1.0) * 3.1415926
		
		var geometry = new THREE.TorusGeometry(this.fieldX * rad, this.fieldX * radIn, 8, 8, 3.1415926);
		this.positionGeometryAndAdd(geometry, material, x, y, 0, 0, rz);

		geometry = new THREE.CylinderGeometry(this.fieldX * radIn, this.fieldX * radIn, this.fieldX * 0.5, 8, 8);
		if (xL == 0){
			this.positionGeometryAndAdd(geometry, material, x, y, -0.25, 0.25, rz);
			this.positionGeometryAndAdd(geometry, material, x, y, -0.25, -0.25, rz);
		}
		if (xH == 0){
			this.positionGeometryAndAdd(geometry, material, x, y, 0.25, 0.25, rz);
			this.positionGeometryAndAdd(geometry, material, x, y, 0.25, -0.25, rz);
		}
		if (yL == 0){
			this.positionGeometryAndAdd(geometry, material, x, y, -0.25, -0.25, rz);
			this.positionGeometryAndAdd(geometry, material, x, y, 0.25, -0.25, rz);
		}
		if (yH == 0){
			this.positionGeometryAndAdd(geometry, material, x, y, -0.25, 0.25, rz);
			this.positionGeometryAndAdd(geometry, material, x, y, 0.25, 0.25, rz);
		}
	}
	if (sum == 2){
		if ((xL + xH == 0) || (yL + yH == 0)){
			var geometry = new THREE.CylinderGeometry(this.fieldX * radIn, this.fieldX * radIn, this.fieldX, 8, 8);
			if (xL == 0){
				this.positionGeometryAndAdd(geometry, material, x, y, 0, -0.25, 3.1415926 * 0.5);
				this.positionGeometryAndAdd(geometry, material, x, y, 0,  0.25, 3.1415926 * 0.5);
			}
			if (yL == 0){
				this.positionGeometryAndAdd(geometry, material, x, y, -0.25, 0);
				this.positionGeometryAndAdd(geometry, material, x, y,  0.25, 0);
			}
		}else{
			var geometry1 = new THREE.TorusGeometry(this.fieldX * rad, this.fieldX * radIn, 8, 8, 3.1415926 * 0.5);
			var geometry2 = new THREE.CylinderGeometry(this.fieldX * radIn, this.fieldX * radIn, this.fieldX * 0.5, 8, 8);
			if ((xL == 0) && (yL == 0)){
				this.positionGeometryAndAdd(geometry1, material, x, y, -0.5, -0.5);
				this.positionGeometryAndAdd(geometry1, material, x, y,  0, 0);
				this.positionGeometryAndAdd(geometry2, material, x, y, -0.25, 0.25, 3.1415926 * 0.5);
				this.positionGeometryAndAdd(geometry2, material, x, y, 0.25,  -0.25);
			}
			if ((xH == 0) && (yH == 0)){
				this.positionGeometryAndAdd(geometry1, material, x, y, 0.5, 0.5, 3.1415926);
				this.positionGeometryAndAdd(geometry1, material, x, y,  0, 0, 3.1415926);
				this.positionGeometryAndAdd(geometry2, material, x, y, 0.25, -0.25, 3.1415926 * 0.5);
				this.positionGeometryAndAdd(geometry2, material, x, y, -0.25,  0.25);
			}
			if ((xL == 0) && (yH == 0)){
				this.positionGeometryAndAdd(geometry1, material, x, y, 0.0, 0.0, 3.1415926 * 1.5);
				this.positionGeometryAndAdd(geometry1, material, x, y,  -0.5, 0.5, 3.1415926 * 1.5);
				this.positionGeometryAndAdd(geometry2, material, x, y, -0.25, -0.25, 3.1415926 * 0.5);
				this.positionGeometryAndAdd(geometry2, material, x, y, 0.25,  0.25);
			}
			if ((xH == 0) && (yL == 0)){
				this.positionGeometryAndAdd(geometry1, material, x, y, 0.5, -0.5, 3.1415926 * 0.5);
				this.positionGeometryAndAdd(geometry1, material, x, y,  0, 0, 3.1415926 * 0.5);
				this.positionGeometryAndAdd(geometry2, material, x, y, 0.25, 0.25, 3.1415926 * 0.5);
				this.positionGeometryAndAdd(geometry2, material, x, y, -0.25, -0.25);
			}
		}
	}
	if (sum == 3){
		var geometry1 = new THREE.TorusGeometry(this.fieldX * rad, this.fieldX * radIn, 8, 8, 3.1415926 * 0.5);
		var geometry2 = new THREE.CylinderGeometry(this.fieldX * radIn, this.fieldX * radIn, this.fieldX, 8, 8);

		if (xL == 1){
			this.positionGeometryAndAdd(geometry2, material, x, y, -0.25, 0);
			this.positionGeometryAndAdd(geometry1, material, x, y, 0.5, -0.5, 3.1415926 * 0.5);
			this.positionGeometryAndAdd(geometry1, material, x, y,  0.5, 0.5, 3.1415926 * 1.0);
		}
		if (xH == 1){
			this.positionGeometryAndAdd(geometry2, material, x, y, 0.25, 0);
			this.positionGeometryAndAdd(geometry1, material, x, y, -0.5, 0.5, 3.1415926 * 1.5);
			this.positionGeometryAndAdd(geometry1, material, x, y, -0.5, -0.5, 3.1415926 * 2.0);
		}
		if (yL == 1){
			this.positionGeometryAndAdd(geometry2, material, x, y, 0.0, -0.25, 3.1415926 * 0.5);
			this.positionGeometryAndAdd(geometry1, material, x, y, -0.5, 0.5, 3.1415926 * 1.5);
			this.positionGeometryAndAdd(geometry1, material, x, y,  0.5, 0.5, 3.1415926 * 1.0);
		}
		if (yH == 1){
			this.positionGeometryAndAdd(geometry2, material, x, y, 0.0, 0.25, 3.1415926 * 0.5);
			this.positionGeometryAndAdd(geometry1, material, x, y, 0.5, -0.5, 3.1415926 * 0.5);
			this.positionGeometryAndAdd(geometry1, material, x, y, -0.5, -0.5, 3.1415926 * 2.0);
		}
	}
	if (sum == 4){
		var geometry = new THREE.TorusGeometry(this.fieldX * rad, this.fieldX * radIn, 8, 8, 3.1415926 * 0.5);
		this.positionGeometryAndAdd(geometry, material, x, y, -0.5, -0.5);
		this.positionGeometryAndAdd(geometry, material, x, y, 0.5, -0.5, 3.1415926 * 0.5);
		this.positionGeometryAndAdd(geometry, material, x, y, 0.5, 0.5, 3.1415926);
		this.positionGeometryAndAdd(geometry, material, x, y, -0.5, 0.5, 3.1415926 * 1.5);
	}
};

Level.prototype.createFloor = function (x, y){
	var geometry = new THREE.PlaneGeometry(this.fieldX, this.fieldY);
	var material = this.materialFloor;
	var mesh = new THREE.Mesh( geometry, material );
	this.positionMeshAndAdd(mesh, x, y);
	mesh.position.z = 0;
};

Level.prototype.createDot = function (x, y){
	this.dots.push(new Dot(x, y, this));
};

Level.prototype.setPacPos = function(pos){
	for (i=this.dotsCount - 1; i >= 0; --i){
		if (this.dots[i].checkForHit(pos)){
			this.dots[i].eaten(this.scene, this.renderer);
			this.dots.splice(i, 1);
			this.dotsCount = this.dots.length;
			++this.dotsEaten;
			return 1;
		}

	}
	return 0;
}

Level.prototype.updateDots = function(time){
	for (i=this.dotsCount - 1; i >= 0; --i){
		this.dots[i].update(time);
	}
}

Level.prototype.update = function(time){
	this.updateDots(time);
}

