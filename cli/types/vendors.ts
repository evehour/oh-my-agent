export type VendorType = "claude" | "codex" | "cursor" | "gemini" | "qwen";

/** All CLI tools including non-hook vendors. */
export type CliVendor = VendorType | "copilot";

/** CLI tools that support skill symlinking. */
export type CliTool = "claude" | "copilot";

export interface CLICheck {
  name: string;
  installed: boolean;
  version?: string;
  installCmd: string;
}
