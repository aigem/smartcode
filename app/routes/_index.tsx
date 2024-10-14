import { json, LoaderFunction, ActionFunction } from "@remix-run/node";
import { useLoaderData, useActionData, useNavigation, Form } from "@remix-run/react";
import { requireUserId } from "~/utils/auth";
import { logCommand } from "~/utils/audit";
import CommandButton from "~/components/CommandButton";
import { exec } from "child_process";
import { promisify } from "util";
import { getCommands, Command } from "~/config/commands";
import { platform } from 'os';
import { transformCommand } from '~/utils/commandTransformer';
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import path from 'path';
import fs from 'fs/promises';
import iconv from 'iconv-lite';
import { useState, useEffect } from "react";

const execAsync = promisify(exec);

export const loader: LoaderFunction = async ({ request }: { request: Request }) => {
  await requireUserId(request);
  return json({ commands: getCommands() });
};

export const action: ActionFunction = async ({ request }: { request: Request }) => {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete") {
    const commandName = formData.get("commandName") as string;
    try {
      const filePath = path.join(process.cwd(), "app", "config", "commands.ts");
      let fileContent = await fs.readFile(filePath, "utf-8");
      
      const commands = getCommands();
      const updatedCommands = commands.filter(cmd => cmd.name !== commandName);
      
      const updatedContent = fileContent.replace(
        /return \[[\s\S]*?\];/,
        `return ${JSON.stringify(updatedCommands, null, 2)};`
      );
      
      await fs.writeFile(filePath, updatedContent);
      await logCommand(userId, `删除命令: ${commandName}`, "成功");
      
      return json({ success: true, commands: updatedCommands });
    } catch (error) {
      await logCommand(userId, `删除命令: ${commandName}`, `失败: ${error}`);
      return json({ error: `删除命令失败: ${error}` }, { status: 500 });
    }
  }

  const commandName = formData.get("commandName") as string;
  const commands = getCommands();
  const command = commands.find((cmd: Command) => cmd.name === commandName);

  if (!command) {
    return json({ error: "命令未找到" }, { status: 400 });
  }

  let finalCommand = transformCommand(command);

  if (command.params) {
    command.params.forEach((param) => {
      const value = formData.get(param.name);
      finalCommand = finalCommand.replace(`{{${param.name}}}`, value as string);
    });
  }

  try {
    const { stdout, stderr } = await execAsync(finalCommand, { encoding: 'buffer' });
    const decodedStdout = iconv.decode(stdout, 'GBK').trim();
    const decodedStderr = iconv.decode(stderr, 'GBK').trim();
    await logCommand(userId, finalCommand, decodedStdout || decodedStderr);
    return json({ output: decodedStdout, error: decodedStderr });
  } catch (error: unknown) {
    if (error instanceof Error) {
      const decodedError = iconv.decode(Buffer.from(error.message), 'GBK').trim();
      await logCommand(userId, finalCommand, `错误: ${decodedError}`);
      return json({ error: decodedError }, { status: 500 });
    }
    return json({ error: "发生未知错误" }, { status: 500 });
  }
};

export default function Index() {
  const { commands: initialCommands } = useLoaderData<{ commands: Command[] }>();
  const [commands, setCommands] = useState(initialCommands);
  const actionData = useActionData<{ output?: string; error?: string; success?: boolean }>();
  const navigation = useNavigation();

  const handleDelete = () => {
    setCommands(getCommands());
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400">
          智code助手
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          简化您的工作流程，提高效率
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8"
      >
        <div className="relative max-w-md mx-auto">
          <input
            type="text"
            placeholder="搜索命令..."
            className="w-full px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <AnimatePresence>
          {commands.map((command: Command, index) => (
            <motion.div
              key={command.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <CommandButton command={command} onDelete={handleDelete} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {actionData?.output && (
          <motion.div
            className="mt-12 p-6 bg-green-100 dark:bg-green-900 rounded-lg shadow-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl font-bold mb-4 text-green-800 dark:text-green-200">输出结果</h2>
            <pre className="whitespace-pre-wrap text-sm text-green-700 dark:text-green-300 bg-white dark:bg-gray-800 p-4 rounded overflow-x-auto max-h-60 overflow-y-auto">{actionData.output}</pre>
          </motion.div>
        )}

        {actionData?.error && (
          <motion.div
            className="mt-12 p-6 bg-red-100 dark:bg-red-900 rounded-lg shadow-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl font-bold mb-4 text-red-800 dark:text-red-200">错误</h2>
            <pre className="whitespace-pre-wrap text-sm text-red-700 dark:text-red-300 bg-white dark:bg-gray-800 p-4 rounded overflow-x-auto max-h-60 overflow-y-auto">
              {typeof actionData.error === 'string' ? actionData.error : JSON.stringify(actionData.error, null, 2)}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}