import { Button } from "@shopify/polaris";

import type { ButtonProps } from "@shopify/polaris";

interface ExternalLinkProps {
  url: string;
  text: string;
  variant?: ButtonProps["variant"];
}

export default function ExternalLink({ url, text, variant }: ExternalLinkProps) {
  return (
    <Button variant={variant ?? "plain"} url={url} target="_blank">{text}</Button>
  );
}
