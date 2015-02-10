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
	c.save();
	c.strokeStyle = '#fff';
	c.strokeRect(-VIEWPORT_WIDTH / 2, -VIEWPORT_HEIGHT / 2, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
	c.restore();
}


// Gradient
	c.lineWidth = 2;
	for (var i=99;i--;){
		c.beginPath();
		c.moveTo(200, 30);
		c.lineTo(-400, i*1.5-90);
			if (i<50){
				c.strokeStyle = 'hsl(0, 15%, ' + (90-i*1.2) + '%)';
			} else {
				c.strokeStyle = 'hsl(195, 25%, ' + (180-i*1.5) + '%)';
			}

		c.stroke();
	}

}, 40);