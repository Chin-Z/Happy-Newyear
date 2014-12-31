(function($){

    var SCREEN_WIDTH = window.innerWidth;
    var SCREEN_HEIGHT = window.innerHeight;
    var mousePos = {
            x: 400,
            y: 300
        };

    // create canvas
    var canvas = document.createElement('canvas');
    // returns a drawing context on the canvas
    var context = canvas.getContext('2d');
    var particles = [];
    var rockets = [];
    var MAX_PARTICLES = 400;
    var $document = $(document);

    document.body.appendChild(canvas);

    // update mouse position
    //$document.mousemove(function(e) {
    //    e.preventDefault();
    //    mousePos = {
    //        x: e.clientX,
    //        y: e.clientY
    //    };
    //});

    // launch more rockets!!!
    $document.mousedown(function(e) {
        for (var i = 0; i < 5; i++) {
            launchFrom(Math.random() * SCREEN_WIDTH * 2 / 3 + SCREEN_WIDTH / 6);
        }
    });

    function launch() {
        launchFrom(mousePos.x);
    }

    function launchFrom(x) {
        if (rockets.length < 10) {
            var rocket = new Rocket(x);
            rocket.explosionColor = Math.floor(Math.random() * 360 / 10) * 10;
            rocket.velocity.y = Math.random() * -3 - 4;
            rocket.velocity.x = Math.random() * 6 - 3;
            rocket.size = 8;
            rocket.shrink = 0.999;
            rocket.gravity = 0.01;
            rockets.push(rocket);
        }
    }

    function loop() {
        // update screen size
        if (SCREEN_WIDTH != window.innerWidth) {
            canvas.width = SCREEN_WIDTH = window.innerWidth;
        }
        if (SCREEN_HEIGHT != window.innerHeight) {
            canvas.height = SCREEN_HEIGHT = window.innerHeight;
        }

        // clear canvas
        context.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

        var existingRockets = [];

        for (var i = 0; i < rockets.length; i++) {
            // update and render
            rockets[i].update();
            rockets[i].render(context);

            // calculate distance with Pythagoras
            var distance = Math.sqrt(Math.pow(mousePos.x - rockets[i].pos.x, 2) + Math.pow(mousePos.y - rockets[i].pos.y, 2));

            // random chance of 1% if rockets is above the middle
            var randomChance = rockets[i].pos.y < (SCREEN_HEIGHT * 2 / 3) ? (Math.random() * 100 <= 1) : false;

            /* Explosion rules
             - 80% of screen
             - going down
             - close to the mouse
             - 1% chance of random explosion
             */
            if (rockets[i].pos.y < SCREEN_HEIGHT / 5 || rockets[i].velocity.y >= 0 || distance < 50 || randomChance) {
                rockets[i].explode();
            } else {
                existingRockets.push(rockets[i]);
            }
        }

        rockets = existingRockets;

        var existingParticles = [];

        for (var i = 0; i < particles.length; i++) {
            particles[i].update();

            // render and save particles that can be rendered
            if (particles[i].exists()) {
                particles[i].render(context);
                existingParticles.push(particles[i]);
            }
        }

        // update array with existing particles - old particles should be garbage collected
        particles = existingParticles;

        while (particles.length > MAX_PARTICLES) {
            particles.shift();
        }
    }

    function Particle(pos) {
        this.pos = {
            x: pos ? pos.x : 0,
            y: pos ? pos.y : 0
        };
        this.velocity = {
            x: 0,
            y: 0
        };
        this.shrink = .97;
        this.size = 2;

        this.resistance = 1;
        this.gravity = 0;

        this.flick = false;

        this.alpha = 1;
        this.fade = 0;
        this.color = 0;
    }

    Particle.prototype.update = function() {
        // apply resistance
        this.velocity.x *= this.resistance;
        this.velocity.y *= this.resistance;

        // gravity down
        this.velocity.y += this.gravity;

        // update position based on speed
        this.pos.x += this.velocity.x;
        this.pos.y += this.velocity.y;

        // shrink
        this.size *= this.shrink;

        // fade out
        this.alpha -= this.fade;
    };

    Particle.prototype.render = function(c) {
        if (!this.exists()) {
            return;
        }

        c.save();

        c.globalCompositeOperation = 'lighter';

        var x = this.pos.x,
            y = this.pos.y,
            r = this.size / 2;

        var gradient = c.createRadialGradient(x, y, 0.1, x, y, r);
        gradient.addColorStop(0.1, "rgba(255,255,255," + this.alpha + ")");
        gradient.addColorStop(0.8, "hsla(" + this.color + ", 100%, 50%, " + this.alpha + ")");
        gradient.addColorStop(1, "hsla(" + this.color + ", 100%, 50%, 0.1)");

        c.fillStyle = gradient;

        c.beginPath();
        c.arc(this.pos.x, this.pos.y, this.flick ? Math.random() * this.size : this.size, 0, Math.PI * 2, true);
        c.closePath();
        c.fill();

        c.restore();
    };

    Particle.prototype.exists = function() {
        return this.alpha >= 0.1 && this.size >= 1;
    };

    function Rocket(x) {
        Particle.apply(this, [{
            x: x,
            y: SCREEN_HEIGHT}]);

        this.explosionColor = 0;
    }

    var createStars = function() {
        var canvasTwo;
        var context;
        var screenH;
        var screenW;
        var stars = [];
        var fps = 50;
        var numStars = 600;

        $('document').ready(function() {

            // Calculate the screen size
            screenH = $(window).height();
            screenW = $(window).width();

            // Get the canvas
            canvasTwo = $('#sky');

            // Fill out the canvas
            canvasTwo.attr('height', screenH);
            canvasTwo.attr('width', screenW);
            context = canvasTwo[0].getContext('2d');

            // Create all the stars
            for(var i = 0; i < numStars; i++) {
                var x = Math.round(Math.random() * screenW);
                var y = Math.round(Math.random() * screenH);
                var length = 1 + Math.random() * 2;
                var opacity = Math.random();

                // Create a new star and draw
                var star = new Star(x, y, length, opacity);

                // Add the the stars array
                stars.push(star);
            }

            setInterval(animate, 1000 / fps);
        });

        /**
         * Animate the canvas
         */
        function animate() {
            context.clearRect(0, 0, screenW, screenH);
            $.each(stars, function() {
                this.draw(context);
            })
        }

        /**
         * Star
         *
         * @param int x
         * @param int y
         * @param int length
         * @param opacity
         */
        function Star(x, y, length, opacity) {
            this.x = parseInt(x);
            this.y = parseInt(y);
            this.length = parseInt(length);
            this.opacity = opacity;
            this.factor = 1;
            this.increment = Math.random() * .03;
        }

        /**
         * Draw a star
         *
         * This function draws a start.
         * You need to give the contaxt as a parameter
         *
         * @param context
         */
        Star.prototype.draw = function() {
            context.rotate((Math.PI * 1 / 10));

            // Save the context
            context.save();

            // move into the middle of the canvas, just to make room
            context.translate(this.x, this.y);

            // Change the opacity
            if(this.opacity > 1) {
                this.factor = -1;
            }
            else if(this.opacity <= 0) {
                this.factor = 1;

                this.x = Math.round(Math.random() * screenW);
                this.y = Math.round(Math.random() * screenH);
            }

            this.opacity += this.increment * this.factor;

            context.beginPath()
            for (var i = 5; i--;) {
                context.lineTo(0, this.length);
                context.translate(0, this.length);
                context.rotate((Math.PI * 2 / 10));
                context.lineTo(0, - this.length);
                context.translate(0, - this.length);
                context.rotate(-(Math.PI * 6 / 10));
            }
            context.lineTo(0, this.length);
            context.closePath();
            context.fillStyle = "rgba(255, 255, 200, " + this.opacity + ")";
            context.shadowBlur = 5;
            context.shadowColor = '#ffff33';
            context.fill();

            context.restore();
        }
    };

    Rocket.prototype = new Particle();
    Rocket.prototype.constructor = Rocket;

    Rocket.prototype.explode = function() {
        var count = Math.random() * 10 + 80;

        for (var i = 0; i < count; i++) {
            var particle = new Particle(this.pos);
            var angle = Math.random() * Math.PI * 2;

            // emulate 3D effect by using cosine and put more particles in the middle
            var speed = Math.cos(Math.random() * Math.PI / 2) * 15;

            particle.velocity.x = Math.cos(angle) * speed;
            particle.velocity.y = Math.sin(angle) * speed;

            particle.size = 10;

            particle.gravity = 0.2;
            particle.resistance = 0.92;
            particle.shrink = Math.random() * 0.05 + 0.93;

            particle.flick = true;
            particle.color = this.explosionColor;

            particles.push(particle);
        }
    };

    Rocket.prototype.render = function(c) {
        if (!this.exists()) {
            return;
        }

        c.save();

        c.globalCompositeOperation = 'lighter';

        var x = this.pos.x,
            y = this.pos.y,
            r = this.size / 2;

        var gradient = c.createRadialGradient(x, y, 0.1, x, y, r);
        gradient.addColorStop(0.1, "rgba(255, 255, 255 ," + this.alpha + ")");
        gradient.addColorStop(1, "rgba(0, 0, 0, " + this.alpha + ")");

        c.fillStyle = gradient;

        c.beginPath();
        c.arc(this.pos.x, this.pos.y, this.flick ? Math.random() * this.size / 2 + this.size / 2 : this.size, 0, Math.PI * 2, true);
        c.closePath();
        c.fill();

        c.restore();
    };

    createStars();

    new Countdown({
        selector: '.new-year',
        dateEnd: new Date('Jan 1, 2015 00:00:00'),
        msgPattern : 'only {days} days, {hours} hours, {minutes} minutes and {seconds} seconds until...',
        msgAfter: 'Happy New Year!',
        onEnd: function() {
            canvas.width = SCREEN_WIDTH;
            canvas.height = SCREEN_HEIGHT;

            // schedules the repeating execution after every delay microseconds
            setInterval (launch, 800);
            setInterval(loop, 1000 / 50);

            $('.merry-christmas').addClass('is-hidden');
            $('.new-year').addClass('is-large');
        }
    });

}(jQuery));

