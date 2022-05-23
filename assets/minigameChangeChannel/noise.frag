#extension GL_OES_standard_derivatives : enable

precision highp float;

uniform float time;
uniform vec2 resolution;

float hash(vec2 p) { 
	return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x)))); 
}

void main( void ) {

	vec2 uv = ( gl_FragCoord.xy / resolution.xy );

	float noise = hash(uv + vec2(time));

	gl_FragColor = vec4(noise, noise, noise, 1.0 );

}