import * as THREE from './vendor/three/three.module.js';
import {OrbitControls} from './vendor/three/OrbitControls.js';
import {RoomEnvironment} from './vendor/three/RoomEnvironment.js';

// A procedural concept model: no physical packaging or food specification is inferred.
const params=new URLSearchParams(location.search),id=params.get('producto')||'umami-guisante-comun';
const product=window.UMAMI_PRODUCTS.find(p=>p.id===id&&p.brand==='Umami')||window.UMAMI_PRODUCTS.find(p=>p.id==='umami-guisante-comun');
const $=id=>document.getElementById(id),stage=$('stage'),canvas=$('bag-canvas');
document.body.dataset.embedded=String(params.get('embed')==='1');$('bag-name').textContent=product.name;document.title='Umami · '+product.name+' · 3D';$('full-view').href='bolsa-3d.html?producto='+encodeURIComponent(product.id);
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
let renderer,controls,observer,disposed=false,frame=0,opening=0,targetOpening=0,motion=null;
const resources=new Set();const own=x=>(resources.add(x),x);
try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'low-power'});}catch{fallback('Tu navegador no permite mostrar esta vista 3D. Puedes seguir viendo las fotos del producto en su ficha.');}
if(renderer)start();
function fallback(message){$('loading').textContent=message;canvas.hidden=true;document.querySelectorAll('.controls button').forEach(b=>b.disabled=true);$('viewer-status').textContent='Vista 3D no disponible';}
function start(){
renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.85;
const scene=new THREE.Scene();scene.environmentIntensity=.35;const camera=new THREE.PerspectiveCamera(35,1,.1,50);camera.position.set(1.6,.7,6.6);
const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment(),environment=pmrem.fromScene(room,.04);scene.environment=environment.texture;room.dispose();pmrem.dispose();
scene.add(new THREE.HemisphereLight(0xffffff,0xaaa18c,1.2));const light=new THREE.DirectionalLight(0xffffff,2);light.position.set(-3,5,6);scene.add(light);const fill=new THREE.DirectionalLight(0xffffff,.6);fill.position.set(4,2,-3);scene.add(fill);
controls=new OrbitControls(camera,canvas);controls.enablePan=false;controls.enableZoom=true;controls.enableDamping=false;controls.minDistance=5;controls.maxDistance=12;controls.minPolarAngle=.13;controls.maxPolarAngle=Math.PI*.73;controls.target.set(0,0,0);controls.enableRotate=true;controls.rotateSpeed=.65;controls.zoomSpeed=.6;
const bag=new THREE.Group();scene.add(bag);
const black=own(new THREE.MeshStandardMaterial({color:0x111311,roughness:.43,metalness:.08,side:THREE.DoubleSide}));
const yellow=own(new THREE.MeshStandardMaterial({color:0xffbf3f,roughness:.44,metalness:.04,side:THREE.DoubleSide}));
const texture=labelTexture(product.name,false),backTexture=labelTexture(product.name,true);
const frontMaterial=own(new THREE.MeshStandardMaterial({map:texture,roughness:.45,metalness:.04,transparent:true,depthWrite:false,side:THREE.DoubleSide,alphaTest:.03}));
const backMaterial=own(new THREE.MeshStandardMaterial({map:backTexture,roughness:.45,metalness:.04,side:THREE.DoubleSide}));
const front=new THREE.Mesh(own(new THREE.PlaneGeometry(2.5,3.6,48,56)),frontMaterial),back=new THREE.Mesh(own(new THREE.PlaneGeometry(2.5,3.6,48,56)),backMaterial);front.renderOrder=2;back.renderOrder=0;bag.add(front,back);
// Separate film seals and rim leave an actual aperture when opened.
const bottom=new THREE.Mesh(own(new THREE.BoxGeometry(2.5,.095,.08)),black);bottom.position.y=-1.8;bag.add(bottom);
const seal=new THREE.Mesh(own(new THREE.BoxGeometry(2.5,.11,.055)),yellow);seal.position.y=1.82;bag.add(seal);
const rimMaterial=yellow;let rim=null;
const contents=new THREE.Group();bag.add(contents);buildFood(contents,product.id);
// Soft contact shadow, drawn once. No external texture or tracking requests.
const shadowCanvas=document.createElement('canvas');shadowCanvas.width=256;shadowCanvas.height=256;const sx=shadowCanvas.getContext('2d');const gradient=sx.createRadialGradient(128,128,8,128,128,125);gradient.addColorStop(0,'rgba(30,27,18,.25)');gradient.addColorStop(1,'rgba(30,27,18,0)');sx.fillStyle=gradient;sx.fillRect(0,0,256,256);
const shadow=new THREE.Mesh(own(new THREE.PlaneGeometry(4.8,2.8)),own(new THREE.MeshBasicMaterial({map:own(new THREE.CanvasTexture(shadowCanvas)),transparent:true,depthWrite:false})));shadow.rotation.x=-Math.PI/2;shadow.position.y=-1.88;scene.add(shadow);

function deform(){
 for(const [mesh,sign] of [[front,1],[back,-1]]){
  const pos=mesh.geometry.attributes.position,uv=mesh.geometry.attributes.uv;
  for(let i=0;i<pos.count;i++){
   const u=uv.getX(i),v=uv.getY(i),edge=Math.sin(Math.PI*u),vertical=Math.pow(Math.max(0,Math.sin(Math.PI*v)),.48);
   const width=1.25*(.91+.09*Math.sin(Math.PI*v)),x=(u-.5)*2*width;
   const wrinkle=.018*Math.sin(u*52+v*31)*Math.pow(Math.abs(u-.5)*2,4)*vertical;
   const mouth=opening*.58*Math.pow(Math.max(0,(v-.62)/.38),2)*Math.sqrt(Math.max(0,1-Math.pow((u-.5)*2,2)));
   pos.setXYZ(i,sign*x,(v-.5)*3.6-opening*.13*Math.pow(v,8),sign*(.026+.54*edge*vertical+wrinkle+mouth));
  }
  pos.needsUpdate=true;mesh.geometry.computeVertexNormals();
 }
 if(rim){bag.remove(rim);rim.geometry.dispose();}
 const points=[];for(let i=0;i<=80;i++){const a=i/80*Math.PI*2;points.push(new THREE.Vector3(1.14*Math.cos(a),1.8-opening*.13,(.026+opening*.58)*Math.sin(a)));}
 const curve=new THREE.CatmullRomCurve3(points,true);rim=new THREE.Mesh(new THREE.TubeGeometry(curve,80,.018,5,true),rimMaterial);bag.add(rim);
 seal.visible=opening<.08;contents.position.y=opening*.08;
}
function render(){if(disposed)return;renderer.render(scene,camera);}
function resize(){const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();render();if(params.get('embed')==='1')parent.postMessage({type:'umami-viewer-size',height:Math.ceil(document.querySelector('.viewer').getBoundingClientRect().height)+4},location.origin);}
observer=new ResizeObserver(resize);observer.observe(stage);
function finishStatus(){const open=targetOpening===1;$('open-bag').textContent=open?'Cerrar bolsa':'Abrir bolsa';$('open-bag').setAttribute('aria-pressed',String(open));$('viewer-status').textContent=open?'Bolsa abierta · gira para explorar el contenido':'Bolsa cerrada';}
function easeOut(t){let lo=0,hi=1,u=t;for(let i=0;i<14;i++){u=(lo+hi)/2;const x=3*(1-u)*(1-u)*u*.23+3*(1-u)*u*u*.32+u*u*u;if(x<t)lo=u;else hi=u;}return 3*(1-u)*(1-u)*u+3*(1-u)*u*u+u*u*u;}
function animate(now){frame=0;if(disposed||!motion)return;const t=reduceMotion.matches?1:Math.min(1,(now-motion.start)/600),e=t===1?1:easeOut(t);opening=THREE.MathUtils.lerp(motion.from,targetOpening,e);deform();if(motion.camera){camera.position.lerpVectors(motion.camera.from,motion.camera.to,e);controls.target.lerpVectors(motion.camera.targetFrom,motion.camera.targetTo,e);controls.update();}render();if(t<1)frame=requestAnimationFrame(animate);else{motion=null;finishStatus();}}
function setOpen(value,top=false){targetOpening=value;cancelAnimationFrame(frame);motion={start:performance.now(),from:opening,camera:top?{from:camera.position.clone(),to:new THREE.Vector3(2.1,4.6,4.7),targetFrom:controls.target.clone(),targetTo:new THREE.Vector3(0,.4,0)}:null};finishStatus();if(reduceMotion.matches)animate(performance.now()+600);else frame=requestAnimationFrame(animate);}
function cancelCamera(){if(motion)motion.camera=null;}
function turn(angle){cancelCamera();const offset=camera.position.clone().sub(controls.target);offset.applyAxisAngle(new THREE.Vector3(0,1,0),angle);camera.position.copy(controls.target).add(offset);controls.update();render();}
controls.addEventListener('start',cancelCamera);controls.addEventListener('change',render);
$('open-bag').addEventListener('click',()=>setOpen(targetOpening?0:1,!targetOpening));$('top-view').addEventListener('click',()=>setOpen(1,true));$('turn-left').addEventListener('click',()=>turn(-Math.PI/6));$('turn-right').addEventListener('click',()=>turn(Math.PI/6));
$('reset-view').addEventListener('click',()=>{cancelAnimationFrame(frame);motion=null;opening=targetOpening=0;camera.position.set(1.6,.7,6.6);controls.target.set(0,0,0);deform();controls.update();finishStatus();render();});
canvas.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-'].includes(e.key)){e.preventDefault();cancelCamera();if(e.key==='ArrowLeft'||e.key==='ArrowRight')turn(e.key==='ArrowLeft'?-.26:.26);else if(e.key==='+'||e.key==='='||e.key==='-'){const v=camera.position.clone().sub(controls.target);v.setLength(THREE.MathUtils.clamp(v.length()*(e.key==='-'?1.12:.89),5,12));camera.position.copy(controls.target).add(v);}else{const v=camera.position.clone().sub(controls.target),s=new THREE.Spherical().setFromVector3(v);s.phi=THREE.MathUtils.clamp(s.phi+(e.key==='ArrowUp'?-.14:.14),.13,Math.PI*.73);camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(s));}controls.update();render();}});
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();fallback('La vista 3D se ha interrumpido. Recarga para volver a explorarla o consulta las fotografías de la ficha.');dispose();});
function dispose(){if(disposed)return;disposed=true;cancelAnimationFrame(frame);observer?.disconnect();controls.dispose();scene.traverse(o=>{if(o.isMesh){o.geometry.dispose();const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>{m.map?.dispose();m.dispose();});}});environment.dispose();renderer.dispose();}
addEventListener('pagehide',dispose,{once:true});
deform();resize();$('loading').hidden=true;document.querySelectorAll('.controls button').forEach(b=>b.disabled=false);render();
}

