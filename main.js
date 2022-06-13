import * as THREE from './vendor/three.module.js';

import { Controls } from './controls.js';
import { Player } from './player.js';
import { GravNode, GravField } from './gravField.js';

let player, gravField, scene, renderer, controls;

let prevTime = performance.now();

class Main {
    constructor() {
        this.init = function() {
            scene = new THREE.Scene();
            scene.background = new THREE.Color(0x000000);

            const light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75);
            light.position.set(0.5, 1, 0.75);
            scene.add(light);

            // add gravity objects
            gravField = new GravField(100);

            let count = 0;
            while(count < 10) {
                gravField.addMass({
                        position: new THREE.Vector3(
                            Math.floor(Math.random() * 100),
                            Math.floor(Math.random() * 100),
                            Math.floor(Math.random() * 100)),

                        mass: Math.random() * 8 + 2
                }, scene);

                count++;
            }

            gravField.calculate();

            // controls and player
            controls = new Controls();

            player = new Player(controls, gravField, new THREE.Vector3(50, 50, 50));
            scene.add(player.camera);
            
            // create the renderer
            renderer = new THREE.WebGLRenderer( { antialias: true } );
            renderer.setPixelRatio( window.devicePixelRatio );
            renderer.setSize( window.innerWidth, window.innerHeight );
            document.body.appendChild( renderer.domElement );

            // listen for window resizing
            window.addEventListener( 'resize', 
                function() {
                    player.camera.aspect = window.innerWidth / window.innerHeight;
                    player.camera.updateProjectionMatrix();

                    renderer.setSize( window.innerWidth, window.innerHeight );
                } 
            );
        }


        this.animate = function animate() {
            requestAnimationFrame( animate );

            const time = performance.now();

            if (controls.isLocked === true) {

                const delta = (time - prevTime) / 1000;

                player.animate(delta);
            }

            prevTime = time;

            renderer.render(scene, player.camera);

        }
    }
}

export { Main };
