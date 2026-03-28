// ============================================
// FULLMAKE — WiringDiagram Component
// Renders interactive SVG wiring diagram + table
// from structured JSON data (wiring_diagram field).
// Supports light and dark mode automatically.
// ============================================

"use client";

import { useState, useEffect } from "react";

// ============================================
// TYPES
// ============================================
interface Pin {
  name: string;
  type: "power" | "ground" | "signal" | "pwm" | "i2c" | "spi" | "analog" | "uart";
}

interface DiagramComponent {
  id: string;
  label: string;
  description: string;
  side: "left" | "right";
  pins: Pin[];
}

interface Connection {
  from_component: string;
  from_pin: string;
  to_pin: string;
  wire_type: string;
  note: string | null;
}

interface WiringDiagramData {
  board: {
    type: string;
    label: string;
  };
  components: DiagramComponent[];
  connections: Connection[];
  power_warning: string | null;
}

interface WiringDiagramProps {
  data: WiringDiagramData;
}

// ============================================
// THEME — light/dark color sets
// ============================================
const THEMES = {
  light: {
    boardBg: "#F5F5F4",
    boardStroke: "#A8A29E",
    chipBg: "#E7E5E4",
    chipStroke: "#D6D3D1",
    chipText: "#57534E",
    boardLabel: "#1C1917",
    pinLabel: "#1C1917",
    pinHeaderLine: "#D6D3D1",
    compBg: "#FAFAF9",
    compStroke: "#A8A29E",
    compLabel: "#1C1917",
    compDesc: "#57534E",
    compPinLabel: "#57534E",
    noteBg: "#FAFAF9",
    warningBg: "#1C1917",
    warningText: "#FAFAF9",
    legendText: "#44403C",
  },
  dark: {
    boardBg: "#292524",
    boardStroke: "#57534E",
    chipBg: "#1C1917",
    chipStroke: "#44403C",
    chipText: "#A8A29E",
    boardLabel: "#FAFAF9",
    pinLabel: "#E7E5E4",
    pinHeaderLine: "#44403C",
    compBg: "#292524",
    compStroke: "#57534E",
    compLabel: "#FAFAF9",
    compDesc: "#A8A29E",
    compPinLabel: "#A8A29E",
    noteBg: "#292524",
    warningBg: "#FAFAF9",
    warningText: "#1C1917",
    legendText: "#D6D3D1",
  },
};

// Wire colors — same for both modes (high contrast colors)
const WIRE_COLORS: Record<string, string> = {
  power: "#E24B4A",
  ground: "#78716C",
  signal: "#378ADD",
  pwm: "#D85A30",
  i2c: "#1D9E75",
  spi: "#7F77DD",
  analog: "#639922",
  uart: "#D4537E",
};

const WIRE_LABELS: Record<string, string> = {
  power: "Power (VCC)",
  ground: "Ground",
  signal: "Signal",
  pwm: "PWM",
  i2c: "I2C bus",
  spi: "SPI bus",
  analog: "Analog",
  uart: "UART",
};

// ============================================
// LAYOUT CONSTANTS
// ============================================
const SVG_WIDTH = 680;
const BOARD_X = 245;
const BOARD_WIDTH = 190;
const BOARD_HEIGHT_MIN = 300;
const BOARD_Y = 30;
const BOARD_RX = 8;
const PIN_START_Y = 175;
const PIN_SPACING = 50;
const PIN_RADIUS = 4;
const COMP_WIDTH = 145;
const COMP_MARGIN_X = 20;
const COMP_PIN_SPACING = 26;
const COMP_HEADER_HEIGHT = 48;
const COMP_PADDING_TOP = 14;
const COMP_PADDING_BOTTOM = 14;
const COMP_GAP_Y = 24;

// ============================================
// BOARD PIN DEFINITIONS
// ============================================
interface BoardPinDef {
  name: string;
  side: "left" | "right";
  defaultType: string;
}

