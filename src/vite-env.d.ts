/// <reference types="vite/client" />

// JSON modules
declare module "*.json" {
    const value: any;
    export default value;
}
