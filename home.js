// Canvas
const canvas = document.getElementById("groundCanvas");
const engine = new BABYLON.Engine(canvas, true);

var coordinates = [];

var extrudeShape;

var createScene = function () {
  var scene = new BABYLON.Scene(engine);
  const camera = new BABYLON.ArcRotateCamera(
    "Camera",
    0,
    Math.PI / 4,
    30,
    BABYLON.Vector3(0, 0, 0),
    scene
  );
  camera.attachControl(canvas, true);

  const ground = BABYLON.MeshBuilder.CreateGround(
    "Ground",
    { height: 30, width: 15 },
    scene
  );

  function createPolygon(points) {
    if (points && points.length > 2) {
      const polygon = new BABYLON.MeshBuilder.CreatePolygon("polygon", {
        shape: points,
        sideOrientation: BABYLON.Mesh.CW,
      });
      const material = new BABYLON.StandardMaterial("polygonMaterial", scene);
      material.emissiveColor = new BABYLON.Color3(0, 0, 1);
      polygon.material = material;
    }
  }

  function createSpere(pointerInfo) {
    const sphereUniqueId = "sphere_" + (coordinates.length - 1);
    const sphere = BABYLON.MeshBuilder.CreateSphere(
      sphereUniqueId,
      { diameter: 0.5, color: BABYLON.Color3(1, 1, 1) },
      scene
    );
    sphere.position = pointerInfo.pickInfo.pickedPoint;
    var material = new BABYLON.StandardMaterial(scene);
    material.alpha = 1;
    material.emissiveColor = new BABYLON.Color3(5, 5, 20);
    sphere.material = material;
  }

  function drawingMode(pointerInfo) {
    if (extrudeShape) {
      const n = scene.meshes.length;
      const meshes = scene.meshes;
      let index = 1;
      for (let i = 1; i < n; i++) {
        const mesh = meshes[index];
        if (mesh && mesh.id !== "Ground") {
          mesh.dispose();
          index = 1;
        }
      }
      coordinates = [];
      extrudeShape = null;
    }

    // Left click -> to draw a sphere
    if (
      pointerInfo.event.inputIndex == 2 &&
      pointerInfo.pickInfo.pickedMesh != null &&
      (pointerInfo.pickInfo.pickedMesh.id == "Ground" ||
        pointerInfo.pickInfo.pickedMesh.name == "Ground")
    ) {
      coordinates.push(pointerInfo.pickInfo.pickedPoint);
      createSpere(pointerInfo);
    }
    // Right click -> to close the loop
    else if (pointerInfo.event.inputIndex == 4) {
      coordinates.push(coordinates[0]);
      createPolygon(coordinates);
      extrudeShape = {
        coordinates: coordinates,
        isExtruded: false,
      };
      coordinates = [];
    }
  }

  // pick up extrudedShape
  function getPickUpInfoByMeshId(meshId) {
    var pickInfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) {
      return mesh && mesh.id == meshId;
    });
    if (pickInfo.hit) {
      return pickInfo;
    }
    return null;
  }

  function updateExtrudeShapePosition(
    currentMesh,
    originalPosition,
    currentPosition
  ) {
    // capturing the diff btw both positons
    var diff = currentPosition.subtract(originalPosition);

    // updating extrudedShape with the difference
    currentMesh.position.addInPlace(diff);
    // updating polygon with the difference
    var polyMesh = scene.getMeshByID("polygon");
    polyMesh.position.addInPlace(diff);

    // updating spheres with the difference
    var curPointSet = extrudeShape.coordinates;
    for (var i = 0; i < curPointSet.length; i++) {
      sphereName = "sphere_" + i;
      curSphere = scene.getMeshByName(sphereName);
      if (curSphere != null) {
        curSphere.position.addInPlace(diff);
        curPointSet[i] = curSphere.position;
      } else {
        console.log("sphere not found: ", sphereName);
        break;
      }
    }
  }

  let originalPosition = null;
  let currentPosition = null;
  let currentMesh = null;

  
  // handle mouse clicks
  scene.onPointerObservable.add((pointerInfo) => {
    switch (pointerInfo.type) {
      case BABYLON.PointerEventTypes.POINTERDOWN:
        if (isDrawing) {
          drawingMode(pointerInfo);
        }
        if (isMoving && extrudeShape.isExtruded) {
          const originalPickedInfo = getPickUpInfoByMeshId("extruded");
          if (originalPickedInfo) {
            currentMesh = originalPickedInfo.pickedMesh;
            const groundPickUpInfo = getPickUpInfoByMeshId("Ground");
            if (groundPickUpInfo) {
              originalPosition = groundPickUpInfo.pickedPoint;
            }
          }
        }
        console.log("POINTER DOWN");
        break;
      case BABYLON.PointerEventTypes.POINTERMOVE:
        if (currentMesh) {
          const groundPickUpInfo = getPickUpInfoByMeshId("Ground");
          if (groundPickUpInfo) {
            currentPosition = groundPickUpInfo.pickedPoint;
            updateExtrudeShapePosition(
              currentMesh,
              originalPosition,
              currentPosition
            );
            originalPosition = currentPosition;
          }
        }
        break;
        case BABYLON.PointerEventTypes.POINTERUP:
            if (originalPosition) {
              originalPosition = null;
            }
            console.log("POINTER UP");
            break;
    }
  });

  return scene;
};

function extrude2DShapes() {
  if (extrudeShape && !extrudeShape.isExtruded && isExtruding) {
    var extrudeObjUniqueId = "extruded";
    const extrudedObj = BABYLON.MeshBuilder.ExtrudePolygon(
      extrudeObjUniqueId,
      { shape: extrudeShape.coordinates, depth: 5, updatable: true },
      scene
    );
    extrudedObj.position.y = 4;
    var material = new BABYLON.StandardMaterial("extrudedMaterial", scene);
    material.emissiveColor = new BABYLON.Color3(0, 128, 128);
    extrudedObj.material = material;
    extrudedObj.enableEdgesRendering();
    extrudedObj.edgesWidth = 6.0;
    extrudedObj.edgesColor = new BABYLON.Color4(1, 0, 3, 1);
    extrudeShape.isExtruded = true;
  }
}

// Buttons
var isDrawing = false;
var isExtruding = false;
var isMoving = false;

const drawButton = document.getElementById("draw");
drawButton.addEventListener("click", function (e) {
  e.preventDefault();
  isDrawing = true;
  isExtruding = false;
  isMoving = false;
});

const extrudeButton = document.getElementById("extrude");
extrudeButton.addEventListener("click", function (e) {
  e.preventDefault();
  isDrawing = false;
  isExtruding = true;
  isMoving = false;
  extrude2DShapes();
});

const moveButton = document.getElementById("move");
moveButton.addEventListener("click", function (e) {
  e.preventDefault();
  isDrawing = false;
  isExtruding = false;
  isMoving = true;
});

var scene = createScene();

engine.runRenderLoop(function () {
  scene.render();
});

window.addEventListener("resize", function () {
  engine.resize();
});
