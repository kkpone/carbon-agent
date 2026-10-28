import I18N from '@src/lang/I18N';
import type messages from '@src/lang/zh-CN/agentTeam';

/** Resolve at render time so changing language also updates team copy. */
export const teamText = (
  key: keyof typeof messages,
  values?: Record<string, unknown>,
): string => {
  const text = I18N.agentTeam[key];
  return values
    ? I18N.template(
        text,
        Object.fromEntries(
          Object.entries(values).map(([name, value]) => [name, String(value)]),
        ),
      )
    : text;
};
