const ConsoleLogger = (...args: any[]) => {
  if (process.env.NODE_ENV === "production") return;
  console.log(...args);
};

export default ConsoleLogger;
