export type MotionPreference = "system" | "full" | "reduced";

// Sin dependencias externas: la misma función se usa antes de pintar y en React.
export function resolveMotionPreference(saved: unknown, systemReduced: boolean): { preference: MotionPreference; reduced: boolean } {
  let preference: MotionPreference = "system";
  if (saved && typeof saved === "object" && !Array.isArray(saved)) {
    const value = saved as Record<string, unknown>;
    if (value.motion === "system" || value.motion === "full" || value.motion === "reduced") preference = value.motion;
    else if (value.reduced === true) preference = "reduced";
  }
  return { preference, reduced: preference === "reduced" || (preference === "system" && systemReduced) };
}

// Solo código propio y preferencias validadas; no inserta texto de usuarios en HTML.
export const appearanceScript = `try{var p=JSON.parse(localStorage.getItem('itsm.preferences')||'{}')||{};var d=p.theme==='dark'||((!p.theme||p.theme==='system')&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=d?'dark':'light';var m=(${resolveMotionPreference.toString()})(p,matchMedia('(prefers-reduced-motion: reduce)').matches);document.documentElement.dataset.motion=m.reduced?'reduced':'full'}catch(e){document.documentElement.dataset.motion=matchMedia('(prefers-reduced-motion: reduce)').matches?'reduced':'full'}`;
