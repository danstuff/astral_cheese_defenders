// Adapted from the three.js PointerLockControls example

import {
	Euler,
	EventDispatcher,
	Vector3, 
    Quaternion
} from './vendor/three.module.js';

const _euler = new Euler( 0, 0, 0, 'YXZ' );
const _vector = new Vector3();

const _changeEvent = { type: 'change' };
const _lockEvent = { type: 'lock' };
const _unlockEvent = { type: 'unlock' };

const _PI_2 = Math.PI / 2;

class Controls extends EventDispatcher {

	constructor( domElement ) {
		super();

		this.domElement = document.body;
		this.isLocked = false;

		// Set to constrain the pitch of the camera
		// Range is 0 to Math.PI radians
		this.minPolarAngle = 0.01; // radians
		this.maxPolarAngle = Math.PI - 0.01; // radians

		this.pointerSpeed = 1.0;

        this.quaternion = new Quaternion();

        this.state = {
            moveForward : false,
            moveBackward : false,
            moveLeft : false,
            moveRight : false,
            moveUp : false,
            moveDown : false,

            clickLeft : false,
            clickRight : false, 
        };

		const scope = this;

        const blocker = document.getElementById('blocker');
        const instructions = document.getElementById('instructions');

        blocker.addEventListener('click', function () {
            scope.lock();
        });

        instructions.addEventListener('click', function () {
            scope.lock();
        });

        scope.addEventListener('lock', function () {
            instructions.style.display = 'none';
            blocker.style.display = 'none';
        });

        scope.addEventListener('unlock', function () {
            blocker.style.display = 'block';
            instructions.style.display = '';
        });

        const onKeyDown = function (event) {
            switch (event.code) {
                case 'KeyW': scope.state.moveForward = true; break;
                case 'KeyA': scope.state.moveLeft = true; break;
                case 'KeyS': scope.state.moveBackward = true; break;
                case 'KeyD': scope.state.moveRight = true; break;
                case 'Space': scope.state.moveUp = true; break;
                case 'ShiftLeft': scope.state.moveDown = true; break;
            }
        };

        const onKeyUp = function (event) {
            switch (event.code) {
                case 'KeyW': scope.state.moveForward = false; break;
                case 'KeyA': scope.state.moveLeft = false; break;
                case 'KeyS': scope.state.moveBackward = false; break;
                case 'KeyD': scope.state.moveRight = false; break;
                case 'Space': scope.state.moveUp = false; break;
                case 'ShiftLeft': scope.state.moveDown = false; break;		
            }
        };

        const onMouseDown = function (event) {
            switch (event.button) {
                case 0: scope.state.clickLeft = true; break;
                case 2: scope.state.clickRight = true; break;
            }
        }

        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);

        document.addEventListener('mousedown', onMouseDown);

		function onMouseMove( event ) {

			if ( scope.isLocked === false ) return;

			const movementX =
                event.movementX || event.mozMovementX || event.webkitMovementX || 0;
			const movementY =
                event.movementY || event.mozMovementY || event.webkitMovementY || 0;

			_euler.setFromQuaternion( scope.quaternion );

			_euler.y -= movementX * 0.002 * scope.pointerSpeed;
			_euler.x -= movementY * 0.002 * scope.pointerSpeed;

			_euler.x = 
                Math.max( _PI_2 - scope.maxPolarAngle,
                    Math.min( _PI_2 - scope.minPolarAngle, _euler.x ) );

			scope.quaternion.setFromEuler( _euler );

			scope.dispatchEvent( _changeEvent );

		}

		function onPointerlockChange() {

			if ( scope.domElement.ownerDocument.pointerLockElement ===
                scope.domElement ) {

				scope.dispatchEvent( _lockEvent );

				scope.isLocked = true;

			} else {

				scope.dispatchEvent( _unlockEvent );

				scope.isLocked = false;

			}

		}

		function onPointerlockError() {
			console.error( 'THREE.PointerLockControls: Unable to use Pointer Lock API' );
		}

		this.connect = function () {

			scope.domElement.ownerDocument.addEventListener( 'mousemove', onMouseMove );
			scope.domElement.ownerDocument.addEventListener( 'pointerlockchange', onPointerlockChange );
			scope.domElement.ownerDocument.addEventListener( 'pointerlockerror', onPointerlockError );

		};

		this.disconnect = function () {

			scope.domElement.ownerDocument.removeEventListener( 'mousemove', onMouseMove );
			scope.domElement.ownerDocument.removeEventListener( 'pointerlockchange', onPointerlockChange );
			scope.domElement.ownerDocument.removeEventListener( 'pointerlockerror', onPointerlockError );

		};

		this.dispose = function () {

			this.disconnect();

		};


		this.lock = function () {

			this.domElement.requestPointerLock();

		};

		this.unlock = function () {

			scope.domElement.ownerDocument.exitPointerLock();

		};

		this.connect();

	}

}

export { Controls };
