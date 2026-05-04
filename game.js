const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505);

const camera = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 0.1, 1000);
camera.position.set(0, 30, 20);

const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

// lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.4));
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10,20,10);
scene.add(light);

// ground
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(1000,1000),
  new THREE.MeshStandardMaterial({color:0x1a1a1a})
);
ground.rotation.x = -Math.PI/2;
scene.add(ground);

// player
const player = new THREE.Mesh(
  new THREE.CapsuleGeometry(0.5,1),
  new THREE.MeshStandardMaterial({color:0x00aaff})
);
player.position.y = 1;
scene.add(player);

// arrays
let enemies = [];
let bullets = [];
let pickups = [];

let keys = {};
let score = 0;
let level = 1;
let xp = 0;
let xpMax = 100;
let playing = false;

document.getElementById("startBtn").onclick = () => {
  document.getElementById("menu").style.display = "none";
  playing = true;
};

window.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

// spawn enemy
function spawnEnemy(){
  const e = new THREE.Mesh(
    new THREE.BoxGeometry(1,1,1),
    new THREE.MeshStandardMaterial({color:0xff4444})
  );

  const angle = Math.random()*Math.PI*2;
  const dist = 30;
  e.position.set(Math.cos(angle)*dist,0.5,Math.sin(angle)*dist);
  scene.add(e);
  enemies.push(e);
}

// shoot
function shoot(){
  if(enemies.length===0) return;

  let target = enemies[0];
  let minDist = Infinity;

  enemies.forEach(e=>{
    let d = e.position.distanceTo(player.position);
    if(d<minDist){
      minDist = d;
      target = e;
    }
  });

  const dir = target.position.clone().sub(player.position).normalize();

  const b = new THREE.Mesh(
    new THREE.SphereGeometry(0.2),
    new THREE.MeshBasicMaterial({color:0xffff00})
  );

  b.position.copy(player.position);
  b.dir = dir;
  b.life = 2;

  scene.add(b);
  bullets.push(b);
}

// update
let shootTimer = 0;
let spawnTimer = 0;

function animate(){
  requestAnimationFrame(animate);

  if(playing){

    // movement
    const speed = 0.3;
    if(keys["w"]) player.position.z -= speed;
    if(keys["s"]) player.position.z += speed;
    if(keys["a"]) player.position.x -= speed;
    if(keys["d"]) player.position.x += speed;

    // shoot
    shootTimer += 0.016;
    if(shootTimer > 0.2){
      shoot();
      shootTimer = 0;
    }

    // spawn enemies
    spawnTimer += 0.016;
    if(spawnTimer > 1.5){
      spawnEnemy();
      spawnTimer = 0;
    }

    // bullets
    bullets.forEach((b,i)=>{
      b.position.add(b.dir.clone().multiplyScalar(0.8));
      b.life -= 0.016;

      enemies.forEach((e,ei)=>{
        if(b.position.distanceTo(e.position) < 1){
          scene.remove(e);
          enemies.splice(ei,1);

          // xp drop
          const p = new THREE.Mesh(
            new THREE.BoxGeometry(0.3,0.3,0.3),
            new THREE.MeshBasicMaterial({color:0x00ff00})
          );
          p.position.copy(e.position);
          scene.add(p);
          pickups.push(p);

          score += 10;
        }
      });

      if(b.life <= 0){
        scene.remove(b);
        bullets.splice(i,1);
      }
    });

    // pickups
    pickups.forEach((p,i)=>{
      if(p.position.distanceTo(player.position) < 2){
        scene.remove(p);
        pickups.splice(i,1);
        xp += 10;

        if(xp >= xpMax){
          xp = 0;
          level++;
        }
      }
    });

    // enemy movement
    enemies.forEach(e=>{
      const dir = player.position.clone().sub(e.position).normalize();
      e.position.add(dir.multiplyScalar(0.05));

      if(e.position.distanceTo(player.position) < 1){
        document.getElementById("gameOver").classList.remove("hidden");
        playing = false;
      }
    });

    // camera follow
    camera.position.x = player.position.x;
    camera.position.z = player.position.z + 20;
    camera.lookAt(player.position);

    // UI
    document.getElementById("score").innerText = "SCORE " + score;
    document.getElementById("level").innerText = "LEVEL " + level;
    document.getElementById("xp-fill").style.width = (xp/xpMax*100)+"%";
  }

  renderer.render(scene,camera);
}

animate();
