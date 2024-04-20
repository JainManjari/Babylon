const canvas = document.getElementById("groundCanvas"); 
const engine = new BABYLON.Engine(canvas, true); 

var createScene = function() {
    var scene = new BABYLON.Scene(engine);
    const camera = new BABYLON.ArcRotateCamera("Camera",  0, Math.PI/4, 30, BABYLON.Vector3(0,0,0), scene);
    camera.attachControl(canvas, true);

    const ground = BABYLON.MeshBuilder.CreateGround("ground", { height:30, width:15 }, scene);
    return scene;
}

var scene = createScene();
engine.runRenderLoop(function () {
    scene.render();
});

window.addEventListener("resize", function () {
    engine.resize();
});