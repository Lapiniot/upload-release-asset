import { getBooleanInput, getInput, info, setFailed, setOutput } from "@actions/core";
import { context, getOctokit } from "@actions/github";
import * as glob from "@actions/glob";
import { Octokit } from "@octokit/core";
import { Api } from "@octokit/plugin-rest-endpoint-methods";
import * as fs from "node:fs/promises";
import * as path from "node:path";

async function run() {
    try {
        const token = process.env.GITHUB_TOKEN!;
        const client = getOctokit(token);
        const { repo: { owner, repo } } = context;

        const name = getInput("name");
        const pathPatterns = getInput("path", { required: true });
        const label = getInput("label");
        const releaseId = parseInt(getInput("release-id", { required: true }));
        const contentType = getInput("content-type", { required: true });
        const includeHiddenFiles = getBooleanInput("include-hidden-files");

        const matches = await findMatchingCandidates(pathPatterns, includeHiddenFiles);

        switch (matches.length) {
            case 0:
                throw `No files were found for: '${pathPatterns}'. No release assets will be uploaded. `;

            case 1:
                const filePath = matches[0];
                info(`Uploading asset file: ${filePath}`);
                const response = await uploadFileAsset(client, filePath, owner, repo, releaseId,
                    name ?? path.basename(name), label, contentType);
                const { data: { browser_download_url: downloadUrl } } = response;
                info(`Asset download url: ${downloadUrl}`);
                setOutput("browser-download-url", downloadUrl);
                break;

            default:
                const urls = [];
                for (const filePath of matches) {
                    info(`Uploading asset file: ${filePath}`);
                    const response = await uploadFileAsset(client, filePath, owner, repo, releaseId,
                        path.basename(filePath), label, contentType);
                    const { data: { browser_download_url: downloadUrl } } = response;
                    info(`Asset download url: ${downloadUrl}`);
                    urls.push(downloadUrl);
                }

                setOutput("browser-download-urls", urls.join("\n"));
                break;
        }
    } catch (error) {
        setFailed((error as Error).message);
    }
}

run();

async function findMatchingCandidates(patterns: string, includeHiddenFiles: boolean) {

    const globber = await glob.create(patterns, {
        followSymbolicLinks: true,
        implicitDescendants: true,
        omitBrokenSymbolicLinks: true,
        excludeHiddenFiles: !includeHiddenFiles
    });
    return await globber.glob();
}

async function uploadFileAsset(client: Octokit & Api, path: string, owner: string, repo: string,
    releaseId: number, name: string, label: string | undefined, contentType: string) {
    const contentLength = (await fs.stat(path)).size;
    const data = await fs.readFile(path);
    return await client.rest.repos.uploadReleaseAsset({
        owner, repo,
        release_id: releaseId, name, label,
        data: data as unknown as string,
        mediaType: { format: "raw" },
        headers: {
            "accept": "application/vnd.github+json",
            "content-type": contentType,
            "content-length": contentLength
        }
    });
}