import"./app-header-DbnZmrrL.js";function e(e){return[parseInt(e.slice(1,3),16)/255,parseInt(e.slice(3,5),16)/255,parseInt(e.slice(5,7),16)/255,1]}var t={targetHeight:180,renderScale:.5,maxPixelRatio:1,pixelated:!0},n=new URL(`../`,``+import.meta.url),r={horizon:.3,scale:.5,distortionScale:80,distortion:.01,sky1:e(`#010F0C`),sky2:e(`#3C3EA1`),cloud1:e(`#ff0000`),cloud2:e(`#efeab7`)};document.getElementById(`horizon`)?.addEventListener(`input`,e=>r.horizon=parseFloat(e.target.value)),document.getElementById(`scale`)?.addEventListener(`input`,e=>r.scale=parseFloat(e.target.value)),document.getElementById(`distortionScale`)?.addEventListener(`input`,e=>r.distortionScale=parseFloat(e.target.value)),document.getElementById(`distortion`)?.addEventListener(`input`,e=>r.distortion=parseFloat(e.target.value)),document.getElementById(`sky1`)?.addEventListener(`input`,t=>r.sky1=e(t.target.value)),document.getElementById(`sky2`)?.addEventListener(`input`,t=>r.sky2=e(t.target.value)),document.getElementById(`cloud1`)?.addEventListener(`input`,t=>r.cloud1=e(t.target.value)),document.getElementById(`cloud2`)?.addEventListener(`input`,t=>r.cloud2=e(t.target.value)),document.getElementById(`cloudTexInput`)?.addEventListener(`change`,e=>{let t=e.target.files[0];if(!t)return;let n=URL.createObjectURL(t),r=new Image;r.onload=()=>{o(r),URL.revokeObjectURL(n)},r.src=n});function i(){let e=document.documentElement.scrollHeight-window.innerHeight,t=e>0?window.scrollY/e:0;r.horizon=((e,t,n)=>(1-n)*e+n*t)(.5,1.5,Math.min(Math.max(t,0),1))}window.addEventListener(`scroll`,i),i();var a=null;function o(e){a&&a(e)}var s=new Image;s.onload=()=>o(s),s.onerror=()=>console.error(`Could not load cloud texture — check the path/case`),s.src=new URL(`images/cloud.jpg`,n).href;function c(){let e=document.querySelector(`#gl-canvas`),n=e.getContext(`webgl`);if(n===null){alert(`Unable to initialize WebGL. Your browser or machine may not support it.`);return}e.style.imageRendering=t.pixelated?`pixelated`:`auto`;function i(){let r=Math.min(window.devicePixelRatio||1,t.maxPixelRatio),i=Math.max(1,Math.round(window.innerWidth*r)),a=Math.max(1,Math.round(window.innerHeight*r)),o,s;if(t.targetHeight>0)s=Math.min(t.targetHeight,a),o=Math.max(1,Math.round(s*i/a));else{let e=Math.min(Math.max(t.renderScale,.05),1);o=Math.max(1,Math.round(i*e)),s=Math.max(1,Math.round(a*e))}(e.width!==o||e.height!==s)&&(e.width=o,e.height=s),n.viewport(0,0,o,s)}window.addEventListener(`resize`,i),i();function o(e,t){let r=n.createShader(e);return n.shaderSource(r,t),n.compileShader(r),n.getShaderParameter(r,n.COMPILE_STATUS)||console.error(n.getShaderInfoLog(r)),r}let c=n.createProgram();n.attachShader(c,o(n.VERTEX_SHADER,`
    attribute vec2 position;
    varying vec2 vUv;
    void main() {
      vUv = position * 0.5 + 0.5; // map clip space [-1,1] to uv [0,1]
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `)),n.attachShader(c,o(n.FRAGMENT_SHADER,`
    precision highp float;
    varying vec2 vUv;

    uniform vec2 u_resolution;
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
  `)),n.linkProgram(c),n.getProgramParameter(c,n.LINK_STATUS)||console.error(n.getProgramInfoLog(c)),n.useProgram(c);let l=n.createBuffer();n.bindBuffer(n.ARRAY_BUFFER,l),n.bufferData(n.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),n.STATIC_DRAW);let u=n.getAttribLocation(c,`position`);n.enableVertexAttribArray(u),n.vertexAttribPointer(u,2,n.FLOAT,!1,0,0);let d={};[`u_resolution`,`u_time`,`u_skyColor1`,`u_skyColor2`,`u_cloudColor1`,`u_cloudColor2`,`u_scalingFactor`,`u_horizon`,`u_distortionStrength`,`u_distortionScale`,`u_cloudTex`].forEach(e=>{d[e]=n.getUniformLocation(c,e)});function f(e){return!(e&e-1)}function p(e){return 2**Math.round(Math.log2(e))}function m(e){let t=p(e.width),n=p(e.height),r=document.createElement(`canvas`);return r.width=t,r.height=n,r.getContext(`2d`).drawImage(e,0,0,t,n),r}let h=n.createTexture();n.bindTexture(n.TEXTURE_2D,h),n.texImage2D(n.TEXTURE_2D,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,new Uint8Array([128,128,128,255])),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.MIRRORED_REPEAT),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.MIRRORED_REPEAT),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.LINEAR);function g(e){let t=e;f(e.width)&&f(e.height)||(console.warn(`Image is ${e.width}x${e.height}, not power-of-two. Redrawing onto a ${p(e.width)}x${p(e.height)} canvas so REPEAT wrapping still works.`),t=m(e)),n.bindTexture(n.TEXTURE_2D,h),n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,!0),n.texImage2D(n.TEXTURE_2D,0,n.RGBA,n.RGBA,n.UNSIGNED_BYTE,t),n.generateMipmap(n.TEXTURE_2D),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.MIRRORED_REPEAT),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.MIRRORED_REPEAT),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.LINEAR_MIPMAP_LINEAR)}a=g,s.complete&&s.naturalWidth>0&&g(s);let _=performance.now();function v(){let t=(performance.now()-_)/1e3;n.uniform2f(d.u_resolution,e.width,e.height),n.uniform1f(d.u_time,t),n.uniform4fv(d.u_skyColor1,r.sky1),n.uniform4fv(d.u_skyColor2,r.sky2),n.uniform4fv(d.u_cloudColor1,r.cloud1),n.uniform4fv(d.u_cloudColor2,r.cloud2),n.uniform1f(d.u_scalingFactor,r.scale),n.uniform1f(d.u_horizon,r.horizon),n.uniform1f(d.u_distortionStrength,r.distortion),n.uniform1f(d.u_distortionScale,r.distortionScale),n.activeTexture(n.TEXTURE0),n.bindTexture(n.TEXTURE_2D,h),n.uniform1i(d.u_cloudTex,0),n.drawArrays(n.TRIANGLES,0,3),requestAnimationFrame(v)}requestAnimationFrame(v)}c();
//# sourceMappingURL=index-CMwqCBHR.js.map