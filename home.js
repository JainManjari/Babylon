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

  // handle mouse clicks
  scene.onPointerObservable.add((pointerInfo) => {
    if (isDrawing) {
      if (extrudeShape && extrudeShape.isExtruded) {
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
      switch (pointerInfo.type) {
        case BABYLON.PointerEventTypes.POINTERDOWN:
          // Left click -> to draw a sphere
          if (
            pointerInfo.event.inputIndex == 2 &&
            pointerInfo.pickInfo.pickedMesh != null &&
            (pointerInfo.pickInfo.pickedMesh.id == "Ground" ||
              pointerInfo.pickInfo.pickedMesh.name == "Ground")
          ) {
            coordinates.push(pointerInfo.pickInfo.pickedPoint);
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
          } // Right click to close the loop
          else if (pointerInfo.event.inputIndex == 4) {
            coordinates.push(coordinates[0]);
            var lines = BABYLON.MeshBuilder.CreateLines(
              "lines",
              { points: coordinates, updatable: true },
              scene
            );
            lines.color = new BABYLON.Color3(5, 5, 20);
            extrudeShape = {
              coordinates: coordinates,
              isExtruded: false,
            };
            coordinates = [];
          }
          console.log("POINTER DOWN");
          break;
      }
    }
  });

  return scene;
};

function extrude2DShapes() {
    if (extrudeShape && !extrudeShape.isExtruded) {
      var extrudeObjUniqueId = "extruded";
      const extrusion = BABYLON.MeshBuilder.ExtrudePolygon(
        extrudeObjUniqueId,
        { shape: extrudeShape.coordinates, depth: 5, updatable: true },
        scene
      );
      extrusion.position.y = 4;
      var material = new BABYLON.StandardMaterial("extrudedMaterial", scene);
      material.emissiveColor = new BABYLON.Color3(0, 128, 128);
      extrusion.material = material;
      extrusion.enableEdgesRendering();
      extrusion.edgesWidth = 6.0;
      extrusion.edgesColor = new BABYLON.Color4(1, 0, 3, 1);
      extrudeShape.isExtruded = true;
    }
}

// Buttons
var isDrawing = false;
var isExtruding = false;

const drawButton = document.getElementById("draw");
drawButton.addEventListener("click", function (e) {
  e.preventDefault();
  isDrawing = true;
  isExtruding = false;
});

const extrudeButton = document.getElementById("extrude");
extrudeButton.addEventListener("click", function (e) {
  e.preventDefault();
  isDrawing = false;
  isExtruding = true;
  extrude2DShapes();
});

var scene = createScene();

engine.runRenderLoop(function () {
  scene.render();
});

window.addEventListener("resize", function () {
  engine.resize();
});
