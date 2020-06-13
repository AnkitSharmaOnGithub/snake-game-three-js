// Though i admire Brad Traversy a lot. I haven't taken completer reference from the video you sent. I took additional reference from three.js site. Link :- https://threejs.org/docs/index.html#manual/en/introduction/Creating-a-scene

//Creating the scene instance
const scene = new THREE.Scene();
//Use Perspective Camera instance and pass "field of view,aspect ratio, near and far clipping plane"
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
//Creating the Renderer instnace
const renderer = new THREE.WebGLRenderer();
//Set the size by passing width & height
renderer.setSize( window.innerWidth, window.innerHeight );
//Add the rendrer element to our HTML document
document.body.appendChild( renderer.domElement );

//Create a box geometry instance
const geometry = new THREE.BoxGeometry();
//Create a MshBasicMaterial  instance and setting its color by passing color Code #0c5adb precede by 0x.
const material = new THREE.MeshBasicMaterial( { color: 0x0c5adb } );
//Create a cube
const cube = new THREE.Mesh( geometry, material );
//Add cube to the scene
scene.add(cube);

//Move camera out a bit
camera.position.z = 5;

//Animating & Renderaing the scene
function animate() {
	requestAnimationFrame( animate );
    
    cube.rotation.x += 0.01; //Set Rotation on x
    cube.rotation.y += 0.01;//Set Rotation on y
    
    renderer.render( scene, camera ); //Render it. Without this, there would be a blank screen.
}

animate();
