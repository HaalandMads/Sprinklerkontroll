import { Alert, AlertButton } from 'react-native';
import Constants from 'expo-constants';

let done = false;

/** Oppsett for web-versjonen: dialoger og tjenestearbeider for bruk uten nett. */
export function setupWeb() {
  if (done) return;
  done = true;

  // Alert.alert gjør ingenting i nettleseren. Bruk nettleserens egne dialoger i stedet.
  (Alert as unknown as { alert: typeof Alert.alert }).alert = (title: string, message?: string, buttons?: AlertButton[]) => {
    const text = [title, message].filter(Boolean).join('\n\n');
    if (!buttons || buttons.length <= 1) {
      window.alert(text);
      buttons?.[0]?.onPress?.();
      return;
    }
    const cancel = buttons.find((b) => b.style === 'cancel');
    const action = [...buttons].reverse().find((b) => b !== cancel) ?? buttons[buttons.length - 1];
    if (window.confirm(`${text}\n\nOK = ${action.text ?? 'OK'}`)) action.onPress?.();
    else cancel?.onPress?.();
  };

  const base = ((Constants.expoConfig?.experiments as { baseUrl?: string } | undefined)?.baseUrl ?? '').replace(/\/$/, '');
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register(`${base}/sw.js`, { scope: `${base}/` }).catch(() => undefined);
  }
}
