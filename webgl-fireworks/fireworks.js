var vertexShaderSource = `#version 300 es

in vec2 a_position;

uniform mat3 u_matrix;

void main()
{
	vec2 position = ( u_matrix * vec3( a_position, 1 ) ).xy;
	
	//gl_Position = a_position;
	gl_Position = vec4( position, 0, 1 );
}
`;

var fragmentShaderSource = `#version 300 es
precision mediump float;

uniform vec4 u_color;

out vec4 outColor;

void main()
{
	outColor = u_color;
}
`;

var Color =
{
	rgb: function( r, g, b )
	{
		return [r, g, b];
	},
	
	rgba: function( r, g, b, a )
	{
		return [r, g, b, a];
	},
	
	bgra: function( b, g, r, a )
	{
		return [b, g, r, a];
	},
	
	random: function( randomizeAlpha )
	{
		var r = randomInt( 255 );
		var g = randomInt( 255 );
		var b = randomInt( 255 );
		
		var a = 255;
		if( randomizeAlpha )
		{
			a = randomInt( 255 );
		}
		
		return [r, g, b, a];
	}
}

function Particle()
{
	this.position = vec3.create( 0, 0, 0 );
	this.velocity = vec3.create( 0, 0, 0 );
	this.color = Color.rgba( 255, 255, 255, 255 );
	
	this.initialPosition = vec3.create( 0, 0, 0 );
	this.initialVelocity = vec3.create( 0, 0, 0 );
	
	this.size = 5;
	
	this.spawnTimestamp = 0;
	this.lifeTime = 1;
	
	this.particleLayer = 1;
	
	this.subParticleCount = 0;
	
	this.maxTrailSize = 20;
	this.trail = [];
	
	this.particlePrototype = null;
}

function ParticleData()
{
	this.spawnTime = 0;
	this.initialPosition = vec3.create( 0, 0, 0 );
	this.initialVelocity = vec3.create( 0, 0, 0 );
	this.lifeTime = 0;
}

var gl = null;
var glProgram = null;

var rectVbo = 0;
var rectVao = 0;

var prevTime = -1;
var physicsFreq = 60.0;
var accumulator = 0.0;

var gravityVec = vec3.create( 0, -98.0, 0 );

var particleList = [];

var spawnCountdown = 1.0;

var circleNumSlices = 30;

var timeElapsed = 0;

var particlePrototypes = [];

function resize( canvas )
{
	var displayWidth = canvas.clientWidth;
	var displayHeight = canvas.clientHeight;
	
	if( ( canvas.width !== displayWidth ) ||
		( canvas.height !== displayHeight ) )
	{
		canvas.width = displayWidth;
		canvas.height = displayHeight;
	}
}

function animationFrame( currentTime )
{
	resize( gl.canvas );
	gl.viewport( 0, 0, gl.canvas.width, gl.canvas.height );
	
	if( prevTime < 0 )
	{
		prevTime = currentTime;
	}

	var deltaTime = currentTime - prevTime;
	prevTime = currentTime;
	
	var deltaTimeInSeconds = deltaTime / 1000;
	accumulator += deltaTimeInSeconds;
	
	var physicsDeltaTime = 1.0 / physicsFreq;
	while( accumulator >= physicsDeltaTime )
	{
		updateScene( physicsDeltaTime );
		
		accumulator -= physicsDeltaTime;
	}
	
	renderScene();
	
	requestAnimationFrame( animationFrame );
}

function initScene()
{
	fireworksData = JSON.parse( fireworksJson );
	for( var i = 0; i < fireworksData.fireworks.sequence.length; i++ )
	{
		var pd = new ParticleData();
		pd.spawnTime = fireworksData.fireworks.sequence[i].time;
		pd.initialPosition = fireworksData.fireworks.sequence[i].position;
		pd.initialVelocity = fireworksData.fireworks.sequence[i].velocity;
		pd.lifeTime = fireworksData.fireworks.sequence[i].lifeTime;
		pd.hasSpawned = false;
		
		particlePrototypes.push( pd );
	}
	
	gl.enable( gl.BLEND );
	gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );
	
	rectVbo = createUnitCircleVbo( gl, circleNumSlices );
	
	rectVao = gl.createVertexArray();
	gl.bindVertexArray( rectVao );
	
	var positionAttributeLocation = gl.getAttribLocation( glProgram, "a_position" );
	gl.enableVertexAttribArray( positionAttributeLocation );
	
	var size = 2;
	var type = gl.FLOAT;
	var normalize = false;
	var stride = 0;
	var offset = 0;
	gl.vertexAttribPointer( positionAttributeLocation, size, type, normalize, stride, offset );
	
	gl.clearColor( 0, 0, 0, 1 );
}

