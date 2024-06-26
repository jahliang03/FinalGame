class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        // variables and settings
        this.ACCELERATION = 400;
        this.DRAG = 800;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1400;
        this.JUMP_VELOCITY = -600;
        this.PARTICLE_VELOCITY = 10;
        this.SCALE = 2.0;   

        this.ENEMY_SPEED = 100;
        this.ENEMY_PATROL_DISTANCE = 200;
    }

    create() {
        document.getElementById('description').innerHTML = '<h2><br> Movement: left arrow (move left), right arrow (move right), up arrow (jump) <br>Collect all the mushrooms & saplings! Avoide the water!</h2>'
        
        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 45 tiles wide and 25 tiles tall.
        this.map = this.add.tilemap("platformer-level-1", 18, 18, 45, 25);
        
        // load sound 
        this.collectSound = this.sound.add('collectSound', { volume: 0.5 });
        this.backgroundMusic = this.sound.add('backgroundMusic', { volume: 0.3 });
        this.backgroundMusic.play(); 
    
        // key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("kenny_tilemap_packed", "tilemap_tiles");
       
        // Create a layer
        this.groundLayer = this.map.createLayer("Ground-n-Platforms", this.tileset, 0, 0);
        this.waterLayer = this.map.createLayer("Water", this.tileset, 0,0);
        // Make it collidable
        this.groundLayer.setCollisionByProperty({ collides: true});

        // Water tiles have a property `water` set to true
        this.waterLayer.setCollisionByProperty({ water: true });

        // Find coins in the "Objects" layer in Phaser
        this.coinsCollected = 0; 
        this.mushroomsCollected = 0; 
        this.saplingsCollected = 0; 

        //create coin and mushroom objects
        this.coins = this.map.createFromObjects("Objects", {
            name: "coin",
            key: "tilemap_sheet",
            frame: 151
        });

        this.mushrooms = this.map.createFromObjects("mushrooms", {
            name: "mushroom",
            key: "tilemap_sheet",
            frame: 128
        });

        this.sapling = this.map.createFromObjects("sapling", {
            name: "sapling",
            key: "tilemap_sheet",
            frame: 124
        });

        // Enemy setup
        this.enemy = this.physics.add.sprite(900, 200, 'platformer_characters', 'tile_0008.png');
        this.enemy.setCollideWorldBounds(true);
        this.enemy.setVelocityX(100);  // Initial horizontal velocity
        this.enemy.body.maxVelocity.x = 100;  // Max horizontal velocity

        // Define movement boundaries for the enemy based on a 50 pixels range
        this.enemy.minX = this.enemy.x - 50;  // Minimum x position
        this.enemy.maxTime = this.enemy.x + 50; // Maximum x position

        // Collider with ground
        this.physics.add.collider(this.enemy, this.groundLayer);

        // Collider with player that triggers game over
        this.physics.add.collider(this.enemy, my.sprite.player, this.gameOver, null, this);

        // Collider with ground
        this.physics.add.collider(this.enemy, this.groundLayer);

        // Collider with player that triggers game over
        this.physics.add.collider(this.enemy, my.sprite.player, this.gameOver, null, this);

        // Since createFromObjects returns an array of regular Sprites, we need to convert 
        // them into Arcade Physics sprites (STATIC_BODY, so they don't move) 
        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        this.physics.world.enable(this.mushrooms, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.sapling, Phaser.Physics.Arcade.STATIC_BODY);
        
        // Create a Phaser group out of the array this.coins
        // This will be used for collision detection below.
        this.coinGroup = this.add.group(this.coins);

        this.mushroomGroup = this.add.group(this.mushrooms);
        this.saplingGroup = this.add.group(this.sapling);

        // set up player avatar
        my.sprite.player = this.physics.add.sprite(30, 345, "platformer_characters", "tile_0003.png");
        my.sprite.player.setCollideWorldBounds(true);

        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.groundLayer);

        this.physics.add.collider(my.sprite.player, this.waterLayer, this.handleWaterCollision, null, this);
     
        // Handle collision detection with coins
        this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => {
            obj2.destroy(); // remove coin on overlap
            this.coinsCollected += 1; // increment coins collected
            //this.coinText.setText('Coins: ' + this.coinsCollected); // update coin text
            this.collectSound.play();
        });

        // Handle collision detection with mushrooms
        this.physics.add.overlap(my.sprite.player, this.mushroomGroup, (obj1, obj2) => {
            obj2.destroy();  // Remove the mushroom from the game
            this.mushroomsCollected += 1;  // Correctly increment the count
            //this.mushroomText.setText('Mushrooms: ' + this.mushroomsCollected);  // Update the display text
            this.collectSound.play();
            if (this.mushroomsCollected >=  3 && this.saplingsCollected >= 3 ) {  // Check if all 3 mushrooms and sapling have been collected
                this.winGame();  // Trigger the win condition
            }
        });

        this.physics.add.overlap(my.sprite.player, this.saplingGroup, (obj1, obj2) => {
            obj2.destroy(); // remove coin on overlap
            this.saplingsCollected += 1; // increment coins collected
            //this.coinText.setText('Coins: ' + this.coinsCollected); // update coin text
            this.collectSound.play();
            if (this.mushroomsCollected >=  3 && this.saplingsCollected >= 3 ) {  // Check if all 3 mushrooms and sapling have been collected
                this.winGame();  // Trigger the win condition
            }
        });

        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        this.rKey = this.input.keyboard.addKey('R');

        // debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);

        // Add movement vfx here, particles
        my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame: ['smoke_01.png', 'smoke_09.png'],
            scale: {start: 0.02, end: 0.04},
            lifespan: 350,
            alpha: {start: 1, end: 0.1}, 
        });

        my.vfx.walking.stop();
        
        // add camera code here
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);
    }

    winGame() {
        // Display win message and restart game option
        this.scene.start('WinScene');
    }

    handleWaterCollision(player, waterTile) {
        // If the player touches water, trigger game over or restart the scene
        this.gameOver();  // Assuming you have a gameOver method to handle this
    }
    
    gameOver() {
        // Here you can define what happens when the game is over
        this.physics.pause();
        // Display the "Game Over" text
        let gameOverText = this.add.text(280, 350, 'Game Over! Avoid Drowning!', {
            fontSize: '10px',
            fill: '#FF0000'
        });

        // Delay the scene restart for 0.5 seconds (500 milliseconds)
        this.time.delayedCall(700, () => {
            gameOverText.destroy(); // Optionally remove the text right before restarting
            this.scene.restart(); // Restart the scene
        });
    }

    update() {

        if(cursors.left.isDown) {
            my.sprite.player.setAccelerationX(-this.ACCELERATION);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);
            // TODO: add particle following code here
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-4, my.sprite.player.displayHeight/2-1, false);

            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0.5);

            // Only play smoke effect if touching the ground
            if (my.sprite.player.body.blocked.down) {
                my.vfx.walking.start();
            }

        } else if(cursors.right.isDown) {
            my.sprite.player.setAccelerationX(this.ACCELERATION);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);
            // TODO: add particle following code here
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/8-9, my.sprite.player.displayHeight/2-3, false);

            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0.5);

            // Only play smoke effect if touching the ground
            if (my.sprite.player.body.blocked.down) {
                my.vfx.walking.start();
            }

        } else {
            // Set acceleration to 0 and have DRAG take over
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');
            // TODO: have the vfx stop playing
            my.vfx.walking.stop();
        }

        // player jump
        // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
        if(!my.sprite.player.body.blocked.down) {
            my.sprite.player.anims.play('jump');
        }
        if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
        }

        if(Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.restart();
        }

        // Check if the enemy has reached the defined boundaries
        if (this.enemy.x >= this.enemy.maxX || this.enemy.x <= this.enemy.minX) {
            this.enemy.setVelocityX(-this.enemy.body.velocity.x); // Reverse the movement direction
        }
    }
    
}