const BOARD_PINS: Record<string, BoardPinDef[]> = {
  esp32_devkit_v1: [
    { name: "3V3", side: "left", defaultType: "power" },
    { name: "GND", side: "left", defaultType: "ground" },
    { name: "GPIO4", side: "left", defaultType: "signal" },
    { name: "GPIO5", side: "left", defaultType: "signal" },
    { name: "GPIO13", side: "left", defaultType: "signal" },
    { name: "GPIO14", side: "left", defaultType: "signal" },
    { name: "GPIO16", side: "left", defaultType: "signal" },
    { name: "GPIO17", side: "left", defaultType: "signal" },
    { name: "GPIO18", side: "left", defaultType: "pwm" },
    { name: "GPIO19", side: "left", defaultType: "signal" },
    { name: "GPIO21", side: "left", defaultType: "i2c" },
    { name: "GPIO22", side: "left", defaultType: "i2c" },
    { name: "GPIO23", side: "left", defaultType: "signal" },
    { name: "GPIO25", side: "left", defaultType: "signal" },
    { name: "GPIO26", side: "left", defaultType: "signal" },
    { name: "GPIO27", side: "left", defaultType: "signal" },
    { name: "GPIO32", side: "left", defaultType: "analog" },
    { name: "GPIO33", side: "left", defaultType: "analog" },
    { name: "GPIO34", side: "left", defaultType: "analog" },
    { name: "GPIO35", side: "left", defaultType: "analog" },
    { name: "VIN", side: "right", defaultType: "power" },
    { name: "GND", side: "right", defaultType: "ground" },
    { name: "GPIO2", side: "right", defaultType: "signal" },
    { name: "GPIO12", side: "right", defaultType: "signal" },
    { name: "GPIO15", side: "right", defaultType: "signal" },
    { name: "GPIO36", side: "right", defaultType: "analog" },
    { name: "GPIO39", side: "right", defaultType: "analog" },
  ],
  arduino_uno: [
    { name: "5V", side: "left", defaultType: "power" },
    { name: "3.3V", side: "left", defaultType: "power" },
    { name: "GND", side: "left", defaultType: "ground" },
    { name: "D2", side: "left", defaultType: "signal" },
    { name: "D3", side: "left", defaultType: "pwm" },
    { name: "D4", side: "left", defaultType: "signal" },
    { name: "D5", side: "left", defaultType: "pwm" },
    { name: "D6", side: "left", defaultType: "pwm" },
    { name: "D7", side: "left", defaultType: "signal" },
    { name: "D8", side: "left", defaultType: "signal" },
    { name: "D9", side: "left", defaultType: "pwm" },
    { name: "D10", side: "left", defaultType: "pwm" },
    { name: "D11", side: "left", defaultType: "pwm" },
    { name: "D12", side: "left", defaultType: "signal" },
    { name: "D13", side: "left", defaultType: "signal" },
    { name: "VIN", side: "right", defaultType: "power" },
    { name: "GND", side: "right", defaultType: "ground" },
    { name: "A0", side: "right", defaultType: "analog" },
    { name: "A1", side: "right", defaultType: "analog" },
    { name: "A2", side: "right", defaultType: "analog" },
    { name: "A3", side: "right", defaultType: "analog" },
    { name: "A4", side: "right", defaultType: "i2c" },
    { name: "A5", side: "right", defaultType: "i2c" },
  ],
  arduino_nano: [
    { name: "5V", side: "left", defaultType: "power" },
    { name: "3.3V", side: "left", defaultType: "power" },
    { name: "GND", side: "left", defaultType: "ground" },
    { name: "D2", side: "left", defaultType: "signal" },
    { name: "D3", side: "left", defaultType: "pwm" },
    { name: "D4", side: "left", defaultType: "signal" },
    { name: "D5", side: "left", defaultType: "pwm" },
    { name: "D6", side: "left", defaultType: "pwm" },
    { name: "D7", side: "left", defaultType: "signal" },
    { name: "D8", side: "left", defaultType: "signal" },
    { name: "D9", side: "left", defaultType: "pwm" },
    { name: "D10", side: "left", defaultType: "pwm" },
    { name: "D11", side: "left", defaultType: "pwm" },
    { name: "D12", side: "left", defaultType: "signal" },
    { name: "D13", side: "left", defaultType: "signal" },
    { name: "VIN", side: "right", defaultType: "power" },
    { name: "GND", side: "right", defaultType: "ground" },
    { name: "A0", side: "right", defaultType: "analog" },
    { name: "A1", side: "right", defaultType: "analog" },
    { name: "A2", side: "right", defaultType: "analog" },
    { name: "A3", side: "right", defaultType: "analog" },
    { name: "A4", side: "right", defaultType: "i2c" },
    { name: "A5", side: "right", defaultType: "i2c" },
  ],
  arduino_mega: [
    { name: "5V", side: "left", defaultType: "power" },
    { name: "3.3V", side: "left", defaultType: "power" },
    { name: "GND", side: "left", defaultType: "ground" },
    { name: "D2", side: "left", defaultType: "signal" },
    { name: "D3", side: "left", defaultType: "pwm" },
    { name: "D4", side: "left", defaultType: "signal" },
    { name: "D5", side: "left", defaultType: "pwm" },
    { name: "D6", side: "left", defaultType: "pwm" },
    { name: "D7", side: "left", defaultType: "signal" },
    { name: "D8", side: "left", defaultType: "signal" },
    { name: "D9", side: "left", defaultType: "pwm" },
    { name: "D10", side: "left", defaultType: "pwm" },
    { name: "D11", side: "left", defaultType: "pwm" },
    { name: "D12", side: "left", defaultType: "signal" },
    { name: "D13", side: "left", defaultType: "signal" },
    { name: "VIN", side: "right", defaultType: "power" },
    { name: "GND", side: "right", defaultType: "ground" },
    { name: "A0", side: "right", defaultType: "analog" },
    { name: "A1", side: "right", defaultType: "analog" },
    { name: "A2", side: "right", defaultType: "analog" },
    { name: "A3", side: "right", defaultType: "analog" },
    { name: "A4", side: "right", defaultType: "analog" },
    { name: "A5", side: "right", defaultType: "analog" },
    { name: "D20", side: "right", defaultType: "i2c" },
    { name: "D21", side: "right", defaultType: "i2c" },
    { name: "D44", side: "right", defaultType: "pwm" },
    { name: "D45", side: "right", defaultType: "pwm" },
    { name: "D46", side: "right", defaultType: "pwm" },
  ],
  esp8266_nodemcu: [
    { name: "3V3", side: "left", defaultType: "power" },
    { name: "GND", side: "left", defaultType: "ground" },
    { name: "D0", side: "left", defaultType: "signal" },
    { name: "D1", side: "left", defaultType: "i2c" },
    { name: "D2", side: "left", defaultType: "i2c" },
    { name: "D3", side: "left", defaultType: "signal" },
    { name: "D4", side: "left", defaultType: "signal" },
    { name: "D5", side: "left", defaultType: "signal" },
    { name: "D6", side: "left", defaultType: "signal" },
    { name: "D7", side: "left", defaultType: "signal" },
    { name: "D8", side: "left", defaultType: "signal" },
    { name: "VIN", side: "right", defaultType: "power" },
    { name: "GND", side: "right", defaultType: "ground" },
    { name: "A0", side: "right", defaultType: "analog" },
  ],
  raspberry_pi_zero_w: [
    { name: "3V3", side: "left", defaultType: "power" },
    { name: "5V", side: "left", defaultType: "power" },
    { name: "GND", side: "left", defaultType: "ground" },
    { name: "GPIO2", side: "left", defaultType: "i2c" },
    { name: "GPIO3", side: "left", defaultType: "i2c" },
    { name: "GPIO4", side: "left", defaultType: "signal" },
    { name: "GPIO17", side: "left", defaultType: "signal" },
    { name: "GPIO27", side: "left", defaultType: "signal" },
    { name: "GPIO22", side: "left", defaultType: "signal" },
    { name: "GPIO14", side: "right", defaultType: "uart" },
    { name: "GPIO15", side: "right", defaultType: "uart" },
    { name: "GPIO18", side: "right", defaultType: "pwm" },
    { name: "GPIO23", side: "right", defaultType: "signal" },
    { name: "GPIO24", side: "right", defaultType: "signal" },
    { name: "GPIO25", side: "right", defaultType: "signal" },
    { name: "GND", side: "right", defaultType: "ground" },
  ],
  raspberry_pi_4: [
    { name: "3V3", side: "left", defaultType: "power" },
    { name: "5V", side: "left", defaultType: "power" },
    { name: "GND", side: "left", defaultType: "ground" },
    { name: "GPIO2", side: "left", defaultType: "i2c" },
    { name: "GPIO3", side: "left", defaultType: "i2c" },
    { name: "GPIO4", side: "left", defaultType: "signal" },
    { name: "GPIO17", side: "left", defaultType: "signal" },
    { name: "GPIO27", side: "left", defaultType: "signal" },
    { name: "GPIO22", side: "left", defaultType: "signal" },
    { name: "GPIO14", side: "right", defaultType: "uart" },
    { name: "GPIO15", side: "right", defaultType: "uart" },
    { name: "GPIO18", side: "right", defaultType: "pwm" },
    { name: "GPIO23", side: "right", defaultType: "signal" },
    { name: "GPIO24", side: "right", defaultType: "signal" },
    { name: "GPIO25", side: "right", defaultType: "signal" },
    { name: "GND", side: "right", defaultType: "ground" },
  ],
};

