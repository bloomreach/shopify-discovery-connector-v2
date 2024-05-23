import styles from "./HtmlBlock.module.css";

interface HtmlBlockProps {
  content: string;
}

export default function HtmlBlock({ content }: HtmlBlockProps) {
  console.log("log: HtmlBlock: render");
  console.log("log: HtmlBlock: content: ", content);
  return (
    <div
      className={styles.HtmlBlock}
      dangerouslySetInnerHTML={{
        __html: content,
      }}
    />
  );
}
