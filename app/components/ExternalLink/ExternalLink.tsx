import { Icon, InlineStack, Link } from "@shopify/polaris";
import { ExternalSmallIcon } from "@shopify/polaris-icons";

interface ExternalLinkProps {
  url: string;
  text: string;
}

export default function ExternalLink({ url, text }: ExternalLinkProps) {
  return (
    <InlineStack blockAlign="center">
      <Link url={url} target="_blank">{text}</Link>
      <div><Icon source={ExternalSmallIcon} tone="info"/></div>
    </InlineStack>
  );
}
