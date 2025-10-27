"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import type {
  BuildingElement,
  TrackingStatus,
} from "@/types/model-tracking.types";

interface ModelViewer3DProps {
  glbUrl?: string;
  elements: BuildingElement[];
  onElementSelect?: (element: BuildingElement) => void;
  selectedElementId?: string;
  viewMode?: "normal" | "exploded" | "section" | "xray";
  explodeFactor?: number;
}

export default function ModelViewer3D({
  glbUrl,
  elements,
  onElementSelect,
  selectedElementId,
  viewMode = "normal",
  explodeFactor = 0,
}: ModelViewer3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const meshToElementRef = useRef<Map<THREE.Object3D, BuildingElement>>(
    new Map()
  );
  const [loading, setLoading] = useState(true);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(10, 10, 10);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    );
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Grid helper
    const gridHelper = new THREE.GridHelper(50, 50, 0x444444, 0x222222);
    scene.add(gridHelper);

    // Axes helper
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return;
      camera.aspect =
        containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(
        containerRef.current.clientWidth,
        containerRef.current.clientHeight
      );
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Load building elements or GLB
  useEffect(() => {
    if (!sceneRef.current) return;

    // Clear existing meshes
    const scene = sceneRef.current;
    const meshesToRemove: THREE.Object3D[] = [];
    scene.traverse((obj) => {
      if (obj instanceof THREE.Group && obj.userData.isBuilding) {
        meshesToRemove.push(obj);
      }
    });
    meshesToRemove.forEach((mesh) => scene.remove(mesh));
    meshToElementRef.current.clear();

    if (glbUrl) {
      // Load GLB file
      const loader = new GLTFLoader();
      loader.load(
        glbUrl,
        (gltf) => {
          scene.add(gltf.scene);
          setLoading(false);
        },
        undefined,
        (error) => {
          console.error("Error loading GLB:", error);
          setLoading(false);
        }
      );
    } else {
      // Create meshes from building elements
      elements.forEach((element) => {
        createElementMesh(element);
      });
      setLoading(false);
    }
  }, [glbUrl, elements]);

  // Apply view mode effects
  useEffect(() => {
    if (!sceneRef.current) return;

    switch (viewMode) {
      case "exploded":
        applyExplodedView(explodeFactor);
        break;
      case "normal":
      default:
        resetPositions();
        break;
    }
  }, [viewMode, explodeFactor]);

  // Highlight selected element
  useEffect(() => {
    meshToElementRef.current.forEach((element, group) => {
      // Handle Group objects
      if (group instanceof THREE.Group) {
        const isSelected = element.id === selectedElementId;

        group.traverse((child) => {
          if (
            child instanceof THREE.Mesh &&
            child.material instanceof THREE.MeshPhongMaterial
          ) {
            if (isSelected) {
              child.material.emissive.setHex(0x1565c0);
              child.material.color.setHex(0x2196f3);
            } else {
              child.material.emissive.setHex(0x000000);
              child.material.color.setHex(
                getStatusColor(element.tracking_status)
              );
            }
          }
        });
      }
    });
  }, [selectedElementId]);

  // Create mesh for building element
  const createElementMesh = (element: BuildingElement) => {
    if (!sceneRef.current) return;

    const { width, length, height } = element.dimensions;
    const group = new THREE.Group();
    group.position.set(element.center[0], element.center[1], element.center[2]);
    group.userData.isBuilding = true;
    group.userData.originalPosition = group.position.clone();

    const baseColor = getStatusColor(element.tracking_status);

    // Create building based on element type
    if (element.element_type === "wall") {
      createWall(group, width, height, length, baseColor);
    } else if (element.element_type === "column") {
      createColumn(group, width, height, length, baseColor);
    } else if (element.element_type === "slab") {
      createSlab(group, width, height, length, baseColor);
    } else if (element.element_type === "beam") {
      createBeam(group, width, height, length, baseColor);
    } else if (element.element_type === "foundation") {
      createFoundation(group, width, height, length, baseColor);
    } else if (element.element_type === "roof") {
      createRoof(group, width, height, length, baseColor);
    } else {
      // Default: simple box
      const geometry = new THREE.BoxGeometry(width, height, length);
      const material = new THREE.MeshPhongMaterial({
        color: baseColor,
        transparent: true,
        opacity: 0.8,
      });
      const mesh = new THREE.Mesh(geometry, material);
      group.add(mesh);
    }

    sceneRef.current.add(group);
    meshToElementRef.current.set(group as any, element);
  };

  // Create wall with windows and door
  const createWall = (
    group: THREE.Group,
    width: number,
    height: number,
    thickness: number,
    color: number
  ) => {
    const wallThickness = thickness || 0.2;

    // Main wall
    const wallGeometry = new THREE.BoxGeometry(width, height, wallThickness);
    const wallMaterial = new THREE.MeshPhongMaterial({
      color,
      transparent: true,
      opacity: 0.9,
    });
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.position.z = wallThickness / 2;
    group.add(wall);

    // Add windows
    const numWindows = 2;
    const windowHeight = height * 0.6;
    const windowWidth = width / (numWindows + 1);

    for (let i = 0; i < numWindows; i++) {
      const windowX = (i - (numWindows - 1) / 2) * windowWidth;
      const windowGeometry = new THREE.PlaneGeometry(
        windowWidth * 0.8,
        windowHeight * 0.6
      );
      const windowMaterial = new THREE.MeshBasicMaterial({
        color: 0x87ceeb,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide,
      });
      const window = new THREE.Mesh(windowGeometry, windowMaterial);
      window.position.set(windowX, 0, wallThickness / 2 + 0.01);
      group.add(window);

      // Window frame
      const frameGeometry = new THREE.BoxGeometry(
        windowWidth * 0.85,
        windowHeight * 0.65,
        0.05
      );
      const frameMaterial = new THREE.MeshPhongMaterial({ color: 0x8b7355 });
      const frame = new THREE.Mesh(frameGeometry, frameMaterial);
      frame.position.set(windowX, 0, wallThickness / 2);
      group.add(frame);
    }

    // Add door
    const doorWidth = width * 0.4;
    const doorHeight = height * 0.6;
    const doorGeometry = new THREE.PlaneGeometry(doorWidth, doorHeight);
    const doorMaterial = new THREE.MeshBasicMaterial({
      color: 0x8b4513,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
    });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, -height * 0.2, wallThickness / 2 + 0.01);
    group.add(door);

    // Door frame
    const doorFrameGeometry = new THREE.BoxGeometry(
      doorWidth * 1.1,
      doorHeight * 1.1,
      0.05
    );
    const doorFrameMaterial = new THREE.MeshPhongMaterial({ color: 0x654321 });
    const doorFrame = new THREE.Mesh(doorFrameGeometry, doorFrameMaterial);
    doorFrame.position.set(0, -height * 0.2, wallThickness / 2);
    group.add(doorFrame);
  };

  // Create column
  const createColumn = (
    group: THREE.Group,
    width: number,
    height: number,
    length: number,
    color: number
  ) => {
    const size = Math.min(width, length);
    const columnGeometry = new THREE.CylinderGeometry(
      size / 2,
      size / 2,
      height,
      16
    );
    const columnMaterial = new THREE.MeshPhongMaterial({
      color,
      transparent: true,
      opacity: 0.8,
    });
    const column = new THREE.Mesh(columnGeometry, columnMaterial);
    column.rotation.x = Math.PI / 2;
    column.position.y = height / 2;
    group.add(column);
  };

  // Create slab (floor)
  const createSlab = (
    group: THREE.Group,
    width: number,
    height: number,
    length: number,
    color: number
  ) => {
    const slabGeometry = new THREE.BoxGeometry(width, height || 0.2, length);
    const slabMaterial = new THREE.MeshPhongMaterial({
      color,
      transparent: true,
      opacity: 0.8,
    });
    const slab = new THREE.Mesh(slabGeometry, slabMaterial);
    group.add(slab);

    // Add tile pattern
    const tileSize = 1;
    const numTilesX = Math.floor(width / tileSize);
    const numTilesZ = Math.floor(length / tileSize);

    for (let i = 0; i < numTilesX; i++) {
      for (let j = 0; j < numTilesZ; j++) {
        const tileGeometry = new THREE.PlaneGeometry(
          tileSize * 0.9,
          tileSize * 0.9
        );
        const tileMaterial = new THREE.MeshBasicMaterial({
          color: (i + j) % 2 === 0 ? 0xcccccc : 0xeeeeee,
          transparent: true,
          opacity: 0.3,
        });
        const tile = new THREE.Mesh(tileGeometry, tileMaterial);
        tile.rotation.x = -Math.PI / 2;
        tile.position.set(
          (i - numTilesX / 2) * tileSize,
          (height || 0.2) / 2 + 0.01,
          (j - numTilesZ / 2) * tileSize
        );
        group.add(tile);
      }
    }
  };

  // Create beam
  const createBeam = (
    group: THREE.Group,
    width: number,
    height: number,
    length: number,
    color: number
  ) => {
    const beamGeometry = new THREE.BoxGeometry(width, height, length);
    const beamMaterial = new THREE.MeshPhongMaterial({
      color,
      transparent: true,
      opacity: 0.9,
    });
    const beam = new THREE.Mesh(beamGeometry, beamMaterial);
    group.add(beam);
  };

  // Create foundation
  const createFoundation = (
    group: THREE.Group,
    width: number,
    height: number,
    length: number,
    color: number
  ) => {
    const foundationGeometry = new THREE.BoxGeometry(
      width,
      height || 0.5,
      length
    );
    const foundationMaterial = new THREE.MeshPhongMaterial({
      color: 0x696969,
      transparent: true,
      opacity: 0.9,
    });
    const foundation = new THREE.Mesh(foundationGeometry, foundationMaterial);
    foundation.position.y = -(height || 0.5) / 2;
    group.add(foundation);
  };

  // Create roof
  const createRoof = (
    group: THREE.Group,
    width: number,
    height: number,
    length: number,
    color: number
  ) => {
    // Triangular roof
    const roofHeight = height || 1.5;
    const roofGeometry = new THREE.ConeGeometry(
      Math.min(width, length) * 0.8,
      roofHeight,
      4
    );
    const roofMaterial = new THREE.MeshPhongMaterial({
      color: 0x8b0000,
      transparent: true,
      opacity: 0.9,
    });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.rotation.x = Math.PI / 2;
    roof.position.y = roofHeight / 2;
    group.add(roof);

    // Roof tiles pattern
    const numTiles = 10;
    for (let i = 0; i < numTiles; i++) {
      const angle = (i / numTiles) * Math.PI * 2;
      const x = Math.cos(angle) * (Math.min(width, length) * 0.35);
      const z = Math.sin(angle) * (Math.min(width, length) * 0.35);

      const tileGeometry = new THREE.BoxGeometry(0.5, 0.05, 0.3);
      const tileMaterial = new THREE.MeshPhongMaterial({ color: 0x654321 });
      const tile = new THREE.Mesh(tileGeometry, tileMaterial);
      tile.position.set(x, roofHeight * 0.7, z);
      tile.rotation.y = angle;
      group.add(tile);
    }
  };

  // Get color based on tracking status
  const getStatusColor = (status: TrackingStatus): number => {
    const colors: Record<TrackingStatus, number> = {
      not_started: 0xf44336, // Red
      in_progress: 0xffa726, // Orange
      completed: 0x4caf50, // Green
    };
    return colors[status] || 0xcccccc;
  };

  // Apply exploded view
  const applyExplodedView = (factor: number) => {
    meshToElementRef.current.forEach((element, group) => {
      if (group instanceof THREE.Group) {
        const originalPos = group.userData.originalPosition as THREE.Vector3;
        const floorOffset = (element.floor_level - 1) * 3 * factor;
        group.position.y = originalPos.y + floorOffset;
      }
    });
  };

  // Reset positions
  const resetPositions = () => {
    meshToElementRef.current.forEach((element, group) => {
      if (group instanceof THREE.Group) {
        const originalPos = group.userData.originalPosition as THREE.Vector3;
        group.position.copy(originalPos);
      }
    });
  };

  // Handle mouse click
  const handleClick = (event: React.MouseEvent) => {
    if (!cameraRef.current || !sceneRef.current || !containerRef.current)
      return;

    const rect = containerRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);

    const intersects = raycaster.intersectObjects(
      sceneRef.current.children,
      true
    );

    if (intersects.length > 0) {
      let intersectedObject = intersects[0].object as THREE.Object3D;

      // Find parent group
      while (
        intersectedObject.parent &&
        !meshToElementRef.current.has(intersectedObject as any)
      ) {
        intersectedObject = intersectedObject.parent;
      }

      const element = meshToElementRef.current.get(intersectedObject as any);
      if (element && onElementSelect) {
        onElementSelect(element);
      }
    }
  };

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" onClick={handleClick} />

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-white text-xl">⏳ Đang tải mô hình 3D...</div>
        </div>
      )}

      {/* Controls info */}
      <div className="absolute top-4 right-4 bg-black/80 text-white p-4 rounded-lg text-sm">
        <h4 className="text-green-400 font-bold mb-2">⌨️ Điều khiển</h4>
        <div className="space-y-1">
          <div>🖱️ Chuột trái: Xoay</div>
          <div>🖱️ Chuột phải: Di chuyển</div>
          <div>🔍 Lăn chuột: Zoom</div>
          <div>👆 Click: Chọn phần tử</div>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-sm">
        <h4 className="text-green-400 font-bold mb-2">🎨 Chú thích</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-4 bg-red-500 rounded"></div>
            <span>Chưa bắt đầu</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-4 bg-orange-500 rounded"></div>
            <span>Đang thi công</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-4 bg-green-500 rounded"></div>
            <span>Hoàn thành</span>
          </div>
        </div>
      </div>
    </div>
  );
}
