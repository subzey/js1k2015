var VIEWPORT_WIDTH = 500;
var VIEWPORT_HEIGHT = 300;
var DEBUG = true;

if (typeof __RegPack === 'undefined'){
	g = null;
}

var v01, v02, v03;

setInterval(function(){
	g++;
	b.bgColor=0;
	a.width|=0; // Reset canvas
	c.translate(a.width/2, a.height/2); // Center the context origin
	v01 = Math.min(a.width / VIEWPORT_WIDTH, a.height / VIEWPORT_HEIGHT);
	c.scale(v01, v01); // Make logical viewport cover physical one

if (DEBUG){
	c.scale(0.9, 0.9);
	c.save();
}

// Stars
	c.fillStyle = '#fff';
	for (v01=300; v01--; ){
		c.save();
		c.translate(Math.cos(v01*30) * 250, Math.sin(v01*31) * 150);
		c.beginPath();
		if (v01 % 27){
			c.arc(0, 0, Math.sin(v01*5)/3 + 0.5, 0, 7);
			c.fill();
		} else {
			for (v02=70; v02--; ){
				v03 = v02 * (16.3 + Math.sin(v01 + g/50) / 1000);
				c.lineTo(.5/Math.sin(v03), .5/Math.cos(v03));
			}
			c.fill();
		}
		c.restore();
	}
//	return;

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
	for (v01=6; v01-=1/32; ){
		c.lineTo(
			Math.cos(v01) * (Math.sin(v01 * 3) + 5) * (Math.sin(v01 * 17) + 13) * 2 + 80,
			Math.sin(v01) * (Math.sin(v01 * 4) + 4)  * (Math.sin(v01 * 18) + 13) + 60 
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

	// Blinking landing point
	c.translate(130, 30);
	c.fillStyle = '#fff';
	c.save();
	v01 = 1 + g %2 / 5;
	c.scale(v01, v01);
	c.beginPath();
	for (v02=70; v02--; ){
		v03 = v02 * (91 + Math.sin(g/100) / 200);
		c.lineTo(1/Math.sin(v03), 1/Math.cos(v03));
	}
	c.fill();
	c.restore();

	// LAZOR RAILS!
	c.beginPath();
	c.moveTo(0,0);
	c.lineTo(-400, -29);
	c.lineTo(-400, -27);
	c.lineTo(0,0);
	c.lineTo(-400, -36);
	c.lineTo(-400, -34);
	c.fill();




// Train
	v01 = 1000 / g;
	c.scale(v01, v01);

	for (v01 = 400; v01-- ; ){
		c.beginPath();
		c.moveTo(-70 + Math.sin(v01/152) * 30, v01/16-30);
		c.lineTo(-560, v01/2-246);
			if (v01<200){
				c.strokeStyle = 'hsl(0, 15%, ' + (90-v01*0.3) + '%)';
			} else {
				c.strokeStyle = 'hsl(195, 25%, ' + (180-v01*0.375) + '%)';
			}

		c.stroke();
	}

	c.save();
	for (v01=5;v01--;){

		c.beginPath();
		c.arc(-98, -22.8, 18.5, 1, -1.2, 1);
		c.arc(-95, -22.5, 19, -.8, .95);
		c.fill();
		c.scale(1.6, 1.6);
	};
	c.restore();


if (DEBUG){
	c.restore();
	c.strokeStyle = '#fff';
	c.strokeRect(-VIEWPORT_WIDTH / 2, -VIEWPORT_HEIGHT / 2, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
}
}, 40);