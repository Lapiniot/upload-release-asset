# Upload Release Asset GitHub Action

This action uploads a release asset(s) to a specified GitHub release. It is useful for attaching build artifacts (such as binaries, archives, or other files) to your project's releases.

## Usage

Below is an example workflow using the **upload-release-asset** action:

```yaml
name: Build and Publish

on:
    push:
        tags:
            - 'v*.*.*'

jobs:
    build:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v4

            # ... your build steps here ...

            - name: Upload Release Asset
                uses: Lapiniot/upload-release-asset@master
                with:
                    release_id: ${{ github.event.release.id }}
                    path: ./path/to/your-artifact.zip
                    name: your-artifact.zip
                    content_type: application/zip
                env:
                    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
## Inputs
- `release_id` (required): The unique identifier of the release
- `path` (required): File path or wild-card pattern to describe assets for upload
- `name` (optional): The name of the asset (optional, applies only to single asset file, otherwise original file names will be used)
- `content_type` (required): Media type of the asset file(s)
- `label` (optional): Label for the asset(s)
- `include-hidden-files` (optional): Whether to include hidden files

## Outputs
- `browser_download_url`: Browser download url, if the only asset file was specified for upload
- `browser_download_urls`: Browser download url list (new-line delimited), if multiple assets have been uploaded

## Environment Variables

- `GITHUB_TOKEN`: Required for authentication.

## License

MIT