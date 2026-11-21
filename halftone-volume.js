/* Rasterize the bevelled G at the halftone lattice resolution. A depth buffer
   keeps both caps, the inner channel and the side walls correctly occluded. */
export function createHalftoneRenderer(mesh) {
  const tile=document.createElement('canvas');
  const ink=tile.getContext('2d');
  const triangles=mesh.triangles;
  const bayer=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
  let key='';
  return function render(yaw,pitch,roll,density,dot,cssSize) {
    const cells=Math.max(48,Math.min(640,Math.round(Math.min(cssSize,320)*density/100)));
    const next=[yaw,pitch,roll,cells,dot].join(',');
    if(next===key) return tile;
    key=next;
    const rad=Math.PI/180;
    const sy=Math.sin(yaw*rad+.30),cy=Math.cos(yaw*rad+.30);
    const sx=Math.sin(pitch*rad+.06),cx=Math.cos(pitch*rad+.06);
    const sz=Math.sin(roll*rad),cz=Math.cos(roll*rad);
    const k=cells/64;
    const verts=mesh.vertices.map(([x,y,z])=>{
      const u=cy*x+sy*z, v=cy*z-sy*x;
      const py=cx*y-sx*v, pz=sx*y+cx*v;
      return [(cz*u+sz*py)*k+cells/2,(sz*u-cz*py)*k+cells/2,pz*k];
    });
    const depth=new Float32Array(cells*cells).fill(-Infinity);
    const shades=new Uint8Array(cells*cells);
    for(let i=0;i<triangles.length;i+=3){
      const a=verts[triangles[i]], b=verts[triangles[i+1]], c=verts[triangles[i+2]];
      const ux=b[0]-a[0], uy=b[1]-a[1], uz=b[2]-a[2];
      const vx=c[0]-a[0], vy=c[1]-a[1], vz=c[2]-a[2];
      const det=ux*vy-uy*vx;
      if(det>=-.00001) continue;
      const nx=uy*vz-uz*vy, ny=uz*vx-ux*vz;
      const len=Math.hypot(nx,ny,det);
      const X=-nx/len,Y=-ny/len,Z=-det/len;
      // Narrow reflected studio strip plus soft key and a low shadow floor.
      const keyLight=Math.max(0,-.42*X-.62*Y+.66*Z);
      const strip=Math.pow(Math.max(0,.32*X-.12*Y+.94*Z),18);
      const rim=Math.pow(Math.max(0,.91*X+.29*Y+.29*Z),9);
      const coverage=.10+.48*keyLight+.14*strip+.22*rim;
      const reflectionCenter=.45+.55*X+.20*Y;
      const xmin=Math.max(0,Math.floor(Math.min(a[0],b[0],c[0])));
      const xmax=Math.min(cells-1,Math.ceil(Math.max(a[0],b[0],c[0])));
      const ymin=Math.max(0,Math.floor(Math.min(a[1],b[1],c[1])));
      const ymax=Math.min(cells-1,Math.ceil(Math.max(a[1],b[1],c[1])));
      for(let y=ymin;y<=ymax;y++)for(let x=xmin;x<=xmax;x++){
        const dx=x+.5-a[0],dy=y+.5-a[1];
        const s=(dx*vy-dy*vx)/det,t=(ux*dy-uy*dx)/det;
        if(s<0 || t<0 || s+t>1)continue;
        const z=a[2]+s*uz+t*vz, j=y*cells+x;
        if(z>depth[j]){
          depth[j]=z;
          const distance=Math.abs((x+.28*y)/cells-reflectionCenter);
          const highlight=Math.max(0,1-distance/.15);
          shades[j]=Math.round(16*Math.min(.94,coverage+.33*highlight*highlight));
        }
      }
    }
    const stride=dot===100?1:4;
    tile.width=tile.height=cells*stride;
    const diameter=stride*dot/100, inset=(stride-diameter)/2;
    ink.fillStyle='#f1f3ef';
    for(let y=0;y<cells;y++)for(let x=0;x<cells;x++){
      if(shades[y*cells+x]>bayer[(y%4)*4+x%4]) ink.fillRect(x*stride+inset,y*stride+inset,diameter,diameter);
    }
    return tile;
  };
}
