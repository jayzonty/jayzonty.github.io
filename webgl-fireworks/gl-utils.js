function createShader( gl, type, source )
{
	var shader = gl.createShader( type );
	gl.shaderSource( shader, source );
	gl.compileShader( shader );
	
	var success = gl.getShaderParameter( shader, gl.COMPILE_STATUS );
	if( success )
	{
		return shader;
	}
	
	console.log( gl.getShaderInfoLog( shader ) );
	gl.deleteShader( shader );
}

function createProgram( gl, vertexShader, fragmentShader )
{
	var program = gl.createProgram();
	
	gl.attachShader( program, vertexShader );
	gl.attachShader( program, fragmentShader );
	gl.linkProgram( program );
	
	var success = gl.getProgramParameter( program, gl.LINK_STATUS );
	if( success )
	{
		return program;
	}
	
	console.log( gl.getProgramInfoLog( program ) );
	gl.deleteProgram( program );
}

function createUnitCircleVbo( gl, numSlices )
{
	var numVertices = numSlices * 2;
	var theta = 2 * Math.PI / numSlices;
	
	var vertices = [];
	
	vertices.push( 0 );
	vertices.push( 0 );
	
	for( var i = 0; i <= numSlices; i++ )
	{
		vertices.push( Math.cos( theta * i ) );
		vertices.push( Math.sin( theta * i ) );
	}
	
	var vbo = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, vbo );
	
	gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( vertices ), gl.STATIC_DRAW );
	
	return vbo;
}