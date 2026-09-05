import styles from "./toolkit-landing.module.css";

const packages = [
  {
    name: "@strk20-workbench/lab-core",
    status: "Workspace ready",
  },
  {
    name: "@strk20-workbench/wallet",
    status: "Extracting next",
  },
  {
    name: "@strk20-workbench/react",
    status: "Workspace ready",
  },
  {
    name: "create-strk20-workbench",
    status: "Planned",
  },
] as const;

export function ToolkitArchitecture() {
  return (
    <div className={styles.architectureFrame}>
      <div className={styles.windowBar}>
        <span aria-hidden="true" className={styles.windowDots} />
        <span>strk20-workbench-architecture.ts</span>
        <span>Sandbox</span>
      </div>

      <div className={styles.architectureBody}>
        <pre className={styles.architectureCode} aria-label="Toolkit layers">
          <code>
            <span className={styles.codeMuted}>01</span>
            {"  "}
            <span className={styles.codeKeyword}>const</span> toolkit = {"{"}
            {"\n"}
            <span className={styles.codeMuted}>02</span>
            {"    "}core:{" "}
            <span className={styles.codeString}>&quot;lab-core&quot;</span>,
            {"\n"}
            <span className={styles.codeMuted}>03</span>
            {"    "}wallet:{" "}
            <span className={styles.codeString}>&quot;Wallet API&quot;</span>,
            {"\n"}
            <span className={styles.codeMuted}>04</span>
            {"    "}ui:{" "}
            <span className={styles.codeString}>&quot;React&quot;</span>,{"\n"}
            <span className={styles.codeMuted}>05</span>
            {"  "}
            {"}"};{"\n"}
            <span className={styles.codeMuted}>06</span>
            {"\n"}
            <span className={styles.codeMuted}>07</span>
            {"  "}
            <span className={styles.codeKeyword}>const</span> flows = [{"\n"}
            <span className={styles.codeMuted}>08</span>
            {"    "}
            <span className={styles.codeString}>&quot;shield&quot;</span>,{"\n"}
            <span className={styles.codeMuted}>09</span>
            {"    "}
            <span className={styles.codeString}>
              &quot;private-transfer&quot;
            </span>
            ,{"\n"}
            <span className={styles.codeMuted}>10</span>
            {"    "}
            <span className={styles.codeString}>&quot;withdraw&quot;</span>,
            {"\n"}
            <span className={styles.codeMuted}>11</span>
            {"  "}];
          </code>
        </pre>

        <div
          className={styles.stackDiagram}
          aria-label="Workbench architecture"
        >
          <div className={styles.stackLayer}>
            <span>01</span>
            <strong>Core</strong>
            <small>State + privacy facts</small>
          </div>
          <div className={styles.stackConnector} aria-hidden="true" />
          <div className={styles.stackLayer}>
            <span>02</span>
            <strong>Wallet API</strong>
            <small>Capability + execution</small>
          </div>
          <div className={styles.stackConnector} aria-hidden="true" />
          <div className={styles.stackLayer}>
            <span>03</span>
            <strong>React</strong>
            <small>Drop-in experiences</small>
          </div>
          <div
            className={styles.actionNodes}
            aria-label="Supported action components"
          >
            <span>Shield</span>
            <span>Send privately</span>
            <span>Withdraw</span>
          </div>
        </div>
      </div>

      <div className={styles.architectureStatus}>
        <span>
          <i aria-hidden="true" /> Sandbox available
        </span>
        <span>
          <i aria-hidden="true" /> Mainnet path via wallet
        </span>
      </div>
    </div>
  );
}

export function PackageRail() {
  return (
    <ul className={styles.packageRail} aria-label="Toolkit package status">
      {packages.map((item) => (
        <li key={item.name}>
          <code>{item.name}</code>
          <span>{item.status}</span>
        </li>
      ))}
    </ul>
  );
}
