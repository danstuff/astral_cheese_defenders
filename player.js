import * as THREE from './vendor/three.module.js';

import { GravNode, GravField } from './gravField.js';

const UP = new THREE.Vector3(0, 1, 0);

class Player {
    constructor(controls, gravField, position) {
        this.velocity = new THREE.Vector3();
        this.heading = new THREE.Vector3();

        this.currentG = new THREE.Vector3();

        this.targetQuat = new THREE.Quaternion();
        this.currentQuat = new THREE.Quaternion();
            
        this.height = 0.5;
        this.friction = 0.25;
        this.acceleration = 400.0;
        this.gLerpFactor = 0.5;
        this.turnThreshold = 2;
        this.turnSpeed = 1;

        this.onSurface = false;

        this.camera = new THREE.PerspectiveCamera(
            75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.copy(position);
    
        this.calculateHeading = function() {
            // get a heading vec based on the input
            this.heading.set(
                Number(controls.state.moveRight) - Number(controls.state.moveLeft),
                Number(controls.state.moveUp) - Number(controls.state.moveDown),
                Number(controls.state.moveBackward) - Number(controls.state.moveForward)
            );

            this.heading.normalize();
        }

        this.moveLinear = function(delta) {
            //get a movement direction vector based on input
            this.heading.applyQuaternion(this.camera.quaternion);

            // add the direction to the velocity
            let h = this.heading.clone();
            this.velocity.add(h.multiplyScalar(this.acceleration * delta));
        }

        this.movePolar = function(delta) {
            if(this.onSurface && this.heading.y > 0) {
                this.onSurface = false;
            }
        }

        this.gravitate = function(delta) {
            // calculate gravitational forces
            if(gravField.inside(this.camera.position)) {
                let new_g = gravField.vectors
                    [Math.floor(this.camera.position.x)]
                    [Math.floor(this.camera.position.y)]
                    [Math.floor(this.camera.position.z)].clone();

                this.currentG.lerp(new_g, this.gLerpFactor);
            }

            // add gravity force to velocity
            let g = this.currentG.clone();
            g.multiplyScalar(delta);

            this.velocity.add(g);

            // find the nearest object
            let result = gravField.nearest(this.camera.position);

            // recalculate the up vector if you're close to that object
            if (result.distance <
                result.radius + this.height + this.turnThreshold) {

                // get the direction to the nearest object, and reverse it
                this.camera.up = result.direction.clone();
                this.camera.up.multiplyScalar(-1);
                
                // orient the target quaternion
                this.targetQuat.setFromUnitVectors(UP, this.camera.up);
            }

        }

        this.collide = function(delta) {
            // negate collisions with objects
            let vel  = this.velocity.clone();
            vel.multiplyScalar(delta);

            let next_pos = this.camera.position.clone();
            next_pos.add(vel);
            
            let result = gravField.nearest(next_pos);
            
            if(result.distance <= result.radius + this.height) {
                vel.set(0,0,0);
                this.onSurface = true;
            }

            return vel;
        }

        this.animate = function(delta) {
            // apply friction
            this.velocity.lerp(new THREE.Vector3(0,0,0), this.friction);

            this.calculateHeading();
            
            if(this.onSurface == true) {
                this.movePolar(delta);

            } else {
                this.moveLinear(delta);
                this.gravitate(delta);

                // add velocity to position
                let v = this.collide(delta);
                this.camera.position.add(v);
            }

            // adjust camera orientation
            this.currentQuat.rotateTowards(
                this.targetQuat, this.turnSpeed * delta);

            this.camera.quaternion.copy(this.currentQuat);
            this.camera.quaternion.multiply(controls.quaternion);
        }
    }
}

export { Player };
