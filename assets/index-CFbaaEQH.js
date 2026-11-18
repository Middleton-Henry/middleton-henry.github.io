import"./app-header-Cu5nXzn-.js";var e=30,t=180,n=.5;function r(e){return[parseInt(e.slice(1,3),16)/255,parseInt(e.slice(3,5),16)/255,parseInt(e.slice(5,7),16)/255,1]}var i=r(`#010F0C`),a=r(`#3C3EA1`),o=r(`#ff0000`),s=r(`#efeab7`),c=.5,l=80,u=.01,d=new URL(`../`,``+import.meta.url),f=n;function p(){let e=document.documentElement.scrollHeight-window.innerHeight;f=n+1*(e>0?Math.min(Math.max(window.scrollY/e,0),1):0)}window.addEventListener(`scroll`,p,{passive:!0}),p();var m=`
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = position * 0.5 + 0.5; // map clip space [-1,1] to uv [0,1]
    gl_Position = vec4(position, 0.0, 1.0);
  }
`,h=`
  precision highp float;
  varying vec2 vUv;

  uniform float u_time;

  uniform vec4 u_skyColor1;
  uniform vec4 u_skyColor2;
  uniform vec4 u_cloudColor1;
  uniform vec4 u_cloudColor2;

  uniform float u_scalingFactor;
  uniform float u_horizon;
  uniform float u_distortionStrength;
  uniform float u_distortionScale;

  uniform sampler2D u_cloudTex;

  // From Unity's built-in _Time.x (t/20) and _Time.y (t)
  float timeX() { return u_time * 0.05; }
  float timeY() { return u_time; }

  float quantize(float value, float factor) {
    return floor(value * factor) / factor;
  }

  vec4 lerpColor(float value, vec4 color1, vec4 color2) {
    if (value <= 0.0) return color1;
    if (value >= 1.0) return color2;
    return mix(color1, color2, value);
  }

  float adjustSingleContrast(float channelValue, float contrast) {
    return (channelValue - 0.5) * contrast + 0.5;
  }

  vec2 hash22(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return fract(sin(p) * 43758.5453);
  }

  vec2 valueNoise2D(vec2 uv) {
    vec2 i = floor(uv);
    vec2 f = fract(uv);
    vec2 u = f * f * (3.0 - 2.0 * f);

    vec2 a = hash22(i + vec2(0.0, 0.0));
    vec2 b = hash22(i + vec2(1.0, 0.0));
    vec2 c = hash22(i + vec2(0.0, 1.0));
    vec2 d = hash22(i + vec2(1.0, 1.0));

    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  void main() {
    vec2 uv = vUv;

    vec2 distortionOffset = (valueNoise2D(uv * u_distortionScale + timeX()) - 0.5) * u_distortionStrength;

    float skyValue = uv.y + distortionOffset.x + (0.5 - u_horizon);
    skyValue = quantize(skyValue, 16.0);
    vec4 skyColor = lerpColor(skyValue, u_skyColor1, u_skyColor2);

    float dist = abs(uv.y - u_horizon);

    vec2 scaledUV = (uv + distortionOffset) * u_scalingFactor;

    float newUVX = scaledUV.x / dist - (0.5 * u_scalingFactor) / dist + timeY() * -0.005;
    float newUVY = scaledUV.y / dist + timeY() * -0.05;
    vec2 sampleUV = vec2(newUVX, newUVY);

    float sampleR = texture2D(u_cloudTex, sampleUV).r;

    float aboveHorizon = uv.y > u_horizon ? 1.0 : 0.0;
    float cloudValue = clamp((0.9 - sampleR) * aboveHorizon * dist * 2.0, 0.0, 1.0);
    cloudValue = quantize(cloudValue, 16.0);

    vec4 cloudColor = lerpColor(cloudValue, u_cloudColor1, u_cloudColor2);

    gl_FragColor = mix(skyColor, cloudColor, clamp(adjustSingleContrast(cloudValue * 2.0, 1.3), 0.0, 1.0));
  }
`;function g(){let n=document.querySelector(`#gl-canvas`),r=n.getContext(`webgl`);if(r===null){alert(`Unable to initialize WebGL. Your browser or machine may not support it.`);return}n.style.imageRendering=`pixelated`;function g(e,t){let n=r.createShader(e);return r.shaderSource(n,t),r.compileShader(n),r.getShaderParameter(n,r.COMPILE_STATUS)||console.error(r.getShaderInfoLog(n)),n}let _=r.createProgram();r.attachShader(_,g(r.VERTEX_SHADER,m)),r.attachShader(_,g(r.FRAGMENT_SHADER,h)),r.linkProgram(_),r.getProgramParameter(_,r.LINK_STATUS)||console.error(r.getProgramInfoLog(_)),r.useProgram(_);let v=r.createBuffer();r.bindBuffer(r.ARRAY_BUFFER,v),r.bufferData(r.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),r.STATIC_DRAW);let y=r.getAttribLocation(_,`position`);r.enableVertexAttribArray(y),r.vertexAttribPointer(y,2,r.FLOAT,!1,0,0);let b={};[`u_time`,`u_skyColor1`,`u_skyColor2`,`u_cloudColor1`,`u_cloudColor2`,`u_scalingFactor`,`u_horizon`,`u_distortionStrength`,`u_distortionScale`,`u_cloudTex`].forEach(e=>{b[e]=r.getUniformLocation(_,e)}),r.uniform4fv(b.u_skyColor1,i),r.uniform4fv(b.u_skyColor2,a),r.uniform4fv(b.u_cloudColor1,o),r.uniform4fv(b.u_cloudColor2,s),r.uniform1f(b.u_scalingFactor,c),r.uniform1f(b.u_distortionStrength,u),r.uniform1f(b.u_distortionScale,l),r.uniform1i(b.u_cloudTex,0);function x(e){return!(e&e-1)}function S(e){return 2**Math.round(Math.log2(e))}function C(e){let t=document.createElement(`canvas`);return t.width=S(e.width),t.height=S(e.height),t.getContext(`2d`).drawImage(e,0,0,t.width,t.height),t}let w=r.createTexture();r.activeTexture(r.TEXTURE0),r.bindTexture(r.TEXTURE_2D,w),r.texImage2D(r.TEXTURE_2D,0,r.RGBA,1,1,0,r.RGBA,r.UNSIGNED_BYTE,new Uint8Array([128,128,128,255])),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_S,r.MIRRORED_REPEAT),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_T,r.MIRRORED_REPEAT),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MIN_FILTER,r.LINEAR);function T(e){let t=x(e.width)&&x(e.height)?e:C(e);r.bindTexture(r.TEXTURE_2D,w),r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,!0),r.texImage2D(r.TEXTURE_2D,0,r.RGBA,r.RGBA,r.UNSIGNED_BYTE,t),r.generateMipmap(r.TEXTURE_2D),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MIN_FILTER,r.LINEAR_MIPMAP_LINEAR)}let E=new Image;E.onload=()=>T(E),E.onerror=()=>console.error(`Could not load cloud texture — check the path/case`),E.src=new URL(`images/cloud.jpg`,d).href;let D=performance.now();function O(){r.uniform1f(b.u_time,(performance.now()-D)/1e3),r.uniform1f(b.u_horizon,f),r.drawArrays(r.TRIANGLES,0,3)}function k(){let e=Math.max(1,Math.min(t,window.innerHeight)),i=Math.max(1,Math.round(e*window.innerWidth/Math.max(1,window.innerHeight)));(n.width!==i||n.height!==e)&&(n.width=i,n.height=e,r.viewport(0,0,i,e),O()),p()}window.addEventListener(`resize`,k),k();let A=1e3/e,j=0;function M(e){requestAnimationFrame(M);let t=e-j;t<32.333333333333336||(j=e-t%A,O())}requestAnimationFrame(M)}g();
//# sourceMappingURL=index-CFbaaEQH.js.map