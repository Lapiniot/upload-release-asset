import { getInput, setFailed, setOutput } from "@actions/core";
import { context, getOctokit } from "@actions/github";
import fs from "node:fs/promises";

async function run() {
    try {
        const token = process.env.GITHUB_TOKEN!;
        const client = getOctokit(token);

        const { repo: { owner, repo } } = context;

        const releaseId = parseInt(getInput("release_id", { required: true }));
        const name = getInput("name", { required: true });
        const path = getInput("path", { required: true });
        const contentType = getInput("content_type", { required: true });
        const label = getInput("label");

        const contentLength = (await fs.stat(path)).size;
        const data = await fs.readFile(path);

        const response = await client.rest.repos.uploadReleaseAsset({
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

        const { data: { browser_download_url: downloadUrl } } = response;
        setOutput("browser_download_url", downloadUrl);
    } catch (error) {
        setFailed((error as Error).message);
    }
}

run();