function updateScene( deltaTime )
{
	for( var k = 0; k < particlePrototypes.length; k++ )
	{
		if( !particlePrototypes[k].hasSpawned && ( particlePrototypes[k].spawnTime <= timeElapsed ) && ( timeElapsed <= particlePrototypes[k].spawnTime + particlePrototypes[k].lifeTime ) )
		{
			var temp2 = new Particle();
			temp2.initialPosition = vec3.clone( fireworksData.fireworks.sequence[k].position );
			temp2.position = vec3.clone( temp2.initialPosition );
			
			temp2.initialVelocity = vec3.clone( fireworksData.fireworks.sequence[k].velocity );
			temp2.velocity = vec3.clone( temp2.initialVelocity );
			
			temp2.subParticleCount = 3 + randomInt( 17 );
			temp2.size = 5;
			temp2.lifeTime = 1 + Math.random() * 2;
			temp2.color = Color.random( false );
			temp2.particleLayer = 1 + randomInt( 2 );
			temp2.spawnTimestamp = particlePrototypes[k].spawnTime;
			temp2.particlePrototype = particlePrototypes[k];
			
			particleList.push( temp2 );
			
			particlePrototypes[k].hasSpawned = true;
		}
	}
	
	for( var i = 0; i < particleList.length; i++ )
	{
		var part = particleList[i];
		
		//part.remainingTime -= deltaTime;
		var relativeTimeElapsed = timeElapsed - part.spawnTimestamp;
		
		if( relativeTimeElapsed < 0 )
		{
			// This means we've come back in time, and this
			// particle should not have existed yet. Thus, delete it.
			if( particleList[i].particlePrototype != null )
			{
				particleList[i].particlePrototype.hasSpawned = false;
			}
			
			particleList[i] = particleList[particleList.length - 1];
			particleList.pop();
		}
		else if( relativeTimeElapsed >= part.lifeTime )
		{
			if( part.particleLayer > 0 )
			{
				var subParticleCount = part.subParticleCount;
				var theta = 2 * Math.PI	/ subParticleCount;
				
				var velocityModifier = 50 + Math.random() * 50;
				// Summon sub-particles
				var subParticleColor = Color.random( false );
				var subParticleLifetime = 1 + Math.random() * 2;
				for( var j = 0; j < part.subParticleCount; j++ )
				{
					var temp = new Particle();
					temp.particleLayer = part.particleLayer - 1;
					temp.subParticleCount = 3 + randomInt( 17 );
					temp.size = part.size;
					
					var velX = Math.cos( theta * j );
					var velY = Math.sin( theta * j );
					
					temp.initialPosition = part.position;
					temp.position = vec3.clone( temp.initialPosition );
					
					temp.initialVelocity = vec3.scalarMul( vec3.create( velX, velY, 0 ), velocityModifier );
					temp.velocity = vec3.clone( temp.initialVelocity );
					
					temp.lifeTime = subParticleLifetime;
					temp.color = subParticleColor;
					temp.spawnTimestamp = timeElapsed;
					
					particleList.push( temp );
				}
			}
			
			if( particleList[i].particlePrototype != null )
			{
				particleList[i].particlePrototype.hasSpawned = false;
			}
			
			particleList[i] = particleList[particleList.length - 1];
			particleList.pop();
			
			i--;
		}
		else
		{
			var currentPosition = part.position;
			
			if( part.trail.length > part.maxTrailSize )
			{
				part.trail.shift();
			}
			part.trail.push( currentPosition );
			
			part.velocity = vec3.add( part.initialVelocity, vec3.scalarMul( gravityVec, relativeTimeElapsed ) );
			part.position = vec3.add( part.initialPosition, vec3.add( vec3.scalarMul( part.initialVelocity, relativeTimeElapsed ), vec3.scalarMul( gravityVec, relativeTimeElapsed * relativeTimeElapsed * 0.5 ) ) );
			
			//var velocityNext = vec3.add( part.velocity, vec3.scalarMul( gravityVec, deltaTime ) );
			//part.position = vec3.add( part.position, vec3.scalarMul( vec3.scalarMul( vec3.add( part.velocity, velocityNext ), 0.5 ), deltaTime ) );
			//part.velocity = velocityNext;
		}
	}
}

