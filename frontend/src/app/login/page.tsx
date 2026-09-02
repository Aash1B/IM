"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ArrowRight, RefreshCw, KeyRound, Mail } from "lucide-react";

function ShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl =
      canvas.getContext("webgl") ||
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);
    if (!gl) return;

    let animationFrameId: number;

    const syncSize = () => {
      if (!canvas) return;
      const w = canvas.clientWidth || 1280;
      const h = canvas.clientHeight || 720;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    };

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(syncSize);
      resizeObserver.observe(canvas);
    }
    syncSize();

    const vs = `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

    const fs = `precision highp float;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

varying vec2 v_texCoord;

vec3 colorBlack = vec3(0.05, 0.04, 0.04);
vec3 colorOrange = vec3(1.0, 0.42, 0.05);
vec3 colorGlow = vec3(1.0, 0.62, 0.18);

float noise(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    vec2 uv = v_texCoord;
    vec2 mouse = u_mouse / u_resolution;
    
    float motion1 = sin(uv.x * 4.0 + u_time * 0.8) * 0.15;
    float motion2 = cos(uv.y * 3.5 - u_time * 0.6) * 0.15;
    float combinedMotion = motion1 + motion2;
    
    vec3 color = colorBlack;
    
    float dist = distance(uv, mouse);
    float glow = smoothstep(0.65, 0.0, dist) * 0.65;
    float pulse = 0.5 + 0.5 * sin(u_time * 1.4);
    color = mix(color, colorGlow, glow * (0.6 + 0.4 * pulse));
    
    float wave1 = smoothstep(0.3, 0.7, sin(uv.y * 5.0 + combinedMotion * 12.0 + u_time * 0.9));
    float wave2 = smoothstep(0.2, 0.8, cos(uv.x * 4.5 - combinedMotion * 8.0 + u_time * 0.7));
    
    color = mix(color, colorOrange * 0.45, wave1 * 0.6);
    color = mix(color, colorGlow * 0.35, wave2 * wave1 * 0.7);
    
    float centerGlow = smoothstep(0.8, 0.1, distance(uv, vec2(0.2, 0.4))) * 0.25;
    color += colorOrange * centerGlow;
    
    color += noise(uv + u_time * 0.02) * 0.025;

    gl_FragColor = vec4(color, 1.0);
}`;

    function createShader(glContext: WebGLRenderingContext, type: number, src: string) {
      const s = glContext.createShader(type);
      if (!s) return null;
      glContext.shaderSource(s, src);
      glContext.compileShader(s);
      return s;
    }

    const vertShader = createShader(gl, gl.VERTEX_SHADER, vs);
    const fragShader = createShader(gl, gl.FRAGMENT_SHADER, fs);
    if (!vertShader || !fragShader) return;

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vertShader);
    gl.attachShader(prog, fragShader);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const pos = gl.getAttribLocation(prog, "a_position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "u_time");
    const uRes = gl.getUniformLocation(prog, "u_resolution");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");

    const mouse = { x: canvas.width / 2, y: canvas.height / 2 };

    const handleMouseMove = (event: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      if (rect.width && rect.height) {
        const nx = (event.clientX - rect.left) / rect.width;
        const ny = 1.0 - (event.clientY - rect.top) / rect.height;
        mouse.x = nx * canvas.width;
        mouse.y = ny * canvas.height;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    const render = (t: number) => {
      if (!canvas || !gl) return;
      if (typeof ResizeObserver === "undefined") syncSize();
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (uTime) gl.uniform1f(uTime, t * 0.001);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationFrameId = requestAnimationFrame(render);
    };

    render(0);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full object-cover"
    />
  );
}

export default function LoginPage() {
  const { login, loading, error } = useAuth();
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
    } catch {
      // Error handled by hook state
    }
  };

  const fillDemoCredentials = () => {
    setEmail("admin@instantmechanic.com");
    setPassword("password123");
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#171512] text-white">
      {/* Left Visual Area - Sleek 40% Width with Interactive WebGL Shader */}
      <div className="md:w-2/5 flex flex-col justify-between p-6 sm:p-8 md:p-12 relative border-b md:border-b-0 md:border-r border-white/10 bg-[#121212] overflow-hidden">
        <ShaderBackground />

        <div className="relative z-10">
          <div className="flex items-center gap-3.5">
            <img src="/op-white-text.png" alt="Instant Mechanic" className="h-14 sm:h-18 md:h-22 w-auto max-w-[240px] sm:max-w-[290px] object-contain drop-shadow-xl" />
          </div>
        </div>

        <div className="my-8 sm:my-12 md:my-auto max-w-md space-y-4 sm:space-y-6 relative z-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight text-white">
            Every Job.<br />
            Every Mechanic.<br />
            <span className="text-[#F95413]">One Command Center</span>
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-zinc-300 leading-relaxed font-normal">
            A live operations dashboard built to manage vehicle services, mechanics, and bookings effortlessly.
          </p>
        </div>

        <div className="text-[10px] sm:text-xs text-zinc-400 font-medium tracking-wider pt-4 md:pt-0 relative z-10">
          © 2026 INSTANT MECHANIC INC. ALL RIGHTS RESERVED.
        </div>
      </div>

      {/* Right Login Form Area - Matching the exact visual design */}
      <div className="md:w-3/5 flex items-center justify-center p-6 sm:p-10 md:p-14 bg-[#FFF8EC] bg-brand-grid text-slate-900 min-h-screen">
        <div className="w-full max-w-[440px] bg-[#F7F7F7] p-7 sm:p-10 rounded-[28px] border border-slate-200/80 shadow-[0_20px_50px_rgba(0,0,0,0.06)] space-y-6 text-slate-900">

          {/* Centered Instant Mechanic Brand Header */}
          <div className="flex flex-col items-center justify-center text-center">
            <div className="flex items-center justify-center mb-5 h-14 sm:h-16 w-auto">
              <img
                src="/op-transparent.png"
                alt="Instant Mechanic"
                className="h-full w-auto object-contain"
              />
            </div>

            <h1 className="text-3xl sm:text-[32px] font-bold text-slate-900 tracking-tight">
              {isSignUp ? "Get Started" : "Welcome Back"}
            </h1>
          </div>

          {/* Quick Demo Access Bar */}
          <div className="rounded-2xl border border-orange-200/80 bg-[#FFF7EE] p-3.5 flex items-center justify-between gap-3 text-left">
            <div className="min-w-0">
              <p className="text-xs font-medium text-[#F95413]">Demo Admin Account</p>
              <p className="text-xs font-mono font-medium text-slate-700 truncate">admin@instantmechanic.com</p>
            </div>
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="rounded-full bg-[#E0480A] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#C53B06] transition-colors shadow-xs shrink-0 cursor-pointer"
            >
              Fill Credentials
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-bold text-slate-800 block mb-1.5 text-left">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-300/80 bg-white py-3 pl-4 pr-11 text-sm sm:text-base font-medium text-slate-900 focus:border-[#F95413] focus:outline-none focus:ring-2 focus:ring-[#F95413]/20 transition-all shadow-2xs"
                />
                <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-800 block mb-1.5 text-left">
                {isSignUp ? "Choose Password" : "Password"}
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-300/80 bg-white py-3 pl-4 pr-11 text-sm sm:text-base font-medium text-slate-900 focus:border-[#F95413] focus:outline-none focus:ring-2 focus:ring-[#F95413]/20 transition-all shadow-2xs"
                />
                <KeyRound className="absolute right-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#F95413] py-3.5 text-sm sm:text-base font-bold text-white hover:bg-[#E0480A] active:scale-[0.99] transition-all shadow-md shadow-[#F95413]/25 disabled:opacity-50 min-h-[48px] cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  Authenticating...
                </>
              ) : isSignUp ? (
                "Sign Up"
              ) : (
                <>
                  Sign In <ArrowRight className="h-4.5 w-4.5" />
                </>
              )}
            </button>
          </form>

          {/* Bottom Switcher */}
          <div className="text-center pt-1 text-sm text-slate-600 font-medium">
            {isSignUp ? (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setIsSignUp(false)}
                  className="font-bold text-slate-900 hover:underline cursor-pointer focus:outline-none"
                >
                  Sign In
                </button>
              </>
            ) : (
              <>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setIsSignUp(true)}
                  className="font-bold text-slate-900 hover:underline cursor-pointer focus:outline-none"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
