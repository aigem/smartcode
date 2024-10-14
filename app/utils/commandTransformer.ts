import { platform } from 'os';
import { Command } from '~/config/commands';

export function transformCommand(command: Command): string {
  const isWindows = platform() === 'win32';
  
  switch (command.name) {
    case "查看当前路径":
      return isWindows ? 'echo %cd%' : 'pwd';
    
    case "列出文件":
      return isWindows ? 'dir' : 'ls -la';
    
    case "创建目录":
      return isWindows ? 'mkdir {{dirName}}' : 'mkdir -p {{dirName}}';
    
    case "删除文件":
      return isWindows ? 'del {{fileName}}' : 'rm {{fileName}}';
    
    case "复制文件":
      return isWindows ? 'copy {{source}} {{destination}}' : 'cp {{source}} {{destination}}';
    
    case "移动文件":
      return isWindows ? 'move {{source}} {{destination}}' : 'mv {{source}} {{destination}}';
    
    case "查看系统信息":
      return isWindows ? 'systeminfo' : 'uname -a && lsb_release -a';
    
    case "查看磁盘空间":
      return isWindows ? 'wmic logicaldisk get size,freespace,caption' : 'df -h';
    
    case "查看进程":
      return isWindows ? 'tasklist' : 'ps aux';
    
    case "结束进程":
      return isWindows ? 'taskkill /F /IM {{processName}}' : 'pkill {{processName}}';
    
    case "查看网络连接":
      return isWindows ? 'netstat -ano' : 'netstat -tuln';
    
    case "ping":
      return `ping ${isWindows ? '-n 4' : '-c 4'} {{host}}`;
    
    case "查看IP地址":
      return isWindows ? 'ipconfig' : 'ip addr show';
    
    case "重启服务":
      return isWindows ? 'net stop {{serviceName}} && net start {{serviceName}}' : 'systemctl restart {{serviceName}}';
    
    case "查看日志":
      return isWindows ? 'type {{logFile}}' : 'cat {{logFile}}';
    
    case "压缩文件":
      return isWindows ? 'powershell Compress-Archive -Path {{source}} -DestinationPath {{destination}}' : 'tar -czvf {{destination}} {{source}}';
    
    case "解压文件":
      return isWindows ? 'powershell Expand-Archive -Path {{source}} -DestinationPath {{destination}}' : 'tar -xzvf {{source}} -C {{destination}}';
    
    case "查找文件":
      return isWindows ? 'dir /s /b {{fileName}}' : 'find . -name {{fileName}}';
    
    case "查看文件内容":
      return isWindows ? 'type {{fileName}}' : 'cat {{fileName}}';
    
    case "编辑文件":
      return isWindows ? 'notepad {{fileName}}' : 'nano {{fileName}}';
    
    case "重启系统":
      return isWindows ? 'shutdown /r /t 0' : 'sudo reboot';
    
    // 默认情况下返回原始命令
    default:
      return command.command;
  }
}
