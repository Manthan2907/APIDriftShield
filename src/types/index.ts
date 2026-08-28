export type ChangeType =
  | "removed_endpoint"
  | "added_required_field"
  | "type_change"
  | "auth_change"
  | "response_removed"
  | "description_change"
  | "optional_field_added"
  | "new_endpoint"
  | "example_update"
  | "new_response_field"
  | "status_code_change"
  | "parameter_removed"
  | "parameter_type_change";

export type Severity = "breaking" | "caution" | "safe";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS" | "HEAD";

export interface SchemaChange {
  field: string;
  before: string;
  after: string;
}

export interface ImpactItem {
  name: string;
  affected: string;
  detail: string;
}

export interface TestEvidence {
  testCase: string;
  v1Result: string;
  v2Result: string;
  confirms: string;
}

export interface ApiChange {
  id: string;
  type: ChangeType;
  severity: Severity;
  route: string;
  method?: string;
  title: string;
  description: string;
  evidence: string;
  schemaChanges?: SchemaChange[];
  confidence: number;
  impactItems?: ImpactItem[];
  testEvidence?: TestEvidence;
  recommendation?: string;
  affectedDocs?: string[];
}

export interface AnalysisResult {
  id: string;
  summary: {
    breaking: number;
    caution: number;
    safe: number;
    total: number;
    impactScore: number;
  };
  changes: ApiChange[];
  specV1Name: string;
  specV2Name: string;
  analyzedAt: string;
}

export interface HistoryEntry {
  id: string;
  v1Name: string;
  v2Name: string;
  analyzedAt: string;
  summary: AnalysisResult["summary"];
  result: AnalysisResult;
}
