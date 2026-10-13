import * as THREE from 'three';

/** Shared materials — creating these once keeps shader compiles and draw state minimal. */
export const characterMaterial = new THREE.MeshLambertMaterial({ vertexColors: true });
export const worldColorMaterial = new THREE.MeshLambertMaterial({ vertexColors: true });
export const beaconMaterial = new THREE.MeshBasicMaterial({ color: '#f2b705', transparent: true, opacity: 0.95, depthWrite: false });
export const ringMaterial = new THREE.MeshBasicMaterial({ color: '#f2b705', transparent: true, opacity: 0.5, depthWrite: false, side: THREE.DoubleSide });
