$(document).ready(function(){
  // CONSTANTS
  var GRID_HELPER_SIZE = 40,
      GRID_HELPER_STEP = 2;

  // INITIALIZE CANVAS
  var scene             = new THREE.Scene(),
      camera            = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 ),
      renderer          = new THREE.WebGLRenderer(),
      light             = new THREE.AmbientLight( 0x404040 ),
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


  // MATERIALS 
  // BALL MATERIAL
  var geometry = new THREE.SphereGeometry( 5, 32, 32 ),
      material = new THREE.MeshLambertMaterial( { color: 0x00ff00 } ),
      shere = new THREE.Mesh( geometry, material );
  // ICOSAHEDRON MATERIAL
  var icoGeom = new THREE.IcosahedronGeometry(10, 1),
      icoMaterial = new THREE.MeshLambertMaterial( {color: 0xff0000} ),
      ico = new THREE.Mesh( icoGeom, icoMaterial );

  // ADD OBJECTS TO SCENE
  scene.add( ico );
  scene.add( shere );


  function render() {
    requestAnimationFrame( render );
    renderer.render( scene, camera );
  }
  render();
});