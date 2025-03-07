import { OscalPackage } from '../types';

interface SarifLocation {
  logicalLocation?: {
    decoratedName?: string;
  };
  physicalLocation?: {
    artifactLocation?: {
      uri?: string;
      index?: number;
    };
    region?: {
      startLine?: number;
      startColumn?: number;
      endLine?: number;
      endColumn?: number;
      charOffset?: number;
      charLength?: number;
      snippet?: {
        text?: string;
      };
    };
  };
}

interface SarifRule {
  id: string;
  name?: string;
  helpUri?: string;
  shortDescription?: {
    text?: string;
  };
  fullDescription?: {
    text?: string;
  };
}

interface SarifResult {
  ruleId: string;
  message: {
    text: string;
  };
  kind?: string;
  level?: string;
  guid?: string;
  ruleIndex?: number;
  locations?: SarifLocation[];
  rule?: SarifRule;
}

interface SarifRun {
  results?: SarifResult[];
  tool?: {
    driver?: {
      rules?: SarifRule[];
    };
  };
}

interface SarifLog {
  runs: SarifRun[];
}

export interface ParsedSarifResult {
  ruleId: string;
  message: string;
  kind?: string;
  level?: string;
  guid?: string;
  ruleIndex?: number;
  helpUri?: string;
  location?: {
    logicalPath?: string;
    uri?: string;
    startLine?: number;
    startColumn?: number;
    endLine?: number;
    endColumn?: number;
    charOffset?: number;
    charLength?: number;
    snippet?: string;
  };
  ruleDescription?: string;
}

export function parseSarif(sarifJson: SarifLog): ParsedSarifResult[] {
  try {
    const run = sarifJson.runs[0];
    if (!run || !run.results) {
      return [];
    }

    // Create a map of rules for quick lookup
    const rulesMap = new Map<string, SarifRule>();
    if (run.tool?.driver?.rules) {
      run.tool.driver.rules.forEach(rule => {
        rulesMap.set(rule.id, rule);
      });
    }

    return run.results.map(result => {
      // Get rule information either from the result or from the rules collection
      const rule = result.rule || rulesMap.get(result.ruleId);
      
      // Extract location information if available
      const location = result.locations?.[0]?.physicalLocation;
      
      return {
        ruleId: result.ruleId,
        message: result.message.text,
        kind: result.kind,
        level: result.level,
        guid: result.guid,
        ruleIndex: result.ruleIndex,
        helpUri: rule?.helpUri,
        location: location ? {
          logicalPath: result.locations?.[0]?.logicalLocation?.decoratedName,
          uri: location.artifactLocation?.uri,
          startLine: location.region?.startLine,
          startColumn: location.region?.startColumn,
          endLine: location.region?.endLine,
          endColumn: location.region?.endColumn,
          charOffset: location.region?.charOffset,
          charLength: location.region?.charLength,
          snippet: location.region?.snippet?.text
        } : undefined,
        ruleDescription: rule?.fullDescription?.text || rule?.shortDescription?.text
      };
    });
  } catch (error) {
    console.error('SARIF parsing error:', error);
    return [{
      ruleId: 'parse-error',
      message: 'Unable to parse validation results'
    }];
  }
}

export async function checkValidationService(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch('/api/validate', {
        method: 'HEAD',
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn('Validation service check timed out');
      }
      throw error;
    }
  } catch (error) {
    console.warn('Validation service not available:', error);
    return false;
  }
}

export async function validateDocument(document: OscalPackage): Promise<ParsedSarifResult[]> {
  try {
    const response = await fetch('/api/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(document)
    });
    
    if (!response.ok) {
      throw new Error(`Validation service returned ${response.status}`);
    }
    
    const sarifData = await response.json() as SarifLog;
    return parseSarif(sarifData);
  } catch (error) {
    console.error('Document validation failed:', error);
    return [{
      ruleId: 'service-error',
      message: 'Validation service is currently unavailable'
    }];
  }
}
