function rotateAroundAxis(vector, angle, axis) {
  var out = Array(3);

  var s = Math.sin(angle);
  var c = Math.cos(angle);
  var cinv = 1 - Math.cos(angle);

  out[0] = ((c + cinv*axis.x**2) * vector.x) + ((cinv*axis.x*axis.y - s*axis.z) * vector.y) + ((cinv*axis.x*axis.z + s*axis.y) * vector.z);
  out[1] = ((cinv*axis.x*axis.y + s*axis.z) * vector.x) + ((c + cinv*axis.y**2) * vector.y) + ((cinv*axis.y*axis.z - s*axis.x) * vector.z);
  out[2] = ((cinv*axis.x*axis.z - s*axis.y) * vector.x) + ((cinv*axis.y*axis.z + s*axis.x) * vector.y) + ((c + cinv*axis.z**2) * vector.z);

  return out;
}

function toVec(array) {
  return new THREE.Vector3(array[0], array[1], array[2]);
}

//
// Curve Class
//
class Curve {
  constructor(start, angle, increment, num_points, color) {
      this.start = start;
      this.angle = angle;
      var radius = 0;
      var increment = increment;
      this.num_points = num_points;

      this.geometry = new THREE.BufferGeometry();
      var positions = new Float32Array( num_points * 3 );
      this.geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );

      for (let i = 0; i < this.num_points * 6; i+=3) {
          var angle = this.angle * (i / 3 ) / this.num_points;

          this.geometry.attributes.position.needsUpdate = true;
          this.geometry.attributes.position.array[ i ] = this.start.x + Math.cos(angle) * radius;
          this.geometry.attributes.position.array[ i + 1 ] = this.start.y + Math.sin(angle) * radius;
          this.geometry.attributes.position.array[ i + 2 ] = 0;

          radius += increment;
      }
      
      this.line = new MeshLine()
      this.line.setGeometry(this.geometry);
      this.material = new MeshLineMaterial( {
          useMap: false,
          color: new THREE.Color( color ),
          opacity: 1,
          resolution: resolution,
          sizeAttenuation: false,
          lineWidth: 10,
      });

      this.curve = new THREE.Mesh( this.line.geometry,  this.material );
      this.curve.geometry.setDrawRange(0, 0);
      scene.add( this.curve );
      
      this.j = 0;
  }

  draw() {
      this.curve.rotateZ(0.0002 * 2 * Math.PI);
      if (this.j < this.num_points * 6) {
          this.curve.geometry.setDrawRange( 0, this.j );
          this.j += 3;
      }

  }

  remove() {
      this.geometry.dispose();
      this.material.dispose();
      scene.remove( this.curve );
  }
}

// 
// particle 2D class
//
class Particle_2D {
  constructor(colors, start, increment, radius, points) {
      this.lines = []
      for (let i = 0; i < colors.length; i++) {
          this.lines.push(new Curve(start, (4 + i * increment) * Math.PI, radius, points, colors[i]));
      }
  }

  draw() {
      this.lines.forEach((line) => {
          line.draw();
      });
  }

  remove() {
      this.lines.forEach((line) => {
          line.remove();
      });
  }
}


// 
// Drawing Particle
//
class DrawingParticle {
  constructor(start, color, num_points) {
      this.geometry = new THREE.BufferGeometry();
      var positions = new Float32Array( num_points * 3 );
      this.geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
      
      this.line = new MeshLine()
      this.line.setGeometry(this.geometry);
      this.material_1 = new MeshLineMaterial( {
          useMap: false,
          color: new THREE.Color( color ),
          opacity: 1.0,
          transparent: true,
          resolution: resolution,
          sizeAttenuation: false,
          lineWidth: 5,
      });

      this.curve = new THREE.Mesh( this.line.geometry, this.material_1 );
      this.curve.geometry.setDrawRange(0, 0);
      scene.add( this.curve );

      this.geometry_sphere = new THREE.SphereBufferGeometry(4, 64);
      this.material_2 = new THREE.MeshBasicMaterial({ color: color})
      this.sphere = new THREE.Mesh(this.geometry_sphere, this.material_2);
      this.start_pos = new THREE.Vector3(start[0], start[1], start[2]); // unused at the moment
      this.sphere.position.set(start[0], start[1], start[2]);
      scene.add( this.sphere );

      this.j = 0;
      this.angle = 0;
      this.axis = new THREE.Vector3(0,0,1);
  }