// ============================================
// HELPER FUNCTIONS
// ============================================
function getUsedBoardPins(
  boardType: string,
  connections: Connection[]
): { left: { name: string; type: string; y: number }[]; right: { name: string; type: string; y: number }[] } {
  const allPins = BOARD_PINS[boardType] || BOARD_PINS["esp32_devkit_v1"];
  const usedPinNames = new Set(connections.map((c) => c.to_pin));

  const leftPins: { name: string; type: string }[] = [];
  const rightPins: { name: string; type: string }[] = [];
  const addedLeft = new Set<string>();
  const addedRight = new Set<string>();

  for (const pin of allPins) {
    const key = `${pin.name}_${pin.side}`;
    if (usedPinNames.has(pin.name) && pin.side === "left" && !addedLeft.has(key)) {
      leftPins.push({ name: pin.name, type: pin.defaultType });
      addedLeft.add(key);
    }
    if (usedPinNames.has(pin.name) && pin.side === "right" && !addedRight.has(key)) {
      rightPins.push({ name: pin.name, type: pin.defaultType });
      addedRight.add(key);
    }
  }

  for (const pinName of usedPinNames) {
    const foundLeft = leftPins.some((p) => p.name === pinName);
    const foundRight = rightPins.some((p) => p.name === pinName);
    if (!foundLeft && !foundRight) {
      const def = allPins.find((p) => p.name === pinName);
      if (def) {
        if (def.side === "left") leftPins.push({ name: def.name, type: def.defaultType });
        else rightPins.push({ name: def.name, type: def.defaultType });
      }
    }
  }

  return {
    left: leftPins.map((p, i) => ({ ...p, y: PIN_START_Y + i * PIN_SPACING })),
    right: rightPins.map((p, i) => ({ ...p, y: PIN_START_Y + i * PIN_SPACING })),
  };
}

