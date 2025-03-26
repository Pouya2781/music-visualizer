import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import GUI from 'lil-gui';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { gsap } from 'gsap';
import { Color } from 'three/src/math/Color';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  @ViewChild('canvasEl')
  public canvasEl!: ElementRef<HTMLCanvasElement>;

  public async ngAfterViewInit(): Promise<void> {
    const size = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    const scene = new THREE.Scene();

    const fontLoader = new FontLoader();
    const font: Font = await new Promise((resolve) => {
      fontLoader.load('assets/fonts/winky-sans-regular.json', (font) => {
        resolve(font);
      });
    });

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 7);
    scene.add(directionalLight);

    const geometry = new THREE.BoxGeometry(1, 1, 1);

    const blockCount = 64;

    const blocks: THREE.Mesh<
      THREE.BoxGeometry,
      THREE.MeshStandardMaterial,
      THREE.Object3DEventMap
    >[] = [];

    for (let blockIndex = 0; blockIndex < blockCount; blockIndex++) {
      const material = new THREE.MeshStandardMaterial({
        metalness: 0.8,
        roughness: 0.2,
        opacity: 0.8,
        transparent: true,
      });
      const block = new THREE.Mesh(geometry, material);
      block.position.x = blockIndex - blockCount / 2;
      block.position.z = 0;
      block.castShadow = true;
      block.receiveShadow = true;
      scene.add(block);
      blocks.push(block);
    }

    // const rgbeLoader = new RGBELoader();
    // rgbeLoader.load(
    //   'assets/textures/environments/night_4k.hdr',
    //   (environmentMap) => {
    //     environmentMap.mapping = THREE.EquirectangularReflectionMapping;
    //
    //     scene.background = environmentMap;
    //     scene.environment = environmentMap;
    //   },
    // );

    const camera = new THREE.PerspectiveCamera(75, size.width / size.height);
    camera.position.z = 40;
    camera.position.y = 20;
    scene.add(camera);

    const renderer = new THREE.WebGLRenderer({
      canvas: this.canvasEl.nativeElement,
    });
    renderer.setSize(size.width, size.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const orbitControl = new OrbitControls(camera, this.canvasEl.nativeElement);
    orbitControl.enableDamping = true;

    const clock = new THREE.Clock();
    let time = clock.getElapsedTime();

    const debugSetting = {
      lyrics: {
        metalness: 0.5,
        roughness: 0.2,
        height: 17,
        size: 2.5,
        color: 0x7f4fba,
      },
      blocks: {
        metalness: 0.8,
        roughness: 0.2,
        opacity: 0.8,
        height: 10,
        randomize: () => {
          blocks.sort(() => Math.random() - 0.5);
        },
      },
    };

    const render = () => {
      const currentTime = clock.getElapsedTime();
      const deltaTime = currentTime - time;
      time = currentTime;

      for (let blockIndex = 0; blockIndex < blockCount; blockIndex++) {
        blocks[blockIndex].material.metalness = debugSetting.blocks.metalness;
        blocks[blockIndex].material.roughness = debugSetting.blocks.roughness;
        blocks[blockIndex].material.opacity = debugSetting.blocks.opacity;
      }

      // for (let x = 0; x < width; x++) {
      //   for (let z = 0; z < depth; z++) {
      //     blocks[x * depth + z].position.y = Math.floor(noise3D(x / 50, z / 50, currentTime / 10) * 10);
      //   }
      // }

      // console.log(deltaTime, 1 / deltaTime);

      orbitControl.update();
      renderer.render(scene, camera);
      requestAnimationFrame(render);
    };

    render();

    window.addEventListener('resize', () => {
      size.width = window.innerWidth;
      size.height = window.innerHeight;

      camera.aspect = size.width / size.height;
      camera.updateProjectionMatrix();

      renderer.setSize(size.width, size.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });

    const gui = new GUI();
    const blockFolder = gui.addFolder('Block');
    const lyricFolder = gui.addFolder('Lyric');

    blockFolder
      .add(debugSetting.blocks, 'height')
      .min(1)
      .max(20)
      .step(1)
      .name('Visualizer Height');
    blockFolder
      .add(debugSetting.blocks, 'metalness')
      .min(0)
      .max(1)
      .step(0.05)
      .name('Metalness');
    blockFolder
      .add(debugSetting.blocks, 'roughness')
      .min(0)
      .max(1)
      .step(0.05)
      .name('Roughness');
    blockFolder
      .add(debugSetting.blocks, 'opacity')
      .min(0)
      .max(1)
      .step(0.05)
      .name('Opacity');
    blockFolder.add(debugSetting.blocks, 'randomize').name('Randomize');

    lyricFolder
      .add(debugSetting.lyrics, 'metalness')
      .min(0)
      .max(1)
      .step(0.05)
      .name('Lyrics Metalness');
    lyricFolder
      .add(debugSetting.lyrics, 'roughness')
      .min(0)
      .max(1)
      .step(0.05)
      .name('Lyrics Roughness');
    lyricFolder
      .add(debugSetting.lyrics, 'height')
      .min(0)
      .max(40)
      .step(0.5)
      .name('Lyrics Height');
    lyricFolder
      .add(debugSetting.lyrics, 'size')
      .min(0.5)
      .max(5)
      .step(0.1)
      .name('Lyrics Size');
    lyricFolder.addColor(debugSetting.lyrics, 'color').name('Lyrics Color');

    // Audio
    alert('Interact!');
    const audio = new Audio('assets/music/ma-meilleure-ennemie.mp3');
    setTimeout(async () => {
      audio.play();

      let currentIndex = 0;
      const file = await fetch('assets/music/ma-meilleure-ennemie.lrc');
      const text = await file.text();
      const timeStampedLyrics = text.split('\n').map((line) => ({
        time: line
          .substring(1, 9)
          .split(':')
          .reduce((acc, val) => acc * 60 + +val, 0),
        lyrics: line.substring(10),
      }));

      const audioContext = new AudioContext();

      const source = audioContext.createMediaElementSource(audio);
      const analyser = audioContext.createAnalyser();
      source.connect(analyser);
      analyser.connect(audioContext.destination);

      analyser.fftSize = blockCount * 2;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      let textMaterial: THREE.MeshStandardMaterial;
      let textGeometry: TextGeometry;
      let textMesh: THREE.Mesh<
        TextGeometry,
        THREE.MeshStandardMaterial,
        THREE.Object3DEventMap
      >;

      function draw() {
        analyser.getByteFrequencyData(dataArray);

        if (timeStampedLyrics[currentIndex].time < audio.currentTime) {
          if (currentIndex !== 0) {
            const previousTextMesh = textMesh;
            const previousTextGeometry = textGeometry;

            gsap.to(previousTextMesh.material, { duration: 1, opacity: 0 });
            gsap
              .to(previousTextMesh.position, {
                duration: 1,
                y: debugSetting.lyrics.height + 5,
              })
              .then(() => {
                scene.remove(previousTextMesh);
                previousTextGeometry.dispose();
              });
          }

          textMaterial = new THREE.MeshStandardMaterial({
            color: debugSetting.lyrics.color,
          });
          textMaterial.metalness = debugSetting.lyrics.metalness;
          textMaterial.roughness = debugSetting.lyrics.roughness;
          textMaterial.transparent = true;
          textMaterial.opacity = 0;

          textGeometry = new TextGeometry(
            timeStampedLyrics[currentIndex].lyrics,
            {
              font,
              size: debugSetting.lyrics.size,
              depth: 0.2,
              curveSegments: 3,
              bevelEnabled: true,
              bevelThickness: 0.01,
              bevelSize: 0.02,
              bevelOffset: 0,
              bevelSegments: 3,
            },
          );
          textGeometry.center();

          textMesh = new THREE.Mesh(textGeometry, textMaterial);
          textMesh.position.y = debugSetting.lyrics.height - 5;
          scene.add(textMesh);

          gsap.to(textMesh.material, { duration: 1, opacity: 1 });
          gsap.to(textMesh.position, {
            duration: 1,
            y: debugSetting.lyrics.height,
          });

          currentIndex++;
        }

        for (let blockIndex = 0; blockIndex < blockCount; blockIndex++) {
          blocks[blockIndex].material.color = new Color(
            dataArray[blockIndex] / 255,
            0,
            0,
          );

          gsap.to(blocks[blockIndex].scale, {
            y: (dataArray[blockIndex] / 255) * debugSetting.blocks.height,
          });
          gsap.to(blocks[blockIndex].position, {
            y: ((dataArray[blockIndex] / 255) * debugSetting.blocks.height) / 2,
          });
        }

        requestAnimationFrame(draw);
      }

      draw();
    }, 3000);
  }
}
