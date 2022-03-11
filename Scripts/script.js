let shared;
let me;

function preload() {
  partyConnect(
    "wss://deepstream-server-1.herokuapp.com",
    "B-M_spaceInvaders",
    "main"
  );
  shared = partyLoadShared("globals");
  me = partyLoadMyShared();
  participants = partyLoadParticipantShareds();
}


    // SETUP FUNCTION
function setup() {
  createCanvas(400, 400);
  
  shared.bullets = [];
  shared.enemies = [];
  shared.score = 0;

  //spawn enemies
  for (let i= 0; i < 10; i++) {
    let enemy = {
      x: random(0, width),
      y: random(-800, 0),
    };
    
   shared.enemies.push(enemy);
    
  }
  
  me.x = 200;
  me.y = height -50;
}


  //MOUSE MOVED FUNCTION

function mouseMoved(e) {
  // update this participants cursor position
  me.x = mouseX;

}


    //DRAW FUNCTION

function draw() {
  background(51);

  rectMode(CENTER);
  

  // draw each participants cursor
  for (const p of participants) {
    if (typeof p.x !== "undefined") {
      fill("#cc0000");
      ellipse(p.x, p.y, 20, 20);
    }
  }

  // mark this participants cursor
  fill("#ffffff");
  ellipse(me.x, me.y, 15, 15);
  
  

  //update and draw the bullets
  for (let bullet of shared.bullets) {
    bullet.y -= 10;
    circle(bullet.x, bullet.y, 10);
  }
  
  

  //update and draw enemies

  for (let enemy of shared.enemies) {
    enemy.y += 2;
    rect(enemy.x, enemy.y, 10);
    


//     LOSING:
    
//     if (enemy.y > height){
//       text("You Lose!",width/2, height/2)
//       noLoop()
//     }


  }
  
      // Deal with collisions
  
  for (let enemy of shared.enemies) {
    for (let bullet of shared.bullets) {
      if (dist(enemy.x, enemy.y, bullet.x, bullet.y) < 10) {
        shared.enemies.splice(shared.enemies.indexOf(enemy), 1);
        shared.bullets.splice(shared.bullets.indexOf(bullet), 1);
        let newEnemy = {
          x: random(0, width),
          y: random(-800, 0),
        };
        shared.enemies.push(newEnemy);
        //score +=1
        shared.score++
      }
    }
  }
  
  
  //score text
  
  text(shared.score, 15,25)
  
  
}

function mousePressed() {
  //spawn a bullet every click and add too list
  let bullet = {
    x: mouseX,
    y: height - 50,
  };
  shared.bullets.push(bullet);
}




//Steps to maybe take?:

//health
//powerups
//limit bullet number
//increase speed over time
//increase enemy number
//different enemy types





