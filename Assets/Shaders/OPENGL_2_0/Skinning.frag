uniform vec4 uColor;

varying vec2 vUV;
varying vec3 vNormal;
varying vec3 vParams;

uniform sampler2D uColorTexture;

void main() {
	vec3 LightDirection = normalize(vec3(2, -1, -0.5));

	vec3 LightColor = vec3(1,1,1);
	float LightPower = 0.6;

	vec2 v = vec2(vUV.x, 1.0 - vUV.y);
	vec3 MaterialDiffuseColor =  texture2D(uColorTexture, v).rgb;
	vec3 MaterialAmbientColor = vec3(0.6,0.6,0.6) * MaterialDiffuseColor;


	vec3 n = normalize( -vNormal );
	vec3 l = normalize( LightDirection );
	float d = dot( n, l );
	float cosTheta = max( 0.0, d);


	gl_FragColor =
		vec4(
			MaterialAmbientColor +
			MaterialDiffuseColor * LightColor * LightPower * cosTheta,
			1.0);
}