function getComponentPositions(components: DiagramComponent[]) {
  const positions: Record<string, { x: number; y: number; width: number; height: number; pinPositions: Record<string, { x: number; y: number }> }> = {};

  const calcSide = (comps: DiagramComponent[], side: "left" | "right") => {
    let currentY = BOARD_Y + 20;
    const x = side === "left" ? COMP_MARGIN_X : SVG_WIDTH - COMP_MARGIN_X - COMP_WIDTH;
    for (const comp of comps) {
      const height = COMP_HEADER_HEIGHT + COMP_PADDING_TOP + comp.pins.length * COMP_PIN_SPACING + COMP_PADDING_BOTTOM;
      const pinPositions: Record<string, { x: number; y: number }> = {};
      comp.pins.forEach((pin, i) => {
        pinPositions[pin.name] = {
          x: side === "left" ? x + COMP_WIDTH : x,
          y: currentY + COMP_HEADER_HEIGHT + COMP_PADDING_TOP + i * COMP_PIN_SPACING,
        };
      });
      positions[comp.id] = { x, y: currentY, width: COMP_WIDTH, height, pinPositions };
      currentY += height + COMP_GAP_Y;
    }
  };

  calcSide(components.filter((c) => c.side === "left"), "left");
  calcSide(components.filter((c) => c.side === "right"), "right");
  return positions;
}

function getWireColor(wireType: string): string {
  return WIRE_COLORS[wireType] || WIRE_COLORS.signal;
}

function getUsedWireTypes(connections: Connection[]): string[] {
  const types = new Set(connections.map((c) => c.wire_type));
  return ["power", "ground", "signal", "pwm", "analog", "i2c", "spi", "uart"].filter((t) => types.has(t));
}

