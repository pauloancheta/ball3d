$(document).ready(function(){
  var world, scene, renderer, camera, // three and cannon
      sphere, sphereBody, sphereShape,
      ground, groundBody, groundShape,
      box, boxBody, boxShape;

  // THREE AND CANNON CONSTANTS
  var TIME_STEP           = 1/60,
      GRID_HELPER_SIZE    = 40,
      GRID_HELPER_STEP    = 2,
      FLOOR_MASS          = 0,
      MASS                = 1,
      FLOOR_LENGTH        = 50,
      CANNON_FLOOR_LENGTH = (FLOOR_LENGTH / 13) * 6,
      BOX_SIZE            = 10,
      CANNON_BOX_SIZE     = (BOX_SIZE / 13) * 6,
      xCount              = 1.0,
      yCount              = 0.0,
      zCount              = 0.0,
      planeVector = new CANNON.Vec3( xCount, yCount, zCount);

  // COLLISIONS - must be powers of two
  var GROUP1 = 1;
  var GROUP2 = 2;
  var GROUP3 = 4;

  initThree();
  initCannon();
  animate();

  function initCannon() {
    world                   = new CANNON.World();
    world.broadphase        = new CANNON.NaiveBroadphase();
    groundShape             = new CANNON.Box(new CANNON.Vec3(CANNON_FLOOR_LENGTH, CANNON_FLOOR_LENGTH, 1));
    sphereShape             = new CANNON.Sphere(5);
    boxShape                = new CANNON.Box( new CANNON.Vec3( CANNON_BOX_SIZE,CANNON_BOX_SIZE,CANNON_BOX_SIZE ) );

    sphereBody              = new CANNON.Body({
                                    mass: MASS,
                                    collisionFilterGroup: GROUP1, // Put the sphere in group 1
                                    collisionFilterMask: GROUP2, // It can only collide with group 2 and 3
                                  });
    groundBody              = new CANNON.Body({
                                    mass: FLOOR_MASS,
                                    collisionFilterGroup: GROUP2, // Put the ground in group 2
                                    collisionFilterMask:  GROUP1 | GROUP3 // It can only collide with group 1 (the sphere)
                                  });
    boxBody                 = new CANNON.Body({
                                    mass: FLOOR_MASS,
                                    collisionFilterGroup: GROUP3, // Put the box in group 3
                                    collisionFilterMask:  GROUP2 // It can only collide with group 2 (the ground)
                                  })

    world.solver.iterations = 10;
    world.gravity.set(0,-40,0);
    world.defaultContactMaterial.contactEquationStiffness = 1e9;
    world.defaultContactMaterial.contactEquationRegularizationTime = 4;

    sphereBody.addShape(sphereShape);
    sphereBody.position.set(0,20,0)
    sphereBody.linearDamping = 0.5;
    world.addBody(sphereBody);
    
    groundBody.addShape(groundShape);
    groundBody.quaternion.setFromAxisAngle( planeVector, -Math.PI/2 );
    world.addBody(groundBody);

    boxBody.addShape(boxShape);
    boxBody.position.set(10,10,10);
    boxBody.quaternion.setFromAxisAngle( planeVector, -Math.PI/2 );
    world.addBody(boxBody);

    var ballContact         = new CANNON.ContactMaterial( groundBody, sphereBody, { friction: 0.0, restitution: 100 } );
    
    world.addContactMaterial(ballContact);

      var collision = new CANNON.ArrayCollisionMatrix()
      console.log( collision.get);
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

    camera.position.set(10,25,40); // camera position to x , y , z
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
    // scene.add( gridHelper );

    // OBJECTS
    var icoGeometry = new THREE.SphereGeometry(5),
        icoMaterial = new THREE.MeshLambertMaterial( {color: 0xff0000} );
    sphere          = new THREE.Mesh( icoGeometry, icoMaterial );
    sphere.castShadow = true;
  
    var groundGeometry = new THREE.BoxGeometry(FLOOR_LENGTH , FLOOR_LENGTH, 1),
        groundMaterial = new THREE.MeshLambertMaterial( {color: 0xcccccc} );
    ground             = new THREE.Mesh( groundGeometry, groundMaterial );
    ground.receiveShadow = true;

    var boxGeometry = new THREE.BoxGeometry( BOX_SIZE, BOX_SIZE, BOX_SIZE ),
        boxMaterial = new THREE.MeshBasicMaterial( { color: 0x0BFF03, opacity: 0.5, transparent: true } );
    box = new THREE.Mesh( boxGeometry, boxMaterial );
    box.castShadow = true;

   
    // ADD OBJECTS TO SCENE
    scene.add( sphere );
    scene.add( ground );
    scene.add( box );
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
      sphere.position.copy(sphereBody.position);
      sphere.quaternion.copy(sphereBody.quaternion);

      ground.position.copy(groundBody.position);
      ground.quaternion.copy(groundBody.quaternion);

      box.position.copy(boxBody.position);
      box.quaternion.copy(boxBody.quaternion);
  }
  function render() {
      renderer.render( scene, camera );
  }

  // PLANE CONTROLS
  
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
    boxBody.quaternion.setFromAxisAngle(planeVector,-Math.PI/2 );
  })

});