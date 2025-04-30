# Minecraft Discord Bot

Minecraft Discord Bot is a project that allows you to manage your Minecraft server hosted on AWS directly from Discord.
It provides a set of commands to control your server, check its status, and potentially interact with players.

> **Note:** This project is designed specifically for Minecraft servers hosted on AWS EC2 instances and controlled via SSH and/or AWS API calls.

## Features

* **Start Server:** Start your EC2 instance hosting the Minecraft server.
* **Stop Server:** Stop your EC2 instance (useful for saving costs).
* **Check Status:** Check if the Minecraft server EC2 instance is running or stopped; and if running, the list of players online.
* **Whitelist Users:** Optionally restrict bot commands to a specific set of Discord users. This avoid unwanted usage of the bot by other users.
* **Players analytics:** Get player stats (playtime, ...), leaderboard, and other information.

# Self Hosting

You can host the Discord bot on an AWS EC2 instance. A small instance like `t2.micro` or `t4g.micro` is generally sufficient for running the bot itself.

## Prerequisites

* An AWS Account.
* An EC2 instance already set up and configured to run your Minecraft server (PaperMC recommended, with Java installed, running in `screen` or `tmux`).
* An EC2 instance to host this Discord bot (e.g., `t2.micro`).
* A Discord Bot application created via the Discord Developer Portal.
* Node.js and Git installed on the bot's EC2 instance

## Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/BenoitPrmt/minecraft-discord-bot.git
    ```
    ```bash
    cd `minecraft-discord-bot`
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Configure the bot:** Create and fill in the configuration file (`.env` and `src/config.ts`). See the Configuration section below.
4.  **Install PM2 globally:**
    ```bash
    npm install -g pm2
    ```
    * PM2 is a process manager for Node.js applications. It helps keep your bot running in the background and can restart it if it crashes.
5.  **Build the bot**
    ```bash
    npm run build
    ```
    * This compiles the TypeScript code into JavaScript.
6.  **Run the bot:**
    ```bash
    pm2 start dist/index.js --name bot-discord
    pm2 save
    pm2 startup
    ```

## Configuration

### AWS

> **Note:** This section assumes you have an AWS account and are familiar with EC2 instances. If not, please refer to the [AWS documentation](https://docs.aws.amazon.com/) for more information.

1.  **IAM (Identity and Access Management):**
    * **Create an IAM User or Role:** It's recommended to create an IAM Role and attach it to the EC2 instance running the Discord bot. This avoids storing long-term credentials. If using an IAM User, create one specifically for the bot.
    * **Permissions:** Grant the necessary permissions to the IAM user/role to manage the *Minecraft server's EC2 instance*. A minimal policy would look like this (replace `YOUR_REGION`, `YOUR_ACCOUNT_ID`, and `YOUR_MINECRAFT_INSTANCE_ID`):
        ```json
        {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Action": [
                        "ec2:StartInstances",
                        "ec2:StopInstances"
                    ],
                    "Resource": "arn:aws:ec2:YOUR_REGION:YOUR_ACCOUNT_ID:instance/YOUR_MINECRAFT_INSTANCE_ID"
                },
                {
                    "Effect": "Allow",
                    "Action": "ec2:DescribeInstances",
                    "Resource": "*"
                }
            ]
        }
        ```
    * **Credentials:** If using an IAM Role attached to the bot's EC2 instance, the AWS SDK should pick up credentials automatically. If using an IAM User, configure credentials securely (e.g., via environment variables `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION` or using the AWS credentials file). **Do not hardcode credentials in your code.**

2.  **EC2 Instance (Minecraft Server):**
    * Ensure your Minecraft server instance is set up correctly (Java, PaperMC, etc.).
    * **Auto-Shutdown:** No need to install server stopper plugin (like [EmptyServerStopper](https://www.spigotmc.org/resources/emptyserverstopper.19409/) or [ServerSleepingPill](https://www.spigotmc.org/resources/%E2%9A%A1%EF%B8%8Fserversleepingpill%E2%9A%A1%EF%B8%8F-stop-server-when-server-is-empty-1-8-1-21.118917/)), because the bot automatically stop the serveur (Minecraft Process AND EC2 Instance, to save costs) when he is empty for a configured time (e.g., 10 minutes).

3.  **EC2 Instance (Bot Server):**
    * Ensure it has network access (outbound) to AWS services and Discord APIs.
    * Ensure it can connect via SSH to the Minecraft server instance.

4.  **Security Groups:**
    * **Minecraft Server SG:**
        * Allow TCP port `25565` from `Anywhere` (or specific IPs) for Minecraft players.
    * **Bot Server SG:**
        * Allow outbound connections (usually allowed by default).
        * No inbound ports need to be open typically, unless you need SSH access for maintenance.

### Discord Bot

1.  **Create Bot Application:** Go to the [Discord Developer Portal](https://discord.com/developers/applications).
    * Create a new application.
    * Go to the "Bot" tab and click "Add Bot".
    * **Copy the Bot Token:** Keep this secure! This is needed in your bot's configuration.
2.  **Invite Bot:** Go to the "OAuth2" → "URL Generator" tab.
    * Select the `bot` and `application.commands` scopes.
    * Select necessary Bot Permissions (e.g., `Send Messages`, `Read Message History`, `Use Slash Commands`), or `Administrator`.
    * Copy the generated URL and paste it into your browser to invite the bot to your Discord server (guild).
3.  **Configuration File / Environment Variables:**
  * Create a file named `.env` in the root directory of your bot project.
    * Copy the contents of `.env.example` (shown below) into your new `.env` file and fill in your actual values.
```dotenv
# Your Discord bot token (from Discord Developer Portal -> Bot -> Token)
DISCORD_TOKEN=
# Your Discord bot client ID (from Discord Developer Portal -> General Information -> Application ID)
DISCORD_BOT_ID=

# Your AWS region where the EC2 instance is located (e.g., eu-west-3, us-east-1)
AWS_REGION=
# Your Minecraft EC2 instance ID (Looks like i-xxxxxxxxxxxxxxxxx)
AWS_INSTANCE_ID=
# Your AWS access key ID
AWS_ACCESS_KEY_ID=
# Your AWS secret access key 
AWS_SECRET_ACCESS_KEY=
# Your AWS EC2 instance's public IPv4 address 
AWS_IP_ADDRESS=

# Set to true to enable debug logging or specific debug behavior
DEBUG=true
# If debug is enabled, specify the Discord Server ID for testing commands instantly
DEV_GUILD_ID=

# If whitelist is enabled in your bot's code, provide comma-separated Discord User IDs
# Only these users will be allowed to use the bot commands. Leave empty to disable.
WHITELIST=
```

## Usage

Describe the commands your bot provides. Examples:

* `/start`: Starts the EC2 instance for the Minecraft server. (Might also need to SSH in and start the server process if it doesn't start automatically).
* `/stop`: Stops the EC2 instance for the Minecraft server. Ensures the server is saved and shut down gracefully first (ideally the auto-shutdown plugin handles the Minecraft process stop).
* `/status`: Checks the status of the EC2 instance (running/stopped) and potentially the Minecraft server process (online/offline, player count).
* `/leaderboard`: Leaderboard command to show the top players on the server
* `/player <player_name>`: Command to show player stats or information

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any changes or improvements.

## License

This project is licensed under the GNU General Public License v3.0. See the [LICENSE](LICENSE) file for details.

---

**Minecraft Discord Bot** made with ❤️ by [BenoitPrmt](https://benoit.fun).
