varying float gradient;


//  Function from Iñigo Quiles
//  www.iquilezles.org/www/articles/functions/functions.htm
float parabola( float x, float k ){
    return pow( 4.0*x*(1.0-x), k );
}

float cubicPulse( float c, float w, float x ){
    x = abs(x - c);
    if( x>w ) return 0.0;
    x /= w;
    return 1.0 - x*x*(3.0-2.0*x);
}

float pcurve( float x, float a, float b ){
    float k = pow(a+b,a+b) / (pow(a,a)*pow(b,b));
    return k * pow( x, a ) * pow( 1.0-x, b );
}

void main(void) {

	vec2 vUv = uv;
	// gradient = cubicPulse(0.25,0.2,vUv.y);
    gradient = pcurve(vUv.y,6.0,12.0);

	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

}