function labelTexture(name,back){
 const c=document.createElement('canvas');c.width=1024;c.height=1536;const x=c.getContext('2d');
 x.fillStyle='#111311';x.fillRect(0,0,1024,1536);x.fillStyle='#ffbf3f';x.fillRect(0,0,1024,490);
 x.fillStyle='#111311';x.textAlign='center';x.font='160px Verdana';x.fillText('umami',512,330);
 x.fillStyle='#ffffff';let label=name.replace(/\s+(100|150) G$/,'').replace(' 300/400 G RETRACTILADOS','').replace(' 100/200','');if(label.startsWith('GUISANTE'))label='GUISANTES';
 let size=65;x.font='bold '+size+'px Verdana';while(x.measureText(label).width>870&&size>29){size--;x.font='bold '+size+'px Verdana';}x.fillText(label,512,620);
 if(back){x.fillStyle='#111311';x.fillRect(0,0,1024,1536);x.fillStyle='#ffffff';x.font='90px Verdana';x.fillText('umami',512,210);x.font='bold 36px Verdana';x.fillText('INFORMACIÓN DEL PRODUCTO',512,390);x.font='26px Verdana';['Ingredientes','Información nutricional','Conservación','Lote y fecha'].forEach((text,i)=>{x.fillText(text,512,550+i*180);x.font='22px Verdana';x.fillText('Pendiente de validación',512,595+i*180);x.font='26px Verdana';});x.font='22px Verdana';x.fillText('PROPUESTA DE ENVASE',512,1400);}
 else{x.clearRect(84,735,856,645);x.fillStyle='rgba(225,236,218,.06)';x.fillRect(84,735,856,645);}
 // Fine sealed ridges are baked into the map, not animated DOM elements.
 x.fillStyle='rgba(0,0,0,.09)';for(let y=12;y<55;y+=7)x.fillRect(12,y,1000,2);for(let y=1480;y<1525;y+=7)x.fillRect(12,y,1000,2);
 const map=own(new THREE.CanvasTexture(c));map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=4;return map;
}
function buildFood(group,id){
 let seed=127;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 const matrix=new THREE.Object3D();
 function instances(geometry,count,color,shape='round'){
  const mat=own(new THREE.MeshStandardMaterial({color,roughness:.93,metalness:0}));const mesh=new THREE.InstancedMesh(own(geometry),mat,count);let made=0;
  for(let i=0;i<count*8&&made<count;i++){
   const margin=id.includes('guisante')?.12:.28;
   const y=-1.45+random()*2.7,x=(random()-.5)*(2.15-margin),z=(random()-.5)*.9;
   const v=(y+1.8)/3.6,width=1.25*(.91+.09*Math.sin(Math.PI*v)),edge=Math.cos(Math.PI*x/(2*width)),depth=.54*Math.pow(Math.max(0,Math.sin(Math.PI*v)),.48)*edge-margin;
   if(depth<=0||Math.abs(z)>depth)continue;
   matrix.position.set(x,y,z);matrix.rotation.set(random()*Math.PI,random()*Math.PI,random()*Math.PI);const scale=.86+random()*.28;matrix.scale.setScalar(scale);matrix.updateMatrix();mesh.setMatrixAt(made,matrix.matrix);mesh.setColorAt(made,new THREE.Color(color).multiplyScalar(.75+random()*.36));made++;
  }
  mesh.count=made;mesh.instanceMatrix.needsUpdate=true;if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;group.add(mesh);
 }
 if(id.includes('guisante')){instances(new THREE.SphereGeometry(.085,10,8),1250,0x76a833);instances(new THREE.SphereGeometry(.028,5,4),250,0xc5d3a0);}
 else if(id.includes('patata'))instances(new THREE.BoxGeometry(.105,.65,.105),260,0xeac47a);
 else if(id.includes('brocoli')){const g=new THREE.SphereGeometry(.13,7,6);instances(g,360,0x3d793d);instances(new THREE.CylinderGeometry(.06,.085,.32,7),95,0x88a661);}
 else if(id.includes('coliflor')){instances(new THREE.SphereGeometry(.13,7,6),360,0xe5dfbd);instances(new THREE.CylinderGeometry(.06,.08,.26,7),80,0xc7c2a3);}
 else if(id.includes('menestra')||id.includes('ensaladilla')){instances(new THREE.BoxGeometry(.16,.16,.16),170,0xe39a3e);instances(new THREE.BoxGeometry(.18,.18,.18),180,0xe4d5a6);instances(new THREE.SphereGeometry(.075,8,6),240,0x76983c);instances(new THREE.CylinderGeometry(.04,.045,.3,6),110,0x668b3f);}
 else if(id.includes('gamba')){const curve=new THREE.CatmullRomCurve3(Array.from({length:13},(_,i)=>{const a=i/12*Math.PI*1.35;return new THREE.Vector3(Math.cos(a)*.13,Math.sin(a)*.13,0);}));instances(new THREE.TubeGeometry(curve,12,.045,6,false),180,0xe7b3a1);}
 else if(id.includes('grelo'))instances(new THREE.SphereGeometry(.13,6,5).scale(1.5,.3,1),330,0x4c7039);
 else if(id.includes('bacalao'))instances(new THREE.BoxGeometry(id.includes('migas')?.16:.45,id.includes('migas')?.32:.32,.13),id.includes('migas')?200:34,0xe5dfc7);
 else if(id.includes('hamburguesa'))instances(new THREE.CylinderGeometry(.36,.36,.11,20),23,0xb46e61);
 else instances(new THREE.SphereGeometry(.24,9,6).scale(1.25,.45,1),42,0xd8b06b);
}
