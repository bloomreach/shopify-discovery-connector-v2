declare module "*.css";

interface ActionResponse {
  status: "success" | "fail";
  data?: any;
  error?: any;
}
