// Timing only: the original Three.js choreography remains the geometric path.
// Arc length in its master/alignment/portrait/flip control space removes the
// compressed middle caused by easing an already eased path a second time.
const clamp=x=>Math.max(0,Math.min(1,x)),N=4096,arc=new Float64Array(N+1);
const smooth=x=>x*x*x*(x*(x*6-15)+10);
function ramp(x,a,b,w){if(x<=a)return 0;if(x>=b)return 1;const d=b-a-w;if(x<a+w)return (x-a)**2/(2*w*d);if(x>b-w)return 1-(b-x)**2/(2*w*d);return (x-a-w/2)/d;}
function controls(q){return [smooth(q),ramp(q,0,.78,.22),Math.PI/2*ramp(q,0,.72,.20),Math.PI*ramp(q,.38,1,.19)];}
let previous=controls(0);
for(let i=1;i<=N;i++){const next=controls(i/N);arc[i]=arc[i-1]+Math.hypot(...next.map((x,j)=>x-previous[j]));previous=next;}
const length=arc[N];for(let i=1;i<=N;i++)arc[i]/=length;
// Shared centered tangents make the lookup C1 across cells (linear lookup would
// introduce tiny velocity steps). Endpoint control-path speed is zero.
function pathCell(i,u){const d=arc[i+1]-arc[i],m0=i===0?0:(arc[i+1]-arc[i-1])/2,m1=i===N-1?0:(arc[i+2]-arc[i])/2;return {value:arc[i]+u*(m0+u*(3*d-2*m0-m1+u*(-2*d+m0+m1))),slope:m0+u*(2*(3*d-2*m0-m1)+3*u*(-2*d+m0+m1))};}
export function selectorPathPhase(value){value=clamp(value);if(value===0||value===1)return value;let a=0,b=N;while(b-a>1){const m=(a+b)>>1;if(arc[m]<value)a=m;else b=m;}let u=(value-arc[a])/(arc[b]-arc[a]),low=0,high=1;for(let n=0;n<12;n++){const s=pathCell(a,u),error=s.value-value;if(Math.abs(error)<1e-14)break;if(error<0)low=u;else high=u;const next=u-error/s.slope;u=next>low&&next<high?next:(low+high)/2;}return (a+u)/N;}
export function selectorPathDistance(q){q=clamp(q)*N;const i=Math.min(N-1,Math.floor(q));return pathCell(i,q-i).value;}
// Quintic Hermite: preserve supplied position/velocity/acceleration and arrive
// at rest with zero acceleration. Units are scalar, milliseconds, milliseconds².
export function selectorCurve(from,to,duration,velocity=0,acceleration=0){const d=to-from,v=velocity*duration,a=acceleration*duration*duration/2;return {duration,cruise:velocity===0&&acceleration===0,c:[from,v,a,10*d-6*v-3*a,-15*d+8*v+3*a,6*d-3*v-a]};}
export function sampleSelectorCurve(curve,t){t=clamp(t);const [c0,c1,c2,c3,c4,c5]=curve.c;
 if(curve.cruise){const w=.30,d=1-w,u=Math.min(t,1-t)/w,edge=Math.min(1,u),v=(3*edge*edge-2*edge**3)/d,a=(t<.5?1:-1)*(u<1?6*edge*(1-edge)/(w*d):0),part=w*(edge**3-.5*edge**4)/d,position=t<w?part:t>1-w?1-part:(t-w/2)/d,delta=curve.c.reduce((x,y)=>x+y,0)-c0;return {value:c0+delta*position,velocity:delta*v/curve.duration,acceleration:delta*a/(curve.duration*curve.duration)};}return {value:c0+t*(c1+t*(c2+t*(c3+t*(c4+t*c5)))),velocity:(c1+t*(2*c2+t*(3*c3+t*(4*c4+t*5*c5))))/curve.duration,acceleration:(2*c2+t*(6*c3+t*(12*c4+t*20*c5)))/(curve.duration*curve.duration)};}
export function boundedSelectorCurve(curve){for(let i=0;i<=256;i++){const x=sampleSelectorCurve(curve,i/256).value;if(x<-.0000001||x>1.0000001)return false;}return true;}
