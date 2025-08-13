import type { Sketch, SketchSettings } from "ssam";
import { ssam } from "ssam";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  Fn,
  vec4,
  positionLocal,
  vec2,
  vec3,
  mix,
  smoothstep,
  cameraProjectionMatrix,
  uniform,
  texture,
  uv,
  screenUV,
  varying,
  modelViewMatrix,
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

  const isWebGPU = 'gpu' in navigator;

  const renderer: any = isWebGPU
    ? new WebGPURenderer({ canvas, antialias: true })
    : new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setSize(width, height);
  renderer.setPixelRatio(pixelRatio);
  renderer.setClearColor(new Color(0x333333), 1);
  if (typeof renderer.init === 'function') {
    await renderer.init();
  }

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

  const materials: NodeMaterial[] = [];

  const trail = new TrailCanvas(width, height);

  // Keep the trail canvas off-DOM so no debug box appears on screen
  let canv = trail.canvas;
  canv.style.display = "none";

  let trailTexture = new THREE.Texture(trail.getTexture());
  trailTexture.flipY = false;
  trailTexture.needsUpdate = true;

  const mouse2D = new THREE.Vector2();

  // Time uniform for background shader
  const uTime = uniform(0, "float");

  // Background shader layer (gradient + subtle film flicker)
  const bgMat = new NodeMaterial();
  bgMat.colorNode = Fn(() => {
    const suv = screenUV;
    const grad = mix(vec3(0.10, 0.10, 0.10), vec3(0.16, 0.14, 0.12), smoothstep(0.0, 1.0, suv.y));
    const film = cos(uTime.mul(2.0)).add(1.0).mul(0.005);
    return vec4(grad.add(film), 1.0);
  })();
  const bgMesh = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), bgMat as any);
  (bgMat as any).depthWrite = false;
  (bgMat as any).depthTest = false;
  bgMesh.position.set(0, 0, -50);
  bgMesh.renderOrder = -999;
  scene.add(bgMesh);

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

        material.positionNode = Fn(() => {
          const ndc = cameraProjectionMatrix
            .mul(modelViewMatrix)
            .mul(vec4(positionLocal, 1));
          uvscreen.assign(ndc.xy.div(ndc.w).add(1).div(2));
          uvscreen.y = uvscreen.y.oneMinus();

          const extrude = texture(trailTexture, uvscreen).r;
          positionLocal.z.mulAssign(mix(0.03, 1.0, extrude));
          return positionLocal;
        })();
        material.colorNode = Fn(() => {
          const tt1 = texture(texture1, uv());
          const tt2 = texture(texture2, uv());
          const extrude = texture(trailTexture, uvscreen).r;
          let final = tt2.b;
          final = mix(final, tt2.g, smoothstep(0.0, 0.2, extrude));
          final = mix(final, tt2.r, smoothstep(0.2, 0.4, extrude));
          final = mix(final, tt1.b, smoothstep(0.4, 0.6, extrude));
          final = mix(final, tt1.g, smoothstep(0.6, 0.8, extrude));
          final = mix(final, tt1.r, smoothstep(0.8, 1.0, extrude));
          return vec4(vec3(final), 1.0);
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
    const x = Math.sin(playhead * 2 * Math.PI) * 0.5;
    const y = Math.cos(playhead * 2 * Math.PI) * 0.5;
    mouse2D.set((x + 1) * 0.5 * width, (y + 1) * 0.5 * height);

    trail.update(mouse2D);
    trailTexture.needsUpdate = true;

    (uTime as any).value = performance.now() * 0.001;

    renderer.render(scene, camera);
  };

  wrap.resize = ({ width, height }) => {
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);

    trail.resize(width, height);
    trailTexture.needsUpdate = true;
  };

  wrap.unload = () => {
    materials.forEach((m) => m.dispose());
    bgMat.dispose();
    trailTexture.dispose();
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
