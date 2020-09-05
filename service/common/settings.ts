export class SettingsError extends Error {}

export class MissingSettingError extends SettingsError {
  constructor(settingName: string) {
    super(`Missing configuration setting: ${settingName}.
    Verify that your .env file at cwd is properly configured.`);
  }
}

export function getEnvSettingOrThrow(name: string): string {
  const value = process.env[name];

  if (!value) throw new MissingSettingError(name);
  return value;
}

export function getEnvSettingOrDefault(
  name: string,
  defaultValue: string
): string {
  return process.env[name] || defaultValue;
}
