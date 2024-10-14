import { useState } from "react";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { json, ActionFunction } from "@remix-run/node";
import { requireUserId } from "~/utils/auth";
import { getCommands, Command } from "~/config/commands";
import fs from "fs/promises";
import path from "path";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, Type, Hash, Smile, Image } from "lucide-react";

export const action: ActionFunction = async ({ request }) => {
  await requireUserId(request);
  const formData = await request.formData();
  const name = formData.get("name") as string;
  const command = formData.get("command") as string;
  const icon = formData.get("icon") as string;
  const emoji = formData.get("emoji") as string;
  const paramName = formData.get("paramName") as string;
  const paramType = formData.get("paramType") as string;
  const paramRequired = formData.get("paramRequired") === "on";

  const newCommand: Command = {
    name,
    command,
    icon,
    emoji,
    params: paramName ? [{
      name: paramName,
      type: paramType,
      required: paramRequired,
    }] : undefined,
  };

  try {
    const filePath = path.join(process.cwd(), "app", "config", "commands.ts");
    let fileContent = await fs.readFile(filePath, "utf-8");
    
    // 获取现有的命令
    const existingCommands = getCommands();
    
    // 添加新命令
    existingCommands.push(newCommand);
    
    // 更新文件内容
    const updatedContent = fileContent.replace(
      /export function getCommands\(\): Command\[] {[\s\S]*?return \[([\s\S]*?)\];[\s\S]*?}/,
      (match, commandsContent) => {
        return `export function getCommands(): Command[] {
  return ${JSON.stringify(existingCommands, null, 2)};
}`;
      }
    );
    
    await fs.writeFile(filePath, updatedContent);
    return json({ success: true });
  } catch (error) {
    console.error("添加命令失败:", error);
    return json({ error: "添加命令失败" }, { status: 500 });
  }
};

export default function AddCommand() {
  const [showParamFields, setShowParamFields] = useState(false);
  const actionData = useActionData<{ success?: boolean; error?: string }>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden md:max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">添加新命令</h2>
          <Form method="post">
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">命令名称</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Type className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input type="text" id="name" name="name" required className="pl-10 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white" />
              </div>
            </div>
            <div className="mb-4">
              <label htmlFor="command" className="block text-sm font-medium text-gray-700 dark:text-gray-300">命令内容</label> 
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Hash className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input type="text" id="command" name="command" required className="pl-10 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white" 
                placeholder="参数格式: &#123;&#123;参数名&#125;&#125;" />
              </div>
            </div>
            <div className="mb-4">
              <label htmlFor="emoji" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Emoji 🚀
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Smile className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  name="emoji"
                  id="emoji"
                  required
                  className="pl-10 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                  placeholder="例如: 🚀"
                />
              </div>
            </div>
            <div className="mb-4">
              <label htmlFor="icon" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                 图标 (e.g. FolderIcon)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Image className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  name="icon"
                  id="icon"
                  required
                  className="pl-10 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                  placeholder="例如: FolderIcon"
                />
              </div>
            </div>
            <div>
              <label className="flex items-center">
                <input type="checkbox" onChange={(e) => setShowParamFields(e.target.checked)} className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">添加参数</span>
              </label>
            </div>
            <AnimatePresence>
              {showParamFields && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="paramName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">参数名称</label>
                      <input type="text" id="paramName" name="paramName" className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white" />
                    </div>
                    <div>
                      <label htmlFor="paramType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">参数类型</label>
                      <select id="paramType" name="paramType" className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white">
                        <option value="string">字符串</option>
                        <option value="number">数字</option>
                      </select>
                    </div>
                    <div>
                      <label className="flex items-center">
                        <input type="checkbox" name="paramRequired" className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">必填参数</span>
                      </label>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div>
              <motion.button
                type="submit"
                className={`w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                disabled={isSubmitting}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                {isSubmitting ? "添加中..." : "添加命令"}
              </motion.button>
            </div>
          </Form>
          {actionData?.success && (
            <motion.p
              className="mt-2 text-center text-sm text-green-600 dark:text-green-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              命令添加成功！
            </motion.p>
          )}
          {actionData?.error && (
            <motion.p
              className="mt-2 text-center text-sm text-red-600 dark:text-red-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {actionData.error}
            </motion.p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
