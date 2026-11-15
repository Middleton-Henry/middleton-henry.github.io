(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=class extends HTMLElement{connectedCallback(){let e=window.location.pathname;this.innerHTML=`
      <header class="site-header">
        <div class="header-inner">
          <div class="brand">
            <span class="brand-icon"></span>
            <span class="brand-name">Middleton Henry</span>
          </div>


          <nav class="nav-links">

            <button data-href="/" class="${e===`/`||e.endsWith(`index.html`)?`active`:``}">
              Home
            </button>

            <button data-href="/models.html" class="${e.endsWith(`models.html`)?`active`:``}">
              3D Models
            </button>

            <button data-href="/communicationsCourses.html" class="${e.endsWith(`communicationsCourses.html`)?`active`:``}">
              Communications Courses
            </button>

            <button data-href="/computerScienceCourses.html" class="${e.endsWith(`computerScienceCourses.html`)?`active`:``}">
              Computer Science Courses
            </button>

          </nav>
        </div>
      </header>
    `,this.querySelectorAll(`button`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.getAttribute(`data-href`);t&&(window.location.href=t)})})}};customElements.define(`app-header`,e);function t(e){return[parseInt(e.slice(1,3),16)/255,parseInt(e.slice(3,5),16)/255,parseInt(e.slice(5,7),16)/255,1]}var n={horizon:.3,scale:.5,distortionScale:80,distortion:.01,sky1:t(`#010F0C`),sky2:t(`#3C3EA1`),cloud1:t(`#ff0000`),cloud2:t(`#efeab7`)};document.getElementById(`horizon`)?.addEventListener(`input`,e=>n.horizon=parseFloat(e.target.value)),document.getElementById(`scale`)?.addEventListener(`input`,e=>n.scale=parseFloat(e.target.value)),document.getElementById(`distortionScale`)?.addEventListener(`input`,e=>n.distortionScale=parseFloat(e.target.value)),document.getElementById(`distortion`)?.addEventListener(`input`,e=>n.distortion=parseFloat(e.target.value)),document.getElementById(`sky1`)?.addEventListener(`input`,e=>n.sky1=t(e.target.value)),document.getElementById(`sky2`)?.addEventListener(`input`,e=>n.sky2=t(e.target.value)),document.getElementById(`cloud1`)?.addEventListener(`input`,e=>n.cloud1=t(e.target.value)),document.getElementById(`cloud2`)?.addEventListener(`input`,e=>n.cloud2=t(e.target.value)),document.getElementById(`cloudTexInput`)?.addEventListener(`change`,e=>{let t=e.target.files[0];if(!t)return;let n=URL.createObjectURL(t),r=new Image;r.onload=()=>{a(r),URL.revokeObjectURL(n)},r.src=n});function r(){let e=document.documentElement.scrollHeight-window.innerHeight,t=e>0?window.scrollY/e:0;n.horizon=((e,t,n)=>(1-n)*e+n*t)(.5,1.5,Math.min(Math.max(t,0),1))}window.addEventListener(`scroll`,r),r();var i=null;function a(e){i&&i(e)}var o=new Image;o.onload=()=>a(o),o.onerror=()=>console.error(`Could not load cloud texture — check the path/case`),o.src=`/images/cloud.jpg`;function s(){let e=document.querySelector(`#gl-canvas`),t=e.getContext(`webgl`);if(t===null){alert(`Unable to initialize WebGL. Your browser or machine may not support it.`);return}function r(){let n=Math.min(window.devicePixelRatio||1,2);e.width=window.innerWidth*n,e.height=window.innerHeight*n,t.viewport(0,0,e.width,e.height)}window.addEventListener(`resize`,r),r();function a(e,n){let r=t.createShader(e);return t.shaderSource(r,n),t.compileShader(r),t.getShaderParameter(r,t.COMPILE_STATUS)||console.error(t.getShaderInfoLog(r)),r}let s=t.createProgram();t.attachShader(s,a(t.VERTEX_SHADER,`
    attribute vec2 position;
    varying vec2 vUv;
    void main() {
      vUv = position * 0.5 + 0.5; // map clip space [-1,1] to uv [0,1]
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `)),t.attachShader(s,a(t.FRAGMENT_SHADER,`
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
  `)),t.linkProgram(s),t.getProgramParameter(s,t.LINK_STATUS)||console.error(t.getProgramInfoLog(s)),t.useProgram(s);let c=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,c),t.bufferData(t.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),t.STATIC_DRAW);let l=t.getAttribLocation(s,`position`);t.enableVertexAttribArray(l),t.vertexAttribPointer(l,2,t.FLOAT,!1,0,0);let u={};[`u_resolution`,`u_time`,`u_skyColor1`,`u_skyColor2`,`u_cloudColor1`,`u_cloudColor2`,`u_scalingFactor`,`u_horizon`,`u_distortionStrength`,`u_distortionScale`,`u_cloudTex`].forEach(e=>{u[e]=t.getUniformLocation(s,e)});function d(e){return!(e&e-1)}function f(e){return 2**Math.round(Math.log2(e))}function p(e){let t=f(e.width),n=f(e.height),r=document.createElement(`canvas`);return r.width=t,r.height=n,r.getContext(`2d`).drawImage(e,0,0,t,n),r}let m=t.createTexture();t.bindTexture(t.TEXTURE_2D,m),t.texImage2D(t.TEXTURE_2D,0,t.RGBA,1,1,0,t.RGBA,t.UNSIGNED_BYTE,new Uint8Array([128,128,128,255])),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.MIRRORED_REPEAT),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.MIRRORED_REPEAT),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR);function h(e){let n=e;d(e.width)&&d(e.height)||(console.warn(`Image is ${e.width}x${e.height}, not power-of-two. Redrawing onto a ${f(e.width)}x${f(e.height)} canvas so REPEAT wrapping still works.`),n=p(e)),t.bindTexture(t.TEXTURE_2D,m),t.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,!0),t.texImage2D(t.TEXTURE_2D,0,t.RGBA,t.RGBA,t.UNSIGNED_BYTE,n),t.generateMipmap(t.TEXTURE_2D),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.MIRRORED_REPEAT),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.MIRRORED_REPEAT),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR_MIPMAP_LINEAR)}i=h,o.complete&&o.naturalWidth>0&&h(o);let g=performance.now();function _(){let r=(performance.now()-g)/1e3;t.uniform2f(u.u_resolution,e.width,e.height),t.uniform1f(u.u_time,r),t.uniform4fv(u.u_skyColor1,n.sky1),t.uniform4fv(u.u_skyColor2,n.sky2),t.uniform4fv(u.u_cloudColor1,n.cloud1),t.uniform4fv(u.u_cloudColor2,n.cloud2),t.uniform1f(u.u_scalingFactor,n.scale),t.uniform1f(u.u_horizon,n.horizon),t.uniform1f(u.u_distortionStrength,n.distortion),t.uniform1f(u.u_distortionScale,n.distortionScale),t.activeTexture(t.TEXTURE0),t.bindTexture(t.TEXTURE_2D,m),t.uniform1i(u.u_cloudTex,0),t.drawArrays(t.TRIANGLES,0,3),requestAnimationFrame(_)}requestAnimationFrame(_)}s();