// LoadingScene - مشهد التحميل
class LoadingScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LoadingScene' });
        this.assetsLoaded = false;
    }

    preload() {
        // Create loading bar
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 4, height / 2 - 30, width / 2, 50);

        // Loading text
        const loadingText = this.add.text(width / 2, height / 2 - 50, 'جاري التحميل...', {
            font: '20px Arial',
            fill: '#ffffff'
        });
        loadingText.setOrigin(0.5, 0.5);

        // Error text (hidden by default)
        this.errorText = this.add.text(width / 2, height * 0.7, '', {
            font: '16px Arial',
            fill: '#ff0000',
            align: 'center'
        }).setOrigin(0.5);

        // Loading progress
        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0x00ff00, 1);
            progressBar.fillRect(width / 4 + 10, height / 2 - 20, (width / 2 - 20) * value, 30);
        });

        // File load error handler
        this.load.on('loaderror', (file) => {
            console.error('Error loading asset:', file.key);
            this.errorText.setText('خطأ في تحميل: ' + file.key + '\nجاري استخدام الأصول الاحتياطية...');
            
            // Continue loading after error
            if (!this.assetsLoaded) {
                this.time.delayedCall(2000, () => {
                    this.assetsLoaded = true;
                    this.scene.start('MenuScene');
                });
            }
        });

        // When loading completes
        this.load.on('complete', () => {
            this.assetsLoaded = true;
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            this.errorText.destroy();
            this.scene.start('MenuScene');
        });

        // Load game assets with error handling
        try {
            this.loadAssets();
        } catch (error) {
            console.error('Error in loadAssets:', error);
            this.loadFallbackAssets();
        }
    }

    loadAssets() {
        // Create default rectangle for missing sprites
        const defaultSprite = this.make.graphics({ x: 0, y: 0, add: false });
        defaultSprite.fillStyle(0x4287f5);
        defaultSprite.fillRect(0, 0, 32, 48);
        defaultSprite.generateTexture('default_sprite', 32, 48);

        // Try loading assets with error handling
        this.load.once('filecomplete-spritesheet-player', () => {
            console.log('Player sprite loaded successfully');
        }).once('loaderror', () => {
            console.log('Using default player sprite');
            this.player = 'default_sprite';
        });

        // Character sprites
        this.load.spritesheet('player', 'assets/sprites/player.png', { 
            frameWidth: 32, 
            frameHeight: 48 
        });

        // Environment assets with fallbacks
        this.load.image('background', 'assets/backgrounds/city.png')
            .on('loaderror', () => {
                const bg = this.make.graphics({ x: 0, y: 0, add: false });
                bg.fillGradientStyle(0x000000, 0x000000, 0x333333, 0x333333, 1);
                bg.fillRect(0, 0, 800, 600);
                bg.generateTexture('background', 800, 600);
            });

        this.load.image('platform', 'assets/environment/platform.png')
            .on('loaderror', () => {
                const platform = this.make.graphics({ x: 0, y: 0, add: false });
                platform.fillStyle(0x00ff00);
                platform.fillRect(0, 0, 100, 20);
                platform.generateTexture('platform', 100, 20);
            });

        // UI elements with fallbacks
        this.load.image('logo', 'assets/ui/logo.png')
            .on('loaderror', () => {
                const logo = this.make.graphics({ x: 0, y: 0, add: false });
                logo.fillStyle(0xffffff);
                logo.fillRect(0, 0, 200, 100);
                logo.generateTexture('logo', 200, 100);
            });

        this.load.image('button', 'assets/ui/button.png')
            .on('loaderror', () => {
                const button = this.make.graphics({ x: 0, y: 0, add: false });
                button.fillStyle(0x666666);
                button.fillRect(0, 0, 200, 50);
                button.generateTexture('button', 200, 50);
            });

        // Audio with silent fallbacks
        this.load.audio('theme', 'assets/audio/theme.mp3')
            .on('loaderror', () => {
                this.cache.audio.add('theme', { buffer: new ArrayBuffer(0) });
            });

        this.load.audio('jump', 'assets/audio/jump.mp3')
            .on('loaderror', () => {
                this.cache.audio.add('jump', { buffer: new ArrayBuffer(0) });
            });
    }

    loadFallbackAssets() {
        // Create basic shapes as fallback assets
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        
        // Player fallback
        graphics.clear();
        graphics.fillStyle(0x4287f5);
        graphics.fillRect(0, 0, 32, 48);
        graphics.generateTexture('player', 32, 48);

        // Background fallback
        graphics.clear();
        graphics.fillGradientStyle(0x000000, 0x000000, 0x333333, 0x333333, 1);
        graphics.fillRect(0, 0, 800, 600);
        graphics.generateTexture('background', 800, 600);

        // Platform fallback
        graphics.clear();
        graphics.fillStyle(0x00ff00);
        graphics.fillRect(0, 0, 100, 20);
        graphics.generateTexture('platform', 100, 20);

        // UI fallbacks
        graphics.clear();
        graphics.fillStyle(0xffffff);
        graphics.fillRect(0, 0, 200, 100);
        graphics.generateTexture('logo', 200, 100);

        graphics.clear();
        graphics.fillStyle(0x666666);
        graphics.fillRect(0, 0, 200, 50);
        graphics.generateTexture('button', 200, 50);

        // Silent audio fallbacks
        this.cache.audio.add('theme', { buffer: new ArrayBuffer(0) });
        this.cache.audio.add('jump', { buffer: new ArrayBuffer(0) });
    }
}

