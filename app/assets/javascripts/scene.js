$(document).ready(function(){
  var world, mass, body, shape, timeStep=1/60,
      geometry, material, icosahedron, scene, renderer, camera;
  // CONSTANTS
  var GRID_HELPER_SIZE = 40,
      GRID_HELPER_STEP = 2;

  initThree();
  initCannon();
  animate();

  function initCannon() {
    world                   = new CANNON.World();
    world.broadphase        = new CANNON.NaiveBroadphase();
    world.solver.iterations = 10;
    world.gravity.set(0,1,0);
    shape                   = new CANNON.Box(new CANNON.Vec3(1,1,1));
    mass                    = 1;
    body                    = new CANNON.Body({
                                    mass: 1
                                  });
    body.addShape(shape);
    body.angularVelocity.set(0,10,0);
    body.angularDamping     = 0.5;
    world.addBody(body);
  }
  function initThree(){
    // INITIALIZE CANVAS
    scene                 = new THREE.Scene();
    renderer              = new THREE.WebGLRenderer();
    camera                = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    var light             = new THREE.AmbientLight( 0x404040 ),
        directionalLight  = new THREE.DirectionalLight( 0xffffff ),
        gridHelper        = new THREE.GridHelper( GRID_HELPER_SIZE, GRID_HELPER_STEP );

    // RENDERERS
    renderer.setSize( window.innerWidth - 100 , window.innerHeight - 100 );
    renderer.setClearColor( 0x757575 );
    document.body.appendChild( renderer.domElement );

    // CAMERA
    camera.position.set(1,10,40); // camera position to x , y , z

    // LIGHTING
    directionalLight.position.set( 1, 0.75, 0.5 ).normalize();

    // INITIAL CANVAS
    scene.add( directionalLight );  
    scene.add( light );
    scene.add( camera );
    scene.add( gridHelper );

    // ICOSAHEDRON MATERIAL
    var icoGeometry = new THREE.IcosahedronGeometry(10, 1),
        icoMaterial = new THREE.MeshLambertMaterial( {color: 0xff0000} );
    icosahedron = new THREE.Mesh( icoGeometry, icoMaterial );
    icosahedron.position.set(0,0,0)

    // ADD OBJECTS TO SCENE
    scene.add( icosahedron );
  }    

  function animate() {
      requestAnimationFrame( animate );
      updatePhysics();
      render();
  }
  function updatePhysics() {
      // Step the physics world
      world.step(timeStep);
      // Copy coordinates from Cannon.js to Three.js
      icosahedron.position.copy(body.position);
      icosahedron.quaternion.copy(body.quaternion);
  }
  function render() {
      renderer.render( scene, camera );
  }




   
      
});