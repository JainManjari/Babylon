// Buttons
var drawMode = false;

const drawButton = document.getElementById("draw");
drawButton.addEventListener("click", function (e) {
  e.preventDefault();
  drawMode = true;
});

// Canvas
const canvas = document.getElementById("groundCanvas");
const engine = new BABYLON.Engine(canvas, true);

var coordinates = [];

var extrudeShapes = [];

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
    if (drawMode) {
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
          } else if(pointerInfo.event.inputIndex==4) {
            coordinates.push(coordinates[0]);
            var linesUniqueId = extrudeShapes.length + "";
            var lines = BABYLON.MeshBuilder.CreateLines("lines_"+linesUniqueId, {points: coordinates, updatable: true}, scene);
            lines.color = new BABYLON.Color3(5, 5, 20);
            extrudeShapes.push(coordinates);
            coordinates = [];
          }
          console.log("POINTER DOWN");
          break;
      }
    }
  });

  return scene;
};

var scene = createScene();

engine.runRenderLoop(function () {
  scene.render();
});

window.addEventListener("resize", function () {
  engine.resize();
});
