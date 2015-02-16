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
}

// Planet
	// Fill & atmosphere glow
	v01 = c.createRadialGradient(0, 480, 500, 0, 480, 515);
	v01.addColorStop(0, '#37a');
	v01.addColorStop(1, 'rgba(255,255,255,0)');
	c.beginPath();
	c.arc(0, 480, 600, 0, 7);
	c.fillStyle=v01;
	c.fill();

	c.fillStyle='#452';
	// Continent
	c.beginPath();
	for (var i=6; i-=1/32; ){
		c.lineTo(
			Math.cos(i) * (Math.sin(i * 3) + 5) * (Math.sin(i * 17) + 13) * 2 + 80,
			Math.sin(i) * (Math.sin(i * 4) + 4)  * (Math.sin(i * 18) + 13) + 60 
		);
	}
	c.fill();

	// Shadow
	v01 = c.createRadialGradient(100, 550, 450, 100, 550, 550);
	v01.addColorStop(0, 'rgba(0,0,0,0)');
	v01.addColorStop(1, 'rgba(0,0,0,.9)');
	c.beginPath();
	c.arc(0, 480, 515, 0, 7);
	c.fillStyle = v01;
	c.fill();

	// c.scale(2,2);
	// c.translate(-100, 0);


// Gradient
	c.lineWidth = 2;
	for (v01 = 99; v01-- ; ){
		c.beginPath();
		c.moveTo(75 + Math.sin(v01/38) * 30, v01/4);
		c.lineTo(-255, v01-90);
			if (v01<50){
				c.strokeStyle = 'hsl(0, 15%, ' + (90-v01*1.2) + '%)';
			} else {
				c.strokeStyle = 'hsl(195, 25%, ' + (180-v01*1.5) + '%)';
			}

		c.stroke();
	}

	c.beginPath();
	c.arc(17, 5, 21, 1, -1.4, 1);
	c.arc(22, 5.5, 20.5, -1.4, 1);
	c.fill();

	c.beginPath();
	c.arc(-132, -17, 39, 1, -1.4, 1);
	c.arc(-122, -16, 38, -1.4, 1);
	c.fill();

if (DEBUG){
	c.save();
	c.strokeStyle = '#fff';
	c.strokeRect(-VIEWPORT_WIDTH / 2, -VIEWPORT_HEIGHT / 2, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
	c.restore();
}
}, 40);