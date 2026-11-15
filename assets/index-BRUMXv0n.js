import"./app-header-CSVbsr-a.js";function e(e){return[parseInt(e.slice(1,3),16)/255,parseInt(e.slice(3,5),16)/255,parseInt(e.slice(5,7),16)/255,1]}var t={horizon:.3,scale:.5,distortionScale:80,distortion:.01,sky1:e(`#010F0C`),sky2:e(`#3C3EA1`),cloud1:e(`#ff0000`),cloud2:e(`#efeab7`)};document.getElementById(`horizon`)?.addEventListener(`input`,e=>t.horizon=parseFloat(e.target.value)),document.getElementById(`scale`)?.addEventListener(`input`,e=>t.scale=parseFloat(e.target.value)),document.getElementById(`distortionScale`)?.addEventListener(`input`,e=>t.distortionScale=parseFloat(e.target.value)),document.getElementById(`distortion`)?.addEventListener(`input`,e=>t.distortion=parseFloat(e.target.value)),document.getElementById(`sky1`)?.addEventListener(`input`,n=>t.sky1=e(n.target.value)),document.getElementById(`sky2`)?.addEventListener(`input`,n=>t.sky2=e(n.target.value)),document.getElementById(`cloud1`)?.addEventListener(`input`,n=>t.cloud1=e(n.target.value)),document.getElementById(`cloud2`)?.addEventListener(`input`,n=>t.cloud2=e(n.target.value)),document.getElementById(`cloudTexInput`)?.addEventListener(`change`,e=>{let t=e.target.files[0];if(!t)return;let n=URL.createObjectURL(t),r=new Image;r.onload=()=>{i(r),URL.revokeObjectURL(n)},r.src=n});function n(){let e=document.documentElement.scrollHeight-window.innerHeight,n=e>0?window.scrollY/e:0;t.horizon=((e,t,n)=>(1-n)*e+n*t)(.5,1.5,Math.min(Math.max(n,0),1))}window.addEventListener(`scroll`,n),n();var r=null;function i(e){r&&r(e)}var a=new Image;a.onload=()=>i(a),a.onerror=()=>console.error(`Could not load cloud texture — check the path/case`),a.src=`/images/cloud.jpg`;function o(){let e=document.querySelector(`#gl-canvas`),n=e.getContext(`webgl`);if(n===null){alert(`Unable to initialize WebGL. Your browser or machine may not support it.`);return}function i(){let t=Math.min(window.devicePixelRatio||1,2);e.width=window.innerWidth*t,e.height=window.innerHeight*t,n.viewport(0,0,e.width,e.height)}window.addEventListener(`resize`,i),i();function o(e,t){let r=n.createShader(e);return n.shaderSource(r,t),n.compileShader(r),n.getShaderParameter(r,n.COMPILE_STATUS)||console.error(n.getShaderInfoLog(r)),r}let s=n.createProgram();n.attachShader(s,o(n.VERTEX_SHADER,`
    attribute vec2 position;
    varying vec2 vUv;
    void main() {
      vUv = position * 0.5 + 0.5; // map clip space [-1,1] to uv [0,1]
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `)),n.attachShader(s,o(n.FRAGMENT_SHADER,`
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
  `)),n.linkProgram(s),n.getProgramParameter(s,n.LINK_STATUS)||console.error(n.getProgramInfoLog(s)),n.useProgram(s);let c=n.createBuffer();n.bindBuffer(n.ARRAY_BUFFER,c),n.bufferData(n.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),n.STATIC_DRAW);let l=n.getAttribLocation(s,`position`);n.enableVertexAttribArray(l),n.vertexAttribPointer(l,2,n.FLOAT,!1,0,0);let u={};[`u_resolution`,`u_time`,`u_skyColor1`,`u_skyColor2`,`u_cloudColor1`,`u_cloudColor2`,`u_scalingFactor`,`u_horizon`,`u_distortionStrength`,`u_distortionScale`,`u_cloudTex`].forEach(e=>{u[e]=n.getUniformLocation(s,e)});function d(e){return!(e&e-1)}function f(e){return 2**Math.round(Math.log2(e))}function p(e){let t=f(e.width),n=f(e.height),r=document.createElement(`canvas`);return r.width=t,r.height=n,r.getContext(`2d`).drawImage(e,0,0,t,n),r}let m=n.createTexture();n.bindTexture(n.TEXTURE_2D,m),n.texImage2D(n.TEXTURE_2D,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,new Uint8Array([128,128,128,255])),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.MIRRORED_REPEAT),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.MIRRORED_REPEAT),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.LINEAR);function h(e){let t=e;d(e.width)&&d(e.height)||(console.warn(`Image is ${e.width}x${e.height}, not power-of-two. Redrawing onto a ${f(e.width)}x${f(e.height)} canvas so REPEAT wrapping still works.`),t=p(e)),n.bindTexture(n.TEXTURE_2D,m),n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,!0),n.texImage2D(n.TEXTURE_2D,0,n.RGBA,n.RGBA,n.UNSIGNED_BYTE,t),n.generateMipmap(n.TEXTURE_2D),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.MIRRORED_REPEAT),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.MIRRORED_REPEAT),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.LINEAR_MIPMAP_LINEAR)}r=h,a.complete&&a.naturalWidth>0&&h(a);let g=performance.now();function _(){let r=(performance.now()-g)/1e3;n.uniform2f(u.u_resolution,e.width,e.height),n.uniform1f(u.u_time,r),n.uniform4fv(u.u_skyColor1,t.sky1),n.uniform4fv(u.u_skyColor2,t.sky2),n.uniform4fv(u.u_cloudColor1,t.cloud1),n.uniform4fv(u.u_cloudColor2,t.cloud2),n.uniform1f(u.u_scalingFactor,t.scale),n.uniform1f(u.u_horizon,t.horizon),n.uniform1f(u.u_distortionStrength,t.distortion),n.uniform1f(u.u_distortionScale,t.distortionScale),n.activeTexture(n.TEXTURE0),n.bindTexture(n.TEXTURE_2D,m),n.uniform1i(u.u_cloudTex,0),n.drawArrays(n.TRIANGLES,0,3),requestAnimationFrame(_)}requestAnimationFrame(_)}o();
//# sourceMappingURL=index-BRUMXv0n.js.map