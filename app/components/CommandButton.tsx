import { Form, useSubmit, useNavigation, useFetcher } from "@remix-run/react";
import { Command } from "~/config/commands";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDownIcon, ChevronUpIcon, TrashIcon } from "@heroicons/react/24/outline";
import * as Icons from "@heroicons/react/24/outline";

interface CommandProps {
  command: Command;
  onDelete: () => void;
}

export default function CommandButton({ command, onDelete }: CommandProps) {
  const [showParams, setShowParams] = useState(false);
  const submit = useSubmit();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const fetcher = useFetcher();

  useEffect(() => {
    if (navigation.state === "submitting") {
      setIsLoading(true);
    } else if (navigation.state === "idle") {
      setIsLoading(false);
    }
  }, [navigation.state]);

  const handleDelete = (event: React.FormEvent<HTMLFormElement>) => {
    if (!confirm(`确定要删除命令 "${command.name}" 吗？`)) {
      event.preventDefault();
    } else {
      fetcher.submit(event.currentTarget, {
        method: "post",
        action: "/?index",
      });
    }
  };

  useEffect(() => {
    if (fetcher.data?.success) {
      onDelete();
    }
  }, [fetcher.data, onDelete]);

  const handleExecute = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit(event.currentTarget);
  };

  const IconComponent = Icons[command.icon as keyof typeof Icons];

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 relative"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="p-6">
        <fetcher.Form method="post" className="absolute top-2 right-2" onSubmit={handleDelete}>
          <input type="hidden" name="intent" value="delete" />
          <input type="hidden" name="commandName" value={command.name} />
          <motion.button
            type="submit"
            className="p-2 text-red-600 hover:text-red-800 transition-colors duration-200"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <TrashIcon className="h-5 w-5" />
          </motion.button>
        </fetcher.Form>

        <Form method="post" onSubmit={handleExecute}>
          <input type="hidden" name="intent" value="execute" />
          <input type="hidden" name="commandName" value={command.name} />
          <div className="flex items-center mb-4">
            <span className="text-4xl mr-3" role="img" aria-label={command.name}>
              {command.emoji}
            </span>
            {IconComponent && <IconComponent className="w-6 h-6 mr-2" />}
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">{command.name}</h3>
          </div>
          {command.params && (
            <motion.button
              type="button"
              onClick={() => setShowParams(!showParams)}
              className="mb-4 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors duration-200 flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {showParams ? "隐藏参数" : "显示参数"}
              {showParams ? (
                <ChevronUpIcon className="w-5 h-5 ml-1" />
              ) : (
                <ChevronDownIcon className="w-5 h-5 ml-1" />
              )}
            </motion.button>
          )}
          <AnimatePresence>
            {showParams && command.params?.map((param) => (
              <motion.div
                key={param.name}
                className="mb-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <label htmlFor={param.name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {param.name}
                </label>
                <input
                  type={param.type === "number" ? "number" : "text"}
                  name={param.name}
                  id={param.name}
                  required={param.required}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                />
              </motion.div>
            ))}
          </AnimatePresence>
          <div className="mt-4">
            <motion.button
              type="submit"
              className={`w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isLoading ? "执行中..." : "执行"}
            </motion.button>
          </div>
        </Form>
      </div>
    </motion.div>
  );
}