function renderScene()
{
	gl.clear( gl.COLOR_BUFFER_BIT );
	
	for( var i = 0; i < particleList.length; i++ )
	{
		var part = particleList[i];
		
		//renderParticleTrail( gl, part );
		renderParticle( gl, part );
	}
}

function renderParticle( gl, particle )
{
	gl.useProgram( glProgram );
	
	gl.bindVertexArray( rectVao );
	
	var positionMatrix = mat3.translation( particle.position[0], particle.position[1] );
	var moveOriginMatrix = mat3.translation( -particle.size / 2, -particle.size / 2 );
	var orthoMatrix = mat3.ortho( 0, gl.canvas.clientWidth, 0, gl.canvas.clientHeight );
	
	var matrix = mat3.multiply( mat3.multiply( mat3.multiply( orthoMatrix, positionMatrix ), moveOriginMatrix ), mat3.scaling( particle.size, particle.size ) );
	
	var primitiveType = gl.TRIANGLE_FAN;
	var offset = 0;
	var count = circleNumSlices + 2;
	
	var relativeTimeElapsed = timeElapsed - particle.spawnTimestamp;
	
	var r = particle.color[0] / 255.0;
	var g = particle.color[1] / 255.0;
	var b = particle.color[2] / 255.0;
	var a = 1.0;
	if( particle.particleLayer == 0 )
	{
		a = relativeTimeElapsed / particle.lifeTime;
	}
	
	var colorLocation = gl.getUniformLocation( glProgram, "u_color" );
	var matrixLocation = gl.getUniformLocation( glProgram, "u_matrix" );
	
	gl.uniform4f( colorLocation, r, g, b, a );
	gl.uniformMatrix3fv( matrixLocation, false, matrix );
	gl.drawArrays( primitiveType, offset, count );
}

function renderParticleTrail( gl, particle )
{
	gl.useProgram( glProgram );
	
	gl.bindVertexArray( rectVao );
	
	var primitiveType = gl.TRIANGLE_FAN;
	var offset = 0;
	var count = circleNumSlices + 2;
	
	var colorLocation = gl.getUniformLocation( glProgram, "u_color" );
	var matrixLocation = gl.getUniformLocation( glProgram, "u_matrix" );
	
	var relativeTimeElapsed = timeElapsed - particle.spawnTimestamp;
	
	var trailLength = particle.trail.length;
	for( var j = 0; j < trailLength; j++ )
	{
		var trailWidth = ( particle.size / particle.maxTrailSize / 2 ) * ( j + 1 );
		var positionMatrix = mat3.translation( particle.trail[j][0], particle.trail[j][1] );
		
		var orthoMatrix = mat3.ortho( 0, gl.canvas.clientWidth, 0, gl.canvas.clientHeight );
		var moveOriginMatrix = mat3.translation( -particle.size / 2, -particle.size / 2 );
		
		var matrix = mat3.multiply( mat3.multiply( mat3.multiply( orthoMatrix, positionMatrix ), moveOriginMatrix ), mat3.scaling( trailWidth, trailWidth ) );
		
		var col = particle.color.slice( 0 );
		col[3] = ( col[3] / particle.maxTrailSize ) * ( j + 1 );
		if( particle.particleLayer == 0 )
		{
			col[3] = col[3] * ( relativeTimeElapsed / particle.lifeTime );
		}
		
		gl.uniform4f( colorLocation, col[0] / 255.0, col[1] / 255.0, col[2] / 255.0, col[3] / 255.0 );
		gl.uniformMatrix3fv( matrixLocation, false, matrix );
		gl.drawArrays( primitiveType, offset, count );
	}
}

function randomInt( range )
{
	return Math.floor( Math.random() * range );
}

function main()
{
	var slider = document.getElementById( "timeSlider" );
	var timeDisplay = document.getElementById( "timeDisplayDiv" );
	timeDisplay.innerHTML = slider.value;
	slider.oninput = function()
	{
		timeElapsed = this.value;
		timeDisplay.innerHTML = this.value;
	};
	
	var canvas = document.getElementById( "glCanvas" );
	gl = canvas.getContext( "webgl2" );
	if( gl )
	{
		var vertexShader = createShader( gl, gl.VERTEX_SHADER, vertexShaderSource );
		var fragmentShader = createShader( gl, gl.FRAGMENT_SHADER, fragmentShaderSource );
		
		glProgram = createProgram( gl, vertexShader, fragmentShader );
		
		initScene();
		
		requestAnimationFrame( animationFrame );
	}
}

main();