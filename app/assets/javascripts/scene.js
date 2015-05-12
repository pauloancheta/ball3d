$(document).ready(function(){
  var world, timeStep=1/60, scene, renderer, camera,
      icosahedron, icosahedronPhysics, shape,
      groundBody, groundPhysics, groundShape;
  // CONSTANTS
  var GRID_HELPER_SIZE = 40,
      GRID_HELPER_STEP = 2,
      FLOOR_MASS       = 0;
      MASS             = 5;

  initThree();
  initCannon();
  animate();

  function initCannon() {
    world                   = new CANNON.World();
    world.broadphase        = new CANNON.NaiveBroadphase();
    shape                   = new CANNON.Sphere(new CANNON.Vec3(10,10,10));
    groundShape             = new CANNON.Plane();
    icosahedronPhysics      = new CANNON.Body({
                                    mass: MASS
                                  });
    groundPhysics           = new CANNON.Body({
                                    mass: 0, // mass == 0 makes the body static
                                    material: new CANNON.Material()
                                  });
    var ballContact         = new CANNON.ContactMaterial( groundPhysics, icosahedronPhysics, 0.0, 0.0);
    
    world.solver.iterations = 10;
    world.gravity.set(0,-9.8,0);

    icosahedronPhysics.addShape(shape);
    icosahedronPhysics.position.set(0,50,0)
    icosahedronPhysics.angularVelocity.set(0,0,0);
    icosahedronPhysics.angularDamping     = 0.5;
    world.addBody(icosahedronPhysics);

    
    groundPhysics.addShape(groundShape);
    world.addBody(groundPhysics);

    ballContact.contactEquationStiffness = 3e9;
    ballContact.contactEquationRelaxation = 10;
    world.addContactMaterial(ballContact);
  }

  function initThree(){
    // INITIALIZE CANVAS
    scene                 = new THREE.Scene();
    renderer              = new THREE.WebGLRenderer();
    camera                = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    var light             = new THREE.AmbientLight( 0x404040 ),
        directionalLight  = new THREE.DirectionalLight( 0xffffff ),
        gridHelper        = new THREE.GridHelper( GRID_HELPER_SIZE, GRID_HELPER_STEP );

    renderer.setSize( window.innerWidth - 100 , window.innerHeight - 100 );
    renderer.setClearColor( 0x757575 );
    document.body.appendChild( renderer.domElement );
    camera.position.set(1,10,100); // camera position to x , y , z
    directionalLight.position.set( 1, 0.75, 0.5 ).normalize();

    // INITIAL CANVAS
    scene.add( directionalLight );  
    scene.add( light );
    scene.add( camera );
    scene.add( gridHelper );

    // MATERIALS
    var icoGeometry = new THREE.IcosahedronGeometry(10, 1),
        icoMaterial = new THREE.MeshLambertMaterial( {color: 0xff0000} );
    icosahedron     = new THREE.Mesh( icoGeometry, icoMaterial );
    icosahedron.position.set(-100,-100,-100);

    var groundGeometry = new THREE.BoxGeometry(100 , 1, 100),
        groundMaterial = new THREE.MeshLambertMaterial( {color: 0xcccccc} );
    groundBody          = new THREE.Mesh( groundGeometry, groundMaterial );
    groundBody.position.set(0,0,0);
    // ADD OBJECTS TO SCENE
    scene.add( icosahedron );
    scene.add( groundBody );
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
      icosahedron.position.copy(icosahedronPhysics.position);
      icosahedron.quaternion.copy(icosahedronPhysics.quaternion);

      groundBody.position.copy(groundPhysics.position);
      groundBody.quaternion.copy(groundPhysics.quaternion);
  }
  function render() {
      renderer.render( scene, camera );
  }
   
      
});