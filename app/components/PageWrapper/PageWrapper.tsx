import styles from "./PageWrapper.module.css";

export default function PageWrapper({ children }: React.PropsWithChildren) {
  console.log("log: PageWrapper: render");
  return <div className={styles.container}>{children}</div>;
}
