import * as THREE from './vendor/three.module.js';

// gravitational constant (for this odd universe)
const G = 20;
const massMax = 10;

const icospheres = [
    new THREE.IcosahedronGeometry(1, 1),
    new THREE.IcosahedronGeometry(1, 2),
    new THREE.IcosahedronGeometry(1, 3),
    new THREE.IcosahedronGeometry(1, 4)
];

const materials = [
    new THREE.MeshPhongMaterial({
        specular: 0xffffff, flatShading: true, color: 0xffffff
    }),
]

class GravNode {
    constructor(props) {
        this.mass = props.mass;

        if(this.mass > 0) {
            let ico_index = Math.floor((this.mass / massMax) * icospheres.length);

            this.mesh = new THREE.Mesh(icospheres[ico_index], props.material);

            this.mesh.position.copy(props.position);
            this.mesh.scale.setScalar(this.mass);

            this.mesh.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI);
        }
    }
}

class GravField {
    constructor(fieldSize) {
        this.fieldSize = fieldSize
        this.vectors = [];
        this.nodes = [];

        for(var x = 0; x < fieldSize; x++) {
            let last_row = [];

            for(var y = 0; y < fieldSize; y++) {
                let last_col = [];

                for(var z = 0; z < fieldSize; z++) {
                    last_col.push(new THREE.Vector3());
                }

                last_row.push(last_col);
            }
            this.vectors.push(last_row);
        }

        this.inside = function(pos) {
            return (
                pos.x >= 0 && pos.x < this.fieldSize &&
                pos.y >= 0 && pos.y < this.fieldSize &&
                pos.z >= 0 && pos.z < this.fieldSize
            );
        }

        this.addMass = function(props, scene) {
            let node = new GravNode(props);
            this.nodes.push(node);
            scene.add(node.mesh);
        }

        this.calculate = function() {
            for(var x = 0; x < this.fieldSize; x++) {
                for(var y = 0; y < this.fieldSize; y++) {
                    for(var z = 0; z < this.fieldSize; z++) {

                        this.vectors[x][y][z].set(0,0,0);

                        let pos = new THREE.Vector3(x, y, z);

                        for(var i = 0; i < this.nodes.length; i++) {
                            let node = this.nodes[i];

                            const delta = new THREE.Vector3();
                            delta.subVectors(node.mesh.position, pos);

                            let r = delta.length();

                            let acc = G * node.mass / (r * r);
                            if(r == 0) { acc = 0; }
                            
                            let gforce = delta.clone();
                            gforce.normalize();
                            gforce.multiplyScalar(acc);

                            this.vectors[x][y][z].add(gforce);
                        }

                    }
                }
            }
        }

        this.nearest = function(position) {
            let result = {
                radius: 0,
                distance: fieldSize * 10,
                direction: new THREE.Vector3(),
                position: new THREE.Vector3()
            }

            for(var i = 0; i < this.nodes.length; i++) {
                let node = this.nodes[i];
                let dist = node.mesh.position.distanceTo(position);
                if(dist < result.distance) {
                    result.radius = node.mass;
                    result.distance = dist;

                    result.position.copy(node.mesh.position);

                    result.direction.copy(node.mesh.position);
                    result.direction.sub(position);
                    result.direction.normalize();
                }
            }

            return result;
        }
    }
}

export { GravNode, GravField };
