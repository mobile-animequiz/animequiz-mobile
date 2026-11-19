import { t } from '../i18n/runtime';
const configuredVersion = process.env.EXPO_PUBLIC_API_VERSION;
let selectedVersion = configuredVersion === '2' ? '2' : '1';

export function getSelectedApiVersion() { return selectedVersion; }

export function setSelectedApiVersion(version) {
  if (version !== '1' && version !== '2') throw new Error(t("Selecione a API V1 ou V2."));
  selectedVersion = version;
}
