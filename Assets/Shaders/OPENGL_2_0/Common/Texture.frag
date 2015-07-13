varying vec2 vUV;

uniform sampler2D uColorTexture;

void main() {
	vec2 uv = vec2(vUV.x, 1.0 - vUV.y);
	gl_FragColor = texture2D(uColorTexture, uv);
}
