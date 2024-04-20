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

const coordinates = [];

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
            const name = "sphere_"+(coordinates.length-1);
            const sphere = BABYLON.MeshBuilder.CreateSphere(
              name,
              { diameter: 0.5, color:BABYLON.Color3.Red()},
              scene
            );
            sphere.position = pointerInfo.pickInfo.pickedPoint;
            var material = new BABYLON.StandardMaterial("pointMarkerMaterial", scene);
    material.emissiveColor = new BABYLON.Color3(1, 1, 1); 
    sphere.material = material;
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
