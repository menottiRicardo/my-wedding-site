import type { Sketch, SketchSettings } from "ssam";
import { ssam } from "ssam";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  Fn,
  vec4,
  positionLocal,
  positionWorld,
  vec2,
  vec3,
  mix,
  smoothstep,
  cameraProjectionMatrix,
  uniform,
  distance,
  texture,
  uv,
  screenUV,
  varying,
  modelViewMatrix,
  float,
  cos,
} from "three/tsl";
import {
  Color,
  Mesh,
  NodeMaterial,
  PerspectiveCamera,
  Scene,
  WebGPURenderer,
} from "three/webgpu";
import model from "../original.glb?url";
import * as THREE from "three";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { TrailCanvas } from "./trail";

const sketch: Sketch<"webgpu"> = async ({
  wrap,
  canvas,
  width,
  height,
  pixelRatio,
}) => {
  if (import.meta.hot) {
    import.meta.hot.dispose(() => wrap.dispose());
    import.meta.hot.accept(() => wrap.hotReload());
  }

  const renderer = new WebGPURenderer({ canvas, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(pixelRatio);
  renderer.setClearColor(new Color(0x333333), 1);
  await renderer.init();

  const raycaster = new THREE.Raycaster();

  const camera = new PerspectiveCamera(30, width / height, 0.1, 100);
  camera.position.set(0, 0, 15);
  camera.lookAt(0, 0, 0);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enabled = false;

  const scene = new Scene();

  // START OF THE CODE
  // ================================

  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath(
    "https://www.gstatic.com/draco/versioned/decoders/1.5.6/",
  );

  const materials = [];

  const trail = new TrailCanvas(width, height);

  // Keep the trail canvas off-DOM so no debug box appears on screen
  let canv = trail.canvas;
  canv.style.display = "none";

  let trailTexture = new THREE.Texture(trail.getTexture());
  trailTexture.flipY = false;
  trailTexture.needsUpdate = true;

  const mouse = new THREE.Vector3();
  const mouse2D = new THREE.Vector2();

  const uMouse = uniform(mouse, "vec3");

  let dummy = new THREE.Mesh(
    new THREE.PlaneGeometry(19, 19),
    new THREE.MeshBasicMaterial({ color: 0x00ff00 }),
  );
  document.addEventListener("mousemove", (e) => {
    let mouseX = (e.clientX / width) * 2 - 1;
    let mouseY = -(e.clientY / height) * 2 + 1;
    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);
    const intersects = raycaster.intersectObjects([dummy]);
    // mouse2D.set(e.clientX,e.clientY);
    if (intersects.length > 0) {
      // console.log(intersects[0].point);
      // uMouse.value.copy(intersects[0].point);
    }
  });

  const loader = new GLTFLoader();
  loader.setDRACOLoader(dracoLoader);
  loader.load(model, (gltf) => {
    const model = gltf.scene;

    gltf.scene.traverse((child) => {
      if (child instanceof Mesh) {
        let material = new NodeMaterial();
        let texture1 = child.material.map;
        let texture2 = child.material.emissiveMap;
        let uvscreen = varying(vec2(0, 0));

        const palette = Fn(() => {
          const t = float(0.5); // placeholder, will be passed differently
          const a = vec3(0.5, 0.5, 0.5);
          const b = vec3(0.5, 0.5, 0.5);
          const c = vec3(1.0, 1.0, 1.0);
          const d = vec3(0.0, 0.1, 0.2);

          return a.add(b.mul(cos(float(6.283185).mul(c.mul(t).add(d)))));
        });

        const sRGBTransferOETF = Fn(() => {
          const color = vec3(0.5); // placeholder, will be passed differently
          const a = color.pow(0.41666).mul(1.055).sub(0.055);
          const b = color.mul(12.92);
          const factor = color.lessThanEqual(0.0031308);

          const rgbResult = mix(a, b, factor);

          return rgbResult;
        });

        material.positionNode = Fn(() => {
          const pos = positionLocal;
          const ndc = cameraProjectionMatrix
            .mul(modelViewMatrix)
            .mul(vec4(pos, 1));
          uvscreen.assign(ndc.xy.div(ndc.w).add(1).div(2));
          uvscreen.y = uvscreen.y.oneMinus();

          const extrude = texture(trailTexture, uvscreen).r;

          pos.z.mulAssign(mix(0.03, 1, extrude));

          return pos;
        })();
        material.colorNode = Fn(() => {
          const dist = distance(positionWorld, uMouse);
          const tt1 = texture(texture1, uv());
          const tt2 = texture(texture2, uv());
          const extrude = texture(trailTexture, screenUV);
          let level0 = tt2.b;
          let level1 = tt2.g;
          let level2 = tt2.r;
          let level3 = tt1.b;
          let level4 = tt1.g;
          let level5 = tt1.r;
          let final = level0;
          final = mix(final, level1, smoothstep(0, 0.2, extrude));
          final = mix(final, level2, smoothstep(0.2, 0.4, extrude));
          final = mix(final, level3, smoothstep(0.4, 0.6, extrude));
          final = mix(final, level4, smoothstep(0.6, 0.8, extrude));
          final = mix(final, level5, smoothstep(0.8, 1, extrude));

          let finalCool = vec3(final);

          // return vec4(vec3(final),1);
          return vec4(vec3(final), 1);
        })();
        child.material = material;
        materials.push(material);
      }
    });
    model.position.set(0, 2, 0);
    scene.add(model);
  });

  // ================================
  wrap.render = ({ playhead }) => {
    trail.update(mouse2D);
    trailTexture.needsUpdate = true;

    let x = Math.sin(playhead * 2 * Math.PI) * 0.5;
    let y = Math.cos(playhead * 2 * Math.PI) * 0.5;
    mouse2D.set((x + 1) * 0.5 * width, (y + 1) * 0.5 * height);
    raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
    const intersects = raycaster.intersectObjects([dummy]);
    if (intersects.length > 0) {
      uMouse.value.copy(intersects[0].point);
    }

    renderer.render(scene, camera);
  };

  wrap.resize = ({ width, height }) => {
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  };

  wrap.unload = () => {
    renderer.dispose();
  };
};

const settings: SketchSettings = {
  mode: "webgpu",
  // Use fullscreen canvas managed by Ssam
  dimensions: null,
  pixelRatio: window.devicePixelRatio,
  animate: true,
  duration: 6_000,
  playFps: 60,
  exportFps: 60,
  framesFormat: ["mp4"],
};

ssam(sketch, settings);
