export interface ContractRisk {
  severity: 'high' | 'medium' | 'low';
  clause: string;
  description: string;
  recommendation: string;
}

export interface ProblematicClause {
  number: string;
  title: string;
  issue: string;
  risk: string;
}

export interface DisagreementItem {
  clauseNumber: string;
  clauseTitle: string;
  originalText: string;
  issue: string;
  proposedText: string;
  justification: string;
}

export interface AnalysisResult {
  contractTitle: string;
  overallRisk: 'high' | 'medium' | 'low';
  summary: string;
  role: 'customer' | 'contractor';
  analysisDate: string;
  risks: ContractRisk[];
  problematicClauses: ProblematicClause[];
  missingClauses: string[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  disagreementProtocol: DisagreementItem[];
}
