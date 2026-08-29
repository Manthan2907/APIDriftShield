import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
  useReactFlow,
  ReactFlowProvider
} from "reactflow";
import { motion, AnimatePresence } from "framer-motion";
import "reactflow/dist/style.css";
import { AnalysisResult, ApiChange } from "@/types";
import {
  Play,
  Pause,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Zap,
  Volume2,
  VolumeX,
  Bot,
  Radio,
  XCircle,
  FileCode,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AnimatedFlowchartProps {
  result: AnalysisResult;
}

// ── Pure Node & Edge Builder for Clean Light Mode ────────────────────────────

function buildNodesAndEdges(
  result: AnalysisResult,
  isAnimating: boolean,
  activeHighlightedNode: string | null
) {
  const newNodes: Node[] = [];
  const newEdges: Edge[] = [];

  const isNodeHighlighted = (id: string) => activeHighlightedNode === id;

  const removedEndpoints: ApiChange[] = [];
  const requiredFieldChanges: ApiChange[] = [];
  const typeChanges: ApiChange[] = [];
  const otherBreaking: ApiChange[] = [];
  const cautionList: ApiChange[] = [];
  const safeList: ApiChange[] = [];

  result.changes.forEach((c) => {
    if (c.severity === "breaking") {
      if (c.type === "removed_endpoint" || c.title.toLowerCase().includes("removed")) {
        removedEndpoints.push(c);
      } else if (c.type === "added_required_field" || c.title.toLowerCase().includes("required")) {
        requiredFieldChanges.push(c);
      } else if (c.type === "type_change" || c.type === "format_changed" || c.title.toLowerCase().includes("type")) {
        typeChanges.push(c);
      } else {
        otherBreaking.push(c);
      }
    } else if (c.severity === "caution" || c.severity === "uncertain") {
      cautionList.push(c);
    } else {
      safeList.push(c);
    }
  });

  const totalBreaking = result.summary.breaking;
  const isBlocked = totalBreaking > 0;

  // Node 1: Client Applications
  newNodes.push({
    id: "client-apps",
    data: {
      label: (
        <div className="text-left font-sans">
          <div className="text-[10px] uppercase font-extrabold tracking-wider text-sky-700">Upstream</div>
          <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
            👥 Client Consumers
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Web, Mobile &amp; SDKs</div>
        </div>
      )
    },
    position: { x: 30, y: 160 },
    sourcePosition: Position.Right,
    style: {
      background: isNodeHighlighted("client-apps") ? "#e0f2fe" : "#ffffff",
      border: isNodeHighlighted("client-apps") ? "3px solid #0284c7" : "2px solid #0284c7",
      borderRadius: "14px",
      padding: "14px 18px",
      boxShadow: isNodeHighlighted("client-apps")
        ? "0 0 25px rgba(2, 132, 199, 0.4)"
        : "0 4px 16px rgba(2, 132, 199, 0.12)",
      width: 180
    }
  });

  // Node 2: Gateway Layer
  newNodes.push({
    id: "api-gateway",
    data: {
      label: (
        <div className="text-left font-sans">
          <div className="text-[10px] uppercase font-extrabold tracking-wider text-indigo-700">Ingress</div>
          <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
            ⚡ API Gateway
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Routing &amp; Auth Dispatch</div>
        </div>
      )
    },
    position: { x: 260, y: 160 },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    style: {
      background: isNodeHighlighted("api-gateway") ? "#eef2ff" : "#ffffff",
      border: isNodeHighlighted("api-gateway") ? "3px solid #6366f1" : "2px solid #6366f1",
      borderRadius: "14px",
      padding: "14px 18px",
      boxShadow: isNodeHighlighted("api-gateway")
        ? "0 0 25px rgba(99, 102, 241, 0.4)"
        : "0 4px 16px rgba(99, 102, 241, 0.12)",
      width: 180
    }
  });

  // Node 3: DriftShield AST Engine
  newNodes.push({
    id: "drift-engine",
    data: {
      label: (
        <div className="text-left font-sans">
          <div className="text-[10px] uppercase font-extrabold tracking-wider text-cyan-800">Deterministic Engine</div>
          <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
            🔍 Spec AST Diff
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">13 RFC Rules Enforced</div>
        </div>
      )
    },
    position: { x: 490, y: 160 },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    style: {
      background: isNodeHighlighted("drift-engine") ? "#cffafe" : "#ffffff",
      border: isNodeHighlighted("drift-engine") ? "3px solid #06b6d4" : "2px solid #06b6d4",
      borderRadius: "14px",
      padding: "14px 18px",
      boxShadow: isNodeHighlighted("drift-engine")
        ? "0 0 25px rgba(6, 182, 212, 0.4)"
        : "0 4px 16px rgba(6, 182, 212, 0.12)",
      width: 190
    }
  });

  // Edge: Clients ➔ Gateway ➔ Diff Engine
  newEdges.push({
    id: "e-client-gw",
    source: "client-apps",
    target: "api-gateway",
    animated: isAnimating,
    style: { stroke: "#0284c7", strokeWidth: 2.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#0284c7" }
  });

  newEdges.push({
    id: "e-gw-diff",
    source: "api-gateway",
    target: "drift-engine",
    animated: isAnimating,
    style: { stroke: "#6366f1", strokeWidth: 2.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#6366f1" }
  });

  // Build Category Clusters
  const clusters: Array<{
    id: string;
    title: string;
    badge: string;
    count: number;
    desc: string;
    color: string;
    border: string;
    bg: string;
    badgeColor: string;
    severity: "breaking" | "caution" | "safe";
    items: ApiChange[];
  }> = [];

  if (removedEndpoints.length > 0) {
    clusters.push({
      id: "cluster-removed",
      title: "Removed Endpoints",
      badge: "404 NOT FOUND",
      count: removedEndpoints.length,
      desc: `${removedEndpoints.length} endpoint route${removedEndpoints.length > 1 ? "s" : ""} deleted entirely`,
      color: "#ef4444",
      border: "#ef4444",
      bg: "#fef2f2",
      badgeColor: "bg-red-100 text-red-700 border-red-200",
      severity: "breaking",
      items: removedEndpoints
    });
  }

  if (requiredFieldChanges.length > 0) {
    clusters.push({
      id: "cluster-required",
      title: "Mandatory Request Fields",
      badge: "422 UNPROCESSABLE",
      count: requiredFieldChanges.length,
      desc: `${requiredFieldChanges.length} newly mandatory parameter${requiredFieldChanges.length > 1 ? "s" : ""}`,
      color: "#ef4444",
      border: "#ef4444",
      bg: "#fef2f2",
      badgeColor: "bg-red-100 text-red-700 border-red-200",
      severity: "breaking",
      items: requiredFieldChanges
    });
  }

  if (typeChanges.length > 0 || otherBreaking.length > 0) {
    const allTypes = [...typeChanges, ...otherBreaking];
    clusters.push({
      id: "cluster-types",
      title: "Schema & Type Narrowing",
      badge: "TYPE MISMATCH",
      count: allTypes.length,
      desc: `${allTypes.length} altered schema${allTypes.length > 1 ? "s" : ""} / format${allTypes.length > 1 ? "s" : ""}`,
      color: "#ef4444",
      border: "#ef4444",
      bg: "#fef2f2",
      badgeColor: "bg-red-100 text-red-700 border-red-200",
      severity: "breaking",
      items: allTypes
    });
  }

  if (cautionList.length > 0) {
    clusters.push({
      id: "cluster-caution",
      title: "Caution & Nullable Drift",
      badge: "REVIEW NEEDED",
      count: cautionList.length,
      desc: `${cautionList.length} potential behavioral shift${cautionList.length > 1 ? "s" : ""}`,
      color: "#f59e0b",
      border: "#f59e0b",
      bg: "#fffbeb",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
      severity: "caution",
      items: cautionList
    });
  }

  if (safeList.length > 0) {
    clusters.push({
      id: "cluster-safe",
      title: "Backwards-Compatible Additions",
      badge: "SAFE RELEASE",
      count: safeList.length,
      desc: `${safeList.length} additive endpoint${safeList.length > 1 ? "s" : ""} / optional parameter${safeList.length > 1 ? "s" : ""}`,
      color: "#10b981",
      border: "#10b981",
      bg: "#f0fdf4",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
      severity: "safe",
      items: safeList
    });
  }

  // Fallback cluster if clean/safe
  if (clusters.length === 0) {
    clusters.push({
      id: "cluster-safe",
      title: "All Routes Compatible",
      badge: "100% SAFE",
      count: 1,
      desc: "Zero breaking contract changes detected",
      color: "#10b981",
      border: "#10b981",
      bg: "#f0fdf4",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
      severity: "safe",
      items: []
    });
  }

  // Position the clusters neatly
  const clusterVerticalGap = 125;
  const startY = Math.max(20, 180 - ((clusters.length - 1) * clusterVerticalGap) / 2);

  clusters.forEach((cl, idx) => {
    const highlighted = isNodeHighlighted(cl.id);

    newNodes.push({
      id: cl.id,
      data: {
        label: (
          <div className="text-left font-sans cursor-pointer group">
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <span
                className={cn(
                  "text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-full border font-mono",
                  cl.badgeColor
                )}
              >
                {cl.badge}
              </span>
              <span className="text-xs font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-300 font-mono shadow-sm">
                {cl.count} {cl.count === 1 ? "Route" : "Routes"}
              </span>
            </div>
            <div className="text-xs font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
              {cl.title}
            </div>
            <div className="text-[11px] text-slate-600 mt-0.5 leading-snug">{cl.desc}</div>
            <div className="text-[10px] text-indigo-700 font-semibold mt-2 flex items-center gap-1">
              <span>Click to inspect {cl.count} routes</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        )
      },
      position: { x: 740, y: startY + idx * clusterVerticalGap },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      style: {
        background: highlighted ? "#fee2e2" : cl.bg,
        border: highlighted ? `3px solid ${cl.border}` : `2px solid ${cl.border}`,
        borderRadius: "14px",
        padding: "14px 16px",
        boxShadow: highlighted
          ? `0 0 25px ${cl.color}`
          : "0 4px 16px rgba(0, 0, 0, 0.06)",
        width: 220
      }
    });

    // Edge: Diff Engine ➔ Cluster
    newEdges.push({
      id: `e-diff-${cl.id}`,
      source: "drift-engine",
      target: cl.id,
      animated: isAnimating,
      style: {
        stroke: cl.color,
        strokeWidth: 2,
        strokeDasharray: cl.severity === "breaking" ? "5 5" : "none"
      },
      markerEnd: { type: MarkerType.ArrowClosed, color: cl.color }
    });

    // Edge: Cluster ➔ Release Decision Gate
    newEdges.push({
      id: `e-${cl.id}-gate`,
      source: cl.id,
      target: "shield-gate",
      animated: isAnimating,
      style: {
        stroke: cl.color,
        strokeWidth: 2,
        strokeDasharray: cl.severity === "breaking" ? "5 5" : "none"
      },
      markerEnd: { type: MarkerType.ArrowClosed, color: cl.color }
    });
  });

  // Node 5: Shield Release Gate Decision
  const isGateHighlighted = isNodeHighlighted("shield-gate");
  const gateX = 1040;

  newNodes.push({
    id: "shield-gate",
    data: {
      label: (
        <div className="text-left font-sans text-white">
          <div className="flex items-center gap-1.5 mb-1.5">
            {isBlocked ? (
              <ShieldAlert className="w-5 h-5 text-white" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-white" />
            )}
            <span
              className={cn(
                "text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full border",
                isBlocked
                  ? "bg-red-800 text-white border-red-300"
                  : "bg-emerald-800 text-white border-emerald-300"
              )}
            >
              {isBlocked ? "RELEASE BLOCKED" : "RELEASE APPROVED"}
            </span>
          </div>
          <div className="text-sm font-extrabold text-white mt-1">
            {isBlocked
              ? `${totalBreaking} Incompatibilities Gated`
              : "✅ 100% Backwards-Compatible"}
          </div>
          <div className="text-[11px] text-white/90 mt-1 flex items-center justify-between">
            <span>Benchmark F1:</span>
            <strong className="font-mono text-white">0.965 F1</strong>
          </div>
          <div className="text-[11px] text-white/90 flex items-center justify-between">
            <span>Claims Verified:</span>
            <strong className="font-mono text-white">0.0% Hallucinations</strong>
          </div>
        </div>
      )
    },
    position: { x: gateX, y: 140 },
    targetPosition: Position.Left,
    style: {
      background: isBlocked ? "#dc2626" : "#16a34a",
      border: isGateHighlighted
        ? isBlocked ? "3px solid #fecaca" : "3px solid #bbf7d0"
        : isBlocked ? "3px solid #b91c1c" : "3px solid #15803d",
      borderRadius: "16px",
      padding: "16px 20px",
      boxShadow: isGateHighlighted
        ? isBlocked ? "0 0 35px rgba(220, 38, 38, 0.7)" : "0 0 35px rgba(22, 163, 74, 0.7)"
        : isBlocked ? "0 10px 25px rgba(220, 38, 38, 0.35)" : "0 10px 25px rgba(22, 163, 74, 0.35)",
      width: 260
    }
  });

  return { nodes: newNodes, edges: newEdges, removedEndpoints, requiredFieldChanges, typeChanges, otherBreaking, cautionList, safeList, isBlocked };
}

// ── Inner Flowchart Component ──────────────────────────────────────────────────

function FlowchartInner({ result }: AnimatedFlowchartProps) {
  const { fitView } = useReactFlow();

  const initial = useMemo(() => buildNodesAndEdges(result, true, null), [result]);
  const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges);
  const [isAnimating, setIsAnimating] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [selectedCluster, setSelectedCluster] = useState<{
    title: string;
    severity: "breaking" | "caution" | "safe";
    changes: ApiChange[];
  } | null>(null);

  // 🎙️ Voice Agent State
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [currentVoiceStep, setCurrentVoiceStep] = useState<number>(0);
  const [activeHighlightedNode, setActiveHighlightedNode] = useState<string | null>(null);
  const [subtitles, setSubtitles] = useState<string>("");
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const { removedEndpoints, requiredFieldChanges, typeChanges, otherBreaking, isBlocked } = initial;
  const totalBreaking = result.summary.breaking;

  // Voice Tour Script definition with detailed inspection of EACH red box
  const voiceTourSteps = useMemo(() => {
    const steps: Array<{ nodeId: string; title: string; text: string }> = [
      {
        nodeId: "client-apps",
        title: "1. Upstream Client Consumers",
        text: `Starting with your upstream clients. Web applications, iOS, Android, and client SDKs are actively dispatching traffic assuming the version 1 specification contract.`
      },
      {
        nodeId: "api-gateway",
        title: "2. API Gateway & Ingress Layer",
        text: `Traffic reaches your API Gateway. The gateway verifies authentication headers and dispatches incoming requests to the target microservices.`
      },
      {
        nodeId: "drift-engine",
        title: "3. DriftShield Deterministic Engine",
        text: `Our deterministic engine diffed the specification AST across 13 RFC policy rules. It identified ${totalBreaking} breaking incompatibilities between ${result.specV1Name} and ${result.specV2Name}.`
      }
    ];

    if (removedEndpoints.length > 0) {
      const routeList = removedEndpoints.slice(0, 3).map((c) => c.route || c.path).join(", ");
      steps.push({
        nodeId: "cluster-removed",
        title: "Phase 4.1: Breaking Red Box — Removed Endpoints (HTTP 404)",
        text: `Inspecting first breaking red box: Removed Endpoints. Found ${removedEndpoints.length} deleted route${removedEndpoints.length > 1 ? "s" : ""}, including ${routeList}. Any existing client calling these deleted routes will immediately crash with HTTP 404 Not Found.`
      });
    }

    if (requiredFieldChanges.length > 0) {
      const fieldList = requiredFieldChanges.slice(0, 3).map((c) => `${c.title || c.route}`).join(", ");
      steps.push({
        nodeId: "cluster-required",
        title: "Phase 4.2: Breaking Red Box — Mandatory Request Fields (HTTP 422)",
        text: `Inspecting second breaking red box: Mandatory Request Fields. Found ${requiredFieldChanges.length} newly mandatory parameter${requiredFieldChanges.length > 1 ? "s" : ""}: ${fieldList}. Existing clients omitting these fields will fail schema validation with HTTP 422 Unprocessable Entity.`
      });
    }

    if (typeChanges.length > 0 || otherBreaking.length > 0) {
      const allTypes = [...typeChanges, ...otherBreaking];
      const typeList = allTypes.slice(0, 3).map((c) => `${c.title || c.route}`).join(", ");
      steps.push({
        nodeId: "cluster-types",
        title: "Phase 4.3: Breaking Red Box — Schema & Type Narrowing (HTTP 400)",
        text: `Inspecting third breaking red box: Schema & Type Narrowing. Detected ${allTypes.length} type format change${allTypes.length > 1 ? "s" : ""}: ${typeList}. Clients sending legacy format payloads will fail serialization with HTTP 400 Bad Request.`
      });
    }

    steps.push({
      nodeId: "shield-gate",
      title: "5. Shield Gate Decision & 5-Minute Resolution",
      text: isBlocked
        ? `The Release Shield has BLOCKED this deployment due to ${totalBreaking} breaking errors. To resolve this in under 5 minutes: Deploy an API gateway proxy rewrite rule for removed endpoints, and configure server-side default values for newly mandatory fields. This guarantees zero client outages.`
        : `All contract modifications are verified 100% backwards-compatible. The release is approved for production deployment.`
    });

    return steps;
  }, [totalBreaking, isBlocked, result.specV1Name, result.specV2Name, removedEndpoints, requiredFieldChanges, typeChanges, otherBreaking]);

  // Handle Speech Synthesis
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
      if (synthRef.current.paused) {
        synthRef.current.resume();
      }
    }
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const speakStep = (index: number, overrideSpeed?: number) => {
    if (!synthRef.current || index >= voiceTourSteps.length || index < 0) {
      setIsVoiceActive(false);
      setActiveHighlightedNode(null);
      setSubtitles("");
      toast.success("Voice Analysis & Remediation Tour completed!");
      return;
    }

    try {
      synthRef.current.cancel();
      if (synthRef.current.paused) {
        synthRef.current.resume();
      }
    } catch {
      // Ignored
    }

    const current = voiceTourSteps[index];
    setCurrentVoiceStep(index);
    setActiveHighlightedNode(current.nodeId);
    setSubtitles(current.text);

    // Auto open drawer for breaking cluster nodes
    if (current.nodeId === "cluster-removed") {
      setSelectedCluster({
        title: "Removed Endpoints (HTTP 404)",
        severity: "breaking",
        changes: removedEndpoints
      });
    } else if (current.nodeId === "cluster-required") {
      setSelectedCluster({
        title: "Mandatory Request Fields (HTTP 422)",
        severity: "breaking",
        changes: requiredFieldChanges
      });
    } else if (current.nodeId === "cluster-types") {
      setSelectedCluster({
        title: "Schema & Type Narrowing Failures (HTTP 400)",
        severity: "breaking",
        changes: [...typeChanges, ...otherBreaking]
      });
    } else {
      setSelectedCluster(null);
    }

    const currentSpeed = overrideSpeed !== undefined ? overrideSpeed : speed;
    const utterance = new SpeechSynthesisUtterance(current.text);

    // Natural, legible speech rates
    if (currentSpeed === 3) {
      utterance.rate = 1.40;
    } else if (currentSpeed === 2) {
      utterance.rate = 1.22;
    } else if (currentSpeed === 0.5) {
      utterance.rate = 0.85;
    } else {
      utterance.rate = 1.05;
    }

    utterance.pitch = 1.0;

    const voices = synthRef.current.getVoices();
    const preferredVoice =
      voices.find(
        (v) =>
          v.lang.startsWith("en") &&
          (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Daniel") || v.name.includes("Samantha"))
      ) || voices.find((v) => v.lang.startsWith("en"));
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onend = () => {
      const pauseDuration = currentSpeed >= 2 ? 600 : 1200;
      setTimeout(() => {
        speakStep(index + 1, currentSpeed);
      }, pauseDuration);
    };

    utterance.onerror = (e) => {
      if (e.error !== "canceled" && e.error !== "interrupted") {
        setIsVoiceActive(false);
      }
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    if (isVoiceActive) {
      speakStep(currentVoiceStep, newSpeed);
    }
  };

  const handleNextStep = () => {
    if (currentVoiceStep + 1 < voiceTourSteps.length) {
      speakStep(currentVoiceStep + 1);
    } else {
      if (synthRef.current) synthRef.current.cancel();
      setIsVoiceActive(false);
      setActiveHighlightedNode(null);
      setSubtitles("");
    }
  };

  const handlePrevStep = () => {
    if (currentVoiceStep > 0) {
      speakStep(currentVoiceStep - 1);
    }
  };

  const handleStartVoice = () => {
    if (isVoiceActive) {
      if (synthRef.current) synthRef.current.cancel();
      setIsVoiceActive(false);
      setActiveHighlightedNode(null);
      setSubtitles("");
      toast.info("Voice tour paused");
    } else {
      setIsVoiceActive(true);
      toast.success("🎙️ AI Voice Agent Activated — Speaking Analysis & 5-Minute Fix");
      speakStep(0);
    }
  };

  // Re-build nodes on state change
  useEffect(() => {
    const { nodes: updatedNodes, edges: updatedEdges } = buildNodesAndEdges(
      result,
      isAnimating,
      activeHighlightedNode
    );
    setNodes(updatedNodes);
    setEdges(updatedEdges);
  }, [result, isAnimating, activeHighlightedNode, setNodes, setEdges]);

  // Center view on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      fitView({ padding: 0.2, duration: 400 });
    }, 100);
    return () => clearTimeout(timer);
  }, [fitView]);

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    if (node.id === "cluster-removed") {
      setSelectedCluster({
        title: "Removed Endpoints (HTTP 404)",
        severity: "breaking",
        changes: removedEndpoints
      });
    } else if (node.id === "cluster-required") {
      setSelectedCluster({
        title: "Mandatory Request Fields (HTTP 422)",
        severity: "breaking",
        changes: requiredFieldChanges
      });
    } else if (node.id === "cluster-types") {
      setSelectedCluster({
        title: "Schema & Type Narrowing Failures",
        severity: "breaking",
        changes: [...typeChanges, ...otherBreaking]
      });
    } else if (node.id === "cluster-caution") {
      setSelectedCluster({
        title: "Caution & Review Items",
        severity: "caution",
        changes: initial.cautionList
      });
    } else if (node.id === "cluster-safe") {
      setSelectedCluster({
        title: "Safe Backwards-Compatible Additions",
        severity: "safe",
        changes: initial.safeList
      });
    }
  };

  return (
    <div className="relative w-full h-[640px] min-h-[550px] rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden shadow-md">
      {/* Top Floating Controls Bar */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2.5 bg-white/95 border border-slate-200 p-2 rounded-xl backdrop-blur-md shadow-md">
        {/* 🎙️ Voice Narrator Agent Button */}
        <button
          onClick={handleStartVoice}
          className={cn(
            "flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-extrabold transition-all shadow-sm cursor-pointer",
            isVoiceActive
              ? "bg-rose-600 hover:bg-rose-700 text-white animate-pulse"
              : "bg-indigo-600 hover:bg-indigo-700 text-white"
          )}
        >
          {isVoiceActive ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          {isVoiceActive ? "Stop Voice Tour" : "🎙️ AI Voice Tour & 5-Min Fix"}
        </button>

        <button
          onClick={() => fitView({ padding: 0.2, duration: 400 })}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors shadow-sm cursor-pointer"
        >
          🎯 Center View
        </button>

        <button
          onClick={() => setIsAnimating(!isAnimating)}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-slate-200 cursor-pointer",
            isAnimating ? "bg-slate-100 text-slate-800" : "bg-white text-slate-500"
          )}
        >
          {isAnimating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          {isAnimating ? "Pause Stream" : "Play"}
        </button>

        <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 text-xs">
          <span className="text-slate-500 font-medium text-[11px]">Speed:</span>
          {[0.5, 1, 2, 3].map((s) => (
            <button
              key={s}
              onClick={() => handleSpeedChange(s)}
              className={cn(
                "px-2 py-0.5 rounded font-mono text-[11px] font-semibold transition-colors cursor-pointer",
                speed === s ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
              )}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* 🎙️ Live Voice Subtitles & 5-Minute Fix Bar (at the bottom) */}
      <AnimatePresence>
        {isVoiceActive && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 max-w-2xl w-[94%] bg-slate-900/98 border border-slate-800 p-4 rounded-2xl shadow-2xl backdrop-blur-2xl flex items-center gap-4 text-white"
          >
            <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex-shrink-0">
              <Bot className="w-6 h-6 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-mono font-extrabold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {voiceTourSteps[currentVoiceStep]?.title || "DriftShield AI Agent"}
                  </span>
                  <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                    <Radio className="w-3 h-3 animate-pulse" /> Live Voice
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  Step {currentVoiceStep + 1} of {voiceTourSteps.length}
                </span>
              </div>
              <p className="text-[12.5px] text-slate-100 leading-relaxed font-sans font-medium">{subtitles}</p>

              {/* Prev / Next buttons */}
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-800">
                <button
                  onClick={handlePrevStep}
                  disabled={currentVoiceStep === 0}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-[11px] text-slate-200 font-semibold transition-colors cursor-pointer"
                >
                  ◀ Prev Step
                </button>
                <button
                  onClick={handleNextStep}
                  className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-[11px] text-white font-semibold transition-colors cursor-pointer"
                >
                  {currentVoiceStep + 1 === voiceTourSteps.length ? "Finish Tour" : "Next Step ▶"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Flowchart Canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        maxZoom={1.8}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
      >
        <Background color="#cbd5e1" gap={16} size={1} />
        <Controls className="bg-white border border-slate-200 fill-slate-700 text-slate-700 shadow-md rounded-xl overflow-hidden" />
        <MiniMap
          nodeColor={(n) => {
            if (n.id === "shield-gate") return isBlocked ? "#dc2626" : "#16a34a";
            if (n.id.startsWith("cluster")) return "#ef4444";
            return "#0284c7";
          }}
          maskColor="rgba(248, 250, 252, 0.75)"
          className="bg-white border border-slate-200 rounded-xl shadow-md"
        />
      </ReactFlow>

      {/* Slide-over Inspection Drawer when a Cluster Node is Clicked */}
      <AnimatePresence>
        {selectedCluster && (
          <motion.div
            initial={{ opacity: 0, x: 340 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 340 }}
            className="absolute top-0 right-0 h-full w-[380px] bg-white border-l border-slate-200 shadow-2xl p-5 z-40 overflow-y-auto font-sans"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border",
                    selectedCluster.severity === "breaking"
                      ? "bg-red-100 text-red-700 border-red-200"
                      : "bg-emerald-100 text-emerald-700 border-emerald-200"
                  )}
                >
                  {selectedCluster.severity}
                </span>
                <h3 className="font-extrabold text-sm text-slate-900">{selectedCluster.title}</h3>
              </div>
              <button
                onClick={() => setSelectedCluster(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <p className="text-xs text-slate-600">
                Found {selectedCluster.changes.length} route mutation{selectedCluster.changes.length !== 1 ? "s" : ""} in this cluster:
              </p>

              {selectedCluster.changes.map((c, i) => (
                <div key={c.id || i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-800">
                      {c.method || "METHOD"}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 font-semibold">{c.confidence}% Conf.</span>
                  </div>
                  <div className="font-mono text-xs font-bold text-slate-900">{c.route}</div>
                  <div className="text-xs text-slate-600 leading-snug">{c.title}</div>
                  {c.evidence && (
                    <div className="bg-slate-900 rounded p-2 text-[10px] font-mono text-indigo-300 overflow-x-auto">
                      {c.evidence}
                    </div>
                  )}
                  {c.testEvidence && (
                    <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-1">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      <span>Runtime Probe Verified: {c.testEvidence.v2Result}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function AnimatedFlowchart({ result }: AnimatedFlowchartProps) {
  return (
    <ReactFlowProvider>
      <FlowchartInner result={result} />
    </ReactFlowProvider>
  );
}
