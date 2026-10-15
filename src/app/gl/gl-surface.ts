/**
 * Minimal WebGL2 surface: one fullscreen triangle, one draw call, no geometry.
 *
 * Vertex positions are derived from gl_VertexID, so there are no vertex buffers,
 * no attributes and nothing to upload per frame. Everything the scene draws lives
 * in the fragment shader.
 */

const VERT = `#version 300 es
void main() {
  // (0,0) (2,0) (0,2) -> NDC (-1,-1) (3,-1) (-1,3): a triangle that covers the
  // viewport with no diagonal seam, so no fragment is shaded twice.
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

export type UniformValue = number | readonly number[];

export class GlSurface {
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram;
  private vao: WebGLVertexArrayObject | null;
  private locations = new Map<string, WebGLUniformLocation | null>();
  private observer: ResizeObserver;
  private cssWidth = 0;
  private cssHeight = 0;
  private disposed = false;

  /** Internal render scale. The SDF is analytic, so sub-native resolution stays crisp. */
  readonly scale: number;

  /**
   * Called after the backing store is resized. Static (reduced-motion) renders
   * hook this to redraw their single frame at the new size.
   */
  onResize?: () => void;

  private constructor(
    private canvas: HTMLCanvasElement,
    gl: WebGL2RenderingContext,
    program: WebGLProgram,
    scale: number
  ) {
    this.gl = gl;
    this.program = program;
    this.scale = scale;
    this.vao = gl.createVertexArray();

    this.observer = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect;
      this.resize(rect.width, rect.height);
    });
    this.observer.observe(canvas);

    const rect = canvas.getBoundingClientRect();
    this.resize(rect.width, rect.height);
  }

  /**
   * Returns null when WebGL2 is unavailable or the shader fails to compile, so
   * callers can fall back to their static DOM rendering instead of throwing.
   */
  static create(canvas: HTMLCanvasElement, fragSource: string, scale: number): GlSurface | null {
    const gl = canvas.getContext('webgl2', {
      alpha: true,
      antialias: false, // SDFs antialias analytically via smoothstep - MSAA would be wasted cost
      depth: false,
      stencil: false,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: false,
    });
    if (!gl) return null;

    const program = link(gl, VERT, fragSource);
    if (!program) return null;

    return new GlSurface(canvas, gl, program, scale);
  }

  private resize(cssWidth: number, cssHeight: number) {
    if (this.disposed || cssWidth === 0 || cssHeight === 0) return;
    this.cssWidth = cssWidth;
    this.cssHeight = cssHeight;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(cssWidth * dpr * this.scale));
    const height = Math.max(1, Math.round(cssHeight * dpr * this.scale));

    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
      this.onResize?.();
    }
  }

  /** Current CSS size, used to project world points onto DOM overlays. */
  get cssSize(): readonly [number, number] {
    return [this.cssWidth, this.cssHeight];
  }

  get width() {
    return this.canvas.width;
  }

  get height() {
    return this.canvas.height;
  }

  private location(name: string): WebGLUniformLocation | null {
    if (!this.locations.has(name)) {
      this.locations.set(name, this.gl.getUniformLocation(this.program, name));
    }
    return this.locations.get(name) ?? null;
  }

  render(uniforms: Record<string, UniformValue>) {
    if (this.disposed) return;
    const gl = this.gl;

    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.useProgram(this.program);
    gl.bindVertexArray(this.vao);

    for (const name in uniforms) {
      const loc = this.location(name);
      if (!loc) continue;
      const value = uniforms[name];
      if (typeof value === 'number') {
        gl.uniform1f(loc, value);
      } else {
        switch (value.length) {
          case 2:
            gl.uniform2f(loc, value[0], value[1]);
            break;
          case 3:
            gl.uniform3f(loc, value[0], value[1], value[2]);
            break;
          case 4:
            gl.uniform4f(loc, value[0], value[1], value[2], value[3]);
            break;
        }
      }
    }

    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindVertexArray(null);
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.observer.disconnect();
    this.gl.deleteProgram(this.program);
    if (this.vao) this.gl.deleteVertexArray(this.vao);
    this.gl.getExtension('WEBGL_lose_context')?.loseContext();
  }
}

function compile(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('[gl] shader compile failed:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function link(gl: WebGL2RenderingContext, vertSrc: string, fragSrc: string): WebGLProgram | null {
  const vert = compile(gl, gl.VERTEX_SHADER, vertSrc);
  const frag = compile(gl, gl.FRAGMENT_SHADER, fragSrc);
  if (!vert || !frag) return null;

  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);

  // Shaders are reference-counted by the program; safe to release our handles now.
  gl.deleteShader(vert);
  gl.deleteShader(frag);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('[gl] program link failed:', gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}
