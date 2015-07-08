attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec3 aColor;

uniform mat4 uWorld;
uniform mat4 uView;
uniform mat4 uProj;

varying vec3 vColor;
varying vec3 vNormal;

mat3 m3( mat4 m )
{
	mat3 result;

	result[0][0] = m[0][0];
	result[0][1] = m[0][1];
	result[0][2] = m[0][2];


	result[1][0] = m[1][0];
	result[1][1] = m[1][1];
	result[1][2] = m[1][2];

	result[2][0] = m[2][0];
	result[2][1] = m[2][1];
	result[2][2] = m[2][2];

	return result;
}

void main() {
	vec4 pos = vec4(aPosition, 1.0);

	mat4 modelView = uView * uWorld;

	gl_Position = (uProj * modelView) * pos;

	vColor = aColor;
	//vNormal = normalize(m3(modelView) * aNormal);
	vNormal = aNormal;
}