  draw() {
      var pos = rotateAroundAxis(this.sphere.position, this.angle, this.axis);
      this.sphere.position.set(pos[0], pos[1], pos[2]);

      this.geometry.attributes.position.needsUpdate = true;
      this.geometry.attributes.position.array[ this.j ] = this.sphere.position.x;
      this.geometry.attributes.position.array[ this.j + 1 ] = this.sphere.position.y;
      this.geometry.attributes.position.array[ this.j + 2 ] = this.sphere.position.z;

      this.line.setGeometry(this.geometry);
      this.curve.geometry = this.line.geometry;

      this.curve.geometry.setDrawRange( 0, this.j );
      this.j += 3;

      this.angle += 0.005 * 2 * Math.PI;
      this.axis.applyAxisAngle(new THREE.Vector3(0,1,0), this.angle / 100);
  }

  remove() {
      this.geometry.dispose();
      this.material_1.dispose();
      scene.remove( this.curve );
      
      this.geometry_sphere.dispose();
      this.material_2.dispose();
      scene.remove( this.sphere );
  }
}

class Particles_scattered {
  constructor(data, color) {
      this.data = data
      this.numpoints = this.data[0].length;

      // point geometry
      this.geometry = new THREE.BufferGeometry();
      this.geometry.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array( this.numpoints * 2 ) , 2 ) );
      this.points_material = new THREE.PointsMaterial({ color: color, size: 2})
      this.points = new THREE.Points(this.geometry, this.points_material);
      scene.add(this.points);

      // lines geometry
      this.lines_geom = [];
      this.lines = [];
      this.line_material = new THREE.LineBasicMaterial( { color: color } );
      for (let i = 0; i < this.numpoints; i++) {
          let geom = new THREE.BufferGeometry();
          geom.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array( this.data.length * 2 ), 2 ) );
          geom.setDrawRange(0, 0);
          this.lines_geom.push(geom)
          var line = new THREE.Line(geom, this.line_material);
          this.lines.push(line);
          scene.add(line);
      }

      this.lines_start = new Array(this.numpoints).fill(0);

      this.j = 0
      this.l = 0
      this.k = 0
  }

  // later on, start with normal lines, add as well to follow the trajectories - 2D at the moment
  draw() {
      if (this.j < this.data.length / 2) {
          
          this.geometry.attributes.position.needsUpdate = true;
          for (let i = 0; i < this.lines_geom.length; i++) {
              this.lines_geom[i].attributes.position.needsUpdate = true;
          }

          for (let i = 0; i < this.numpoints * 2; i+=2) {
              this.geometry.attributes.position.array[ i ] = this.data[this.j][i / 2][0];
              this.geometry.attributes.position.array[ i + 1 ] = this.data[this.j][i / 2][1];
              // this.geometry.attributes.position.array[ i + 2 ] = this.data[this.j][i / 3][2]

              this.lines_geom[i / 2].attributes.position.array[ this.k ] = this.data[this.j][i / 2][0];
              this.lines_geom[i / 2].attributes.position.array[ this.k + 1 ] = this.data[this.j][i / 2][1];

              if (this.data[this.j][i / 2][0] > 29 || this.data[this.j][i / 2][1] > 29 || this.data[this.j][i / 2][0] < 11 || this.data[this.j][i / 2][1] < 11) {
                  this.lines_start[i / 2] = this.k / 2;
              }
              this.lines_geom[i / 2].setDrawRange(this.lines_start[i / 2], this.k / 2 - this.lines_start[i / 2]);
          }
  
          this.j += 1;
          this.k += 2
      }
  }

  isReady() {
      if (this.j == this.data.length / 2) {
          return true;
      } else {
          return false;
      }
  }

  remove() {
      this.geometry.dispose();
      this.points_material.dispose();
      scene.remove(this.points);

      this.lines_geom.forEach((geometry) => {
          geometry.dispose();
      })
      this.line_material.dispose();
      this.lines.forEach((line) => {
          scene.remove(line);
      })
  }
}

class Molecule {
  constructor () {
      this.c_material = new THREE.MeshBasicMaterial({ color: 0xd3d3d3});
      this.h_material = new THREE.MeshBasicMaterial({ color: 0x1c98c7});
      this.c_geometry = new THREE.SphereBufferGeometry(8, 128);
      this.h_geometry = new THREE.SphereBufferGeometry(4, 128);

      this.meshes = []

      this.origin = new THREE.Vector3(-50,0,0);
      
      var mesh_c = new THREE.Mesh(this.c_geometry, this.c_material);
      scene.add(mesh_c);
      mesh_c.position.set(this.origin.x, this.origin.y, this.origin.z);
      this.meshes.push(mesh_c);

      var mesh_h = new THREE.Mesh(this.h_geometry, this.h_material);

      this.r = 1.111 * 20;
      this.angle = (109/180)*Math.PI;

      this.bonds = [];

      var positions = this.get_positions();

      this.draw_bonds(positions);

      for (let i = 0; i < 4; i++) {
          var mesh = mesh_h.clone();
          scene.add(mesh);
          this.meshes.push(mesh);
          mesh.position.set(positions[i][0], positions[i][1], positions[i][2]);
      }
  }

