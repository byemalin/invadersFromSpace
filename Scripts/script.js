/*require https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.js
require https://cdn.jsdelivr.net/npm/p5.party@latest/dist/p5.party.js

sounds: https://www.classicgaming.cc/classics/space-invaders/sounds*/

let shared, me, participants, shoot, explode;
let spaceFont;
let scene = 0;

function preload() {
  spaceFont = loadFont('../Fonts/digital-7.regular.ttf');
  partyConnect(
    "wss://deepstream-server-1.herokuapp.com",
    "spaceInvaders_Localrun2",
    "main1"
  );
  shared = partyLoadShared("globals");
  me = partyLoadMyShared();
  participants = partyLoadParticipantShareds();

  //loading the sounds and images
  shoot = loadSound("Assets/audio/shoot.wav");
  explode = loadSound("Assets/audio/explosion.wav");
  greenAlien = loadImage("Assets/img/GreenAlien.png");
  loseAliens = loadImage("Assets/img/LOSE-01.png");
  scaledAliens = loadImage("Assets/img/scaledAliens.png");
}

function setup() {
  var mainCanvas = createCanvas(600, 600);
  mainCanvas.parent("canvasdiv");
  rectMode(CENTER);
  imageMode(CENTER);
  frameRate(60);
  textFont(spaceFont);


  //Toggle Server Info
  partyToggleInfo(false);
  toggle= document.getElementById('toggle');
  console.log("toggle brughu", toggle)

  // set up game state
  if (partyIsHost()) {
    partySetShared(shared, {
      enemies: [],
      score: 0,
      hostStart: false,
      hostRestart: false,
    });
  }

  // set up this player's state
  me.bullets = [];
  me.x = 200;
  me.y = height - 50;
  me.colorR = random(255);
  me.colorG = random(255);
  me.colorB = random(255);
}

function mouseMoved(e) {
  me.x = mouseX;
}

function draw() {
  background(0);
  switch (scene) {
    case 1:
      waitForHost();
      break;
    case 2:
      game();
      break;
    case 3:
      gameOver();
      break;
    default:
      startScreen();
      break;
  }
}0

function startScreen() {
  image(scaledAliens, 300, 400, 500, 300);

  textSize(50);
  fill(122, 225, 69);
  text("Invaders from Space", 100, 100);

  textSize(40);
  text("START", 255, 200);
  //text("Instructions",200,300);

  if (mouseX > 230 && mouseX < 350 && mouseY > 120 && mouseY < 200) {
    fill(255);
    textSize(40);
    text("START", 255, 200);

    if (mouseIsPressed == true) {
      scene = 1;
    }
  }
}

function waitForHost() {
  textSize(40);
  fill(122, 225, 69);
  if (partyIsHost()) {
    text("You are the Host", 100, 250);
    text("Press ENTER to begin", 100, 300);
    text("when everyone is ready", 100, 350);
    if (keyCode == 13) {
      shared.hostStart = true;
      shared.hostRestart = false;
      me.bullets = [];
      shared.score = 0;
      shared.enemies = [];

      scene = 2;

      // spawn enemies
      for (let i = 0; i < 10; i++) {
        shared.enemies.push({
          x: random(0, width),
          y: random(0, -800),
        });
      }
    }
  } else if (!partyIsHost()) {
    text("Waiting for the host", 100, 250);
    if (shared.hostStart == true) {
      scene = 2;
      me.bullets = [];
    }
  }
}

//GAME CASE
function game() {
  // host moves enemies
  if (partyIsHost()) {
    for (let enemy of shared.enemies) {
      enemy.y += 2.0;

      //losing
      if (enemy.y > height) {
        gameOver();
        // explode.play();
        // shoot.stop();
        //noLoop();
      }
    }
  }

  // clients move own bullets
  for (const b of me.bullets) {
    b.y -= 10;
  }

  // COLLISIONS

  if (partyIsHost()) {
    for (let enemy of shared.enemies) {
      for (const p of participants) {
        for (const b of p.bullets) {
          if (dist(enemy.x, enemy.y, b.x, b.y) < 20) {
            // console.log("hit");
            // remove enemy
            shared.enemies.splice(shared.enemies.indexOf(enemy), 1);
            // ^ possible conflict, every client writes to shared

            // remove bullet
            p.bullets.splice(p.bullets.indexOf(b), 1);
            // ^ okay, client writing to own "me"

            // spawn enemy
            shared.enemies.push({
              x: random(0, width),
              y: random(-800, 0),
            });
            //  ^ possible conflict, every client writes to shared

            // increment score
            shared.score++;
            //  ^ possible conflict, every client writes to shared
          }
        }
      }
    }
  }
  // draw every participant's bullets
  for (const p of participants) {
    for (const b of p.bullets) {
      circle(b.x, b.y, 10);
    }
  }

  // draw enemies
  for (let enemy of shared.enemies) {
    //console.log(enemy.y)
    //rect(enemy.x, enemy.y, 10);
    image(greenAlien, enemy.x, enemy.y, 20, 30);
  }

  // draw each participant's ship
  for (const p of participants) {
    if (p.x !== undefined && p.y !== undefined) {
      fill(color(p.colorR, p.colorG, p.colorB));
      triangle(p.x, p.y, p.x + 20, p.y + 30, p.x - 20, p.y + 30);
    }
  }

  // mark this participants ship
  fill(color(me.colorR, me.colorG, me.colorB));
  triangle(me.x, me.y, me.x + 20, me.y + 30, me.x - 20, me.y + 30);

  // draw score
  fill(255);
  textSize(20);
  text(shared.score, 15, 25);
}

//GAME OVER CASE

function gameOver() {
  textSize(40);
  fill(255, 0, 0);
  image(loseAliens, 300, 300, 600, 600);
  background(color(0,255,0))
  text("YOU LOSE!", 200, 300);
  text("Press R to restart", 150, 350);

  //explode.play();
  //shoot.stop();

  if (keyCode == 82) {
    console.log("R PRESSED");
    scene = 1;
  }
}


//Game over case with partyIsHost that didn't quite work
// function gameOver() {
//   textSize(40);
//     fill(255,0,0);
//   if (partyIsHost()) {
//     text("YOU LOSE!", 200, 300);
//     text("Press R to restart", 150, 350);
//     if (keyCode == 82) {
//       console.log("R PRESSED");
//       shared.hostRestart = true;
//       scene = 1;
//     }
//   } else if (!partyIsHost()) {
//     text("Wait for host to restart", 100, 250);
//     if (shared.hostRestart == true) {
//       scene = 1;
//     }
//   }
// }

//spawing bullets

function mousePressed() {
  //spawn a bullet
  if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
  me.bullets.push({
    x: mouseX,
    y: height - 50,
  });
  if (scene == 2) {
    shoot.play();
  }
}
}
