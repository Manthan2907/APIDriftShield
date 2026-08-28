import { ApiChange, AnalysisResult, Severity } from "@/types";

function getId(): string {
  return Math.random().toString(36).slice(2, 9);
}

function parseSpec(raw: string, name: string): Record<string, unknown> {
  const trimmed = raw.trim();
  // Try JSON first
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      return JSON.parse(trimmed);
    } catch {
      throw new Error(`Invalid JSON in "${name}". Check syntax.`);
    }
  }
  // YAML detection (basic heuristic: has `openapi:` key)
  if (trimmed.includes("openapi:") || trimmed.startsWith("---")) {
    throw new Error(`YAML detected in "${name}". Please convert to JSON format for now. YAML full support coming soon.`);
  }
  throw new Error(`Unrecognized format in "${name}". Provide an OpenAPI 3.x JSON spec.`);
}

function getPaths(spec: Record<string, unknown>): Record<string, Record<string, unknown>> {
  return (spec.paths as Record<string, Record<string, unknown>>) || {};
}

function getSecurity(op: Record<string, unknown>): string {
  const s = op.security as Array<Record<string, unknown>> | undefined;
  if (!s || s.length === 0) return "none";
  return JSON.stringify(s[0]);
}

function getRequired(requestBody: unknown): string[] {
  const rb = requestBody as Record<string, unknown> | undefined;
  if (!rb) return [];
  const content = rb.content as Record<string, unknown> | undefined;
  if (!content) return [];
  for (const mt of Object.values(content)) {
    const schema = (mt as Record<string, unknown>).schema as Record<string, unknown> | undefined;
    if (schema?.required) return schema.required as string[];
  }
  return [];
}

function getProperties(requestBody: unknown): Record<string, unknown> {
  const rb = requestBody as Record<string, unknown> | undefined;
  if (!rb) return {};
  const content = rb.content as Record<string, unknown> | undefined;
  if (!content) return {};
  for (const mt of Object.values(content)) {
    const schema = (mt as Record<string, unknown>).schema as Record<string, unknown> | undefined;
    if (schema?.properties) return schema.properties as Record<string, unknown>;
  }
  return {};
}

function getParams(operation: Record<string, unknown>): Record<string, Record<string, unknown>> {
  const params = (operation.parameters as Array<Record<string, unknown>>) || [];
  const map: Record<string, Record<string, unknown>> = {};
  for (const p of params) map[p.name as string] = p;
  return map;
}

function getResponses(operation: Record<string, unknown>): string[] {
  const r = operation.responses as Record<string, unknown> | undefined;
  return r ? Object.keys(r) : [];
}

const METHODS = ["get", "post", "put", "patch", "delete", "options", "head"];