  draw_bonds(positions) {
      positions.forEach((pos) => {
          this.bonds.push(new Line(this.origin, toVec(pos), 0x1c98c7, 100, 20));
      })
  }

  remove_bonds() {
      this.bonds.forEach((bond) => {
          bond.remove();
      })
  }

  get_positions() {
      var r = this.r;
      var angle = this.angle;
      var pos = [];
      pos.push([r * Math.cos(0) * Math.sin(0), r * Math.sin(0) * Math.sin(0), r * Math.cos(0)]);
      pos.push([r * Math.cos(0) * Math.sin(angle), r * Math.sin(0) * Math.sin(angle), r * Math.cos(angle)]);
      pos.push([r * Math.cos(2 / 3 * Math.PI) * Math.sin(angle), r * Math.sin(2 / 3 * Math.PI) * Math.sin(angle), r * Math.cos(angle)]);
      pos.push([r * Math.cos(4 / 3 * Math.PI) * Math.sin(angle), r * Math.sin(4 / 3 * Math.PI) * Math.sin(angle), r * Math.cos(angle)]);
      pos.forEach((pos) => {
          pos[0] += this.origin.x;
          pos[1] += this.origin.y;
          pos[2] += this.origin.z;
      })
      return pos;
  }

  draw(mouseX, mouseY) {
      this.r = mouseX / width * 2 * 20;
      this.angle = mouseY / height * Math.PI;

      this.remove_bonds();
      var positions = this.get_positions();
      this.draw_bonds(positions);

      for (let i = 0; i < 4; i++) {
          // off-set of 1 because of the carbon atom at 0
          this.meshes[i + 1].position.set(positions[i][0], positions[i][1], positions[i][2]);
      }
  }

  remove() {
      this.c_geometry.dispose();
      this.h_geometry.dispose();
      this.c_material.dispose();
      this.h_material.dispose();
      this.meshes.forEach((mesh) => {
          scene.remove(mesh);
      })
      this.remove_bonds();
  }
}

class Plot_3D {
  constructor(x_set, y_set, z_function) {
      this.xnum = x_set[2];
      this.ynum = y_set[2];
      this.material = new THREE.MeshBasicMaterial({ color: 0xd3d3d3 });
      this.geometry = new THREE.SphereBufferGeometry(1, 64);
      this.color = new THREE.Color(255, 0, 0);
      this.meshes = [];
      this.colors = [];
      this.axis = [];

      this.origin = new THREE.Vector3(50, -10, 0)

      var z_max = 441.44;
      var z_min = -67.50;

      var x_incr = (x_set[1] - x_set[0]) / x_set[2];
      var y_incr = (y_set[1] - y_set[0]) / y_set[2];
      var k = 0;
      for (let i = x_set[0]; i < x_set[1]; i+=x_incr) {
          this.meshes.push([]);
          this.colors.push([]);
          var l = 0;
          for (let j = y_set[0]; j < y_set[1]; j+=y_incr) {
              var g = this.geometry.clone();
              var m = this.material.clone();

              let value = (z_function(i, j) - z_min)/(z_max-z_min)
              var color = new THREE.Color(0, 0, value);
              m.color.set(color);
              this.colors[k].push(color);

              var point = new THREE.Mesh(g, m);
              scene.add( point );
              this.meshes[k].push(point);
              point.position.set(k + this.origin.x, l + this.origin.y, (z_function(i, j) - z_min)/(z_max-z_min) * 50 + this.origin.z);

              l += 1;
          }
          k += 1;
      }

      // draw the axis
      this.axis.push(new Line(this.origin, new THREE.Vector3().addVectors(this.origin, new THREE.Vector3(50, 0, 0)), 0xd3d3d3, 100, 20));
      this.axis.push(new Line(this.origin, new THREE.Vector3().addVectors(this.origin, new THREE.Vector3(0, 50, 0)), 0xd3d3d3, 100, 20));
      this.axis.push(new Line(this.origin, new THREE.Vector3().addVectors(this.origin, new THREE.Vector3(0, 0, 50)), 0xd3d3d3, 100, 20));

      this.x = 0;
      this.y = 0;
      this.num = 0;
  }

  draw(mouseX, mouseY) {

      for (let i = this.x - this.num; i < this.x + this.num; i++) {
          for (let j = this.y - this.num; j < this.y + this.num; j++) {
              this.meshes[i][j].material.color.set(this.colors[i][j]);
          }
      }

      this.x = Math.round(mouseX / width * this.xnum);
      this.y = Math.round(mouseY / height * this.ynum);

      if (this.x == 0 || this.y == 0 || this.x == this.xnum ||  this.y == this.ynum) {
          this.num = 0;
      } else {
          this.num = 1;
      }
      
      for (let i = this.x - this.num; i < this.x + this.num; i++) {
          for (let j = this.y - this.num; j < this.y + this.num; j++) {
              this.meshes[i][j].material.color.set(this.color);
          }
      }
  }

