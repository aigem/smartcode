import { json, ActionFunction } from "@remix-run/node";
import { requireApiKey } from "~/utils/auth";
import { logCommand } from "~/utils/audit";
import { exec } from "child_process";
import { promisify } from "util";
import { commands, Command, getCommands } from "~/config/commands";
import { transformCommand } from '~/utils/commandTransformer';

const execAsync = promisify(exec);

// 如果你需要最新的命令列表，可以使用 getCommands() 函数
const latestCommands = getCommands();

export const action: ActionFunction = async ({ request }: { request: Request }) => {
  // 验证 API 密钥
  await requireApiKey(request);

  const body = await request.json();
  const { commandName, params } = body;

  const command = commands.find((cmd: Command) => cmd.name === commandName);

  if (!command) {
    return json({ error: "命令未找到" }, { status: 400 });
  }

  let finalCommand = transformCommand(command);

  if (command.params) {
    command.params.forEach((param) => {
      finalCommand = finalCommand.replace(`{{${param.name}}}`, params[param.name]);
    });
  }

  try {
    const { stdout, stderr } = await execAsync(finalCommand, { encoding: 'utf8' });
    await logCommand("API", finalCommand, stdout);
    return json({ output: stdout, error: stderr });
  } catch (error: unknown) {
    if (error instanceof Error) {
      await logCommand("API", finalCommand, `错误: ${error.message}`);
      return json({ error: error.message }, { status: 500 });
    }
    return json({ error: "发生未知错误" }, { status: 500 });
  }
};