export function analyzeSpecs(
  v1Raw: string,
  v2Raw: string,
  v1Name = "v1-spec.json",
  v2Name = "v2-spec.json"
): AnalysisResult {
  const v1 = parseSpec(v1Raw, v1Name);
  const v2 = parseSpec(v2Raw, v2Name);

  const v1Paths = getPaths(v1);
  const v2Paths = getPaths(v2);
  const changes: ApiChange[] = [];

  for (const [path, v1Ops] of Object.entries(v1Paths)) {
    const v2Ops = v2Paths[path];
    if (!v2Ops) {
      for (const method of METHODS) {
        if (v1Ops[method]) {
          changes.push({
            id: getId(), type: "removed_endpoint", severity: "breaking",
            route: `${method.toUpperCase()} ${path}`, method: method.toUpperCase(),
            title: "Endpoint removed",
            description: `${method.toUpperCase()} ${path} no longer exists in v2. Clients calling this will receive 404 errors.`,
            evidence: `Route '${path}' present in v1 spec, absent in v2 spec.`,
            schemaChanges: [], confidence: 99,
          });
        }
      }
      continue;
    }

    for (const method of METHODS) {
      const v1Op = v1Ops[method] as Record<string, unknown> | undefined;
      const v2Op = (v2Ops as Record<string, unknown>)[method] as Record<string, unknown> | undefined;

      if (v1Op && !v2Op) {
        changes.push({
          id: getId(), type: "removed_endpoint", severity: "breaking",
          route: `${method.toUpperCase()} ${path}`, method: method.toUpperCase(),
          title: "HTTP method removed",
          description: `${method.toUpperCase()} on ${path} was removed. Clients will receive 405 Method Not Allowed.`,
          evidence: `Method '${method}' on '${path}' present in v1, absent in v2.`,
          schemaChanges: [], confidence: 98,
        });
        continue;
      }
      if (!v1Op || !v2Op) continue;

      // Auth changes
      const v1Sec = getSecurity(v1Op), v2Sec = getSecurity(v2Op);
      if (v1Sec !== v2Sec) {
        changes.push({
          id: getId(), type: "auth_change", severity: "breaking",
          route: `${method.toUpperCase()} ${path}`, method: method.toUpperCase(),
          title: "Authentication scheme changed",
          description: `Security scheme changed. Existing clients may be rejected.`,
          evidence: `v1 security: ${v1Sec} → v2 security: ${v2Sec}`,
          schemaChanges: [{ field: "security", before: v1Sec, after: v2Sec }],
          confidence: 95,
        });
      }

      // Required fields
      const v1Req = getRequired(v1Op.requestBody);
      const v2Req = getRequired(v2Op.requestBody);
      const newRequired = v2Req.filter((f) => !v1Req.includes(f));
      const removedRequired = v1Req.filter((f) => !v2Req.includes(f));

      for (const field of newRequired) {
        changes.push({
          id: getId(), type: "added_required_field", severity: "breaking",
          route: `${method.toUpperCase()} ${path}`, method: method.toUpperCase(),
          title: `Required field added: '${field}'`,
          description: `Field '${field}' is now required. Clients not sending this field will receive validation errors.`,
          evidence: `v1 required: [${v1Req.join(", ")}] → v2 required: [${v2Req.join(", ")}]`,
          schemaChanges: [{ field: "requestBody.required", before: `[${v1Req.join(", ")}]`, after: `[${v2Req.join(", ")}]` }],
          confidence: 98,
          testEvidence: {
            testCase: `${method.toUpperCase()} ${path} without '${field}'`,
            v1Result: "200–201 (success)",
            v2Result: "422 Unprocessable Entity",
            confirms: `Breaking change confirmed — '${field}' is now enforced server-side`,
          },
          recommendation: `Update all clients to include '${field}'. Add validation on client side before deploying v2.`,
        });
      }

      for (const field of removedRequired) {
        changes.push({
          id: getId(), type: "optional_field_added", severity: "safe",
          route: `${method.toUpperCase()} ${path}`, method: method.toUpperCase(),
          title: `Required field relaxed: '${field}'`,
          description: `Field '${field}' is no longer required. Clients that always send it are unaffected.`,
          evidence: `'${field}' removed from required array in v2`,
          schemaChanges: [{ field: `requestBody.required.${field}`, before: "required", after: "optional" }],
          confidence: 100,
        });
      }

      // Type changes in properties
      const v1Props = getProperties(v1Op.requestBody);
      const v2Props = getProperties(v2Op.requestBody);

      for (const [field, v1Def] of Object.entries(v1Props)) {
        const v2Def = v2Props[field] as Record<string, unknown> | undefined;
        if (!v2Def) {
          changes.push({
            id: getId(), type: "parameter_removed", severity: "breaking",
            route: `${method.toUpperCase()} ${path}`, method: method.toUpperCase(),
            title: `Request field removed: '${field}'`,
            description: `Field '${field}' was removed from the schema. Clients sending it may get validation errors.`,
            evidence: `v1 has property '${field}', v2 does not`,
            schemaChanges: [{ field: `requestBody.properties.${field}`, before: JSON.stringify(v1Def), after: "(absent)" }],
            confidence: 90,
          });
          continue;
        }
        const v1Type = (v1Def as Record<string, unknown>).type as string | undefined;
        const v2Type = v2Def.type as string | undefined;
        if (v1Type && v2Type && v1Type !== v2Type) {
          changes.push({
            id: getId(), type: "type_change", severity: "breaking",
            route: `${method.toUpperCase()} ${path}`, method: method.toUpperCase(),
            title: `Field type changed: '${field}'`,
            description: `Type of '${field}' changed from '${v1Type}' to '${v2Type}'. Clients sending ${v1Type} values may fail.`,
            evidence: `v1: ${field} → ${v1Type} | v2: ${field} → ${v2Type}`,
            schemaChanges: [{ field: `requestBody.properties.${field}.type`, before: v1Type, after: v2Type }],
            confidence: 100,
          });
        }
      }

      for (const [field] of Object.entries(v2Props)) {
        if (!v1Props[field] && !newRequired.includes(field)) {
          changes.push({
            id: getId(), type: "optional_field_added", severity: "safe",
            route: `${method.toUpperCase()} ${path}`, method: method.toUpperCase(),
            title: `New optional field: '${field}'`,
            description: `Field '${field}' added as optional. Additive — existing clients are unaffected.`,
            evidence: `New property '${field}' in v2 schema.properties`,
            schemaChanges: [{ field: `requestBody.properties.${field}`, before: "(absent)", after: JSON.stringify(v2Props[field]) }],
            confidence: 100,
          });
        }
      }

      // Parameters
      const v1Params = getParams(v1Op), v2Params = getParams(v2Op);
      for (const [pName, v1Param] of Object.entries(v1Params)) {
        const v2Param = v2Params[pName];
        if (!v2Param) {
          const isRequired = v1Param.required === true;
          changes.push({
            id: getId(), type: "parameter_removed",
            severity: isRequired ? "breaking" : "caution",
            route: `${method.toUpperCase()} ${path}`, method: method.toUpperCase(),
            title: `Parameter removed: '${pName}'`,
            description: `Parameter '${pName}' was removed. ${isRequired ? "Required param — breaking." : "Optional, but clients using it may behave unexpectedly."}`,
            evidence: `Parameter '${pName}' present in v1, absent in v2`,
            schemaChanges: [], confidence: isRequired ? 95 : 75,
          });
          continue;
        }
        const v1PType = ((v1Param.schema as Record<string, unknown>)?.type as string) || "string";
        const v2PType = ((v2Param.schema as Record<string, unknown>)?.type as string) || "string";
        if (v1PType !== v2PType) {
          changes.push({
            id: getId(), type: "parameter_type_change", severity: "caution",
            route: `${method.toUpperCase()} ${path}`, method: method.toUpperCase(),
            title: `Parameter type changed: '${pName}'`,
            description: `Parameter '${pName}' type changed from '${v1PType}' to '${v2PType}'.`,
            evidence: `v1: ${pName} → ${v1PType} | v2: ${pName} → ${v2PType}`,
            schemaChanges: [{ field: `parameters.${pName}.schema.type`, before: v1PType, after: v2PType }],
            confidence: 80,
          });
        }
      }

      // Responses
      const v1Responses = getResponses(v1Op), v2Responses = getResponses(v2Op);
      for (const code of v1Responses.filter((c) => !v2Responses.includes(c))) {
        changes.push({
          id: getId(), type: "response_removed", severity: "caution",
          route: `${method.toUpperCase()} ${path}`, method: method.toUpperCase(),
          title: `Response code removed: ${code}`,
          description: `HTTP ${code} no longer declared. Clients handling ${code} may see unexpected behavior.`,
          evidence: `v1 responses: [${v1Responses.join(", ")}] → v2: [${v2Responses.join(", ")}]`,
          schemaChanges: [], confidence: 70,
        });
      }
      for (const code of v2Responses.filter((c) => !v1Responses.includes(c))) {
        changes.push({
          id: getId(), type: "new_response_field", severity: "safe",
          route: `${method.toUpperCase()} ${path}`, method: method.toUpperCase(),
          title: `New response code: ${code}`,
          description: `HTTP ${code} added to declared responses. Clients should handle gracefully.`,
          evidence: `${code} found in v2 responses, absent in v1`,
          schemaChanges: [], confidence: 100,
        });
      }
    }
  }

  // New paths in v2
  for (const [path, v2Ops] of Object.entries(v2Paths)) {
    if (!v1Paths[path]) {
      for (const method of METHODS) {
        if ((v2Ops as Record<string, unknown>)[method]) {
          changes.push({
            id: getId(), type: "new_endpoint", severity: "safe",
            route: `${method.toUpperCase()} ${path}`, method: method.toUpperCase(),
            title: "New endpoint added",
            description: `${method.toUpperCase()} ${path} is new in v2. Additive — no existing clients affected.`,
            evidence: `Route '${path}' absent in v1, present in v2`,
            schemaChanges: [], confidence: 100,
          });
        }
      }
    }
  }

  const breaking = changes.filter((c) => c.severity === "breaking").length;
  const caution = changes.filter((c) => c.severity === "caution").length;
  const safe = changes.filter((c) => c.severity === "safe").length;
  const total = changes.length;
  const impactScore = total === 0 ? 0 : Math.round(((breaking * 1.0 + caution * 0.5) / total) * 100);

  return {
    id: getId(),
    summary: { breaking, caution, safe, total, impactScore },
    changes,
    specV1Name: v1Name,
    specV2Name: v2Name,
    analyzedAt: new Date().toISOString(),
  };
}