  remove() {
      this.geometry.dispose();
      this.material.dispose();
      this.meshes.forEach((array) => {
          array.forEach((mesh) => {
              scene.remove(mesh);
          })
      })
      this.axis.forEach((axis) => {
          axis.remove();
      })
  }
}

class Line {
  constructor(point1, point2, color, num_points, width) {
      this.line_geom = new THREE.BufferGeometry();
      this.line_geom.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array( num_points * 3 ), 3 ) );
  
      let line_mesh = new MeshLine();
      this.line_mat = new MeshLineMaterial( {
          useMap: false,
          color: new THREE.Color( color ),
          opacity: 1.0,
          transparent: true,
          resolution: resolution,
          sizeAttenuation: false,
          lineWidth: width,
      });
  
      var lenx = point2.x - point1.x;
      var leny = point2.y - point1.y;
      var lenz = point2.z - point1.z;
  
      for (let i = 0; i < num_points * 3; i+=3) {
          this.line_geom.attributes.position.array[ i ] = point1.x + (i / 3) * lenx / num_points;
          this.line_geom.attributes.position.array[ i + 1 ] = point1.y + (i / 3) * leny / num_points;
          this.line_geom.attributes.position.array[ i + 2 ] = point1.z + (i / 3) * lenz / num_points;
      }
  
      line_mesh.setGeometry(this.line_geom);
      this.curve = new THREE.Mesh(line_mesh.geometry, this.line_mat);
      scene.add(this.curve);
  }

  remove() {
      this.line_geom.dispose();
      this.line_mat.dispose();
      scene.remove( this.curve );
  }
}

class Pendulum {
  constructor(data, index, color_sphere, color_line) {
      this.num_points = 20;
      this.data = data;
      this.index = index;
      this.color_line = color_line;

      this.lines = [];

      var i_pos_1 = this.data[0][index][0];
      var i_pos_2 = this.data[0][index][1];

      this.sphere_geom = new THREE.SphereBufferGeometry(0.8, 64);
      this.sphere_mat = new THREE.MeshBasicMaterial({ color: color_sphere});
      this.sphere_mesh_1 = new THREE.Mesh(this.sphere_geom, this.sphere_mat);
      this.sphere_mesh_2 = this.sphere_mesh_1.clone();

      scene.add(this.sphere_mesh_1);
      this.sphere_mesh_1.position.set(i_pos_1[0], i_pos_1[1], i_pos_1[2]);
      scene.add(this.sphere_mesh_2);
      this.sphere_mesh_2.position.set(i_pos_2[0], i_pos_2[1], i_pos_2[2]);

      this.lines.push(new Line(this.sphere_mesh_1.position, this.sphere_mesh_2.position, color_line, this.num_points, 3));

      this.timestep = 0;
  }

  draw() {
      if (this.timestep < this.data.length) {
          this.timestep += 1;
  
          var pos_1 = this.data[this.timestep][this.index][0];
          var pos_2 = this.data[this.timestep][this.index][1];
  
          this.sphere_mesh_1.position.set(pos_1[0], pos_1[1], pos_1[2]);
          this.sphere_mesh_2.position.set(pos_2[0], pos_2[1], pos_2[2]);
  
          this.lines.push(new Line(this.sphere_mesh_1.position, this.sphere_mesh_2.position, this.color_line, this.num_points, 3));

          if (this.lines.length > 100) {
              this.lines[0].remove();
              this.lines.splice(0, 1);
          }
      }
  }

  remove() {
      this.sphere_geom.dispose();
      this.sphere_mat.dispose();
      scene.remove(this.sphere_mesh_1);
      scene.remove(this.sphere_mesh_2);
  }

  isReady() {
      return this.timestep == (this.data.length - 2) ? true : false;
  }
}

class surface {
  constructor(pos, dim, color) {
      this.geometry = new THREE.SphereBufferGeometry(1, 64);
      this.material = new THREE.MeshBasicMaterial({color: color});
      this.mesh = new THREE.Mesh(this.geometry, this.material);

      this.meshes = [];

      for (let i = 0; i < dim[0]; i++) {
          for (let j = 0; j < dim[1]; j++) {
              var mesh = this.mesh.clone();
              scene.add(mesh);
              this.meshes.push(mesh);
              mesh.position.set(pos[0] + i * 2, pos[1] + j * 2, pos[2]);
          }
      }
  }

  draw() {

  }

  remove() {
      this.geometry.dispose();
      this.material.dispose();
      this.meshes.forEach((mesh) => {
          scene.remove(mesh);
      })
  }
}
