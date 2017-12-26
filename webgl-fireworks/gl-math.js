var mat3 =
{
	translation: function translation( tx, ty )
	{
		return [1, 0, 0,
			0, 1, 0,
			tx, ty, 1];
	},
	
	rotation: function rotation( angleInRadians )
	{
		var c = Math.cos( angleInRadians );
		var s = Math.sin( angleInRadians );
		
		return [c, s, 0,
			-s, c, 0,
			0, 0, 1];
	},
	
	scaling: function scaling( sx, sy )
	{
		return [sx, 0, 0,
			0, sy, 0,
			0, 0, 1];
	},
	
	identity: function identity()
	{
		return [1, 0, 0,
			0, 1, 0,
			0, 0, 1];
	},
	
	multiply: function multiply( a, b )
	{
		return [
			a[0] * b[0] + a[3] * b[1] + a[6] * b[2],
			a[1] * b[0] + a[4] * b[1] + a[7] * b[2],
			a[2] * b[0] + a[5] * b[1] + a[8] * b[2],
			
			a[0] * b[3] + a[3] * b[4] + a[6] * b[5],
			a[1] * b[3] + a[4] * b[4] + a[7] * b[5],
			a[2] * b[3] + a[5] * b[4] + a[8] * b[5],
			
			a[0] * b[6] + a[3] * b[7] + a[6] * b[8],
			a[1] * b[6] + a[4] * b[7] + a[7] * b[8],
			a[2] * b[6] + a[5] * b[7] + a[8] * b[8]
		];
	},
	
	ortho: function ortho( l, r, b, t )
	{
		var width = r - l;
		var height = t - b;
		
		return [2 / width, 0, 0,
			0, 2 / height, 0,
			-( l + r ) / width, -( t + b ) / height, 1];
	}
};

var mat4 =
{
	translation: function( tx, ty, tz )
	{
		return [1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			tx, ty, tz, 1];
	},
	
	rotationX: function( angleInRadians )
	{
		var c = Math.cos( angleInRadians );
		var s = Math.sin( angleInRadians );
		
		return [1, 0, 0, 0,
			0, c, s, 0,
			0, -s, c, 0,
			0, 0, 0, 1];
	},
	
	rotationY: function( angleInRadians )
	{
		var c = Math.cos( angleInRadians );
		var s = Math.sin( angleInRadians );
		
		return [c, 0, -s, 0,
			0, 1, 0, 0,
			s, 0, c, 0,
			0, 0, 0, 1];
	},
	
	rotationZ: function( angleInRadians )
	{
		var c = Math.cos( angleInRadians );
		var s = Math.sin( angleInRadians );
		
		return [c, s, 0, 0,
			-s, c, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1];
	},
	
	scaling: function scaling( sx, sy, sz )
	{
		return [sx, 0, 0, 0,
			0, sy, 0, 0,
			0, 0, sz, 0,
			0, 0, 0, 1];
	},
	
	identity: function identity()
	{
		return [1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1];
	},
	
	multiply: function multiply( a, b )
	{
		return [
			a[0] * b[0] + a[4] * b[1] + a[8] * b[2] + a[12] * b[3],
			a[1] * b[0] + a[5] * b[1] + a[9] * b[2] + a[13] * b[3],
			a[2] * b[0] + a[6] * b[1] + a[10] * b[2] + a[14] * b[3],
			a[3] * b[0] + a[7] * b[1] + a[11] * b[2] + a[15] * b[3],
			
			a[0] * b[4] + a[4] * b[5] + a[8] * b[6] + a[12] * b[7],
			a[1] * b[4] + a[5] * b[5] + a[9] * b[6] + a[13] * b[7],
			a[2] * b[4] + a[6] * b[5] + a[10] * b[6] + a[14] * b[7],
			a[3] * b[4] + a[7] * b[5] + a[11] * b[6] + a[15] * b[7],
			
			a[0] * b[8] + a[4] * b[9] + a[8] * b[10] + a[12] * b[11],
			a[1] * b[8] + a[5] * b[9] + a[9] * b[10] + a[13] * b[11],
			a[2] * b[8] + a[6] * b[9] + a[10] * b[10] + a[14] * b[11],
			a[3] * b[8] + a[7] * b[9] + a[11] * b[10] + a[15] * b[11],
			
			a[0] * b[12] + a[4] * b[13] + a[8] * b[14] + a[12] * b[15],
			a[1] * b[12] + a[5] * b[13] + a[9] * b[14] + a[13] * b[15],
			a[2] * b[12] + a[6] * b[13] + a[10] * b[14] + a[14] * b[15],
			a[3] * b[12] + a[7] * b[13] + a[11] * b[14] + a[15] * b[15]
		];
	},
	
	// Assumes right handed coordinate system
	ortho: function ortho( l, r, b, t, n, f )
	{
		var width = r - l;
		var height = t - b;
		var depth = n - f;
		
		return [2 / width, 0, 0,
			0, 2 / height, 0, 0,
			0, 0, 2 / depth, 0,
			-( l + r ) / 2, -( t + b ) / 2, -( n + f ) / 2, 1];
	}
	
	// Persp
};

var vec3 =
{
	create: function( x, y, z )
	{
		return [x, y, z];
	},
	
	add: function add( a, b )
	{
		return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
	},
	
	scalarMul: function scalarMul( a, s )
	{
		return [a[0] * s, a[1] * s, a[2] * s];
	},
	
	elemWiseMul: function elemWiseMul( a, b )
	{
		return [a[0] * b[0], a[1] * b[1], a[2] * b[2]];
	},
	
	dot: function dot( a, b )
	{
		return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
	},
	
	cross: function cross( a, b )
	{
		return [a[1] * b[2] - a[2] * b[1],
			a[2] * b[0] - a[0] * b[2],
			a[0] * b[1] - a[1] * b[0]];
	},
	
	magnitude2: function magnitude2( a )
	{
		return dot( a, a );
	},
	
	magnitude: function magnitude( a )
	{
		return Math.sqrt( magnitude2( a ) );
	}
};