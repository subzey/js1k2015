var VIEWPORT_WIDTH = 500;
var VIEWPORT_HEIGHT = 300;
var DEBUG = true;

if (typeof __RegPack === 'undefined'){
	g = null;
}

var v01;

setInterval(function(){
	b.bgColor=0;
	a.width|=0; // Reset canvas
	c.translate(a.width/2, a.height/2); // Center the context origin
	v01 = Math.min(a.width / VIEWPORT_WIDTH, a.height / VIEWPORT_HEIGHT);
	c.scale(v01, v01); // Make logical viewport cover physical one

if (DEBUG){
	c.scale(0.9, 0.9);
	c.save();
	c.strokeStyle = '#fff';
	c.strokeRect(-VIEWPORT_WIDTH / 2, -VIEWPORT_HEIGHT / 2, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
	c.restore();
}


// Gradient
	c.lineWidth = 2;
	for (v01 = 99; v01-- ; ){
		c.beginPath();
		c.moveTo(200, 30);
		c.lineTo(-255, v01-90);
			if (v01<50){
				c.strokeStyle = 'hsl(0, 15%, ' + (90-v01*1.2) + '%)';
			} else {
				c.strokeStyle = 'hsl(195, 25%, ' + (180-v01*1.5) + '%)';
			}

		c.stroke();
	}

	c.lineWidth = .5;
	c.strokeStyle = 'red';

	c.beginPath();
	c.moveTo(-255, 20);
	c.lineTo(40,28);
	c.lineTo(50,24);
	c.bezierCurveTo(
		100, 24,
		90, 0,
		16, -20
	);
	c.lineTo(-255, -90);
	c.stroke();

}, 40);