// ============================================
// COMPONENT
// ============================================
export default function WiringDiagram({ data }: WiringDiagramProps) {
  const [highlightComp, setHighlightComp] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);

  // Detect dark mode
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDark(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const t = isDark ? THEMES.dark : THEMES.light;

  // Layout calculations
  const boardPins = getUsedBoardPins(data.board.type, data.connections);
  const compPositions = getComponentPositions(data.components);
  const usedWireTypes = getUsedWireTypes(data.connections);
  const maxPinCount = Math.max(boardPins.left.length, boardPins.right.length);
  const boardHeight = Math.max(BOARD_HEIGHT_MIN, PIN_START_Y - BOARD_Y + maxPinCount * PIN_SPACING + 40);
  const allCompBottoms = Object.values(compPositions).map((p) => p.y + p.height);
  const contentBottom = Math.max(BOARD_Y + boardHeight, ...allCompBottoms);
  const svgHeight = contentBottom + (data.power_warning ? 50 : 20);

  // Board pin positions lookup
  const boardPinPositions: Record<string, { x: number; y: number }> = {};
  boardPins.left.forEach((p) => { boardPinPositions[p.name] = { x: BOARD_X, y: p.y }; });
  boardPins.right.forEach((p) => {
    const key = boardPinPositions[p.name] ? `${p.name}_R` : p.name;
    boardPinPositions[key] = { x: BOARD_X + BOARD_WIDTH, y: p.y };
  });

  function resolveBoardPin(conn: Connection): { x: number; y: number } | null {
    const comp = data.components.find((c) => c.id === conn.from_component);
    if (!comp) return null;
    if (boardPinPositions[conn.to_pin]) return boardPinPositions[conn.to_pin];
    if (comp.side === "right" && boardPinPositions[`${conn.to_pin}_R`]) return boardPinPositions[`${conn.to_pin}_R`];
    const allPos = [...boardPins.left, ...boardPins.right];
    const found = allPos.find((p) => p.name === conn.to_pin);
    if (found) {
      const side = boardPins.left.includes(found) ? "left" : "right";
      return { x: side === "left" ? BOARD_X : BOARD_X + BOARD_WIDTH, y: found.y };
    }
    return null;
  }

  function buildWirePath(conn: Connection): string | null {
    const comp = data.components.find((c) => c.id === conn.from_component);
    if (!comp) return null;
    const compPos = compPositions[conn.from_component];
    if (!compPos) return null;
    const fromPos = compPos.pinPositions[conn.from_pin];
    if (!fromPos) return null;
    const toPos = resolveBoardPin(conn);
    if (!toPos) return null;
    const midX = comp.side === "left"
      ? fromPos.x + (toPos.x - fromPos.x) * 0.4
      : fromPos.x - (fromPos.x - toPos.x) * 0.4;
    return `M${fromPos.x},${fromPos.y} L${midX},${fromPos.y} L${midX},${toPos.y} L${toPos.x},${toPos.y}`;
  }

  function isSharedPin(conn: Connection): boolean {
    return data.connections.filter((c) => c.to_pin === conn.to_pin).length > 1;
  }

  function getCompLabel(id: string): string {
    return data.components.find((c) => c.id === id)?.label || id;
  }

  return (
    <div>
      {/* Legend */}
      <div className="flex gap-3 flex-wrap mb-2" style={{ fontSize: "12px" }}>
        {usedWireTypes.map((type) => (
          <span key={type} className="flex items-center gap-1" style={{ color: t.legendText }}>
            <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: getWireColor(type) }} />
            {WIRE_LABELS[type] || type}
          </span>
        ))}
      </div>

      {/* SVG Diagram */}
      <svg width="100%" viewBox={`0 0 ${SVG_WIDTH} ${svgHeight}`} xmlns="http://www.w3.org/2000/svg" className="block">
        {/* Board */}
        <rect x={BOARD_X} y={BOARD_Y} width={BOARD_WIDTH} height={boardHeight} rx={BOARD_RX}
          fill={t.boardBg} stroke={t.boardStroke} strokeWidth={1.2} />
        {/* USB port */}
        <rect x={BOARD_X + 65} y={BOARD_Y - 8} width={60} height={16} rx={3}
          fill={t.chipBg} stroke={t.chipStroke} strokeWidth={0.5} />
        {/* Chip */}
        <rect x={BOARD_X + 50} y={BOARD_Y + 40} width={90} height={50} rx={4}
          fill={t.chipBg} stroke={t.chipStroke} strokeWidth={0.5} />
        <text x={BOARD_X + BOARD_WIDTH / 2} y={BOARD_Y + 62} textAnchor="middle" dominantBaseline="central"
          fill={t.chipText} style={{ fontSize: "12px" }}>
          {data.board.type.includes("esp") ? "ESP32" : data.board.type.includes("raspberry") ? "BCM" : "ATmega"}
        </text>
        <text x={BOARD_X + BOARD_WIDTH / 2} y={BOARD_Y + 78} textAnchor="middle" dominantBaseline="central"
          fill={t.chipText} style={{ fontSize: "11px" }}>
          {data.board.type.includes("esp") ? "WROOM" : ""}
        </text>
        {/* Board label */}
        <text x={BOARD_X + BOARD_WIDTH / 2} y={BOARD_Y + 115} textAnchor="middle" dominantBaseline="central"
          fill={t.boardLabel} style={{ fontSize: "14px", fontWeight: 500 }}>
          {data.board.label}
        </text>

        {/* Pin header lines */}
        <line x1={BOARD_X + 3} y1={PIN_START_Y - 10} x2={BOARD_X + 3}
          y2={PIN_START_Y + Math.max(boardPins.left.length - 1, 0) * PIN_SPACING + 10}
          stroke={t.pinHeaderLine} strokeWidth={0.5} />
        <line x1={BOARD_X + BOARD_WIDTH - 3} y1={PIN_START_Y - 10} x2={BOARD_X + BOARD_WIDTH - 3}
          y2={PIN_START_Y + Math.max(boardPins.right.length - 1, 0) * PIN_SPACING + 10}
          stroke={t.pinHeaderLine} strokeWidth={0.5} />

        {/* Board pins — left */}
        {boardPins.left.map((pin) => (
          <g key={`bl-${pin.name}`}>
            <circle cx={BOARD_X} cy={pin.y} r={PIN_RADIUS} fill={getWireColor(pin.type)} />
            <text x={BOARD_X + 14} y={pin.y} dominantBaseline="central" fill={t.pinLabel} style={{ fontSize: "12px" }}>
              {pin.name}
            </text>
          </g>
        ))}

        {/* Board pins — right */}
        {boardPins.right.map((pin) => (
          <g key={`br-${pin.name}`}>
            <circle cx={BOARD_X + BOARD_WIDTH} cy={pin.y} r={PIN_RADIUS} fill={getWireColor(pin.type)} />
            <text x={BOARD_X + BOARD_WIDTH - 14} y={pin.y} textAnchor="end" dominantBaseline="central" fill={t.pinLabel} style={{ fontSize: "12px" }}>
              {pin.name}
            </text>
          </g>
        ))}

        {/* Components */}
        {data.components.map((comp) => {
          const pos = compPositions[comp.id];
          if (!pos) return null;
          return (
            <g key={comp.id} className="cursor-pointer"
              onMouseEnter={() => setHighlightComp(comp.id)} onMouseLeave={() => setHighlightComp(null)}>
              <rect x={pos.x} y={pos.y} width={pos.width} height={pos.height} rx={8}
                fill={t.compBg} stroke={t.compStroke}
                strokeWidth={highlightComp === comp.id ? 2 : 1.2}
                style={{ transition: "stroke-width 0.15s" }} />
              <text x={pos.x + pos.width / 2} y={pos.y + 18} textAnchor="middle" dominantBaseline="central"
                fill={t.compLabel} style={{ fontSize: "14px", fontWeight: 500 }}>
                {comp.label}
              </text>
              <text x={pos.x + pos.width / 2} y={pos.y + 36} textAnchor="middle" dominantBaseline="central"
                fill={t.compDesc} style={{ fontSize: "12px" }}>
                {comp.description}
              </text>
              {comp.pins.map((pin) => {
                const pinPos = pos.pinPositions[pin.name];
                if (!pinPos) return null;
                const isLeft = comp.side === "left";
                return (
                  <g key={`${comp.id}-${pin.name}`}>
                    <circle cx={pinPos.x} cy={pinPos.y} r={3} fill={getWireColor(pin.type)} />
                    <text x={isLeft ? pinPos.x - 10 : pinPos.x + 10} y={pinPos.y}
                      textAnchor={isLeft ? "end" : "start"} dominantBaseline="central"
                      fill={t.compPinLabel} style={{ fontSize: "11px" }}>
                      {pin.name}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}

        {/* Wires */}
        {data.connections.map((conn, i) => {
          const path = buildWirePath(conn);
          if (!path) return null;
          const isDimmed = highlightComp !== null && highlightComp !== conn.from_component;
          return (
            <path key={`wire-${i}`} d={path} fill="none"
              stroke={getWireColor(conn.wire_type)}
              strokeWidth={isDimmed ? 0.8 : 1.5} strokeLinecap="round"
              strokeDasharray={isSharedPin(conn) ? "4 3" : "none"}
              opacity={isDimmed ? 0.1 : 1}
              style={{ transition: "opacity 0.15s, stroke-width 0.15s" }}
              className="cursor-pointer"
              onMouseEnter={() => setHighlightComp(conn.from_component)}
              onMouseLeave={() => setHighlightComp(null)} />
          );
        })}

        {/* Wire notes */}
        {data.connections.map((conn, i) => {
          if (!conn.note) return null;
          const comp = data.components.find((c) => c.id === conn.from_component);
          if (!comp) return null;
          const compPos = compPositions[conn.from_component];
          if (!compPos) return null;
          const fromPos = compPos.pinPositions[conn.from_pin];
          if (!fromPos) return null;
          const toPos = resolveBoardPin(conn);
          if (!toPos) return null;
          const midX = (fromPos.x + toPos.x) / 2;
          const midY = (fromPos.y + toPos.y) / 2 - 8;
          return (
            <g key={`note-${i}`} opacity={highlightComp !== null && highlightComp !== conn.from_component ? 0.1 : 1}
              style={{ transition: "opacity 0.15s" }}>
              <rect x={midX - 42} y={midY - 8} width={84} height={16} rx={3} fill={t.noteBg} opacity={0.9} />
              <text x={midX} y={midY} textAnchor="middle" dominantBaseline="central" fill="#D85A30" style={{ fontSize: "10px" }}>
                {conn.note}
              </text>
            </g>
          );
        })}

        {/* Power warning */}
        {data.power_warning && (
          <g>
            <rect x={40} y={svgHeight - 38} width={SVG_WIDTH - 80} height={30} rx={6} fill={t.warningBg} />
            <text x={SVG_WIDTH / 2} y={svgHeight - 23} textAnchor="middle" dominantBaseline="central"
              fill={t.warningText} style={{ fontSize: "12px", fontWeight: 500 }}>
              {data.power_warning}
            </text>
          </g>
        )}
      </svg>

      {/* Wiring Table */}
      <table className="w-full text-sm mt-4 border-collapse">
        <thead>
          <tr className="border-b-2 border-stone-200 dark:border-stone-700">
            <th className="text-left py-2 px-2.5 font-medium text-stone-900 dark:text-stone-100">Component</th>
            <th className="text-left py-2 px-2.5 font-medium text-stone-900 dark:text-stone-100">Pin</th>
            <th className="text-left py-2 px-2.5 font-medium text-stone-900 dark:text-stone-100">{data.board.label} pin</th>
            <th className="text-left py-2 px-2.5 font-medium text-stone-900 dark:text-stone-100">Notes</th>
          </tr>
        </thead>
        <tbody>
          {data.connections.map((conn, i) => (
            <tr key={`row-${i}`}
              className="border-b border-stone-100 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/50"
              onMouseEnter={() => setHighlightComp(conn.from_component)}
              onMouseLeave={() => setHighlightComp(null)}>
              <td className="py-1.5 px-2.5 text-stone-900 dark:text-stone-100">{getCompLabel(conn.from_component)}</td>
              <td className="py-1.5 px-2.5 text-stone-900 dark:text-stone-100">
                <span className="inline-block w-2 h-2 rounded-sm mr-1.5 align-middle" style={{ backgroundColor: getWireColor(conn.wire_type) }} />
                {conn.from_pin}
              </td>
              <td className="py-1.5 px-2.5 text-stone-900 dark:text-stone-100 font-medium">{conn.to_pin}</td>
              <td className="py-1.5 px-2.5 text-amber-600 dark:text-amber-400 italic text-xs">{conn.note || ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
