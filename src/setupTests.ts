import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock Canvas API for VexFlow to silence "No context for txtCanvas" warnings.
// VexFlow requires 'measureText' to return valid metrics.
// We also provide no-op stubs for other common context methods to prevent crashes
// if VexFlow or other components try to draw.

Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
  value: vi.fn((contextId: string) => {
    if (contextId === "2d") {
      return {
        // Properties
        canvas: document.createElement("canvas"),
        font: "",
        fillStyle: "",
        strokeStyle: "",
        lineWidth: 1,
        lineCap: "butt",
        lineJoin: "miter",
        miterLimit: 10,
        shadowBlur: 0,
        shadowColor: "rgba(0, 0, 0, 0)",
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        textAlign: "start",
        textBaseline: "alphabetic",
        globalAlpha: 1.0,
        globalCompositeOperation: "source-over",

        // Methods
        arc: vi.fn(),
        arcTo: vi.fn(),
        beginPath: vi.fn(),
        bezierCurveTo: vi.fn(),
        clearRect: vi.fn(),
        clip: vi.fn(),
        closePath: vi.fn(),
        createImageData: vi.fn(),
        createLinearGradient: vi.fn(),
        createPattern: vi.fn(),
        createRadialGradient: vi.fn(),
        drawImage: vi.fn(),
        ellipse: vi.fn(),
        fill: vi.fn(),
        fillRect: vi.fn(),
        fillText: vi.fn(),
        getImageData: vi.fn(),
        getLineDash: vi.fn(),
        isPointInPath: vi.fn(),
        isPointInStroke: vi.fn(),
        lineTo: vi.fn(),
        moveTo: vi.fn(),
        putImageData: vi.fn(),
        quadraticCurveTo: vi.fn(),
        rect: vi.fn(),
        restore: vi.fn(),
        rotate: vi.fn(),
        save: vi.fn(),
        scale: vi.fn(),
        setLineDash: vi.fn(),
        setTransform: vi.fn(),
        stroke: vi.fn(),
        strokeRect: vi.fn(),
        strokeText: vi.fn(),
        transform: vi.fn(),
        translate: vi.fn(),

        // Critical for VexFlow
        measureText: vi.fn((text: string) => ({
          width: text.length * 10,
          actualBoundingBoxAscent: 12,
          actualBoundingBoxDescent: 3,
          fontBoundingBoxAscent: 12,
          fontBoundingBoxDescent: 3,
          emHeightAscent: 12,
          emHeightDescent: 3,
        })),
      };
    }
    return null;
  }),
  writable: true,
});
