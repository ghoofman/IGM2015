attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec4 aBones;
attribute vec4 aWeights;
attribute vec3 aColor;

uniform mat4 uWorld;
uniform mat4 uView;
uniform mat4 uProj;
uniform mat4 uBones[62];

varying vec3 vColor;
varying vec3 vNormal;

void main() {
	vec4 pos = vec4(aPosition, 1.0);
	vec4 norm = vec4(aNormal, 0.0);
	
	vec4 newPosition = pos;
	vec4 newNormal = norm;
	
	
	
	
	
	int index = int(aBones.x);
	newPosition = (uBones[index] * pos) * aWeights.x;
	//newPosition = (uBones[0] * pos) * 1.0;
	newNormal = (uBones[index] * norm) * aWeights.x;

	// index = int(aBones.y);
	// newPosition = (uBones[index] * pos) * aWeights.y + newPosition;
	// newNormal = (uBones[index] * norm) * aWeights.y + newNormal;
	
	
	// index = int(aBones.z);
	// newPosition = (uBones[index] * pos) * aWeights.z + newPosition;
	// newNormal = (uBones[index] * norm) * aWeights.z + newNormal;
	
	
	// index = int(aBones.w);
	// newPosition = (uBones[index] * pos) * aWeights.w + newPosition;
	// newNormal = (uBones[index] * norm) * aWeights.w + newNormal;

	
	
	vec4 worldPos = uWorld * newPosition;
	gl_Position = (uProj * uView) * worldPos; 
	
	vColor = aColor;
	vNormal = normalize(uView * uWorld * norm).xyz;
}
