import fs from 'node:fs';
import yaml from 'js-yaml';

const substituteEnvVars = (obj: unknown): unknown => {
  if (typeof obj === 'string') {
    // Match $VAR_NAME or ${VAR_NAME} patterns
    return obj.replace(/\$\{?([A-Z_][A-Z0-9_]*)\}?/g, (match, varName) => {
      return process.env[varName] || '';
    });
  }
  if (Array.isArray(obj)) {
    return obj.map(substituteEnvVars);
  }
  if (obj !== null && typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = substituteEnvVars(value);
    }
    return result;
  }
  return obj;
};

const loadConfig = async (configPathOrData: string | object) => {
  if (typeof configPathOrData === 'string') {
    const content = fs.readFileSync(configPathOrData, 'utf8');
    if (configPathOrData.endsWith('.yaml') || configPathOrData.endsWith('.yml')) {
      const parsed = yaml.load(content);
      return substituteEnvVars(parsed);
    }
    return content;
  }

  return substituteEnvVars(configPathOrData);
};

export default loadConfig;
