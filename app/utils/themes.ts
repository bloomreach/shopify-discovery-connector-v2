export function generateDeeplinkingUrl(isEmbed: boolean, shopUrl: string, extensionId: string, blockHandle: string, themeId?: string | null, template?: string, target?: string): string {
  const templateParam = template ? `&template=${template}` : '';
  const targetParam = target ? `&target=${target}` : '';
  return isEmbed ?
    `https://${shopUrl}/admin/themes/${themeId || "current"}/editor?context=apps${templateParam}&activateAppId=${extensionId}/${blockHandle}`:
    `https://${shopUrl}/admin/themes/${themeId || "current"}/editor?addAppBlockId=${extensionId}/${blockHandle}${templateParam}${targetParam}`;
}
