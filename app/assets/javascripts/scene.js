$(document).ready(function(){
  var world, scene, renderer, camera,
      icosahedron, icosahedronBody, sphereShape,
      ground, groundBody, groundShape;

  // THREE AND CANNON CONSTANTS
  var TIME_STEP           = 1/60,
      GRID_HELPER_SIZE    = 40,
      GRID_HELPER_STEP    = 2,
      FLOOR_MASS          = 0,
      MASS                = 1,
      FLOOR_LENGTH        = 125,
      CANNON_FLOOR_LENGTH = (FLOOR_LENGTH / 13) * 6;

  initThree();
  initCannon();
  animate();

  function initCannon() {
    world                   = new CANNON.World();
    world.broadphase        = new CANNON.NaiveBroadphase();
    groundShape             = new CANNON.Box(new CANNON.Vec3(CANNON_FLOOR_LENGTH, CANNON_FLOOR_LENGTH, 1));
    sphereShape             = new CANNON.Sphere(10);
    icosahedronBody         = new CANNON.Body({
                                    mass: MASS
                                  });
    groundBody              = new CANNON.Body({
                                    mass: FLOOR_MASS
                                  });
    world.solver.iterations = 10;
    world.gravity.set(0,-40,0);
    world.defaultContactMaterial.contactEquationStiffness = 1e9;
    world.defaultContactMaterial.contactEquationRegularizationTime = 4;

    icosahedronBody.addShape(sphereShape);
    icosahedronBody.position.set(0,20,0)
    icosahedronBody.linearDamping = 0.5;
    world.addBody(icosahedronBody);
    
    groundBody.addShape(groundShape);
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2 );
    world.addBody(groundBody);

    var ballContact         = new CANNON.ContactMaterial( groundBody, icosahedronBody, { friction: 0.0, restitution: 0.9 } );
    
    world.addContactMaterial(ballContact);
  }

  function initThree(){
    // INITIALIZE CANVAS
    scene                 = new THREE.Scene();
    renderer              = new THREE.WebGLRenderer();
    camera                = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    var light             = new THREE.AmbientLight( 0x404040 ),
        directionalLight  = new THREE.DirectionalLight( 0xffffff, 1 ),
        gridHelper        = new THREE.GridHelper( GRID_HELPER_SIZE, GRID_HELPER_STEP );

    renderer.setSize( window.innerWidth - 100 , window.innerHeight - 100 );
    renderer.setClearColor( 0x757575 );
    renderer.shadowMapEnabled = true;
    document.body.appendChild( renderer.domElement );

    camera.position.set(1,25,100); // camera position to x , y , z
    camera.lookAt( new THREE.Vector3() )

    // SHADOW
    directionalLight.position.set(  40, 50, 20 );
    directionalLight.target.position.set( 0, 0, 0 );
    directionalLight.castShadow         = true;
    directionalLight.shadowCameraNear   = 20;
    directionalLight.shadowCameraFar    = camera.far;
    directionalLight.shadowCameraFov    = 50;
    directionalLight.shadowMapBias      = 0.3;
    directionalLight.shadowMapDarkness  = 1;
    directionalLight.shadowMapWidth     = 1024;
    directionalLight.shadowMapHeight    = 1024;

    // INITIAL CANVAS
    scene.add( directionalLight );  
    scene.add( light );
    scene.add( camera );
    scene.add( gridHelper );

    // OBJECTS
    var icoGeometry = new THREE.IcosahedronGeometry(10, 1),
        icoMaterial = new THREE.MeshLambertMaterial( {color: 0xff0000} );
    icosahedron     = new THREE.Mesh( icoGeometry, icoMaterial );
    icosahedron.castShadow = true;
  
    var groundGeometry = new THREE.BoxGeometry(FLOOR_LENGTH , FLOOR_LENGTH, 1),
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
      world.step(TIME_STEP);
      // Copy coordinates from Cannon.js to Three.js
      icosahedron.position.copy(icosahedronBody.position);
      icosahedron.quaternion.copy(icosahedronBody.quaternion);

      ground.position.copy(groundBody.position);
      ground.quaternion.copy(groundBody.quaternion);
  }
  function render() {
      renderer.render( scene, camera );
  }

  // PLANE CONTROLS
  var xCount = 1.0,
      yCount = 0.0,
      zCount = 0.0;
  var planeVector = new CANNON.Vec3( xCount, yCount, zCount);
  $(this).on('keydown', function(e) {
    var left  = 37,
        up    = 38,
        right = 39,
        down  = 40;
    
    if(e.which === up){
      xCount += 0.01;
    }
    else if(e.which === down){
      xCount -= 0.01;
    }
    else if(e.which === left){
      yCount += 0.01;
      zCount -= 0.01;
    }
    else if(e.which === right){
      yCount -= 0.01;
      zCount += 0.01;
    }

    planeVector.set(xCount,yCount, zCount);
    groundBody.quaternion.setFromAxisAngle(planeVector,-Math.PI/2 );
  })

});