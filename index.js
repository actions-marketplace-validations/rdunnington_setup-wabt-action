const path = require("path");

const core = require("@actions/core");
const exec = require("@actions/exec");
const github = require("@actions/github");
const toolCache = require("@actions/tool-cache");

function findArchive({version, nodePlatform}) {
    const wabtPlatform = nodePlatformToWabtPlatform(version, nodePlatform);
    const directoryName = `wabt-${version}`;

    return [directoryName, `https://github.com/WebAssembly/wabt/releases/download/${version}/${directoryName}-${wabtPlatform}.tar.gz`]
}

function nodePlatformToWabtPlatform(version, nodePlatform) {
    switch (nodePlatform) {
        case "darwin":
            versionPartsStr = version.split('.');
            versionParts = versionPartsStr.map(function(item) {return Number(item);})
            has12Extension = (versionParts.length === 3) && (versionParts[2] >= 30);
            core.info(`versionPartsStr: ${versionPartsStr}`);
            core.info(`versionParts: ${versionParts}`);
            core.info(`versionParts.length: ${versionParts.length}`);
            core.info(`versionParts[2]: ${versionParts[2]}`);
            core.info(`has12Extension: ${has12Extension}`);
            return has12Extension ? "macos-12" : "macos";
        case "linux":
            return "ubuntu";
        case "win32":
            return "windows";
        default:
            throw new Error("unrecognised platform: " + nodePlatform);
    }
}

async function install() {
    try {
        const version = core.getInput("wabt-version");
        const nodePlatform = process.platform;
        const [archiveDirectory, archiveUrl] = findArchive({version, nodePlatform});
        core.info(`Download from ${archiveUrl}`);
        const archivePath = await toolCache.downloadTool(archiveUrl);
        const tempDir = await toolCache.extractTar(archivePath, undefined, "xz");
        const toolPath = await toolCache.cacheDir(path.join(tempDir, archiveDirectory), "wabt", version);
        core.addPath(path.join(toolPath, "bin"));
    } catch (error) {
        core.setFailed(error.message);
    }
}

install();

