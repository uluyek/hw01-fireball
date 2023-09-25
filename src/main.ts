import {vec3, vec4} from 'gl-matrix';
const Stats = require('stats-js');
import * as DAT from 'dat.gui';
import Icosphere from './geometry/Icosphere';
import Square from './geometry/Square';
import Cube from './geometry/Cube';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  tesselations: 5,
  'Load Scene': loadScene, // A function pointer, essentially
  color: [255, 255, 255, 1],  // Default color as an RGB array
};

let icosphere: Icosphere;
let square: Square;
let cube: Cube;
let prevTesselations: number = 5;
let time: number = 0;
let backgroundSquare: Square;


function loadScene() {
  icosphere = new Icosphere(vec3.fromValues(0, 0, 0), 1, controls.tesselations);
  icosphere.create();
  square = new Square(vec3.fromValues(0, 0, 0));
  square.create();
  cube = new Cube(vec3.fromValues(0,0,0));
  cube.create();
  backgroundSquare = new Square(vec3.fromValues(0, 0, 0));
  backgroundSquare.create();
}


function main() {
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();
  gui.add(controls, 'tesselations', 0, 8).step(1);
  gui.add(controls, 'Load Scene');
  // this.unifColor = gl.getUniformLocation(this.prog, "u_Color");
  gui.addColor(controls, 'color').name('Cube Color').onChange((color: number[]) => {
    console.log("New color picked: ", color);
    //const normalizedColor = color.slice(0, 3).map(val => val / 255) as number[];
    //const vec4Color = new Float32Array([...normalizedColor, controls.color[3]]);  // Use alpha channel
    //lambert.setGeometryColor(vec4Color);
  });
  

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene();

  const camera = new Camera(vec3.fromValues(0, 0, 5), vec3.fromValues(0, 0, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  gl.enable(gl.DEPTH_TEST);

  const lambert = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/custom-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/custom-frag.glsl')),
    //new Shader(gl.VERTEX_SHADER, require('./shaders/lambert-vert.glsl')),
    //new Shader(gl.FRAGMENT_SHADER, require('./shaders/lambert-frag.glsl')),
  ]);

  const backgroundShaderProgram = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/background-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/background-frag.glsl')),
  ]);
  
  
  // This function will be called every frame
  function tick() {
    camera.update();
    stats.begin();
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();
    // Render background first

    backgroundShaderProgram.use();
    gl.disable(gl.DEPTH_TEST); // Disable depth test to draw background
    const hardcodedColor = vec4.fromValues(1, 0, 0, 1); // red color
    renderer.render(camera, backgroundShaderProgram, hardcodedColor, [backgroundSquare], time);

    //renderer.render(camera, backgroundShaderProgram, vec4.fromValues(1,1,1,1), [backgroundSquare], time);
    gl.enable(gl.DEPTH_TEST); // Enable depth test again for other geometries

    //backgroundShaderProgram.use(); // Activate the background shader program
    //const backgroundColor = vec4.fromValues(0, 0, 1, 1); // RGB for blue is (0, 0, 1), 1 is the alpha value.
    //renderer.render(camera, backgroundShaderProgram, backgroundColor, [backgroundSquare], time); // Render the background square
    if(controls.tesselations != prevTesselations)
    {
      prevTesselations = controls.tesselations;
      icosphere = new Icosphere(vec3.fromValues(0, 0, 0), 1, prevTesselations);
      icosphere.create();
    }
    time += 1;
     // Convert the color from [0, 255] to [0, 1] range and create a vec4
     const normalizedColor = controls.color.slice(0, 3).map(val => val / 255) as number[];
     const alpha = 1;  // or whatever your alpha value is
     const vec4Color = vec4.fromValues(normalizedColor[0], normalizedColor[1], normalizedColor[2], alpha);
     
    renderer.render(camera, lambert, vec4Color, [
      icosphere,
      //square//,
      //cube
    ], time);
    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();

  // Start the render loop
  tick();
}

main();