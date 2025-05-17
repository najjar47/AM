// LoadingScene - مشهد التحميل
class LoadingScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LoadingScene' });
        this.assetsLoaded = false;
    }

    preload() {
        // إنشاء شريط التحميل
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 4, height / 2 - 30, width / 2, 50);

        // نص التحميل
        const loadingText = this.add.text(width / 2, height / 2 - 50, 'جاري التحميل...', {
            font: '20px Arial',
            fill: '#ffffff'
        });
        loadingText.setOrigin(0.5, 0.5);

        // نص الخطأ (مخفي افتراضياً)
        this.errorText = this.add.text(width / 2, height * 0.7, '', {
            font: '16px Arial',
            fill: '#ff0000',
            align: 'center'
        }).setOrigin(0.5);

        // تقدم التحميل
        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0x00ff00, 1);
            progressBar.fillRect(width / 4 + 10, height / 2 - 20, (width / 2 - 20) * value, 30);
        });

        // معالج أخطاء تحميل الملفات
        this.load.on('loaderror', (file) => {
            console.error('Error loading asset:', file.key);
            this.errorText.setText('خطأ في تحميل: ' + file.key + '\nجاري استخدام الأصول الاحتياطية...');
            
            if (!this.assetsLoaded) {
                this.time.delayedCall(2000, () => {
                    this.assetsLoaded = true;
                    this.scene.start('MenuScene');
                });
            }
        });

        // عند اكتمال التحميل
        this.load.on('complete', () => {
            this.assetsLoaded = true;
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            this.errorText.destroy();
            this.scene.start('MenuScene');
        });

        try {
            this.loadAssets();
        } catch (error) {
            console.error('Error in loadAssets:', error);
            this.loadFallbackAssets();
        }
    }

    loadAssets() {
        // إنشاء شكل افتراضي للكائنات المفقودة
        const defaultSprite = this.make.graphics({ x: 0, y: 0, add: false });
        defaultSprite.fillStyle(0x4287f5);
        defaultSprite.fillRect(0, 0, 32, 48);
        defaultSprite.generateTexture('default_sprite', 32, 48);

        // محاولة تحميل الأصول مع معالجة الأخطاء
        this.load.once('filecomplete-spritesheet-player', () => {
            console.log('Player sprite loaded successfully');
        }).once('loaderror', () => {
            console.log('Using default player sprite');
            this.player = 'default_sprite';
        });

        // تحميل صور الشخصية
        this.load.spritesheet('player', 'assets/sprites/player.png', { 
            frameWidth: 32, 
            frameHeight: 48 
        });

        // تحميل أصول البيئة مع البدائل
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

        // تحميل عناصر واجهة المستخدم مع البدائل
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

        // تحميل الصوت مع بدائل صامتة
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
        // إنشاء أشكال أساسية كأصول بديلة
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        
        // بديل اللاعب
        graphics.clear();
        graphics.fillStyle(0x4287f5);
        graphics.fillRect(0, 0, 32, 48);
        graphics.generateTexture('player', 32, 48);

        // بديل الخلفية
        graphics.clear();
        graphics.fillGradientStyle(0x000000, 0x000000, 0x333333, 0x333333, 1);
        graphics.fillRect(0, 0, 800, 600);
        graphics.generateTexture('background', 800, 600);

        // بديل المنصة
        graphics.clear();
        graphics.fillStyle(0x00ff00);
        graphics.fillRect(0, 0, 100, 20);
        graphics.generateTexture('platform', 100, 20);

        // بدائل واجهة المستخدم
        graphics.clear();
        graphics.fillStyle(0xffffff);
        graphics.fillRect(0, 0, 200, 100);
        graphics.generateTexture('logo', 200, 100);

        graphics.clear();
        graphics.fillStyle(0x666666);
        graphics.fillRect(0, 0, 200, 50);
        graphics.generateTexture('button', 200, 50);

        // بدائل الصوت الصامتة
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

        // إضافة الخلفية
        this.add.image(width / 2, height / 2, 'background')
            .setScale(width / 800)
            .setAlpha(0.5);

        // إضافة الشعار
        this.add.image(width / 2, height * 0.2, 'logo')
            .setScale(0.5);

        // نص العنوان
        this.add.text(width / 2, height * 0.3, 'أسد المقاومة', {
            font: 'bold 48px Arial',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        // نص الاعتمادات بالعربية
        this.add.text(width / 2, height * 0.4, 'تصميم: أسامة النجار (أبو حمزة)', {
            font: '24px Arial',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        // نص الاعتمادات بالإنجليزية
        this.add.text(width / 2, height * 0.45, 'Created by: Osama Al-Najjar (Abu Hamza)', {
            font: '20px Arial',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        // تحذير التقدم
        const warningText = this.add.text(width / 2, height * 0.52, 'تنبيه: لا يتم حفظ التقدم في اللعبة', {
            font: '20px Arial',
            fill: '#ff9900',
            align: 'center'
        }).setOrigin(0.5);

        // جعل نص التحذير يومض
        this.tweens.add({
            targets: warningText,
            alpha: 0.5,
            duration: 1000,
            ease: 'Power1',
            yoyo: true,
            repeat: -1
        });

        // إنشاء الأزرار
        this.createButton(width / 2, height * 0.65, 'ابدأ اللعب', () => {
            this.scene.start('GameScene');
        });

        this.createButton(width / 2, height * 0.75, 'التعليمات', () => {
            this.showInstructions();
        });

        // تشغيل موسيقى الخلفية
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
        // إعداد متغيرات اللعبة
        this.score = 0;
        this.gameOver = false;

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // إنشاء تدرج الخلفية
        const background = this.add.graphics();
        background.fillGradientStyle(0x1a1a1a, 0x1a1a1a, 0x4a4a4a, 0x4a4a4a, 1);
        background.fillRect(0, 0, width, height);

        // إنشاء مجموعة المنصات
        this.platforms = this.physics.add.staticGroup();
        
        // إنشاء رسومات المنصة
        const platformGraphics = this.add.graphics();
        platformGraphics.fillStyle(0x00aa00);
        platformGraphics.fillRect(0, 0, 200, 20);
        platformGraphics.generateTexture('platform', 200, 20);
        
        // إضافة الأرض والمنصات
        this.platforms.create(width / 2, height - 32, 'platform')
            .setScale(width / 200, 1)
            .refreshBody();
        this.platforms.create(600, 400, 'platform');
        this.platforms.create(50, 250, 'platform');
        this.platforms.create(750, 220, 'platform');

        // إنشاء رسومات اللاعب
        const playerGraphics = this.add.graphics();
        playerGraphics.fillStyle(0x4287f5);
        playerGraphics.fillRect(0, 0, 32, 48);
        playerGraphics.generateTexture('player', 32, 48);

        // إنشاء اللاعب
        this.player = this.physics.add.sprite(100, 450, 'player');
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);

        // إضافة التصادم بين اللاعب والمنصات
        this.physics.add.collider(this.player, this.platforms);

        // نص النقاط
        this.scoreText = this.add.text(16, 16, 'النقاط: 0', {
            fontSize: '32px',
            fill: '#fff',
            fontFamily: 'Arial'
        });

        // إضافة العنوان
        this.add.text(width / 2, 50, 'أسد المقاومة', {
            font: 'bold 48px Arial',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        // إضافة اسم المصمم
        this.add.text(width / 2, 100, 'تصميم: أسامة النجار (أبو حمزة)', {
            font: '24px Arial',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        // التحكم للأجهزة اللمسية
        if (this.sys.game.device.input.touch) {
            this.setupTouchControls();
        }

        // إضافة تعليمات التحكم
        const instructions = [
            'التحكم:',
            'الأسهم: للحركة',
            'مسافة: للقفز',
            'شاشة اللمس:',
            'اليسار/اليمين: للحركة',
            'الأعلى: للقفز'
        ];

        this.add.text(16, height - 180, instructions, {
            font: '20px Arial',
            fill: '#ffffff',
            align: 'right',
            lineSpacing: 10
        });

        // مفاتيح التحكم
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update() {
        if (this.gameOver) {
            return;
        }

        // التحكم في الحركة
        if (this.cursors.left.isDown) {
            this.moveLeft();
        } else if (this.cursors.right.isDown) {
            this.moveRight();
        } else {
            this.stand();
        }

        // التحكم في القفز
        if ((this.cursors.up.isDown || this.cursors.space.isDown) && this.player.body.touching.down) {
            this.jump();
        }
    }

    moveLeft() {
        this.player.setVelocityX(-160);
        this.player.setTint(0x0000ff);
    }

    moveRight() {
        this.player.setVelocityX(160);
        this.player.setTint(0x00ff00);
    }

    stand() {
        this.player.setVelocityX(0);
        this.player.clearTint();
    }

    jump() {
        this.player.setVelocityY(-330);
    }

    setupTouchControls() {
        // إنشاء مناطق اللمس
        const touchZoneLeft = this.add.rectangle(0, this.cameras.main.height * 0.7, 
            this.cameras.main.width / 2, this.cameras.main.height * 0.3, 0x000000, 0)
            .setOrigin(0, 0)
            .setInteractive();

        const touchZoneRight = this.add.rectangle(this.cameras.main.width / 2, this.cameras.main.height * 0.7,
            this.cameras.main.width / 2, this.cameras.main.height * 0.3, 0x000000, 0)
            .setOrigin(0, 0)
            .setInteractive();

        const touchZoneJump = this.add.rectangle(0, 0,
            this.cameras.main.width, this.cameras.main.height * 0.7, 0x000000, 0)
            .setOrigin(0, 0)
            .setInteractive();

        // التحكم باللمس
        touchZoneLeft.on('pointerdown', () => this.moveLeft());
        touchZoneRight.on('pointerdown', () => this.moveRight());
        touchZoneJump.on('pointerdown', () => {
            if (this.player.body.touching.down) {
                this.jump();
            }
        });

        // إيقاف الحركة عند رفع اللمس
        this.input.on('pointerup', () => this.stand());
    }
}

// إعدادات اللعبة
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

// بدء اللعبة
window.addEventListener('load', () => {
    new Phaser.Game(config);
});
