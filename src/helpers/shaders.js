import * as THREE from 'three'
export const toonShader = {
    uniforms: {
        uColor: { value: new THREE.Color('#ffffff') },
        uLight: { value: new THREE.Vector3(5,5,5) }
    },
    vertexShader: `
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * vec4(vPosition, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 uColor;
    uniform vec3 uLight;

    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      float intensity = dot(normalize(vNormal), normalize(uLight));
      float levels = floor(intensity * 3.0) / 3.0;

      vec3 color = mix(vec3(0.0), uColor, levels);
      gl_FragColor = vec4(color, 1.0);
    }
  `
}