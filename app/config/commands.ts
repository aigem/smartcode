export interface Command {
  name: string;
  command: string;
  icon: string;
  emoji: string;
  params?: Array<{
    name: string;
    type: string;
    required: boolean;
  }>;
}

export function getCommands(): Command[] {
  return [
  {
    "name": "备份脚本",
    "command": "backupScript.bat --folder {{folderName}}",
    "icon": "SaveIcon",
    "emoji": "💾",
    "params": [
      {
        "name": "folderName",
        "type": "string",
        "required": true
      }
    ]
  },
  {
    "name": "say打招呼",
    "command": "echo {{name}}",
    "icon": "none",
    "emoji": "🗂️🗂️",
    "params": [
      {
        "name": "name",
        "type": "string",
        "required": false
      }
    ]
  }
];
}

// 导出 commands 变量
export const commands = getCommands();
