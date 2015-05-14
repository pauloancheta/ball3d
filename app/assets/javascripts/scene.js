$(document).ready(function(){
  var world, timeStep=1/60, scene, renderer, camera,
      icosahedronBody, sphereShape, groundShape,
      ground, groundBody, groundShape;
  // CONSTANTS
  var GRID_HELPER_SIZE = 40,
      GRID_HELPER_STEP = 2,
      FLOOR_MASS       = 0,
      MASS             = 5;

  initThree();
  initCannon();
  animate();

  function initCannon() {
    world                   = new CANNON.World();
    world.broadphase        = new CANNON.NaiveBroadphase();
    sphereShape             = new CANNON.Sphere(1);
    groundShape             = new CANNON.Plane();

    icosahedronBody         = new CANNON.Body({
                                    mass: MASS,
                                  });
    groundBody              = new CANNON.Body({
                                    mass: FLOOR_MASS, // mass == 0 makes the body static
                                  });

    world.solver.iterations = 10;
    world.gravity.set(0,-9.8,0);
    world.defaultContactMaterial.contactEquationStiffness = 1e9;
    world.defaultContactMaterial.contactEquationRegularizationTime = 4;

    icosahedronBody.addShape(sphereShape);
    icosahedronBody.position.set(0,50,0)
    icosahedronBody.linearDamping     = 0.5;
    world.addBody(icosahedronBody);
    
    groundBody.addShape(groundShape);
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
    world.addBody(groundBody);

    var ballContact         = new CANNON.ContactMaterial( groundBody, icosahedronBody, 0.0, 0.0);
    
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
    camera.position.set(1,25,100); // camera position to x , y , z
    camera.lookAt( new THREE.Vector3() )
    directionalLight.position.set( 1, 0.75, 0.5 ).normalize();

    // INITIAL CANVAS
    scene.add( directionalLight );  
    scene.add( light );
    scene.add( camera );
    scene.add( gridHelper );

    // MATERIALS
    var icoGeometry = new THREE.IcosahedronGeometry(1, 1),
        icoMaterial = new THREE.MeshLambertMaterial( {color: 0xff0000} );
    icosahedron     = new THREE.Mesh( icoGeometry, icoMaterial );
  
    var groundGeometry = new THREE.BoxGeometry(100 , 100, 0),
        groundMaterial = new THREE.MeshLambertMaterial( {color: 0xcccccc} );
    ground             = new THREE.Mesh( groundGeometry, groundMaterial );
    ground.receiveShadow = true;
   
    // ADD OBJECTS TO SCENE
    scene.add( icosahedron );
    scene.add( ground );
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
      icosahedron.position.copy(icosahedronBody.position);
      icosahedron.quaternion.copy(icosahedronBody.quaternion);

      ground.position.copy(groundBody.position);
      ground.quaternion.copy(groundBody.quaternion);
  }
  function render() {
      renderer.render( scene, camera );
  }
   
      
});