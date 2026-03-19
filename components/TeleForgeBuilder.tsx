'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Bot, Shield, Terminal, Zap, FileCode, Settings, User, Download, RefreshCw, Send, Paperclip, Check, X, MessageSquare, Files, Github } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export default function TeleForgeBuilder() {
  const [activeTab, setActiveTab] = useState('auth');
  const [isAddingCommand, setIsAddingCommand] = useState(false);
  const [newCmd, setNewCmd] = useState({ name: '', cmd: '', out: '' });
  const [config, setConfig] = useState({
    token: '*******',
    adminId: '123456789',
    botName: 'RemoteAdmin',
    botUsername: '@remote_admin_bot',
    botBio: 'Secure shell access & file manager',
    botPicUrl: '',
    startPicUrl: '',
    connectionType: 'polling', // 'polling' or 'webhook'
    welcomeMsg: '👋 Bot started! Type /help to see available commands.',
    features: {
      fileUpload: true,
      longOutput: true,
      sudoMode: true,
      logging: true,
    },
    commands: [
      { name: 'status', cmd: 'uptime -p', out: 'up 2 hours, 14 minutes' },
      { name: 'disk', cmd: 'df -h /', out: 'Filesystem Size Used Avail Use%\n/dev/sda1 98G 45G 48G 49% /' },
    ]
  });
  const [chat, setChat] = useState([{ type: 'bot', text: '👋 Bot started! Type /help to see available commands.' }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const getBotCodeString = () => {
    let code = `#!/usr/bin/env python3
# _bot blueprint

import telebot
import os
import subprocess

API_TOKEN = "${config.token}"
ADMIN_ID = ${config.adminId}

bot = telebot.TeleBot(API_TOKEN)

@bot.message_handler(commands=['start'])
def send_welcome(message):
    if message.from_user.id != ADMIN_ID: return
`;

    if (config.startPicUrl) {
      code += `    bot.send_photo(message.chat.id, "${config.startPicUrl}", caption="""${config.welcomeMsg}""")\n\n`;
    } else {
      code += `    bot.reply_to(message, """${config.welcomeMsg}""")\n\n`;
    }

    if (config.features.fileUpload) {
      code += `@bot.message_handler(content_types=['document'])
def handle_docs(message):
    if message.from_user.id != ADMIN_ID: return
    file_info = bot.get_file(message.document.file_id)
    downloaded_file = bot.download_file(file_info.file_path)
    with open(message.document.file_name, 'wb') as new_file:
        new_file.write(downloaded_file)
    bot.reply_to(message, "✅ File saved successfully!")\n\n`;
    }

    config.commands.forEach(cmd => {
      code += `@bot.message_handler(commands=['${cmd.name}'])
def handle_${cmd.name}(message):
    if message.from_user.id != ADMIN_ID: return
    # Simulated command: ${cmd.cmd}
    bot.reply_to(message, """${cmd.out}""")\n\n`;
    });

    if (config.connectionType === 'webhook') {
      code += `
# Webhook Setup (Requires SSL & Public IP)
from flask import Flask, request
app = Flask(__name__)

@app.route('/' + API_TOKEN, methods=['POST'])
def getMessage():
    bot.process_new_updates([telebot.types.Update.de_json(request.stream.read().decode("utf-8"))])
    return "!", 200

@app.route("/")
def webhook():
    bot.remove_webhook()
    bot.set_webhook(url="https://YOUR_DOMAIN.com/" + API_TOKEN)
    return "!", 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get('PORT', 5000)))
`;
    } else {
      code += `bot.infinity_polling()`;
    }
    return code;
  };

  const handleExport = async () => {
    const zip = new JSZip();
    const botCode = getBotCodeString();
    const requirements = "pyTelegramBotAPI";
    
    const readme = `# ${config.botName} - Telegram Bot

Repo: https://github.com/sudo-self/bot_bluprint


## Prerequisites
- Python 3.8 or higher installed.
- Python: https://www.python.org/downloads/
## Setup & Launch

### macOS / Linux (Quick Start)
1. Open terminal in this folder.
2. Run the start script:
   \`\`\`bash
   chmod +x startbot.sh
   ./startbot.sh
   \`\`\`

### macOS / Linux (Manual)
1. Open terminal in this folder.
2. Create virtual environment:
   \`\`\`bash
   python3 -m venv venv
   \`\`\`
3. Activate environment:
   \`\`\`bash
   source venv/bin/activate
   \`\`\`
4. Install dependencies:
   \`\`\`bash
   pip install -r requirements.txt
   \`\`\`
5. Start the bot:
   \`\`\`bash
   python3 bot.py
   \`\`\`

### Windows
1. Open PowerShell or Command Prompt in this folder.
2. Create virtual environment:
   \`\`\`powershell
   python -m venv venv
   \`\`\`
3. Activate environment:
   \`\`\`powershell
   .\\venv\\Scripts\\activate
   \`\`\`
4. Install dependencies:
   \`\`\`powershell
   pip install -r requirements.txt
   \`\`\`
5. Start the bot:
   \`\`\`powershell
   python bot.py
   \`\`\`

## Commands
${config.commands.map(cmd => `- /${cmd.name}: ${cmd.cmd}`).join('\n')}
`;

    const startbot = `#!/bin/bash
# chmod +X startbot.sh
# ./startbot.sh

# virtual environment
python3 -m venv .

# Activate
source bin/activate

# dependencies
pip3 install -r requirements.txt

# Run the bot
python3 bot.py
`;

    zip.file("bot.py", botCode);
    zip.file("requirements.txt", requirements);
    zip.file("README.md", readme);
    zip.file("startbot.sh", startbot);
    
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `${config.botName.toLowerCase().replace(/\s+/g, '-')}-bot.zip`);
  };

  const generateBotCode = () => {
    return (
      <div className="font-mono text-[10px] leading-relaxed">
        <span className="token-comment">#!/usr/bin/env python3</span><br/>
        <span className="token-comment"># use the instructions in settings to launch the bot</span><br/><br/>
        <span className="token-keyword">import</span> telebot<br/>
        <span className="token-keyword">import</span> os<br/>
        <span className="token-keyword">import</span> subprocess<br/><br/>
        API_TOKEN = <span className="token-string">&quot;{config.token}&quot;</span><br/>
        ADMIN_ID = <span className="token-number">{config.adminId}</span><br/><br/>
        bot = telebot.TeleBot(API_TOKEN)<br/><br/>
        <span className="token-keyword">@bot.message_handler</span>(commands=[<span className="token-string">&apos;start&apos;</span>])<br/>
        <span className="token-keyword">def</span> <span className="token-function">send_welcome</span>(message):<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;<span className="token-keyword">if</span> message.from_user.id != ADMIN_ID: <span className="token-keyword">return</span><br/>
        {config.startPicUrl ? (
          <>
            &nbsp;&nbsp;&nbsp;&nbsp;bot.send_photo(message.chat.id, <span className="token-string">&quot;{config.startPicUrl}&quot;</span>, caption=<span className="token-string">&quot;&quot;&quot;{config.welcomeMsg}&quot;&quot;&quot;</span>)<br/><br/>
          </>
        ) : (
          <>
            &nbsp;&nbsp;&nbsp;&nbsp;bot.reply_to(message, <span className="token-string">&quot;&quot;&quot;{config.welcomeMsg}&quot;&quot;&quot;</span>)<br/><br/>
          </>
        )}
        {config.features.fileUpload && (
          <>
            <span className="token-keyword">@bot.message_handler</span>(content_types=[<span className="token-string">&apos;document&apos;</span>])<br/>
            <span className="token-keyword">def</span> <span className="token-function">handle_docs</span>(message):<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;<span className="token-keyword">if</span> message.from_user.id != ADMIN_ID: <span className="token-keyword">return</span><br/>
            &nbsp;&nbsp;&nbsp;&nbsp;file_info = bot.get_file(message.document.file_id)<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;downloaded_file = bot.download_file(file_info.file_path)<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;<span className="token-keyword">with</span> <span className="token-function">open</span>(message.document.file_name, <span className="token-string">&apos;wb&apos;</span>) <span className="token-keyword">as</span> new_file:<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;new_file.write(downloaded_file)<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;bot.reply_to(message, <span className="token-string">&quot;✅ File saved successfully!&quot;</span>)<br/><br/>
          </>
        )}
        {config.commands.map((cmd, i) => (
          <div key={i}>
            <span className="token-keyword">@bot.message_handler</span>(commands=[<span className="token-string">&apos;{cmd.name}&apos;</span>])<br/>
            <span className="token-keyword">def</span> <span className="token-function">handle_{cmd.name}</span>(message):<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;<span className="token-keyword">if</span> message.from_user.id != ADMIN_ID: <span className="token-keyword">return</span><br/>
            &nbsp;&nbsp;&nbsp;&nbsp;bot.reply_to(message, <span className="token-string">&quot;&quot;&quot;{cmd.out}&quot;&quot;&quot;</span>)<br/><br/>
          </div>
        ))}
        {config.connectionType === 'webhook' ? (
          <>
            <span className="token-comment"># Webhook setup (simplified)</span><br/>
            <span className="token-keyword">from</span> flask <span className="token-keyword">import</span> Flask, request<br/>
            app = Flask(__name__)<br/><br/>
            <span className="token-keyword">if</span> __name__ == <span className="token-string">&quot;__main__&quot;</span>:<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;app.run(host=<span className="token-string">&quot;0.0.0.0&quot;</span>, port=5000)
          </>
        ) : (
          <>bot.infinity_polling()</>
        )}
      </div>
    );
  };

  const handleSend = () => {
    if (!input) return;
    const userMsg = input.trim();
    setChat(prev => [...prev, { type: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      let response: any = "❓ Unknown command. Type /help";
      if (userMsg === '/start') {
        if (config.startPicUrl) {
          response = (
            <div className="space-y-2">
              <img src={config.startPicUrl} alt="Start" referrerPolicy="no-referrer" className="rounded-lg max-w-full h-auto border border-zinc-700" />
              <div className="whitespace-pre-wrap">{config.welcomeMsg}</div>
            </div>
          );
        } else {
          response = config.welcomeMsg;
        }
      }
      if (userMsg === '/help') response = `commands:\n${config.commands.map(c => `/${c.name}`).join('\n')}`;
      
      const cmd = config.commands.find(c => `/${c.name}` === userMsg);
      if (cmd) response = `⚡ Running: ${cmd.cmd}\n\n${cmd.out}`;

      setChat(prev => [...prev, { type: 'bot', text: response }]);
    }, 600);
  };

  const applyTemplate = (type: 'chatbot' | 'files') => {
    if (type === 'chatbot') {
      const welcome = 'Hello! I am your AI companion. How can I help you today?';
      setConfig({
        ...config,
        botName: 'AI Companion',
        botBio: 'Friendly AI assistant for your daily needs',
        welcomeMsg: welcome,
        features: { ...config.features, fileUpload: false },
        commands: [
          { name: 'joke', cmd: 'random_joke', out: 'Why did the programmer quit his job? Because he didn\'t get arrays.' },
          { name: 'quote', cmd: 'random_quote', out: 'The only way to do great work is to love what you do. - Steve Jobs' },
        ]
      });
      setChat([{ type: 'bot', text: welcome }]);
    } else {
      const welcome = 'File Warden active. Send any file to store it securely.';
      setConfig({
        ...config,
        botName: 'File Warden',
        botBio: 'Secure remote file management system',
        welcomeMsg: welcome,
        features: { ...config.features, fileUpload: true },
        commands: [
          { name: 'list', cmd: 'ls -lh ./storage', out: 'total 1.2M\n-rw-r--r-- 1 bot bot 450K Mar 18 10:00 report.pdf\n-rw-r--r-- 1 bot bot 750K Mar 18 10:05 image.png' },
          { name: 'space', cmd: 'du -sh ./storage', out: '1.2M    ./storage' },
        ]
      });
      setChat([{ type: 'bot', text: welcome }]);
    }
  };

  const renderPanelContent = () => {
    switch (activeTab) {
      case 'auth':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Bot Token</label>
              <input 
                type="text" 
                value={config.token} 
                onChange={(e) => setConfig({...config, token: e.target.value})} 
                placeholder="869.........."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm focus:border-indigo-500 outline-none transition-all" 
              />
              <p className="text-[10px] text-zinc-500 mt-2">Get this from <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">@BotFather</a> on Telegram.</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Admin User ID</label>
              <input 
                type="text" 
                value={config.adminId} 
                onChange={(e) => setConfig({...config, adminId: e.target.value})} 
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm focus:border-indigo-500 outline-none transition-all" 
              />
                 <p className="text-[10px] text-zinc-500 mt-2">Get this from <a href="https://t.me/userinfo3bot" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">@userinfo3bot</a> on Telegram.</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Welcome / Help Message</label>
              <textarea 
                value={config.welcomeMsg} 
                onChange={(e) => {
                  const val = e.target.value;
                  setConfig({...config, welcomeMsg: val});
                  if (chat.length === 1 && chat[0].type === 'bot') {
                    setChat([{ type: 'bot', text: val }]);
                  }
                }} 
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm focus:border-indigo-500 outline-none transition-all h-24 resize-none" 
              />
              <p className="text-[10px] text-zinc-500 mt-2">Most settings are configured with <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">@BotFather</a> on Telegram. This app creates a ready to deploy working bot. The download folder includes a startbot.sh to launch the bot instantly.</p>
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Display Name</label>
              <input 
                type="text" 
                value={config.botName} 
                onChange={(e) => setConfig({...config, botName: e.target.value})} 
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm focus:border-indigo-500 outline-none transition-all" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Username</label>
              <input 
                type="text" 
                value={config.botUsername} 
                onChange={(e) => setConfig({...config, botUsername: e.target.value})} 
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm focus:border-indigo-500 outline-none transition-all" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Bio</label>
              <textarea 
                value={config.botBio} 
                onChange={(e) => setConfig({...config, botBio: e.target.value})} 
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm focus:border-indigo-500 outline-none transition-all h-24 resize-none" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Bot Avatar URL</label>
              <input 
                type="text" 
                value={config.botPicUrl} 
                onChange={(e) => setConfig({...config, botPicUrl: e.target.value})} 
                placeholder="https://picsum.photos/seed/bot/200"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm focus:border-indigo-500 outline-none transition-all" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Start Message Image URL</label>
              <input 
                type="text" 
                value={config.startPicUrl} 
                onChange={(e) => setConfig({...config, startPicUrl: e.target.value})} 
                placeholder="https://picsum.photos/seed/start/800/400"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm focus:border-indigo-500 outline-none transition-all" 
              />
            </div>
          </div>
        );
      case 'features':
        return (
          <div className="space-y-4">
            <FeatureToggle 
              label="File Upload" 
              desc="Save documents locally" 
              active={config.features.fileUpload} 
              onToggle={() => setConfig({...config, features: {...config.features, fileUpload: !config.features.fileUpload}})} 
            />
            <FeatureToggle 
              label="Long Output" 
              desc="Send as .txt if too long" 
              active={config.features.longOutput} 
              onToggle={() => setConfig({...config, features: {...config.features, longOutput: !config.features.longOutput}})} 
            />
            <FeatureToggle 
              label="Sudo Mode" 
              desc="Allow sudo commands" 
              active={config.features.sudoMode} 
              onToggle={() => setConfig({...config, features: {...config.features, sudoMode: !config.features.sudoMode}})} 
            />
            <FeatureToggle 
              label="Logging" 
              desc="Log all commands" 
              active={config.features.logging} 
              onToggle={() => setConfig({...config, features: {...config.features, logging: !config.features.logging}})} 
            />
          </div>
        );
      case 'commands':
        return (
          <div className="space-y-4">
            {config.commands.map((cmd, i) => (
              <div key={i} className="p-3 border border-zinc-800 rounded-lg bg-zinc-950/50">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-indigo-400 font-mono text-xs">/{cmd.name}</span>
                  <button onClick={() => {
                    const newCmds = [...config.commands];
                    newCmds.splice(i, 1);
                    setConfig({...config, commands: newCmds});
                  }} className="text-zinc-600 hover:text-red-500 transition-colors"><X className="w-3 h-3" /></button>
                </div>
                <div className="text-[10px] text-zinc-500 truncate">{cmd.cmd}</div>
              </div>
            ))}
            
            {isAddingCommand ? (
              <div className="p-3 border border-indigo-500/50 rounded-lg bg-zinc-950/50 space-y-3">
                <div>
                  <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Name</label>
                  <input 
                    type="text" 
                    value={newCmd.name}
                    onChange={(e) => setNewCmd({...newCmd, name: e.target.value.replace(/\s/g, '')})}
                    placeholder="e.g. restart"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs mt-1 focus:outline-none focus:border-indigo-500 text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Shell Command</label>
                  <input 
                    type="text" 
                    value={newCmd.cmd}
                    onChange={(e) => setNewCmd({...newCmd, cmd: e.target.value})}
                    placeholder="e.g. sudo reboot"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs mt-1 focus:outline-none focus:border-indigo-500 text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Simulated Output</label>
                  <input 
                    type="text" 
                    value={newCmd.out}
                    onChange={(e) => setNewCmd({...newCmd, out: e.target.value})}
                    placeholder="e.g. System rebooting..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs mt-1 focus:outline-none focus:border-indigo-500 text-white"
                  />
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      if (newCmd.name && newCmd.cmd) {
                        setConfig({...config, commands: [...config.commands, newCmd]});
                        setNewCmd({ name: '', cmd: '', out: '' });
                        setIsAddingCommand(false);
                      }
                    }}
                    className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[10px] font-bold uppercase tracking-widest transition-all"
                  >
                    Save
                  </button>
                  <button 
                    onClick={() => {
                      setNewCmd({ name: '', cmd: '', out: '' });
                      setIsAddingCommand(false);
                    }}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded text-[10px] font-bold uppercase tracking-widest transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setIsAddingCommand(true)}
                className="w-full py-2 border border-dashed border-zinc-700 rounded-lg text-xs text-zinc-500 hover:border-zinc-500 hover:text-zinc-300 transition-all"
              >
                + Add Command
              </button>
            )}
          </div>
        );
      case 'advanced':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Package Contents</h3>
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center gap-3 p-2 bg-zinc-950 border border-zinc-800 rounded-lg">
                  <FileCode className="w-4 h-4 text-indigo-400" />
                  <div>
                    <div className="text-[11px] font-mono text-zinc-200">bot.py</div>
                    <div className="text-[9px] text-zinc-500">Main Python script</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 bg-zinc-950 border border-zinc-800 rounded-lg">
                  <Terminal className="w-4 h-4 text-zinc-500" />
                  <div>
                    <div className="text-[11px] font-mono text-zinc-200">requirements.txt</div>
                    <div className="text-[9px] text-zinc-500">Dependencies list</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 bg-zinc-950 border border-zinc-800 rounded-lg">
                  <FileCode className="w-4 h-4 text-zinc-500" />
                  <div>
                    <div className="text-[11px] font-mono text-zinc-200">README.md</div>
                    <div className="text-[9px] text-zinc-500">Setup instructions</div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Deployment Guide</h3>
              <div className="space-y-4">
                <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg">
                  <p className="text-[10px] text-zinc-400 mb-2 uppercase font-bold">1. Setup Environment</p>
                  <code className="text-[11px] text-indigo-400 block bg-black/30 p-2 rounded">
                    python -m venv venv<br/>
                    source venv/bin/activate
                  </code>
                </div>
                <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg">
                  <p className="text-[10px] text-zinc-400 mb-2 uppercase font-bold">2. Install Requirements</p>
                  <code className="text-[11px] text-indigo-400 block bg-black/30 p-2 rounded">
                    pip install -r requirements.txt
                  </code>
                </div>
                <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg">
                  <p className="text-[10px] text-zinc-400 mb-2 uppercase font-bold">3. Launch Bot</p>
                  <code className="text-[11px] text-indigo-400 block bg-black/30 p-2 rounded">
                    python bot.py
                  </code>
                </div>
              </div>
            </div>
            <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-lg">
              <p className="text-[10px] text-indigo-300 leading-relaxed">
                Make sure you have Python 3.8+ installed. On Windows, use <code className="text-indigo-400">venv\Scripts\activate</code> to activate the environment.
              </p>
            </div>
          </div>
        );
      default:
        return <div className="text-zinc-500 text-sm italic">Select a tab to begin...</div>;
    }
  };

  return (
    <div className="flex h-screen w-full bg-zinc-950 text-zinc-100 overflow-hidden font-sans selection:bg-indigo-500/30">
      {/* Sidebar Navigation */}
      <nav className="w-16 flex flex-col items-center py-6 border-r border-zinc-800 bg-zinc-900 z-10">
        <div className="mb-10">
          <div className="w-10 h-10 flex items-center justify-center overflow-hidden">
            <Image src="/icon.svg" alt="Project Icon" width={40} height={40} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <NavIcon icon={Shield} active={activeTab === 'auth'} onClick={() => setActiveTab('auth')} label="Auth" />
          <NavIcon icon={User} active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} label="Profile" />
          <NavIcon icon={Terminal} active={activeTab === 'commands'} onClick={() => setActiveTab('commands')} label="Commands" />
          <NavIcon icon={Zap} active={activeTab === 'features'} onClick={() => setActiveTab('features')} label="Features" />
          <NavIcon icon={Settings} active={activeTab === 'advanced'} onClick={() => setActiveTab('advanced')} label="Advanced" />
        </div>

        <div className="mt-auto flex flex-col gap-6 pb-6 items-center w-full">
          <div className="flex flex-col gap-4">
            <NavIcon 
              icon={MessageSquare} 
              active={false} 
              onClick={() => applyTemplate('chatbot')} 
              label="Chatbot Template" 
            />
            <NavIcon 
              icon={Files} 
              active={false} 
              onClick={() => applyTemplate('files')} 
              label="File Mgmnt Template" 
            />
          </div>
          
          <div className="w-full h-px bg-zinc-800" />
          
          <button 
            onClick={() => setConfig({...config, connectionType: config.connectionType === 'polling' ? 'webhook' : 'polling'})}
            className="flex flex-col items-center gap-1 group"
          >
            <div className={`text-[8px] font-bold uppercase tracking-widest transition-colors ${config.connectionType === 'polling' ? 'text-indigo-400' : 'text-zinc-500'}`}>
              {config.connectionType}
            </div>
            <div className="w-8 h-4 bg-zinc-800 rounded-full relative border border-zinc-700">
              <div className={`absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white transition-all ${config.connectionType === 'webhook' ? 'left-4.5' : 'left-0.5'}`} />
            </div>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Configuration Panel */}
        <div className="w-80 border-r border-zinc-800 bg-zinc-900 flex flex-col">
          <div className="p-6 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Github className="w-5 h-5 text-zinc-400" />
              <h1 className="text-xl font-bold tracking-tight">RemoteAdmin.py</h1>
            </div>
            <a 
              href="https://github.com/sudo-self/bot_blueprints" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block text-[10px] text-zinc-500 mt-1 uppercase tracking-widest font-semibold hover:text-indigo-400 transition-colors"
            >
              bot_blueprints
            </a>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.15 }}
              >
                {renderPanelContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Workspace */}
        <div className="flex-1 bg-zinc-950 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="h-16 border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-md flex items-center justify-between px-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                {config.botPicUrl ? (
                  <img src={config.botPicUrl} alt="Bot" referrerPolicy="no-referrer" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <Image src="/icon.svg" alt="Bot" width={40} height={40} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                )}
              </div>
              <div>
                <h2 className="text-base font-bold text-white leading-tight">{config.botName}</h2>
                <p className="text-xs text-zinc-500 font-mono">{config.botUsername}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg text-xs font-medium transition-all border border-zinc-700">
                <RefreshCw className="w-3 h-3" /> Reset Blueprint
              </button>
              <button 
                onClick={handleExport}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-xs font-medium transition-all shadow-lg shadow-indigo-500/20"
              >
                <Download className="w-3 h-3" /> Download Bot
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex p-8 gap-8 overflow-hidden">
            {/* Simulator */}
            <div className="flex-1 flex flex-col border border-zinc-800 rounded-2xl bg-zinc-900/50 overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-zinc-800 bg-zinc-900/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-zinc-500 tracking-widest">{config.botUsername}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] text-zinc-400">admin</span>
                  </div>
                </div>
                <button 
                  onClick={() => setChat([{ type: 'bot', text: config.welcomeMsg }])}
                  className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-zinc-300 transition-all"
                  title="Reset Chat"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                {chat.map((msg, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    key={i} 
                    className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
                      msg.type === 'user' 
                        ? 'bg-indigo-600 text-white self-end rounded-tr-none' 
                        : 'bg-zinc-800 text-zinc-200 self-start rounded-tl-none border border-zinc-700'
                    }`}
                  >
                    {typeof msg.text === 'string' ? (
                      msg.text.split('\n').map((line, j) => (
                        <div key={j}>{line}</div>
                      ))
                    ) : (
                      msg.text
                    )}
                  </motion.div>
                ))}
                {isTyping && (
                  <div className="bg-zinc-800 text-zinc-200 self-start rounded-2xl rounded-tl-none border border-zinc-700 p-3 flex gap-1">
                    <div className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce" />
                    <div className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce delay-75" />
                    <div className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce delay-150" />
                  </div>
                )}
              </div>
              <div className="p-4 bg-zinc-900/80 border-t border-zinc-800">
                <div className="relative flex items-center">
                  <input 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-4 pr-12 text-sm focus:border-indigo-500 outline-none transition-all placeholder:text-zinc-700" 
                    placeholder="Send a command..." 
                  />
                  <button onClick={handleSend} className="absolute right-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-all">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Code Preview */}
            <div className="flex-1 flex flex-col border border-zinc-800 rounded-2xl bg-zinc-900/50 overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-zinc-800 bg-zinc-900/80 flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">RemoteAdmin.py</span>
                <div className="flex items-center gap-2">
                  <FileCode className="w-3 h-3 text-zinc-500" />
                  <span className="text-[10px] text-zinc-400">Python 3.10+</span>
                </div>
              </div>
              <div className="flex-1 overflow-auto bg-zinc-950 p-6 selection:bg-indigo-500/40">
                {generateBotCode()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NavIcon({ icon: Icon, active, onClick, label }: { icon: any, active: boolean, onClick: () => void, label: string }) {
  return (
    <button 
      onClick={onClick} 
      className={`group relative p-3 rounded-xl transition-all duration-300 ${
        active 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
          : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="absolute left-full ml-4 px-2 py-1 bg-zinc-800 text-zinc-200 text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 border border-zinc-700 uppercase tracking-widest">
        {label}
      </span>
    </button>
  );
}

function FeatureToggle({ label, desc, active, onToggle }: { label: string, desc: string, active: boolean, onToggle: () => void }) {
  return (
    <button 
      onClick={onToggle}
      className={`w-full p-4 rounded-xl border transition-all flex items-center justify-between text-left ${
        active 
          ? 'bg-indigo-600/10 border-indigo-500/50' 
          : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
      }`}
    >
      <div>
        <div className={`text-xs font-bold uppercase tracking-wider ${active ? 'text-indigo-400' : 'text-zinc-400'}`}>{label}</div>
        <div className="text-[10px] text-zinc-500 mt-0.5">{desc}</div>
      </div>
      <div className={`w-10 h-5 rounded-full relative transition-all ${active ? 'bg-indigo-600' : 'bg-zinc-800'}`}>
        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${active ? 'left-6' : 'left-1'}`} />
      </div>
    </button>
  );
}
