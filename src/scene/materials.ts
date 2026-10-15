import * as THREE from 'three';

/** Shared materials — creating these once keeps shader compiles and draw state minimal. */
/** Characters: Phong gives skin and fabric a soft highlight (more dimensional than Lambert, cheaper than Standard). */
/** Low graphics tier: flat Lambert shading for characters. */
export const characterMaterialLow = new THREE.MeshLambertMaterial({ vertexColors: true });
export const characterMaterial = new THREE.MeshPhongMaterial({ vertexColors: true, shininess: 14, specular: new THREE.Color('#2a241e') });
export const worldColorMaterial = new THREE.MeshLambertMaterial({ vertexColors: true });
export const beaconMaterial = new THREE.MeshBasicMaterial({ color: '#f2b705', transparent: true, opacity: 0.95, depthWrite: false });
export const travelBeaconMaterial = new THREE.MeshBasicMaterial({ color: '#3fc1c9', transparent: true, opacity: 0.95, depthWrite: false });
export const ringMaterial = new THREE.MeshBasicMaterial({ color: '#f2b705', transparent: true, opacity: 0.5, depthWrite: false, side: THREE.DoubleSide });