// MenuScene - المشهد الرئيسي
class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Add background
        this.add.image(width / 2, height / 2, 'background')
            .setScale(width / 800)
            .setAlpha(0.5);

        // Add logo
        this.add.image(width / 2, height * 0.2, 'logo')
            .setScale(0.5);

        // Title text
        this.add.text(width / 2, height * 0.3, 'أسد المقاومة', {
            font: 'bold 48px Arial',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        // Credits text in Arabic
        this.add.text(width / 2, height * 0.4, 'تصميم: أسامة النجار (أبو حمزة)', {
            font: '24px Arial',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        // Credits text in English
        this.add.text(width / 2, height * 0.45, 'Created by: Osama Al-Najjar (Abu Hamza)', {
            font: '20px Arial',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        // Progress warning
        const warningText = this.add.text(width / 2, height * 0.52, 'تنبيه: لا يتم حفظ التقدم في اللعبة', {
            font: '20px Arial',
            fill: '#ff9900',
            align: 'center'
        }).setOrigin(0.5);

        // Make warning text blink
        this.tweens.add({
            targets: warningText,
            alpha: 0.5,
            duration: 1000,
            ease: 'Power1',
            yoyo: true,
            repeat: -1
        });

        // Create buttons
        this.createButton(width / 2, height * 0.65, 'ابدأ اللعب', () => {
            this.scene.start('GameScene');
        });

        this.createButton(width / 2, height * 0.75, 'التعليمات', () => {
            this.showInstructions();
        });

        // Play theme music
        this.sound.play('theme', { loop: true, volume: 0.5 });
    }

    createButton(x, y, text, callback) {
        const button = this.add.image(x, y, 'button')
            .setInteractive()
            .setScale(2);

        const buttonText = this.add.text(x, y, text, {
            font: '24px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);

        button.on('pointerover', () => {
            button.setTint(0xcccccc);
        });

        button.on('pointerout', () => {
            button.clearTint();
        });

        button.on('pointerdown', callback);
    }

    showInstructions() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.8);
        overlay.fillRect(0, 0, width, height);

        const instructions = [
            'التحكم:',
            '- اسحب لليمين واليسار للحركة',
            '- انقر للقفز',
            '- اسحب لأسفل للانزلاق',
            '- انقر مرتين للتخفي',
            '',
            'ملاحظة: اللعبة تعمل على جميع الأجهزة'
        ];

        const instructionsText = this.add.text(width / 2, height * 0.3, instructions, {
            font: '24px Arial',
            fill: '#ffffff',
            align: 'right',
            lineSpacing: 10
        }).setOrigin(0.5);

        const closeButton = this.add.text(width / 2, height * 0.8, 'عودة', {
            font: '32px Arial',
            fill: '#ffffff'
        })
        .setOrigin(0.5)
        .setInteractive();

        closeButton.on('pointerdown', () => {
            overlay.destroy();
            instructionsText.destroy();
            closeButton.destroy();
        });
    }
}

// GameScene - مشهد اللعب
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    create() {
        // Set up game variables
        this.score = 0;
        this.gameOver = false;

        // Add background
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        this.add.image(width / 2, height / 2, 'background')
            .setScale(width / 800);

        // Create platforms group
        this.platforms = this.physics.add.staticGroup();
        
        // Add ground
        this.platforms.create(width / 2, height - 32, 'platform')
            .setScale(width / 400, 1)
            .refreshBody();

        // Add some platforms
        this.platforms.create(600, 400, 'platform');
        this.platforms.create(50, 250, 'platform');
        this.platforms.create(750, 220, 'platform');

        // Create player
        this.player = this.physics.add.sprite(100, 450, 'player');
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);

        // Player animations
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [{ key: 'player', frame: 4 }],
            frameRate: 20
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('player', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        // Add collider between player and platforms
        this.physics.add.collider(this.player, this.platforms);

        // Score text
        this.scoreText = this.add.text(16, 16, 'النقاط: 0', {
            fontSize: '32px',
            fill: '#fff',
            fontFamily: 'Arial'
        });

        // Controls for touch devices
        if (this.sys.game.device.input.touch) {
            this.setupTouchControls();
        }

        // Keyboard controls
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update() {
        if (this.gameOver) {
            return;
        }

        // Handle movement
        if (this.cursors.left.isDown) {
            this.moveLeft();
        } else if (this.cursors.right.isDown) {
            this.moveRight();
        } else {
            this.stand();
        }

        // Handle jumping
        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.jump();
        }
    }

    moveLeft() {
        this.player.setVelocityX(-160);
        this.player.anims.play('left', true);
    }

    moveRight() {
        this.player.setVelocityX(160);
        this.player.anims.play('right', true);
    }

    stand() {
        this.player.setVelocityX(0);
        this.player.anims.play('turn');
    }

    jump() {
        this.player.setVelocityY(-330);
        this.sound.play('jump', { volume: 0.5 });
    }

    setupTouchControls() {
        // Left half of screen for left movement
        this.input.on('pointerdown', (pointer) => {
            if (pointer.y > this.cameras.main.height * 0.7) {
                if (pointer.x < this.cameras.main.width / 2) {
                    this.moveLeft();
                } else {
                    this.moveRight();
                }
            } else {
                this.jump();
            }
        });

        // Stop movement when touch ends
        this.input.on('pointerup', () => {
            this.stand();
        });
    }
}

// Game configuration - إعدادات اللعبة
const config = {
    type: Phaser.AUTO,
    parent: 'game',
    width: 800,
    height: 600,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: [LoadingScene, MenuScene, GameScene],
    pixelArt: true,
    backgroundColor: '#000000',
    input: {
        activePointers: 3
    }
};

// Start the game - بدء اللعبة
window.addEventListener('load', () => {
    new Phaser.Game(config);
});
