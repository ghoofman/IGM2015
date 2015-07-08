varying vec3 vColor; 
varying vec3 vNormal;

void main() {
	vec3 LightDirection = normalize(vec3(2, -1, 1));

	vec3 LightColor = vec3(1,1,1);
	float LightPower = 0.6;
	
	vec3 MaterialDiffuseColor =  vColor;
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

		//gl_FragColor = vec4(vNormal, 1.0);
}
