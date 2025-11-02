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
  selectionMode?: "element" | "mesh";
  onMeshesSelected?: (meshIndices: number[]) => void;
}

export default function ModelViewer3D({
  glbUrl,
  elements,
  onElementSelect,
  selectedElementId,
  viewMode = "normal",
  explodeFactor = 0,
  selectionMode = "element",
  onMeshesSelected,
}: ModelViewer3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const meshToElementRef = useRef<Map<THREE.Object3D, BuildingElement>>(
    new Map()
  );
  const meshIndexMapRef = useRef<Map<THREE.Object3D, number>>(new Map());
  const assignedMeshIndicesRef = useRef<Set<number>>(new Set()); // ⭐ NEW: Track assigned meshes

  // Cache materials để reuse
  const materialCacheRef = useRef<Map<string, THREE.MeshPhongMaterial>>(
    new Map()
  );

  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedMeshIndices, setSelectedMeshIndices] = useState<number[]>([]);
  const [isDrawingBox, setIsDrawingBox] = useState(false);
  const [selectionBox, setSelectionBox] = useState<{
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } | null>(null);
  const [hoveredMeshIndices, setHoveredMeshIndices] = useState<number[]>([]);
  const [meshSpacing, setMeshSpacing] = useState<number>(0); // 0 = không tách, > 0 = tách ra (scale factor)
  const [hoveredElementInfo, setHoveredElementInfo] = useState<{
    name: string;
    x: number;
    y: number;
  } | null>(null);
  const meshOriginalPositionsRef = useRef<Map<THREE.Object3D, THREE.Vector3>>(
    new Map()
  );

  const getStatusColor = (status: TrackingStatus | string): number => {
    const colors: Record<string, number> = {
      not_started: 0xcccccc,
      in_progress: 0xffa726,
      completed: 0x4caf50,
      on_hold: 0xf44336,
    };
    return colors[status] || 0xcccccc;
  };

  // Cache materials để tối ưu performance
  const getMaterial = (
    color: number,
    opacity: number = 0.9
  ): THREE.MeshPhongMaterial => {
    const key = `${color}_${opacity}`;
    let material = materialCacheRef.current.get(key);

    if (!material) {
      material = new THREE.MeshPhongMaterial({
        color,
        transparent: true,
        opacity,
        side: THREE.DoubleSide,
      });
      materialCacheRef.current.set(key, material);
    }

    return material;
  };

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x2a2a2a); // Sáng hơn một chút (từ 0x1a1a1a → 0x2a2a2a)
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(10, 10, 10);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    );
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace =
      (THREE as any).SRGBColorSpace || (THREE as any).sRGBEncoding;
    renderer.toneMapping =
      (THREE as any).ACESFilmicToneMapping || THREE.NoToneMapping;
    // ⭐ PERFORMANCE: Disable shadows to improve FPS
    renderer.shadowMap.enabled = false;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.15;
    controls.rotateSpeed = 0.5;
    controls.panSpeed = 0.5;
    controls.zoomSpeed = 0.8;
    // ⭐ TẮT tất cả mouse controls - chỉ dùng nút bấm
    controls.enableRotate = false;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.enabled = false; // Disable hoàn toàn
    controlsRef.current = controls;

    // Lighting - Tăng cường độ ánh sáng để nhìn rõ model
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2); // Tăng từ 0.6 → 1.2
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1.5); // Tăng từ 0.8 → 1.5
    directionalLight1.position.set(10, 20, 10);
    directionalLight1.castShadow = false;
    scene.add(directionalLight1);

    // Thêm directional light thứ 2 từ góc khác
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight2.position.set(-10, 15, -10);
    directionalLight2.castShadow = false;
    scene.add(directionalLight2);

    // Thêm point light để tăng độ sáng tổng thể
    const pointLight = new THREE.PointLight(0xffffff, 1.0, 100);
    pointLight.position.set(0, 10, 0);
    scene.add(pointLight);

    // Grid helper
    const gridHelper = new THREE.GridHelper(50, 50, 0x444444, 0x222222);
    scene.add(gridHelper);

    // Axes helper
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    // ⭐ PERFORMANCE: Optimized animation loop with frame limiting
    let animationId: number | null = null;
    let lastTime = performance.now();
    const targetFPS = 60;
    const frameInterval = 1000 / targetFPS;

    function animate(currentTime: number) {
      animationId = requestAnimationFrame(animate);

      // Limit to 60 FPS
      const elapsed = currentTime - lastTime;
      if (elapsed < frameInterval) return;

      lastTime = currentTime - (elapsed % frameInterval);

      controls.update();
      // ⭐ KHÔNG gọi updateMatrixWorld - chỉ render
      renderer.render(scene, camera);
    }
    animate(performance.now());

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

    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      setTimeout(handleResize, 50);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);

    return () => {
      // ⭐ PERFORMANCE: Cancel animation loop
      if (animationId !== null) {
        cancelAnimationFrame(animationId);
      }

      window.removeEventListener("resize", handleResize);
      document.removeEventListener("fullscreenchange", onFullscreenChange);

      // Dispose all geometries and materials
      scene.traverse((obj: any) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((mat: any) => mat.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });

      materialCacheRef.current.forEach((mat) => mat.dispose());
      materialCacheRef.current.clear();
      renderer.dispose();

      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Load building elements or GLB
  useEffect(() => {
    if (!sceneRef.current) return;

    const scene = sceneRef.current;

    // ⭐ PERFORMANCE: Dispose old GLB model completely
    const oldModel: THREE.Object3D[] = [];
    scene.traverse((obj) => {
      // Find old GLB root
      if (
        obj.userData.isGLBModel ||
        (obj instanceof THREE.Group && obj.userData.isBuilding)
      ) {
        oldModel.push(obj);
      }
    });

    // Dispose geometries and materials before removing
    oldModel.forEach((model) => {
      model.traverse((child: any) => {
        if (child.geometry) {
          child.geometry.dispose();
        }
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat: any) => mat.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
      scene.remove(model);
    });

    meshToElementRef.current.clear();
    meshIndexMapRef.current.clear();
    meshOriginalPositionsRef.current.clear(); // Clear khi load model mới
    assignedMeshIndicesRef.current.clear(); // ⭐ Clear assigned meshes

    if (glbUrl) {
      let absoluteUrl = glbUrl;
      if (!/^https?:\/\//i.test(glbUrl)) {
        const apiBase =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
        const origin = apiBase.replace(/\/$/, "").replace(/\/api\/?$/, "");
        absoluteUrl = `${origin}${glbUrl.startsWith("/") ? "" : "/"}${glbUrl}`;
      }

      // ⭐ Build assigned meshes set từ elements
      elements.forEach((element: any) => {
        let meshIndices: number[] = [];

        if (typeof element.meshIndicesJson === "string") {
          try {
            meshIndices = JSON.parse(element.meshIndicesJson);
          } catch (e) {
            console.error("Parse meshIndicesJson error:", e);
          }
        } else if (Array.isArray(element.meshIndices)) {
          meshIndices = element.meshIndices;
        }

        meshIndices.forEach((idx) => assignedMeshIndicesRef.current.add(idx));
      });

      console.log(
        `🚫 Assigned meshes count: ${assignedMeshIndicesRef.current.size}`
      );

      const loader = new GLTFLoader();
      loader.load(
        absoluteUrl,
        (gltf) => {
          const root = gltf.scene;
          root.userData.isGLBModel = true; // Mark for cleanup

          let meshIndex = 0;
          const meshNames: string[] = [];

          // ⭐ PERFORMANCE: Single traverse để build map và apply colors
          root.traverse((obj: any) => {
            if (obj.isMesh) {
              // Build mesh index map with sequential indexing
              meshIndexMapRef.current.set(obj, meshIndex);

              if (meshIndex < 10) {
                meshNames.push(`${meshIndex}: ${obj.name}`);
              }

              // ⭐ PERFORMANCE: Disable shadows for better performance
              obj.castShadow = false;
              obj.receiveShadow = false;

              // Determine color
              let color = 0xaaaaaa;
              let opacity = 0.95;

              if (selectionMode === "mesh") {
                // ⭐ Check if mesh is already assigned
                const isAssigned =
                  assignedMeshIndicesRef.current.has(meshIndex);
                if (isAssigned) {
                  color = 0xff0000; // Red for assigned meshes
                  opacity = 0.5; // Semi-transparent
                } else {
                  color = 0xaaaaaa; // Gray for unassigned
                  opacity = 0.95;
                }
              } else {
                // Element mode
                const element = findElementByMeshIndex(meshIndex, elements);
                if (element) {
                  // ⭐ Use custom color from DB if available
                  if ((element as any).color) {
                    color = parseInt((element as any).color.replace("#", "0x"));
                  } else {
                    color = getStatusColor(
                      (element as any).trackingStatus || element.tracking_status
                    );
                  }
                  opacity = 1.0;
                  meshToElementRef.current.set(obj, element);
                }
              }

              // ⭐ Apply material
              const material = getMaterial(color, opacity);
              obj.material = material;

              // ⭐ INCREMENT LAST - after all processing done
              meshIndex++;
            }
          });

          // ⭐ 1. Add vào scene TRƯỚC
          scene.add(root);

          // ⭐ 2. QUAN TRỌNG: Update matrices để có đúng world positions
          scene.updateMatrixWorld(true);

          // ⭐ 3. LƯU original positions SAU KHI đã có world transform
          root.traverse((obj: any) => {
            if (obj.isMesh) {
              const worldPos = new THREE.Vector3();
              obj.getWorldPosition(worldPos);
              meshOriginalPositionsRef.current.set(obj, worldPos.clone());
            }
          });

          console.log("🔍 Sample mesh names:", meshNames);
          console.log(
            `📊 Total meshes indexed: ${meshIndexMapRef.current.size}`
          );
          console.log(
            `📍 Đã lưu ${meshOriginalPositionsRef.current.size} mesh positions`
          );

          fitCameraToObject(root);
          setLoading(false);
        },
        undefined,
        (error) => {
          console.error("Error loading GLB:", error);
          setLoading(false);
        }
      );
    } else {
      elements.forEach((element) => {
        createElementMesh(element);
      });
      setLoading(false);
    }
  }, [glbUrl, elements, selectionMode]); // ⭐ BỎ selectedMeshIndices và hoveredMeshIndices

  // ⭐ Update colors khi selection changes
  useEffect(() => {
    if (selectionMode !== "mesh" || !sceneRef.current) return;

    sceneRef.current.traverse((obj: any) => {
      if (obj.isMesh) {
        const meshIndex = meshIndexMapRef.current.get(obj);
        if (meshIndex === undefined) return;

        const isSelected = selectedMeshIndices.includes(meshIndex);
        const isHovered = hoveredMeshIndices.includes(meshIndex);
        const isAssigned = assignedMeshIndicesRef.current.has(meshIndex);

        let color = 0xaaaaaa;
        let opacity = 0.95;

        if (isAssigned) {
          // ⭐ ASSIGNED MESHES (Red variants)
          if (isSelected) {
            color = 0xff6666; // Light red - selected assigned mesh
            opacity = 0.9;
          } else if (isHovered) {
            color = 0xff9999; // Pink - hovering assigned mesh
            opacity = 0.8;
          } else {
            color = 0xff0000; // Red - assigned mesh
            opacity = 0.5;
          }
        } else {
          // ⭐ UNASSIGNED MESHES (Normal colors)
          if (isSelected) {
            color = 0x00ff00; // Green
            opacity = 1.0;
          } else if (isHovered) {
            color = 0xffff00; // Yellow
            opacity = 1.0;
          } else {
            color = 0xaaaaaa; // Gray
            opacity = 0.95;
          }
        }

        const material = getMaterial(color, opacity);
        obj.material = material;
      }
    });

    // Force render
    if (rendererRef.current && cameraRef.current && sceneRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  }, [selectedMeshIndices, hoveredMeshIndices, selectionMode]);

  // Apply mesh spacing (tách các meshes ra)
  useEffect(() => {
    if (!sceneRef.current || !rendererRef.current || !cameraRef.current) {
      console.warn("⚠️ Scene/renderer/camera not ready");
      return;
    }

    const scene = sceneRef.current;
    const renderer = rendererRef.current;
    const camera = cameraRef.current;

    console.log(`🔄 Mesh spacing changed: ${meshSpacing}%`);
    console.log(`📦 Meshes in map: ${meshOriginalPositionsRef.current.size}`);
    console.log(`📦 Meshes indexed: ${meshIndexMapRef.current.size}`);

    // ⭐ Nếu chưa có positions, chờ model load xong
    if (meshOriginalPositionsRef.current.size === 0) {
      console.warn("⚠️ No original positions saved yet");
      return;
    }

    // ⭐ DEBUG: Kiểm tra 1 mesh có position không
    const firstMesh = Array.from(meshOriginalPositionsRef.current.entries())[0];
    if (firstMesh) {
      const [mesh, pos] = firstMesh;
      const worldPos = new THREE.Vector3();
      mesh.getWorldPosition(worldPos);

      console.log("🔍 First mesh check:", {
        hasParent: !!mesh.parent,
        parentIsScene: mesh.parent === scene,
        localPosition: mesh.position.toArray(),
        savedWorldPosition: pos.toArray(),
        currentWorldPosition: worldPos.toArray(),
        meshName: (mesh as any).name || "unnamed",
      });
    }

    if (meshSpacing === 0) {
      // Reset về vị trí ban đầu
      console.log("🔄 Resetting to original positions");
      meshOriginalPositionsRef.current.forEach((originalPos, mesh) => {
        if (!originalPos || !mesh) return;

        if (mesh.parent && mesh.parent !== scene) {
          const localPos = new THREE.Vector3();
          mesh.parent.worldToLocal(localPos.copy(originalPos));
          mesh.position.copy(localPos);
        } else {
          mesh.position.copy(originalPos);
        }
      });

      renderer.render(scene, camera);
      return;
    }

    // Calculate bounding box
    const bbox = new THREE.Box3();
    meshOriginalPositionsRef.current.forEach((pos) => {
      if (pos) bbox.expandByPoint(pos);
    });

    const modelSize = bbox.getSize(new THREE.Vector3());
    const maxSize = Math.max(modelSize.x, modelSize.y, modelSize.z);
    const modelCenter = bbox.getCenter(new THREE.Vector3());

    // Calculate average distance
    let totalDistance = 0;
    let distanceCount = 0;
    meshOriginalPositionsRef.current.forEach((pos) => {
      if (pos) {
        totalDistance += pos.distanceTo(modelCenter);
        distanceCount++;
      }
    });
    const avgDistance =
      distanceCount > 0 ? totalDistance / distanceCount : maxSize;
    const spacingScale = (avgDistance * meshSpacing) / 100;

    console.log(`📐 Stats:`, {
      maxSize: maxSize.toFixed(2),
      avgDistance: avgDistance.toFixed(2),
      spacingScale: spacingScale.toFixed(2),
      meshCount: meshOriginalPositionsRef.current.size,
    });

    // Apply spacing
    let updatedCount = 0;
    meshOriginalPositionsRef.current.forEach((originalPos, mesh) => {
      if (!originalPos || !mesh) return;

      const direction = new THREE.Vector3().subVectors(
        originalPos,
        modelCenter
      );
      const distance = direction.length();

      if (updatedCount === 0) {
        console.log(`📐 First mesh:`, {
          originalPos: originalPos.toArray(),
          center: modelCenter.toArray(),
          distance: distance.toFixed(2),
          spacingScale: spacingScale.toFixed(2),
        });
      }

      if (distance < 0.001) {
        direction.set(0, 1, 0);
      } else {
        direction.normalize();
      }

      const newPos = new THREE.Vector3()
        .copy(originalPos)
        .addScaledVector(direction, spacingScale);

      if (!mesh.parent || mesh.parent === scene) {
        mesh.position.copy(newPos);
      } else {
        const localPos = new THREE.Vector3();
        mesh.parent.worldToLocal(localPos.copy(newPos));
        mesh.position.copy(localPos);
      }

      updatedCount++;
    });

    console.log(
      `✅ Updated ${updatedCount} meshes với spacing ${spacingScale.toFixed(2)}`
    );

    // Force render
    renderer.render(scene, camera);
  }, [meshSpacing]);

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

  const handleMouseMove = (event: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    // ⭐ ELEMENT MODE: Chỉ hiển thị tooltip, không vẽ selection box
    if (selectionMode === "element") {
      if (!cameraRef.current || !sceneRef.current) return;

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
        const clickedMesh = intersects[0].object as THREE.Object3D;
        let intersectedObject = clickedMesh as THREE.Object3D;

        // Find parent element
        while (
          intersectedObject.parent &&
          !meshToElementRef.current.has(intersectedObject as any)
        ) {
          intersectedObject = intersectedObject.parent;
        }

        const element = meshToElementRef.current.get(intersectedObject as any);
        if (element) {
          setHoveredElementInfo({
            name: element.name,
            x: event.clientX,
            y: event.clientY,
          });
        } else {
          setHoveredElementInfo(null);
        }
      } else {
        setHoveredElementInfo(null);
      }

      return; // ⭐ CRITICAL: Return để không chạy code bên dưới
    }

    // ⭐ MESH MODE: Selection box logic
    if (selectionMode === "mesh" && isDrawingBox && selectionBox) {
      const endX = event.clientX - rect.left;
      const endY = event.clientY - rect.top;

      setSelectionBox((prev) => (prev ? { ...prev, endX, endY } : null));

      updateHoveredMeshesInBox(
        selectionBox.startX,
        selectionBox.startY,
        endX,
        endY
      );
    }
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    if (selectionMode !== "mesh" || event.button !== 0) {
      return;
    }

    // Controls đã bị tắt sẵn, không cần disable lại
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const startX = event.clientX - rect.left;
    const startY = event.clientY - rect.top;

    setIsDrawingBox(true);
    setSelectionBox({ startX, startY, endX: startX, endY: startY });
    setHoveredMeshIndices([]);
  };

  const handleMouseUp = () => {
    if (
      selectionMode === "mesh" &&
      isDrawingBox &&
      hoveredMeshIndices.length > 0
    ) {
      setSelectedMeshIndices((prev) => {
        const newSelection = [...prev];

        hoveredMeshIndices.forEach((idx) => {
          const existingIndex = newSelection.indexOf(idx);
          if (existingIndex > -1) {
            // Bỏ chọn
            newSelection.splice(existingIndex, 1);
          } else {
            // Chọn
            newSelection.push(idx);
          }
        });

        if (onMeshesSelected) {
          onMeshesSelected(newSelection);
        }

        return newSelection;
      });
    }

    // Reset states
    setIsDrawingBox(false);
    setSelectionBox(null);
    setHoveredMeshIndices([]);

    // Controls vẫn tắt (không cho kéo chuột)
  };

  // Phát hiện meshes trong selection box
  const updateHoveredMeshesInBox = (
    startX: number,
    startY: number,
    endX: number,
    endY: number
  ) => {
    if (!cameraRef.current || !sceneRef.current || !containerRef.current)
      return;

    const minX = Math.min(startX, endX);
    const maxX = Math.max(startX, endX);
    const minY = Math.min(startY, endY);
    const maxY = Math.max(startY, endY);

    const hoveredIndices: number[] = [];
    const rect = containerRef.current.getBoundingClientRect();

    let checkedCount = 0;
    let indexedCount = 0;
    let inBoxCount = 0;

    sceneRef.current.traverse((obj: any) => {
      if (obj.isMesh) {
        checkedCount++;
        const meshIndex = meshIndexMapRef.current.get(obj);
        if (meshIndex === undefined) {
          // ⭐ DEBUG: Log nếu mesh không có index
          if (checkedCount <= 5) {
            console.warn(`⚠️ Mesh không có index:`, {
              name: obj.name || "unnamed",
              checkedCount,
            });
          }
          return;
        }

        indexedCount++;

        // Sử dụng world position để project lên màn hình
        const worldPos = new THREE.Vector3();
        obj.getWorldPosition(worldPos);
        worldPos.project(cameraRef.current!);

        const screenX = ((worldPos.x + 1) / 2) * rect.width;
        const screenY = ((-worldPos.y + 1) / 2) * rect.height;

        // Kiểm tra nếu mesh nằm trong selection box
        if (
          screenX >= minX &&
          screenX <= maxX &&
          screenY >= minY &&
          screenY <= maxY
        ) {
          hoveredIndices.push(meshIndex);
          inBoxCount++;
        }
      }
    });

    // ⭐ DEBUG: Log selection box info
    if (checkedCount > 0) {
      console.log(`🎯 Selection box:`, {
        box: { minX, maxX, minY, maxY },
        checkedMeshes: checkedCount,
        indexedMeshes: indexedCount,
        meshesInBox: inBoxCount,
        totalIndexed: meshIndexMapRef.current.size,
      });
    }

    setHoveredMeshIndices(hoveredIndices);
  };

  const handleClick = (event: React.MouseEvent) => {
    if (selectionMode !== "element") return;

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
      const clickedMesh = intersects[0].object as THREE.Object3D;
      let intersectedObject = clickedMesh as THREE.Object3D;

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

  const createElementMesh = (element: BuildingElement) => {
    if (!sceneRef.current) return;

    const { width, length, height } = element.dimensions;
    const group = new THREE.Group();
    group.position.set(element.center[0], element.center[1], element.center[2]);
    group.userData.isBuilding = true;
    group.userData.originalPosition = group.position.clone();

    const baseColor = getStatusColor(element.tracking_status);
    const material = getMaterial(baseColor, 0.8);

    const geometry = new THREE.BoxGeometry(width, height, length);
    const mesh = new THREE.Mesh(geometry, material);
    group.add(mesh);

    sceneRef.current.add(group);
    meshToElementRef.current.set(group as any, element);
  };

  function findElementByMeshIndex(
    meshIndex: number,
    elementsList: BuildingElement[]
  ): BuildingElement | null {
    if (elementsList.length === 0) return null;

    const found = elementsList.find((element: any) => {
      let meshIndices: number[] = [];

      if (typeof element.meshIndicesJson === "string") {
        try {
          meshIndices = JSON.parse(element.meshIndicesJson);
        } catch (e) {
          console.error("Parse error:", e);
          return false;
        }
      } else if (Array.isArray(element.meshIndices)) {
        meshIndices = element.meshIndices;
      }

      return meshIndices.includes(meshIndex);
    });

    return found || null;
  }

  const applyExplodedView = (factor: number) => {
    meshToElementRef.current.forEach((element, group) => {
      if (group instanceof THREE.Group) {
        const originalPos = group.userData.originalPosition as THREE.Vector3;
        const floorOffset = (element.floor_level - 1) * 3 * factor;
        group.position.y = originalPos.y + floorOffset;
      }
    });
  };

  const resetPositions = () => {
    meshToElementRef.current.forEach((element, group) => {
      if (group instanceof THREE.Group) {
        const originalPos = group.userData.originalPosition as THREE.Vector3;
        group.position.copy(originalPos);
      }
    });
  };

  const fitCameraToObject = (object: THREE.Object3D) => {
    if (!cameraRef.current || !controlsRef.current) return;

    const camera = cameraRef.current;
    const controls = controlsRef.current;

    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    const maxSize = Math.max(size.x, size.y, size.z);
    const fitHeightDistance =
      maxSize / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
    const fitWidthDistance = fitHeightDistance / camera.aspect;
    const distance = Math.max(fitHeightDistance, fitWidthDistance) * 1.2;

    camera.near = Math.max(0.1, maxSize / 1000);
    camera.far = distance * 1000;
    camera.updateProjectionMatrix();

    const direction = new THREE.Vector3(1, 0.75, 1).normalize();
    camera.position.copy(
      center.clone().add(direction.multiplyScalar(distance))
    );
    controls.target.copy(center);
    controls.update();
  };

  const moveForward = (distance: number) => {
    if (!cameraRef.current || !controlsRef.current) return;
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    camera.position.addScaledVector(dir, distance);
    controls.target.addScaledVector(dir, distance);
    controls.update();
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  const rotateCamera = (direction: "left" | "right" | "up" | "down") => {
    if (!cameraRef.current || !controlsRef.current || !rendererRef.current)
      return;
    const controls = controlsRef.current;
    const camera = cameraRef.current;
    const renderer = rendererRef.current;

    const angle = Math.PI / 12;
    const spherical = new THREE.Spherical();
    spherical.setFromVector3(camera.position);

    switch (direction) {
      case "left":
        spherical.theta -= angle;
        break;
      case "right":
        spherical.theta += angle;
        break;
      case "up":
        spherical.phi -= angle;
        spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
        break;
      case "down":
        spherical.phi += angle;
        spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
        break;
    }

    camera.position.setFromSpherical(spherical);
    controls.update();

    // ⭐ Force render để cập nhật view ngay lập tức
    if (sceneRef.current) {
      renderer.render(sceneRef.current, camera);
    }
  };

  const zoomCamera = (direction: "in" | "out") => {
    if (!cameraRef.current || !controlsRef.current || !rendererRef.current)
      return;
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    const renderer = rendererRef.current;
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    const distance = direction === "in" ? -2 : 2;
    camera.position.addScaledVector(dir, distance);
    controls.update();

    // ⭐ Force render để cập nhật view ngay lập tức
    if (sceneRef.current) {
      renderer.render(sceneRef.current, camera);
    }
  };

  return (
    <div className="relative w-full h-full">
      <div
        ref={containerRef}
        className="w-full h-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          handleMouseUp();
          setHoveredElementInfo(null); // Clear tooltip khi mouse leave
        }}
        onClick={handleClick}
        style={{
          userSelect: "none",
          cursor: isDrawingBox ? "crosshair" : "default",
        }}
      >
        {selectionBox && selectionMode === "mesh" && (
          <div
            className="absolute border-2 border-blue-500 bg-blue-500/20 pointer-events-none z-10"
            style={{
              left: `${Math.min(selectionBox.startX, selectionBox.endX)}px`,
              top: `${Math.min(selectionBox.startY, selectionBox.endY)}px`,
              width: `${Math.abs(selectionBox.endX - selectionBox.startX)}px`,
              height: `${Math.abs(selectionBox.endY - selectionBox.startY)}px`,
            }}
          />
        )}

        {/* Tooltip hiển thị tên element khi hover */}
        {hoveredElementInfo && (
          <div
            className="fixed bg-stone-800/95 border border-amber-500/50 rounded-lg px-3 py-2 text-sm text-white pointer-events-none z-50 shadow-lg"
            style={{
              left: `${hoveredElementInfo.x + 15}px`,
              top: `${hoveredElementInfo.y - 50}px`,
            }}
          >
            <div className="text-amber-400 font-bold">
              📦 {hoveredElementInfo.name}
            </div>
            <div className="text-xs text-stone-400 mt-1">Click để chọn</div>
          </div>
        )}
      </div>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-white text-xl">⏳ Đang tải mô hình 3D...</div>
        </div>
      )}

      {/* Viewer controls */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        <div className="flex gap-2">
          <button
            onClick={toggleFullscreen}
            className="px-3 py-2 rounded-md bg-stone-800/80 text-stone-100 border border-stone-600 hover:bg-stone-700/80 text-sm"
          >
            {isFullscreen ? "⤢ Thoát" : "⤢ Toàn màn hình"}
          </button>
          <button
            onClick={() => moveForward(1)}
            className="px-3 py-2 rounded-md bg-stone-800/80 text-stone-100 border border-stone-600 hover:bg-stone-700/80 text-sm"
          >
            ⏩ Tiến lên
          </button>
        </div>

        {/* Camera controls */}
        <div className="bg-stone-800/90 border border-stone-600 rounded-md p-2">
          <div className="text-xs text-stone-300 mb-1 text-center font-semibold">
            📹 Điều khiển Camera
          </div>
          <div className="grid grid-cols-3 gap-1">
            <div></div>
            <button
              onClick={() => rotateCamera("up")}
              className="px-2 py-1 rounded bg-stone-700 hover:bg-stone-600 text-stone-100 text-xs"
            >
              ↑
            </button>
            <div></div>
            <button
              onClick={() => rotateCamera("left")}
              className="px-2 py-1 rounded bg-stone-700 hover:bg-stone-600 text-stone-100 text-xs"
            >
              ←
            </button>
            <button
              onClick={() => zoomCamera("in")}
              className="px-2 py-1 rounded bg-stone-700 hover:bg-stone-600 text-stone-100 text-xs"
            >
              +
            </button>
            <button
              onClick={() => rotateCamera("right")}
              className="px-2 py-1 rounded bg-stone-700 hover:bg-stone-600 text-stone-100 text-xs"
            >
              →
            </button>
            <div></div>
            <button
              onClick={() => rotateCamera("down")}
              className="px-2 py-1 rounded bg-stone-700 hover:bg-stone-600 text-stone-100 text-xs"
            >
              ↓
            </button>
            <button
              onClick={() => zoomCamera("out")}
              className="px-2 py-1 rounded bg-stone-700 hover:bg-stone-600 text-stone-100 text-xs col-span-3"
            >
              🔍 Zoom Out
            </button>
          </div>
        </div>

        {/* Mesh Spacing Control */}
        <div className="bg-stone-800/90 border border-stone-600 rounded-md p-3">
          <div className="text-xs text-stone-300 mb-2 text-center font-semibold">
            📐 Khoảng cách Meshes
          </div>
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="50"
              step="0.5"
              value={meshSpacing}
              onChange={(e) => setMeshSpacing(parseFloat(e.target.value))}
              className="w-full h-2 bg-stone-700 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #65a30d 0%, #65a30d ${
                  (meshSpacing / 50) * 100
                }%, #374151 ${(meshSpacing / 50) * 100}%, #374151 100%)`,
              }}
            />
            <div className="flex justify-between items-center text-xs text-stone-400">
              <span>Đóng</span>
              <span className="text-amber-400 font-bold">
                {meshSpacing.toFixed(1)}%
              </span>
              <span>Tách</span>
            </div>
            <button
              onClick={() => setMeshSpacing(0)}
              className="w-full px-2 py-1 rounded bg-stone-700 hover:bg-stone-600 text-stone-100 text-xs"
            >
              🔄 Reset
            </button>
          </div>
        </div>
      </div>

      {/* Controls info */}
      <div className="absolute top-4 right-4 bg-black/80 text-white p-4 rounded-lg text-sm">
        <h4 className="text-green-400 font-bold mb-2">⌨️ Điều khiển</h4>
        <div className="space-y-1">
          {selectionMode === "mesh" ? (
            <>
              <div className="text-yellow-300 font-bold">
                🎯 CHẾ ĐỘ CHỌN MESH
              </div>
              <div>🖱️ Kéo chuột: Vẽ khung chọn</div>
              <div>✅ Click lại: Bỏ chọn mesh</div>
              <div>📹 Dùng nút: Điều khiển camera</div>
              <div>🟢 Xanh lá: Đã chọn (OK)</div>
              <div>🟡 Vàng: Trong khung chọn</div>
              <div>🔴 Đỏ: Đã được gán</div>
            </>
          ) : (
            <>
              <div className="text-blue-300 font-bold">📊 CHẾ ĐỘ TRACKING</div>
              <div>📹 Dùng nút: Điều khiển camera</div>
              <div>👆 Click: Chọn element</div>
              <div>🔍 Nút +/- : Zoom</div>
            </>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-sm">
        <h4 className="text-green-400 font-bold mb-2">🎨 Chú thích</h4>
        {selectionMode === "mesh" ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-4 bg-gray-500 rounded"></div>
              <span>Chưa gán</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-4 bg-yellow-500 rounded"></div>
              <span>Trong khung chọn</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-4 bg-green-500 rounded"></div>
              <span>✓ Đã chọn (OK)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-4 bg-red-500 rounded opacity-50"></div>
              <span>⚠️ Đã được gán</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-4 bg-red-300 rounded"></div>
              <span>🔴 Conflict</span>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-4 bg-gray-400 rounded"></div>
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
        )}
      </div>
    </div>
  );
}
