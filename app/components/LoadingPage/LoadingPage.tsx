import {
  SkeletonPage,
  Layout,
  Card,
  SkeletonBodyText,
  SkeletonDisplayText,
  BlockStack,
  Box,
  Bleed,
} from "@shopify/polaris";
import { ConsoleLogger } from "../ConsoleLogger";

export default function LoadingPage() {
  ConsoleLogger("log: LoadingPage: render");
  return (
    <SkeletonPage primaryAction>
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            <Card>
              <SkeletonBodyText />
            </Card>
            <Card>
              <BlockStack gap="400">
                <SkeletonDisplayText size="small" />
                <SkeletonBodyText />
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap="400">
                <SkeletonDisplayText size="small" />
                <SkeletonBodyText />
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
        <Layout.Section variant="oneThird">
          <BlockStack gap="400">
            <Card>
              <BlockStack gap="400">
                <SkeletonDisplayText size="small" />
                <SkeletonBodyText lines={2} />
                <SkeletonBodyText lines={1} />
              </BlockStack>
            </Card>
            <Card>
              <Bleed marginBlock="400" marginInline="400">
                <Box background="bg-surface-secondary" padding="400">
                  <BlockStack gap="400">
                    <SkeletonDisplayText size="small" />
                    <SkeletonBodyText lines={2} />
                    <SkeletonBodyText lines={2} />
                  </BlockStack>
                </Box>
              </Bleed>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </SkeletonPage>
  );
}
