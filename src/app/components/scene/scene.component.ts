import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import SimplexNoise from 'simplex-noise';

@Component({
  selector: 'app-scene',
  templateUrl: './scene.component.html',
  styleUrls: ['./scene.component.scss'],
})
export class SceneComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas') canvasRef?: ElementRef;

  private cameraZ: number = 400;
  private fov: number = 1;
  private nearClippingPlane: number = 1;
  private farClippingPlane: number = 1000;

  private scene!: THREE.Scene;
  private camera!: THREE.Camera;
  private renderer!: THREE.WebGLRenderer;
  private composer!: EffectComposer;

  private controls!: OrbitControls;

  private planet!: THREE.Mesh;

  get canvas(): HTMLCanvasElement {
    return this.canvasRef?.nativeElement;
  }

  private setupLight(): void {
    const light = new THREE.AmbientLight(0x3d3d3d, 0.8);

    const pointLight = new THREE.DirectionalLight(0xaaaaaa, 1);
    pointLight.position.set(50, 10, -20);
    //const lightHelper = new THREE.DirectionalLight(pointLight);

    pointLight.castShadow = true;
    pointLight.shadow.mapSize.width = 1024;
    pointLight.shadow.mapSize.height = 1024;

    this.scene.add(pointLight);
    //this.scene.add(lightHelper);
    this.scene.add(light);
  }

  private createScene() {
    this.scene = new THREE.Scene();
    //this.scene.background

    //const fog = new THREE.FogExp2(0x02c39a, 0.01);

    //this.scene.fog = fog;

    //create camera
    this.camera = new THREE.PerspectiveCamera(
      400,
      window.innerWidth / window.innerHeight,
      1,
      1000
    );
    this.camera.position.set(20, 0, 30);
    this.camera.rotation.set(0, 0.9, 0);

    //this.camera.position.z = 5;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
    });
    console.log(window.devicePixelRatio);
    console.log(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    //this.renderer.setClearColor(0x17a4bf, 0.2);
    this.renderer.shadowMap.enabled = true;

    //this.controls = new OrbitControls(this.camera, this.canvas);
    //this.controls.update();

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.composer.addPass(
      new UnrealBloomPass(new THREE.Vector2(1024, 1024), 0.5, 1.5, 0)
    );
  }

  private renderLoop() {
    const render = () => {
      requestAnimationFrame(render);

      this.planet.rotation.y += 0.005;

      //this.renderer.render(this.scene, this.camera);
      this.composer.render();
    };

    render();
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.createScene();

    this.setupLight();

    this.planet = new Planet().createPlanet();

    this.scene.add(this.planet);

    this.renderLoop();
  }
}

class Planet {
  private sphereVerticesArray: Array<THREE.Vector3> = [];
  private sphereVerticesNormArray: Array<THREE.Vector3> = [];

  private getPitagorasValue(x: number, y: number): number {
    return Math.sqrt(Math.pow(Math.abs(x), 2) + Math.pow(Math.abs(y), 2));
  }

  //private getR(z1, z2, x1, y1) {
  // r1 = x1 + y1
  //  r2 = x2? + y2?
  //let x2, y2, z;

  //z = z1-z2;

  //z1-z2 = (x1 - Math.pow(Math.abs(x2),2)) + (y1 - Math.pow(Math.abs(y2),2));
  //}

  public createPlanet() {
    const planetGeom: any = new THREE.SphereBufferGeometry(5, 1500, 1500);
    const planetGeomPositions = planetGeom.attributes.position.array;

    let index = 0;
    const colors = [];

    const sn = new SimplexNoise();

    while (index < planetGeomPositions.length) {
      let vec = [0, 0, 0];

      vec[0] = planetGeomPositions[index++];
      vec[1] = planetGeomPositions[index++];
      vec[2] = planetGeomPositions[index++];

      const vecObj = new THREE.Vector3(...vec);

      var mag = vecObj.x * vecObj.x + vecObj.y * vecObj.y + vecObj.z * vecObj.z;
      mag = Math.sqrt(mag);
      var norm = new THREE.Vector3(
        vecObj.x / mag,
        vecObj.y / mag,
        vecObj.z / mag
      );

      const persistence = 0.5;
      let frequency = 0.1;
      let amplitude = 1.5;
      const baseRoughness = 2;
      const strength = 1;
      const minVal = 1.7;

      let noiseVal = 0;

      for (let j = 0; j < 20; j++) {
        noiseVal +=
          (sn.noise3D(
            (vec[0] + 20) * frequency,
            vec[1] * frequency,
            vec[2] * frequency
          ) +
            1) *
          0.5 *
          amplitude;
        frequency *= baseRoughness;
        amplitude *= persistence;
      }

      noiseVal = Math.max(0, noiseVal - minVal);

      planetGeomPositions[index - 3] += noiseVal * norm.x * strength;
      planetGeomPositions[index - 2] += noiseVal * norm.y * strength;
      planetGeomPositions[index - 1] += noiseVal * norm.z * strength;

      if (noiseVal !== 0) {
        colors.push(0.5, 0.3, 0.9);
      } else {
        colors.push(0.07, 0.82, 0.97);
      }
    }

    planetGeom.computeVertexNormals();
    planetGeom.verticesNeedUpdate = true;

    planetGeom.setAttribute(
      'color',
      new THREE.Float32BufferAttribute(colors, 3)
    );

    var planetMaterial = new THREE.MeshPhongMaterial({
      vertexColors: true,
      precision: 'highp',
      clipShadows: true,
      shininess: 0.5,
    });

    const sphere = new THREE.Mesh(planetGeom, planetMaterial);

    //sphere.geometry.computeBoundingSphere();
    // sphere.geometry.computeBoundingBox();
    sphere.geometry.center();
    //sphere.geometry.computeVertexNormals();

    console.log(sphere);

    return sphere;
  }
}
