export interface ProtocolItem {
  number: number;
  clauseRef: string;
  clauseTitle: string;
  originalText: string;
  proposedText: string;
  justification: string;
  legalRef: string;
}

export interface AnalysisResult {
  contractTitle: string;
  overallRisk: 'high' | 'medium' | 'low';
  role: 'customer' | 'contractor';
  analysisDate: string;
  analysisText: string;
  protocolItems: ProtocolItem[];
}
